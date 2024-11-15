// const { Svg, Bodies } = Matter;

// function preload() {
//   // Load your SVG file as text
//   svgData = loadStrings('resources/sceneBg.svg');
// }

// function setup() {
//   const vertices = Svg.pathToVertices(svgData);
//   const body = Bodies.fromVertices(400, 300, vertices, { isStatic: true });
//   World.add(engine.world, body);
// }

let sceneImage;

function preload() {
    sceneImage = loadImage('resources/sceneImage.png'); // Replace with your background image path
}

let engine;
let world;
let platforms = [];
let imgWidth, imgHeight;

function setup() {

    createCanvas(windowWidth, windowHeight);
    imgWidth = sceneImage.width;
    imgHeight = sceneImage.height;

  // Create an engine
  engine = Matter.Engine.create();
  world = engine.world;

  // Define static platforms as Matter.js bodies
  let ground = Matter.Bodies.rectangle(400, 590, 800, 20, { isStatic: true });
  let platform1 = Matter.Bodies.rectangle(300, 450, 200, 20, { isStatic: true });

  Matter.World.add(world, [ground, platform1]);

  // Store platforms for later use in drawing
  platforms.push(ground);
  platforms.push(platform1);
}

function draw() {
  background(sceneImage); // Render background

  // Render platforms as rectangles
  noStroke();
  fill(255);
  platforms.forEach(platform => {
    let pos = platform.position;
    let angle = platform.angle;
    push();
    translate(pos.x, pos.y);
    rotate(angle);
    rectMode(CENTER);
    rect(0, 0, platform.bounds.max.x - platform.bounds.min.x, platform.bounds.max.y - platform.bounds.min.y);
    pop();
  });

  // Update the Matter.js engine
  Matter.Engine.update(engine);
}
