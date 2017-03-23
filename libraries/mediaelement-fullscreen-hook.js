define([
    'core/js/adapt',
    'libraries/mediaelement-and-player'
], function(Adapt) {
    
    //  fixes a bug (adaptlearning/adapt_framework#1478)
    //  where the media player going into/coming out of full-screen mode would trigger inview on 
    //  components below it; we therefore need to switch off inview when entering full screen mode 
    //  and switch it back on again shortly after exiting it

    var mepPrototype = $.extend({}, mejs.MediaElementPlayer.prototype);
    $.extend(mejs.MediaElementPlayer.prototype, {

        exitFullScreen: function() {

            Adapt.trigger("media:fullscreen:exit", this);

            var returnValue = mepPrototype.exitFullScreen.apply(this, arguments);

            // Wait for browser to settle coming down from full screen.
            _.delay(function() {
                $.inview.unlock("mediaelement");
            }, 500);
            
            return returnValue;
            
        },

        enterFullScreen: function() {

            Adapt.trigger("media:fullscreen:enter", this);

            $.inview.lock("mediaelement");

            return mepPrototype.enterFullScreen.apply(this, arguments);

        }

    });

});
