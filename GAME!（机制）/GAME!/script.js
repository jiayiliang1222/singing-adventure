let scrollX = 0;
let customGravityForce = 0.007;
let map_  , monsterH, monsterV, monsterBoss, characterPng;
let characterNormal,characterStraight,characterBreathy,characterVocalFry;
let map_Width, map_Height, upperBound, lowerBound;
let character, characterWidth = 80, characterHeight = 80;
let engine, world;
let isHovered = false;
let grounds = [], hearts=[], platforms = [], monsters = [], monsterData = [];
let groupA_x = 0, groupA_y = 547;

let isCircleVisible = false;  // 控制圆圈是否显示
let circleRadius = 0;  // 圆圈的半径
const THEME_COLOR = "#B1E471";  // 圆圈的颜色

let BGM;  // 背景音乐变量
let jumpSound; 
let killSound;
// let straightSound;  
// let breathySound;  
// let vocalfrySound;  

let hasMoved = false; // 标记角色是否已经移动过，用于首次播放音乐



let groundADimensions = [
    { w: 277, h: 105 },
    { w: 103, h: 178 },
    { w: 133, h: 247 },
    { w: 386, h: 105 },
    { w: 134, h: 212 },
    { w: 585, h: 105 },
];
let groupB_x = 1727, groupB_y = 447;
let groundBDimensions = [
    { w: 205, h: 205 },
    { w: 147, h: 102 },
    { w: 128, h: 303 },
    { w: 106, h: 362 },
    { w: 138, h: 327 },
    { w: 566, h: 102 },
];
let groupC_x = 3164, groupC_y = 551;
let groundCDimensions = [
    { w: 795, h: 101 },
    { w: 193, h: 220 },
    { w: 745, h: 101 },
];
let platformDimensions = [
    { w: 515, h: 50 },
    { w: 550, h: 106 },
    { w: 370, h: 105 },
]
let monsterHs = [
    { x: 650, y: 335 },
    { x: 1408, y: 335 },
    { x: 3730, y: 340 },
]
let monsterVs = [
    { x: 1200, y: 240 },
    { x: 2760, y: 490 },
    { x: 3500, y: 230 },
]
let label = "unknown";
let classifier;
let soundModel = "https://teachablemachine.withgoogle.com/models/rIwh42peJ/";

function preload() {
    map_ = loadImage("resources/mapOnly.png");

    BGM = loadSound("resources/BGM.mp3");
    jumpSound = loadSound("resources/jump.wav");
    killSound = loadSound("resources/blast.wav");
    // straightSound = loadSound("resources/blast.wav");
    // breathySound = loadSound("resources/wave.wav");
    // vocalfrySound = loadSound("resources/vocalfry.wav");


    characterNormal = loadImage("resources/character.png");
    characterStraight = loadImage("resources/characterStraight.png");
    characterBreathy = loadImage("resources/characterBreathy.png");
    characterVocalFry = loadImage("resources/characterVocalFry.png");

    straightWave = loadImage('resources/StraightBlast.png');
    breathyWave = loadImage('resources/BreathyWave.png');

    straightText = loadImage('resources/Straight Blast Text.png');
    breathyText = loadImage('resources/Breathy Wave Text.png');
    vocalfryText = loadImage('resources/VocalFryText.png');



    monsterH = loadImage("resources/monsterH.png");
    monsterV = loadImage("resources/monsterV.png");
    monsterBoss = loadImage("resources/monsterBoss.png");
    singButton = loadImage("resources/button.png");
    singButtonTriggered = loadImage("resources/buttonTriggered.png");
    heart = loadImage("resources/heart.png");
    font = loadFont(
    "resources/carving-soft-font-family/MADECarvingSoftPERSONALUSE-Bold-BF66d13ce45c4bb.otf"
  );
    classifier = ml5.soundClassifier(soundModel + "model.json");

}

