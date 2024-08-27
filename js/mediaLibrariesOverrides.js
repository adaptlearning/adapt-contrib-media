// import Adapt from 'core/js/adapt';

// /*
//   * Default shortcut keys trap a screen reader user inside the player once in focus. These keys are unnecessary
//   * as one may traverse the player in a linear fashion without needing to know or use shortcut keys. Below is
//   * the removal of the default shortcut keys.
//   *
//   * The default seek interval functions are passed two different data types from mejs which they handle incorrectly. One
//   * is a duration integer the other is the player object. The default functions error on slider key press and so break
//   * accessibility. Below is a correction.
//   */

// Object.assign(window.mejs.MepDefaults, {
//   keyActions: [],
//   defaultSeekForwardInterval: duration => {
//     if (typeof duration === 'object') return duration.duration * 0.05;
//     return duration * 0.05;
//   },
//   defaultSeekBackwardInterval: duration => {
//     if (typeof duration === 'object') return duration.duration * 0.05;
//     return duration * 0.05;
//   }
// });

// /**
//  * Overwrite mediaelement-and-player setTrack to allow use of aria-pressed on closed captions button.
// */

// window.mejs.MediaElementPlayer.prototype.setTrack = function (lang) {

//   const t = this;
//   let i;

//   if (lang === 'none') {
//     t.selectedTrack = null;
//     t.captionsButton.removeClass('mejs__captions-enabled');
//     t.captionsButton[0].firstChild.setAttribute('aria-pressed', false);
//   } else {
//     for (i = 0; i < t.tracks.length; i++) {
//       if (t.tracks[i].srclang === lang) {
//         if (t.selectedTrack === null) {
//           t.captionsButton.addClass('mejs__captions-enabled');
//           t.captionsButton[0].firstChild.setAttribute('aria-pressed', true);
//         }
//         t.selectedTrack = t.tracks[i];
//         t.captions.attr('lang', t.selectedTrack.srclang);
//         t.displayCaptions();
//         break;
//       }
//     }
//   }

// };

/**
 * Overwrite mediaelement-and-player enterFullScreen to remove Chrome <17 bug fix
 * https://github.com/adaptlearning/adapt-contrib-media/issues/255
*/

// window.mejs.MediaElementPlayer.prototype.enterFullScreen = function () {
//   const t = this;

//   if (window.mejs.MediaFeatures.hasiOSFullScreen) {
//     t.media.webkitEnterFullscreen();
//     return;
//   }

//   // set it to not show scroll bars so 100% will work
//   $(document.documentElement).addClass('mejs__fullscreen');

//   // store sizing
//   t.normalHeight = t.container.height();
//   t.normalWidth = t.container.width();

//   // attempt to do true fullscreen
//   if (t.fullscreenMode === 'native-native' || t.fullscreenMode === 'plugin-native') {

//     window.mejs.MediaFeatures.requestFullScreen(t.container[0]);
//   }

//   // make full size
//   t.container
//     .addClass('mejs__container-fullscreen')
//     .width('100%')
//     .height('100%');

//   // Only needed for safari 5.1 native full screen, can cause display issues elsewhere
//   // Actually, it seems to be needed for IE8, too
//   t.containerSizeTimeout = setTimeout(function () {
//     t.container.css({ width: '100%', height: '100%' });
//     t.setControlsSize();
//   }, 500);

//   if (t.media.rendererName === 'native') {
//     t.$media
//       .width('100%')
//       .height('100%');
//   } else {
//     t.container.find('.mejs__shim')
//       .width('100%')
//       .height('100%');

//     setTimeout(function () {
//       const win = $(window);
//       const winW = win.width();
//       const winH = win.height();

//       t.media.setVideoSize(winW, winH);
//     }, 500);
//   }

//   t.layers.children('div')
//     .width('100%')
//     .height('100%');

//   if (t.fullscreenBtn) {
//     t.fullscreenBtn
//       .removeClass('mejs__fullscreen')
//       .addClass('mejs__unfullscreen');
//   }

//   t.setControlsSize();
//   t.isFullScreen = true;

//   t.container.find('.mejs__captions-text').css('font-size', screen.width / t.width * 1.00 * 100 + '%');
//   t.container.find('.mejs__captions-position').css('bottom', '45px');

//   t.container.trigger('enteredfullscreen');
// };

// /**
//  * Force the default language so that the aria-label can be localised from Adapt
//  * Note: Do not change these, their names and values are required for mapping in mejs
//  */
// window.mejs.i18n.locale.language = 'en-US';
// window.mejs.i18n.locale.strings['en-US'] = {};
// const ariaLabelMappings = {
//   playText: 'Play',
//   pauseText: 'Pause',
//   stopText: 'Stop',
//   audioPlayerText: 'Audio Player',
//   videoPlayerText: 'Video Player',
//   tracksText: 'Captions/Subtitles',
//   timeSliderText: 'Time Slider',
//   muteText: 'Mute Toggle',
//   unmuteStatusText: 'Unmute',
//   muteStatusText: 'Mute',
//   volumeSliderText: 'Volume Slider',
//   fullscreenText: 'Fullscreen',
//   goFullscreenText: 'Go Fullscreen',
//   turnOffFullscreenText: 'Turn off Fullscreen',
//   noneText: 'None',
//   skipBackText: 'Skip back %1 seconds',
//   allyVolumeControlText: 'Use Up/Down Arrow keys to increase or decrease volume.',
//   progessHelpText: 'Use Left/Right Arrow keys to advance one second, Up/Down arrows to advance ten seconds.'
// };

// Adapt.on('app:dataReady', () => {
//   // Populate the aria labels from the _global._components._media
//   const dynamicLabels = window.mejs.i18n.locale.strings['en-US'];
//   const fixedDefaults = window.mejs.MepDefaults;
//   const globals = Adapt.course.get('_globals')?._components?._media;
//   for (const k in ariaLabelMappings) {
//     dynamicLabels[ariaLabelMappings[k]] = globals[k] ?? ariaLabelMappings[k];
//     fixedDefaults[k] = dynamicLabels[ariaLabelMappings[k]];
//   }
// });
