define(function(require) {

    var mep = require('components/adapt-contrib-media/js/mediaelement-and-player.min');
    var ComponentView = require('coreViews/componentView');
    var Adapt = require('coreJS/adapt');

    var froogaloopAdded = false;

    var Media = ComponentView.extend({

        events: {
            "click .media-inline-transcript-button": "onToggleInlineTranscript"
        },

        preRender: function() {
            this.listenTo(Adapt, 'device:resize', this.onScreenSizeChanged);
            this.listenTo(Adapt, 'device:changed', this.onDeviceChanged);
            this.listenTo(Adapt, 'accessibility:toggle', this.onAccessibilityToggle);

            this.checkIfResetOnRevisit();
        },

        postRender: function() {
            this.setupPlayer();
        },


        setupPlayer: function() {
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

            var hasAccessibility = Adapt.config.has('_accessibility') && Adapt.config.get('_accessibility')._isEnabled
                ? true
                : false;

            if (hasAccessibility) modelOptions.alwaysShowControls = true;

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
            } else {
                this.$('.component-widget').on('inview', _.bind(this.inview, this));
            }
        },

        // Overrides the default play/pause functionality to stop accidental playing on touch devices
        setupPlayPauseToggle: function() {
            // bit sneaky, but we don't have a this.mediaElement.player ref on iOS devices
            var player = this.mediaElement.player;

            if (!player) {
                console.log("Media.setupPlayPauseToggle: OOPS! there's no player reference.");
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
                if (visiblePartY === 'top') {
                    this._isVisibleTop = true;
                } else if (visiblePartY === 'bottom') {
                    this._isVisibleBottom = true;
                } else {
                    this._isVisibleTop = true;
                    this._isVisibleBottom = true;
                }

                if (this._isVisibleTop && this._isVisibleBottom) {
                    this.$('.component-inner').off('inview');
                    this.setCompletionStatus();
                }
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

            this.showControls();

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
            }
        },

        showControls: function() {
            var hasAccessibility = Adapt.config.has('_accessibility') && Adapt.config.get('_accessibility')._isEnabled
                ? true
                : false;

            if (hasAccessibility) {
                if (!this.mediaElement.player) return;

                var player = this.mediaElement.player;

                player.options.alwaysShowControls = true;
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

    Adapt.register('media', Media);

    return Media;

});