function setup() {
    createCanvas(windowWidth, windowHeight);

    // Set constants
    map_Width = map_.width;
    map_Height = map_.height;
    upperBound = windowHeight / 2 - map_Height / 2;         // 152.5
    lowerBound = windowHeight / 2 + map_Height / 2;         // 652.5
    rightBound = windowWidth * 2 / 3;
    panelWidth = windowWidth / 3;
    panelHeight = windowHeight;
    buttonX = 43;
    buttonY = (windowHeight - map_Height) / 2 + 29;
    buttonWidth = singButton.width;
    // monsters on groundA
    monsterHs[0].y = lowerBound - monsterH.height - groundADimensions[3].h;
    monsterHs[1].y = lowerBound - monsterH.height - groundADimensions[5].h;
    // monsters on groundB
    monsterVs[1].y = lowerBound - monsterV.height - groundBDimensions[5].h;
    // monsters on groundC
    monsterHs[2].y = lowerBound - monsterH.height - groundCDimensions[0].h;
    // monsterBoss.y = lowerBound - monsterBoss.height - groundCDimensions[2].h;
    // monsters on platform
    monsterVs[0].y = lowerBound - 322 - monsterV.height - platformDimensions[0].h/2;
    monsterVs[2].y = lowerBound - 303 - monsterV.height - platformDimensions[2].h/2;
    heartX = 187;
    heartY = (windowHeight - map_Height) / 2 + 36;
    heartWidth = heart.width;
    heartHeight = heart.height;
    for (let i = 0; i < 5; i++) {
        hearts.push(heart); // Push the heart image into the array 5 times
    }

    // Initialize the Matter.js engine and world
    engine = Matter.Engine.create();
    world = engine.world;

    // Create the character body
    character = Matter.Bodies.rectangle(100, lowerBound - groundADimensions[0].h, characterWidth, characterHeight, {
        restitution: 0, // No bounce
        friction: 0.1   // Friction for sliding on ground
    });

    // Create matter.js bodies
    createGrounds();
    createPlatforms();
    createMonsters();

    Matter.World.add(world, grounds.concat([character]).concat(platforms));
    Matter.Engine.run(engine);

    classifier.classify(gotResult);



}

function draw() {
    background(220);
    translate(-scrollX, 0);    // Scroll horizontally if the image is wider than the canvas
    image(map_, 0, (windowHeight - map_Height) / 2, map_Width, map_Height);

    // Draw monsters;
    drawMonsters();
    checkMonsterCollision();

    // Draw character
    Matter.Body.applyForce(character, character.position, { x: 0, y: customGravityForce });
    let charPos = character.position;
    // 绘制圆圈
    drawCircleAroundCharacter(charPos);

    drawCharacter(charPos);
    handleMovement(charPos);
    checkCharacterBounds();

    // Draw interaction
    //handleAttack();

    // TESTING MODEL!
    console.log(label);
    if (vocalStats.verdict == "Listening...") {
        determineVocalTechnique();
    }

    // Draw panel
    drawPanel();

    // draw interaction

     // 检测角色与怪物的距离并处理怪物消失 // 新增功能
     handleMonsterAttack(); // 新增功能

    //  if (vocalStats.verdict !== "Listening...") {
    //     playSoundEffect(vocalStats.verdict);  // 播放音效
    // }

     determineVocalTechniqueByKey();
}

// =====================================================================================
// ======================== Drawing functions: matter.js, png ==========================
function createGrounds() {
    for (let i = 0; i < groundADimensions.length; i++) {
        let w = groundADimensions[i].w;
        let h = groundADimensions[i].h;
        let ground = Matter.Bodies.rectangle(groupA_x + w / 2, lowerBound - h / 2, w, h, { isStatic: true });
        grounds.push(ground);
        groupA_x += w;
    }
    for (let i = 0; i < groundBDimensions.length; i++) {
        let w = groundBDimensions[i].w;
        let h = groundBDimensions[i].h;
        let ground = Matter.Bodies.rectangle(groupB_x + w / 2, lowerBound - h / 2, w, h, { isStatic: true });
        grounds.push(ground);
        groupB_x += w;
    }
    for (let i = 0; i < groundCDimensions.length; i++) {
        let w = groundCDimensions[i].w;
        let h = groundCDimensions[i].h;
        let ground = Matter.Bodies.rectangle(groupC_x + w / 2, lowerBound - h / 2, w, h, { isStatic: true });
        grounds.push(ground);
        groupC_x += w;
    }
}

