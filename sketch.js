// biar ga error
p5.disableFriendlyErrors = true; 

// ====== Audio ======
let bgm;               
let audioStarted = false;
const BGM_PATH = "Assets/Bgm Multo Instrumental.mp3"; 

// ====== Kanvas dan posisinya ======
const W = 1920, H = 1080;
let cx, baseCy, cy;
const centerOffset = { x: -27, y: 350 };
let scaleSprite = 0.5;

// ====== Gerak Horuzontal ======
let speedX = 460;
const MARGIN = 0;

// ====== Latar ======
let bgImg;
const BG_PATH = "Assets/Background Pixel.jpg";

// ====== karakter ======
let idleRightFrames = [], idleLeftFrames = [];
let runRightFrames  = [], runLeftFrames  = [];
let jumpRightFrames = [], jumpLeftFrames = [];

// ====== Keadaan ======
const State = Object.freeze({ Idle:'idle', Run:'run', RunLeft:'runLeft', Jump:'jump' });
let state = State.Idle;
let facing = 'right';

// ====== Index ======
let idx = { idleR:0, idleL:0, runR:0, runL:0, jumpR:0, jumpL:0 };
let dir = { idleR:1, idleL:1 };
let fps = { idle:8, run:8, runLeft:8, jump:8 };

// ====== Input ======
const keys = { d:false, a:false };

// ====== Jump ======
let jumpTimer = 0;
const jumpDur = [0.12, 0.18];
let jumpMotionT = 0;
const jumpMotionTotal = 0.40;
const jumpHeight = 140;
let cyStart = 0;

// ====== Load gambar n audio ======
function preload(){

  bgImg = loadImage(BG_PATH); 

  idleRightFrames = [
    loadImage("Assets/Idle/Idle Right 1.png"),
    loadImage("Assets/Idle/Idle Right 2.png"),
    loadImage("Assets/Idle/Idle Right 3.png")
  ];
  idleLeftFrames = [
    loadImage("Assets/Idle/Idle Left 1.png"),
    loadImage("Assets/Idle/Idle Left 2.png"),
    loadImage("Assets/Idle/Idle Left 3.png")
  ];

  runRightFrames = [
    loadImage("Assets/Run/Run Right 1.png"),
    loadImage("Assets/Run/Run Right 2.png"),
    loadImage("Assets/Run/Run Right 3.png"),
    loadImage("Assets/Run/Run Right 4.png")
  ];
  runLeftFrames = [
    loadImage("Assets/Run/Run Left 1.png"),
    loadImage("Assets/Run/Run Left 2.png"),
    loadImage("Assets/Run/Run Left 3.png"),
    loadImage("Assets/Run/Run Left 4.png")
  ];

  jumpRightFrames = [
    loadImage("Assets/Jump/Jump Right 1.png"),
    loadImage("Assets/Jump/Jump Right 2.png")
  ];
  jumpLeftFrames = [
    loadImage("Assets/Jump/Jump Left 1.png"),
    loadImage("Assets/Jump/Jump Left 2.png")
  ];

  bgm = loadSound(BGM_PATH);
}

// ====== Setup ======
function setup(){
  createCanvas(W, H);
  imageMode(CENTER);
  cx = width/2; baseCy = height/2; cy = baseCy;


  if (getAudioContext().state !== 'suspended') {
   
  }
}


function startAudioIfNeeded(){
  if (!audioStarted) {
    userStartAudio();            
    if (bgm && !bgm.isPlaying()) {
      bgm.setVolume(0.5);         
      bgm.loop();               
    }
    audioStarted = true;
  }
}

// klik/tap/tekan
function mousePressed(){ startAudioIfNeeded(); }    
function touchStarted(){ startAudioIfNeeded(); return false; } 
function keyPressedOnceForAudio(){ startAudioIfNeeded(); }     

