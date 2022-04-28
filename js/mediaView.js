import Adapt from 'core/js/adapt';
import offlineStorage from 'core/js/offlineStorage';
import a11y from 'core/js/a11y';
import logging from 'core/js/logging';
import ComponentView from 'core/js/views/componentView';
import 'libraries/mediaelement-and-player';
import 'libraries/mediaelement-fullscreen-hook';

/*
  * Default shortcut keys trap a screen reader user inside the player once in focus. These keys are unnecessary
  * as one may traverse the player in a linear fashion without needing to know or use shortcut keys. Below is
  * the removal of the default shortcut keys.
  *
  * The default seek interval functions are passed two different data types from mejs which they handle incorrectly. One
  * is a duration integer the other is the player object. The default functions error on slider key press and so break
  * accessibility. Below is a correction.
  */

Object.assign(window.mejs.MepDefaults, {
  keyActions: [],
  defaultSeekForwardInterval: duration => {
    if (typeof duration === 'object') return duration.duration * 0.05;
    return duration * 0.05;
  },
  defaultSeekBackwardInterval: duration => {
    if (typeof duration === 'object') return duration.duration * 0.05;
    return duration * 0.05;
  }
});

// The following function is used to to prevent a memory leak in Internet Explorer
// See: http://javascript.crockford.com/memory/leak.html
const purge = function(d) {
  let a = d.attributes;
  if (a) {
    for (let i = a.length - 1; i >= 0; i -= 1) {
      const n = a[i].name;
      if (typeof d[n] === 'function') {
        d[n] = null;
      }
    }
  }
  a = d.childNodes;
  if (a) {
    for (let i = 0, count = a.length; i < count; i += 1) {
      purge(d.childNodes[i]);
    }
  }
};

/**
 * Force the default language so that the aria-label can be localised from Adapt
 * Note: Do not change these, their names and values are required for mapping in mejs
 */
window.mejs.i18n.locale.language = 'en-US';
window.mejs.i18n.locale.strings['en-US'] = {};
const ariaLabelMappings = {
  playText: 'Play',
  pauseText: 'Pause',
  stopText: 'Stop',
  audioPlayerText: 'Audio Player',
  videoPlayerText: 'Video Player',
  tracksText: 'Captions/Subtitles',
  timeSliderText: 'Time Slider',
  muteText: 'Mute Toggle',
  unmuteStatusText: 'Unmute',
  muteStatusText: 'Mute',
  volumeSliderText: 'Volume Slider',
  fullscreenText: 'Fullscreen',
  goFullscreenText: 'Go Fullscreen',
  turnOffFullscreenText: 'Turn off Fullscreen',
  noneText: 'None',
  skipBackText: 'Skip back %1 seconds',
  allyVolumeControlText: 'Use Up/Down Arrow keys to increase or decrease volume.',
  progessHelpText: 'Use Left/Right Arrow keys to advance one second, Up/Down arrows to advance ten seconds.'
};

Adapt.on('app:dataReady', () => {
  // Populate the aria labels from the _global._components._media
  const dynamicLabels = window.mejs.i18n.locale.strings['en-US'];
  const fixedDefaults = window.mejs.MepDefaults;
  const globals = Adapt.course.get('_globals')?._components?._media;
  for (const k in ariaLabelMappings) {
    dynamicLabels[ariaLabelMappings[k]] = globals[k] ?? ariaLabelMappings[k];
    fixedDefaults[k] = dynamicLabels[ariaLabelMappings[k]];
  }
});

class MediaView extends ComponentView {

  events() {
    return {
      'click .js-media-inline-transcript-toggle': 'onToggleInlineTranscript',
      'click .js-media-external-transcript-click': 'onExternalTranscriptClicked',
      'click .js-skip-to-transcript': 'onSkipToTranscript'
    };
  }

  className() {
    let classes = super.className();
    const playerOptions = this.model.get('_playerOptions');
    if (playerOptions?.toggleCaptionsButtonWhenOnlyOne) {
      classes += ' toggle-captions';
    }
    return classes;
  }

