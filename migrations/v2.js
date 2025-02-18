import { describe, whereContent, whereFromPlugin, mutateContent, checkContent, updatePlugin } from 'adapt-migrations';

describe('Media - v2.0.1 to v2.0.2', async () => {
  let mediaComponents;
  whereFromPlugin('Media - from v2.0.1', { name: 'adapt-contrib-media', version: '>= 2.0.0 <2.0.2' });
  whereContent('Media - where media', async (content) => {
    mediaComponents = content.filter(({ _component }) => _component === 'media');
    return mediaComponents.length;
  });
  mutateContent('Media - add _startLanguage attribute to media component', async (content) => {
    mediaComponents.forEach(mediaComponent => {
      mediaComponent._startLanguage = 'en';
    });
    return true;
  });
  checkContent('Media - check _startLanguage attribute', async (content) => {
    const isValid = mediaComponents.every(({ _startLanguage }) => _startLanguage !== undefined);
    if (!isValid) throw new Error('Media - _startLanguage attribute missing');
    return true;
  });
  updatePlugin('Media - update to v2.0.2', { name: 'adapt-contrib-media', version: '2.0.2', framework: '>=2.0.0' });
});

describe('Media - v2.0.2 to v2.0.3', async () => {
  let mediaComponents;
  whereFromPlugin('Media - from v2.0.2', { name: 'adapt-contrib-media', version: '<2.0.3' });
  whereContent('Media - where media', async (content) => {
    mediaComponents = content.filter(({ _component }) => _component === 'media');
    return mediaComponents.length;
  });
  mutateContent('Media - add _setCompletionOnView attribute to media component transcript', async (content) => {
    mediaComponents.forEach(mediaComponent => {
      mediaComponent._transcript._setCompletionOnView = false;
    });
    return true;
  });
  checkContent('Media - check _setCompletionOnView attribute', async (content) => {
    const isValid = mediaComponents.every(({ _transcript }) => _transcript._setCompletionOnView !== undefined);
    if (!isValid) throw new Error('Media - _setCompletionOnView attribute missing');
    return true;
  });
  updatePlugin('Media - update to v2.0.3', { name: 'adapt-contrib-media', version: '2.0.3', framework: '>=2.0.0' });
});

describe('Media - v2.0.3 to v2.0.4', async () => {
  let mediaComponents;
  whereFromPlugin('Media - from v2.0.3', { name: 'adapt-contrib-media', version: '<2.0.4' });
  whereContent('Media - where media', async (content) => {
    mediaComponents = content.filter(({ _component }) => _component === 'media');
    return mediaComponents.length;
  });
  mutateContent('Media - add _allowFullScreen attribute to media component', async (content) => {
    mediaComponents.forEach(mediaComponent => {
      mediaComponent._allowFullScreen = false;
    });
    return true;
  });
  checkContent('Media - check _allowFullScreen attribute', async (content) => {
    const isValid = mediaComponents.every(({ _allowFullScreen }) => _allowFullScreen !== undefined);
    if (!isValid) throw new Error('Media - _allowFullScreen attribute missing');
    return true;
  });
  updatePlugin('Media - update to v2.0.4', { name: 'adapt-contrib-media', version: '2.0.4', framework: '>=2.0.0' });
});

describe('Media - v2.0.4 to v2.0.5', async () => {
  let mediaComponents;
  whereFromPlugin('Media - from v2.0.4', { name: 'adapt-contrib-media', version: '<2.0.5' });
  whereContent('Media - where media', async (content) => {
    mediaComponents = content.filter(({ _component }) => _component === 'media');
    return mediaComponents.length;
  });
  mutateContent('Media - add webm attribute to media component', async (content) => {
    mediaComponents.forEach(mediaComponent => {
      mediaComponent.webm = '';
    });
    return true;
  });
  checkContent('Media - check webm attribute', async (content) => {
    const isValid = mediaComponents.every(({ _media }) => _media.webm !== undefined);
    if (!isValid) throw new Error('Media - webm attribute missing');
    return true;
  });
  updatePlugin('Media - update to v2.0.5', { name: 'adapt-contrib-media', version: '2.0.5', framework: '>=2.0.0' });
});

describe('Media - v2.0.5 to v2.0.6', async () => {
  let mediaComponents;
  whereFromPlugin('Media - from v2.0.5', { name: 'adapt-contrib-media', version: '<2.0.6' });
  whereContent('Media - where media', async (content) => {
    mediaComponents = content.filter(({ _component }) => _component === 'media');
    return mediaComponents.length;
  });
  mutateContent('Media - add _playsinline attribute to media component', async (content) => {
    mediaComponents.forEach(mediaComponent => {
      mediaComponent._playsinline = false;
    });
    return true;
  });
  checkContent('Media - check _playsinline attribute', async (content) => {
    const isValid = mediaComponents.every(({ _playsinline }) => _playsinline !== undefined);
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
    return mediaComponents.length;
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
    const isValid = mediaComponents.every(({ _showVolumeControl }) => _showVolumeControl !== undefined);
    if (!isValid) throw new Error('Media - _showVolumeControl attribute missing');
    return true;
  });
  checkContent('Media - check _startVolume attribute', async (content) => {
    const isValid = mediaComponents.every(({ _startVolume }) => _startVolume !== undefined);
    if (!isValid) throw new Error('Media - _startVolume attribute missing');
    return true;
  });
  checkContent('Media - check _preventForwardScrubbing attribute', async (content) => {
    const isValid = mediaComponents.every(({ _preventForwardScrubbing }) => _preventForwardScrubbing !== undefined);
    if (!isValid) throw new Error('Media - _preventForwardScrubbing attribute missing');
    return true;
  });

  updatePlugin('Media - update to v2.1.0', { name: 'adapt-contrib-media', version: '2.1.0', framework: '>=2.0.13' });
});
