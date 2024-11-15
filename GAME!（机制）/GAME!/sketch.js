const SCENES = ["landing", "tutorial"];
const THEME_COLOR = "#B1E471";
const LABEL_COLOR = "#FF7A00";
const textArray = {
  0: "Welcome to the Singing\nAdventure!\nThis is you!",
  1: "The Diagram on the right\nshows the vocal technique\nyou are using.",
  2: 'You might wanna ask,\n"What is Vocal Technique?"\nLet me explain it to you.',
  3: "The sound is created\nwith vocal folds,\nand amplified through your\nchest, mouth, and\nhead resonating chambers.",
  7: "Congratulations on comple-\nting the tutorial! Return to\nthe homepage to start\nthe official game!",
};
const MAX_NUM_OF_STAGES = 9;
const WAITING_TIME = 10;

const configurations = {
  MAX_BAR_LENGTH: 250,
}

let font;

let girl;
let pet;
let bubble;
let homeIcon;
let micOnIcon;
let micOffIcon;
let bboxMargin = 15;

const audioSamples = {
  straight: null,
  breathy: null,
  vocalFry: null,
};

const images = {
  girl: null,
  pet: null,
  bubble: null,
  home: null,
  micOn: null,
  mifOff: null,
  arrow: null,
  homeHovered: null,
  landing: null,
  anatomy: null,
  straightIcon: null,
  breathyIcon: null,
  vocalFryIcon: null,
  straightHovered: null,
  breathyHovered: null,
  vocalFryHovered: null,
  straightFrame: null,
  breathyFrame: null,
  vocalFryFrame: null,
  singingModePage: null,
  straightBlast: null,
  breathyWave: null,
  vocalFryRed: null,
  playBtn: null,
  playBtnHovered: null,
  singBtnHovered: null,
};

const singingBtnControls = {
  disabled: false,
}

const states = {
  homeHovered: false,
  isPlaying: false,
};

let letterIdx = 0;

let currentScene = "tutorial";

let currentStage = 0;
let micOn = false;

// Global variable to store the classifier
let classifier;

// Label
let label = "listening...";

// Teachable Machine model URL:
let soundModel = "https://teachablemachine.withgoogle.com/models/rIwh42peJ/";

function preload() {
  // load font
  font = loadFont(
    "carving-soft-font-family/MADECarvingSoftPERSONALUSE-Bold-BF66d13ce45c4bb.otf"
  );

  girl = loadImage("assets/girl.png");
  pet = loadImage("assets/pet.png");
  bubble = loadImage("assets/bubble.png");
  homeIcon = loadImage("assets/home-icon.png");
  micOnIcon = loadImage("assets/micOn.png");
  micOffIcon = loadImage("assets/micOff.png");
  images.arrow = loadImage("assets/arrow.png");
  images.homeHovered = loadImage("assets/homeHoveredIcon.png");
  images.landing = loadImage("assets/landing-page.png");
  images.anatomy = loadImage("assets/anatomy.png");
  images.straightIcon = loadImage("assets/straight.png");
  images.breathyIcon = loadImage("assets/breathy.png");
  images.vocalFryIcon = loadImage("assets/vocalFry.png");
  images.straightHovered = loadImage("assets/straightHovered.png");
  images.breathyHovered = loadImage("assets/breathyHovered.png");
  images.vocalFryHovered = loadImage("assets/vocalFryHovered.png");
  images.straightFrame = loadImage("assets/FrameStraight.png");
  images.breathyFrame = loadImage("assets/FrameBreathy.png");
  images.vocalFryFrame = loadImage("assets/FrameVocalFry.png");
  images.singingModePage = loadImage("assets/singingModePage.png");
  images.straightBlast = loadImage("assets/straightBlast.png");
  images.breathyWave = loadImage("assets/breathyWave.png");
  images.vocalFryRed = loadImage("assets/vocalFryRed.png");
  images.playBtn = loadImage("assets/playBtn.png");
  images.playBtnHovered = loadImage("assets/playBtnHovered.png");
  images.singBtnHovered = loadImage("assets/singBtnHovered.png");

  // load sounds
  soundFormats("wav");
  audioSamples.straight = loadSound("assets/f1_scales_straight_a.wav");
  audioSamples.breathy = loadSound("assets/f1_scales_breathy_a.wav");
  audioSamples.vocalFry = loadSound("assets/f1_scales_vocal_fry_a.wav");

  // Load the model
  classifier = ml5.soundClassifier(soundModel + "model.json");
}

function loadImageHelper(objectName, pngName) {
  images[objectName] = loadImage(`assets/${pngName}.png`);
}

let canvas;

function setup() {
  canvas = createCanvas(1400, 500);
  canvas.parent("myCanvas");
  noStroke();
  // Start classifying
  // The sound model will continuously listen to the microphone
  classifier.classify(gotResult);
}

