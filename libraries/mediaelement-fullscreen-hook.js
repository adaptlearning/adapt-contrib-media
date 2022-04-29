define([
  'core/js/adapt',
  'core/js/device',
  'libraries/mediaelement-and-player'
], function(Adapt, device) {
  var mepPrototype = $.extend({}, window.mejs.MediaElementPlayer.prototype);

  $.extend(window.mejs.MediaElementPlayer.prototype, {
    /**
    * fixes a bug (adaptlearning/adapt_framework#1478)
    * where the media player going into/coming out of full-screen mode would trigger inview on
    * components below it; we therefore need to switch off inview when entering full screen mode
    * and switch it back on again after exiting full screen mode
    */
    detectFullscreenMode: function() {
      var vendorPrefix = this.getVendorPrefix();
      var fsEventName = 'on' + vendorPrefix + 'fullscreenchange';

      if (document[fsEventName] === null) {
        document[fsEventName] = function fullScreenEventHandler() {

          var elementName = (vendorPrefix === '' ? 'fullscreenElement' : vendorPrefix + 'FullscreenElement');

          if (document[elementName] !== null) {
            $.inview.lock('mediaelement');
            Adapt.trigger('media:fullscreen:enter');
          } else {
            $.inview.unlock('mediaelement');
            Adapt.trigger('media:fullscreen:exit');
          }
        };
      }
      return mepPrototype.detectFullscreenMode.apply(this, arguments);
    },

    /**
    * because the fullscreen events and properties are still vendor-prefixed in some browsers...
    */
    getVendorPrefix: function() {
      var browser = device.browser;

      if (browser === 'internet explorer') {
        return 'ms';
      }

      if (browser === 'microsoft edge' || browser === 'safari') {
        return 'webkit';
      }

      return ''; // Chrome, Opera and Firefox no longer require a vendor prefix
    }
  });
});
