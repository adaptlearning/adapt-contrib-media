import Adapt from 'core/js/adapt';
import 'libraries/mediaelement-and-player';

/**
 * Fix for firefox fullscreen api
 * https://github.com/adaptlearning/adapt-contrib-media/issues/239
 */
const features = window.mejs.Features;
if (features.hasMozNativeFullScreen) {
  const original = document.mozCancelFullScreen.bind(document);
  document.mozCancelFullScreen = () => {
    if (!document.mozFullScreenElement) return;
    original();
  };
}

/**
 * Force the default language so that the aria-label can be localised from Adapt
 * Note: Do not change these, their names and values are required for mapping in mejs
 */
window.mejs.i18n.lang = 'en-US';
window.mejs.i18n['en-US'] = {};
const ariaLabelMappings = {
  playText: 'Play',
  pauseText: 'Pause',
  stopText: 'Stop',
  audioPlayerText: 'Audio Player',
  videoPlayerText: 'Video Player',
  tracksText: 'Captions/Subtitles',
  timeSliderText: 'Time Slider',
  muteText: 'Mute Toggle',
  unmuteStatusText: 'Unmute',
  muteStatusText: 'Mute',
  volumeSliderText: 'Volume Slider',
  fullscreenText: 'Fullscreen',
  goFullscreenText: 'Go Fullscreen',
  turnOffFullscreenText: 'Turn off Fullscreen',
  noneText: 'None',
  skipBackText: 'Skip back %1 seconds',
  allyVolumeControlText: 'Use Up/Down Arrow keys to increase or decrease volume.',
  progessHelpText: 'Use Left/Right Arrow keys to advance one second, Up/Down arrows to advance ten seconds.'
};

Adapt.on('app:dataReady', () => {
  // Populate the aria labels from the _global._components._media
  const dynamicLabels = window.mejs.i18n['en-US'];
  const fixedDefaults = window.mejs.MepDefaults;
  const globals = Adapt.course.get('_globals')?._components?._media;
  for (const k in ariaLabelMappings) {
    dynamicLabels[ariaLabelMappings[k]] = globals[k] ?? ariaLabelMappings[k];
    fixedDefaults[k] = dynamicLabels[ariaLabelMappings[k]];
  }
});

/**
 * Fullscreen hook
 * Fixes a bug - https://github.com/adaptlearning/adapt_framework/issues/1478
 * where the media player going into/coming out of full-screen mode would trigger inview on
 * components below it; we therefore need to switch off inview when entering full screen mode
 * and switch it back on again after exiting full screen mode
 */
const mepPrototype = Object.assign({}, window.mejs.MediaElementPlayer.prototype);
Object.assign(window.mejs.MediaElementPlayer.prototype, {
  enterFullScreen(...args) {
    $.inview.lock('mediaelement');
    Adapt.trigger('media:fullscreen:enter');
    return mepPrototype.enterFullScreen.call(this, ...args);
  },
  exitFullScreen(...args) {
    setTimeout(() => {
      $.inview.unlock('mediaelement');
      Adapt.trigger('media:fullscreen:exit');
    }, 250);
    return mepPrototype.exitFullScreen.call(this, ...args);
  }
});