function createPlatforms() {
    platform_A = Matter.Bodies.rectangle(1300, lowerBound-322, platformDimensions[0].w, platformDimensions[0].h, { isStatic: true });
    platform_B = Matter.Bodies.rectangle(2888, lowerBound-363, platformDimensions[1].w, platformDimensions[1].h, { isStatic: true });
    platform_C = Matter.Bodies.rectangle(3535, lowerBound-303, platformDimensions[2].w, platformDimensions[2].h, { isStatic: true });
    platforms.push(platform_A, platform_B, platform_C);
}

function createMonsters() {
    for (let i = 0; i < monsterHs.length; i++) {
        let x = monsterHs[i].x + monsterH.width / 2;
        let y = monsterHs[i].y + monsterH.height / 2;
        let monster = Matter.Bodies.rectangle(x, y, monsterH.width, monsterH.height, { isStatic: true });
        monsters.push(monster);
        monsterData.push({
            body: monster,
            type: 'monsterH',
            collided: false
        });
    }
    for (let i = 0; i < monsterVs.length; i++) {
        let x = monsterVs[i].x + monsterV.width / 2;
        let y = monsterVs[i].y + monsterV.height / 2;
        let monster = Matter.Bodies.rectangle(x, y, monsterV.width, monsterV.height, { isStatic: true });
        monsters.push(monster);
        monsterData.push({
            body: monster,
            type: 'monsterV',
            collided: false
        });
    }
    let boss = Matter.Bodies.rectangle(4650 + monsterBoss.width / 2, lowerBound - monsterBoss.height/2 - groundCDimensions[2].h, monsterBoss.width, monsterBoss.height, { isStatic: true });
    monsters.push(boss);
    monsterData.push({
        body: boss,
        type: 'boss',
        collided: false
    });

    // Add monsters to the world
    for (let i = 0; i < monsters.length; i++) {
        Matter.World.add(world, monsters[i]);
    }
}

function drawButton(x, y, size, hover) {
    if (mouseX > buttonX && mouseX < buttonX + buttonWidth && mouseY > buttonY && mouseY < buttonY + buttonWidth) {
        isHovered = true;
      } else {
        isHovered = false;
      }
    let drawSize = size;
    if (hover) {
        image(singButtonTriggered, x, y, drawSize, drawSize);
    } else {
        image(singButton, x, y, drawSize, drawSize);
    }

}

function drawHearts(x, y, width, height) {
    for (let i = 0; i < hearts.length; i++) {
        image(hearts[i], x + i * (width + 10), y, width, height);
    }
}

function drawPanel() {
    push();
    resetMatrix();

    // Draw panel
    noStroke();
    fill(177,228,113);
    rect(windowWidth-panelWidth/2, windowHeight/2, panelWidth, map_Height);
    fill(255);
    rect(windowWidth-panelWidth/2, windowHeight/2*1.05, panelWidth*0.85, map_Height*0.7);

    // Add content
    push();
    textAlign(CENTER);
    textFont(font, 56);
    fill("#FF7A00");;
    text(vocalStats.verdict, windowWidth-panelWidth/2, windowHeight*0.4);
    pop();

    push();
    // Add text: straight, breathy, vocal fry
    textAlign(LEFT);
    textFont(font, 24);
    fill(0);
    let textLeft = windowWidth-panelWidth*0.85, textBtw = 60;
    text("Straight", textLeft, windowHeight/2);
    text("Breathy", textLeft, windowHeight/2+textBtw);
    text("Vocal Fry", textLeft, windowHeight/2+textBtw*2);
    fill("#FF7A00");
    // Add rect  
    if (vocalStats.isCounting) {
        rectMode(CORNER);
        rect(textLeft+130, windowHeight/2-30, 23+map(getConfidence("Straight"),0,1,0,250) ,40, 15);
        rect(textLeft+130, windowHeight/2+textBtw-30, 23+map(getConfidence("Breathy"),0,1,0,250), 40, 15);
        rect(textLeft+130, windowHeight/2+textBtw*2-30, 23+map(getConfidence("Vocal Fry"),0,1,0,250),40, 15);
    }else{
        rectMode(CORNER);
        rect(textLeft+130, windowHeight/2-30, 23, 40, 15);
        rect(textLeft+130, windowHeight/2+textBtw-30, 23, 40, 15);
        rect(textLeft+130, windowHeight/2+textBtw*2-30, 23, 40, 15);
    }

    pop();

    // draw interactions
    drawButton(buttonX, buttonY, buttonWidth, isHovered);
    drawHearts(heartX, heartY, heartWidth, heartHeight);

    pop();
}

