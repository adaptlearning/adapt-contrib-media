import { describe, whereContent, whereFromPlugin, mutateContent, checkContent, updatePlugin } from 'adapt-migrations';
let course, courseMediaGlobals, mediaComponents;

describe('Media - v3.0.1 to v4.0.0', async () => {
  const originalAriaRegion = 'This is a media player component. Select the play / pause button to watch or listen.';
  whereFromPlugin('Media - from v3.0.1', { name: 'adapt-contrib-media', version: '<4.0.0' });
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
    const isInvalid = Object.hasOwn(courseMediaGlobals, 'transcriptButton');
    if (isInvalid) throw new Error('Media - transcriptButton attribute still included');
    return true;
  });
  checkContent('Media - check global skipToTranscript attribute has been added', async (content) => {
    const isValid = Object.hasOwn(courseMediaGlobals, 'skipToTranscript');
    if (!isValid) throw new Error('Media - skipToTranscript attribute missing');
    return true;
  });
  updatePlugin('Media - update to v4.1.0', { name: 'adapt-contrib-media', version: '4.0.0', framework: '>=3.3.0' });
});

describe('Media - v4.0.1 to v4.1.0', async () => {
  whereFromPlugin('Media - from v4.0.1', { name: 'adapt-contrib-media', version: '<4.1.0' });
  whereContent('Media - where media', async (content) => {
    mediaComponents = content.filter(({ _component }) => _component === 'media');
    if (mediaComponents) return true;
  });
  mutateContent('Media - add _pauseWhenOffScreen attribute to component', async (content) => {
    mediaComponents.forEach(mediaComponent => {
      mediaComponent._pauseWhenOffScreen = false;
    });
    return true;
  });
  checkContent('Media - check _pauseWhenOffScreen attribute', async (content) => {
    const isValid = mediaComponents.some(({ _pauseWhenOffScreen }) => _pauseWhenOffScreen === false);
    if (!isValid) throw new Error('Media - _pauseWhenOffScreen attribute missing');
    return true;
  });
  updatePlugin('Media - update to v4.1.0', { name: 'adapt-contrib-media', version: '4.1.0', framework: '>=3.3.0' });
});
