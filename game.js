import { init, Sprite, SpriteSheet, Scene, GameLoop, initKeys, keyPressed, Text, collides } from "./libs/kontra.js";


let { canvas, context } = init();
context.imageSmoothingEnabled = false;
let offscreenCanvas = document.createElement('canvas');

let gameOver = false;
let bpm = 100;
let node = null;
let playingSong = true;
let starting = false;

let image = new Image();
image.onload = function() {


initKeys();

let ground = 131;
let gravity = 0.3;
let points = 0;
let highScore = localStorage.getItem("highScore") || 0;
let multiplier = 0.0001;
var AttackCooldown = 0;   
var activeScene = "menu"

function playSong() {
  console.log(bpm);
  let song = [[[,0,25,.002,.02,.08,3,,,,,,,,,.1,.01]],[[[,,13,,,,13,,,15,17,,13,,17,,20,,25,,,,25,,,24,25,,20,,17,,13,,18,,,,22,,,18,17,,20,,17,,13,,15,,,,20,,,22,20,,18,,17,,15,,]],[[,,13,,,,13,,,15,17,,13,,17,,20,,25,,,,25,,,24,25,,20,,17,,13,,18,,,,22,,,18,17,,20,,17,,13,,15,,,,13,,,12,13,,,,24,,,25]],[[,,27,,,,27,,,27,27,,24,,20,,,,25,,,,29,,,27,25,,22,,20,,,,25,,,,25,,,25,25,,,,25,,,24,22,,25,,24,,22,,20,,18,,17,,15,,]],[[,,13,,,,13,,,15,17,,13,,17,,20,,25,,,,25,,,24,25,,20,,17,,13,,18,,,,22,,,18,17,,20,,17,,13,,15,,,,13,,,12,13,,,,,,,,]]],[0,1,2,3],bpm,{"title":"Scotland The Brave","instruments":["Poly Synth"],"patterns":["Pattern 0","Pattern 1","Pattern 2","Pattern 3"]}]
  // generate the sample data and play the song
  let buffer = zzfxM(...song);
  node = zzfxP(...buffer);
  playingSong = true;

  // attach an onended event to update BPM and play again
  node.onended = function() {
    playingSong = false;
    
    // increase BPM
    if (points >= 1){
    bpm += 20;
    }
    
    // play the song again with updated BPM
    if (!gameOver && !playingSong){
      playSong();
    }
  };
};

let time = 0;

// custom function to draw pixel art text
function drawPixelText(context, text, x, y, font, threshold, scalingFactor, wiggle) {
  const canvasWidth = 250;
  const canvasHeight = 32;
  offscreenCanvas.width = canvasWidth;
  offscreenCanvas.height = canvasHeight;
  let d = offscreenCanvas.getContext('2d');
  time +=0.01

  d.font = font;
  d.textBaseline = "middle";
  d.fillText(text, 0, 16);

  let I = d.getImageData(0, 0, canvasWidth, canvasHeight);

  // set fill style
  context.fillStyle = '#001023';
  context.lineWidth = 1;

  let offsetY = 0; // initialize the offsetY variable outside the loop

  for (let i = 0; i < canvasWidth; i++) {
    for (let j = 0; j < canvasHeight; j++) {
      if (
        I.data[(j * canvasWidth + i) * 4 + 1] > threshold ||
        I.data[(j * canvasWidth + i) * 4 + 2] > threshold ||
        I.data[(j * canvasWidth + i) * 4 + 3] > threshold
      ) {
        if (wiggle) {
          // only calculate offsetY if wiggle is true
          offsetY = Math.sin(time + i * 0.06) * 5;
        }
        // draw the pixel with potentially modified offsetY
        context.fillRect(x + i * scalingFactor, y + j * scalingFactor + offsetY, scalingFactor, scalingFactor);
        
      }
    }
  }

}

  let characterSheet = SpriteSheet({
    image: image,
    frameWidth: 16,
    frameHeight: 32,
    animations: {
      knightWalk: {
        frames: '10..12',
        frameRate: 1
      },
      knightJump: {
        frames: '6..6',
        frameRate: 1
      },
      knightSlide: {
        frames: '16..16',
        frameRate: 1
      },
      knightSlideLegs: {
        frames: '17..17',
        frameRate: 1
      },
      enemyWalk: {
        frames: '18..19',
        frameRate: 5
      },
      skellyWalk: {
        frames: '2..3',
        frameRate: 5
      }
    }
  });

  let layingSheet = SpriteSheet({
    image: image,
    frameWidth: 32,
    frameHeight: 16,
    animations: {
      laying: {
        frames: '2..2',
        frameRate: 1
      },
      deadEnemy: {
        frames: '12..12',
        frameRate: 1
      },
      deadSkelly: {
        frames: '13..13',
        frameRate: 1
      }
    }
  });

  let arrowSheet = SpriteSheet({
    image: image,
    frameWidth: 32,
    frameHeight: 8,
    animations: {
      arrow: {
        frames: '4..4',
        frameRate: 1
      },
    }
  });

  let controlsSheet = SpriteSheet({
    image: image,
    frameWidth: 8,
    frameHeight: 16,
    animations: {
      arrowup: {
        frames: '45..45',
        frameRate: 1
      },
      arrowdown: {
        frames: '44..44',
        frameRate: 1
      },
    }
  });

  
  let swordSheet = SpriteSheet({
    image: image,
    frameWidth: 32,
    frameHeight: 16,
    animations: {
      sword: {
        frames: '10..10',
        frameRate: 1
      },
    }
  });

  let obstacleSheet = SpriteSheet({
    image: image,
    frameWidth: 16,
    frameHeight: 16,
    animations: {
      rock: {
        frames: '13..14',
        frameRate: 1
      },
    }
  });

  let backgroundSheet = SpriteSheet({
    image: image,
    frameWidth: 512,
    frameHeight: 256,
    animations: {
      default: {
        frames: '1..1',
        frameRate: 1
      },
      bridge: {
        frames: '2..2',
        frameRate: 1
      },
      trees: {
        frames: '3..3',
        frameRate: 1
      },
      clouds: {
        frames: '4..4',
        frameRate: 1
      },
  },  
});

let knightGameText = Text({
  x: 165,
  y: -4,
  width: 512,
  height: 256,
  anchor: { x: 0.5, y: 0.5 },
  render() {
    drawPixelText(this.context, '', this.x, this.y, '14px  Calibri', 13, 3, true);
  }
});

let pressStartText = Text({
  x: 213,
  y: 25,
  width: 512,
  height: 256,
  anchor: { x: 0.5, y: 0.5 },
  counter: 0,
  render() {
    drawPixelText(this.context, 'PRESS OK To Start', this.x, this.y, '14px Calibri', 13, 2, false);
  }
});

let highScoreMainText = Sprite({
  x: 10,
  y: 165,
  width: 512,
  height: 256,
  anchor: { x: 0, y: 0.5 },
  render() {
    drawPixelText(this.context, `HIGH SCORE: ${Math.floor(highScore)}`, this.x, this.y, '14px Calibri', 13, 2, false);
  }
});

let pointsText = Text({
  x: 7,
  y: 1,
  anchor: { x: 0.5, y: 0.5 },
  render() {
    drawPixelText(this.context, `${Math.floor(points)}`, this.x, this.y, '14px Calibri', 13, 2, false);
  }
});

let controlsText = Text({
  x: 95,
  y: 40,
  anchor: { x: 0.5, y: 0.5 },
  render() {
    drawPixelText(this.context, 'CONTROLS:', this.x, this.y, '12px Calibri', 29, 2, false);
  }
});

let jumpText = Text({
  x: 89,
  y: 52,
  anchor: { x: 0.5, y: 0.5 },
  render() {
    drawPixelText(this.context, ' J U M P:  ', this.x, this.y, '12px Calibri', 13, 2, false);
  }
});

let duckText = Text({
  x: 92,
  y: 66,
  anchor: { x: 0.5, y: 0.5 },
  render() {
    drawPixelText(this.context, 'S L I D E:   ', this.x, this.y, '12px Calibri', 13, 2, false);
  }
});

let spaceText = Text({
  x: 89,
  y: 78,
  anchor: { x: 0.5, y: 0.5 },
  render() {
    drawPixelText(this.context, 'A T T A C K : O K', this.x, this.y, '12px Calibri', 13, 2, false);
  }
});

let gameOverText = Text({
  x: 36,
  y: 5,
  anchor: { x: 0.5, y: 0.5 },
  textAlign: "center",
  opacity: 0,
  render() {
    drawPixelText(this.context, 'GAME OVER', this.x, this.y, '14px Calibri', 13, 5, false);
  }
});

let pressRestartText = Sprite({
  x: 180,
  y: 115,
  width: 512,
  height: 256,
  anchor: { x: 0.5, y: 0.5 },
  opacity: 0,
  counter: 0,
  render() {
    drawPixelText(this.context, 'PRESS ENTER TO RESTART', this.x, this.y, '14px Calibri', 13, 2, false);
  }
});

let arrowdown = Sprite({
  x: 295,
  y: 146,
  width: 16,
  height: 32,
  animations: controlsSheet.animations,
});

let arrowup = Sprite({
  x: 296,
  y: 120,
  width: 16,
  height: 32,
  animations: controlsSheet.animations,
});

const textSprites = [knightGameText, pressStartText, highScoreMainText, controlsText, jumpText, duckText, spaceText, arrowup, arrowdown];

let waterAndSkyA = Sprite({
  x: 0,
  y: 0,
  width: 512,
  height: 256,
  animations: backgroundSheet.animations,
  dx: -0.5,
  order: 0,
});

let waterAndSkyB = Sprite({
  x: 512,
  y: 0,
  width: 512,
  height: 256,
  animations: backgroundSheet.animations,
  dx: -0.5,
  order: 1,
});

let bridgeA = Sprite({
  x: 0,
  y: 0,
  width: 512,
  height: 256,
  animations: backgroundSheet.animations,
  dx: -1.25,
  order: 0,
});

let bridgeB = Sprite({
  x: 512,
  y: 0,
  width: 512,
  height: 256,
  animations: backgroundSheet.animations,
  dx: -1.25,
  order: 0,
});

let treesA = Sprite({
  x: 0,
  y: 0,
  width: 512,
  height: 256,
  animations: backgroundSheet.animations,
  dx: -1,
  order: 0,
});

let treesB = Sprite({
  x: 511,
  y: 0,
  width: 512,
  height: 256,
  animations: backgroundSheet.animations,
  dx: -1,
  order: 0,
});

let cloudA = Sprite({
  x: 0,
  y: 0,
  width: 512,
  height: 256,
  animations: backgroundSheet.animations,
  dx: -0.2,
  order: 0,
});

let cloudB = Sprite({
  x: 510,
  y: 0,
  width: 512,
  height: 256,
  animations: backgroundSheet.animations,
  dx: -0.2,
  order: 0,
});

let rock = Sprite({
  x: 512,
  y: ground + 48,
  width: 16,
  height: 16,
  animations: obstacleSheet.animations,
  dx: -3,
  dead: false,
});

let skelly = Sprite({
  x: 1300,
  y: ground,
  width: 32,
  height: 64,
  animations: characterSheet.animations,
  dx: -3,
  dead: false,
});

let enemy = Sprite({
  x: 768,
  y: ground,
  width: 32,
  height: 64,
  animations: characterSheet.animations,
  dx: -3,
  dead: false,
});

let arrow = Sprite({
  x: 1024,
  y: ground + 15,
  width: 32,
  height: 8,
  animations: arrowSheet.animations,
  dx: -3,
  dead: false,
});


let knight = Sprite({
  x: 30,
  y: ground,
  width: 32,
  height: 64,
  dx: 0,
  attacking: false,
  ducking: false,
  jumping: false,
  animations: characterSheet.animations,
});

let knightLegs = Sprite({
  x: 62,
  y: 156,
  width: 32,
  height: 64,
  opacity: 0,
  animations: characterSheet.animations,
});

let sword = Sprite({
  x: 30,
  y: 220,
  width: 64,
  height: 16,
  dx: 0,
  opacity: 0,
  animations: swordSheet.animations
});

let start = Scene({
  id: 'start',
  objects: [waterAndSkyA, waterAndSkyB, cloudA, cloudB, treesA, treesB, bridgeA, bridgeB, knightGameText, pressStartText, highScoreMainText, controlsText, jumpText, duckText, spaceText, arrowdown, arrowup]
});

let game = Scene({
  id: 'game',
  objects: [waterAndSkyA, waterAndSkyB, cloudA, cloudB, treesA, treesB, bridgeA, bridgeB, knight, knightLegs, rock, enemy, skelly, arrow, sword, pointsText,  gameOverText, pressRestartText],
});

// creates an array of the enemy sprites
let sprites = [rock, enemy, skelly, arrow];

// creates an array of the background sprites
let waterAndSkySprites = [waterAndSkyA, waterAndSkyB];
let bridgeSprites = [bridgeA, bridgeB];
let treeSprites = [treesA, treesB];
let cloudSprites = [cloudA, cloudB];

let loop = GameLoop({
  update: function () {
    if (!enemy.dead) {
      enemy.animations.enemyWalk.frameRate = -enemy.dx;
    }
    if(!skelly.dead){
      skelly.animations.skellyWalk.frameRate = -skelly.dx;
    }
    rock.animations.rock.frameRate = -rock.dx * 2;
    bridgeA.playAnimation('bridge');
    bridgeB.playAnimation('bridge');
    treesA.playAnimation('trees');
    treesB.playAnimation('trees');
    cloudA.playAnimation('clouds');
    cloudB.playAnimation('clouds');
    arrowup.playAnimation('arrowup');
    arrowdown.playAnimation('arrowdown');

    function loopBackground(backgroundOne, backgroundTwo) {
      if(backgroundOne.x <= -512) {
        backgroundOne.x = 0;
        backgroundTwo.x = 512;
      }
    }

    loopBackground(waterAndSkyA, waterAndSkyB);
    loopBackground(bridgeA, bridgeB);
    loopBackground(treesA, treesB);
    loopBackground(cloudA, cloudB);

    if (activeScene == "menu"){

      if (starting){
        for (let textSprite of textSprites) {
          textSprite.opacity -= 0.1;
        }
        if (knightGameText.opacity <= 0.01){
          activeScene = "game"
          if (!gameOver){
            playSong();
            }
          }
      }
      pressStartText.counter++;
      if (!starting){
      if (pressStartText.counter % 30 === 0) {
        pressStartText.opacity = pressStartText.opacity === 1 ? 0 : 1;
      }
    }
      if (keyPressed("enter")){
        //loop of textSprites lowering opacity
        starting = true
      }
    }
    if (activeScene == "game")
    {
    pressRestartText.counter ++;
    knight.update();
    if (!gameOver){
    knight.playAnimation('knightWalk');
    knight.animations.knightWalk.frameRate = -rock.dx * 2;
    }
    arrow.playAnimation("arrow");
    rock.update();
    rock.playAnimation("rock");
    if(!enemy.dead){
    enemy.playAnimation('enemyWalk');
    }
    enemy.update();
    arrow.update();
    sword.update();
    if(!skelly.dead){
    skelly.playAnimation('skellyWalk');
    }
    skelly.update();

    let speedMultiplier = 1.0001;
  
    // speed is gradually updated for enemy sprites
    if (rock.dx >= -13 && !gameOver) {
      for (let enemySprite of sprites) {
        enemySprite.dx *= speedMultiplier;
      }
    }

    // points system start
    multiplier += 0.00001;
    if (!gameOver){points = points + multiplier;}
    pointsText.text = Math.floor(points);
    //points system end

    //jumping start

    //make knight fall
    knight.dy += gravity;

    //if on (or below) ground, go to ground, else play jumping animation
    if (knight.y >= ground) {
      knight.y = ground;
      knight.jumping = false;
    }
    else {
      knight.playAnimation("knightJump")
    }

    //if on ground, make knight jump up
    if ((keyPressed("arrowup") || keyPressed("w")) && knight.ducking == false && !gameOver) {
      if (knight.y >= ground) {
        if(knight.attacking == false && knight.ducking == false){
        zzfx(...[,,69,.01,.02,.14,1,1.42,8.3,,,,,.1,,,,.7,.09]); // jump
        }
        knight.dy = -5;
        knight.jumping = true;
      }
    }
    //jumping end

    // attack start
    if ((keyPressed("enter")) && (AttackCooldown == 0) && (knight.ducking == false) && knight.y >= ground && !gameOver) {
      // show sword
      zzfx(...[1.07,,1260,.02,.07,,1,1.61,5.7,1.8,,,,,5,,,.75]); // hit
      sword.opacity = 1;
      AttackCooldown = 30;
    }

    // if sword is showing
    if (sword.opacity == 1) {
      // check for collisions
      function checkCollisions(opponent) {
        if (collides(sword, opponent)) {
          opponent.width = 64;
          opponent.height = 32;
          opponent.y += 16;
          opponent.dy = 1
          opponent.dead = true;
        }
      }

      checkCollisions(enemy);
      checkCollisions(skelly);

      if (enemy.dead) {
        enemy.animations = layingSheet.animations;
        enemy.playAnimation("deadEnemy");
      }

      if (skelly.dead) {
        skelly.animations = layingSheet.animations;
        skelly.playAnimation("deadSkelly");
      }

      sword.x += 1;
    }

    // decrements the cooldown if it has been triggered
    if (AttackCooldown > 0) {
      AttackCooldown -= 1;
      if (AttackCooldown < 14) {
        // hide sword
        sword.opacity = 0;
        sword.x = 45;
      }
    }
    // attack end

    //duck start
    if ((keyPressed("arrowdown") || keyPressed('s')) && knight.jumping == false && !gameOver){
      if (knight.ducking == false){
      zzfx(...[,,-5,.03,.02,.08,1,.19,1.6,1.1,200,,,,2,,,.67,.02]); // duck
      }
      knight.ducking = true;
      sword.opacity = 0;
      knightLegs.opacity = 1;
      knightLegs.playAnimation("knightSlideLegs")
      knight.playAnimation("knightSlide");
      knightLegs.opacity = 1;
      knight.height = 64;
      knight.y = 155;
    }
    else {
      knightLegs.opacity = 0;
      knight.height = 64;
      knight.ducking = false;
    }

    // check for a game over
    for (let sprite of sprites) {
      if (collides(knight, sprite) && !sprite.dead) {
        if (!gameOver){
        zzfx(...[,,348,.1,.14,.46,,.14,-0.1,-2.8,-62,.08,.06,,,.1,,.48,.26]); // game over sound effect
        gameOver = true;
        }
      }
    }

    function calculateSpeed(backgroundSprites, speed) {
      backgroundSprites.forEach((sprite) => {
        sprite.dx = rock.dx / speed;
        sprite.update();
      });
    }

    // speed is gradually updated for background sprites
    calculateSpeed(waterAndSkySprites, 5);
    calculateSpeed(treeSprites, 3);
    calculateSpeed(cloudSprites, 8);
    calculateSpeed(bridgeSprites, 1.25);

    if (gameOver){
      // stopping game
      if (points > highScore) {
        highScore = points;
        localStorage.setItem("highScore", highScore);
      }

      for (let enemySprite of sprites) {
        enemySprite.dx = 0;
      }

      knight.animations = layingSheet.animations;
      knight.y = 169;
      knight.width = 64;
      knight.height = 32;
      enemy.animations.enemyWalk.frameRate = 0;
      skelly.animations.skellyWalk.frameRate = 0;
      gameOverText.opacity = 1;
      if (pressRestartText.counter % 30 === 0) {
        pressRestartText.opacity = pressRestartText.opacity === 1 ? 0 : 1;
      }
      bpm = 100;
      node.stop();

      // reinitialising game
      if(keyPressed("enter")){
        bpm = 100;
        if(!playingSong){playSong();}
        gameOver = false
        gameOverText.opacity = 0;
        pressRestartText.opacity = 0;
        knight.animations = characterSheet.animations;
        knight.playAnimation("knightWalk");
        knight.width = 32;
        points = 0;
        multiplier = 0.0001;

        for (let enemySprite of sprites) {
          enemySprite.dx = -3;
        }

        rock.x = 256;
        enemy.x = 512;
        skelly.x = 1200;
        arrow.x = 768;
      }
    }
    // end

    function isCloseToOtherSprites(newSpriteX, currentSprite, sprites) {
      for (let sprite of sprites) {
        if (sprite !== currentSprite && Math.abs(sprite.x - newSpriteX) < 300) {
          return true;
        }
      }
      return false;
    }

    // if an enemy sprite is too close to another, that sprite will be repositioned appropriately
    for (let sprite of sprites) {
      if (sprite.x <= -50) {
        let newSpriteX;
        do {
          newSpriteX = Math.floor(Math.random() * 2048) + 512;
        } while (isCloseToOtherSprites(newSpriteX, sprite, sprites) == true);

        sprite.x = newSpriteX;
        if(sprite.dead == true){
        sprite.width = 32;
        sprite.height = 64;
        sprite.dead = false;
        sprite.dy = 0;
        sprite.y = ground;
        sprite.animations = characterSheet.animations;
        enemy.playAnimation('enemyWalk');
        skelly.playAnimation('skellyWalk');
      }
    }
    }

    // sword position is updated when jumping
    sword.y = knight.y + 25;
  }
},
  render: function () {
    if (activeScene == "menu") {
      start.render();
      start.update();
    }
    else if (activeScene == "game"){
      game.render();
    }
  },
});

loop.start()
};

image.src = 'assets/sheet.webp';