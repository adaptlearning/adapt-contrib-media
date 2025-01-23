import { describe, whereContent, whereFromPlugin, mutateContent, checkContent, updatePlugin } from 'adapt-migrations';
let course, mediaComponents;

describe('Media - v5.1.0 to v5.2.0', async () => {
  whereFromPlugin('Media - from v5.1.0', { name: 'adapt-contrib-media', version: '<5.2.0' });
  whereContent('Media - where media', async (content) => {
    mediaComponents = content.filter(({ _component }) => _component === 'media');
    if (mediaComponents) return true;
  });
  mutateContent('Narrative - add _aspectRatio attribute to component', async (content) => {
    mediaComponents.forEach(mediaComponent => {
      mediaComponent._aspectRatio = 'landscape';
    });
    return true;
  });
  checkContent('Media - check _aspectRatio attribute', async (content) => {
    const isValid = mediaComponents.some(({ _aspectRatio }) => _aspectRatio === 'landscape');
    if (!isValid) throw new Error('Media - _aspectRatio attribute missing');
    return true;
  });
  updatePlugin('Media - update to v5.2.0', { name: 'adapt-contrib-media', version: '5.2.0', framework: '>=5.5.0' });
});

describe('Media - v5.5.0 to v5.6.0', async () => {
  let courseMediaGlobals;
  whereFromPlugin('Media - from v5.5.0', { name: 'adapt-contrib-media', version: '<5.6.0' });
  whereContent('Media - where media', async (content) => {
    mediaComponents = content.filter(({ _component }) => _component === 'media');
    if (mediaComponents) return true;
  });
  mutateContent('Media - add globals if missing', async (content) => {
    course = content.find(({ _type }) => _type === 'course');
    if (course?._globals?._components?._media) return true;

    course._globals._components = course._globals._components || {};
    courseMediaGlobals = course._globals._components._media = {};
    return true;
  });
  mutateContent('Narrative - add global playText attribute', async (content) => {
    courseMediaGlobals.playText = 'Play';
    return true;
  });
  mutateContent('Narrative - add global pauseText attribute', async (content) => {
    courseMediaGlobals.pauseText = 'Pause';
    return true;
  });
  mutateContent('Narrative - add global stopText attribute', async (content) => {
    courseMediaGlobals.stopText = 'Stop';
    return true;
  });
  mutateContent('Narrative - add global audioPlayerText attribute', async (content) => {
    courseMediaGlobals.audioPlayerText = 'Audio Player';
    return true;
  });
  mutateContent('Narrative - add global videoPlayerText attribute', async (content) => {
    courseMediaGlobals.videoPlayerText = 'Video Player';
    return true;
  });
  mutateContent('Narrative - add global tracksText attribute', async (content) => {
    courseMediaGlobals.tracksText = 'Captions/Subtitles';
    return true;
  });
  mutateContent('Narrative - add global timeSliderText attribute', async (content) => {
    courseMediaGlobals.timeSliderText = 'Time Slider';
    return true;
  });
  mutateContent('Narrative - add global muteText attribute', async (content) => {
    courseMediaGlobals.muteText = 'Mute Toggle';
    return true;
  });
  mutateContent('Narrative - add global unmuteStatusText attribute', async (content) => {
    courseMediaGlobals.unmuteStatusText = 'Unmute';
    return true;
  });
  mutateContent('Narrative - add global muteStatusText attribute', async (content) => {
    courseMediaGlobals.muteStatusText = 'Mute';
    return true;
  });
  mutateContent('Narrative - add global volumeSliderText attribute', async (content) => {
    courseMediaGlobals.volumeSliderText = 'Volume Slider';
    return true;
  });
  mutateContent('Narrative - add global fullscreenText attribute', async (content) => {
    courseMediaGlobals.fullscreenText = 'Fullscreen';
    return true;
  });
  mutateContent('Narrative - add global goFullscreenText attribute', async (content) => {
    courseMediaGlobals.goFullscreenText = 'Go Fullscreen';
    return true;
  });
  mutateContent('Narrative - add global turnOffFullscreenText attribute', async (content) => {
    courseMediaGlobals.turnOffFullscreenText = 'Turn off Fullscreen';
    return true;
  });
  mutateContent('Narrative - add global noneText attribute', async (content) => {
    courseMediaGlobals.noneText = 'None';
    return true;
  });
  mutateContent('Narrative - add global skipBackText attribute', async (content) => {
    courseMediaGlobals.skipBackText = 'Skip back %1 seconds';
    return true;
  });
  mutateContent('Narrative - add global allyVolumeControlText attribute', async (content) => {
    courseMediaGlobals.allyVolumeControlText = 'Use Up/Down Arrow keys to increase or decrease volume.';
    return true;
  });
  mutateContent('Narrative - add global progessHelpText attribute', async (content) => {
    courseMediaGlobals.progessHelpText = 'Use Left/Right Arrow keys to advance one second, Up/Down arrows to advance ten seconds.';
    return true;
  });

  // Check contents
  checkContent('Media - check global playText attribute', async (content) => {
    const isValid = 'playText' in courseMediaGlobals;
    if (!isValid) throw new Error('Media - global playText attribute missing');
    return true;
  });
  checkContent('Media - check global pauseText attribute', async (content) => {
    const isValid = 'pauseText' in courseMediaGlobals;
    if (!isValid) throw new Error('Media - global pauseText attribute missing');
    return true;
  });
  checkContent('Media - check global stopText attribute', async (content) => {
    const isValid = 'stopText' in courseMediaGlobals;
    if (!isValid) throw new Error('Media - global stopText attribute missing');
    return true;
  });
  checkContent('Media - check global audioPlayerText attribute', async (content) => {
    const isValid = 'audioPlayerText' in courseMediaGlobals;
    if (!isValid) throw new Error('Media - global audioPlayerText attribute missing');
    return true;
  });
  checkContent('Media - check global videoPlayerText attribute', async (content) => {
    const isValid = 'videoPlayerText' in courseMediaGlobals;
    if (!isValid) throw new Error('Media - global videoPlayerText attribute missing');
    return true;
  });
  checkContent('Media - check global tracksText attribute', async (content) => {
    const isValid = 'tracksText' in courseMediaGlobals;
    if (!isValid) throw new Error('Media - global tracksText attribute missing');
    return true;
  });
  checkContent('Media - check global timeSliderText attribute', async (content) => {
    const isValid = 'timeSliderText' in courseMediaGlobals;
    if (!isValid) throw new Error('Media - global timeSliderText attribute missing');
    return true;
  });
  checkContent('Media - check global muteText attribute', async (content) => {
    const isValid = 'muteText' in courseMediaGlobals;
    if (!isValid) throw new Error('Media - global muteText attribute missing');
    return true;
  });
  checkContent('Media - check global unmuteStatusText attribute', async (content) => {
    const isValid = 'unmuteStatusText' in courseMediaGlobals;
    if (!isValid) throw new Error('Media - global unmuteStatusText attribute missing');
    return true;
  });
  checkContent('Media - check global muteStatusText attribute', async (content) => {
    const isValid = 'muteStatusText' in courseMediaGlobals;
    if (!isValid) throw new Error('Media - global muteStatusText attribute missing');
    return true;
  });
  checkContent('Media - check global volumeSliderText attribute', async (content) => {
    const isValid = 'volumeSliderText' in courseMediaGlobals;
    if (!isValid) throw new Error('Media - global volumeSliderText attribute missing');
    return true;
  });
  checkContent('Media - check global fullscreenText attribute', async (content) => {
    const isValid = 'fullscreenText' in courseMediaGlobals;
    if (!isValid) throw new Error('Media - global fullscreenText attribute missing');
    return true;
  });
  checkContent('Media - check global goFullscreenText attribute', async (content) => {
    const isValid = 'goFullscreenText' in courseMediaGlobals;
    if (!isValid) throw new Error('Media - global goFullscreenText attribute missing');
    return true;
  });
  checkContent('Media - check global turnOffFullscreenText attribute', async (content) => {
    const isValid = 'turnOffFullscreenText' in courseMediaGlobals;
    if (!isValid) throw new Error('Media - global turnOffFullscreenText attribute missing');
    return true;
  });
  checkContent('Media - check global noneText attribute', async (content) => {
    const isValid = 'noneText' in courseMediaGlobals;
    if (!isValid) throw new Error('Media - global noneText attribute missing');
    return true;
  });
  checkContent('Media - check global skipBackText attribute', async (content) => {
    const isValid = 'skipBackText' in courseMediaGlobals;
    if (!isValid) throw new Error('Media - global skipBackText attribute missing');
    return true;
  });
  checkContent('Media - check global allyVolumeControlText attribute', async (content) => {
    const isValid = 'allyVolumeControlText' in courseMediaGlobals;
    if (!isValid) throw new Error('Media - global allyVolumeControlText attribute missing');
    return true;
  });
  checkContent('Media - check global progessHelpText attribute', async (content) => {
    const isValid = 'progessHelpText' in courseMediaGlobals;
    if (!isValid) throw new Error('Media - global progessHelpText attribute missing');
    return true;
  });

  updatePlugin('Media - update to v5.6.0', { name: 'adapt-contrib-media', version: '5.6.0', framework: '>=5.17.2' });
});
