var canvas = document.getElementById("canvas1");
var cxt = canvas.getContext("2d");
canvas.width = 900;
canvas.height = 600;

let enemySpeed = 5;
let frame = 0; // USED WITH ENEMYFRAME TO DETERMINE WHEN TO SPAWN ENEMIES
let distance = 0;
let nextPhaseScore = 100;
let nextPhaseReady = false;
let highScore = 0;
let sheepFrame = 15;

let sheepFramework = "./src/assets/images/warrenSheet7Super.png";
let jetStartFramework = "./src/assets/images/jetPackStartFrames5.png";
let blackFramework = "./src/assets/images/blackWarrenFrames.png";
/* LESSON LEARNED: FRAMEWORK CANNOT BE JUST A SINGLE IMAGE: 
IT NEEDS TO HAVE MULTIPLE FRAMES; OTHERWISE, NOTHING WILL SHOW */
let gameOver = false;
let running = false;
//let randomFrames = [50, 100, 150, 185]; // BIG LIGHTBULB: IT'S NOT ABOUT THE SIZE, ITS ABOUT THE SPACE INBETWEEN EACH FRAME THAT DETERMINES SPACE BETWEEN SPAWN POINTS.
let randomFrames = [50, 100, 150];
// used for spawning enemies, clouds, and determining cloud (and not enemy) heights
// "Warren fucked up his life and can't have fun no mo'!"
let level2Frames = [50, 150, 250, 300, 450]; // created since level2 word enemies are too long
let currentEnemyFrames = randomFrames;

let sins3 = [
  ["🧨", "", 177],
  ["🤰🤰🏿🤰🏽", "...😳", 237],
  ["👺", "Warren sold his soul to the devil!", 177],
  ["👶", "GOOGOOGAGA", 177],
  ["👃", "Warren was sniffed out!", 177],
  ["🦻", "Warren heard sum dumb and impaired his hearing!", 177],
  ["🍌", "...!", 177],
  ["🍖🥩", "Warren was made the premier dish of the night!", 205],
  ["🤺🤺🤺", "OWW! Fellas stabbed Warren!", 237],
  ["🦘", "Warren got BTFO to Australia!", 177],
  ["🤵🏿🤵‍", 'Feds "want a word" with Warren!', 205],
  ["🔫👶", "Warren got sprayed!", 205],
  ["🍆", '...😱', 177], // enemy, text, width, item 16 here;
  ["🧜‍♂️", "Merman kidnapped Warren!", 177],
  ["🌮", "", 177]
]; // level1 phase 1 array

let sins4 = [
  // ["🧨", "", 177],
  // ["🌮", "", 177]
  ["U SUCK", "", 230],
  ["SUCKER", "", 230],    // SHORTENED BECAUSE TOO LONG
  ["HAHAHA", "", 230]
  ["LOOL", 200],
  ["LOSER", "", 220],
  ["LOLOL", "", 200],
  ["SUCKER", "", 230],
  ["GET OUT", "", 235]
];


const array2 = [
  ["LUST", "", 200],
  ["ENVY", "", 200],
  ["SLOTH", "", 210],
  ["GREED", "", 210],
  ["WRATH", "", 210],
  ["PRIDE", "", 210]
];

const array3 = [...sins3, ...sins4]; // level1 phase 2 array
const array4 = [...array2, ...sins4.slice(2)]; // level2 Phase 2 array

class Floor {
  constructor() {
    this.y = canvas.height - 150;
    this.x = 0;
    this.width = canvas.width;
    this.height = canvas.height / 2;
  }
  draw() {
    cxt.fillStyle = "yellow";
    cxt.fillRect(this.x, this.y, this.width, this.height);
  }
}

let floor = new Floor();

const foregroundLayer1 = new Image();
foregroundLayer1.src = "./src/assets/images/backgrounds/trueForeground.png";
const foregroundLayer2 = new Image();
foregroundLayer2.src = "./src/assets/images/backgrounds/trueForeground4.png";

let gameMusic = new Audio();
gameMusic.src = "./src/assets/sounds/one_0.mp3";
let gameMusic2 = new Audio();
gameMusic2.src = "./src/assets/sounds/cold_silence.ogg"; // level number, level background, enemy array, music, win score to next level

// THE LEVEL RIGHT HERE 
let level1 = [
  1,
  foregroundLayer1,
  sins3,
  gameMusic,
  1000,         // POINTS TO NEXT LEVEL
  "Level 2",
  800,          // DECREASED FROM 850 TO 800
  "black",
  "white"
];
let level2 = [
  2,
  foregroundLayer2,
  array2,
  gameMusic2,
  1500,
  "To be continued",
  850,
  "red",
  "black"
]; /* level, background, enemy start array, distance to win, level win text, 
distance to jetpack, when click, when not click */

