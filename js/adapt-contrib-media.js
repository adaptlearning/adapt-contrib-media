/*
 * adapt-contrib-media
 * License - http://github.com/adaptlearning/adapt_framework/blob/master/LICENSE
 * Maintainers - Chris Steele <chris.steele@kineo.com>,
 *               Daryl Hedley <darylhedley@gmail.com>,
 *               Kevin Corry <kevinc@learningpool.com>,
 *               Kirsty Hames <kirstyjhames@gmail.com>,
 *               Thomas Taylor <thomas.taylor@kineo.com>
 */
define(function(require) {

    var mep = require('components/adapt-contrib-media/js/mediaelement-and-player.min');
    var ComponentView = require('coreViews/componentView');
    var Adapt = require('coreJS/adapt');

    var Media = ComponentView.extend({

        preRender: function() {
            this.listenTo(Adapt, 'device:resize', this.onScreenSizeChanged);
            this.listenTo(Adapt, 'device:changed', this.onDeviceChanged);

            this.checkIfResetOnRevisit();
        },

        postRender: function() {
            this.setupPlayer();
        },


        setupPlayer: function() {
            if(!this.model.get('_playerOptions')) this.model.set('_playerOptions', {});

            var modelOptions = this.model.get('_playerOptions');

            if(modelOptions.pluginPath === undefined) modelOptions.pluginPath = 'assets/';
            if(modelOptions.features === undefined) modelOptions.features = ['playpause','progress','current','duration'];
            if(modelOptions.clickToPlayPause === undefined) modelOptions.clickToPlayPause = true;
            modelOptions.success = _.bind(this.onPlayerReady, this);

            // create the player
            this.$('audio, video').mediaelementplayer(modelOptions);

            // We're streaming - set ready now, as success won't be called above
            if (this.model.get('_media').source) {
                this.$('.media-widget').addClass('external-source');
                this.setReadyStatus();
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
            this.mediaElement.player.options.clickToPlayPause = false;

            // play on 'big button' click
            $('.mejs-overlay-button',this.$el).click(_.bind(function(event) {
                this.mediaElement.player.play();
            }, this));

            // pause on player click
            $('.mejs-mediaelement',this.$el).click(_.bind(function(event) {
                var isPaused = this.mediaElement.player.media.paused;
                if(!isPaused) this.mediaElement.player.pause();
            }, this));
        },

        checkIfResetOnRevisit: function() {
            var isResetOnRevisit = this.model.get('_isResetOnRevisit');

            // If reset is enabled set defaults
            if (isResetOnRevisit) {
                this.model.reset(isResetOnRevisit);
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
            ComponentView.prototype.remove.call(this);
            this.mediaElement.stop();
            //this.removedMediaElement
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

            if(this.model.get('_playerOptions').clickToPlayPause === true) {
                this.setupPlayPauseToggle();
            }

            this.setReadyStatus();
            this.setupEventListeners();
        },

        onScreenSizeChanged: function() {
            this.$('audio, video').width(this.$('.component-widget').width());
        }
    });

    Adapt.register('media', Media);

    return Media;

});
