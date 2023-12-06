# adapt-contrib-media
 
<img src="https://github.com/adaptlearning/documentation/blob/master/04_wiki_assets/plug-ins/images/media02.gif" alt="image of media component" align="right">

**Media** is a *presentation component* bundled with the [Adapt framework](https://github.com/adaptlearning/adapt_framework).

This component is media playback component for both audio and video. It uses HTML5 audio and video for browsers that support it and a Flash fallback for browsers for when HTML5 audio/video isn't supported or can't be used (see the [Notes](#notes) section for more information).

The component uses [MediaElement.js (v2.21.2)](http://mediaelementjs.com/), a player with a number of useful features including subtitles and accessible (and CSS-skinnable) controls. [MediaElement.js](https://github.com/johndyer/mediaelement) carries the MIT license compatible with Adapt.

Whilst the underlying MediaElement player does have support for playing both YouTube and Vimeo videos, this no longer works very well due to changes in the YouTube/Vimeo player APIs - it is therefore strongly suggested you use the dedicated [YouTube](https://github.com/adaptlearning/adapt-youtube) / [Vimeo](https://github.com/adaptlearning/adapt-contrib-vimeo) components instead.

[Visit the **Media** wiki](https://github.com/adaptlearning/adapt-contrib-media/wiki) for more information about its functionality and for explanations of key properties.

## Installation

As one of Adapt's *[core components](https://github.com/adaptlearning/adapt_framework/wiki/Core-Plug-ins-in-the-Adapt-Learning-Framework#components),* **Media** is included with the [installation of the Adapt framework](https://github.com/adaptlearning/adapt_framework/wiki/Manual-installation-of-the-Adapt-framework#installation) and the [installation of the Adapt authoring tool](https://github.com/adaptlearning/adapt_authoring/wiki/Installing-Adapt-Origin).

* If **Media** has been uninstalled from the Adapt framework, it may be reinstalled. With the [Adapt CLI](https://github.com/adaptlearning/adapt-cli) installed, run the following from the command line:
	```console
	adapt install adapt-contrib-media
	```
  Alternatively, this component can also be installed by adding the following line of code to the *adapt.json* file:
	```json
	"adapt-contrib-media": "*"
	```
  Then running the command:
	```console
	adapt install
	```
  (This second method will reinstall all plug-ins listed in *adapt.json*.)

* If **Media** has been uninstalled from the Adapt authoring tool, it may be reinstalled using the [Plug-in Manager](https://github.com/adaptlearning/adapt_authoring/wiki/Plugin-Manager).
<div float align=right><a href="#top">Back to Top</a></div>

## Settings Overview

The attributes listed below are used in *components.json* to configure **Media**, and are properly formatted as JSON in [*example.json*](https://github.com/adaptlearning/adapt-contrib-media/blob/master/example.json). Visit the [**Media** wiki](https://github.com/adaptlearning/adapt-contrib-media/wiki) for more information about how they appear in the [authoring tool](https://github.com/adaptlearning/adapt_authoring/wiki).

## Attributes

[**core model attributes**](https://github.com/adaptlearning/adapt_framework/wiki/Core-model-attributes): These are inherited by every Adapt component. [Read more](https://github.com/adaptlearning/adapt_framework/wiki/Core-model-attributes).

### \_component (string):
This must be set to `"media"`.

### \_classes (string):
CSS class name(s) to be applied to this component’s containing `div`. The class(es) must be predefined in one of the Less files. Separate multiple classes with a space.

### \_layout (string):
Defines the horizontal position of the component in the block. Acceptable values are `"full"`, `"left"` or `"right"`.

### instruction (string):
This optional text appears above the component. It is frequently used to guide the learner’s interaction with the component.

### \_setCompletionOn (string):
Determines when Adapt will register this component as having been completed by the learner. Acceptable values are `"inview"` (triggered when the component is fully displayed within the viewport), `"play"` (triggered when playback is initiated), or `"ended"` (triggered when the video has reached the end of playback).

### \_useClosedCaptions (boolean):
If set to `true`, the component will allow for closed captions support when playing video. The default is `false`.

### \_startLanguage (string):
If using closed captions, use this property to specify which language should be shown by default - or to prevent closed captions from being shown by default (so that the learner will need to switch them on). The value of this property must match one of the `srclang` values - or be set to `"none"` if you need the default to be 'closed captions off'.

### \_allowFullScreen (boolean):
Determines whether fullscreen mode is available or not. The default is `false`.

### \_aspectRatio (string):
Defines the aspect ratio of the video to either be landscape (16:9), portrait (9:16), or square (1:1). Acceptable values are `"landscape"`, `"portrait"` or `"square"`. The default is `"landscape"`.

### \_playsinline (boolean):
If set to `true`, videos will play 'inline' on iPhones (the same way they do on iPads). Note that this feature is only available in iOS10 and above. The default is `false`.

### \_pauseWhenOffScreen (boolean):
If set to `true`, playback will automatically be paused when the media component is 'off screen'. The default is `false`.

### \_preventForwardScrubbing (boolean):
If set to `true`, the component will *attempt* to prevent learners from 'skipping ahead' in media (both audio and video).  Learners can skip backwards, and back up to the `maxViewed` time tracked by `updateTime`. Note: This does not apply to full screen iOS/iPadOs - and learners using certain browsers (Internet Explorer, for example) may be able to circumvent this rule by using video play speed options. Once the learner has completed the media component, this restriction will no longer be enforced. You should therefore ensure the `_setCompletionOn` setting is set to `"ended"` when using this setting.

### \_offsetMediaControls (boolean):
If set to `true`, the media control bar will be respositioned below the media container to remove the standard overlap style. The default is `false`.

### \_showVolumeControl (boolean):
Controls whether the volume controls will be shown in the media player control bar or not. Note that this setting has no impact when the device itself - iPhone, for example - enforces its own player controls. The default value is `false`.

### \_startVolume (string):
Defines the default volume as a percentage. This can be set with or without the percentage sign in the string. The default value is `"80%"`. Note that this setting has no impact on mobile devices.

### \_media (object):
The media object will contain different values depending on the type of media: video or audio.

For video it contains values for `mp4`, `webm`, `ogv`, `poster`, and `cc`. The properties `mp4`, `webm` and `ogv` are all optional, but at least one is required (see below for alternate properties for YouTube/Vimeo video).

For audio it contains `mp3` and `ogg`. As with video, both are optional, but at least one is required.

The decision to include more than one file format is typically based on the browser/s used by the target audience. The most widely supported video file format is [mp4](http://caniuse.com/#feat=mpeg4) (specifically [H.264/MPEG-4 Part 10 AVC](https://en.wikipedia.org/wiki/H.264/MPEG-4_AVC)). The most widely supported audio format is mp3.

#### mp4 (string):
File name (including path) of the video file. Path should be relative to the `src` folder (e.g., `"course/en/video/video-1.mp4"`).

#### webm (string):
File name (including path) of the video file. Path should be relative to the `src` folder (e.g., `"course/en/video/video-1.webm"`).

#### ogv (string):
File name (including path) of the video file. Path should be relative to the `src` folder (e.g., `"course/en/video/video-1.ogv"`).

#### poster (string):
File name (including path) of the optional image to be shown while the video is downloading, or until the learner hits the play button. If this is not included, the first frame of the video will be used instead. Path should be relative to the `src` folder (e.g., `"course/en/video/video-1-poster.jpg"`).

#### cc (array):
Closed captions in multiple languages may be provided. Each entry in this array should be an object, containing the following settings:

##### srclang (string):
The language of the closed captions (e.g., `"en"` for English). Acceptable values can be found at http://www.w3schools.com/tags/ref_language_codes.asp.

##### src (string):
File name (including path) of the closed captions resource accepted by `<track>` (e.g. a [the VTT file](https://developer.mozilla.org/en-US/docs/Web/API/Web_Video_Text_Tracks_Format)). Path should be relative to the `src` folder (e.g., `"course/en/video/video-1-subtitles.vtt"`).

#### mp3 (string):
File name (including path) of the audio file. Path should be relative to the `src` folder (e.g., `"course/en/audio/audio-1.mp3"`).

#### ogg (string):
File name (including path) of the audio file. Path should be relative to the `src` folder (e.g., `"course/en/audio/audio-1.ogg"`).

### \_transcript (object):
The transcript object contains the following settings:

#### \_setCompletionOnView (boolean):
Determines whether Adapt will register this component as having been completed by the learner when the inline transcript is opened. The default value is `true`.

#### \_inlineTranscript (boolean):
Determines whether the button that toggles the display of the inline transcript text will be displayed or not. The default value is `false`.

#### \_externalTranscript (boolean):
Determines whether the button that links to the optional external transcript will be displayed or not. The default value is `false`.

#### inlineTranscriptButton (string):
This text appears on the button that toggles the visibility of the inline transcript text. It is displayed when the inline transcript text is hidden. If no text is provided, the `"transcriptLink"` will be displayed on the button.

#### inlineTranscriptCloseButton (string):
This text appears on the button that toggles the visibility of the inline transcript. It is displayed when the inline transcript text is visible.

#### inlineTranscriptBody (string):
This optional text appears below the video. If provided, its visibility is toggled by clicking the transcript button. It is hidden by default.

#### transcriptLinkButton (string):
This text appears on the button that links to the optional external transcript. If no text is provided, the `"transcriptLink"` text will be displayed on the button.

#### transcriptLink (string):
File name (including path) of the optional external transcript. Path should be relative to the `src` folder (e.g., `"course/en/pdf/video01_transcript.pdf"`).

### \_playerOptions (object):
This optional object can be used to customize the player. See [*example.json*](https://github.com/adaptlearning/adapt-contrib-media/blob/master/example.json) for a list of settings. Please note: as these settings are not implemented by the Adapt community, there is no guarantee that all features and combinations thereof will be compatible with your device set up.

<div float align=right><a href="#top">Back to Top</a></div>

### JSON Examples

The attributes described above focus on the component's use with standard video. They are properly formatted as JSON in [*example.json*](https://github.com/adaptlearning/adapt-contrib-media/blob/master/example.json) The same model can be applied to the component's use with audio and YouTube videos.

#### Standard video example:
```json
"_media": {
	"mp4": "course/en/video/video.mp4"
},
```

#### YouTube video example:
```json
"_media": {
	"source": "//www.youtube.com/watch?v=RT-KmgAgxuo",
	"type": "video/youtube"
},
```
Note: it is strongly suggested you use the dedicated [YouTube component](https://github.com/adaptlearning/adapt-youtube) if you want to include YouTube videos in your Adapt course.

#### Vimeo video example:
```json
"_media": {
	"source": "//player.vimeo.com/video/96961553",
	"type": "video/vimeo"
},
```
Note: it is strongly suggested you use the dedicated [Vimeo component](https://github.com/adaptlearning/adapt-contrib-vimeo) if you want to include Vimeo videos in your Adapt course.

#### Audio example:
```json
"_media": {
	"mp3": "course/en/audio/audio.mp3",
	"ogg": "course/en/audio/audio.ogg"
},
```

### Accessibility
The media component has two elements that have been assigned a label using the [aria-label](https://github.com/adaptlearning/adapt_framework/wiki/Aria-Labels) attribute: `"ariaRegion"` and `"skipToTranscript"`. These labels are not visible elements. They are utilized by assistive technology such as screen readers. Should the labels need to be customised or localised, they can be found within the `globals` object in [*properties.schema*](https://github.com/adaptlearning/adapt-contrib-media/blob/master/properties.schema).
<div float align=right><a href="#top">Back to Top</a></div>

## Events
Whenever playback is initiated, the component will emit a `media:stop` event to notify other plugins that make use of audio or video that they should stop playback.

## Limitations
Browser | Limitation |
--------- | :----------- |
Chrome   | No known issues.
Firefox | No known issues.
iOS/iPad | No known issues.
Android | Firefox 33.1 with Vimeo: 'This video can't be played with your current setup'.
Edge | No known issues.
IE11 | No known issues.

## Notes
Although [Adobe Flash Player has now reached End of Life](https://www.adobe.com/uk/products/flashplayer/end-of-life.html) we have left the 'Flash fallback player' in place on the off-chance anyone still needs it and wants to take the risk of using it. The Flash-based video player itself is [hosted on a CDN](https://cdnjs.cloudflare.com/ajax/libs/mediaelement/2.21.2/flashmediaelement-cdn.swf) so no that no Flash file needs to be included in the course output (as many networks/Learning Management Systems now block the .swf file type).
**Please note**: if you wish to use this method of playback it is entirely at your own risk and not supported by the Adapt Core Team.

----------------------------
<a href="https://community.adaptlearning.org/" target="_blank"><img src="https://github.com/adaptlearning/documentation/blob/master/04_wiki_assets/plug-ins/images/adapt-logo-mrgn-lft.jpg" alt="adapt learning logo" align="right"></a></br>
**Author / maintainer:** Adapt Core Team with [contributors](https://github.com/adaptlearning/adapt-contrib-media/graphs/contributors)</br>
**Accessibility support:** WAI AA</br>
**RTL support:** Yes</br>
**Cross-platform coverage:** Chrome, Chrome for Android, Firefox (ESR + latest version), Edge, IE11, Safari 14 for macOS/iOS/iPadOS, Opera
