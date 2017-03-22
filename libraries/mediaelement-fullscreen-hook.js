define([
	'core/js/adapt',
	'libraries/mediaelement-and-player'
], function(Adapt) {
	
	var rawPrototype = $.extend({}, mejs.MediaElementPlayer.prototype);
	$.extend(mejs.MediaElementPlayer.prototype, {

		exitFullScreen: function() {

			Adapt.trigger("media:fullscreen:exit", this);

			$.inview.unlock("mediaelement");

			return rawPrototype.exitFullScreen.apply(this, arguments);
			
		},

		enterFullScreen: function() {

			Adapt.trigger("media:fullscreen:enter", this);

			$.inview.lock("mediaelement");

			return rawPrototype.enterFullScreen.apply(this, arguments);

		}

	});

});