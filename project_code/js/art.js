//Canvas & WebRTC Prep
var video  = document.querySelector('video');
var canvas = document.querySelector('canvas');
var ctx    = canvas.getContext('2d');
var localMediaStream = null;

//Drawing Prep
var apertureHeight = 50;
var apertureWidth  = 50;
var frameRate = 1/6; //fps

//Audio Prep
var scale = 7;
var context = new AudioContext();
var oscillator = context.createOscillator();

oscillator.frequency.value = 0;
amp = context.createGain();
amp.gain.value = 1;
oscillator.connect(amp);
amp.connect(context.destination);
oscillator.start(0);

//Start Event Listening for User Toggles
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

$('#apertureSize').change(function(){
  apertureHeight = parseInt($(this).val());
  apertureWidth  = parseInt($(this).val());
});
$('#frameRate').change(function(){
  frameRate = parseInt(1/$(this).val());
});
$('#scale').change(function(){
  scale = parseInt($(this).val());
});
$('#default').click(function(){
  scale = 7;
  apertureHeight = 50;
  apertureWidth  = 50;
  frameRate = 1/6;

  $('#scale').val(scale);
  $('#apertureSize').val(apertureHeight);
  $('#frameRate').val(1/frameRate);
});

//Start WebRTC
navigator.webkitGetUserMedia({video: true}, function(stream) {
    video.src = window.URL.createObjectURL(stream);
    localMediaStream = stream;
    snapshot();
}, function(){alert('Your browser does not support WebRTC! Download Google Chrome to continue.');});

//Gathers color data points, converts and outputs relevant pitch
function snapshot() {
    if (localMediaStream) {
        ctx.drawImage(video, 0, 0);
			
				//draw aperture
				var x = (canvas.clientWidth/2)  - (apertureWidth/2);
				var y = (canvas.clientHeight/2) - (apertureHeight/2);
				ctx.rect(x, y, apertureWidth, apertureHeight);
				ctx.stroke();
			
				//get color data from aperture
				var data = ctx.getImageData(x, y, apertureWidth, apertureHeight).data;

				//get average color from aperture data
				var avgData = getAverageRGB(data);

				//convert to HSL from default RGB
				var HSL = rgbToHSL(avgData[0], avgData[1], avgData[2]);

				//decide what pitch to use based on Hue, Lightness
				var height   = Math.pow(2, Math.floor(scale+(HSL[2]/20))); //calc height, from C-(scale) to C-(scale+5), from lightness
				var end      = Math.pow(2, Math.floor(scale+(HSL[2]/20))+1); //end of chosen scale
				var pitch    = height+(((end-height)/360)*HSL[0]); //find pitch in our scale range, based on hue
				var loudness = HSL[1]/100 + 0.5; //calc loudness, based on saturation
			
        //setInterval used instead of for-loop to spread out outputting of pitches
        setTimeout(function(){
						console.log(frameRate);
						//output the calculated pitch
						var now = context.currentTime;
						oscillator.frequency.cancelScheduledValues(now);
						oscillator.frequency.linearRampToValueAtTime(pitch, now+frameRate);
						amp.gain.cancelScheduledValues(now);
						amp.gain.linearRampToValueAtTime(loudness, now+frameRate);
						window.requestAnimationFrame(snapshot);
        }, frameRate * 1000);
    }
}

// Borrowed from: https://gist.github.com/mjijackson/5311256
function rgbToHSL(r, g, b) {
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

    if (h > 270) h = 270; // Nothing corresponding to magenta in the light spectrum

    return [ h, s, l ];
}

function getAverageRGB(data) {
		var r = 0;
		var g = 0;
		var b = 0;
	
		for(var i = 0; i < data.length; i+=4) {
				r += data[i];
				g += data[i+1];
				b += data[i+2];
		}
		r /= data.length/4;
		g /= data.length/4;
		b /= data.length/4;
	
		return [ r, g, b ];
}