let currentLevel = level1;
let currentArray = currentLevel[2];
let displayPlayButton = true;

function blackScreen() {
  running = false;
  currentLevel[3].pause();
  currentLevel[3].currentTime = 0;
  displayPlayButton = false;
  cxt.fillStyle = "black";
  cxt.fillRect(0, 0, canvas.width, canvas.height);
}

function nextLevel() {
  sheep1.deadSpace = sheepDeadSpace;
  level2[3].play(); // PLAYS SOLEY LEVEL2 MUSIC, IMPROVEMENT WOULD BE NICE
  currentEnemyFrames = level2Frames;
  running = false;
  cxt.fillStyle = "white";
  //distance = 0;
  cxt.fillText(currentLevel[5], canvas.width * 0.5, canvas.height * 0.5);
  setTimeout(() => {
    displayPlayButton = true;
    currentLevel = level2;
    sheep1.framework = sheepFramework;
  }, 5000); // show black screen for 5 seconds
}

function reset() {
  currentArray = currentLevel[2]; // DEFAULT ENEMY ARRAY
  enemySpeed = 5;
  frame = 0; // USED WITH ENEMYFRAME TO DETERMINE WHEN TO SPAWN ENEMIES
  distance = 0;
  nextPhaseScore = 100;
  nextPhaseReady = false;
  sheepFrame = 15;
  gameOver = false;
  oppQueue = [];
  sheep1.framework = sheepFramework;
  warren.src = sheepFramework;
  sheep1.deathPlayed = false;

  sheep1.deadSpace = sheepDeadSpace;

  cloudQueue = [];
  //madcloudQueue = [];
  //dropQueue = [];
  cloudTypes.splice(3);
  sheep1.framework = sheepFramework; // keeps sheep from walking in midair on reset
  sheep1.boomEnd = false;
  sheep1.boomNoisePlayed = false;
  sheep1.boomAnimation = 0; // FINALLY GOT THIS SHIT RIGHT

  corpseQueue = [];
  crossQueue = [];
}

// used to make the repeating ground image
class Layer {
  constructor(image, speedModifier, yStart, stretch) {
    this.x = 0;
    this.y = yStart;
    this.width = 910 + stretch;
    this.height = 700;
    this.image = image;
    this.speedModifier = speedModifier;
    this.speed = enemySpeed;
  }
  update() {
    this.speed = enemySpeed;
    if (this.x <= -this.width) {
      this.x = 0;
    }
    this.x = this.x - this.speed;
  }
  draw() {
    cxt.drawImage(this.image, this.x, this.y, this.width, this.height);
    cxt.drawImage(
      this.image,
      this.x + this.width,
      this.y,
      this.width,
      this.height
    );
  }
}

const layer1 = new Layer(currentLevel[1], 1.5, -195, 100); // BACKGROUND SHIT HERE
function handleLayer() {
  layer1.image = currentLevel[1];
  layer1.draw();

  if (running && !gameOver) {
    layer1.update();
  }
}

canvas.addEventListener("mousedown", function () {
  mouse.clicked = true;
});
canvas.addEventListener("mouseup", function () {
  mouse.clicked = false;
});

let canvasPosition = canvas.getBoundingClientRect();
canvas.addEventListener("mousemove", function (e) {
  mouse.x = e.x - canvasPosition.left;
  mouse.y = e.y - canvasPosition.top;
});
canvas.addEventListener("mouseleave", function () {
  mouse.x = undefined;
  mouse.y = undefined;
});

const mouse = {
  x: 10,
  y: 10,
  width: 0.1,
  height: 0.1,
  clicked: false
};

const playButt = {
  x: canvas.width * 0.5 - 100,
  y: canvas.height * 0.2,
  size: 100,
  stroke: "nul"
};

const playImage = new Image();
playImage.src = "./src/assets/images/startButton3.png";

const resetButt = {
  x: canvas.width * 0.5 - 100,
  y: canvas.height * 0.2,
  size: 100,
  //stroke: "grey"
  stroke: "nul"
};

const resetImage = new Image();
resetImage.src = "./src/assets/images/restartButton3.png";

