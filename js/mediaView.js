import Adapt from 'core/js/adapt';
import wait from 'core/js/wait';
import offlineStorage from 'core/js/offlineStorage';
import a11y from 'core/js/a11y';
import logging from 'core/js/logging';
import ComponentView from 'core/js/views/componentView';
import 'libraries/mediaelement-and-player';
import './mediaLibrariesOverrides';

// Keys which move the playhead forwards in mediaelement's own slider handler.
// mediaelement handles ArrowLeft/ArrowRight/Home/End only - it has no
// PageUp/PageDown seeking - and 'Home' seeks to 0, so is always permitted.
const FORWARD_SCRUBBING_KEYS = ['ArrowRight', 'End'];
// Fraction of the duration mediaelement seeks per arrow key press, used only
// when the player's own option cannot be read.
const FALLBACK_SEEK_FRACTION = 0.05;
// Pointer events which would otherwise reach mediaelement's own drag handling.
const BLOCKED_POINTER_EVENTS = ['pointerdown', 'mousedown', 'touchstart'];
// Tolerance, in seconds, applied when comparing the playhead to the furthest
// viewed position. `timeupdate` only fires around 4 times a second, so the
// playhead can legitimately sit slightly ahead of `_maxViewed`.
const SCRUB_TOLERANCE = 0.25;
// Duration, in milliseconds, of the blocked-scrub visual flash.
const SCRUB_BLOCKED_FLASH_DURATION = 150;
// Minimum interval, in milliseconds, between blocked-scrub announcements.
const SCRUB_ANNOUNCE_THROTTLE = 1000;
// Fallback delay, in milliseconds, after which a corrective seek is assumed done.
const SUPPRESS_SEEK_TIMEOUT = 1000;

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

    _.bindAll(this,
      'onMediaElementPlay', 'onMediaElementPause', 'onMediaElementEnded', 'onMediaVolumeChange', 'onOverlayClick', 'onMediaElementClick', 'onWidgetInview',
      'onScrubTimeUpdate', 'onScrubSeeking', 'onScrubSeeked', 'onScrubKeyDown', 'onScrubEnded', 'onIsCompleteChanged', 'onBlockerPointerDown', 'updateScrubBlocker', 'onCaptionsChange',
      'onToggleInlineTranscript', 'onExternalTranscriptClicked', 'onSkipToTranscript'
    );

    const _transcript = this.model.get('_transcript');

    // set initial player state attributes
    this.model.set({
      _isMediaEnded: false,
      _isMediaPlaying: false,
      _isInlineTranscriptOpen: false,
      _shouldSetSize: this.shouldSetSize(),
      _videoDimensions: this.getVideoDimensions(),
      _hasTranscript: _transcript?._inlineTranscript || _transcript?._externalTranscript,
      transcriptRegionLabel: _transcript?.inlineTranscriptButton || _transcript?.transcriptLink,
      inlineButtonText: _transcript?.inlineTranscriptButton || _transcript?.transcriptLink
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
      // Create the player
      this.$('audio, video').mediaelementplayer(modelOptions);
      this.cleanUpPlayer();
      const _media = this.model.get('_media');
      const sources = [_media.mp3, _media.mp4, _media.ogv, _media.webm, _media.source];
      // If no media is specified, set ready now as success will not be called
      if (sources.every(source => !source)) {
        logging.warn('ERROR! No media is specified in components.json for component ' + this.model.get('_id'));
        this.setReadyStatus();
        return;
      }
      // If YouTube is specified, set ready now as success will not be called
      const youTubeRegex = /(youtube\.com|youtu\.be)/i;
      const isYouTube = sources.some(source => youTubeRegex.test(source));
      if (isYouTube) {
        logging.warn('ERROR! YouTube is no longer supported. Please use https://github.com/adaptlearning/adapt-youtube for ' + this.model.get('_id'));
        this.setReadyStatus();
        return;
      }
      // If Vimeo is specified, set ready now as success will not be called
      const vimeoRegex = /vimeo\.com/i;
      const isVimeo = sources.some(source => vimeoRegex.test(source));
      if (isVimeo) {
        logging.warn('ERROR! Vimeo is no longer supported. Please use https://github.com/adaptlearning/adapt-vimeo for ' + this.model.get('_id'));
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
      modelOptions.defaultSeekForwardInterval = new Function('media', `return ${modelOptions.defaultSeekForwardInterval}`);
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
    if (!this.mediaElement) return;

    this.setCaptionButtonState();

    this.mediaElement.addEventListener('captionschange', this.onCaptionsChange);

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

  onCaptionsChange() {
    const srclang = this.mediaElementInstance.selectedTrack
      ? this.mediaElementInstance.selectedTrack.srclang
      : 'none';
    offlineStorage.set('captions', srclang);
    Adapt.trigger('media:captionsChange', this, srclang);
    this.setCaptionButtonState();
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

    // playback has settled, so store the furthest viewed position. Set
    // silently: nothing listens for this attribute, and a change event would
    // trigger a needless JSX re-render of the component.
    if (this._maxViewed === undefined || this.model.get('_isComplete')) return;
    this.model.set('_maxViewed', this._maxViewed, { silent: true });
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

  getVideoDimensions() {
    const aspectRatio = this.model.get('_aspectRatio');
    if (aspectRatio === 'square') return { width: 640, height: 640 };
    if (aspectRatio === 'portrait') return { width: 540, height: 960 };
    return { width: 640, height: 360 };
  }

  shouldSetSize() {
    // Do not set width and height properties on the <video> element
    // if using native controls. This can break the aspect ratio.
    const features = window.mejs.Features;
    const playerOptions = this.model?.get('_playerOptions') || {};
    if (
      (playerOptions.iPhoneUseNativeControls && features.isiPhone) ||
      (playerOptions.iPadUseNativeControls && features.isiPad) ||
      (playerOptions.AndroidUseNativeControls && features.isAndroid)
    ) {
      return false;
    }
    return true;
  }

  remove() {
    // must run before the media element and its listeners are torn down below
    this.removeScrubBlocker();

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
        volumechange: this.onMediaVolumeChange
      });

      this.mediaElement.removeEventListener('captionschange', this.onCaptionsChange);

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
    const isOpen = this.model.get('_isInlineTranscriptOpen');
    const _transcript = this.model.get('_transcript');
    this.model.set({
      _isInlineTranscriptOpen: !isOpen,
      inlineButtonText: isOpen
        ? (_transcript?.inlineTranscriptButton || _transcript?.transcriptLink)
        : _transcript?.inlineTranscriptCloseButton
    });

    const $body = this.$('.media__transcript-body-inline').stop(true, true);
    if (isOpen) {
      $body.slideUp(() => Adapt.trigger('device:resize'));
    } else {
      $body.slideDown(() => Adapt.trigger('device:resize'));
    }

    this.transcriptTriggers(isOpen ? 'closed' : 'opened');
  }

  onExternalTranscriptClicked() {
    window.open(this.model.get('_transcript').transcriptLink);
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
    const isEnabled = this.model.get('_preventForwardScrubbing');
    const isComplete = this.model.get('_isComplete');
    if (!isEnabled || isComplete) return;

    const $slider = this.$('.mejs__time-slider');
    if (!$slider.length) {
      logging.warn('adapt-contrib-media: _preventForwardScrubbing requires the "progress" player feature - the setting will be ignored');
      return;
    }

    if (this.completionEvent !== 'ended') {
      logging.warn(`adapt-contrib-media: _preventForwardScrubbing expects _setCompletionOn "ended" but found "${this.completionEvent}" on ${this.model.get('_id')} - the restriction will lift as soon as the component completes`);
    }

    this._maxViewed = this.model.get('_maxViewed') ?? 0;
    this._suppressSeek = false;

    this._scrubBlocker = this.createScrubBlocker($slider[0]);

    this.setupScrubBlockerEvents();

    // the restriction must lift however the component completes - `_setCompletionOn`
    // of "play" or "inview", or the transcript's `_setCompletionOnView` - not only
    // when the media reaches its end. `listenTo` rather than `listenToOnce`:
    // a reset fires `change:_isComplete` with `false`, which would otherwise spend
    // the one-shot binding and leave the blocker stuck. Cleaned up by
    // `stopListening()` in remove().
    this.listenTo(this.model, 'change:_isComplete', this.onIsCompleteChanged);

    this.updateScrubBlocker();
  }

  /**
   * Lifts the forward-scrubbing restriction as soon as the component is marked
   * complete by any route. Ignores the `false` transition a reset produces.
   */
  onIsCompleteChanged() {
    if (!this.model.get('_isComplete')) return;
    this.stopListening(this.model, 'change:_isComplete');
    this.removeScrubBlocker();
  }

  /**
   * Creates the overlay which covers the not-yet-viewed portion of the time
   * slider, along with the live region used to announce blocked attempts.
   * @param {HTMLElement} sliderElement The mejs time slider element
   * @returns {HTMLElement} The blocker element
   */
  createScrubBlocker(sliderElement) {
    this._sliderElement = sliderElement;

    const scrubBlocker = document.createElement('span');
    scrubBlocker.className = 'mejs__time-slider-blocker';
    scrubBlocker.setAttribute('aria-hidden', 'true');
    // mediaelement binds mousedown/touchstart to the slider, and the blocker is
    // its child - stopping these on the blocker prevents them bubbling up and
    // starting a drag-seek. pointerdown alone is not enough: its compatibility
    // suppression of mousedown is inconsistent across browsers.
    BLOCKED_POINTER_EVENTS.forEach(name => scrubBlocker.addEventListener(name, this.onBlockerPointerDown));
    sliderElement.appendChild(scrubBlocker);

    // the live region must not be a descendant of the slider - `role="slider"`
    // is a leaf role, so text inside it isn't reliably announced and can be
    // folded into the slider's accessible name
    this._scrubLiveRegion = document.createElement('div');
    this._scrubLiveRegion.className = 'aria-label';
    this._scrubLiveRegion.setAttribute('aria-live', 'polite');
    this.$('.media__widget')[0]?.appendChild(this._scrubLiveRegion);

    return scrubBlocker;
  }

  setupScrubBlockerEvents() {
    this.mediaElement.addEventListener('timeupdate', this.onScrubTimeUpdate);
    this.mediaElement.addEventListener('seeking', this.onScrubSeeking);
    this.mediaElement.addEventListener('ended', this.onScrubEnded);
    // with `preload="none"` the duration is unknown at setup, so the blocker
    // would stay zero-width - and the rail unprotected - until first playback
    this.mediaElement.addEventListener('loadedmetadata', this.updateScrubBlocker);
    this.mediaElement.addEventListener('durationchange', this.updateScrubBlocker);

    // mediaelement binds its own keydown to the slider during setup and seeks
    // from a `setTimeout`, so a listener on the slider cannot pre-empt it.
    // Capturing on an ancestor runs first and lets the event be stopped before
    // it ever reaches mediaelement's handler.
    this._captureElement = this.$('.mejs__container')[0];
    this._captureElement?.addEventListener('keydown', this.onScrubKeyDown, true);
  }

  onBlockerPointerDown(event) {
    event.preventDefault();
    event.stopImmediatePropagation();
    this.onScrubBlocked();
  }

  /**
   * Tracks the furthest viewed position. `_maxViewed` is kept on the view for
   * the hot path and only written to the model when playback settles, to avoid
   * firing change events several times a second.
   */
  onScrubTimeUpdate() {
    if (this._suppressSeek) return;
    this._maxViewed = Math.max(this._maxViewed, this.mediaElement.currentTime);
    this.updateScrubBlocker();
  }

  onScrubSeeking() {
    const isSeekingAhead = this.mediaElement.currentTime > this._maxViewed + SCRUB_TOLERANCE;
    if (!isSeekingAhead) return;

    this._suppressSeek = true;
    this.mediaElement.addEventListener('seeked', this.onScrubSeeked, { once: true });
    // some renderers never emit `seeked` for a no-op correction, which would
    // latch the flag and freeze `_maxViewed` for the rest of the session
    clearTimeout(this._suppressSeekTimeout);
    this._suppressSeekTimeout = setTimeout(this.onScrubSeeked, SUPPRESS_SEEK_TIMEOUT);
    this.mediaElement.currentTime = this._maxViewed;

    this.onScrubBlocked();
  }

  onScrubSeeked() {
    clearTimeout(this._suppressSeekTimeout);
    this._suppressSeek = false;
  }

  /**
   * Prevents keyboard seeks which would move the playhead beyond the furthest
   * viewed position. Gated on the target position rather than the current one,
   * so rewinding first cannot be used to jump ahead.
   * @param {KeyboardEvent} event
   */
  onScrubKeyDown(event) {
    // mediaelement also seeks from a document-level handler whenever focus is
    // anywhere inside the player, so this must not be scoped to the slider
    if (!FORWARD_SCRUBBING_KEYS.includes(event.key)) return;

    const duration = this.mediaElement?.duration;
    if (!duration || duration === Infinity) return;

    const targetTime = event.key === 'End'
      ? duration
      : this.mediaElement.currentTime + this.getSeekForwardInterval(duration);

    if (targetTime <= this._maxViewed + SCRUB_TOLERANCE) return;

    // stop the event before mediaelement's own slider handler can seek
    event.preventDefault();
    event.stopPropagation();
    this.onScrubBlocked();
  }

  /**
   * The seek distance of a single forward key press. `defaultSeekForwardInterval`
   * is author-configurable, so it may not be a usable function.
   * @param {number} duration
   * @returns {number}
   */
  getSeekForwardInterval(duration) {
    const interval = this.mediaElementInstance?.options?.defaultSeekForwardInterval;
    if (typeof interval !== 'function') return duration * FALLBACK_SEEK_FRACTION;
    try {
      const value = interval(this.mediaElement);
      if (typeof value !== 'number' || !isFinite(value)) return duration * FALLBACK_SEEK_FRACTION;
      return value;
    } catch (e) {
      return duration * FALLBACK_SEEK_FRACTION;
    }
  }

  onScrubEnded() {
    this.removeScrubBlocker();
  }

  /**
   * Provides feedback that a forward scrub was rejected. The colour flash is
   * paired with an announcement so the rejection isn't communicated by colour
   * alone. The live region is cleared first, because assigning identical text
   * is not re-announced by assistive technology.
   */
  onScrubBlocked() {
    this._scrubBlocker?.classList.add('is-blocked');
    clearTimeout(this._scrubBlockedTimeout);
    this._scrubBlockedTimeout = setTimeout(() => {
      this._scrubBlocker?.classList.remove('is-blocked');
    }, SCRUB_BLOCKED_FLASH_DURATION);

    if (!this._scrubLiveRegion) return;
    // throttle so a held key cannot produce a burst of announcements
    const now = Date.now();
    if (now - (this._scrubAnnouncedAt ?? 0) < SCRUB_ANNOUNCE_THROTTLE) return;
    this._scrubAnnouncedAt = now;

    const globals = Adapt.course.get('_globals')?._components?._media ?? {};
    const text = globals.scrubbingBlocked;
    if (!text) return;

    this._scrubLiveRegion.textContent = '';
    cancelAnimationFrame(this._scrubAnnounceFrame);
    this._scrubAnnounceFrame = requestAnimationFrame(() => {
      if (!this._scrubLiveRegion) return;
      this._scrubLiveRegion.textContent = text;
    });
  }

  updateScrubBlocker() {
    if (!this._scrubBlocker) return;

    const duration = this.mediaElement?.duration;
    const isValidDuration = duration && duration !== Infinity;
    if (!isValidDuration) return;

    const percentRemaining = 1 - this._maxViewed / duration;
    this._scrubBlocker.style.width = `${Math.max(0, percentRemaining) * 100}%`;
  }

  /**
   * Tears down the blocker and restores the slider to its normal state. The
   * furthest viewed position is persisted here because the learner can leave
   * the page without ever pausing.
   */
  removeScrubBlocker() {
    // silent: a change event here would re-render the view mid-teardown.
    // Skipped once complete: a later `reset()` clears `_isComplete` but not
    // `_maxViewed`, so persisting it here would leave the restriction
    // pre-satisfied on the next visit.
    if (this._maxViewed !== undefined && !this.model.get('_isComplete')) {
      this.model.set('_maxViewed', this._maxViewed, { silent: true });
    }

    clearTimeout(this._scrubBlockedTimeout);
    clearTimeout(this._suppressSeekTimeout);
    cancelAnimationFrame(this._scrubAnnounceFrame);

    this.mediaElement?.removeEventListener('timeupdate', this.onScrubTimeUpdate);
    this.mediaElement?.removeEventListener('seeking', this.onScrubSeeking);
    this.mediaElement?.removeEventListener('seeked', this.onScrubSeeked);
    this.mediaElement?.removeEventListener('ended', this.onScrubEnded);
    this.mediaElement?.removeEventListener('loadedmetadata', this.updateScrubBlocker);
    this.mediaElement?.removeEventListener('durationchange', this.updateScrubBlocker);

    if (this._captureElement) {
      this._captureElement.removeEventListener('keydown', this.onScrubKeyDown, true);
      delete this._captureElement;
    }

    delete this._sliderElement;

    if (this._scrubBlocker) {
      BLOCKED_POINTER_EVENTS.forEach(name => this._scrubBlocker.removeEventListener(name, this.onBlockerPointerDown));
      this._scrubBlocker.remove();
      delete this._scrubBlocker;
    }

    if (this._scrubLiveRegion) {
      this._scrubLiveRegion.remove();
      delete this._scrubLiveRegion;
    }
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

MediaView.template = 'media.jsx';

export default MediaView;
