/*!

   Flowplayer v5.4.4 (Wednesday, 06. November 2013 01:27PM) | flowplayer.org/license

*/
!function(e){function t(t,n){var i="obj"+(""+Math.random()).slice(2,15),a='<object class="fp-engine" id="'+i+'" name="'+i+'" ';a+=e.browser.msie?'classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000">':' data="'+t+'" type="application/x-shockwave-flash">';var o={width:"100%",height:"100%",allowscriptaccess:"always",wmode:"transparent",quality:"high",flashvars:"",movie:t+(e.browser.msie?"?"+i:""),name:i};return e.each(n,function(e,t){o.flashvars+=e+"="+t+"&"}),e.each(o,function(e,t){a+='<param name="'+e+'" value="'+t+'"/>'}),a+="</object>",e(a)}function n(e,t){return t=t||100,Math.round(e*t)/t}function i(e){return/mpegurl/i.test(e)?"application/x-mpegurl":"video/"+e}function a(e){return/^(video|application)/.test(e)||(e=i(e)),!!m.canPlayType(e).replace("no","")}function o(t,n){var i=e.grep(t,function(e){return e.type===n});return i.length?i[0]:null}function r(e){var t=e.attr("src"),n=e.attr("type")||"",i=t.split(y)[1];return n=/mpegurl/.test(n)?"mpegurl":n.replace("video/",""),{src:t,suffix:i||n,type:n||i}}function s(t){var n=this,i=[];e("source",t).each(function(){i.push(r(e(this)))}),i.length||i.push(r(t)),n.initialSources=i,n.resolve=function(t){return t?(e.isArray(t)?t={sources:e.map(t,function(t){var n,i=e.extend({},t);return e.each(t,function(e){n=e}),i.type=n,i.src=t[n],delete i[n],i})}:"string"==typeof t&&(t={src:t,sources:[]},e.each(i,function(e,n){"flash"!=n.type&&t.sources.push({type:n.type,src:t.src.replace(y,"."+n.suffix+"$2")})})),t):{sources:i}}}function l(e){return e=parseInt(e,10),e>=10?e:"0"+e}function d(e){e=e||0;var t=Math.floor(e/3600),n=Math.floor(e/60);return e-=60*n,t>=1?(n-=60*t,t+":"+l(n)+":"+l(e)):l(n)+":"+l(e)}!function(e){if(!e.browser){var t=e.browser={},n=navigator.userAgent.toLowerCase(),i=/(chrome)[ \/]([\w.]+)/.exec(n)||/(safari)[ \/]([\w.]+)/.exec(n)||/(webkit)[ \/]([\w.]+)/.exec(n)||/(opera)(?:.*version|)[ \/]([\w.]+)/.exec(n)||/(msie) ([\w.]+)/.exec(n)||n.indexOf("compatible")<0&&/(mozilla)(?:.*? rv:([\w.]+)|)/.exec(n)||[];i[1]&&(t[i[1]]=!0,t.version=i[2]||"0")}}(jQuery),e(function(){"function"==typeof e.fn.flowplayer&&e("video").parent(".flowplayer").flowplayer()});var u=[],c=[],p=window.navigator.userAgent;window.flowplayer=function(t){return e.isFunction(t)?c.push(t):"number"==typeof t||void 0===t?u[t||0]:e(t).data("flowplayer")},e(window).on("beforeunload",function(){e.each(u,function(t,n){n.conf.splash?n.unload():n.bind("error",function(){e(".flowplayer.is-error .fp-message").remove()})})}),e.extend(flowplayer,{version:"5.4.4",engine:{},conf:{},support:{},defaults:{debug:!1,disabled:!1,engine:"html5",fullscreen:window==window.top,keyboard:!0,ratio:9/16,adaptiveRatio:!1,flashfit:!1,rtmp:0,splash:!1,live:!1,swf:"//releases.flowplayer.org/5.4.4/flowplayer.swf",speeds:[.25,.5,1,1.5,2],tooltip:!0,volume:"object"!=typeof localStorage?1:"true"==localStorage.muted?0:isNaN(localStorage.volume)?1:localStorage.volume||1,errors:["","Video loading aborted","Network error","Video not properly encoded","Video file not found","Unsupported video","Skin not found","SWF file not found","Subtitles not found","Invalid RTMP URL","Unsupported video format. Try installing Adobe Flash."],errorUrls:["","","","","","","","","","","http://get.adobe.com/flashplayer/"],playlist:[]}});var f=1;e.fn.flowplayer=function(t,n){return"string"==typeof t&&(t={swf:t}),e.isFunction(t)&&(n=t,t={}),!t&&this.data("flowplayer")||this.each(function(){var i,a,o=e(this).addClass("is-loading"),r=e.extend({},flowplayer.defaults,flowplayer.conf,t,o.data()),l=e("video",o).addClass("fp-engine").removeAttr("controls"),d=l.length?new s(l):null,p={};if(flowplayer.support.firstframe||l.detach(),r.playlist.length){var v,m=l.attr("preload");l.length&&l.replaceWith(v=e("<p />")),l=e("<video />").addClass("fp-engine"),v?v.replaceWith(l):o.prepend(l),l.attr("preload",m),"string"==typeof r.playlist[0]?l.attr("src",r.playlist[0]):e.each(r.playlist[0],function(t,n){for(var i in n)n.hasOwnProperty(i)&&l.append(e("<source />").attr({type:"video/"+i,src:n[i]}))}),d=new s(l)}var g=o.data("flowplayer");g&&g.unload(),o.data("fp-player_id",o.data("fp-player_id")||f++);try{p=window.localStorage||p}catch(h){}var y=this.currentStyle&&"rtl"===this.currentStyle.direction||window.getComputedStyle&&"rtl"===window.getComputedStyle(this,null).getPropertyValue("direction");y&&o.addClass("is-rtl");var b=g||{conf:r,currentSpeed:1,volumeLevel:"undefined"==typeof r.volume?1*p.volume:r.volume,video:{},disabled:!1,finished:!1,loading:!1,muted:"true"==p.muted||r.muted,paused:!1,playing:!1,ready:!1,splash:!1,rtl:y,load:function(t,n){if(!(b.error||b.loading||b.disabled)){if(t=d.resolve(t),e.extend(t,a.pick(t.sources)),t.src){var i=e.Event("load");o.trigger(i,[b,t,a]),i.isDefaultPrevented()?b.loading=!1:(a.load(t),e.isFunction(t)&&(n=t),n&&o.one("ready",n))}return b}},pause:function(e){return!b.ready||b.seeking||b.disabled||b.loading||(a.pause(),b.one("pause",e)),b},resume:function(){return b.ready&&b.paused&&!b.disabled&&(a.resume(),b.finished&&(b.trigger("resume"),b.finished=!1)),b},toggle:function(){return b.ready?b.paused?b.resume():b.pause():b.load()},seek:function(t,n){if(b.ready){if("boolean"==typeof t){var r=.1*b.video.duration;t=b.video.time+(t?r:-r)}t=i=Math.min(Math.max(t,0),b.video.duration).toFixed(1);var s=e.Event("beforeseek");o.trigger(s,[b,t]),s.isDefaultPrevented()?(b.seeking=!1,o.toggleClass("is-seeking",b.seeking)):(a.seek(t),e.isFunction(n)&&o.one("seek",n))}return b},seekTo:function(e,t){var n=void 0===e?i:.1*b.video.duration*e;return b.seek(n,t)},mute:function(e){return void 0===e&&(e=!b.muted),p.muted=b.muted=e,p.volume=isNaN(p.volume)?r.volume:p.volume,b.volume(e?0:p.volume,!0),b.trigger("mute",e),b},volume:function(e,t){return b.ready&&(e=Math.min(Math.max(e,0),1),t||(p.volume=e),a.volume(e)),b},speed:function(t,n){return b.ready&&("boolean"==typeof t&&(t=r.speeds[e.inArray(b.currentSpeed,r.speeds)+(t?1:-1)]||b.currentSpeed),a.speed(t),n&&o.one("speed",n)),b},stop:function(){return b.ready&&(b.pause(),b.seek(0,function(){o.trigger("stop")})),b},unload:function(){return o.hasClass("is-embedding")||(r.splash?(b.trigger("unload"),a.unload()):b.stop()),b},disable:function(e){return void 0===e&&(e=!b.disabled),e!=b.disabled&&(b.disabled=e,b.trigger("disable",e)),b}};b.conf=e.extend(b.conf,r),e.each(["bind","one","unbind"],function(e,t){b[t]=function(e,n){return o[t](e,n),b}}),b.trigger=function(e,t){return o.trigger(e,[b,t]),b},o.data("flowplayer")||o.bind("boot",function(){return e.each(["autoplay","loop","preload","poster"],function(e,t){var n=l.attr(t);void 0!==n&&(r[t]=n?n:!0)}),(r.splash||o.hasClass("is-splash")||!flowplayer.support.firstframe)&&(b.forcedSplash=!r.splash&&!o.hasClass("is-splash"),b.splash=r.splash=r.autoplay=!0,o.addClass("is-splash"),l.attr("preload","none")),(r.live||o.hasClass("is-live"))&&(b.live=r.live=!0,o.addClass("is-live")),e.each(c,function(){var e;flowplayer.support.firstframe||(e=l.clone().prependTo(o)),this(b,o),e&&e.remove()}),a=flowplayer.engine[r.engine],a&&(a=a(b,o)),a.pick(d.initialSources)?b.engine=r.engine:e.each(flowplayer.engine,function(e){return e!=r.engine?(a=this(b,o),a.pick(d.initialSources)&&(b.engine=e),!1):void 0}),u.push(b),b.engine?(r.splash?b.unload():b.load(),r.disabled&&b.disable(),a.volume(b.volumeLevel),o.one("ready",n),void 0):b.trigger("error",{code:flowplayer.support.flashVideo?5:10})}).bind("load",function(t,n){r.splash&&e(".flowplayer").filter(".is-ready, .is-loading").not(o).each(function(){var t=e(this).data("flowplayer");t.conf.splash&&t.unload()}),o.addClass("is-loading"),n.loading=!0}).bind("ready",function(e,t,n){function i(){o.removeClass("is-loading"),t.loading=!1}n.time=0,t.video=n,r.splash?o.one("progress",i):i(),t.muted?t.mute(!0):t.volume(t.volumeLevel)}).bind("unload",function(){r.splash&&l.remove(),o.removeClass("is-loading"),b.loading=!1}).bind("ready unload",function(e){var t="ready"==e.type;o.toggleClass("is-splash",!t).toggleClass("is-ready",t),b.ready=t,b.splash=!t}).bind("progress",function(e,t,n){t.video.time=n}).bind("speed",function(e,t,n){t.currentSpeed=n}).bind("volume",function(e,t,n){t.volumeLevel=Math.round(100*n)/100,t.muted?n&&t.mute(!1):p.volume=n}).bind("beforeseek seek",function(e){b.seeking="beforeseek"==e.type,o.toggleClass("is-seeking",b.seeking)}).bind("ready pause resume unload finish stop",function(e,t,n){b.paused=/pause|finish|unload|stop/.test(e.type),"ready"==e.type&&(b.paused="none"==r.preload,n&&(b.paused=!n.duration||!r.autoplay&&"none"!=r.preload)),b.playing=!b.paused,o.toggleClass("is-paused",b.paused).toggleClass("is-playing",b.playing),b.load.ed||b.pause()}).bind("finish",function(){b.finished=!0}).bind("error",function(){l.remove()}),o.trigger("boot",[b,o]).data("flowplayer",b)})},!function(){var t=function(e){var t=/Version\/(\d\.\d)/.exec(e);return t&&t.length>1?parseFloat(t[1],10):0},n=flowplayer.support,i=e.browser,a=e("<video loop autoplay preload/>")[0],o=i.msie,r=navigator.userAgent,s=/iPad|MeeGo/.test(r)&&!/CriOS/.test(r),l=/iPad/.test(r)&&/CriOS/.test(r),d=/iP(hone|od)/i.test(r)&&!/iPad/.test(r),u=/Android/.test(r)&&!/Firefox/.test(r),c=/Android/.test(r)&&/Firefox/.test(r),p=/Silk/.test(r),f=/IEMobile/.test(r),v=(s?t(r):0,u?parseFloat(/Android\ (\d\.\d)/.exec(r)[1],10):0);e.extend(n,{subtitles:!!a.addTextTrack,fullscreen:!u&&("function"==typeof document.webkitCancelFullScreen&&!/Mac OS X 10_5.+Version\/5\.0\.\d Safari/.test(r)||document.mozFullScreenEnabled||"function"==typeof document.exitFullscreen),inlineBlock:!(o&&i.version<8),touch:"ontouchstart"in window,dataload:!s&&!d&&!f,zeropreload:!o&&!u,volume:!(s||u||d||p||l),cachedVideoTag:!(s||d||l||f),firstframe:!(d||s||u||p||l||f||c),inlineVideo:!d&&!p&&!f&&(!u||v>=3),hlsDuration:!i.safari||s||d||l,seekable:!s&&!l});try{var m=o?new ActiveXObject("ShockwaveFlash.ShockwaveFlash").GetVariable("$version"):navigator.plugins["Shockwave Flash"].description;m=m.split(/\D+/),m.length&&!m[0]&&(m=m.slice(1)),n.flashVideo=m[0]>9||9==m[0]&&m[3]>=115}catch(g){}try{n.video=!!a.canPlayType,n.video&&a.canPlayType("video/mp4")}catch(h){n.video=!1}n.animation=function(){for(var t=["","Webkit","Moz","O","ms","Khtml"],n=e("<p/>")[0],i=0;i<t.length;i++)if("undefined"!==n.style[t[i]+"AnimationName"])return!0}()}(),window.attachEvent&&window.attachEvent("onbeforeunload",function(){__flash_savedUnloadHandler=__flash_unloadHandler=function(){}}),flowplayer.engine.flash=function(n,i){var a,o,r,s=n.conf;n.video;var l={pick:function(t){if(flowplayer.support.flashVideo){var n=e.grep(t,function(e){return"flash"==e.type})[0];if(n)return n;for(var i,a=0;a<t.length;a++)if(i=t[a],/mp4|flv/.test(i.type))return i}},load:function(l){function d(e){return e.replace(/&amp;/g,"%26").replace(/&/g,"%26").replace(/=/g,"%3D")}var u=e("video",i),c=d(l.src);is_absolute=/^https?:/.test(c);try{u.length>0&&flowplayer.support.video&&u[0].pause()}catch(p){}var f=function(){u.remove()},v=function(t){return e.grep(t,function(e){return!!u[0].canPlayType("video/"+e.type)}).length>0};if(flowplayer.support.video&&u.prop("autoplay")&&v(l.sources)?u.one("timeupdate",f):f(),is_absolute||s.rtmp||(c=e("<img/>").attr("src",c)[0].src),r)r.__play(c);else{a="fp"+(""+Math.random()).slice(3,15);var m={hostname:s.embedded?s.hostname:location.hostname,url:c,callback:"jQuery."+a};i.data("origin")&&(m.origin=i.data("origin")),is_absolute&&delete s.rtmp,e.each(["key","autoplay","preload","rtmp","loop","debug","preload","splash","bufferTime"],function(e,t){s[t]&&(m[t]=s[t])}),m.rtmp&&(m.rtmp=d(m.rtmp)),o=t(s.swf,m),o.prependTo(i),r=o[0],setTimeout(function(){try{if(!r.PercentLoaded())return i.trigger("error",[n,{code:7,url:s.swf}])}catch(e){}},5e3),e[a]=function(t,i){s.debug&&"status"!=t&&console.log("--",t,i);var a=e.Event(t);switch(t){case"ready":i=e.extend(l,i);break;case"click":a.flash=!0;break;case"keydown":a.which=i;break;case"seek":l.time=i;break;case"status":n.trigger("progress",i.time),i.buffer<l.bytes&&!l.buffered?(l.buffer=i.buffer/l.bytes*l.duration,n.trigger("buffer",l.buffer)):l.buffered||(l.buffered=!0,n.trigger("buffered"))}"buffered"!=t&&setTimeout(function(){n.trigger(a,i)},1)}}},speed:e.noop,unload:function(){r&&r.__unload&&r.__unload(),delete e[a],e("object",i).remove(),r=0}};e.each("pause,resume,seek,volume".split(","),function(e,t){l[t]=function(e){n.ready&&("seek"==t&&n.video.time&&!n.paused&&n.trigger("beforeseek"),void 0===e?r["__"+t]():r["__"+t](e))}});var d=e(window);return n.bind("ready fullscreen fullscreen-exit",function(t){var a=i.height(),o=i.width();if(n.conf.flashfit||/full/.test(t.type)){var r,s,l=n.isFullscreen,u=l&&F,c=!flowplayer.support.inlineBlock,p=l?u?screen.width:d.width():o,f=l?u?screen.height:d.height():a,v=0,m=0,g=c?o:"",h=c?a:"";(n.conf.flashfit||"fullscreen"===t.type)&&(r=n.video.width/n.video.height,s=n.video.height/n.video.width,h=Math.max(s*p),g=Math.max(r*f),h=h>f?g*s:h,h=Math.min(Math.round(h),f),g=g>p?h*r:g,g=Math.min(Math.round(g),p),m=Math.max(Math.round((f+m-h)/2),0),v=Math.max(Math.round((p+v-g)/2),0)),e("object",i).css({width:g,height:h,marginTop:m,marginLeft:v})}}),l};var v,m=e("<video/>")[0],g={ended:"finish",pause:"pause",play:"resume",progress:"buffer",timeupdate:"progress",volumechange:"volume",ratechange:"speed",seeked:"seek",loadeddata:"ready",error:"error",dataunavailable:"error"},h=function(t){return v?v.attr({type:i(t.type),src:t.src}):v=e("<video/>",{src:t.src,type:i(t.type),"class":"fp-engine",autoplay:"autoplay",preload:"none","x-webkit-airplay":"allow"})};flowplayer.engine.html5=function(t,i){function r(o,r,s){o.listeners&&o.listeners.hasOwnProperty(i.data("fp-player_id"))||((o.listeners||(o.listeners={}))[i.data("fp-player_id")]=!0,r.bind("error",function(n){try{if(n.originalEvent&&e(n.originalEvent.originalTarget).is("img"))return n.preventDefault();a(e(n.target).attr("type"))&&t.trigger("error",{code:4})}catch(i){}}),e.each(g,function(a,r){o.addEventListener(a,function(d){if("progress"==r&&d.srcElement&&0===d.srcElement.readyState&&setTimeout(function(){t.video.duration||(r="error",t.trigger(r,{code:4}))},1e4),f.debug&&!/progress/.test(r)&&console.log(a,"->",r,d),(t.ready||/ready|error/.test(r))&&r&&e("video",i).length){var u,p=e.Event(r);switch(r){case"ready":u=e.extend(s,{duration:o.duration,width:o.videoWidth,height:o.videoHeight,url:o.currentSrc,src:o.currentSrc});try{u.seekable=o.seekable&&o.seekable.end(null)}catch(v){}if(l=l||setInterval(function(){try{u.buffer=o.buffered.end(null)}catch(e){}u.buffer&&(n(u.buffer,1e3)<n(u.duration,1e3)&&!u.buffered?t.trigger("buffer",d):u.buffered||(u.buffered=!0,t.trigger("buffer",d).trigger("buffered",d),clearInterval(l),l=0))},250),!f.live&&!u.duration&&!c.hlsDuration&&"loadeddata"===a){var m=function(){u.duration=o.duration;try{u.seekable=o.seekable&&o.seekable.end(null)}catch(e){}t.trigger(p,u),o.removeEventListener("durationchange",m)};return o.addEventListener("durationchange",m),void 0}break;case"progress":case"seek":if(t.video.duration,o.currentTime>0){u=Math.max(o.currentTime,0);break}if("progress"==r)return;case"speed":u=n(o.playbackRate);break;case"volume":u=n(o.volume);break;case"error":try{u=(d.srcElement||d.originalTarget).error}catch(g){return}}t.trigger(p,u)}},!1)}))}var s,l,d,u=e("video",i),c=flowplayer.support,p=e("track",u),f=t.conf;return s={pick:function(e){if(c.video){if(f.videoTypePreference){var t=o(e,f.videoTypePreference);if(t)return t}for(var n=0;n<e.length;n++)if(a(e[n].type))return e[n]}},load:function(n){if(f.splash&&!d)u=h(n).prependTo(i),c.inlineVideo||u.css({position:"absolute",top:"-9999em"}),p.length&&u.append(p.attr("default","")),f.loop&&u.attr("loop","loop"),d=u[0];else{d=u[0];var a=u.find("source");!d.src&&a.length&&(d.src=n.src,a.remove()),t.video.src&&n.src!=t.video.src?(u.attr("autoplay","autoplay"),d.src=n.src):"none"!=f.preload&&c.dataload||(c.zeropreload?t.trigger("ready",n).trigger("pause").one("ready",function(){i.trigger("resume")}):t.one("ready",function(){i.trigger("pause")}))}r(d,e("source",u).add(u),n),"none"==f.preload&&c.zeropreload&&c.dataload||d.load(),f.splash&&d.load()},pause:function(){d.pause()},resume:function(){d.play()},speed:function(e){d.playbackRate=e},seek:function(e){try{var n=t.paused;d.currentTime=e,n&&d.pause()}catch(i){}},volume:function(e){d.volume=e},unload:function(){e("video.fp-engine",i).remove(),c.cachedVideoTag||(v=null),l=clearInterval(l),d=0}}};var y=/\.(\w{3,4})(\?.*)?$/i;e.throttle=function(e,t){var n;return function(){n||(e.apply(this,arguments),n=1,setTimeout(function(){n=0},t))}},e.fn.slider2=function(t){var n=/iPad/.test(navigator.userAgent)&&!/CriOS/.test(navigator.userAgent);return this.each(function(){var i,a,o,r,s,l,d,u,c=e(this),p=e(document),f=c.children(":last"),v=!1,m=function(){a=c.offset(),o=c.width(),r=c.height(),l=s?r:o,u=b(d)},g=function(e){i||e==w.value||d&&!(d>e)||(c.trigger("slide",[e]),w.value=e)},h=function(e){var n=e.pageX;!n&&e.originalEvent&&e.originalEvent.touches&&e.originalEvent.touches.length&&(n=e.originalEvent.touches[0].pageX);var i=s?e.pageY-a.top:n-a.left;i=Math.max(0,Math.min(u||l,i));var o=i/l;return s&&(o=1-o),t&&(o=1-o),y(o,0,!0)},y=function(e,t){void 0===t&&(t=0),e>1&&(e=1);var i=Math.round(1e3*e)/10+"%";return(!d||d>=e)&&(n||f.stop(),v?f.css("width",i):f.animate(s?{height:i}:{width:i},t,"linear")),e},b=function(e){return Math.max(0,Math.min(l,s?(1-e)*r:e*o))},w={max:function(e){d=e},disable:function(e){i=e},slide:function(e,t,n){m(),n&&g(e),y(e,t)},disableAnimation:function(e){v=e!==!1}};m(),c.data("api",w).bind("mousedown.sld touchstart",function(t){if(t.preventDefault(),!i){var n=e.throttle(g,100);m(),w.dragging=!0,c.addClass("is-dragging"),g(h(t)),p.bind("mousemove.sld touchmove",function(e){e.preventDefault(),n(h(e))}).one("mouseup touchend",function(){w.dragging=!1,c.removeClass("is-dragging"),p.unbind("mousemove.sld touchmove")})}})})},flowplayer(function(t,n){function i(t){return e(".fp-"+t,n)}function a(t){("0px"===n.css("width")||"0px"===n.css("height")||t!==flowplayer.defaults.ratio)&&(parseInt(y,10)||m.css("paddingTop",100*t+"%")),l.inlineBlock||e("object",n).height(n.height())}function o(e){n.toggleClass("is-mouseover",e).toggleClass("is-mouseout",!e)}var r,s=t.conf,l=flowplayer.support;n.find(".fp-ratio,.fp-ui").remove(),n.addClass("flowplayer").append('      <div class="ratio"/>      <div class="ui">         <div class="waiting"><em/><em/><em/></div>         <a class="fullscreen"/>         <a class="unload"/>         <p class="speed"/>         <div class="controls">            <a class="play"></a>            <div class="timeline">               <div class="buffer"/>               <div class="progress"/>            </div>            <div class="volume">               <a class="mute"></a>               <div class="volumeslider">                  <div class="volumelevel"/>               </div>            </div>         </div>         <div class="time">            <em class="elapsed">00:00</em>            <em class="remaining"/>            <em class="duration">00:00</em>         </div>         <div class="message"><h2/><p/></div>      </div>'.replace(/class="/g,'class="fp-'));var u=i("progress"),c=i("buffer"),p=i("elapsed"),f=i("remaining"),v=i("waiting"),m=i("ratio"),g=i("speed"),h=i("duration"),y=m.css("paddingTop"),b=i("timeline").slider2(t.rtl),w=b.data("api"),k=(i("volume"),i("fullscreen")),x=i("volumeslider").slider2(t.rtl),C=x.data("api"),T=n.is(".fixed-controls, .no-toggle");w.disableAnimation(n.hasClass("is-touch")),l.animation||v.html("<p>loading &hellip;</p>"),a(s.ratio);try{s.fullscreen||k.remove()}catch(S){k.remove()}t.bind("ready",function(){var e=t.video.duration;w.disable(t.disabled||!e),s.adaptiveRatio&&a(t.video.height/t.video.width),h.add(f).html(d(e)),e>=3600&&n.addClass("is-long")||n.removeClass("is-long"),C.slide(t.volumeLevel)}).bind("unload",function(){y||m.css("paddingTop","")}).bind("buffer",function(){var e=t.video,n=e.buffer/e.duration;!e.seekable&&l.seekable&&w.max(n),1>n?c.css("width",100*n+"%"):c.css({width:"100%"})}).bind("speed",function(e,t,n){g.text(n+"x").addClass("fp-hilite"),setTimeout(function(){g.removeClass("fp-hilite")},1e3)}).bind("buffered",function(){c.css({width:"100%"}),w.max(1)}).bind("progress",function(){var e=t.video.time,n=t.video.duration;w.dragging||w.slide(e/n,t.seeking?0:250),p.html(d(e)),f.html("-"+d(n-e))}).bind("finish resume seek",function(e){n.toggleClass("is-finished","finish"==e.type)}).bind("stop",function(){p.html(d(0)),w.slide(0,100)}).bind("finish",function(){p.html(d(t.video.duration)),w.slide(1,100),n.removeClass("is-seeking")}).bind("beforeseek",function(){u.stop()}).bind("volume",function(){C.slide(t.volumeLevel)}).bind("disable",function(){var e=t.disabled;w.disable(e),C.disable(e),n.toggleClass("is-disabled",t.disabled)}).bind("mute",function(e,t,i){n.toggleClass("is-muted",i)}).bind("error",function(t,i,a){if(n.removeClass("is-loading").addClass("is-error"),a){a.message=s.errors[a.code],i.error=!0;var o=e(".fp-message",n);e("h2",o).text((i.engine||"html5")+": "+a.message),e("p",o).text(a.url||i.video.url||i.video.src||s.errorUrls[a.code]),n.unbind("mouseenter click").removeClass("is-mouseover")}}).bind("mouseenter mouseleave",function(e){if(!T){var t,i="mouseenter"==e.type;o(i),i?(n.bind("pause.x mousemove.x volume.x",function(){o(!0),t=new Date}),r=setInterval(function(){new Date-t>5e3&&(o(!1),t=new Date)},100)):(n.unbind(".x"),clearInterval(r))}}).bind("mouseleave",function(){(w.dragging||C.dragging)&&n.addClass("is-mouseover").removeClass("is-mouseout")}).bind("click.player",function(n){return e(n.target).is(".fp-ui, .fp-engine")||n.flash?(n.preventDefault(),t.toggle()):void 0}).bind("contextmenu",function(t){t.preventDefault();var i=n.offset(),a=e(window),o=t.clientX-i.left,r=t.clientY-i.top+a.scrollTop(),s=n.find(".fp-context-menu").css({left:o+"px",top:r+"px",display:"block"}).on("click",function(e){e.stopPropagation()});e("html").on("click.outsidemenu",function(){s.hide(),e("html").off("click.outsidemenu")})}),s.poster&&n.css("backgroundImage","url("+s.poster+")");var F=n.css("backgroundColor"),E="none"!=n.css("backgroundImage")||F&&"rgba(0, 0, 0, 0)"!=F&&"transparent"!=F;!E||s.splash||s.autoplay||t.bind("ready stop",function(){n.addClass("is-poster").one("progress",function(){n.removeClass("is-poster")})}),!E&&t.forcedSplash&&n.css("backgroundColor","#555"),e(".fp-toggle, .fp-play",n).click(t.toggle),e.each(["mute","fullscreen","unload"],function(e,n){i(n).click(function(){t[n]()})}),b.bind("slide",function(e,n){t.seeking=!0,t.seek(n*t.video.duration)}),x.bind("slide",function(e,n){t.volume(n)}),i("time").click(function(){e(this).toggleClass("is-inverted")}),o(T)});var b,w,k="is-help";e(document).bind("keydown.fp",function(t){var n=b,i=t.ctrlKey||t.metaKey||t.altKey,a=t.which,o=n&&n.conf;if(n&&o.keyboard&&!n.disabled){if(-1!=e.inArray(a,[63,187,191]))return w.toggleClass(k),!1;if(27==a&&w.hasClass(k))return w.toggleClass(k),!1;if(!i&&n.ready){if(t.preventDefault(),t.shiftKey)return 39==a?n.speed(!0):37==a&&n.speed(!1),void 0;if(58>a&&a>47)return n.seekTo(a-48);switch(a){case 38:case 75:n.volume(n.volumeLevel+.15);break;case 40:case 74:n.volume(n.volumeLevel-.15);break;case 39:case 76:n.seeking=!0,n.seek(!0);break;case 37:case 72:n.seeking=!0,n.seek(!1);break;case 190:n.seekTo();break;case 32:n.toggle();break;case 70:o.fullscreen&&n.fullscreen();break;case 77:n.mute();break;case 81:n.unload()}}}}),flowplayer(function(t,n){t.conf.keyboard&&(n.bind("mouseenter mouseleave",function(e){b=t.disabled||"mouseenter"!=e.type?0:t,b&&(w=n)}),n.append('      <div class="fp-help">         <a class="fp-close"></a>         <div class="fp-help-section fp-help-basics">            <p><em>space</em>play / pause</p>            <p><em>q</em>unload | stop</p>            <p><em>f</em>fullscreen</p>            <p><em>shift</em> + <em>&#8592;</em><em>&#8594;</em>slower / faster <small>(latest Chrome and Safari)</small></p>         </div>         <div class="fp-help-section">            <p><em>&#8593;</em><em>&#8595;</em>volume</p>            <p><em>m</em>mute</p>         </div>         <div class="fp-help-section">            <p><em>&#8592;</em><em>&#8594;</em>seek</p>            <p><em>&nbsp;. </em>seek to previous            </p><p><em>1</em><em>2</em>&hellip;<em>6</em> seek to 10%, 20%, &hellip;60% </p>         </div>      </div>   '),t.conf.tooltip&&e(".fp-ui",n).attr("title","Hit ? for help").on("mouseout.tip",function(){e(this).removeAttr("title").off("mouseout.tip")}),e(".fp-close",n).click(function(){n.toggleClass(k)}))});var x,C=e.browser.mozilla?"moz":"webkit",T="fullscreen",S="fullscreen-exit",F=flowplayer.support.fullscreen,E="function"==typeof document.exitFullscreen,_=navigator.userAgent.toLowerCase(),M=/(safari)[ \/]([\w.]+)/.exec(_)&&!/(chrome)[ \/]([\w.]+)/.exec(_);e(document).bind(E?"fullscreenchange":C+"fullscreenchange",function(t){var n=e(document.webkitCurrentFullScreenElement||document.mozFullScreenElement||document.fullscreenElement||t.target);n.length&&!x?x=n.trigger(T,[n]):(x.trigger(S,[x]),x=null)}),flowplayer(function(t,n){if(t.conf.fullscreen){var i,a=e(window),o={index:0,pos:0,play:!1};t.isFullscreen=!1,t.fullscreen=function(r){return t.disabled?void 0:(void 0===r&&(r=!t.isFullscreen),r&&(i=a.scrollTop()),"webkit"!=C&&!M||"flash"!=t.engine||(o.index=t.video.index,t.conf.rtmp&&e.extend(o,{pos:t.video.time,play:t.playing})),F?r?E?n[0].requestFullscreen():(n[0][C+"RequestFullScreen"](Element.ALLOW_KEYBOARD_INPUT),!M||document.webkitCurrentFullScreenElement||document.mozFullScreenElement||n[0][C+"RequestFullScreen"]()):E?document.exitFullscreen():document[C+"CancelFullScreen"]():t.trigger(r?T:S,[t]),t)};var r;n.bind("mousedown.fs",function(){+new Date-r<150&&t.ready&&t.fullscreen(),r=+new Date}),t.bind(T,function(){n.addClass("is-fullscreen"),t.isFullscreen=!0}).bind(S,function(){n.removeClass("is-fullscreen"),t.isFullscreen=!1,a.scrollTop(i)}).bind("ready",function(){o.index>0?(t.play(o.index),o.index=0):o.pos&&!isNaN(o.pos)&&t.resume().seek(o.pos,function(){o.play||t.pause(),e.extend(o,{pos:0,play:!1})})})}}),flowplayer(function(t,n){function i(){return e(o.query,n)}function a(){return e(o.query+"."+r,n)}var o=e.extend({active:"is-active",advance:!0,query:".fp-playlist a"},t.conf),r=o.active;t.play=function(n){return void 0===n?t.resume():"number"!=typeof n||t.conf.playlist[n]?("number"!=typeof n&&t.load.apply(null,arguments),t.unbind("resume.fromfirst"),t.video.index=n,t.load("string"==typeof t.conf.playlist[n]?t.conf.playlist[n].toString():e.map(t.conf.playlist[n],function(t){return e.extend({},t)})),t):t},t.next=function(e){e&&e.preventDefault();var n=t.video.index;return-1!=n&&(n=n===t.conf.playlist.length-1?0:n+1,t.play(n)),t},t.prev=function(e){e&&e.preventDefault();var n=t.video.index;return-1!=n&&(n=0===n?t.conf.playlist.length-1:n-1,t.play(n)),t},e(".fp-next",n).click(t.next),e(".fp-prev",n).click(t.prev),o.advance&&n.unbind("finish.pl").bind("finish.pl",function(e,t){var i=t.video.index+1;i<t.conf.playlist.length||o.loop?(i=i===t.conf.playlist.length?0:i,n.removeClass("is-finished"),setTimeout(function(){t.play(i)})):(n.addClass("is-playing"),t.conf.playlist.length>1&&t.one("resume.fromfirst",function(){return t.play(0),!1}))});var s=!1;if(t.conf.playlist.length){s=!0;var l=n.find(".fp-playlist");if(!l.length){l=e('<div class="fp-playlist"></div>');var d=e(".fp-next,.fp-prev",n);d.length?d.eq(0).before(l):e("video",n).after(l)}l.empty(),e.each(t.conf.playlist,function(t,n){var i;if("string"==typeof n)i=n;else for(var a in n[0])if(n[0].hasOwnProperty(a)){i=n[0][a];break}l.append(e("<a />").attr({href:i,"data-index":t}))})}if(i().length){s||(t.conf.playlist=[],i().each(function(){var n=e(this).attr("href");e(this).attr("data-index",t.conf.playlist.length),t.conf.playlist.push(n)})),n.on("click",o.query,function(n){n.preventDefault();var i=e(n.target).closest(o.query),a=Number(i.attr("data-index"));-1!=a&&t.play(a)});var u=i().filter("[data-cuepoints]").length;t.bind("load",function(i,o,s){var l=a().removeClass(r),d=l.attr("data-index"),c=s.index=t.video.index||0,p=e('a[data-index="'+c+'"]',n).addClass(r),f=c==t.conf.playlist.length-1;n.removeClass("video"+d).addClass("video"+c).toggleClass("last-video",f),s.index=o.video.index=c,s.is_last=o.video.is_last=f,u&&(t.cuepoints=p.data("cuepoints"))}).bind("unload.pl",function(){a().toggleClass(r)})}t.conf.playlist.length&&(t.conf.loop=!1)});var D=/ ?cue\d+ ?/;flowplayer(function(t,n){function i(e){n[0].className=n[0].className.replace(D," "),e>=0&&n.addClass("cue"+e)}var a=0;t.cuepoints=t.conf.cuepoints||[],t.bind("progress",function(e,o,r){if(a&&.015>r-a)return a=r;a=r;for(var s,l=t.cuepoints||[],d=0;d<l.length;d++)s=l[d],isNaN(s)||(s={time:s}),s.time<0&&(s.time=t.video.duration+s.time),s.index=d,Math.abs(s.time-r)<.125*t.currentSpeed&&(i(d),n.trigger("cuepoint",[t,s]))}).bind("unload seek",i),t.conf.generate_cuepoints&&t.bind("load",function(){e(".fp-cuepoint",n).remove()}).bind("ready",function(){var i=t.cuepoints||[],a=t.video.duration,o=e(".fp-timeline",n).css("overflow","visible");e.each(i,function(n,i){var r=i.time||i;0>r&&(r=a+i);var s=e("<a/>").addClass("fp-cuepoint fp-cuepoint"+n).css("left",100*(r/a)+"%");s.appendTo(o).mousedown(function(){return t.seek(r),!1})})})}),flowplayer(function(t,n){function i(e){var t=e.split(":");return 2==t.length&&t.unshift(0),60*60*t[0]+60*t[1]+parseFloat(t[2].replace(",","."))}var a=e("track",n),o=t.conf;if(!flowplayer.support.subtitles||(t.subtitles=a.length&&a[0].track,!o.nativesubtitles||"html5"!=o.engine)){a.remove();var r=/^(([0-9]{2}:)?[0-9]{2}:[0-9]{2}[,.]{1}[0-9]{3}) --\> (([0-9]{2}:)?[0-9]{2}:[0-9]{2}[,.]{1}[0-9]{3})(.*)/;t.subtitles=[];var s=a.attr("src");if(s){setTimeout(function(){e.get(s,function(n){for(var a,o,s,l,d=0,u=n.split("\n"),c=u.length,p={};c>d;d++)if(o=r.exec(u[d])){for(a=u[d-1],s="<p>"+u[++d]+"</p><br/>";e.trim(u[++d])&&d<u.length;)s+="<p>"+u[d]+"</p><br/>";p={title:a,startTime:i(o[1]),endTime:i(o[2]||o[3]),text:s},l={time:p.startTime,subtitle:p},t.subtitles.push(p),t.cuepoints.push(l),t.cuepoints.push({time:p.endTime,subtitleEnd:a}),0===p.startTime&&t.trigger("cuepoint",l)}}).fail(function(){return t.trigger("error",{code:8,url:s}),!1})});var l,d=e("<div class='fp-subtitle'/>").appendTo(n);t.bind("cuepoint",function(e,t,n){n.subtitle?(l=n.index,d.html(n.subtitle.text).addClass("fp-active")):n.subtitleEnd&&(d.removeClass("fp-active"),l=n.index)}).bind("seek",function(n,i,a){l&&t.cuepoints[l]&&t.cuepoints[l].time>a&&(d.removeClass("fp-active"),l=null),e.each(t.cuepoints||[],function(e,n){var i=n.subtitle;i&&l!=n.index?a>=n.time&&(!i.endTime||a<=i.endTime)&&t.trigger("cuepoint",n):n.subtitleEnd&&a>=n.time&&n.index==l+1&&t.trigger("cuepoint",n)})})}}}),flowplayer(function(t,n){function i(){if(o&&"undefined"!=typeof _gat){var e=_gat._getTracker(a),i=t.video;e._setAllowLinker(!0),e._trackEvent("Video / Seconds played",t.engine+"/"+i.type,n.attr("title")||i.src.split("/").slice(-1)[0].replace(y,""),Math.round(o/1e3)),o=0}}var a=t.conf.analytics,o=0,r=0;a&&("undefined"==typeof _gat&&e.getScript("//google-analytics.com/ga.js"),t.bind("load unload",i).bind("progress",function(){t.seeking||(o+=r?+new Date-r:0,r=+new Date)}).bind("pause",function(){r=0}),e(window).unload(i))});var A=/IEMobile/.test(p);(flowplayer.support.touch||A)&&flowplayer(function(t,n){var i=/Android/.test(p)&&!/Firefox/.test(p)&&!/Opera/.test(p),a=/Silk/.test(p),o=i?parseFloat(/Android\ (\d\.\d)/.exec(p)[1],10):0;if(i&&(t.conf.videoTypePreference="mp4",!/Chrome/.test(p)&&4>o)){var r=t.load;t.load=function(){var e=r.apply(t,arguments);return t.trigger("ready",t,t.video),e}}flowplayer.support.volume||n.addClass("no-volume no-mute"),n.addClass("is-touch"),n.find(".fp-timeline").data("api").disableAnimation();var s=!1;n.bind("touchmove",function(){s=!0}).bind("touchend click",function(){return s?(s=!1,void 0):t.playing&&!n.hasClass("is-mouseover")?(n.addClass("is-mouseover").removeClass("is-mouseout"),!1):(t.paused&&n.hasClass("is-mouseout")&&!t.splash&&t.toggle(),t.paused&&A&&e("video.fp-engine",n)[0].play(),void 0)
}),t.conf.native_fullscreen&&"function"==typeof e("<video />")[0].webkitEnterFullScreen&&(t.fullscreen=function(){var t=e("video.fp-engine",n);t[0].webkitEnterFullScreen(),t.one("webkitendfullscreen",function(){t.prop("controls",!0).prop("controls",!1)})}),(i||a)&&t.bind("ready",function(){var i=e("video.fp-engine",n);i.one("canplay",function(){i[0].play()}),i[0].play(),t.bind("progress.dur",function(){var a=i[0].duration;1!==a&&(t.video.duration=a,e(".fp-duration",n).html(d(a)),t.unbind("progress.dur"))})})}),flowplayer(function(t,n){if(t.conf.embed!==!1){var i=t.conf,a=e(".fp-ui",n),o=e("<a/>",{"class":"fp-embed",title:"Copy to your site"}).appendTo(a),r=e("<div/>",{"class":"fp-embed-code"}).append("<label>Paste this HTML code on your site to embed.</label><textarea/>").appendTo(a),s=e("textarea",r);t.embedCode=function(){var a=t.video,o=a.width||n.width(),r=a.height||n.height(),s=e("<div/>",{"class":"flowplayer",css:{width:o,height:r}}),l=e("<video/>").appendTo(s);e.each(["origin","analytics","key","rtmp"],function(e,t){i[t]&&s.attr("data-"+t,i[t])}),i.logo&&s.attr("data-logo",e("<img />").attr("src",i.logo)[0].src),e.each(a.sources,function(t,n){var a=n.src;(!/^https?:/.test(n.src)&&"flash"!==n.type||!i.rtmp)&&(a=e("<img/>").attr("src",n.src)[0].src),l.append(e("<source/>",{type:"video/"+n.type,src:a}))});var d={src:"//embed.flowplayer.org/5.4.4/embed.min.js"};e.isPlainObject(i.embed)&&(d["data-swf"]=i.embed.swf,d["data-library"]=i.embed.library,d.src=i.embed.script||d.src,i.embed.skin&&(d["data-skin"]=i.embed.skin));var u=e("<foo/>",d).append(s);return e("<p/>").append(u).html().replace(/<(\/?)foo/g,"<$1script")},n.fptip(".fp-embed","is-embedding"),s.click(function(){this.select()}),o.click(function(){s.text(t.embedCode()),s[0].focus(),s[0].select()})}}),e.fn.fptip=function(t,n){return this.each(function(){function i(){a.removeClass(n),e(document).unbind(".st")}var a=e(this);e(t||"a",this).click(function(t){t.preventDefault(),a.toggleClass(n),a.hasClass(n)&&e(document).bind("keydown.st",function(e){27==e.which&&i()}).bind("click.st",function(t){e(t.target).parents("."+n).length||i()})})})}}(jQuery);flowplayer(function(e,o){function l(e){var o=a("<a/>")[0];return o.href=e,o.hostname}var a=jQuery,r=e.conf,i=r.swf.indexOf("flowplayer.org")&&r.e&&o.data("origin"),n=i?l(i):location.hostname,t=r.key;if("file:"==location.protocol&&(n="localhost"),e.load.ed=1,r.hostname=n,r.origin=i||location.href,i&&o.addClass("is-embedded"),"string"==typeof t&&(t=t.split(/,\s*/)),t&&"function"==typeof key_check&&key_check(t,n))r.logo&&o.append(a("<a>",{"class":"fp-logo",href:i}).append(a("<img/>",{src:r.logo})));else{var s=a("<a/>").attr("href","http://flowplayer.org").appendTo(o);a(".fp-controls",o);var p=a('<div class="fp-context-menu"><ul><li class="copyright">&copy; 2013</li><li><a href="http://flowplayer.org">About Flowplayer</a></li><li><a href="http://flowplayer.org/license">GPL based license</a></li></ul></div>').appendTo(o);e.bind("pause resume finish unload",function(e,l){var r=-1;l.video.src&&a.each([["org","flowplayer","drive"],["org","flowplayer","my"]],function(e,o){return r=l.video.src.indexOf("://"+o.reverse().join(".")),-1===r}),/pause|resume/.test(e.type)&&"flash"!=l.engine&&4!=r&&5!=r?(s.show().css({position:"absolute",left:16,bottom:36,zIndex:99999,width:100,height:20,backgroundImage:"url("+[".png","logo","/",".net",".cloudfront","d32wqyuo10o653","//"].reverse().join("")+")"}),l.load.ed=s.is(":visible")&&a.contains(o[0],p[0]),l.load.ed||l.pause()):s.hide()})}});