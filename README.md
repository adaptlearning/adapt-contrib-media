# adapt-contrib-media

A basic media component that plays audio and video. This component uses the HTML5 audio and video specification and has a Flash/Silverlight alternative for browsers that don't support HTML5.

The component uses [MediaElement.js (v2.13.2)](http://mediaelementjs.com/), a player with a number of useful features including subtitles and accessible (and CSS-skinnable) controls. MediaElement.js carries an MIT license and is therefore compatible with Adapt.

## Installation

First, be sure to install the [Adapt Command Line Interface](https://github.com/cajones/adapt-cli), then from the command line run:

		adapt install adapt-contrib-media

# Configuration

See below for notes regarding the component JSON.

### Component completion

The ```setCompletionOn``` setting controls when the component is set to complete, and accepts the following values: "```inview```", "```play```" and "```ended```".

### MediaElement.js player

In the interest of customisability, all of MediaElement.js's player options can be configured via the component JSON.

The ```_playerOptions``` object is an **optional** dynamic object which can be used to set as many (or as few) of the supported player settings as required. See [the MediaElement website](http://mediaelementjs.com/#options) for a full reference of what options are available.

***N.B.** This feature is experimental; as these settings are not implemented by the Adapt community, there is no guarantee that all features and combinations thereof will be compatible with your device set up. See example.json for a suggested configuration that has been confirmed as working on the full range of Adapt's supported devices.*  

## Usage

For example JSON format, see [example.json](https://github.com/adaptlearning/adapt-contrib-media/blob/master/example.json).

**Audio example:**
```json
"_media": {
	"mp3": "course/assets/audio.mp3",
	"ogg": "course/assets/audio.ogg"
},
```

**Video example:**
```json
"_media": {
	"mp4": "course/assets/video.mp4",
	"ogv": "course/assets/video.ogv"
},
```

**YouTube video example:**
```json
"_media": {
	"source": "http://www.youtube.com/watch?v=nOEw9iiopwI",
	"type": "video/youtube"
},
```

## MediaElement.js

For more information about the MediaElement.js player, visit [its GitHub page](https://github.com/johndyer/mediaelement).
