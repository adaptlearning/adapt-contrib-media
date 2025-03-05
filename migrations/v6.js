import { describe, whereContent, whereFromPlugin, mutateContent, checkContent, updatePlugin, getComponents, testStopWhere, testSuccessWhere } from 'adapt-migrations';

describe('Media - v6.1.2 to v6.2.0', async () => {
  let mediaComponents;
  const originalInstruction = '';
  const newInstruction = 'Select the play button to start the video.';

  whereFromPlugin('Media - from v6.1.2', { name: 'adapt-contrib-media', version: '<6.2.0' });

  whereContent('Media - where media', async (content) => {
    mediaComponents = getComponents('media');
    return mediaComponents.length;
  });

  mutateContent('Media - modify default instruction text', async (content) => {
    mediaComponents.forEach(mediaComponent => {
      if (mediaComponent.instruction === originalInstruction) mediaComponent.instruction = newInstruction;
    });
    return true;
  });

  checkContent('Media - check default instruction text', async (content) => {
    const isInvalid = mediaComponents.find(({ instruction }) => instruction === originalInstruction);
    if (isInvalid) throw new Error('Media - default instruction is invalid');
    return true;
  });

  updatePlugin('Media - update to v6.2.0', { name: 'adapt-contrib-media', version: '6.2.0', framework: '>=5.19.1' });

  testSuccessWhere('media components with custom/original/no instruction', {
    fromPlugins: [{ name: 'adapt-contrib-media', version: '6.1.2' }],
    content: [
      { _id: 'c-100', _component: 'media' },
      { _id: 'c-105', _component: 'media', instruction: originalInstruction },
      { _id: 'c-110', _component: 'media', instruction: 'custom instruction' }
    ]
  });

  testStopWhere('incorrect version', {
    fromPlugins: [{ name: 'adapt-contrib-media', version: '6.2.0' }]
  });

  testStopWhere('no media components', {
    fromPlugins: [{ name: 'adapt-contrib-media', version: '6.1.2' }],
    content: [{ _component: 'other' }]
  });
});

describe('Media - v6.4.4 to v6.4.5', async () => {
  let mediaComponents;

  whereFromPlugin('Media - from v6.4.4', { name: 'adapt-contrib-media', version: '<6.4.5' });

  whereContent('Media - where media', async (content) => {
    mediaComponents = getComponents('media');
    return mediaComponents.length;
  });

  mutateContent('Media - add _offsetMediaControls', async (content) => {
    mediaComponents.forEach(mediaComponent => {
      mediaComponent._offsetMediaControls = false;
    });
    return true;
  });

  checkContent('Media - check default _offsetMediaControls', async (content) => {
    const isInvalid = mediaComponents.every(({ _offsetMediaControls }) => _offsetMediaControls === false);
    if (!isInvalid) throw new Error('Media - default mobile instruction is invalid');
    return true;
  });

  updatePlugin('Media - update to v6.4.5', { name: 'adapt-contrib-media', version: '6.4.5', framework: '>=5.19.1' });

  testSuccessWhere('correct version with media components', {
    fromPlugins: [{ name: 'adapt-contrib-media', version: '6.4.4' }],
    content: [
      { _id: 'c-100', _component: 'media' },
      { _id: 'c-105', _component: 'media' }
    ]
  });

  testStopWhere('incorrect version', {
    fromPlugins: [{ name: 'adapt-contrib-media', version: '6.4.5' }]
  });

  testStopWhere('no media components', {
    fromPlugins: [{ name: 'adapt-contrib-media', version: '6.4.4' }],
    content: [{ _component: 'other' }]
  });
});
