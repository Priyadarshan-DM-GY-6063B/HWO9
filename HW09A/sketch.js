// Original image, to use as reference for pixel colors
let oImg;

// Display image, to modify and display on canvas
let mImg;

// Predefined colors in Mondrian painting
let MONDRIAN_RED = { r: 255, g: 0, b: 0 };
let MONDRIAN_YELLOW = { r: 255, g: 255, b: 0 };
let MONDRIAN_BLUE = { r: 0, g: 0, b: 255 };

// User-controlled elements
let redPicker, yellowPicker, bluePicker;
let similaritySlider, transparencySlider;
let resetButton;
let randomBackgroundColor;

// Reset state
let resetMode = false;

function preload() {
  oImg = loadImage("../assets/mondriaan.jpg"); // Load original image
}

function setup() {
  // Resize the image to fit the window height
  oImg.resize(0, windowHeight);
  // Create a copy of the original image for manipulation
  mImg = oImg.get();

  // Adjust canvas size to accommodate UI elements
  createCanvas(oImg.width + 300, oImg.height);

  // Load pixels for reading from the original image
  oImg.loadPixels();

  // Create user interaction elements
  createControls();

  noLoop(); // Draw only when user interacts
}

function draw() {
  // Handle Reset Mode
  if (resetMode) {
    console.log("Drawing reset state...");
    clear();
    image(mImg, 0, 0); // Draw the original image
    resetMode = false; // Turn off reset mode after drawing
    return; // Exit early to prevent reprocessing
  }

  console.log("Processing image...");
  mImg.loadPixels();

  let similarityThreshold = similaritySlider.value();
  let transparency = transparencySlider.value();

  for (let x = 0; x < oImg.width; x++) {
    for (let y = 0; y < oImg.height; y++) {
      let idx = (x + y * oImg.width) * 4;

      // Get pixel color from original image
      let r = oImg.pixels[idx];
      let g = oImg.pixels[idx + 1];
      let b = oImg.pixels[idx + 2];

      // Replace colors based on similarity
      if (isSimilar(r, g, b, MONDRIAN_RED, similarityThreshold)) {
        applyNewColor(mImg, idx, redPicker.color());
      } else if (isSimilar(r, g, b, MONDRIAN_YELLOW, similarityThreshold)) {
        applyNewColor(mImg, idx, yellowPicker.color());
      } else if (isSimilar(r, g, b, MONDRIAN_BLUE, similarityThreshold)) {
        applyNewColor(mImg, idx, bluePicker.color());
      } else {
        // Apply transparency to non-primary colors
        mImg.pixels[idx] =
          (r * transparency) / 255 +
          (randomBackgroundColor.levels[0] * (255 - transparency)) / 255;
        mImg.pixels[idx + 1] =
          (g * transparency) / 255 +
          (randomBackgroundColor.levels[1] * (255 - transparency)) / 255;
        mImg.pixels[idx + 2] =
          (b * transparency) / 255 +
          (randomBackgroundColor.levels[2] * (255 - transparency)) / 255;
      }

      // Set alpha channel to fully opaque
      mImg.pixels[idx + 3] = 255;
    }
  }

  mImg.updatePixels();
  background(255); // Clear canvas
  image(mImg, 0, 0); // Display the modified image
  console.log("Image processed and drawn.");
}

function createControls() {
  let uiX = oImg.width + 20; // Position UI elements to the right of the image
  let uiY = 10; // Starting Y position

  // Red Color Picker
  createDiv('Replace Red').position(uiX, uiY);
  redPicker = createColorPicker('#FF0000');
  redPicker.position(uiX, uiY + 20);

  uiY += 60;

  // Yellow Color Picker
  createDiv('Replace Yellow').position(uiX, uiY);
  yellowPicker = createColorPicker('#FFFF00');
  yellowPicker.position(uiX, uiY + 20);

  uiY += 60;

  // Blue Color Picker
  createDiv('Replace Blue').position(uiX, uiY);
  bluePicker = createColorPicker('#0000FF');
  bluePicker.position(uiX, uiY + 20);

  uiY += 60;

  // Similarity Slider
  createDiv('Color Similarity Threshold').position(uiX, uiY);
  similaritySlider = createSlider(0, 150, 80); // Increased default for flexibility
  similaritySlider.position(uiX, uiY + 20);

  uiY += 60;

  // Transparency Slider
  createDiv('Transparency').position(uiX, uiY);
  transparencySlider = createSlider(0, 255, 100);
  transparencySlider.position(uiX, uiY + 20);

  uiY += 60;

  // Reset Button
  resetButton = createButton('Reset');
  resetButton.position(uiX, uiY);
  resetButton.mousePressed(resetImage);

  uiY += 40;

  // Save Button
  let saveButton = createButton('Save Artwork');
  saveButton.position(uiX, uiY);
  saveButton.mousePressed(saveArtwork);

  // Set initial random background color
  randomBackgroundColor = color(random(255), random(255), random(255));
}

// Check if a pixel's color is similar to the target color
function isSimilar(r, g, b, targetColor, threshold) {
  return (
    abs(r - targetColor.r) < threshold &&
    abs(g - targetColor.g) < threshold &&
    abs(b - targetColor.b) < threshold
  );
}

// Apply new color to a pixel
function applyNewColor(img, idx, color) {
  img.pixels[idx] = red(color);
  img.pixels[idx + 1] = green(color);
  img.pixels[idx + 2] = blue(color);
}

// Reset the image to its original state
function resetImage() {
  console.log("Resetting image...");
  mImg = oImg.get(); // Reload the original image
  mImg.loadPixels();
  mImg.updatePixels();
  resetMode = true; // Activate reset mode
 
  mImg.updatePixels();
  console.log("Image reset complete.");
}

// Save the final artwork
function saveArtwork() {
  console.log("Saving artwork...");
  saveCanvas('neon-mondrian', 'png');
  console.log("Artwork saved.");
}

function mouseReleased() {
  redraw(); // Redraw when user releases mouse
}
