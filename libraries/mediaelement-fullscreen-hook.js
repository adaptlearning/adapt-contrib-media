import Adapt from 'core/js/adapt';
import device from 'core/js/device';
import 'libraries/mediaelement-and-player';

const mepPrototype = Object.assign({}, window.mejs.MediaElementPlayer.prototype);

Object.assign(window.mejs.MediaElementPlayer.prototype, {
  /**
  * fixes a bug - https://github.com/adaptlearning/adapt_framework/issues/1478
  * where the media player going into/coming out of full-screen mode would trigger inview on
  * components below it; we therefore need to switch off inview when entering full screen mode
  * and switch it back on again after exiting full screen mode
  */
  detectFullscreenMode() {
    const vendorPrefix = this.getVendorPrefix();
    const fsEventName = 'on' + vendorPrefix + 'fullscreenchange';

    if (document[fsEventName] === null) {
      document[fsEventName] = function fullScreenEventHandler() {

        const elementName = (vendorPrefix === '' ? 'fullscreenElement' : vendorPrefix + 'FullscreenElement');

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
  getVendorPrefix() {
    const browser = device.browser;

    if (browser === 'internet explorer') {
      return 'ms';
    }

    if (browser === 'microsoft edge' || browser === 'safari') {
      return 'webkit';
    }

    return ''; // Chrome, Opera and Firefox no longer require a vendor prefix
  }
});