// function drawMonsters() {
//     for (let i = 0; i < monsterHs.length; i++) {
//         let x = monsterHs[i].x;
//         let y = monsterHs[i].y;
//         image(monsterH, x, y, monsterH.width, monsterH.height);
//     }
//     for (let i = 0; i < monsterVs.length; i++) {
//         let x = monsterVs[i].x;
//         let y = monsterVs[i].y;
//         image(monsterV, x, y, monsterV.width, monsterV.height);
//     }
//     image(monsterBoss, 4650, lowerBound - monsterBoss.height - groundCDimensions[2].h, monsterBoss.width, monsterBoss.height);
// }

function drawMonsters() {
    for (let i = 0; i < monsterData.length; i++) {
        let monster = monsterData[i];
        let monsterPos = monster.body.position;

        // 根据怪物的类型绘制不同的怪物图片
        if (monster.type === 'monsterH') {
            image(monsterH, monsterPos.x - monsterH.width / 2, monsterPos.y - monsterH.height / 2, monsterH.width, monsterH.height);
        } else if (monster.type === 'monsterV') {
            image(monsterV, monsterPos.x - monsterV.width / 2, monsterPos.y - monsterV.height / 2, monsterV.width, monsterV.height);
        } else if (monster.type === 'boss') {
            image(monsterBoss, monsterPos.x - monsterBoss.width / 2, monsterPos.y - monsterBoss.height / 2, monsterBoss.width, monsterBoss.height);
        }
    }
}

// =====================================================================================
// =====================================================================================
// ================================== Trigger Singing ==================================

const vocalStats = {
    isCounting: false,
    startTime: -1,
    "Background Noise": 0,
    Straight: 0,
    Breathy: 0,
    "Vocal Fry": 0,
    results: null,
    verdict: "Ready",
};
const MAX_NUM_OF_STAGES = 9;
const WAITING_TIME =6;

function mousePressed() {
    startCounting();
}

// 当用户点击按钮后，调用 startCounting() 开始计时和监听，
// 初始化 vocalStats 对象中的各项参数。
function startCounting() {
    vocalStats.isCounting = true;  // 开始计数
    vocalStats.startTime = millis();  // 记录开始时间
    vocalStats.verdict = "Listening...";  // 初始化结果为“正在监听...”

    // push();
    // rectMode(CENTER);
    // rect(textLeft+130, windowHeight/2-10, 23, 40+ map(vocalStats.results[1].confidence, 0, 1, 0, 250), 15);
    // rect(textLeft+130, windowHeight/2+textBtw-10, 23, 40+ map(vocalStats.results[1].confidence, 0, 1, 0, 250), 15);
    // rect(textLeft+130, windowHeight/2+textBtw*2-10, 23, 40++ map(vocalStats.results[1].confidence, 0, 1, 0, 250), 15);
    // pop();
}

// 当 Teachable Machine 的声音模型有分类结果时，gotResult() 函数会被调用。
// 它会将分类结果存储到 vocalStats.results 中，以便后续的统计和判断。
function gotResult(error, results) {
    if (error) {
      console.error(error);
      return;
    }
    vocalStats.results = results;
    label = results[0].label;
}

