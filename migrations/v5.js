import { describe, whereContent, whereFromPlugin, mutateContent, checkContent, updatePlugin, getComponents, getCourse, testStopWhere, testSuccessWhere } from 'adapt-migrations';
import _ from 'lodash';

describe('Media - v5.1.0 to v5.2.0', async () => {
  let mediaComponents;

  whereFromPlugin('Media - from v5.1.0', { name: 'adapt-contrib-media', version: '<5.2.0' });

  whereContent('Media - where media', async (content) => {
    mediaComponents = getComponents('media');
    return mediaComponents.length;
  });

  mutateContent('Media - add _aspectRatio attribute to component', async (content) => {
    mediaComponents.forEach(mediaComponent => {
      mediaComponent._aspectRatio = 'landscape';
    });
    return true;
  });

  checkContent('Media - check _aspectRatio attribute', async (content) => {
    const isValid = mediaComponents.every(({ _aspectRatio }) => _aspectRatio === 'landscape');
    if (!isValid) throw new Error('Media - _aspectRatio attribute missing');
    return true;
  });

  updatePlugin('Media - update to v5.2.0', { name: 'adapt-contrib-media', version: '5.2.0', framework: '>=5.5.0' });

  testSuccessWhere('correct version with media components', {
    fromPlugins: [{ name: 'adapt-contrib-media', version: '5.1.0' }],
    content: [
      { _id: 'c-100', _component: 'media' },
      { _id: 'c-105', _component: 'media' }
    ]
  });

  testStopWhere('incorrect version', {
    fromPlugins: [{ name: 'adapt-contrib-media', version: '5.2.0' }]
  });

  testStopWhere('no media components', {
    fromPlugins: [{ name: 'adapt-contrib-media', version: '5.1.0' }],
    content: [{ _component: 'other' }]
  });
});