// HERE IS WHERE GAME STARTS
function startGame() {
  //highScore = distance; // FIXED HIGHSCORE SHIT
  if (!running && displayPlayButton) {
    cxt.beginPath();
    cxt.lineWidth = 3;
    cxt.strokeStyle = playButt.stroke;
    cxt.moveTo(playButt.x, playButt.y - 10);
    cxt.lineTo(canvas.width * 0.5 + 5, playButt.y + 55);
    cxt.lineTo(playButt.x, playButt.y + playButt.size + 7);
    cxt.lineTo(playButt.x, playButt.y - 10);
    cxt.stroke();

    cxt.drawImage(
      playImage,
      playButt.x,
      playButt.y,
      playButt.size,
      playButt.size
    );

    if (currentLevel === level2) {
      highScore = 0;
    }
  }

  if (
    sheep1.jumping &&
    !running &&
    sheep1.framework === sheepFramework &&
    currentLevel === level1
  ) {
    cxt.fillStyle = "black";
    cxt.font = "40px Tourney";
    cxt.fillText("PRESS PLAY DAWG", 60, canvas.height - 100);
  }

  // MUSIC SHIT RIGHT HERE
  if (mouseCollision(mouse, playButt) && !running) {
    playButt.stroke = currentLevel[7];
    if (mouse.clicked && displayPlayButton) {
      running = true;
      currentLevel[3].play();
      reset();
    }
  } else {
    playButt.stroke = currentLevel[8];
  }
}

const okButt = {
  x: canvas.width * 0.5 + 100,
  y: canvas.height * 0.6,
  size: 35,
  stroke: "nul"
};

const noButt = {
  x: canvas.width * 0.5 + 150,
  y: canvas.height * 0.6,
  size: 35,
  stroke: "nul"
};

function displayMusicButts() {
  cxt.lineWidth = 3;
  cxt.strokeStyle = noButt.stroke;
  cxt.strokeRect(noButt.x, noButt.y, noButt.size, noButt.size);
  cxt.fillText("NO", noButt.x, noButt.y + 27);

  cxt.strokeStyle = okButt.stroke;
  cxt.strokeRect(okButt.x, okButt.y, okButt.size, okButt.size);
  cxt.fillText("ok", okButt.x, okButt.y + 27);

  if (mouseCollision(mouse, noButt)) {
    noButt.stroke = "pink";
    if (mouse.clicked) {
      reset();
    }
  } else {
    noButt.stroke = "white";
  }
  // array
  if (mouseCollision(mouse, okButt)) {
    okButt.stroke = "black";
    if (mouse.clicked && running) {
      currentLevel[3].play();
      reset();
    }
  } else {
    okButt.stroke = "white";
  }
}

const bigEye = new Image();
bigEye.src = "./src/assets/images/warrenEye2.png";
// HERE IS THE GAME HANDLING SHIT YO
function gameStatus() {
  cxt.fillStyle = "black";
  cxt.font = "40px Tourney";
  cxt.fillText("Score: " + distance, 20, 40);

  cxt.fillStyle = "black";
  cxt.font = "40px Tourney";
  cxt.fillText("Hi: " + highScore, 300, 40);

  cxt.fillStyle = "black";
  cxt.font = "40px Tourney";
  cxt.fillText("Level: " + currentLevel[0], 520, 40);

  if (distance > highScore) {
    highScore = distance;
  }

  // GAMEOVER SHIT
  if (gameOver) {
    cxt.lineWidth = 3;
    cxt.strokeStyle = resetButt.stroke;
    cxt.strokeRect(resetButt.x, resetButt.y, resetButt.size, resetButt.size); // color is white, so stroke looks invisible

    cxt.drawImage(
      resetImage,
      resetButt.x,
      resetButt.y,
      resetButt.size,
      resetButt.size
    );

    cxt.drawImage(bigEye, sheep1.x + 125, sheep1.y + 77, 15, 15);
    cxt.drawImage(bigEye, sheep1.x + 135, sheep1.y + 77, 15, 15); // EYE SHIT RIGHT HERE

    if (currentLevel[3].duration > 0 && !currentLevel[3].paused) {
      //Its playing...do your job
      cxt.fillStyle = "black";
      cxt.font = "90px Tourney";
      cxt.fillText("GAME OVER", 135, 300);
    } else {
      //Not playing...maybe paused, stopped or never played.
      cxt.fillStyle = "black";
      cxt.font = "25px Tourney";
      cxt.fillText(
        "lmao u trash...but hey, maybe more of this annoying",
        60,
        300
      );
      cxt.fillText("ass music will drown your sorrows.", 60, 330);
      displayMusicButts();
    }
  }

  if (mouseCollision(mouse, resetButt) && gameOver) {
    //resetButt.stroke = "black";
    resetButt.stroke = currentLevel[7];
    if (mouse.clicked) reset();
  } else {
    //resetButt.stroke = "white";
    resetButt.stroke = currentLevel[8];
  }

  if (distance === nextPhaseScore) {
    advance();
  }

  if (distance === currentLevel[4]) {
    blackScreen();
    nextLevel(); // simply removes 0 from levels'     // HERE IS WHERE NEW LEVEL COMMENCES
  }
}

setInterval(function () {
  if (!gameOver && running) {
    distance++;
  }
}, 100);

