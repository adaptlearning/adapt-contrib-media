define([
    'core/js/adapt',
    'libraries/mediaelement-and-player'
], function(Adapt) {
    var mepPrototype = $.extend({}, mejs.MediaElementPlayer.prototype);

    $.extend(mejs.MediaElementPlayer.prototype, {
        /**
         * fixes a bug (adaptlearning/adapt_framework#1478)
         * where the media player going into/coming out of full-screen mode would trigger inview on 
         * components below it; we therefore need to switch off inview when entering full screen mode 
         * and switch it back on again after exiting full screen mode
         */
        detectFullscreenMode: function() {
            var vendorPrefix = this.getVendorPrefix();
            var fsEventName = "on" + vendorPrefix + "fullscreenchange";

            if (document[fsEventName] === null) {
                document[fsEventName] = function fullScreenEventHandler() {

                    // because Firefox just HAS to be different...
                    var elementName = (vendorPrefix === "moz" ? "mozFullScreenElement" : vendorPrefix + "FullscreenElement");

                    if (document[elementName] !== null) {
                        $.inview.lock("mediaelement");
                        Adapt.trigger("media:fullscreen:enter");
                    } else {
                        $.inview.unlock("mediaelement");
                        Adapt.trigger("media:fullscreen:exit");
                    }
                };
            }
            return mepPrototype.detectFullscreenMode.apply(this, arguments);
        }, 

        /**
         * unfortunately the fullscreen events and properties are all still vendor-prefixed, see
         * https://developer.mozilla.org/en-US/docs/Web/API/Fullscreen_API#Prefixing
         * This function works out the correct prefix for the current browser.
         */
        getVendorPrefix: function() {
            var browser = Adapt.device.browser.toLowerCase();

            if (browser === "internet explorer") {
                return "ms";
            }

            if (browser === "firefox") {
                return "moz";
            }

            return "webkit"; // Chrome, Safari, Opera and Edge all use the 'webkit' prefix, so default to that
        }
    });
});