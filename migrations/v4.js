import { describe, whereContent, whereFromPlugin, mutateContent, checkContent, updatePlugin, getCourse, getComponents, testStopWhere, testSuccessWhere } from 'adapt-migrations';
import _ from 'lodash';

describe('Media - v3.0.1 to v4.0.0', async () => {
  let course, courseMediaGlobals, mediaComponents;
  const originalAriaRegion = 'This is a media player component. Select the play / pause button to watch or listen.';

  whereFromPlugin('Media - from v3.0.1', { name: 'adapt-contrib-media', version: '<4.0.0' });

  whereContent('Media - where media', async (content) => {
    mediaComponents = getComponents('media');
    return mediaComponents.length;
  });

  mutateContent('Media - add globals if missing', async (content) => {
    course = getCourse();
    if (!_.has(course, '_globals._components._media')) _.set(course, '_globals._components._media', {});
    courseMediaGlobals = course._globals._components._media;
    if (!_.has(courseMediaGlobals, 'ariaRegion')) courseMediaGlobals.ariaRegion = originalAriaRegion;
    return true;
  });

  mutateContent('Media - modify global ariaRegion attribute default', async (content) => {
    if (courseMediaGlobals.ariaRegion === originalAriaRegion) courseMediaGlobals.ariaRegion = 'Media player{{#any _transcript._inlineTranscript _transcript._externalTranscript}} and transcript{{/any}}.';
    return true;
  });

  mutateContent('Media - delete global transcriptButton attribute', async (content) => {
    delete courseMediaGlobals.transcriptButton;
    return true;
  });

  mutateContent('Media - add global skipToTranscript attribute', async (content) => {
    courseMediaGlobals.skipToTranscript = 'Skip to transcript';
    return true;
  });

  checkContent('Media - check ariaRegion attribute', async (content) => {
    const isValid = courseMediaGlobals.ariaRegion !== originalAriaRegion;
    if (!isValid) throw new Error('Media - ariaRegion attribute incorrect');
    return true;
  });

  checkContent('Media - check global transcriptButton attribute has been removed', async (content) => {
    const isInvalid = _.has(courseMediaGlobals, 'transcriptButton');
    if (isInvalid) throw new Error('Media - transcriptButton attribute still included');
    return true;
  });

  checkContent('Media - check global skipToTranscript attribute has been added', async (content) => {
    const isValid = _.has(courseMediaGlobals, 'skipToTranscript');
    if (!isValid) throw new Error('Media - skipToTranscript attribute missing');
    return true;
  });

  updatePlugin('Media - update to v4.0.0', { name: 'adapt-contrib-media', version: '4.0.0', framework: '>=3.3.0' });

  testSuccessWhere('media components with empty course', {
    fromPlugins: [{ name: 'adapt-contrib-media', version: '3.0.1' }],
    content: [
      { _id: 'c-100', _component: 'media' },
      { _id: 'c-105', _component: 'media' },
      { _type: 'course' }
    ]
  });

  testSuccessWhere('media components with original globals', {
    fromPlugins: [{ name: 'adapt-contrib-media', version: '3.0.1' }],
    content: [
      { _id: 'c-100', _component: 'media' },
      { _id: 'c-105', _component: 'media' },
      { _type: 'course', _globals: { _components: { _media: { ariaRegion: originalAriaRegion, transcriptButton: 'transcript button' } } } }
    ]
  });

  testSuccessWhere('media components with custom globals', {
    fromPlugins: [{ name: 'adapt-contrib-media', version: '3.0.1' }],
    content: [
      { _id: 'c-100', _component: 'media' },
      { _id: 'c-105', _component: 'media' },
      { _type: 'course', _globals: { _components: { _media: { ariaRegion: 'custom ariaRegion', transcriptButton: 'custom transcript button' } } } }
    ]
  });

  testSuccessWhere('media components with empty globals', {
    fromPlugins: [{ name: 'adapt-contrib-media', version: '3.0.1' }],
    content: [
      { _id: 'c-100', _component: 'media' },
      { _id: 'c-105', _component: 'media' },
      { _type: 'course', _globals: { _components: { _media: {} } } }
    ]
  });

  testStopWhere('incorrect version', {
    fromPlugins: [{ name: 'adapt-contrib-media', version: '4.0.0' }]
  });

  testStopWhere('no media components', {
    fromPlugins: [{ name: 'adapt-contrib-media', version: '3.0.1' }],
    content: [{ _component: 'other' }]
  });
});

describe('Media - v4.0.1 to v4.1.0', async () => {
  let mediaComponents;
  whereFromPlugin('Media - from v4.0.1', { name: 'adapt-contrib-media', version: '<4.1.0' });

  whereContent('Media - where media', async (content) => {
    mediaComponents = getComponents('media');
    return mediaComponents.length;
  });

  mutateContent('Media - add _pauseWhenOffScreen attribute to component', async (content) => {
    mediaComponents.forEach(mediaComponent => {
      mediaComponent._pauseWhenOffScreen = false;
    });
    return true;
  });

  checkContent('Media - check _pauseWhenOffScreen attribute', async (content) => {
    const isValid = mediaComponents.every(({ _pauseWhenOffScreen }) => _pauseWhenOffScreen === false);
    if (!isValid) throw new Error('Media - _pauseWhenOffScreen attribute missing');
    return true;
  });

  updatePlugin('Media - update to v4.1.0', { name: 'adapt-contrib-media', version: '4.1.0', framework: '>=3.3.0' });

  testSuccessWhere('correct version with media components', {
    fromPlugins: [{ name: 'adapt-contrib-media', version: '4.0.1' }],
    content: [
      { _id: 'c-100', _component: 'media' },
      { _id: 'c-105', _component: 'media' }
    ]
  });

  testStopWhere('incorrect version', {
    fromPlugins: [{ name: 'adapt-contrib-media', version: '4.1.0' }]
  });

  testStopWhere('no media components', {
    fromPlugins: [{ name: 'adapt-contrib-media', version: '4.0.1' }],
    content: [{ _component: 'other' }]
  });
});
