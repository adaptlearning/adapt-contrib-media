define(function(require) {

	var mep = require("components/adapt-contrib-media/js/mep");
	var Popup = require("components/adapt-contrib-media/js/popup");
	var Adapt = require("coreJS/adapt");
	var ComponentView = require("coreViews/componentView");
	var Handlebars = require('handlebars');

    var Media = ComponentView.extend({
        
		popUp: Popup.extend({
			template: Handlebars.templates["media-transcript"],
			className: "media-component-transcript"
		}),
		
		events: {
			'inview':'inview'
		},
		
        postRender: function() {
            console.log("rendering");
			this.updateRatio();
            this.setReadyStatus();
           
			this.$('a.media-show-transcript').on('click', _.bind(this.showTranscript, this));
			this.$('audio, video').mediaelementplayer({'pluginPath':'assets/'});
        },
		
		inview: function(event, visible) {
			if (visible) this.setCompletionStatus();
			this.$el.off('inview');
		},
		
		updateRatio: function() {
			//var width = this.$('.widget').css('width');
			//this.$('.widget object').width(width).height((width/16)*9);
			//this.$('.widget video').width(width).height((width/16)*9);
		},
		
		showTranscript: function(event) {
			event.preventDefault(); 
			new this.popUp({model:this.model});
		}
        
    });
    
    Adapt.register("media", Media);
    
});