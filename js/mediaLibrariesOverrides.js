import Adapt from 'core/js/adapt';

/*
  * Default shortcut keys trap a screen reader user inside the player once in focus. These keys are unnecessary
  * as one may traverse the player in a linear fashion without needing to know or use shortcut keys. Below is
  * the removal of the default shortcut keys.
  *
  * The default seek interval functions are passed two different data types from mejs which they handle incorrectly. One
  * is a duration integer the other is the player object. The default functions error on slider key press and so break
  * accessibility. Below is a correction.
  */

Object.assign(window.mejs.MepDefaults, {
  keyActions: [],
  defaultSeekForwardInterval: duration => {
    if (typeof duration === 'object') return duration.duration * 0.05;
    return duration * 0.05;
  },
  defaultSeekBackwardInterval: duration => {
    if (typeof duration === 'object') return duration.duration * 0.05;
    return duration * 0.05;
  }
});

// The following function is used to to prevent a memory leak in Internet Explorer
// See: http://javascript.crockford.com/memory/leak.html
window.mejs.purge = function (d) {
  let a = d.attributes;
  if (a) {
    for (let i = a.length - 1; i >= 0; i -= 1) {
      const n = a[i].name;
      if (typeof d[n] === 'function') {
        d[n] = null;
      }
    }
  }
  a = d.childNodes;
  if (a) {
    for (let i = 0, count = a.length; i < count; i += 1) {
      window.mejs.purge(d.childNodes[i]);
    }
  }
};

/**
 * Overwrite mediaelement-and-player killContextMenuTimer to remove global delete
*/
window.mejs.MediaElementPlayer.prototype.killContextMenuTimer = function () {
  let timer = this.contextMenuTimer;

  //

  if (timer != null) {
    clearTimeout(timer);
    timer = null;
  }
};

/**
 * Overwrite mediaelement-and-player buildfullscreen to remove global delete
*/
window.mejs.MediaElementPlayer.prototype.buildfullscreen = function (player, controls, layers, media) {

  if (!player.isVideo) { return; }

  player.isInIframe = (window.location !== window.parent.location);

  // detect on start
  media.addEventListener('play', function () { player.detectFullscreenMode(); });

  // build button
  const t = this;
  let hideTimeout = null;
  const fullscreenBtn =
      $('<div class="mejs-button mejs-fullscreen-button">' +
        '<button type="button" aria-controls="' + t.id + '" title="' + t.options.fullscreenText + '" aria-label="' + t.options.fullscreenText + '"></button>' +
        '</div>')
        .appendTo(controls)
        .on('click', function () {

          // toggle fullscreen
          const isFullScreen = (window.mejs.MediaFeatures.hasTrueNativeFullScreen && window.mejs.MediaFeatures.isFullScreen()) || player.isFullScreen;

          if (isFullScreen) {
            player.exitFullScreen();
          } else {
            player.enterFullScreen();
          }
        })
        .on('mouseover', function () {

          // very old browsers with a plugin
          if (t.fullscreenMode === 'plugin-hover') {
            if (hideTimeout !== null) {
              clearTimeout(hideTimeout);
            }

            const buttonPos = fullscreenBtn.offset();
            const containerPos = player.container.offset();

            media.positionFullscreenButton(buttonPos.left - containerPos.left, buttonPos.top - containerPos.top, true);
          }

        })
        .on('mouseout', function () {

          if (t.fullscreenMode === 'plugin-hover') {
            if (hideTimeout !== null) {
              clearTimeout(hideTimeout);
            }

            hideTimeout = setTimeout(function () {
              media.hideFullscreenButton();
            }, 1500);
          }

        });

  player.fullscreenBtn = fullscreenBtn;

  t.globalBind('keydown', function (e) {
    if (e.keyCode === 27 && ((window.mejs.MediaFeatures.hasTrueNativeFullScreen && window.mejs.MediaFeatures.isFullScreen()) || t.isFullScreen)) {
      player.exitFullScreen();
    }
  });

  t.normalHeight = 0;
  t.normalWidth = 0;

  // setup native fullscreen event
  if (window.mejs.MediaFeatures.hasTrueNativeFullScreen) {

    // chrome doesn't alays fire this in an iframe
    const fullscreenChanged = function (e) {
      if (player.isFullScreen) {
        if (window.mejs.MediaFeatures.isFullScreen()) {
          player.isNativeFullScreen = true;
          // reset the controls once we are fully in full screen
          player.setControlsSize();
        } else {
          player.isNativeFullScreen = false;
          // when a user presses ESC
          // make sure to put the player back into place
          player.exitFullScreen();
        }
      }
    };

    player.globalBind(window.mejs.MediaFeatures.fullScreenEventName, fullscreenChanged);
  }

};

