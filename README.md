adapt-contrib-media
===================

A basic media component that plays audio and video. This component uses the HTML5 audio and video specification and has a Flash/Silverlight alternative for browsers that don't support HTML5.

The component uses [MediaElement.js](http://mediaelementjs.com/) (v2.13.1) which enables users, amongst other things, to offer subtitles and accessible, skinnable (with CSS) controls. MediaElement.js carries an MIT license and is therefore compatible with Adapt.

Installation
------------

First, be sure to install the [Adapt Command Line Interface](https://github.com/cajones/adapt-cli), then from the command line run:-

		adapt install adapt-contrib-media

For example JSON format, see [example.json](https://github.com/adaptlearning/adapt-contrib-media/blob/master/example.json)
	
Important
---------

MediaElement.js v2.13.1 requires a small patch to enable it to work in IE8 when used in conjunction with Adapt.