describe('Media - v5.5.0 to v5.6.0', async () => {
  let courseMediaGlobals, course, mediaComponents;

  whereFromPlugin('Media - from v5.5.0', { name: 'adapt-contrib-media', version: '<5.6.0' });

  whereContent('Media - where media', async (content) => {
    mediaComponents = getComponents('media');
    return mediaComponents.length;
  });

  mutateContent('Media - add globals if missing', async (content) => {
    course = getCourse();
    if (!_.has(course, '_globals._components._media')) _.set(course, '_globals._components._media', {});
    courseMediaGlobals = course._globals._components._media;
    return true;
  });

  mutateContent('Media - add global playText attribute', async (content) => {
    courseMediaGlobals.playText = 'Play';
    return true;
  });

  mutateContent('Media - add global pauseText attribute', async (content) => {
    courseMediaGlobals.pauseText = 'Pause';
    return true;
  });

  mutateContent('Media - add global stopText attribute', async (content) => {
    courseMediaGlobals.stopText = 'Stop';
    return true;
  });

  mutateContent('Media - add global audioPlayerText attribute', async (content) => {
    courseMediaGlobals.audioPlayerText = 'Audio Player';
    return true;
  });

  mutateContent('Media - add global videoPlayerText attribute', async (content) => {
    courseMediaGlobals.videoPlayerText = 'Video Player';
    return true;
  });

  mutateContent('Media - add global tracksText attribute', async (content) => {
    courseMediaGlobals.tracksText = 'Captions/Subtitles';
    return true;
  });

  mutateContent('Media - add global timeSliderText attribute', async (content) => {
    courseMediaGlobals.timeSliderText = 'Time Slider';
    return true;
  });

  mutateContent('Media - add global muteText attribute', async (content) => {
    courseMediaGlobals.muteText = 'Mute Toggle';
    return true;
  });

  mutateContent('Media - add global unmuteStatusText attribute', async (content) => {
    courseMediaGlobals.unmuteStatusText = 'Unmute';
    return true;
  });

  mutateContent('Media - add global muteStatusText attribute', async (content) => {
    courseMediaGlobals.muteStatusText = 'Mute';
    return true;
  });

  mutateContent('Media - add global volumeSliderText attribute', async (content) => {
    courseMediaGlobals.volumeSliderText = 'Volume Slider';
    return true;
  });

  mutateContent('Media - add global fullscreenText attribute', async (content) => {
    courseMediaGlobals.fullscreenText = 'Fullscreen';
    return true;
  });

  mutateContent('Media - add global goFullscreenText attribute', async (content) => {
    courseMediaGlobals.goFullscreenText = 'Go Fullscreen';
    return true;
  });

  mutateContent('Media - add global turnOffFullscreenText attribute', async (content) => {
    courseMediaGlobals.turnOffFullscreenText = 'Turn off Fullscreen';
    return true;
  });

  mutateContent('Media - add global noneText attribute', async (content) => {
    courseMediaGlobals.noneText = 'None';
    return true;
  });

  mutateContent('Media - add global skipBackText attribute', async (content) => {
    courseMediaGlobals.skipBackText = 'Skip back %1 seconds';
    return true;
  });

  mutateContent('Media - add global allyVolumeControlText attribute', async (content) => {
    courseMediaGlobals.allyVolumeControlText = 'Use Up/Down Arrow keys to increase or decrease volume.';
    return true;
  });

  mutateContent('Media - add global progessHelpText attribute', async (content) => {
    courseMediaGlobals.progessHelpText = 'Use Left/Right Arrow keys to advance one second, Up/Down arrows to advance ten seconds.';
    return true;
  });

  checkContent('Media - check global playText attribute', async (content) => {
    const isValid = _.has(courseMediaGlobals, 'playText');
    if (!isValid) throw new Error('Media - global playText attribute missing');
    return true;
  });

  checkContent('Media - check global pauseText attribute', async (content) => {
    const isValid = _.has(courseMediaGlobals, 'pauseText');
    if (!isValid) throw new Error('Media - global pauseText attribute missing');
    return true;
  });

  checkContent('Media - check global stopText attribute', async (content) => {
    const isValid = _.has(courseMediaGlobals, 'stopText');
    if (!isValid) throw new Error('Media - global stopText attribute missing');
    return true;
  });

  checkContent('Media - check global audioPlayerText attribute', async (content) => {
    const isValid = _.has(courseMediaGlobals, 'audioPlayerText');
    if (!isValid) throw new Error('Media - global audioPlayerText attribute missing');
    return true;
  });

  checkContent('Media - check global videoPlayerText attribute', async (content) => {
    const isValid = _.has(courseMediaGlobals, 'videoPlayerText');
    if (!isValid) throw new Error('Media - global videoPlayerText attribute missing');
    return true;
  });

  checkContent('Media - check global tracksText attribute', async (content) => {
    const isValid = _.has(courseMediaGlobals, 'tracksText');
    if (!isValid) throw new Error('Media - global tracksText attribute missing');
    return true;
  });

  checkContent('Media - check global timeSliderText attribute', async (content) => {
    const isValid = _.has(courseMediaGlobals, 'timeSliderText');
    if (!isValid) throw new Error('Media - global timeSliderText attribute missing');
    return true;
  });

  checkContent('Media - check global muteText attribute', async (content) => {
    const isValid = _.has(courseMediaGlobals, 'muteText');
    if (!isValid) throw new Error('Media - global muteText attribute missing');
    return true;
  });

  checkContent('Media - check global unmuteStatusText attribute', async (content) => {
    const isValid = _.has(courseMediaGlobals, 'unmuteStatusText');
    if (!isValid) throw new Error('Media - global unmuteStatusText attribute missing');
    return true;
  });

  checkContent('Media - check global muteStatusText attribute', async (content) => {
    const isValid = _.has(courseMediaGlobals, 'muteStatusText');
    if (!isValid) throw new Error('Media - global muteStatusText attribute missing');
    return true;
  });

  checkContent('Media - check global volumeSliderText attribute', async (content) => {
    const isValid = _.has(courseMediaGlobals, 'volumeSliderText');
    if (!isValid) throw new Error('Media - global volumeSliderText attribute missing');
    return true;
  });

  checkContent('Media - check global fullscreenText attribute', async (content) => {
    const isValid = _.has(courseMediaGlobals, 'fullscreenText');
    if (!isValid) throw new Error('Media - global fullscreenText attribute missing');
    return true;
  });

  checkContent('Media - check global goFullscreenText attribute', async (content) => {
    const isValid = _.has(courseMediaGlobals, 'goFullscreenText');
    if (!isValid) throw new Error('Media - global goFullscreenText attribute missing');
    return true;
  });

  checkContent('Media - check global turnOffFullscreenText attribute', async (content) => {
    const isValid = _.has(courseMediaGlobals, 'turnOffFullscreenText');
    if (!isValid) throw new Error('Media - global turnOffFullscreenText attribute missing');
    return true;
  });

  checkContent('Media - check global noneText attribute', async (content) => {
    const isValid = _.has(courseMediaGlobals, 'noneText');
    if (!isValid) throw new Error('Media - global noneText attribute missing');
    return true;
  });

  checkContent('Media - check global skipBackText attribute', async (content) => {
    const isValid = _.has(courseMediaGlobals, 'skipBackText');
    if (!isValid) throw new Error('Media - global skipBackText attribute missing');
    return true;
  });

  checkContent('Media - check global allyVolumeControlText attribute', async (content) => {
    const isValid = _.has(courseMediaGlobals, 'allyVolumeControlText');
    if (!isValid) throw new Error('Media - global allyVolumeControlText attribute missing');
    return true;
  });

  checkContent('Media - check global progessHelpText attribute', async (content) => {
    const isValid = _.has(courseMediaGlobals, 'progessHelpText');
    if (!isValid) throw new Error('Media - global progessHelpText attribute missing');
    return true;
  });

  updatePlugin('Media - update to v5.6.0', { name: 'adapt-contrib-media', version: '5.6.0', framework: '>=5.17.2' });

  testSuccessWhere('media components with empty course', {
    fromPlugins: [{ name: 'adapt-contrib-media', version: '5.5.0' }],
    content: [
      { _id: 'c-100', _component: 'media' },
      { _id: 'c-105', _component: 'media' },
      { _type: 'course' }
    ]
  });

  testSuccessWhere('media components with globals', {
    fromPlugins: [{ name: 'adapt-contrib-media', version: '5.5.0' }],
    content: [
      { _id: 'c-100', _component: 'media' },
      { _id: 'c-105', _component: 'media' },
      { _type: 'course', _globals: { _components: { _media: {} } } }
    ]
  });

  testStopWhere('incorrect version', {
    fromPlugins: [{ name: 'adapt-contrib-media', version: '5.6.0' }]
  });

  testStopWhere('no media components', {
    fromPlugins: [{ name: 'adapt-contrib-media', version: '5.5.0' }],
    content: [{ _component: 'other' }]
  });
});
