/*
 * adapt-contrib-media
 * License - http://github.com/adaptlearning/adapt_framework/blob/master/LICENSE
 * Maintainers - Chris Steele <chris.steele@kineo.com>, Daryl Hedley <darylhedley@gmail.com>,
 *               Kevin Corry <kevinc@learningpool.com>, Kirsty Hames <kirstyjhames@gmail.com>
 */
define(function(require) {

    var mep = require('components/adapt-contrib-media/js/mediaelement-and-player.min');
    var ComponentView = require('coreViews/componentView');
    var Adapt = require('coreJS/adapt');

    var Media = ComponentView.extend({

        preRender: function() {
            this.listenTo(Adapt, 'device:resize', this.onScreenSizeChanged);
            this.listenTo(Adapt, 'device:changed', this.onDeviceChanged);

            // Checks to see if the media should be reset on revisit
            this.checkIfResetOnRevisit();
        },

        postRender: function() {
            var mediaElement = this.$('audio, video').mediaelementplayer({
                pluginPath: 'assets/',
                success: _.bind(function(mediaElement, domObject) {
                    this.mediaElement = mediaElement;
                    this.setReadyStatus();
                    this.setupEventListeners();
                }, this),
                features: ['playpause', 'progress', 'current', 'duration']
            });

            // We're streaming - set ready now, as success won't be called above
            if (this.model.get('_media').source) {
                this.$('.media-widget').addClass('external-source');
                this.setReadyStatus();
            }
        },

        // Used to check if the media should reset on revisit
        checkIfResetOnRevisit: function() {
            var isResetOnRevisit = this.model.get('_isResetOnRevisit');

            // If reset is enabled set defaults
            if (isResetOnRevisit) {
                this.model.set({
                    _isEnabled: true,
                    _isComplete: false
                });
            }
        },

        onScreenSizeChanged: function() {
            this.$('audio, video').width(this.$('.component-widget').width());
        },

        onDeviceChanged: function() {
            if (this.model.get('_media').source) {
                this.$('.mejs-container').width(this.$('.component-widget').width());
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

        onCompletion: function() {
            this.setCompletionStatus();

            // removeEventListener needs to pass in the method to remove the event in firefox and IE10
            this.mediaElement.removeEventListener(this.completionEvent, this.onCompletion);
        },

        remove: function() {
            ComponentView.prototype.remove.call(this);
            this.mediaElement.stop();
            //this.removedMediaElement
        }

    });

    Adapt.register('media', Media);

    return Media;

});