function advance() {
  nextPhaseScore += 50;
  nextPhaseReady = true;

  for (let i = 0; i <= oppHeights; i++) {
    oppHeights[i] *= 1.5;
  }
  let nextPhase = setTimeout(() => {
    if (distance <= 800) {
      enemySpeed *= 1.1; // WHERE ENEMY SPEED INCREASES, STOP AT 700 AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAHHHHH
    }
    nextPhaseReady = false;

    if (sheep1.framework === sheepFramework && sheepFrame > 1) sheepFrame -= 1;
  }, 2000);
}

var controller;

controller = {
  up: false,
  keyListener: function (event) {
    var key_state = event.type === "keydown" ? true : false;

    switch (event.keyCode) {
      case 38: // up key
      case 87:
        controller.up = key_state;
        break;
    }
  }
};

window.addEventListener("keydown", controller.keyListener);
window.addEventListener("keyup", controller.keyListener);

let jump1 = new Audio();
jump1.src = "./src/assets/sounds/JumpSoundsMan/jumppp11.ogg";
let jump2 = new Audio();
jump2.src = "./src/assets/sounds/JumpSoundsMan/jumppp22.ogg";
let jumps = [jump1, jump2];

const warren = new Image();
//let sheepDeadSpace = [60, 75, 75];
let sheepDeadSpace = [61, 75, 75]; // 61 better for level 2
let jetDeadSpace = [30, 75, 75]; // top, front, bottom

class Sheep {
  constructor() {
    this.image = warren;
    this.height = 200;
    this.width = 200;
    this.x = canvas.width * 0.01;
    this.y = floor.y - 140;
    this.y_velocity = 0;
    this.jumping = true;
    //this.deadSpace = 75;
    this.buttDeadSpace = 10; // deadSpace at the back
    this.deadSpace = sheepDeadSpace;
    this.frameX = 0;
    this.frameY = 0;
    this.spriteWidth = 302;
    this.spriteHeight = 300;
    this.minFrame = 0;
    this.maxFrame = 3;

    this.shitFrameX = 0;
    this.shitMaxFrame = 4;
    this.shitNoise = new Audio();
    this.shitNoise.src = "./src/assets/sounds/shitNoises/crack12.mp3.flac"; 
    this.shitNoisePlayed = false;

    // FURTHER IMPROVE THIS SHIT
    this.boomFrameX = 0;
    this.boomMaxFrame = 3;
    this.BoomNoise = new Audio();
    this.BoomNoise.src = "./src/assets/sounds/explosions/explodemini.wav";
    this.boomSpriteHeight = 64;
    this.boomSpriteWidth = 64;
    this.boomHeight = this.boomSpriteHeight * 4;
    this.boomWidth = this.boomSpriteWidth * 2;
    this.boomEnd = false;
    this.boomPlayed = false;

    //this.framework = blackFramework;
    this.framework = sheepFramework;
    //sheep1.framework = blackFramework;

    this.randJump = jumps[Math.floor(Math.random() * jumps.length)];
    this.jumpPlayed = false;

    this.death1 = new Audio();
    this.death1.src = "./src/assets/sounds/yelling sounds/yell12.wav";
    this.deathPlayed = false;
    this.boomAnimation = 0;

    //this.maxHeight = floor.y - 300;
    this.maxHeight = floor.y - 445;
  }
  update() {
    if (frame % sheepFrame === 0 && sheepFrame > 0 && running) {
      if (this.frameX < this.maxFrame)
        //&& this.framework !== blackFramework)
        this.frameX++;
      else this.frameX = this.minFrame;
    }
  }

  updateShit() {
    if (frame % 15 === 0) {
      if (this.shitFrameX < this.shitMaxFrame) this.shitFrameX++;
      else this.shitFrameX = this.minFrame; // minFrame is 0 so it's universal
    }
  }

  updateBoom() {
    if (frame % 15 === 0) {
      if (this.boomFrameX < this.boomMaxFrame) {
        this.boomFrameX++;
        this.boomAnimation += 1;
      } else this.boomFrameX = this.minFrame;
    }
  } // only updates the frames you shithead

  draw() {
    cxt.drawImage(
      this.image,
      this.frameX * this.spriteWidth,
      0,
      this.spriteWidth,
      this.spriteHeight,
      this.x,
      this.y,
      this.width,
      this.height
    );
  }

  drawShit() {
    cxt.drawImage(
      shit,
      this.shitFrameX * this.spriteWidth,
      0,
      this.spriteWidth,
      this.spriteHeight,
      this.x - 44,
      this.y + 25,
      this.width * 0.5,
      this.height * 0.5
    );
  }

  drawBoom() {
    cxt.drawImage(
      boom,
      sheep1.boomFrameX * sheep1.boomSpriteWidth,
      0,
      this.boomSpriteWidth,
      this.spriteHeight,
      sheep1.x + 10,
      sheep1.y + 60,
      this.boomWidth * 1.5,
      this.boomHeight * 2
    ); // ^^ cxt.drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);
  }
}

