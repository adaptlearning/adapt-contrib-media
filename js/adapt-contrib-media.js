define([
    'core/js/adapt',
    'core/js/views/componentView',
    'libraries/mediaelement-and-player',
    'libraries/mediaelement-and-player-accessible-captions',
    'libraries/mediaelement-fullscreen-hook'
], function(Adapt, ComponentView) {

    var froogaloopAdded = false;

    // The following function is used to to prevent a memory leak in Internet Explorer
    // See: http://javascript.crockford.com/memory/leak.html
    function purge(d) {
        var a = d.attributes, i, l, n;
        if (a) {
            for (i = a.length - 1; i >= 0; i -= 1) {
                n = a[i].name;
                if (typeof d[n] === 'function') {
                    d[n] = null;
                }
            }
        }
        a = d.childNodes;
        if (a) {
            l = a.length;
            for (i = 0; i < l; i += 1) {
                purge(d.childNodes[i]);
            }
        }
    }

    var Media = ComponentView.extend({

        events: {
            "click .media-inline-transcript-button": "onToggleInlineTranscript",
            "click .media-external-transcript-button": "onExternalTranscriptClicked"
        },

        preRender: function() {
            this.listenTo(Adapt, {
                'device:resize': this.onScreenSizeChanged,
                'device:changed': this.onDeviceChanged,
                'accessibility:toggle': this.onAccessibilityToggle,
                'media:stop': this.onMediaStop
            });

            _.bindAll(this, 'onMediaElementPlay', 'onMediaElementPause', 'onMediaElementEnded', 'onMediaElementTimeUpdate', 'onMediaElementSeeking');

            // set initial player state attributes
            this.model.set({
                '_isMediaEnded': false,
                '_isMediaPlaying': false
            });

            if (this.model.get('_media').source) {
                var media = this.model.get('_media');

                // Avoid loading of Mixed Content (insecure content on a secure page)
                if (window.location.protocol === 'https:' && media.source.indexOf('http:') === 0) {
                    media.source = media.source.replace(/^http\:/, 'https:');
                }

                this.model.set('_media', media);
            }

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
                    modelOptions.features.unshift('tracks');
                }
                if (this.model.get("_allowFullScreen")) {
                    modelOptions.features.push('fullscreen');
                }
                if (this.model.get('_showVolumeControl')) {
                    modelOptions.features.push('volume');
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
                try {
                    if (this.model.get('_media').source) {
                        this.$('.media-widget').addClass('external-source');
                    }
                } catch (e) {
                    console.log("ERROR! No _media property found in components.json for component " + this.model.get('_id'));
                } finally {
                    this.setReadyStatus();
                }
            }, this));
        },

        addMediaTypeClass: function() {
            var media = this.model.get("_media");
            if (media && media.type) {
                var typeClass = media.type.replace(/\//, "-");
                this.$(".media-widget").addClass(typeClass);
            }
        },

        addThirdPartyFixes: function(modelOptions, callback) {
            var media = this.model.get("_media");
            if (!media) return callback();

            switch (media.type) {
                case "video/vimeo":
                    modelOptions.alwaysShowControls = false;
                    modelOptions.hideVideoControlsOnLoad = true;
                    modelOptions.features = [];
                    if (froogaloopAdded) return callback();
                    $.getScript("assets/froogaloop.js")
                        .done(function() {
                            froogaloopAdded = true;
                            callback();
                        })
                        .fail(function() {
                            froogaloopAdded = false;
                            console.log('Could not load froogaloop.js');
                        });
                    break;
                default:
                    callback();
            }
        },

        setupEventListeners: function() {
            this.completionEvent = (!this.model.get('_setCompletionOn')) ? 'play' : this.model.get('_setCompletionOn');

            if (this.completionEvent === 'inview') {
                this.$('.component-widget').on('inview', _.bind(this.inview, this));
            }

            // wrapper to check if preventForwardScrubbing is turned on.
            if ((this.model.get('_preventForwardScrubbing')) && (!this.model.get('_isComplete'))) {
                $(this.mediaElement).on({
                    'seeking': this.onMediaElementSeeking,
                    'timeupdate': this.onMediaElementTimeUpdate
                });
            }
            
            // handle other completion events in the event Listeners 
            $(this.mediaElement).on({
            	'play': this.onMediaElementPlay,
            	'pause': this.onMediaElementPause,
            	'ended': this.onMediaElementEnded
            });
        },

        onMediaElementPlay: function(event) {

            Adapt.trigger("media:stop", this);

            this.model.set({
                '_isMediaPlaying': true,
                '_isMediaEnded': false
            });
            
            if (this.completionEvent === 'play') {
                this.setCompletionStatus();
            }
        },

        onMediaElementPause: function(event) {
            this.model.set('_isMediaPlaying', false);
        },

        onMediaElementEnded: function(event) {
            this.model.set('_isMediaEnded', true);

            if (this.completionEvent === 'ended') {
                this.setCompletionStatus();
            }
        },
        
        onMediaElementSeeking: function(event) {
            var maxViewed = this.model.get("_maxViewed");
            if(!maxViewed) {
                maxViewed = 0;
            }
            if (event.target.currentTime > maxViewed) {
                event.target.currentTime = maxViewed;
            }
        },

        onMediaElementTimeUpdate: function(event) {
            var maxViewed = this.model.get("_maxViewed");
            if (!maxViewed) {
                maxViewed = 0;
            }
            if (event.target.currentTime > maxViewed) {
                this.model.set("_maxViewed", event.target.currentTime);
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

            this.onOverlayClick = _.bind(this.onOverlayClick, this);
            this.onMediaElementClick = _.bind(this.onMediaElementClick, this);

            // play on 'big button' click
            this.$('.mejs-overlay-button').on("click", this.onOverlayClick);

            // pause on player click
            this.$('.mejs-mediaelement').on("click", this.onMediaElementClick);
        },
        
        onMediaStop: function(view) {

            // Make sure this view isn't triggering media:stop
            if (view && view.cid === this.cid) return;

            var player = this.mediaElement.player;
            if (!player) return;
            
            player.pause();
        },

        onOverlayClick: function() {
            var player = this.mediaElement.player;
            if (!player) return;

            player.play();
        },

        onMediaElementClick: function(event) {
            var player = this.mediaElement.player;
            if (!player) return;

            var isPaused = player.media.paused;
            if(!isPaused) player.pause();
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
            this.$('.mejs-overlay-button').off("click", this.onOverlayClick);
            this.$('.mejs-mediaelement').off("click", this.onMediaElementClick);

            var modelOptions = this.model.get('_playerOptions');
            delete modelOptions.success;

            var media = this.model.get("_media");
            if (media) {
                switch (media.type) {
                case "video/vimeo":
                    this.$("iframe")[0].isRemoved = true;
                }
            }

            if (this.mediaElement && this.mediaElement.player) {
                var player_id = this.mediaElement.player.id;

                purge(this.$el[0]);
                this.mediaElement.player.remove();

                if (mejs.players[player_id]) {
                    delete mejs.players[player_id];
                }
            }

            if (this.mediaElement) {
                $(this.mediaElement).off({
                    'play': this.onMediaElementPlay,
                    'pause': this.onMediaElementPause,
                    'ended': this.onMediaElementEnded,
                    'seeking': this.onMediaElementSeeking,
                    'timeupdate': this.onMediaElementTimeUpdate
                });

                this.mediaElement.src = "";
                $(this.mediaElement.pluginElement).remove();
                delete this.mediaElement;
            }

            ComponentView.prototype.remove.call(this);
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

            this.addThirdPartyAfterFixes();

            if(this.model.has('_startVolume')) {
                // Setting the start volume only works with the Flash-based player if you do it here rather than in setupPlayer
                this.mediaElement.player.setVolume(parseInt(this.model.get('_startVolume'))/100);
            }

            this.setReadyStatus();
            this.setupEventListeners();
        },

        addThirdPartyAfterFixes: function() {
            var media = this.model.get("_media");
            switch (media.type) {
            case "video/vimeo":
                this.$(".mejs-container").attr("tabindex", 0);
            }
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
                $transcriptBodyContainer.stop(true,true).slideUp(function() {
                    $(window).resize();
                });
                $transcriptBodyContainer.removeClass("inline-transcript-open");
                $button.html(this.model.get("_transcript").inlineTranscriptButton);
            } else {
                $transcriptBodyContainer.stop(true,true).slideDown(function() {
                    $(window).resize();
                }).a11y_focus();
                $transcriptBodyContainer.addClass("inline-transcript-open");
                $button.html(this.model.get("_transcript").inlineTranscriptCloseButton);

                if (this.model.get('_transcript')._setCompletionOnView !== false) {
                    this.setCompletionStatus();
                }
            }
        },

        onExternalTranscriptClicked: function(event) {
            if (this.model.get('_transcript')._setCompletionOnView !== false) {
                this.setCompletionStatus();
            }
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

    Adapt.register('media', Media);

    return Media;

});
