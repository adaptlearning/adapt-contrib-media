import Adapt from 'core/js/adapt';
import wait from 'core/js/wait';
import offlineStorage from 'core/js/offlineStorage';
import a11y from 'core/js/a11y';
import logging from 'core/js/logging';
import ComponentView from 'core/js/views/componentView';
import 'libraries/mediaelement-and-player';
import './mediaLibrariesOverrides';

// instruct adapt to wait whilst loading client-side libraries
wait.for(async done => {
  // load plugins
  await import('libraries/plugins/speed');
  await import('libraries/plugins/speed-i18n');
  await import('libraries/plugins/jump-forward');
  await import('libraries/plugins/jump-forward-i18n');
  await import('libraries/plugins/skip-back');
  await import('libraries/plugins/skip-back-i18n');
  done();
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
    const captions = this.model.get('_media').cc;
    if (playerOptions?.toggleCaptionsButtonWhenOnlyOne && captions?.length === 1) {
      classes += ' toggle-captions';
    }
    const offsetMediaControls = this.model.get('_offsetMediaControls');
    if (offsetMediaControls) {
      classes += ' offset-media-controls';
    }
    return classes;
  }

  preRender() {
    this.listenTo(Adapt, {
      'device:resize': this.onScreenSizeChanged,
      'device:changed': this.onDeviceChanged,
      'media:stop': this.onMediaStop
    });

    // android, force timeupdate handler to call after seeking handler in order to prevent forward scrubbing
    this.onMediaElementTimeUpdate = _.debounce(this.onMediaElementTimeUpdate.bind(this), 0);

    _.bindAll(this, 'onMediaElementPlay', 'onMediaElementPause', 'onMediaElementEnded', 'onMediaVolumeChange', 'onMediaElementSeeking', 'onOverlayClick', 'onMediaElementClick', 'onWidgetInview');

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
  }

  setupPlayer() {
    if (!this.model.get('_playerOptions')) this.model.set('_playerOptions', {});
    const modelOptions = this.setupModelOptions();

    this.addMediaTypeClass();

    this.addThirdPartyFixes(modelOptions, () => {
      // create the player
      this.$('audio, video').mediaelementplayer(modelOptions);
      this.cleanUpPlayer();

      const _media = this.model.get('_media');
      const sources = [_media.mp3, _media.mp4, _media.ogv, _media.webm, _media.source];
      // if no media is selected - set ready now, as success won't be called
      if (sources.every((source) => !source)) {
        logging.warn('ERROR! No media is selected in components.json for component ' + this.model.get('_id'));
        this.setReadyStatus();
        return;
      }
      const isYouTube = false;
      const isVimeo = false;
      if (isYouTube) {
        logging.warn('ERROR! YouTube is no longer supported. Please use adapt-youtube for ' + this.model.get('_id'));
        this.setReadyStatus();
        return;
      }
      if (isVimeo) {
        logging.warn('ERROR! Vimeo is no longer supported. Please use adapt-vimeo for ' + this.model.get('_id'));
        this.setReadyStatus();
        return;
      }
      // Check if we're streaming
      if (!_media.source) return;
      this.$('.media__widget').addClass('external-source');
    });

    this.addMejsButtonClass();
  }

  setupModelOptions() {
    const modelOptions = this.model.get('_playerOptions');

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

    /**
     * Unless we are on Android/iOS and using native controls, when MediaElementJS initializes the player
     * it will invoke the success callback prior to performing one last call to setPlayerSize.
     * This call to setPlayerSize is deferred by 50ms so we add a delay of 100ms here to ensure that
     * we don't invoke setReadyStatus until the player is definitely finished rendering.
     */
    modelOptions.success = _.debounce(this.onPlayerReady.bind(this), 100);

    if (this.model.get('_useClosedCaptions')) {
      const autoplayCaptionLanguage = this.model.get('_startLanguage') || 'en';
      if (!offlineStorage.get('captions')) {
        offlineStorage.set('captions', autoplayCaptionLanguage);
      }
      modelOptions.autoplayCaptionLanguage = this.checkForSupportedCCLanguage(offlineStorage.get('captions'));
    }

    if (modelOptions.alwaysShowControls === undefined) {
      modelOptions.alwaysShowControls = true;
    }
    if (modelOptions.hideVideoControlsOnLoad === undefined) {
      modelOptions.hideVideoControlsOnLoad = true;
    }
    if (this.model.has('_startVolume')) {
      modelOptions.startVolume = parseInt(this.model.get('_startVolume')) / 100;
    }

    modelOptions.iconSprite = 'assets/mejs-controls.svg';

    /**
     * Default shortcut keys trap a screen reader user inside the player once in focus. These keys are unnecessary
     * as one may traverse the player in a linear fashion without needing to know or use shortcut keys. Below is
     * the removal of the default shortcut keys.
     */
    modelOptions.keyActions = [];

    /**
     * Convert string seek functions into compiled functions
     */
    if (typeof modelOptions.defaultSeekBackwardInterval === 'string') {
      // eslint-disable-next-line no-new-func
      modelOptions.defaultSeekBackwardInterval = new Function('media', `return ${modelOptions.defaultSeekBackwardInterval}`);
    }

    if (typeof modelOptions.defaultSeekForwardInterval === 'string') {
      // eslint-disable-next-line no-new-func
      modelOptions.defaultSeekForwardInterval = new Function('media', `return ${modelOptions.defaultSeekBackwardInterval}`);
    }

    return modelOptions;
  }

  addMejsButtonClass() {
    this.$('.mejs__overlay-button').addClass('icon');
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

    callback();
  }

  cleanUpPlayer() {
    const containerLabel = this.model.get('displayTitle') || this.model.get('title');
    this.$('.media__widget').children('.mejs__offscreen').remove();
    this.$('[role=application]').removeAttr('role tabindex');
    this.$('.mejs__container').attr({
      role: 'region',
      'aria-label': containerLabel
    });
    this.$('[aria-controls]').removeAttr('aria-controls');
    this.$('.mejs__overlay-play').attr('aria-hidden', 'true');
  }

  setupEventListeners() {
    this.completionEvent = (this.model.get('_setCompletionOn') || 'play');

    if (this.completionEvent === 'inview') {
      this.setupInviewCompletion('.component__widget');
    }

    this.preventForwardScrubbing();

    // handle other completion events in the event Listeners
    $(this.mediaElement).on({
      play: this.onMediaElementPlay,
      pause: this.onMediaElementPause,
      ended: this.onMediaElementEnded,
      volumechange: this.onMediaVolumeChange
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
    this.setCaptionButtonState();

    this.mediaElement.addEventListener('captionschange', event => {
      const srclang = this.mediaElementInstance.selectedTrack ? this.mediaElementInstance.selectedTrack.srclang : 'none';
      offlineStorage.set('captions', srclang);
      Adapt.trigger('media:captionsChange', this, srclang);
      this.setCaptionButtonState();
    });

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
    if (this.mediaElementInstance.selectedTrack.srclang === lang) return;

    const allTracks = this.mediaElementInstance.trackFiles;
    const track = [...allTracks].filter((node) => {
      return node.srclang === lang;
    })[0];
    if (!track) return;
    this.mediaElementInstance.setTrack(track.id);

    // because calling player.setTrack doesn't update the cc button's languages popup...
    const $inputs = this.$('.mejs__captions-selector input');
    $inputs.filter(':checked').prop('checked', false);
    $inputs.filter(`[value="${lang}"]`).prop('checked', true);
  }

  setCaptionButtonState() {
    // Allow use of aria-pressed on closed captions button
    // https://github.com/adaptlearning/adapt-contrib-media/issues/250
    const srclang = this.mediaElementInstance.selectedTrack ? this.mediaElementInstance.selectedTrack.srclang : 'none';
    const $ccButton = this.$el.find('.mejs__captions-button > button');
    $ccButton.attr('aria-pressed', srclang !== 'none');
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
      this.$('.mejs__container').on('inview', this.onWidgetInview);
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

    this.$('.mejs__container').off('inview', this.onWidgetInview);

    this.model.set('_isMediaPlaying', false);
  }

  onMediaElementEnded(event) {
    this.queueGlobalEvent('ended');

    this.model.set('_isMediaEnded', true);

    if (this.completionEvent === 'ended') {
      this.setCompletionStatus();
    }
  }

  onMediaVolumeChange(event) {
    Adapt.trigger('media:volumeChange', this.model, this.mediaElement.muted, this.mediaElement.volume);
  }

  onWidgetInview(event, isInView) {
    if (!isInView && !this.mediaElement.paused) this.mediaElement.pause();
  }

  onMediaElementSeeking(event) {
    let maxViewed = this.model.get('_maxViewed');
    if (!maxViewed) {
      maxViewed = 0;
    }
    const target = event.currentTarget;
    if (target.currentTime <= maxViewed) return;
    target.currentTime = maxViewed;
  }

  onMediaElementTimeUpdate(event) {
    let maxViewed = this.model.get('_maxViewed');
    if (!maxViewed) {
      maxViewed = 0;
    }
    const target = event.currentTarget;
    if (target.currentTime <= maxViewed) return;
    this.model.set('_maxViewed', target.currentTime);
  }

  onMediaStop(view) {
    // Make sure this view isn't triggering media:stop
    if (view?.cid === this.cid) return;

    if (!this.mediaElement) return;

    this.mediaElement.pause();
  }

  onOverlayClick() {
    const player = this.mediaElement;
    if (!player) return;

    player.play();
  }

  onMediaElementClick(event) {
    const player = this.mediaElement;
    if (!player) return;

    const isPaused = player.paused;
    if (!isPaused) player.pause();
  }

  remove() {
    this.$('.mejs__overlay-button').off('click', this.onOverlayClick);
    this.$('.mejs__mediaelement').off('click', this.onMediaElementClick);
    this.$('.mejs__container').off('inview', this.onWidgetInview);

    if (this.model.get('_useClosedCaptions')) {
      const selector = this.model.get('_playerOptions').toggleCaptionsButtonWhenOnlyOne ?
        '.mejs__captions-button button' :
        '.mejs__captions-selector';
      this.$(selector).off('click.mediaCaptionsChange');
    }

    const modelOptions = this.model.get('_playerOptions');
    delete modelOptions.success;

    if (this.mediaElementInstance) {
      this.mediaElement.remove();

      const playerId = this.mediaElementInstance.id;
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
        timeupdate: this.onMediaElementTimeUpdate,
        volumechange: this.onMediaVolumeChange
      });

      this.mediaElement.src = '';
      $(this.mediaElement.pluginElement).remove();
      delete this.mediaElement;
    }

    super.remove();
  }

  onDeviceChanged() {
    if (!this.model.get('_media').source) return;
    this.$('.mejs__container').width(this.$('.component__widget').width());
  }

  /**
   * onPlayerReady
   * The success callback of MediaElementPlayer. Called as soon as the source is loaded.
   * @param {HTMLElement} media The wrapper that mimics all the native events/properties/methods for all renderers
   * @param {HTMLElement} node The HTML <video>, <audio> or <iframe> tag where the media was loaded originally. If html5 is being used, media and node are basically the same.
   * @param {Object} instance Gives access to the methods associated with the MediaElementPlayer class
   */
  onPlayerReady(media, node, instance) {
    this.mediaElement = media;
    this.mediaElementInstance = instance;
    this.cleanUpPlayerAfter();
    this.setReadyStatus();
    this.setupEventListeners();
  }

  cleanUpPlayerAfter() {
    this.$("[aria-valuemax='NaN']").attr('aria-valuemax', 0);
  }

  onScreenSizeChanged() {
    this.$('audio, video').width(this.$('.component__widget').width());
  }

  onSkipToTranscript() {
    // need slight delay before focusing button to make it work when JAWS is running
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
      this.transcriptTriggers('closed');

      return;
    }

    $transcriptBodyContainer.stop(true, true).slideDown(() => {
      $(window).resize();
    }).addClass('inline-transcript-open');

    $button.attr('aria-expanded', true);
    $buttonText.html(this.model.get('_transcript').inlineTranscriptCloseButton);
    this.transcriptTriggers('opened');
  }

  onExternalTranscriptClicked() {
    this.transcriptTriggers('external');
  }

  transcriptTriggers(state) {
    const setCompletionOnView = this.model.get('_transcript')._setCompletionOnView;
    const isComplete = this.model.get('_isComplete');
    const shouldComplete = (setCompletionOnView && !isComplete);

    if (!shouldComplete) {
      return Adapt.trigger('media:transcript', state, this);
    }
    this.setCompletionStatus();
    Adapt.trigger('media:transcript', 'complete', this);
  }

  /**
   * This function ensures that users cannot skip ahead in the media until they have watched it fully if `_preventForwardScrubbing` is enabled.
   */
  preventForwardScrubbing() {
    if (!this.model.get('_preventForwardScrubbing') || this.model.get('_isComplete')) return;
    $(this.mediaElement).on({
      seeking: this.onMediaElementSeeking,
      timeupdate: this.onMediaElementTimeUpdate
    });
    const timeSlider = this.$('.mejs__time-slider')[0];
    if (!timeSlider) return;
    timeSlider.style.pointerEvents = 'none';
    timeSlider.addEventListener('input', (e) => e.preventDefault());
    timeSlider.setAttribute('aria-disabled', 'true');
  }

  /**
   * Queue firing a media event to prevent simultaneous events firing, and provide a better indication of how the
   * media player is behaving
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
    const eventObj = {
      type: eventType,
      src: this.mediaElement.src,
      platform: this.mediaElement.rendererName
    };

    const options = this.mediaElement.options;
    if (options) eventObj.isVideo = options.isVideo;

    Adapt.trigger('media', eventObj);
  }
}

export default MediaView;
