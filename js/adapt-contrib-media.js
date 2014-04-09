/*
* adapt-contrib-media
* License - http://github.com/adaptlearning/adapt_framework/LICENSE
* Maintainers - Chris Steele <chris.steele@kineo.com>, Daryl Hedley <darylhedley@hotmail.com>
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
		},

		onScreenSizeChanged: function() {
			this.$('audio, video').width(this.$('.component-widget').width());
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
        },

        inview: function(event, visible) {
        	if (this.model.get('media')._allowCompletionOnInview) {
        		if (visible) {
        			this.setCompletionStatus();
        		}
        	}
        }

    });
    
    Adapt.register("media", Media);
    
});