function draw() {
  background(255);

  if (currentScene == "tutorial") {
    drawTutorial();
  } else if (currentScene == "landing") {
    image(images.landing, 0, 0);
  }
}

function drawTutorial() {
  cursor(ARROW);

  switch (currentStage) {
    case 0:
      drawGirl();
      drawPet();
      drawBubble();
      displaySpeech(0);
      image(images.arrow, 700, 325);
      break;
    case 1:
      drawGirl();
      drawPet();
      drawBubble();
      displaySpeech(1);
      push();
      translate(875, 375);
      rotate(PI);
      image(images.arrow, 0, 0);
      pop();
      break;
    case 2:
      drawGirl();
      drawPet();
      drawBubble();
      displaySpeech(2);
      break;
    case 3:
      image(images.anatomy, 16, 61);
      drawBubble();
      displaySpeech(3);
      break;
    case 4:
      image(girl, 89, 57, 104, 144);
      push();
      fill(THEME_COLOR);
      rect(216, 70, 613, 111, 49);
      pop();
      push();
      textFont(font, 22);
      textAlign(CENTER, CENTER);
      fill(0);
      let textToDisplay;
      letterIdx += 0.3;
      textToDisplay = "By adjusting the resonance chambers in your voice,\nyou can unlock different vocal techniques to sing.".substring(
        0,
        letterIdx
      );
      text(textToDisplay, 216 + 613 / 2, 70 + 111 / 2);
      pop();
      // display buttons
      image(images.straightIcon, 133, 228);
      image(images.breathyIcon, 363, 228);
      image(images.vocalFryIcon, 593, 228);
      break;

    //==========STRAIGHT FRAME==========
    case 5:
      // straight frame
      image(images.straightFrame, 0, 0, width, height);
      // 812, 310, 56
      drawPlayBtn(812, 310, 56);

      determineVocalTechnique();
      drawPanel();

      break;

    //==========BREATHY FRAME==========
    case 6:
      // breathy frame
      image(images.breathyFrame, 0, 0, width, height);
      drawPlayBtn(812, 310, 56);

      determineVocalTechnique();
      drawPanel();
      break;

    //==========VOCAL FRY FRAME==========
    case 7:
      // vocal fry frame
      image(images.vocalFryFrame, 0, 0, width, height);
      drawPlayBtn(812, 310, 56);

      determineVocalTechnique();
      drawPanel();
      break;

    case 8:
      image(images.singingModePage, 0, 0);
      // background(0);
      // white out animated objects
      push();
      fill(255);
      rect(364, 222, 210, 210);
      rect(418, 336, 100, 108);
      rect(250, 0, 400, 50);
      pop();

      if ((vocalStats.verdict == "Ready") || (vocalStats.verdict == "Listening...")) {
        push();
        fill(THEME_COLOR);
        circle(364 + 210 / 2, 222 + 210 / 2, mapTimingToDiamater());
        pop();

        image(pet, 418, 336, 100, 108);
      } else {
        // white out animated objects
        push();
        fill(255);
        rect(364, 222, 210, 210);
        rect(418, 336, 100, 108);
        pop();

        if (vocalStats.verdict == "Straight") {
          image(images.straightBlast, 364, 222, 244 / 158 * 222, 222);
        } else if (vocalStats.verdict == "Breathy") {
          image(images.breathyWave, 364, 222, 233 / 158 * 222, 222);
        } else if (vocalStats.verdict == "Vocal Fry") {
          image(images.vocalFryRed, 364, 222, 158 / 158 * 222, 222);
        } else {
          // do nothing
        }
      }

      determineVocalTechnique();
      drawPanel();
      break;

    default:
      displaySpeech(7);
      break;
  }

  push();
  fill(255);
  rect(250, 0, 400, 50);
  pop();
  // draw 'press space' prompt on the top
  textFont(font, 24);
  textAlign(CENTER, BOTTOM);
  fill(THEME_COLOR);
  text("~Press SPACE to continue~", 450, 39);

  if (currentStage == 4) {
    if (dist(mouseX, mouseY, 133 + 174 / 2, 228 + 174 / 2) < 174 / 2) {
      cursor(HAND);
      image(images.straightHovered, 133, 228);
    } else if (dist(mouseX, mouseY, 363 + 174 / 2, 228 + 174 / 2) < 174 / 2) {
      cursor(HAND);
      image(images.breathyHovered, 363, 228);
    } else if (dist(mouseX, mouseY, 593 + 174 / 2, 228 + 174 / 2) < 174 / 2) {
      image(images.vocalFryHovered, 593, 228);
      cursor(HAND);
    }
  }

  if ((currentStage >= 5) && (currentStage <= 8)) {
    if (isHovered(43, 29, 114)) {
      cursor(HAND);
      image(images.singBtnHovered, 43, 29);
    }
  }
 
  drawPanel();
}