// 在录音和分类进行过程中，determineVocalTechnique() 函数会定期计算每种声乐技巧的置信度累积值。
// 当超过设定的等待时间后，它会根据最高置信度得出最终结果，并停止计时。
function determineVocalTechnique() {

    // 如果当前时间减去 startTime 大于等待时间（即计时超过了预定时间），则进入得出最终结果的部分。
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
      isCircleVisible = true;

      vocalStats["Straight"] = 0;
      vocalStats["Breathy"] = 0;
      vocalStats["Vocal Fry"] = 0;
      return;
    }

    // 如果尚未达到等待时间（即还在计时中），=系统会继续对当前帧的分类结果进行处理，将每个声乐技巧的置信度累加到 vocalStats 中。
    if (vocalStats.isCounting) {
      for (let i = 0; i < vocalStats.results.length; i++) {
        currLabel = vocalStats.results[i].label;  // 当前分类的标签（如 "Straight"）
        currConfidence = vocalStats.results[i].confidence;  // 置信度
        vocalStats[currLabel] += currConfidence;  // 累加置信度
      }
      isCircleVisible = true;  // 开始显示圆圈
      circleRadius = constrain(map(millis() - vocalStats.startTime, 0, 1000 * WAITING_TIME, 0, 170), 0, 170);
    }
}


function resetResults() {
    vocalStats.isCounting = false;
    vocalStats.startTime = -1;
    vocalStats["Background Noise"] = 0;
    vocalStats.Straight = 0;
    vocalStats.Breathy = 0;
    vocalStats["Vocal Fry"] = 0;
    // vocalStats.results = null;
    vocalStats.verdict = "Ready";

     // 重置圆圈状态
     isCircleVisible = false;  // 隐藏圆圈
     circleRadius = 0;  // 圆圈大小重置
}


// ====================================================================================
// ====================================================================================
// ====================================================================================


// ====================================================================================
// ================================ Handling Collision ================================

function checkMonsterCollision() {
    for (let i = 0; i < monsterData.length; i++) {
        let monster = monsterData[i].body;
        let isColliding = Matter.SAT.collides(character, monster).collided;
        if (isColliding && !monsterData[i].collided) {
            handleCollision(monsterData[i]);
            monsterData[i].collided = true;
        } else if (!isColliding) {
            monsterData[i].collided = false;
        }
    }
}

function handleCollision(monsterInfo) {
    if (hearts.length > 0) {
        hearts.pop();
    }
    if (monsterInfo.type === 'monsterH') {
        console.log("monsterH");
    } else if (monsterInfo.type === 'monsterV') {
        console.log("monsterV");
    } else if (monsterInfo.type === 'boss') {
        console.log("boss");
    }
    console.log("Hearts remaining: " + hearts.length);
    if (hearts.length <= 0) {
        // gameOver();
        window.location.reload();
    }
}

// ====================================================================================
// ================================ Character movement ================================

let jumpForce = -0.25;
let moveSpeed = 4;
let isSpacePressed = false;
let facingLeft = false;

function handleMovement(characterPos) {

    let moved = false; // 用于检测是否在这一帧角色有移动

    if (keyIsDown(LEFT_ARROW) || keyIsDown(65)) {
        Matter.Body.setVelocity(character, { x: -moveSpeed, y: 0 });
        facingLeft = true;
        resetResults();

        moved = true; // 角色左移

    
    }
    if (keyIsDown(RIGHT_ARROW) || keyIsDown(68)) {
        Matter.Body.setVelocity(character, { x: moveSpeed, y: 0 });
        facingLeft = false;
        resetResults();

        moved = true; // 角色右移

    }
    if (keyIsDown(32)) {
        if (!isSpacePressed) {
            Matter.Body.applyForce(character, { x: character.position.x, y: character.position.y }, { x: 0, y: jumpForce });
            isSpacePressed = true; // Prevent continuous jump if the key is held down

            moved = true; // 角色跳跃时算作移动
            jumpSound.play();
            jumpSound.setVolume(1.5);

        }
    } else {
        isSpacePressed = false;
    }

     // 如果角色第一次移动，则播放背景音乐
     if (moved && !hasMoved) {
        BGM.loop(); // 触发背景音乐
        hasMoved = true; // 标记角色已经移动过，防止重复触发
    }

    // Handle scrolling based on the character's position
    if (characterPos.x > windowWidth / 3 && characterPos.x < map_Width - windowWidth / 3) {
        scrollX = characterPos.x - windowWidth / 3;
    }
}

