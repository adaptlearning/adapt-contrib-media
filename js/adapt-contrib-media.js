define(function(require) {

	var mep = require("components/adapt-contrib-media/js/mep");
	var Adapt = require("coreJS/adapt");
	var ComponentView = require("coreViews/componentView");
	var Handlebars = require('handlebars');

    var Media = ComponentView.extend({
        
		events: {
			'inview':'inview'
		},
		
        postRender: function() {
			this.mediaElement = this.$('audio, video').mediaelementplayer({
				pluginPath:'assets/', 
				success: _.bind(function (mediaElement, domObject) {
					this.setReadyStatus();
				}, this)
			});
        },
		
		inview: function(event, visible) {
			if (visible) this.setCompletionStatus();
			this.$el.off('inview');
		}
    });
    
    Adapt.register("media", Media);
    
});