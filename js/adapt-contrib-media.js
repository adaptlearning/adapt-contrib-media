/*
* adapt-contrib-media
* License - http://github.com/adaptlearning/adapt_framework/LICENSE
* Maintainers - Chris Steele <chris.steele@kineo.com>, Daryl Hedley <darylhedley@hotmail.com>,
*               Kevin Corry <kevinc@learningpool.com>
*/
define(function(require) {

  var mep = require("components/adapt-contrib-media/js/mep");
  var Adapt = require("coreJS/adapt");
  var ComponentView = require("coreViews/componentView");
  var Handlebars = require('handlebars');

  var Media = ComponentView.extend({

    events: {
      'inview':'inview'
    },

    preRender: function() {
      this.listenTo(Adapt, 'device:resize', this.onScreenSizeChanged);
      // Listen for loadeddata event and set ready status - some browsers
      // do not load media content if the media element is hidden.
      this.$('audio, video').on('loadeddata', this.setReady());
    },

    onScreenSizeChanged: function() {
      this.$('audio, video').width(this.$('.component-widget').width());
    },
    
    postRender: function() {
      this.mediaElement = this.$('audio, video').mediaelementplayer({
        pluginPath:'assets/', 
        success: _.bind(function (mediaElement, domObject) {
          this.setReady();
        }, this),
        features: ['playpause','progress','current','duration']
      });
    },

    setReady: function() {
      if (!this.model.get('_isReady')) {
        this.setReadyStatus();
      }
    },

    inview: function(event, visible) {
      if (visible) {
        this.setCompletionStatus();
      }
    }

  });

  Adapt.register("media", Media);

});
