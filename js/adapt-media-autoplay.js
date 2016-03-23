define(function(require) {

    var mep = require('components/adapt-media-autoplay/js/mediaelement-and-player');
    var ComponentView = require('coreViews/componentView');
    var Adapt = require('coreJS/adapt');

    var froogaloopAdded = false;

    var MediaAutoplay = ComponentView.extend({

        events: {
            "click .media-inline-transcript-button": "onToggleInlineTranscript"
        },

        preRender: function() {
            this.listenTo(Adapt, 'device:resize', this.onScreenSizeChanged);
            this.listenTo(Adapt, 'device:changed', this.onDeviceChanged);
            this.listenTo(Adapt, 'accessibility:toggle', this.onAccessibilityToggle);
            // Listen for text change on audio extension
            this.listenTo(Adapt, "audio:changeText", this.replaceText);
            // Listen for notify closing
            this.listenTo(Adapt, 'popup:closed', this.notifyClosed);

            this.checkIfResetOnRevisit();
        },

        postRender: function() {
            this.setupPlayer();

            if (this.model.get('_reducedText') && this.model.get('_reducedText')._isEnabled) {
                this.replaceText(Adapt.audio.textSize);
            }
            // Check if notify is visible
            if ($('body').children('.notify').css('visibility') == 'visible') {
                this.notifyOpened();
            }
        },

        notifyOpened: function() {
            this.notifyIsOpen = true;
            this.playMediaElement(false);
        },

        notifyClosed: function() {
            this.notifyIsOpen = false;

            if (this.model.get('_autoPlay') && this.videoIsInView == true && this.mediaCanAutoplay) {
                this.playMediaElement(true);
            }
        },

        setupPlayer: function() {

            this.notifyIsOpen = false;

            this.mediaAutoplayOnce = this.model.get('_autoPlayOnce');

            this.mediaCanAutoplay = this.model.get('_autoPlay');

            if (!this.model.get('_playerOptions')) this.model.set('_playerOptions', {});

            var modelOptions = this.model.get('_playerOptions');

            if (modelOptions.pluginPath === undefined) modelOptions.pluginPath = 'assets/';
            if(modelOptions.features === undefined) {
                modelOptions.features = ['playpause','progress','current','duration'];
                if (this.model.get('_useClosedCaptions')) {
                    modelOptions.features = ['playpause','progress','tracks','current','duration'];
                }
            }

            modelOptions.success = _.bind(this.onPlayerReady, this);

            if (this.model.get('_useClosedCaptions')) {
                modelOptions.startLanguage = this.model.get('_startLanguage') === undefined ? 'en' : this.model.get('_startLanguage');
            }

            var hasAccessibility = Adapt.config.has('_accessibility') && Adapt.config.get('_accessibility')._isActive
                ? true
                : false;

            if (hasAccessibility) {
                modelOptions.alwaysShowControls = true;
                modelOptions.hideVideoControlsOnLoad = false;
            }
            
            if (modelOptions.alwaysShowControls === undefined) {
                modelOptions.alwaysShowControls = false;
            }
            if (modelOptions.hideVideoControlsOnLoad === undefined) {
                modelOptions.hideVideoControlsOnLoad = true;
            }

            this.addMediaTypeClass();

            this.addThirdPartyFixes(modelOptions, _.bind(function createPlayer() {
                // create the player
                this.$('audio, video').mediaelementplayer(modelOptions);

                // We're streaming - set ready now, as success won't be called above
                if (this.model.get('_media').source) {
                    this.$('.media-widget').addClass('external-source');
                    this.setReadyStatus();
                }
            }, this));
        },

        // Reduced text
        replaceText: function(value) {
            // If enabled
            if (this.model.get('_reducedText') && this.model.get('_reducedText')._isEnabled) {
                if(value == 0) {
                    this.$('.component-title-inner').html(this.model.get('displayTitle')).a11y_text();
                    this.$('.component-body-inner').html(this.model.get('body')).a11y_text();
                } else {
                    this.$('.component-title-inner').html(this.model.get('displayTitleReduced')).a11y_text();
                    this.$('.component-body-inner').html(this.model.get('bodyReduced')).a11y_text();
                }
            }
        },

        addMediaTypeClass: function() {
            var media = this.model.get("_media");
            if (media.type) {
                var typeClass = media.type.replace(/\//, "-");
                this.$(".media-widget").addClass(typeClass);
            }
        },

        addThirdPartyFixes: function(modelOptions, callback) {
            var media = this.model.get("_media");
            switch (media.type) {
            case "video/vimeo":
                modelOptions.alwaysShowControls = false;
                modelOptions.hideVideoControlsOnLoad = true;
                modelOptions.features = [];
                if (froogaloopAdded) return callback();
                Modernizr.load({
                    load: "assets/froogaloop.js", 
                    complete: function() {
                        froogaloopAdded = true;
                        callback();
                    }
                }); 
                break;
            default:
                callback();
            }
        },

        setupEventListeners: function() {
            this.completionEvent = (!this.model.get('_setCompletionOn')) ? 'play' : this.model.get('_setCompletionOn');

            if (this.completionEvent !== 'inview') {
                this.mediaElement.addEventListener(this.completionEvent, _.bind(this.onCompletion, this));
                if (this.model.get('_autoPlay')) {
                    this.$('.component-widget').on('inview', _.bind(this.inview, this));
                }
            } else {
                this.$('.component-widget').on('inview', _.bind(this.inview, this));
            }

            // Add listener for when the media is playing so the audio can be stopped
            
            if (this.model.get('_audio') && this.model.get('_audio')._isEnabled) {
                this.mediaElement.addEventListener('playing', _.bind(this.onPlayMedia, this));
            }
        },

        // Overrides the default play/pause functionality to stop accidental playing on touch devices
        setupPlayPauseToggle: function() {
            // bit sneaky, but we don't have a this.mediaElement.player ref on iOS devices
            var player = this.mediaElement.player;

            if (!player) {
                console.log("MediaAutoplay.setupPlayPauseToggle: OOPS! there's no player reference.");
                return;
            }

            // stop the player dealing with this, we'll do it ourselves
            player.options.clickToPlayPause = false;

            // play on 'big button' click
            $('.mejs-overlay-button',this.$el).click(_.bind(function(event) {
                player.play();
            }, this));

            // pause on player click
            $('.mejs-mediaelement',this.$el).click(_.bind(function(event) {
                var isPaused = player.media.paused;
                if(!isPaused) player.pause();
            }, this));
        },

        checkIfResetOnRevisit: function() {
            var isResetOnRevisit = this.model.get('_isResetOnRevisit');

            // If reset is enabled set defaults
            if (isResetOnRevisit) {
                this.model.reset(isResetOnRevisit);
            }
        },

        inview: function(event, visible, visiblePartX, visiblePartY) {
            if (visible) {
                if (visiblePartY === 'top' || visiblePartY === 'both') {
                    this._isVisibleTop = true;
                } else {
                    this._isVisibleTop = false;
                }
                if (this._isVisibleTop) {
                    if (this.model.get('_autoPlay') && this.notifyIsOpen == false && this.mediaCanAutoplay == true) {
                        this.playMediaElement(true);
                    }
                    if (this.model.get('_setCompletionOn') == 'inview') {
                        this.setCompletionStatus();
                    }
                    this.$('.component-inner').off('inview');
                    this.videoIsInView = true;
                } else {
                    this.playMediaElement(false);
                    this.videoIsInView = false;
                }
            } else {
                this.playMediaElement(false);
                this.videoIsInView = false;
            }
        },

        playMediaElement: function(state) {
            if (this.model.get('_isVisible') && state) {
                this.mediaElement.play();
                // Set to false to stop autoplay when inview again
                if(this.mediaAutoplayOnce) {
                    this.mediaCanAutoplay = false;
                }
            } else if (state === false) {
                this.mediaElement.pause();
            }
        },

        remove: function() {
            if ($("html").is(".ie8")) {
                var obj = this.$("object")[0];
                if (obj) {
                    obj.style.display = "none";
                }
            }
            if (this.mediaElement) {
                $(this.mediaElement.pluginElement).remove();
                delete this.mediaElement;
            }
            ComponentView.prototype.remove.call(this);
        },

        onCompletion: function() {
            this.setCompletionStatus();

            // removeEventListener needs to pass in the method to remove the event in firefox and IE10
            this.mediaElement.removeEventListener(this.completionEvent, this.onCompletion);
        },

        onPlayMedia: function() {
            if (!Adapt.audio.audioClip[this.model.get('_audio')._channel].paused) {
                Adapt.trigger('audio:pauseAudio', this.model.get('_audio')._channel);
            }
        },

        onDeviceChanged: function() {
            if (this.model.get('_media').source) {
                this.$('.mejs-container').width(this.$('.component-widget').width());
            }
        },

        onPlayerReady: function (mediaElement, domObject) {
            this.mediaElement = mediaElement;

            if (!this.mediaElement.player) {
                this.mediaElement.player =  mejs.players[this.$('.mejs-container').attr('id')];
            }

            var hasTouch = mejs.MediaFeatures.hasTouch;
            if (hasTouch) {
                this.setupPlayPauseToggle();
            }

            this.setReadyStatus();
            this.setupEventListeners();
        },

        onScreenSizeChanged: function() {
            this.$('audio, video').width(this.$('.component-widget').width());
        },

        onAccessibilityToggle: function() {
           this.showControls();
        },

        onToggleInlineTranscript: function(event) {
            if (event) event.preventDefault();
            var $transcriptBodyContainer = this.$(".media-inline-transcript-body-container");
            var $button = this.$(".media-inline-transcript-button");

            if ($transcriptBodyContainer.hasClass("inline-transcript-open")) {
                $transcriptBodyContainer.slideUp();
                $transcriptBodyContainer.removeClass("inline-transcript-open");
                $button.html(this.model.get("_transcript").inlineTranscriptButton);
            } else {
                $transcriptBodyContainer.slideDown().a11y_focus();
                $transcriptBodyContainer.addClass("inline-transcript-open");
                $button.html(this.model.get("_transcript").inlineTranscriptCloseButton);
                if (this.model.get('_transcript')._setCompletionOnView !== false) {
                    this.setCompletionStatus();
                }
            }
            _.delay(_.bind(function() {
                Adapt.trigger('device:resize');
            }, this), 300);
        },

        showControls: function() {
            var hasAccessibility = Adapt.config.has('_accessibility') && Adapt.config.get('_accessibility')._isActive
                ? true
                : false;

            if (hasAccessibility) {
                if (!this.mediaElement.player) return;

                var player = this.mediaElement.player;

                player.options.alwaysShowControls = true;
                player.options.hideVideoControlsOnLoad = false;
                player.enableControls();
                player.showControls();

                this.$('.mejs-playpause-button button').attr({
                    "role": "button"
                });
                var screenReaderVideoTagFix = $("<div role='region' aria-label='.'>");
                this.$('.mejs-playpause-button').prepend(screenReaderVideoTagFix);

                this.$('.mejs-time, .mejs-time-rail').attr({
                    "aria-hidden": "true"
                });
            }
        }
    });

    Adapt.register('media-autoplay', MediaAutoplay);

    return MediaAutoplay;

});
