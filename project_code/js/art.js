//chrome.app.window.current().fullscreen();
//Canvas & WebRTC Prep
var video;
var canvas;
var ctx;
var localMediaStream = null;

//Drawing Prep
var x = 0;
var y = 0;
var size = 50;

var numSquares = 30;
var frameRate = 150;

//Audio Prep
var scale = 7;
var context = new webkitAudioContext();
var oscillator = context.createOscillator();
oscillator.frequency.value = 0;
amp = context.createGainNode();
amp.gain.value = 1;
oscillator.connect(amp);
amp.connect(context.destination);
oscillator.start(0);

video = document.querySelector('video');
canvas = document.querySelector('canvas');
ctx = canvas.getContext('2d');
  
//Start Event Listening
//$('body').click(function(){ index = (index+1)%2; });
$('#toggle').click(function() {
  var $righty = $(this).next();
  $righty.animate({
    right: parseInt($righty.css('right'),10) == -2 ?
      -$righty.outerWidth() :
      -2
  });
  $(this).animate({
    right: parseInt($righty.css('right'),10) == -2 ?
      -2 :
      $righty.outerWidth()-4
  });
});
$('#numPoints').change(function(){
  numSquares = parseInt($(this).val());
});
$('#squareSize').change(function(){
  size = parseInt($(this).val());
});
$('#frameRate').change(function(){
  frameRate = parseInt($(this).val());
});
$('#scale').change(function(){
  scale = parseInt($(this).val());
});
$('#default').click(function(){
  scale = 7;
  size = 50;
  numSquares = 30;
  frameRate = 150;
  
  $('#scale').val(scale);
  $('#squareSize').val(size);
  $('#numPoints').val(numSquares);
  $('#frameRate').val(frameRate);
});
$('#songMode').click(function(){
  scale = 5;
  size = 50;
  numSquares = 1;
  frameRate = 200;
  
  $('#scale').val(scale);
  $('#squareSize').val(size);
  $('#numPoints').val(numSquares);
  $('#frameRate').val(frameRate);
});


//Start WebRTC
navigator.webkitGetUserMedia({video: true}, function(stream) {
    video.src = window.URL.createObjectURL(stream);
    localMediaStream = stream;
    snapshot();
}, function(){alert('error');});

//Start Animation
window.requestAnimFrame = (function(callback) {
    return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame ||
    function(callback) {
        window.setTimeout(callback, 1000 / 60);
    };
})();
    
//Draw on Frame
function snapshot() {
    if (localMediaStream) {
        ctx.drawImage(video, 0, 0);
        var counter = 0;
        var interval = setInterval(function(){
        counter++;
        if(counter <= numSquares) {
            x = Math.floor(Math.random()*canvas.clientWidth);
            y = Math.floor(Math.random()*canvas.clientHeight);
            
            data = ctx.getImageData(x, y, 1, 1).data;

            var HSL = rgbToHsl(data[0], data[1], data[2]);
          
            var height   = Math.pow(2, Math.floor(scale+(HSL[2]/20))); //find proper height, from C-(scale) to C-(scale+5), based on lightness
            var end      = Math.pow(2, Math.floor(scale+(HSL[2]/20))+1); //end of chosen scale
            var pitch    = height+(((end-height)/360)*HSL[0]); //find pitch in our scale range, based on hue
            var loudness = HSL[1]*5; //TODO: find loudness, based on saturation

            var now = context.currentTime;
            oscillator.frequency.setValueAtTime(pitch, now);
            amp.gain.cancelScheduledValues(now);
            amp.gain.setValueAtTime(amp.gain.value, now);
            amp.gain.linearRampToValueAtTime(0.5, context.currentTime + 0.1);

            ctx.fillStyle="hsla("+Math.floor(HSL[0])+","+Math.floor(HSL[1])+"%,"+Math.floor(HSL[2])+"%, 1)";
            ctx.fillRect(x - (size/2), y - (size/2), size, size);
        }
        else {
            clearInterval(interval);
        }
        }, frameRate/numSquares);
        requestAnimFrame(function() {
            setTimeout(snapshot,frameRate);
        });
    }
}

// Borrowed from: https://gist.github.com/mjijackson/5311256
function rgbToHsl(r, g, b) {
    r /= 255, g /= 255, b /= 255;
   
    var max = Math.max(r, g, b), min = Math.min(r, g, b);
    var h, s, l = (max + min) / 2;
   
    if (max == min) {
      h = s = 0; // achromatic
    } else {
      var d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
   
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
   
      h /= 6;
    }
    h = h*360;
    s = s*100;
    l = l*100;
  
    if (h > 270)    h = 270; // Nothing corresponding to magenta in the light spectrum
   
    return [ h, s, l ];
}

/*
//Tilt Variables
var tiltLR = 0;
var tiltFB;
var dir;

//Cange position of squares based on accelerometer. Disabled due to general ickiness.
function trueXval(x) {
    var offset = (canvas.clientWidth/90)*(tiltFB);
    x = x + offset;
    if(x >= canvas.clientWidth) x = (canvas.clientWidth-1);
    if(x < 0) x = 0;
    return Math.floor(x);
} 
//Start Orientation Watching
if (window.DeviceOrientationEvent) {
    // Listen for the deviceorientation event and handle the raw data
    window.addEventListener('deviceorientation', function(eventData) {
      // gamma is the left-to-right tilt in degrees, where right is positive
      tiltLR = eventData.gamma;
      // beta is the front-to-back tilt in degrees, where front is positive
      tiltFB = eventData.beta;
      // alpha is the compass direction the device is facing in degrees
      dir = eventData.alpha;
    }, false);
} else alert('error');
*/  