  preRender() {
    this.listenTo(Adapt, {
      'device:resize': this.onScreenSizeChanged,
      'device:changed': this.onDeviceChanged,
      'media:stop': this.onMediaStop
    });

    _.bindAll(this, 'onMediaElementPlay', 'onMediaElementPause', 'onMediaElementEnded', 'onMediaElementTimeUpdate', 'onMediaElementSeeking', 'onOverlayClick', 'onMediaElementClick', 'onWidgetInview');

    // set initial player state attributes
    this.model.set({
      _isMediaEnded: false,
      _isMediaPlaying: false
    });

    if (!this.model.get('_media').source) return;
    const media = this.model.get('_media');

    // Avoid loading of Mixed Content (insecure content on a secure page)
    if (window.location.protocol === 'https:' && media.source.indexOf('http:') === 0) {
      media.source = media.source.replace(/^http:/, 'https:');
    }

    this.model.set('_media', media);
  }

  postRender() {
    this.setupPlayer();
    this.addMejsButtonClass();
  }

  addMejsButtonClass() {
    this.$('.mejs-overlay-button').addClass('icon');
  }

  setupPlayer() {
    if (!this.model.get('_playerOptions')) this.model.set('_playerOptions', {});

    const modelOptions = this.model.get('_playerOptions');

    if (modelOptions.pluginPath === undefined) {
      // on the off-chance anyone still needs to use the Flash-based player...
      _.extend(modelOptions, {
        pluginPath: 'https://cdnjs.cloudflare.com/ajax/libs/mediaelement/2.21.2/',
        flashName: 'flashmediaelement-cdn.swf',
        flashScriptAccess: 'always'
      });
    }

    if (modelOptions.features === undefined) {
      modelOptions.features = ['playpause', 'progress', 'current', 'duration'];
      if (this.model.get('_useClosedCaptions')) {
        modelOptions.features.unshift('tracks');
      }
      if (this.model.get('_allowFullScreen')) {
        modelOptions.features.push('fullscreen');
      }
      if (this.model.get('_showVolumeControl')) {
        modelOptions.features.push('volume');
      }
    }

    /*
    Unless we are on Android/iOS and using native controls, when MediaElementJS initializes the player
    it will invoke the success callback prior to performing one last call to setPlayerSize.
    This call to setPlayerSize is deferred by 50ms so we add a delay of 100ms here to ensure that
    we don't invoke setReadyStatus until the player is definitely finished rendering.
    */
    modelOptions.success = _.debounce(this.onPlayerReady.bind(this), 100);

    if (this.model.get('_useClosedCaptions')) {
      const startLanguage = this.model.get('_startLanguage') || 'en';
      if (!offlineStorage.get('captions')) {
        offlineStorage.set('captions', startLanguage);
      }
      modelOptions.startLanguage = this.checkForSupportedCCLanguage(offlineStorage.get('captions'));
    }

    if (modelOptions.alwaysShowControls === undefined) {
      modelOptions.alwaysShowControls = false;
    }
    if (modelOptions.hideVideoControlsOnLoad === undefined) {
      modelOptions.hideVideoControlsOnLoad = true;
    }

    this.addMediaTypeClass();

    this.addThirdPartyFixes(modelOptions, () => {
      // create the player
      this.$('audio, video').mediaelementplayer(modelOptions);
      this.cleanUpPlayer();

      const _media = this.model.get('_media');
      // if no media is selected - set ready now, as success won't be called
      if (!_media.mp3 && !_media.mp4 && !_media.ogv && !_media.webm && !_media.source) {
        logging.warn('ERROR! No media is selected in components.json for component ' + this.model.get('_id'));
        this.setReadyStatus();
        return;
      }
      // Check if we're streaming
      if (!_media.source) return;
      this.$('.media__widget').addClass('external-source');
    });
  }

