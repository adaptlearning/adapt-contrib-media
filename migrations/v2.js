import { describe, whereContent, whereFromPlugin, mutateContent, checkContent, updatePlugin } from 'adapt-migrations';
let course, courseMediaGlobals, mediaComponents;

describe('Media - v2.0.6 to v2.1.0', async () => {
  whereFromPlugin('Media - from v2.0.6', { name: 'adapt-contrib-media', version: '<2.1.0' });
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
  mutateContent('Narrative - modify global ariaRegion attribute default', async (content) => {
    if (courseMediaGlobals.ariaRegion === originalAriaRegion) courseMediaGlobals.ariaRegion = 'Media player{{#any _transcript._inlineTranscript _transcript._externalTranscript}} and transcript{{/any}}.';
    return true;
  });
  checkContent('Media - check _pauseWhenOffScreen attribute', async (content) => {
    const isValid = courseMediaGlobals.filter(({ ariaRegion }) => ariaRegion === originalAriaRegion);
    if (!isValid) throw new Error('Media - _pauseWhenOffScreen attribute missing');
    return true;
  });
  updatePlugin('Media - update to v4.1.0', { name: 'adapt-contrib-media', version: '4.0.0', framework: '>=3.3.0' });
});
