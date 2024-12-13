let video;
let handpose;
let predictions = [];
let plants = []; // Array to store plants
let currentMode = "plant"; // Modes: plant, water
let smoothingFactor = 0.2; // Controls smoothness of hand tracking
let smoothedPosition = { x: 0, y: 0 }; // Smoothed position of the index finger
let plantingCooldown = false; // Prevent multiple plants per click
const MOVE_THRESHOLD = 2; // Minimum movement threshold to update position
const MARGIN = 20; // Boundary margin for hand tracking

function setup() {
  createCanvas(640, 480);
  video = createCapture(VIDEO);
  video.size(width, height);
  video.hide();

  // Load Handpose model
  handpose = ml5.handpose(video, modelReady);
  handpose.on("predict", results => {
    predictions = results;
  });

  background(220); // Light background for the garden
  console.log("Loading handpose model...");
}

function modelReady() {
  console.log("Handpose Model Loaded!");
}

function draw() {
  background(220); // Refresh the garden background

  // Draw boundary to indicate tracking area
  noFill();
  stroke(255, 0, 0);
  strokeWeight(2);
  rect(MARGIN, MARGIN, width - 2 * MARGIN, height - 2 * MARGIN); // Boundary rectangle

  // Display all plants
  for (let plant of plants) {
    plant.display();
  }

  // Check if hand predictions exist
  if (predictions.length > 0) {
    let hand = predictions[0].landmarks;
    let rawX = hand[8][0]; // Index finger tip X
    let rawY = hand[8][1]; // Index finger tip Y

    // Only update position if movement exceeds the threshold
    if (dist(smoothedPosition.x, smoothedPosition.y, rawX, rawY) > MOVE_THRESHOLD) {
      smoothedPosition.x = lerp(smoothedPosition.x, rawX, smoothingFactor);
      smoothedPosition.y = lerp(smoothedPosition.y, rawY, smoothingFactor);
    }

    // Check if the hand is out of bounds
    if (
      smoothedPosition.x < MARGIN ||
      smoothedPosition.x > width - MARGIN ||
      smoothedPosition.y < MARGIN ||
      smoothedPosition.y > height - MARGIN
    ) {
      fill(255, 0, 0);
      textSize(16);
      text("Move your hand back to the center!", 10, height - 10);
      return; // Skip further processing if hand is out of bounds
    }

    // Draw an indicator for the smoothed hand position
    fill(0, 100, 255);
    noStroke();
    ellipse(smoothedPosition.x, smoothedPosition.y, 15, 15);

    // Handle planting or watering based on the current mode
    if (currentMode === "plant" && mouseIsPressed && !plantingCooldown) {
      if (!isPlantNearby(smoothedPosition.x, smoothedPosition.y)) {
        plants.push(new Plant(smoothedPosition.x, smoothedPosition.y));
        plantingCooldown = true; // Activate cooldown to prevent multiple plants
      }
    } else if (currentMode === "water") {
      // Water only the nearest plant
      let nearestPlant = findNearestPlant(smoothedPosition.x, smoothedPosition.y);
      if (nearestPlant) {
        nearestPlant.water();
        // Draw a blue droplet to indicate watering
        fill(0, 0, 255, 150);
        noStroke();
        ellipse(nearestPlant.x, nearestPlant.y - nearestPlant.size / 2, 10, 10);
      }
    }
  } else {
    // Display message if no hand is detected
    fill(255, 0, 0);
    textSize(16);
    text("No hand detected", 200, height - 100);
  }

  // Reset planting cooldown when mouse is released
  if (!mouseIsPressed) {
    plantingCooldown = false;
  }

  // Display mode and instructions
  drawOverlay();
}

// Function to check if a plant is already nearby
function isPlantNearby(x, y) {
  for (let plant of plants) {
    if (dist(x, y, plant.x, plant.y) < 30) {
      return true; // Plant already exists nearby
    }
  }
  return false; // No nearby plant
}

// Function to find the nearest plant within a watering range
function findNearestPlant(x, y) {
  let nearestPlant = null;
  let minDistance = Infinity; // Initialize with a large value
  for (let plant of plants) {
    let distance = dist(x, y, plant.x, plant.y);
    if (distance < 50 && distance < minDistance) {
      nearestPlant = plant;
      minDistance = distance;
    }
  }
  return nearestPlant;
}

// Plant class to handle growth and display
class Plant {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.size = 10; // Initial size
    this.growthRate = 0.5; // Growth rate
    this.color = color(random(50, 255), random(50, 255), random(50, 255));
    this.isWatered = false;
  }

  water() {
    this.isWatered = true; // Mark as being watered
    this.size += this.growthRate; // Grow the plant
    this.size = min(this.size, 100); // Limit growth size
  }

  display() {
    // Reset watered status after each frame
    this.isWatered = false;

    // Draw the plant
    fill(this.color);
    noStroke();
    ellipse(this.x, this.y, this.size, this.size);

    // Draw a stem
    stroke(50, 200, 50);
    strokeWeight(3);
    line(this.x, this.y, this.x, this.y + this.size);
  }
}

// Overlay for mode and instructions
function drawOverlay() {
  // Display the overlay at the bottom
  noStroke();
  fill(0, 150);
  rect(0, height - 40, width, 40);

  fill(255);
  textSize(14);
  textAlign(LEFT);
  text(
    `Press 'P' for PLANT, 'W' for WATER, 'C' for CLEAR`,
    180, height - 10
  );

  // Display the current mode at the top
  textSize(20);
  fill(50, 200, 50);
  textAlign(CENTER);
  text(`Current Mode: ${currentMode.toUpperCase()}`, width / 2, 50);
}

// Key controls for interaction
function keyPressed() {
  if (key === "P" || key === "p") {
    currentMode = "plant"; // Switch to planting mode
  } else if (key === "W" || key === "w") {
    currentMode = "water"; // Switch to watering mode
  } else if (key === "C" || key === "c") {
    plants = []; // Clear the garden
  } else if (key === "S" || key === "s") {
    saveArtwork(); // Save the current canvas
  }
}

function saveArtwork() {
  // Save the current canvas as a PNG file
  saveCanvas("digital_garden", "png");
}