  addMediaTypeClass() {
    const media = this.model.get('_media');
    if (!media?.type) return;
    const typeClass = media.type.replace(/\//, '-');
    this.$('.media__widget').addClass(typeClass);
  }

  addThirdPartyFixes(modelOptions, callback) {
    const media = this.model.get('_media');
    if (!media) return callback();

    if (media.mp3 || media.ogg) {
      // https://github.com/adaptlearning/adapt_framework/issues/3055
      modelOptions.alwaysShowControls = true;
    }

    switch (media.type) {
      case 'video/vimeo':
        modelOptions.alwaysShowControls = false;
        modelOptions.hideVideoControlsOnLoad = true;
        modelOptions.features = [];
        if (MediaView.froogaloopAdded) return callback();
        $.getScript('assets/froogaloop.js')
          .done(() => {
            MediaView.froogaloopAdded = true;
            callback();
          })
          .fail(() => {
            MediaView.froogaloopAdded = false;
            logging.error('Could not load froogaloop.js');
          });
        break;
      default:
        callback();
    }
  }

  cleanUpPlayer() {
    this.$('.media__widget').children('.mejs-offscreen').remove();
    this.$('[role=application]').removeAttr('role tabindex');
    this.$('[aria-controls]').removeAttr('aria-controls');
    this.$('.mejs-overlay-play').attr('aria-hidden', 'true');
  }

  setupEventListeners() {
    this.completionEvent = (this.model.get('_setCompletionOn') || 'play');

    if (this.completionEvent === 'inview') {
      this.setupInviewCompletion('.component__widget');
    }

    // wrapper to check if preventForwardScrubbing is turned on.
    if ((this.model.get('_preventForwardScrubbing')) && (!this.model.get('_isComplete'))) {
      $(this.mediaElement).on({
        seeking: this.onMediaElementSeeking,
        timeupdate: this.onMediaElementTimeUpdate
      });
    }

    // handle other completion events in the event Listeners
    $(this.mediaElement).on({
      play: this.onMediaElementPlay,
      pause: this.onMediaElementPause,
      ended: this.onMediaElementEnded
    });

    // occasionally the mejs code triggers a click of the captions language
    // selector during setup, this slight delay ensures we skip that
    _.delay(this.listenForCaptionsChange.bind(this), 250);
  }

  /**
   * Sets up the component to detect when the user has changed the captions so that it can store the user's
   * choice in offlineStorage and notify other media components on the same page of the change
   * Also sets the component up to listen for this event from other media components on the same page
   */
  listenForCaptionsChange() {
    if (!this.model.get('_useClosedCaptions')) return;

    const selector = this.model.get('_playerOptions').toggleCaptionsButtonWhenOnlyOne ?
      '.mejs-captions-button button' :
      '.mejs-captions-selector';

    this.$(selector).on('click.mediaCaptionsChange', _.debounce(() => {
      const srclang = this.mediaElement.player.selectedTrack ? this.mediaElement.player.selectedTrack.srclang : 'none';
      offlineStorage.set('captions', srclang);
      Adapt.trigger('media:captionsChange', this, srclang);
    }, 250)); // needs debouncing because the click event fires twice

    this.listenTo(Adapt, 'media:captionsChange', this.onCaptionsChanged);
  }

  /**
   * Handles updating the captions in this instance when learner changes captions in another
   * media component on the same page
   * @param {Backbone.View} view The view instance that triggered the event
   * @param {string} lang The captions language the learner chose in the other media component
   */
  onCaptionsChanged(view, lang) {
    if (view?.cid === this.cid) return; // ignore the event if we triggered it

    lang = this.checkForSupportedCCLanguage(lang);

    this.mediaElement.player.setTrack(lang);

    // because calling player.setTrack doesn't update the cc button's languages popup...
    const $inputs = this.$('.mejs-captions-selector input');
    $inputs.filter(':checked').prop('checked', false);
    $inputs.filter(`[value="${lang}"]`).prop('checked', true);
  }

  /**
   * When the learner selects a captions language in another media component, that language may not be available
   * in this instance, in which case default to the `_startLanguage` if that's set - or "none" if it's not
   * @param {string} lang The language we're being asked to switch to e.g. "de"
   * @return {string} The language we're actually going to switch to - or "none" if there's no good match
   */
  checkForSupportedCCLanguage(lang) {
    if (!lang || lang === 'none') return 'none';

    if (_.findWhere(this.model.get('_media').cc, { srclang: lang })) return lang;

    return this.model.get('_startLanguage') || 'none';
  }

  onMediaElementPlay(event) {
    this.queueGlobalEvent('play');

    Adapt.trigger('media:stop', this);

    if (this.model.get('_pauseWhenOffScreen')) {
      this.$('.mejs-container').on('inview', this.onWidgetInview);
    }

    this.model.set({
      _isMediaPlaying: true,
      _isMediaEnded: false
    });

    if (this.completionEvent !== 'play') return;
    this.setCompletionStatus();
  }

  onMediaElementPause(event) {
    this.queueGlobalEvent('pause');

    this.$('.mejs-container').off('inview', this.onWidgetInview);

    this.model.set('_isMediaPlaying', false);
  }

  onMediaElementEnded(event) {
    this.queueGlobalEvent('ended');

    this.model.set('_isMediaEnded', true);

    if (this.completionEvent === 'ended') {
      this.setCompletionStatus();
    }
  }

  onWidgetInview(event, isInView) {
    if (!isInView && !this.mediaElement.paused) this.mediaElement.player.pause();
  }

  onMediaElementSeeking(event) {
    let maxViewed = this.model.get('_maxViewed');
    if (!maxViewed) {
      maxViewed = 0;
    }
    if (event.target.currentTime <= maxViewed) return;
    event.target.currentTime = maxViewed;
  }

  onMediaElementTimeUpdate(event) {
    let maxViewed = this.model.get('_maxViewed');
    if (!maxViewed) {
      maxViewed = 0;
    }
    if (event.target.currentTime <= maxViewed) return;
    this.model.set('_maxViewed', event.target.currentTime);
  }

  // Overrides the default play/pause functionality to stop accidental playing on touch devices
  setupPlayPauseToggle() {
    // bit sneaky, but we don't have a this.mediaElement.player ref on iOS devices
    const player = this.mediaElement.player;

    if (!player) {
      logging.warn('MediaView.setupPlayPauseToggle: OOPS! there is no player reference.');
      return;
    }

    // stop the player dealing with this, we'll do it ourselves
    player.options.clickToPlayPause = false;

    // play on 'big button' click
    this.$('.mejs-overlay-button').on('click', this.onOverlayClick);

    // pause on player click
    this.$('.mejs-mediaelement').on('click', this.onMediaElementClick);
  }

  onMediaStop(view) {

    // Make sure this view isn't triggering media:stop
    if (view?.cid === this.cid) return;

    if (!this.mediaElement || !this.mediaElement.player) return;

    this.mediaElement.player.pause();

  }

  onOverlayClick() {
    const player = this.mediaElement.player;
    if (!player) return;

    player.play();
  }

  onMediaElementClick(event) {
    const player = this.mediaElement.player;
    if (!player) return;

    const isPaused = player.media.paused;
    if (!isPaused) player.pause();
  }

  remove() {
    this.$('.mejs-overlay-button').off('click', this.onOverlayClick);
    this.$('.mejs-mediaelement').off('click', this.onMediaElementClick);
    this.$('.mejs-container').off('inview', this.onWidgetInview);

    if (this.model.get('_useClosedCaptions')) {
      const selector = this.model.get('_playerOptions').toggleCaptionsButtonWhenOnlyOne ?
        '.mejs-captions-button button' :
        '.mejs-captions-selector';
      this.$(selector).off('click.mediaCaptionsChange');
    }

    const modelOptions = this.model.get('_playerOptions');
    delete modelOptions.success;

    const media = this.model.get('_media');
    if (media) {
      switch (media.type) {
        case 'video/vimeo':
          this.$('iframe')[0].isRemoved = true;
      }
    }

    if (this.mediaElement && this.mediaElement.player) {
      const playerId = this.mediaElement.player.id;

      purge(this.$el[0]);
      this.mediaElement.player.remove();

      if (window.mejs.players[playerId]) {
        delete window.mejs.players[playerId];
      }
    }

    if (this.mediaElement) {
      $(this.mediaElement).off({
        play: this.onMediaElementPlay,
        pause: this.onMediaElementPause,
        ended: this.onMediaElementEnded,
        seeking: this.onMediaElementSeeking,
        timeupdate: this.onMediaElementTimeUpdate
      });

      this.mediaElement.src = '';
      $(this.mediaElement.pluginElement).remove();
      delete this.mediaElement;
    }

    super.remove();
  }

  onDeviceChanged() {
    if (!this.model.get('_media').source) return;
    this.$('.mejs-container').width(this.$('.component__widget').width());
  }

  onPlayerReady(mediaElement, domObject) {
    this.mediaElement = mediaElement;

    let player = this.mediaElement.player;
    if (!player) player = window.mejs.players[this.$('.mejs-container').attr('id')];

    const hasTouch = window.mejs.MediaFeatures.hasTouch;
    if (hasTouch) {
      this.setupPlayPauseToggle();
    }

    this.addThirdPartyAfterFixes();
    this.cleanUpPlayerAfter();

    if (player && this.model.has('_startVolume')) {
      // Setting the start volume only works with the Flash-based player if you do it here rather than in setupPlayer
      player.setVolume(parseInt(this.model.get('_startVolume')) / 100);
    }

    this.setReadyStatus();
    this.setupEventListeners();
  }

  addThirdPartyAfterFixes() {
    const media = this.model.get('_media');
    switch (media.type) {
      case 'video/vimeo':
        this.$('.mejs-container').attr('tabindex', 0);
    }
  }

  cleanUpPlayerAfter() {
    this.$("[aria-valuemax='NaN']").attr('aria-valuemax', 0);
  }

  onScreenSizeChanged() {
    this.$('audio, video').width(this.$('.component__widget').width());
  }

  onSkipToTranscript() {
    // need slight delay before focussing button to make it work when JAWS is running
    // see https://github.com/adaptlearning/adapt_framework/issues/2427
    _.delay(() => {
      a11y.focus(this.$('.media__transcript-btn'));
    }, 250);
  }

  onToggleInlineTranscript(event) {
    if (event) event.preventDefault();
    const $transcriptBodyContainer = this.$('.media__transcript-body-inline');
    const $button = this.$('.media__transcript-btn-inline');
    const $buttonText = this.$('.media__transcript-btn-inline .media__transcript-btn-text');

    if ($transcriptBodyContainer.hasClass('inline-transcript-open')) {
      $transcriptBodyContainer.stop(true, true).slideUp(() => {
        $(window).resize();
      }).removeClass('inline-transcript-open');
      $button.attr('aria-expanded', false);
      $buttonText.html(this.model.get('_transcript').inlineTranscriptButton);

      return;
    }

    $transcriptBodyContainer.stop(true, true).slideDown(() => {
      $(window).resize();
    }).addClass('inline-transcript-open');

    $button.attr('aria-expanded', true);
    $buttonText.html(this.model.get('_transcript').inlineTranscriptCloseButton);

    if (this.model.get('_transcript')._setCompletionOnView !== false) {
      this.setCompletionStatus();
    }
  }

  onExternalTranscriptClicked(event) {
    if (this.model.get('_transcript')._setCompletionOnView === false) return;
    this.setCompletionStatus();
  }

  /**
   * Queue firing a media event to prevent simultaneous events firing, and provide a better indication of how the
   * media  player is behaving
   * @param {string} eventType
   */
  queueGlobalEvent(eventType) {
    const time = Date.now();
    const lastEvent = this.lastEvent || { time: 0 };
    const timeSinceLastEvent = time - lastEvent.time;
    const debounceTime = 500;

    this.lastEvent = {
      time,
      type: eventType
    };

    // Clear any existing timeouts
    clearTimeout(this.eventTimeout);

    // Always trigger 'ended' events
    if (eventType === 'ended') {
      return this.triggerGlobalEvent(eventType);
    }

    // Fire the event after a delay, only if another event has not just been fired
    if (timeSinceLastEvent <= debounceTime) return;
    this.eventTimeout = setTimeout(this.triggerGlobalEvent.bind(this, eventType), debounceTime);
  }

  triggerGlobalEvent(eventType) {
    const player = this.mediaElement.player;

    const eventObj = {
      type: eventType,
      src: this.mediaElement.src,
      platform: this.mediaElement.pluginType
    };

    if (player) eventObj.isVideo = player.isVideo;

    Adapt.trigger('media', eventObj);
  }

}

MediaView.froogaloopAdded = false;

export default MediaView;