let sheep1 = new Sheep();
warren.src = sheep1.framework;

function handleSheep() {
  sheep1.draw();

  if (!gameOver) {
    sheep1.update();
  }

  if (distance >= currentLevel[6]) {
    sheep1.framework = jetStartFramework;
    warren.src = jetStartFramework;
    //sheep1.height = 250; // +50 height for jetpack
    //sheep1.y -= 100;

    sheepFrame = 15;
    sheep1.deadSpace = jetDeadSpace;
  }

  if (controller.up && sheep1.jumping === false && !gameOver) {
    if (sheep1.framework === sheepFramework) {
      sheep1.y_velocity -= 40;
    } else sheep1.y_velocity -= 56;

    sheep1.jumping = true;
    sheep1.randJump = jumps[Math.floor(Math.random() * jumps.length)];
    if (
      !gameOver &&
      sheep1.framework === sheepFramework &&
      distance < currentLevel[4] &&
      !(currentLevel === level2 && !running) // stop jump sound at level transition and level 2 start
    )
      sheep1.randJump.play(); // keep jump from playing in death
  }
  sheep1.y_velocity += 1; // influences downward speed, and upward to a degree
  sheep1.y += sheep1.y_velocity;
  sheep1.y_velocity *= 0.9; // "gravity"

  if (sheep1.y > floor.y - 140) {
    sheep1.jumping = false; // keeps sheep from sinking below floor
    sheep1.y = floor.y - 140; // 140 instead of sheep1.height to get sheep to meet floor
    sheep1.y_velocity = 0;
  }

  if (sheep1.y < sheep1.maxHeight && sheep1.framework === jetStartFramework) {
    sheep1.jumping = false;
    sheep1.y = sheep1.maxHeight;
    sheep1.y_velocity = 0;
  }
}

let oppHeights = [
  4.5,
  5,
  5.5,
  10,
  15,
  17,
  20,
  30,
  40,
  50,
  70,
  75,
  80,
  85,
  90,
  95,
  100
];
let oppQueue = [];

//let currentLevel[2] = sins3;

class Opp {
  constructor() {
    this.enemy = currentArray[Math.floor(Math.random() * currentArray.length)];

    this.image = this.enemy[0];
    this.text = this.enemy[1];

    //this.width = 100 * this.text.length * 0.5;
    this.width = this.enemy[2];
    this.height = 100;

    this.x = canvas.width + 100; // aka spawnpoint
    this.y = floor.y - this.height - 10;

    //this.randomHeight =
    // oppHeights[Math.floor(Math.random() * oppHeights.length)];

    this.randomHeight =
      oppHeights[Math.floor(Math.random() * oppHeights.length)];

    this.speed = enemySpeed;
    this.readyToSpeed = false;

    this.delete = false;

    this.deadSpace = 40;
    this.spawned = false;
  }
  update() {
    this.x -= this.speed;
  }
  draw() {
    cxt.font = "35px Tourney";
    cxt.fillText(this.image, this.x, this.y + this.height);
  }
}

const shit = new Image();
shit.src = "./src/assets/images/shitSheet3.png";

const boom = new Image();
boom.src = "./src/assets/images/exp2FirstFrames.png";