function drawGirl() {
  image(girl, 72, 64);
}

function drawPet() {
  image(pet, 530, 319);
}

function drawBubble() {
  image(bubble, 399, 106);
}

function keyPressed() {
  if (currentScene == "tutorial") {
    if (key == ' ') {
      if (currentStage < MAX_NUM_OF_STAGES - 1) {
        currentStage += 1;
        letterIdx = 0;
        resetResults();
        singingBtnControls.disabled = false;
        audioSamples.straight.stop();
        audioSamples.breathy.stop();
        audioSamples.vocalFry.stop();
      }

    } else if (key == 'Q' || key == 'q') {
      if ((currentStage >= 5) && (currentStage <= 8)) {
        startCounting();
      }
    }
  }
}

function displaySpeech(idx) {
  push();
  textFont(font, 30);
  textAlign(CENTER, CENTER);
  fill(0);
  let textToDisplay;
  switch (idx) {
    case 0:
      textToDisplay = textArray[0];
      break;
    case 1:
      textToDisplay = textArray[1];
      break;
    case 2:
      textToDisplay = textArray[2];
      break;
    case 3:
      textToDisplay = textArray[3];
      break;
    default:
      textToDisplay = textArray[7];
      break;
  }
  letterIdx += 0.3;
  textToDisplay = textToDisplay.substring(0, letterIdx);
  text(textToDisplay, 440 + 412 / 2, 106 + 188 / 2);
  pop();
}

function mousePressed() {
  if (states.homeHovered) {
    currentScene = "landing";
    cursor(HAND);
  }

  if (currentStage == 4) {
    if (dist(mouseX, mouseY, 133 + 174 / 2, 228 + 174 / 2) < 174 / 2) {
      playExampleSound("straight");
    } else if (dist(mouseX, mouseY, 363 + 174 / 2, 228 + 174 / 2) < 174 / 2) {
      playExampleSound("breathy");
    } else if (dist(mouseX, mouseY, 593 + 174 / 2, 228 + 174 / 2) < 174 / 2) {
      playExampleSound("vocal fry");
    }
  }

  if ((currentStage >= 5) && (currentStage <= 8)) {
    if (dist(mouseX, mouseY, 43 + 114 / 2, 29 + 114 / 2) < 114 / 2) {
      singingBtnControls.disabled = true;
      startCounting();
    }
  }

  if ((currentStage >= 5) && (currentStage <= 7)) {
    if (isHovered(812, 310, 56)) {
      console.log("isHovered")
      let label;
      switch (currentStage) {
        case (5):
          label = 'straight';
          break;
        case (6):
          label = 'breathy';
          break;
        case (7):
          label = 'vocal fry';
          break;
      }
      playExampleSound(label);
    }
  }
}

function playExampleSound(label) {
  audioSamples.straight.stop();
  audioSamples.breathy.stop();
  audioSamples.vocalFry.stop();
  switch (label) {
    case "straight":
      audioSamples.straight.play();
      break;
    case "breathy":
      audioSamples.breathy.play();
      break;
    case "vocal fry":
      audioSamples.vocalFry.play();
      break;
    default:
      break;
  }
}

// ==========VOCAL TECHNIQUE CLASSIFICATION MODULE===========
// The model recognizing a sound will trigger this event
function gotResult(error, results) {
  if (error) {
    console.error(error);
    return;
  }
  // The results are in an array ordered by confidence.
  vocalStats.results = results;
}

const vocalStats = {
  isCounting: false,
  startTime: -1,
  "Background Noise": 0,
  Straight: 0,
  Breathy: 0,
  "Vocal Fry": 0,
  results: null,
  verdict: "Listening...",
};

// call this function to signal the start of listening to audio input and classify vocie techniques
function startCounting() {
  vocalStats.isCounting = true;
  vocalStats.startTime = millis();
  vocalStats.verdict = "Listening..."
}

// while counting, call this function in each frame
function determineVocalTechnique() {
  if (!vocalStats.isCounting) {
    return
  }
  if (millis() - vocalStats.startTime > 1000 * WAITING_TIME) {
    let winner = "Straight";
    let winningScore = vocalStats["Straight"];

    if (vocalStats["Breathy"] > winningScore) {
      winner = "Breathy";
      winningScore = vocalStats["Breathy"];
    }

    if (vocalStats["Vocal Fry"] > winningScore) {
      winner = "Vocal Fry";
      winningScore = vocalStats["Vocal Fry"];
    }

    vocalStats.verdict = winner;
    vocalStats.isCounting = false;

    vocalStats["Straight"] = 0;
    vocalStats["Breathy"] = 0;
    vocalStats["Vocal Fry"] = 0;

    return;
  }

  console.log(vocalStats);

  if (vocalStats.isCounting) {
    for (let i = 0; i < vocalStats.results.length; i++) {
      currLabel = vocalStats.results[i].label;
      currConfidence = vocalStats.results[i].confidence;
      console.log(currLabel, currConfidence);
      vocalStats[currLabel] += currConfidence;
    }
  }
}

