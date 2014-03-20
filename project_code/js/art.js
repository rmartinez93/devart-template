//chrome.app.window.current().fullscreen();
//Canvas & WebRTC Prep
var video;
var canvas;
var ctx;
var localMediaStream = null;

//Drawing Prep
var index = 0;
var x = 0;
var y = 0;
var size = 50;

var numSquares = 30;
var frameRate = 150;

//Audio Prep
var scale = 15;
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
  numSquares = $(this).val();
});
$('#squareSize').change(function(){
  size = $(this).val();
});
$('#frameRate').change(function(){
  frameRate = $(this).val();
});
$('#scale').change(function(){
  scale = $(this).val();
});
$('#default').click(function(){
  scale = 15;
  size = 50;
  numSquares = 30;
  frameRate = 150;
  
  $('#scale').val(scale);
  $('#squareSize').val(size);
  $('#numPoints').val(numSquares);
  $('#frameRate').val(frameRate);
});
$('#songMode').click(function(){
  scale = 1;
  size = 50;
  numSquares = 1;
  frameRate = 260;
  
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
            var now = context.currentTime;
            if(data[0]+data[1]+data[2] > 200) {
                oscillator.frequency.setValueAtTime((data[0]+data[1]+data[2])*scale, now);
                amp.gain.cancelScheduledValues(now);
                amp.gain.setValueAtTime(amp.gain.value, now);
                amp.gain.linearRampToValueAtTime(0.5, context.currentTime + 0.1);
            }
            ctx.fillStyle="rgba("+data[0]+","+data[1]+","+data[2]+",1)";

            if(index == 0) ctx.fillRect(x - (size/2), y - (size/2), size, size);

            else {
                ctx.beginPath();
                ctx.moveTo(x-15, y-26);
                ctx.lineTo(x+15, y-26);
                ctx.lineTo(x+30, y);
                ctx.lineTo(x+15, y+26);
                ctx.lineTo(x-15, y+26);
                ctx.lineTo(x-30, y);
                ctx.closePath();
                ctx.fill();
            }
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