const video = document.getElementById('webcam');
let canvas = document.getElementById('output');
const liveView = document.getElementById('liveView');
const demosSection = document.getElementById('demos');
const enableWebcamButton = document.getElementById('webcamButton');


// Check if webcam access is supported.
function getUserMediaSupported() {
  return !!(navigator.mediaDevices &&
    navigator.mediaDevices.getUserMedia);
}

// If webcam supported, add event listener to button for when user
// wants to activate it to call enableCam function which we will 
// define in the next step.
if (getUserMediaSupported()) {
  enableWebcamButton.addEventListener('click', enableCam);
} else {
  console.warn('getUserMedia() is not supported by your browser');
}


// Placeholder function for next step.
var children = [];

function predictWebcam() {

  // Now let's start classifying a frame in the stream.
  model.estimateFaces(video).then(function (predictions) {
    // Remove any highlighting we did previous frame.
    for (let i = 0; i < children.length; i++) {
      liveView.removeChild(children[i]);
    }
    children.splice(0);

    console.log('Inside predictWebcam');
    ctx.drawImage(video, 0, 0, videoWidth, videoHeight, 0, 0, canvas.width, canvas.height);
    
    if(predictions.length > 0) {
      predictions.forEach(prediction => {
        const keypoints = prediction.scaledMesh;
        for (let i = 0; i < keypoints.length; i++) {
          const x = keypoints[i][0];
          const y = keypoints[i][1];

          ctx.beginPath();
          ctx.arc(x, y, 1, 0, 2 * Math.PI);
          ctx.fill();
        }
      });
    }
    
    window.requestAnimationFrame(predictWebcam);
  });
}
// Pretend model has loaded so we can try out the webcam code.
var model = undefined;

facemesh.load().then(function (loadedModel) {
  model = loadedModel;
  console.log('Model loaded successfully');

  // Show demo section now model is ready to use.
  demosSection.classList.remove('invisible');
});


function handleCanvas() {
  console.log('Inside handleCanvas');
  
  videoWidth = video.videoWidth;
  videoHeight = video.videoHeight;

  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  ctx = canvas.getContext('2d');
  ctx.translate(canvas.width, 0);
  ctx.scale(-1, 1);
  ctx.fillStyle = '#32EEDB';
  ctx.strokeStyle = '#32EEDB';
  ctx.lineWidth = 0.5;

  console.log('Done handling canvas');
  predictWebcam();
}


// Enable the live webcam view and start classification.
function enableCam(event) {
  // Only continue if the COCO-SSD has finished loading.
  if (!model) {
    return;
  }
  
  // Hide the button once clicked.
  event.target.classList.add('removed');  
  
  // getUsermedia parameters to force video but not audio.
  const constraints = {
    video: true
  };

  // Activate the webcam stream.
  navigator.mediaDevices.getUserMedia(constraints).then(function(stream) {
    video.srcObject = stream;
    video.addEventListener('loadeddata', handleCanvas);
  });
}