// ====== Drwaw ======
function draw(){
  // gambar latar
  imageMode(CORNER); image(bgImg, 0, 0, width, height); imageMode(CENTER);

  // update arahnya
  if (state !== State.Jump){
    if (keys.d && !keys.a){ state = State.Run; facing = 'right'; }
    else if (keys.a && !keys.d){ state = State.RunLeft; facing = 'left'; }
    else { state = State.Idle; }
  }

  // gerak horizontal
  const dt = deltaTime * 0.001;
  if (state === State.Run) cx += speedX * dt;
  else if (state === State.RunLeft) cx -= speedX * dt;
  cx = constrain(cx, MARGIN, width - MARGIN);

  // render gambar sesuai keadaan
  cy = baseCy;
  if (state === State.Idle){
    if (facing === 'right') animateIdlePingPong('idleR', idleRightFrames, fps.idle);
    else animateIdlePingPong('idleL', idleLeftFrames, fps.idle);
  } else if (state === State.Run){
    animateLoop('runR', runRightFrames, fps.run);
  } else if (state === State.RunLeft){
    animateLoop('runL', runLeftFrames, fps.runLeft);
  } else {
    animateJumpFacing();
  }
}

// ====== Fungsi ======
function periodFromFps(f){ return int(max(1, 60 / f)); }
function drawSprite(img, x, y){
  push(); translate(x + centerOffset.x, y + centerOffset.y);
  scale(scaleSprite); image(img, 0, 0); pop();
}

// animasi idle
function animateIdlePingPong(key, frames, f){
  if (frameCount % periodFromFps(f) === 0){
    idx[key] += dir[key];
    const maxI = frames.length - 1, minI = 0;
    if (idx[key] >= maxI){ idx[key] = maxI; dir[key] = -1; }
    else if (idx[key] <= minI){ idx[key] = minI; dir[key] = 1; }
  }
  drawSprite(frames[idx[key]], cx, cy);
}

// animasi run ngulang
function animateLoop(key, frames, f){
  if (frameCount % periodFromFps(f) === 0){
    idx[key] = (idx[key] + 1) % frames.length;
  }
  drawSprite(frames[idx[key]], cx, cy);
}

// animasi lompat
function animateJumpFacing(){
  const dt = deltaTime * 0.001;
  jumpTimer += dt;

  const frames = (facing === 'right') ? jumpRightFrames : jumpLeftFrames;
  const key = (facing === 'right') ? 'jumpR' : 'jumpL';

  if (idx[key] === 0 && jumpTimer >= jumpDur[0]){ idx[key] = 1; jumpTimer = 0; }

  jumpMotionT += dt;
  const t = constrain(jumpMotionT / jumpMotionTotal, 0, 1);
  const yCurve = Math.sin(Math.PI * t);
  cy = baseCy - yCurve * jumpHeight;
  drawSprite(frames[idx[key]], cx, cy);

  if (t >= 1){
    cy = baseCy; idx[key] = 0; jumpTimer = 0; jumpMotionT = 0;
    if (keys.d && !keys.a){ state = State.Run; facing = 'right'; }
    else if (keys.a && !keys.d){ state = State.RunLeft; facing = 'left'; }
    else state = State.Idle;
  }
}

// ====== Input ======
function keyPressed(){
  // spasi artinya lompat
  if (keyCode === 32 && state !== State.Jump){
 
    startAudioIfNeeded(); 

    if (keys.d && !keys.a) facing = 'left';
    else if (keys.a && !keys.d) facing = 'right';
    state = State.Jump; jumpTimer = 0; jumpMotionT = 0;
    return false;
  }

  // gerak kanan
  if (key === 'd' || key === 'D'){
    keys.d = true;
    if (state !== State.Jump){
      facing = 'left'; state = State.Run; if (idx.runR < 0) idx.runR = 0;
    } else facing = 'left';
    return false;
  }

  // gerak kiri
  if (key === 'a' || key === 'A'){
    keys.a = true;
    if (state !== State.Jump){
      facing = 'right'; state = State.RunLeft; if (idx.runL < 0) idx.runL = 0;
    } else facing = 'right';
    return false;
  }

  // skala
  if (key === '-') scaleSprite = max(0.1, scaleSprite - 0.05);
  if (key === '=') scaleSprite = min(2.0, scaleSprite + 0.05);
}

function keyReleased(){
  if (key === 'd' || key === 'D') keys.d = false;
  if (key === 'a' || key === 'A') keys.a = false;
}
