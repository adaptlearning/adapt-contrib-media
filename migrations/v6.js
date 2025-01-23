import { describe, whereContent, whereFromPlugin, mutateContent, checkContent, updatePlugin } from 'adapt-migrations';
let mediaComponents;

describe('Media - v6.4.4 to v6.4.5', async () => {
  whereFromPlugin('Media - from v6.4.4', { name: 'adapt-contrib-media', version: '<6.4.5' });
  whereContent('Media - where media', async (content) => {
    mediaComponents = content.filter(({ _component }) => _component === 'media');
    if (mediaComponents) return true;
  });
  mutateContent('Media - update default instruction text', async (content) => {
    mediaComponents.forEach(mediaComponent => {
      mediaComponent._offsetMediaControls = false;
    });
    return true;
  });
  checkContent('Media - check default mobileInstruction text', async (content) => {
    const isInvalid = mediaComponents.some(({ _offsetMediaControls }) => _offsetMediaControls === false);
    if (!isInvalid) throw new Error('Media - default mobile instruction is invalid');
    return true;
  });
  updatePlugin('Media - update to v6.4.5', { name: 'adapt-contrib-media', version: '6.4.5', framework: '>=5.19.1' });
});