function handleOpp() {
  for (let i = 0; i < oppQueue.length; i++) {
    let current = oppQueue[i];

    if (!current.delete && running) {
      current.draw();
      if (!gameOver) {
        current.update();
      }
    }

    if (current.x < canvas.width) {
      current.spawned = true;
    }

    if (current.x < 0 - current.width) {
      current.delete = true;
    }
    if (collision(current, sheep1)) {
      gameOver = true;
      current.y = sheep1.y + 30;

      if (current.image === "🌮") {
        sheep1.updateShit();
        sheep1.drawShit();

        if (!sheep1.shitNoisePlayed) {
          sheep1.shitNoise.play();
        }
        // TACO SUPRISE EASTEREGG
      }

      if (current.image === "🧨") {
        // && sheep1.boomEnd === false) {
        //
        warren.src = blackFramework;
        sheep1.framework = blackFramework;
        if (!sheep1.boomEnd) {
          if (sheep1.boomAnimation < 6) {
            sheep1.drawBoom();
            sheep1.updateBoom();
            sheep1.BoomNoise.play();
          }
        }
      } // boom boom bby easter egg

      cxt.fillStyle = "black";
      cxt.font = "25px Tourney";
      cxt.fillText(current.text, 60, canvas.height - 120);

      if (!sheep1.deathPlayed) {
        sheep1.death1.play();
        sheep1.deathPlayed = true; // keeps annoying ass yell from repeating
      }
    }

    // ALL OF THE DISTANCE SHIT HERE
    if (!gameOver) {
      if (distance > 100 && !current.spawned) {
        current.y = floor.y - current.height - current.randomHeight; // P1: ELEVATION
      }

      if (distance > 110 && !current.spawned) {
        current.y = floor.y - current.height - current.randomHeight * 1.5; // P2: ELEVATION 2
      }

      if (distance >= 450 && !current.spawned && currentLevel === level1) {
        //currentLevel[2] = array3; // P3 NEW CHARACTERS
        currentArray = array3;
      }

      if (distance > 550) {
        // P4
        current.y =
          floor.y -
          current.height -
          oppHeights[Math.floor(Math.random() * oppHeights.length)] * 1.3; //  P4: CRAZY ELEVATOIN
        // ^^^ very cool effect found on accident
      }

      if (distance > 700) {
        current.y =
          floor.y -
          current.height -
          oppHeights[Math.floor(Math.random() * oppHeights.length)] * 2; //  P5: CRAZY ELEVATOIN II
      }

      // LEVEL2 EXCLUSISE DISTANCE SHIT
      if (currentLevel === level2) {
        if (distance > 200) {
          currentArray = array4; // P1: new characters (starting array is sins4)
        }

        //if (distance > 100 && currentLevel === level2) {
        if (sheep1.framework === jetStartFramework) {
          // P2: jetpack and ground heights

          // PLEASE FIX THIS FUCKING SHIT SOON
          currentEnemyFrames = level2Frames;
          current.y = floor.y - current.height - current.randomHeight * 4;
        }
      }

      if (distance >= currentLevel[4] - 5) {
        current.delete = true;
        /* delete all enemies a couple frames before start of next level,
        so that game over/reset shit doesn't get in the way */
      }
    }
  }

  if (
    frame %
      currentEnemyFrames[
        Math.floor(Math.random() * currentEnemyFrames.length)
      ] ===
      0 &&
    !nextPhaseReady
    //&& !(distance > currentLevel[6] + 30 && currentLevel === level2) // stop spawning at jetpack
  ) {
    oppQueue.push(new Opp()); // HERE'S WHERE NEW ENEMIES ARE ADDED
  }
}

const cloud1 = new Image();
cloud1.src = "./src/assets/images/cloud1.png";
const cloud2 = new Image();
cloud2.src = "./src/assets/images/cloud2.png";
const cloud3 = new Image();
cloud3.src = "./src/assets/images/cloud3.png";
const blimp1 = new Image();
blimp1.src = "./src/assets/images/blimp3.png";
const blimpSign1 = new Image();
blimpSign1.src = "./src/assets/images/blimpSignFrames4.png";

const madCloud1 = new Image();
madCloud1.src = "./src/assets/images/corrupt clouds/darkcloud1.png";
const madCloud2 = new Image();
madCloud2.src = "./src/assets/images/corrupt clouds/darkcloud2.png";
const madCloud3 = new Image();
madCloud3.src = "./src/assets/images/corrupt clouds/darkcloud3.png";

let madCloudTypes = [madCloud1, madCloud2, madCloud3];
let cloudTypes = [cloud1, cloud2, cloud3];
let cloudQueue = [];

class Cloud {
  constructor() {
    this.cloud = cloudTypes[Math.floor(Math.random() * cloudTypes.length)];
    this.madCloud =
      madCloudTypes[Math.floor(Math.random() * madCloudTypes.length)];
    //this.image = cloudTypes[Math.floor(Math.random() * cloudTypes.length)];
    this.image = this.cloud;
    this.width = 150;
    this.height = 50;
    this.x = canvas.width + 100;
    this.y = randomFrames[Math.floor(Math.random() * randomFrames.length)];
    this.delete = false;
    this.speed = enemySpeed * 0.5;
  }
  draw() {
    cxt.drawImage(this.image, this.x, this.y, this.width, this.height);
  }
  update() {
    //this.x -= enemySpeed * Math.random(); //gives cool creepy effect to clouds
    this.x -= this.speed;
    //if (currentLevel === level2) this.x -= enemySpeed * Math.random(); // creepy effect here
  }
}

function handleCloud() {
  for (let i = 0; i < cloudQueue.length; i++) {
    let current = cloudQueue[i];

    if (currentLevel === level2) current.image = current.madCloud;

    if (!current.delete && running && current.x >= -150) {
      current.draw();
      if (!gameOver) {
        current.update();
      }
    }
    //hngfdfdsfds (distance >= 800) this.x -= enemySpeed * Math.random();
  }
  if (
    frame % randomFrames[Math.floor(Math.random() * randomFrames.length)] ===
      0 &&
    !nextPhaseReady
  ) {
    cloudQueue.push(new Cloud());
  }
}

//"vestigia nulla retrorsum" not a step backwards

