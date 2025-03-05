import { describe, whereContent, whereFromPlugin, mutateContent, checkContent, updatePlugin, getComponents, testStopWhere, testSuccessWhere } from 'adapt-migrations';
import _ from 'lodash';

describe('Media - v2.0.1 to v2.0.2', async () => {
  let mediaComponents;

  whereFromPlugin('Media - from v2.0.1', { name: 'adapt-contrib-media', version: '>= 2.0.0 <2.0.2' });

  whereContent('Media - where media', async (content) => {
    mediaComponents = getComponents('media');
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

  testSuccessWhere('correct version with media components', {
    fromPlugins: [{ name: 'adapt-contrib-media', version: '2.0.1' }],
    content: [
      { _id: 'c-100', _component: 'media' },
      { _id: 'c-105', _component: 'media' }
    ]
  });

  testStopWhere('incorrect version', {
    fromPlugins: [{ name: 'adapt-contrib-media', version: '2.0.2' }]
  });

  testStopWhere('no media components', {
    fromPlugins: [{ name: 'adapt-contrib-media', version: '2.0.1' }],
    content: [{ _component: 'other' }]
  });
});

describe('Media - v2.0.2 to v2.0.3', async () => {
  let mediaComponents;

  whereFromPlugin('Media - from v2.0.2', { name: 'adapt-contrib-media', version: '<2.0.3' });

  whereContent('Media - where media', async (content) => {
    mediaComponents = getComponents('media').filter(({ _transcript }) => _transcript);
    return mediaComponents.length;
  });

  mutateContent('Media - add _setCompletionOnView attribute to media component transcript', async (content) => {
    mediaComponents.forEach(mediaComponent => {
      _.set(mediaComponent, '_transcript._setCompletionOnView', false);
    });
    return true;
  });

  checkContent('Media - check _setCompletionOnView attribute', async (content) => {
    const isValid = mediaComponents.every(({ _transcript }) => _transcript._setCompletionOnView !== undefined);
    if (!isValid) throw new Error('Media - _setCompletionOnView attribute missing');
    return true;
  });

  updatePlugin('Media - update to v2.0.3', { name: 'adapt-contrib-media', version: '2.0.3', framework: '>=2.0.0' });

  testSuccessWhere('media components with/without _transcript', {
    fromPlugins: [{ name: 'adapt-contrib-media', version: '2.0.2' }],
    content: [
      { _id: 'c-100', _component: 'media', _transcript: {} },
      { _id: 'c-105', _component: 'media' }
    ]
  });

  testStopWhere('incorrect version', {
    fromPlugins: [{ name: 'adapt-contrib-media', version: '2.0.3' }]
  });

  testStopWhere('no media components', {
    fromPlugins: [{ name: 'adapt-contrib-media', version: '2.0.2' }],
    content: [{ _component: 'other' }]
  });
});

describe('Media - v2.0.3 to v2.0.4', async () => {
  let mediaComponents;
  whereFromPlugin('Media - from v2.0.3', { name: 'adapt-contrib-media', version: '<2.0.4' });

  whereContent('Media - where media', async (content) => {
    mediaComponents = getComponents('media');
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

  testSuccessWhere('correct version with media components', {
    fromPlugins: [{ name: 'adapt-contrib-media', version: '2.0.3' }],
    content: [
      { _id: 'c-100', _component: 'media' },
      { _id: 'c-105', _component: 'media' }
    ]
  });

  testStopWhere('incorrect version', {
    fromPlugins: [{ name: 'adapt-contrib-media', version: '2.0.4' }]
  });

  testStopWhere('no media components', {
    fromPlugins: [{ name: 'adapt-contrib-media', version: '2.0.3' }],
    content: [{ _component: 'other' }]
  });
});

describe('Media - v2.0.4 to v2.0.5', async () => {
  let mediaComponents;

  whereFromPlugin('Media - from v2.0.4', { name: 'adapt-contrib-media', version: '<2.0.5' });

  whereContent('Media - where media', async (content) => {
    mediaComponents = getComponents('media');
    return mediaComponents.length;
  });

  mutateContent('Media - add webm attribute to media component', async (content) => {
    mediaComponents.forEach(mediaComponent => {
      _.set(mediaComponent, '_media.webm', '');
    });
    return true;
  });

  checkContent('Media - check webm attribute', async (content) => {
    const isInvalid = mediaComponents.some(({ _media }) => _media.webm === undefined);
    if (isInvalid) throw new Error('Media - webm attribute missing');
    return true;
  });

  updatePlugin('Media - update to v2.0.5', { name: 'adapt-contrib-media', version: '2.0.5', framework: '>=2.0.0' });

  testSuccessWhere('media components with/without _media', {
    fromPlugins: [{ name: 'adapt-contrib-media', version: '2.0.4' }],
    content: [
      { _id: 'c-100', _component: 'media', _media: {} },
      { _id: 'c-105', _component: 'media' }
    ]
  });

  testStopWhere('incorrect version', {
    fromPlugins: [{ name: 'adapt-contrib-media', version: '2.0.5' }]
  });

  testStopWhere('no media components', {
    fromPlugins: [{ name: 'adapt-contrib-media', version: '2.0.4' }],
    content: [{ _component: 'other' }]
  });
});

describe('Media - v2.0.5 to v2.0.6', async () => {
  let mediaComponents;

  whereFromPlugin('Media - from v2.0.5', { name: 'adapt-contrib-media', version: '<2.0.6' });

  whereContent('Media - where media', async (content) => {
    mediaComponents = getComponents('media');
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

  testSuccessWhere('correct version with media components', {
    fromPlugins: [{ name: 'adapt-contrib-media', version: '2.0.5' }],
    content: [
      { _id: 'c-100', _component: 'media' },
      { _id: 'c-105', _component: 'media' }
    ]
  });

  testStopWhere('incorrect version', {
    fromPlugins: [{ name: 'adapt-contrib-media', version: '2.0.6' }]
  });

  testStopWhere('no media components', {
    fromPlugins: [{ name: 'adapt-contrib-media', version: '2.0.5' }],
    content: [{ _component: 'other' }]
  });
});

describe('Media - v2.0.6 to v2.1.0', async () => {
  let mediaComponents;

  whereFromPlugin('Media - from v2.0.6', { name: 'adapt-contrib-media', version: '<2.1.0' });

  whereContent('Media - where media', async (content) => {
    mediaComponents = getComponents('media');
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

  testSuccessWhere('correct version with media components', {
    fromPlugins: [{ name: 'adapt-contrib-media', version: '2.0.6' }],
    content: [
      { _id: 'c-100', _component: 'media' },
      { _id: 'c-105', _component: 'media' }
    ]
  });

  testStopWhere('incorrect version', {
    fromPlugins: [{ name: 'adapt-contrib-media', version: '2.1.0' }]
  });

  testStopWhere('no media components', {
    fromPlugins: [{ name: 'adapt-contrib-media', version: '2.0.6' }],
    content: [{ _component: 'other' }]
  });
});