/**
 * Overwrite mediaelement-and-player setTrack to allow use of aria-pressed on closed captions button.
*/

window.mejs.MediaElementPlayer.prototype.setTrack = function (lang) {

  const t = this;
  let i;

  if (lang === 'none') {
    t.selectedTrack = null;
    t.captionsButton.removeClass('mejs-captions-enabled');
    t.captionsButton[0].firstChild.setAttribute('aria-pressed', false);
  } else {
    for (i = 0; i < t.tracks.length; i++) {
      if (t.tracks[i].srclang === lang) {
        if (t.selectedTrack === null) {
          t.captionsButton.addClass('mejs-captions-enabled');
          t.captionsButton[0].firstChild.setAttribute('aria-pressed', true);
        }
        t.selectedTrack = t.tracks[i];
        t.captions.attr('lang', t.selectedTrack.srclang);
        t.displayCaptions();
        break;
      }
    }
  }

};

/**
 * Overwrite mediaelement-and-player enterFullScreen to remove Chrome <17 bug fix (Media issue #255)
*/

window.mejs.MediaElementPlayer.prototype.enterFullScreen = function () {
  const t = this;

  if (window.mejs.MediaFeatures.hasiOSFullScreen) {
    t.media.webkitEnterFullscreen();
    return;
  }

  // set it to not show scroll bars so 100% will work
  $(document.documentElement).addClass('mejs-fullscreen');

  // store sizing
  t.normalHeight = t.container.height();
  t.normalWidth = t.container.width();

  // attempt to do true fullscreen
  if (t.fullscreenMode === 'native-native' || t.fullscreenMode === 'plugin-native') {

    window.mejs.MediaFeatures.requestFullScreen(t.container[0]);
  }

  // make full size
  t.container
    .addClass('mejs-container-fullscreen')
    .width('100%')
    .height('100%');

  // Only needed for safari 5.1 native full screen, can cause display issues elsewhere
  // Actually, it seems to be needed for IE8, too
  t.containerSizeTimeout = setTimeout(function () {
    t.container.css({ width: '100%', height: '100%' });
    t.setControlsSize();
  }, 500);

  if (t.media.pluginType === 'native') {
    t.$media
      .width('100%')
      .height('100%');
  } else {
    t.container.find('.mejs-shim')
      .width('100%')
      .height('100%');

    setTimeout(function () {
      const win = $(window);
      const winW = win.width();
      const winH = win.height();

      t.media.setVideoSize(winW, winH);
    }, 500);
  }

  t.layers.children('div')
    .width('100%')
    .height('100%');

  if (t.fullscreenBtn) {
    t.fullscreenBtn
      .removeClass('mejs-fullscreen')
      .addClass('mejs-unfullscreen');
  }

  t.setControlsSize();
  t.isFullScreen = true;

  t.container.find('.mejs-captions-text').css('font-size', screen.width / t.width * 1.00 * 100 + '%');
  t.container.find('.mejs-captions-position').css('bottom', '45px');

  t.container.trigger('enteredfullscreen');
};

/**
 * Force the default language so that the aria-label can be localised from Adapt
 * Note: Do not change these, their names and values are required for mapping in mejs
 */
window.mejs.i18n.locale.language = 'en-US';
window.mejs.i18n.locale.strings['en-US'] = {};
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
  const dynamicLabels = window.mejs.i18n.locale.strings['en-US'];
  const fixedDefaults = window.mejs.MepDefaults;
  const globals = Adapt.course.get('_globals')?._components?._media;
  for (const k in ariaLabelMappings) {
    dynamicLabels[ariaLabelMappings[k]] = globals[k] ?? ariaLabelMappings[k];
    fixedDefaults[k] = dynamicLabels[ariaLabelMappings[k]];
  }
});
