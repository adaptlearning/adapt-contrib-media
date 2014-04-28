/*
* adapt-contrib-media
* License - http://github.com/adaptlearning/adapt_framework/LICENSE
* Maintainers - Chris Steele <chris.steele@kineo.com>, Daryl Hedley <darylhedley@hotmail.com>,
*               Kevin Corry <kevinc@learningpool.com>
*/
define(function(require) {

  var mep = require("components/adapt-contrib-media/js/mediaelement-and-player.min.js");
  var Adapt = require("coreJS/adapt");
  var ComponentView = require("coreViews/componentView");
  var Handlebars = require('handlebars');

  var Media = ComponentView.extend({

      events: {
        'inview':'inview'
      },

      preRender: function() {
        this.listenTo(Adapt, 'device:resize', this.onScreenSizeChanged);
        this.listenTo(Adapt, 'device:changed', this.onDeviceChanged);
      },

      onScreenSizeChanged: function() {
        this.$('audio, video').width(this.$('.component-widget').width());
      },

      onDeviceChanged: function() {
        if (this.model.get('_media').source) {
          this.$('.mejs-container').width(this.$('.component-widget').width());
        }
      },

      postRender: function() {
        this.mediaElement = this.$('audio, video').mediaelementplayer({
          pluginPath:'assets/',
          success: _.bind(function (mediaElement, domObject) {
            this.setReadyStatus();
            mediaElement.addEventListener('ended', _.bind(function() {
                this.setCompletionStatus();
            }, this), false);
          }, this),
          features: ['playpause','progress','current','duration']
        });

        // We're streaming - set ready now, as success won't be called above
        if (this.model.get('_media').source) {
          this.$('.media-widget').addClass('external-source');
          this.setReadyStatus();
        }
      },

      inview: function(event, visible) {
        if (this.model.get('_media')._allowCompletionOnInview) {
          if (visible) {
            this.setCompletionStatus();
          }
        }
      }

    });

    Adapt.register("media", Media);

    return Media;

});