function drawCharacter(characterPos) {

    rectMode(CENTER);
    
    let wavePng = null;  // 用于存放当前的冲击波图像
    let textPng = null;  // 用于存放当前的状态文字图片


    push(); // Save the current transformation state

    //查看现在的角色状态（放技能，默认，等）
    if (vocalStats.verdict === "Straight") {
    characterPng = characterStraight;
    wavePng = straightWave;  // 显示 Straight 状态的冲击波
    textPng = straightText;  // 显示 Straight 状态的文字图片


    } else if (vocalStats.verdict === "Breathy") {
    characterPng = characterBreathy;
    wavePng = breathyWave;  // 显示 Breathy 状态的冲击波
    textPng = breathyText;  // 显示 Breathy 状态的文字图片


    } else if (vocalStats.verdict === "Vocal Fry") {
    characterPng = characterVocalFry;
    textPng = vocalfryText;  // 显示 Vocal Fry 状态的文字图片

    //wavePng = breathyWave;  // 显示 Straight 状态的冲击波

    } else {
        characterPng = characterNormal;
    }



// Check the direction the character is facing and apply the flip if needed
if (facingLeft) {
    // Flip the image horizontally
    translate(characterPos.x + characterWidth / 2, characterPos.y);
    scale(-1, 1); // Flip horizontally
    
    // 先画冲击波特效
    if (wavePng) {
        image(wavePng, characterWidth + 20, -characterHeight / 2 - 30, 100, 100);  // 左侧特效位置
      }
    // 再画角色
    image(characterPng, 0, -characterHeight / 2, characterWidth, characterHeight);

    // 画状态文字图片，不进行翻转
    if (textPng) {
        pop(); // 恢复到未翻转的状态
        image(textPng, characterPos.x + characterWidth / 2 - 135, characterPos.y - characterHeight - 50, 200, 100);  // 角色头顶的文字图片
        push(); // 再次保存翻转的状态
      }

  } else {
    // Draw normally when facing right
    
    // 先画角色
    image(characterPng, characterPos.x - characterWidth / 2, characterPos.y - characterHeight / 2, characterWidth, characterHeight);

    // 然后画冲击波特效
    if (wavePng) {
        image(wavePng, characterPos.x + characterWidth / 2 + 20, characterPos.y - characterHeight / 2 - 30, 100, 100);  // 右侧特效位置
      }
    // 画状态文字图片
    if (textPng) {
        image(textPng, characterPos.x - characterWidth / 2-65, characterPos.y - characterHeight - 50, 200, 100);  // 角色头顶的文字图片
      }
  }
    // fill(100);
    // scale(-1, 1);
    // // console.log(characterPos.x - characterWidth/2,  characterPos.y - characterHeight/2);
    // image(characterPng, characterPos.x - characterWidth/2, characterPos.y - characterHeight/2, characterWidth, characterHeight);
}

function checkCharacterBounds() {
    let charPos = character.position;
    if (charPos.x - characterWidth/2 < 0 || charPos.x + characterWidth/2 > map_Width || charPos.y - characterHeight/2 < upperBound || charPos.y + characterHeight/2 +20 > lowerBound) {
        window.location.reload();
    }
}


