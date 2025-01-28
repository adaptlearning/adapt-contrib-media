import { describe, whereContent, whereFromPlugin, mutateContent, checkContent, updatePlugin } from 'adapt-migrations';

describe('Media - v2.0.5 to v2.0.6', async () => {
  let mediaComponents;
  whereFromPlugin('Media - from v2.0.6', { name: 'adapt-contrib-media', version: '<2.0.6' });
  whereContent('Media - where media', async (content) => {
    mediaComponents = content.filter(({ _component }) => _component === 'media');
    if (mediaComponents) return true;
  });
  mutateContent('Media - add _playsinline attribute to media component', async (content) => {
    mediaComponents.forEach(mediaComponent => {
      mediaComponent._playsinline = false;
    });
    return true;
  });
  checkContent('Media - check _playsinline attribute', async (content) => {
    const isValid = mediaComponents.filter(({ _playsinline }) => _playsinline);
    if (!isValid) throw new Error('Media - _playsinline attribute missing');
    return true;
  });
  updatePlugin('Media - update to v2.0.6', { name: 'adapt-contrib-media', version: '2.0.6', framework: '>=2.0.13' });
});

describe('Media - v2.0.6 to v2.1.0', async () => {
  let mediaComponents;
  whereFromPlugin('Media - from v2.0.6', { name: 'adapt-contrib-media', version: '<2.1.0' });
  whereContent('Media - where media', async (content) => {
    mediaComponents = content.filter(({ _component }) => _component === 'media');
    if (mediaComponents) return true;
  });
  mutateContent('Media - add _showVolumeControl attribute to media component', async (content) => {
    mediaComponents.forEach(mediaComponent => {
      mediaComponent._showVolumeControl = false;
    });
    return true;
  });
  mutateContent('Media - add _startVolume attribute to media component', async (content) => {
    mediaComponents.forEach(mediaComponent => {
      mediaComponent._startVolume = '80%';
    });
    return true;
  });
  mutateContent('Media - add _preventForwardScrubbing attribute to media component', async (content) => {
    mediaComponents.forEach(mediaComponent => {
      mediaComponent._preventForwardScrubbing = false;
    });
    return true;
  });
  checkContent('Media - check _showVolumeControl attribute', async (content) => {
    const isValid = mediaComponents.filter(({ _showVolumeControl }) => _showVolumeControl);
    if (!isValid) throw new Error('Media - _showVolumeControl attribute missing');
    return true;
  });
  checkContent('Media - check _startVolume attribute', async (content) => {
    const isValid = mediaComponents.filter(({ _startVolume }) => _startVolume);
    if (!isValid) throw new Error('Media - _startVolume attribute missing');
    return true;
  });
  checkContent('Media - check _preventForwardScrubbing attribute', async (content) => {
    const isValid = mediaComponents.filter(({ _preventForwardScrubbing }) => _preventForwardScrubbing);
    if (!isValid) throw new Error('Media - _preventForwardScrubbing attribute missing');
    return true;
  });

  updatePlugin('Media - update to v2.1.0', { name: 'adapt-contrib-media', version: '2.1.0', framework: '>=2.0.13' });
});