let blimpSignTypes = [
  ["YOU GO WARREN", 390],
  ["Way 2 Go!!!", 250],
  ["Get to score 800 to get a jetpack!", 800],
  ["WOOHOO!!!", 250],
  ["WE LOVE WARREN THE SHEEP", 645],
  ["ALMOST THERE", 390], // this.x + 60 is perfect for these two. 390 / 6.5 = 60
  ["YEAHH BABY WOOOO!!!", 500],
  ["wait there's something wrong", 690],
  ["can you hear me???", 700],
  ["I can't believe it's happening", 720],
  ["We've been waiting for so long", 720],
  ["He chose you", 350], 
  ["Please help us Warren", 570],
  ["I'm talking to you from the underworld", 715],
  ["This is the only way I can communicate", 1000],
  ["Warren, get to score 1000 to advance", 1000], // BIG HINT
  ["they kidnapped me back in '08", 690],
  ["I miss everyone. I think of them all the time", 1100],
  ["I hope they still remember me", 690],
  ["enjoy life. Eternity's right around the corner", 1100],
  ["so repent before its too late", 690],
  ["Don't listen to what the beast has to say", 1000],
  ["He and his angels are on earth", 720],
  ["They're everywhere. Everything's already in place", 1000],
  ["They have the technology now so everything will be fulfilled", 1300],
  ["One world government and one mark.", 1110],
  ["And stop listening to their music. Rainman's got them", 250],
  ["Its so lonely down here", 570],
  ["I'm all alone with my thoughts", 720],
  ["They're always listening", 690],
  ["You can't even sleep. It's not allowed", 1100],
  ["I haven't slept in over 10 years", 720],
  ["YOUR AD HERE", 380],
  ["Placeholder. This isn't supposed to show", 1100]
];

const corpse1 = new Image();
corpse1.src = "./src/assets/images/corpse shit/deadWarren1BETTER.png";
const corpse2 = new Image();
corpse2.src = "./src/assets/images/corpse shit/deadWarren2BETTER.png";
const corpse3 = new Image();
corpse3.src = "./src/assets/images/corpse shit/deadWarren3Better.png";

const cross1 = new Image();
cross1.src = "./src/assets/images/crossWarren/crossWarren1BaseImage2.png";
const cross2 = new Image();
cross2.src = "./src/assets/images/crossWarren/crossWarren2Better.png";
const cross3 = new Image();
cross3.src = "./src/assets/images/crossWarren/crossWarren3Better.png";

class Corpse extends Cloud {
  constructor() {
    super();
    this.image = corpseTypes[Math.floor(Math.random() * corpseTypes.length)];
    this.size = [200, 150, 170][Math.floor(Math.random() * 3)];
    //this.size = 200;
    this.width = this.height = this.size;
    // var a = b = 0;
    this.x = canvas.width + 100; // aka spawnpoint
    //this.y = canvas.height - 200;
    this.y =
      canvas.height -
      [this.size, this.size + 50, this.size - 30][
        Math.floor(Math.random() * 3)
      ];

    //this.speed = enemySpeed;
    this.speed = enemySpeed;
    this.nextSpawnReady = false;
  }
}

let corpseTypes = [corpse1, corpse2, corpse3];
let corpseQueue = [];

//  CORPSES SPAWN ONLY AT SECOND PHASE
let corpseSpawnFrames = level2Frames;
function handleCorpse() {
  for (let i = 0; i < corpseQueue.length; i++) {
    let corpse = corpseQueue[i];
    if (corpse.image === corpse3) corpse.size *= 4;
    if (running) {
      // && currentLevel === level2

      corpse.draw();
      if (!gameOver) {
        if (corpse.x >= -corpse.width) {
          corpse.update();
        } //else corpseQueue.pop(corpse);
      }
    }
  }
  if (distance >= 150) corpseSpawnFrames = randomFrames; // increase corpse spawn rate

  if (
    (frame %
      corpseSpawnFrames[Math.floor(Math.random() * corpseSpawnFrames.length)]) *
      0.1 ===
      0 &&
    !nextPhaseReady &&
    distance > 80 &&
    currentLevel === level2
  ) {
    corpseQueue.push(new Corpse());
  }
}

let crossTypes = [cross1, cross2, cross3];
let crossDimTypes = [
  [[canvas.height - 620, canvas.height - 500], 800, 900, 0.5], // 650. big ass in your face
  [[canvas.height - 350, canvas.height - 310], 300, 450, 1]
]; // distance from screen (y), size, speed * enemySpeed

//let currentDim = crossDimTypes.slice(0, -1);
let currentDim = crossDimTypes[1];
// animals.slice(0, -1)

