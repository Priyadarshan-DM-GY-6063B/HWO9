
// original image, to use as reference for pixel colors
let oImg;

// display image, to modify and display on canvas
let mImg;

function preload() {
  oImg = loadImage("../assets/mondriaan.jpg");
  mImg = loadImage("../assets/mondriaan.jpg");
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  oImg.resize(0, height);
  mImg.resize(0, height);

  // we'll read pixel color info from the oImg, so let's load its pixels
  oImg.loadPixels();

  // TODO: setup sliders and other DOM/html elements here
}

function draw() {
  // we'll modify and display the mImg object, so let's load its pixels
  mImg.loadPixels();

  // TODO: do any filtering and pixel modifications here.
  //       This involves a for loop of some kind.
  //       Remember to read from the oImg pixels and write to the mImg.

  // we'll display the updated mImg, so let's update its pixels
  mImg.updatePixels();

  // draw the display image
  image(mImg, 0, 0);
}
