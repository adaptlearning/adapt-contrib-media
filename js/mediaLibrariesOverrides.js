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
  const globals = Adapt.course.get('_globals')?._components?._media ?? {};
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

/**
 * Keyboard and screen reader fixes for the captions and speed menus
 * https://github.com/adaptlearning/adapt-contrib-media/issues/372
 * https://github.com/adaptlearning/adapt-contrib-media/issues/376
 * Applied once all features are built, because the speed plugin loads after this file.
 */
const { buildfeatures: mepBuildFeatures } = window.mejs.MediaElementPlayer.prototype;
Object.assign(window.mejs.MediaElementPlayer.prototype, {
  buildfeatures(...args) {
    const result = mepBuildFeatures.call(this, ...args);
    fixCaptionsMenu(this);
    if (this.speedButton) addMenuKeys(this.speedButton, this.speedSelector);
    return result;
  }
});

function fixCaptionsMenu(player) {
  const prefix = player.options.classPrefix;
  const button = player.captionsButton;
  const menu = button?.querySelector(`.${prefix}captions-selector`);
  if (!menu) return;
  const inputs = menu.querySelectorAll('input');
  // Each track's label points at its <track> element instead of its radio, leaving the radio unnamed
  inputs.forEach(input => {
    const label = input.parentNode.querySelector('label');
    if (label) label.htmlFor = input.id;
  });
  const isToggle = button.classList.contains(`${prefix}captions-button-toggle`);
  if (!isToggle) {
    addMenuKeys(button, menu);
    return;
  }
  // The button switches captions on and off itself, so its language list is never used
  menu.setAttribute('aria-hidden', 'true');
  inputs.forEach(input => input.setAttribute('tabindex', '-1'));
}

/**
 * MediaElement opens these menus on hover and focus, but gives their buttons no keys.
 * Enter, Space and the up and down arrows move focus to the selected option, where the arrows
 * would otherwise change the volume. Escape closes the menu and returns focus to its button.
 * @param {HTMLElement} control Element holding both the button and its menu
 * @param {HTMLElement} menu
 */
function addMenuKeys(control, menu) {
  const button = control.querySelector('button');
  const close = () => {
    control.classList.add('is-menu-closed');
    button.focus();
  };
  const open = () => control.classList.remove('is-menu-closed');
  button.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      close();
      return;
    }
    if (!['Enter', ' ', 'ArrowUp', 'ArrowDown'].includes(event.key)) return;
    event.preventDefault();
    event.stopPropagation();
    open();
    (menu.querySelector('input:checked') || menu.querySelector('input'))?.focus();
  });
  menu.addEventListener('keydown', event => {
    if (event.key === 'Escape') close();
  });
  control.addEventListener('focusout', event => {
    if (!control.contains(event.relatedTarget)) open();
  });
  control.addEventListener('mouseenter', open);
}