function getConfidence(label) {
    // candidate labels:
    // "Straight", "Breathy", "Vocal Fry"
    if (vocalStats.isCounting == false) {
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
   

   // 新的功能：处理角色攻击怪物 // 新增功能
function handleMonsterAttack() {  // 新增功能
    let charPos = character.position;

    // 处理 Horizontal 怪物 // 新增功能
    for (let i = monsterData.length - 1; i >= 0; i--) {
        let monster = monsterData[i];

        // 检测 Straight 技能并判断是否符合消灭条件 // 新增功能
        if (vocalStats.verdict === "Straight" && monster.type === "monsterH") {  // 新增功能
            let monsterPos = monster.body.position;
            if (isInAttackRange(charPos, monsterPos, "monsterH")) {  // 新增功能
                removeMonster(i);  // 新增功能
                killSound.play();
            }
        }

        // 检测 Breathy 技能并判断是否符合消灭条件 // 新增功能
        if (vocalStats.verdict === "Breathy" && monster.type === "monsterV") {  // 新增功能
            let monsterPos = monster.body.position;
            if (isInAttackRange(charPos, monsterPos, "monsterV")) {  // 新增功能
                removeMonster(i);  // 新增功能
                killSound.play();
            }
        }
    }
}

// 检测角色与怪物之间的距离和朝向，判断是否符合攻击条件 // 新增功能
function isInAttackRange(charPos, monsterPos, monsterType) {
    let attackRange;

    // 根据怪物类型设置不同的攻击范围
    if (monsterType === "monsterH") {
        attackRange = 150;  // 设置适合 monsterH 的攻击范围
    } else if (monsterType === "monsterV") {
        attackRange = 200;  // 设置适合 monsterV 的攻击范围（可以根据宽度调整）
    } else {
        attackRange = 150;  // 默认攻击范围
    }

    // 检测角色是否在攻击范围内
    let distance = abs(charPos.x - monsterPos.x);
    if (distance > attackRange) {
        return false;  // 不在攻击范围内
    }

    // 检测角色的朝向和位置关系
    if (monsterType === "monsterH" || monsterType === "monsterV") {
        if (charPos.x < monsterPos.x && !facingLeft) { // 角色在怪物左侧且朝右
            return true;
        } else if (charPos.x > monsterPos.x && facingLeft) { // 角色在怪物右侧且朝左
            return true;
        }
    }

    return false;  // 角色不符合朝向条件
}

// 移除怪物并从 Matter.js 世界中删除 // 新增功能
function removeMonster(index) {  // 新增功能
    let monster = monsterData[index];
    Matter.World.remove(world, monster.body);  // 从物理世界中移除 // 新增功能
    monsterData.splice(index, 1);  // 从数组中移除 // 新增功能
    console.log("Monster removed:", monster.type);  // 新增功能
}

// function playSoundEffect(verdict) {
//     // 停止其他正在播放的音效（防止重叠）
//     if (straightSound.isPlaying()) {
//         straightSound.stop();
//     }
//     if (breathySound.isPlaying()) {
//         breathySound.stop();
//     }
//     if (vocalfrySound.isPlaying()) {
//         vocalfrySound.stop();
//     }

//     // 根据 verdict 播放对应的音效
//     if (verdict === "Straight") {
//         straightSound.play();
//     } else if (verdict === "Breathy") {
//         breathySound.play();
//     } else if (verdict === "Vocal Fry") {
//         vocalfrySound.play();
//     }
// }


//for testing -----
//jiayi - monster mechanism
    
    
    
    function determineVocalTechniqueByKey() {
    
        //Z-Straight
    if (keyIsDown(90)) { 
            vocalStats.verdict = "Straight";
     }
     //X-Breathy
     if (keyIsDown(88)) {
            vocalStats.verdict = "Breathy";
     }
      //C-Vocal Fry
     if (keyIsDown(67)) {
            vocalStats.verdict = "Vocal Fry";
     }
      }
      //-------------------------------

    function drawCircleAroundCharacter(charPos) {
        if (isCircleVisible) {
            push();
            
            // 根据不同状态设置圆圈颜色
            if (vocalStats.verdict === "Vocal Fry") {
                fill("#FF4F4F");  // Vocal Fry 时圆圈颜色为红色
            } else {
                fill(THEME_COLOR);  // 其他状态下使用主题颜色
            }
            
            noStroke();
            
            // 如果判定状态是 Ready 或 Listening，继续让圆圈变大
            if (vocalStats.verdict === "Listening..." || vocalStats.verdict === "Ready") {
                circle(charPos.x, charPos.y-30, circleRadius);
            } else {
                // 在其他状态下，保持圆圈大小不变
                circle(charPos.x, charPos.y-30, circleRadius);
            }
            
            pop();
        }
    }