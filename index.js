let net;
const classifier = knnClassifier.create();
const webcamElement = document.getElementById('webcam');
const buttons = new Array('class-a', 'class-b', 'class-c')

async function app() {
  console.log('Loading mobilenet..');

  // Load the model.
  net = await mobilenet.load();
  console.log('Sucessfully loaded model');

  await setupWebcam();

  // Reads an image from the webcam and associates it with a specific class
  // index.
  const splitStr = ' / '
  const addExample = classId => {
    console.log('classId: ' + classId)

    // Get the intermediate activation of MobileNet 'conv_preds' and pass that
    // to the KNN classifier.
    const activation = net.infer(webcamElement, 'conv_preds');

    // Pass the intermediate activation to the classifier.
    classifier.addExample(activation, classId);

    let buttonElement = document.getElementById(buttons[classId]);
    let spt = buttonElement.innerText.split(splitStr)
    buttonElement.innerText =
      spt[0] + splitStr +
      (
        (spt[1]) == undefined ? 1 : parseInt((spt[1]).trim()) + 1
      );
  };

  // When clicking a button, add an example for that class.
  document.getElementById(buttons[0]).addEventListener('click', () => addExample(0));
  document.getElementById(buttons[1]).addEventListener('click', () => addExample(1));
  document.getElementById(buttons[2]).addEventListener('click', () => addExample(2));

  while (true) {
    if (classifier.getNumClasses() > 0) {
      // Get the activation from mobilenet from the webcam.
      const activation = net.infer(webcamElement, 'conv_preds');
      // Get the most likely class and confidences from the classifier module.
      const result = await classifier.predictClass(activation);

      const classes = ['A', 'B', 'C'];
      document.getElementById('console').innerText = `
        prediction: ${classes[result.classIndex]}\t
        probability: ${result.confidences[result.classIndex]}
      `;
    }

    await tf.nextFrame();
  }
}

async function setupWebcam() {
  return new Promise((resolve, reject) => {
    const navigatorAny = navigator;
    navigator.getUserMedia = navigator.getUserMedia ||
      navigatorAny.webkitGetUserMedia || navigatorAny.mozGetUserMedia ||
      navigatorAny.msGetUserMedia;
    if (navigator.getUserMedia) {
      navigator.getUserMedia({
          video: true
        },
        stream => {
          webcamElement.srcObject = stream;
          webcamElement.addEventListener('loadeddata', () => resolve(), false);
        },
        error => reject());
    } else {
      reject();
    }
  });
}

app();