// distance from screen, height, width, speed relative to enemySpeed
// FIX THIS CROSS SHIT
let crossQueue = [];
class Cross extends Cloud {
  constructor() {
    super();
    this.image = crossTypes[Math.floor(Math.random() * crossTypes.length)];
    //this.dim = crossDimTypes[Math.floor(Math.random() * crossDimTypes.length)];
    //this.dim = crossDimTypes[currentDim];
    this.dim = currentDim;
    //this.y = this.dim[0][Math.floor(Math.random() * this.dim[0].length)];
    this.y = this.dim[0][Math.floor(Math.random() * this.dim[0].length)];
    this.x = canvas.width + this.width;
    this.height = this.dim[1];
    this.width = this.dim[2];
    this.speed = enemySpeed * this.dim[3];
  }
}

// FIX THIS OVERLAPPING SHIT
//let crossFrames = [100, 250];
function handleCross() {
  for (let i = 0; i < crossQueue.length; i++) {
    let corpse = crossQueue[i];

    if (running) {
      // && currentLevel === level2
      corpse.draw();
      if (!gameOver) {
        if (corpse.x >= -corpse.width) {
          corpse.update();
        }
      }
    }
  }
  if (distance >= 350)
    currentDim =
      crossDimTypes[Math.floor(Math.random() * crossDimTypes.length)];
  if (
    frame % level2Frames[Math.floor(Math.random() * level2Frames.length)] ===
      0 &&
    !nextPhaseReady &&
    currentLevel === level2 &&
    distance >= 250
  ) {
    crossQueue.push(new Cross());
  }
}

class Blimp extends Cloud {
  constructor() {
    super();
    this.image = blimp1;
    this.width = 250;
    this.height = 300;
    this.y =
      randomFrames[Math.floor(Math.random() * randomFrames.length)] - 100;

    this.speed = 5 * 0.6; // enemySpeed * 0.6
  }
}

class BlimpSign extends Sheep {
  // made child class of sheep to handle frames
  constructor() {
    super();
    this.signType = blimpSignTypes[0];
    this.image = blimpSign1;
    this.text = this.signType[0];

    this.height = 200;
    this.width = this.signType[1];
    this.x = 0;
    this.y = 0;

    this.frameX = 0;
    this.frameY = 0;
    this.spriteWidth = 302;
    this.spriteHeight = 300;
    this.minFrame = 0;
    this.maxFrame = 3;
  }
  writeText() {
    cxt.font = "20px Tourney";
    cxt.fillText(this.text, this.x + this.width / 6.5, this.y + 58);
  }
}

let blimpQueue = [];
let blimpSignQueue = [];

let distanceSpawns = [100, 250, 400, 550, 700, 850, 900];
function handleBlimp() {
  for (let i = 0; i < blimpQueue.length; i++) {
    if (blimpQueue.length >= 1) {
      let blimp = blimpQueue[i];
      let blimpSign = blimpSignQueue[i];
      blimpSign.x = blimp.x + blimp.width - 5; // here's what makes letters follow sign
      blimpSign.y = blimp.y + 75;

      if (!blimp.delete && running) {
        blimp.draw();
        blimp.update();

        blimpSign.draw();
        blimpSign.update();
        blimpSign.writeText();
      }
      //if (blimpSign.x + blimpSign.width <= 0 && blimpQueue.length > 1) {
      if (blimpSign.x + blimpSign.width <= 0) {
        blimpQueue.splice(0);
        blimpSignQueue.splice(0);
        blimpSignTypes.splice(0, 1); // DISCOVERY: ADDING 1 MAKES SURE THE INDICES ARE REORGANIZED
      }
    }
  }
  for (let i = 0; i <= distanceSpawns.length; i++) {
    if (
      distance === distanceSpawns[i] &&
      blimpQueue.length === 0 &&
      blimpSignTypes.length > 0
    ) {
      blimpQueue.push(new Blimp());
      blimpSignQueue.push(new BlimpSign());
    }
  }
}

function collision(opp, sheep) {
  if (
    opp.x + opp.width >= sheep.x + sheep.width && // if opp width is greater than sheep width
    opp.x <= sheep.x + sheep.width - sheep.deadSpace[1] && // if opp.x is less than sheep.width (MAKES SENSE)
    sheep.y + sheep.height - sheep.deadSpace[2] >= opp.y + opp.deadSpace && // if sheepBottom greater than opp top
    sheep.y + sheep.deadSpace[0] + 5 <= opp.y + opp.height // if sheepTop less than oppBottom
  ) {
    return true;
  } else {
    return false;
  }
}

function mouseCollision(first, second) {
  if (
    first.x >= second.x &&
    first.x <= second.x + second.size &&
    first.y >= second.y &&
    first.y <= second.y + second.size
  ) {
    return true;
  }
}

function loop() {
  cxt.clearRect(0, 0, canvas.width, canvas.height); // clears screen
  handleLayer();
  handleCloud();
  handleBlimp();
  handleSheep();
  gameStatus();
  handleOpp();
  handleCorpse();
  handleCross();

  startGame();
  frame++;
  window.requestAnimationFrame(loop);
}

window.requestAnimationFrame(loop);
