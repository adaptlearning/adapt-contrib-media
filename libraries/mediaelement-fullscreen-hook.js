define([
	'core/js/adapt',
	'libraries/mediaelement-and-player'
], function(Adapt) {
	
	var rawPrototype = $.extend({}, mejs.MediaElementPlayer.prototype);
	$.extend(mejs.MediaElementPlayer.prototype, {

		exitFullScreen: function() {

			Adapt.trigger("media:fullscreen:exit", this);

			var returnValue = rawPrototype.exitFullScreen.apply(this, arguments);

			// Wait for browser to settle coming down from full screen.
			_.delay(function() {
				$.inview.unlock("mediaelement");
			}, 500);
			
			return returnValue;
			
		},

		enterFullScreen: function() {

			Adapt.trigger("media:fullscreen:enter", this);

			$.inview.lock("mediaelement");

			return rawPrototype.enterFullScreen.apply(this, arguments);

		}

	});

});
