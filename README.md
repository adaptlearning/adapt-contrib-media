# adapt-contrib-media  

<img src="https://github.com/adaptlearning/documentation/blob/master/04_wiki_assets/plug-ins/images/media02.gif" alt="image of media component" align="right">  

**Media** is a *presentation component* bundled with the [Adapt framework](https://github.com/adaptlearning/adapt_framework). 
 
It is a media playback component for audio and video. It uses HTML5 audio and video for browsers that support it and Flash/Silverlight fallbacks for browsers that don't.  

The component uses [MediaElement.js (v2.18.1)](http://mediaelementjs.com/), a player with a number of useful features including subtitles and accessible (and CSS-skinnable) controls. [MediaElement.js](https://github.com/johndyer/mediaelement) carries the MIT license compatible with Adapt.  

[Visit the **Media** wiki](https://github.com/adaptlearning/adapt-contrib-media/wiki) for more information about its functionality and for explanations of key properties.  

##Installation

As one of Adapt's *[core components](https://github.com/adaptlearning/adapt_framework/wiki/Core-Plug-ins-in-the-Adapt-Learning-Framework#components),* **Media** is included with the [installation of the Adapt framework](https://github.com/adaptlearning/adapt_framework/wiki/Manual-installation-of-the-Adapt-framework#installation) and the [installation of the Adapt authoring tool](https://github.com/adaptlearning/adapt_authoring/wiki/Installing-Adapt-Origin).

* If **Media** has been uninstalled from the Adapt framework, it may be reinstalled.
With the [Adapt CLI](https://github.com/adaptlearning/adapt-cli) installed, run the following from the command line:  
`adapt install adapt-contrib-media`

    Alternatively, this component can also be installed by adding the following line of code to the *adapt.json* file:  
    `"adapt-contrib-media": "*"`  
    Then running the command:  
    `adapt install`  
    (This second method will reinstall all plug-ins listed in *adapt.json*.)  

* If **Media** has been uninstalled from the Adapt authoring tool, it may be reinstalled using the [Plug-in Manager](https://github.com/adaptlearning/adapt_authoring/wiki/Plugin-Manager).  
<div float align=right><a href="#top">Back to Top</a></div>

## Settings Overview

The attributes listed below are used in *components.json* to configure **Media**, and are properly formatted as JSON in [*example.json*](https://github.com/adaptlearning/adapt-contrib-media/blob/master/example.json). Visit the [**Media** wiki](https://github.com/adaptlearning/adapt-contrib-media/wiki) for more information about how they appear in the [authoring tool](https://github.com/adaptlearning/adapt_authoring/wiki). 

### Attributes

[**core model attributes**](https://github.com/adaptlearning/adapt_framework/wiki/Core-model-attributes): These are inherited by every Adapt component. [Read more](https://github.com/adaptlearning/adapt_framework/wiki/Core-model-attributes).

**_component** (string): This value must be: `media`.

**_classes** (string): CSS class name to be applied to **Media**’s containing div. The class must be predefined in one of the Less files. Separate multiple classes with a space.

**_layout** (string): This defines the horizontal position of the component in the block. Acceptable values are `full`, `left` or `right`.  

**instruction** (string): This optional text appears above the component. It is frequently used to
guide the learner’s interaction with the component.  

**_setCompletionOn** (string): This determines when Adapt will register this component as having been completed by the user. Acceptable values are `inview` (triggered when the component is fully displayed within the viewport), `play` (triggered when playback is initiated), or `ended` (triggered when the video has reached the end of playback). 

**_useClosedCaptions** (boolean): If set to `true`, video will allow for Closed Captions and the **cc** object will be required. The default is `false`.  

**_startLanguage** (string): If using closed captions with multiple languages, use this property to specify which language should be shown by default. The value of this property must match one of the **srclang** values.  

**_media** (object): The media attributes group will contain different values depending on the type of media: video or audio.  
For video it contains values for **mp4**, **ogv**, **poster**, and **cc**. Both **mp4** and **ogv** are optional, but at least one is required (see below for alternate properties for YouTube video).  
For audio it contains **mp3** and **ogg**. As with video, both are optional, but at least one is required.  
The decision to include more than one file format is typically based on the browser/s used by the targeted audience. The mostly widely supported video file format is [mp4](http://caniuse.com/#feat=mpeg4) (specifically [H.264/MPEG-4 Part 10 AVC](https://en.wikipedia.org/wiki/H.264/MPEG-4_AVC)). The most widely supported audio format is mp3.

>**mp4** (string): File name (including path) of the video file. Path should be relative to the *src* folder (e.g., *course/en/video/video-1.mp4*).

>**ogv** (string): File name (including path) of the video file. Path should be relative to the *src* folder (e.g., *course/en/video/video-1.ogv*).

>**poster** (string): File name (including path) of the optional image to be shown while the video is downloading, or until the user hits the play button. If this is not included, the first frame of the video will be used instead. Path should be relative to the *src* folder (e.g., *course/en/images/video-1.jpg*).

>**cc** (array):  Closed captions in multiple languages may be provided. Each object in this list contains values for **srclang** and **src**.

>>**srclang** (string): The language of the closed captions (e.g., `en` for English). Acceptable values can be found at http://www.w3schools.com/tags/ref_language_codes.asp.

>>**src** (string): File name (including path) of the closed captions resource accepted by `<track>` (i.e., [the VTT file](https://developer.mozilla.org/en-US/docs/Web/API/Web_Video_Text_Tracks_Format)). Path should be relative to the *src* folder (e.g., *course/en/video/big_buck_bunny_sub.vtt*).

>**mp3** (string): File name (including path) of the audio file. Path should be relative to the *src* folder (e.g., *course/en/audio/audio-1.mp3*).

>**ogg** (string): File name (including path) of the audio file. Path should be relative to the *src* folder (e.g., *course/en/audio/audio-1.ogg*).

**_transcript** (object):  The transcript attributes group contains values for **_inlineTranscript**, **_externalTranscript**, **inlineTranscriptButton**, **inlineTranscriptCloseButton**, **inlineTranscriptBody**, **transcriptLinkButton**, and **transcriptLink**.

>**_inlineTranscript** (boolean): Determines whether the button that toggles the display of the inline transcript text will be displayed or not. 

>**_externalTranscript** (boolean): Determines whether the button that links to the optional external transcript will be displayed or not.

>**inlineTranscriptButton** (string): This text appears on the button that toggles the visibility of the inline transcript text. It is displayed when the inline transcript text is hidden. If no text is provided, the **transcriptLink** will be displayed on the button.

>**inlineTranscriptCloseButton** (string): This text appears on the button that toggles the visibility of the inline transcript. It is displayed when the inline transcript text is visible. 

>**inlineTranscriptBody** (string): This optional text appears below the video. If provided, its visibility is toggled by clicking the transcript button. It is hidden by default.

>**transcriptLinkButton** (string): This text appears on the button that links to the optional external transcript. If no text is provided, the **transcriptLink** will be displayed on the button.

>**transcriptLink** (string): File name (including path) of the optional external transcript. Path should be relative to the *src* folder (e.g., *course/en/pdf/video01_transcript.pdf*).  

**_playerOptions** (object): This optional object can be used to customize the player. Visit the [MediaElement website](http://mediaelementjs.com/#options) for a list of what options are available. Options are configured in components.json. See [*example.json*](https://github.com/adaptlearning/adapt-contrib-media/blob/master/example.json) for a suggested configuration that has been confirmed as working on the full range of Adapt's supported devices. Currently, the Adapt authoring tool does not accommodate configuring these options; courses that require **_playerOptions** must be built directly in the [Adapt framework](https://github.com/adaptlearning/adapt_framework/wiki).  
>**Note:**  
>The **_playerOptions** feature is experimental. As these settings are not implemented by the Adapt community, there is no guarantee that all features and combinations thereof will be compatible with your device set up.    

<div float align=right><a href="#top">Back to Top</a></div>


### JSON Examples  

The attributes described above focus on the component's use with standard video. They are properly formatted as JSON in [*example.json*](https://github.com/adaptlearning/adapt-contrib-media/blob/master/example.json) The same model can be applied to the component's use with audio and YouTube videos.     

**Standard video example:**
```json
"_media": {
	"mp4": "course/en/video/video.mp4",
	"ogv": "course/en/video/video.ogv"
},
```

**YouTube video example:**
```json
"_media": {
	"source": "//www.youtube.com/watch?v=RT-KmgAgxuo",
	"type": "video/youtube"
},
```  

**Vimeo video example:**
```json
"_media": {
	"source": "//player.vimeo.com/video/96961553",
	"type": "video/vimeo"
},
```  

**Audio example:**
```json
"_media": {
	"mp3": "course/en/audio/audio.mp3",
	"ogg": "course/en/audio/audio.ogg"
},
```  

### Accessibility
**Media** has two elements that have been assigned a label using the [aria-label](https://github.com/adaptlearning/adapt_framework/wiki/Aria-Labels) attribute: **ariaRegion** and **transcriptButton**. These labels are not visible elements. They are utilized by assistive technology such as screen readers. Should the label texts need to be customised, they can be found within the **globals** object in [*properties.schema*](https://github.com/adaptlearning/adapt-contrib-media/blob/master/properties.schema).   
<div float align=right><a href="#top">Back to Top</a></div>

## Limitations
 
Users of Internet Explorer v8  will need to have [Adobe Flash Player](https://get.adobe.com/flashplayer/) v10 (or better) or Microsoft [Silverlight](https://www.microsoft.com/getsilverlight/get-started/install/) installed to enable media playback, due to that browser's lack of support for HTML audio/video.

----------------------------
**Version number:**  2.0   <a href="https://community.adaptlearning.org/" target="_blank"><img src="https://github.com/adaptlearning/documentation/blob/master/04_wiki_assets/plug-ins/images/adapt-logo-mrgn-lft.jpg" alt="adapt learning logo" align="right"></a> 
**Framework versions:** 2.0  
**Author / maintainer:** Adapt Core Team with [contributors](https://github.com/adaptlearning/adapt-contrib-media/graphs/contributors)  
**Accessibility support:** WAI AA   
**RTL support:** yes  
**Cross-platform coverage:** Chrome, Chrome for Android, Firefox (ESR + latest version), IE 11, IE10, IE9, IE8, IE Mobile 11, Safari for iPhone (iOS 7+8), Safari for iPad (iOS 7+8), Safari 8, Opera     