// call this function to reset vocal technique classification results
function resetResults() {
  vocalStats.isCounting = false;
  vocalStats.startTime = -1;
  vocalStats["Background Noise"] = 0;
  vocalStats.Straight = 0;
  vocalStats.Breathy = 0;
  vocalStats["Vocal Fry"] = 0;
  vocalStats.verdict = "Ready";
}

function drawLabel(x = 934, y = 111, w = 431, h = 84, fontSize = 64,) {
  // draw 
  push();
  textAlign(CENTER, CENTER);
  textFont(font, 64);
  let bbox = font.textBounds(
    vocalStats.verdict,
    x + w / 2,
    y + h / 2,
    72
  );
  fill("white");
  let bboxMargin = 15;
  rect(bbox.x - bboxMargin, bbox.y - bboxMargin, bbox.w + 2 * bboxMargin, bbox.h + 2 * bboxMargin);
  fill(LABEL_COLOR);
  text(vocalStats.verdict, 934 + 431 / 2, 111 + 84 / 2);
  pop();
}

function getLabel() {
  return vocalStats.verdict;
}

function getConfidence(label) {
  // candidate labels:
  // "Straight", "Breathy", "Vocal Fry"
  if (vocalStats.isCounting == 0) {
    return 0;
  }

  let i;
  for (let j = 0; j < vocalStats.results.length; j++) {
    if (vocalStats.results[j].label == label) {
      i = j;
      break;
    }
  }
  return vocalStats.results[i].confidence
}

function drawPanel() {
  // draw green square on the right
  push();
  fill(THEME_COLOR);
  rect(900, 0, 500, 500);
  pop();

  // draw white box w/ rounded corners
  push();
  fill(255);
  rect(934, 94, 431, 357, 15);
  pop();

  // draw label
  textAlign(CENTER, CENTER);
  textFont(font, 64);
  fill(LABEL_COLOR);
  text(getLabel(), 934 + 431 / 2, 111 + 84 / 2);

  // draw field texts: straight, breathy, vocal fry
  push();
  textAlign(LEFT, BOTTOM);
  textFont(font, 32);
  fill(0);
  text("Straight", 960, 214 + 52);
  text("Breathy", 960, 291 + 47);
  text("Vocal Fry", 960, 364 + 47);
  pop();

  // draw bars associated with fields
  push();
  fill(LABEL_COLOR);
  rectMode(CORNER);
  rect(1126, 222, 23 + mapConfidenceToLength("Straight"), 40, 15);
  rect(1126, 295, 23 + mapConfidenceToLength("Breathy"), 40, 15);
  rect(1126, 368, 23 + mapConfidenceToLength("Vocal Fry"), 40, 15);
  pop();

  // draw mic icon
  if (vocalStats.isCounting) {
    image(micOnIcon, 945, 106);
  } else {
    image(micOffIcon, 945, 106);
  }

  // draw home icon
  states.homeHovered =
    dist(mouseX, mouseY, 1309 + 56 / 2, 29 + 56 / 2) < 56 / 2;

  if (!states.homeHovered) {
    currentHomeIcon = homeIcon;
    cursor(ARROW);
  } else {
    currentHomeIcon = images.homeHovered;
    cursor(HAND);
  }

  image(currentHomeIcon, 1309, 29);
}
//==========END OF VOCAL TECHNIQUE CLASSIFICATION MODULE==========

// utils

function isHovered(btnX, btnY, diameter, mode = "TOP_LEFT") {
  if (mode == "TOP_LEFT") {
    return dist(mouseX, mouseY, btnX + diameter / 2, btnY + diameter / 2) <= diameter / 2;
  } else if (mode == "CENTER") {
    return dist(mouseX, mouseY, btnX, btnY) <= diameter / 2;
  }
}

function mapConfidenceToLength(label, maxLength = 250) {
  return map(getConfidence(label), 0, 1, 0, maxLength);
}

function mapTimingToDiamater(timeoutInSeconds = 10, maxDiameter = 210) {
  if (!vocalStats.isCounting) {
    return 0;
  }

  return constrain(map(millis() - vocalStats.startTime, 0, 1000 * timeoutInSeconds, 0, 210), 0, 210);
}

function drawPlayBtn(btnX, btnY, diameter) {
  let imageName;
  if (isHovered(btnX, btnY, diameter)) {
    imageName = 'playBtnHovered';
    cursor(HAND);
  } else {
    imageName = 'playBtn';
    cursor(ARROW);
  }

  image(images[imageName], btnX, btnY);
}