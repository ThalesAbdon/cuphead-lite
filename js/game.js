import { Input, Entity } from "./engine.js";

// ---------- CANVAS ----------
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
let GROUND_Y = canvas.height - 120;
resize();
window.addEventListener("resize", resize);

// ---------- INPUT ----------
const input = new Input();

// ---------- GLOBAL STATE ----------
let gameStarted = false;
let fireButtonPressedAt = 0;
let isRapidFiring = false;
let lastShot = 0;
let shotsInARow = 0;
let shotTimer = null;
let gameOver = false;
let deathFrame = 0;
let deathNextAt = 0;
let showGameOver = false;
let victory = false;
let victoryFrame = 0;
let victoryNextAt = 0;
let victoryDone = false;

// ---------- LOAD ASSETS ----------
const sounds = {
  oneShoot: createAudio("assets/audio/one shoot.mp3"),
  twoBullets: createAudio("assets/audio/two bullets.mp3"),
  rapidFire: createAudio("assets/audio/rapid fire.mp3"),
  bgMusic: createAudio("assets/audio/music.mp3"),
};
sounds.bgMusic.volume = 0.1;

const hpSheet = await loadImage("assets/sprites/ui/hp.png");
const gameOverImg = await loadImage("assets/sprites/ui/gameover.png");
const victoryImg = await loadImage("assets/sprites/ui/victory.png");

const sprites = {
  playerIdle: await loadImages([
    "assets/sprites/player/idle/cuphead_idle_0001.png",
    "assets/sprites/player/idle/cuphead_idle_0002.png",
    "assets/sprites/player/idle/cuphead_idle_0003.png",
    "assets/sprites/player/idle/cuphead_idle_0004.png",
    "assets/sprites/player/idle/cuphead_idle_0005.png",
  ]),
  playerRun: await loadImages([
    "assets/sprites/player/run/cuphead_run_0001.png",
    "assets/sprites/player/run/cuphead_run_0002.png",
    "assets/sprites/player/run/cuphead_run_0003.png",
    "assets/sprites/player/run/cuphead_run_0004.png",
    "assets/sprites/player/run/cuphead_run_0005.png",
    "assets/sprites/player/run/cuphead_run_0006.png",
    "assets/sprites/player/run/cuphead_run_0007.png",
    "assets/sprites/player/run/cuphead_run_0008.png",
    "assets/sprites/player/run/cuphead_run_0009.png",
    "assets/sprites/player/run/cuphead_run_0010.png",
    "assets/sprites/player/run/cuphead_run_0011.png",
    "assets/sprites/player/run/cuphead_run_0012.png",
    "assets/sprites/player/run/cuphead_run_0013.png",
    "assets/sprites/player/run/cuphead_run_0014.png",
    "assets/sprites/player/run/cuphead_run_0015.png",
    "assets/sprites/player/run/cuphead_run_0016.png",
  ]),
  playerDashGround: await loadImages([
    "assets/sprites/player/dash/ground/cuphead_dash_0001.png",
    "assets/sprites/player/dash/ground/cuphead_dash_0002.png",
    "assets/sprites/player/dash/ground/cuphead_dash_0003.png",
    "assets/sprites/player/dash/ground/cuphead_dash_0004.png",
    "assets/sprites/player/dash/ground/cuphead_dash_0005.png",
    "assets/sprites/player/dash/ground/cuphead_dash_0006.png",
    "assets/sprites/player/dash/ground/cuphead_dash_0007.png",
    "assets/sprites/player/dash/ground/cuphead_dash_0008.png",
  ]),
  playerDashAir: await loadImages([
    "assets/sprites/player/dash/air/cuphead_dash_air_0001.png",
    "assets/sprites/player/dash/air/cuphead_dash_air_0002.png",
    "assets/sprites/player/dash/air/cuphead_dash_air_0003.png",
    "assets/sprites/player/dash/air/cuphead_dash_air_0004.png",
    "assets/sprites/player/dash/air/cuphead_dash_air_0005.png",
    "assets/sprites/player/dash/air/cuphead_dash_air_0006.png",
    "assets/sprites/player/dash/air/cuphead_dash_air_0007.png",
    "assets/sprites/player/dash/air/cuphead_dash_air_0008.png",
  ]),
  playerJump: await loadImages([
    "assets/sprites/player/jump/cuphead_jump_0001.png",
    "assets/sprites/player/jump/cuphead_jump_0002.png",
    "assets/sprites/player/jump/cuphead_jump_0003.png",
    "assets/sprites/player/jump/cuphead_jump_0004.png",
    "assets/sprites/player/jump/cuphead_jump_0005.png",
    "assets/sprites/player/jump/cuphead_jump_0006.png",
    "assets/sprites/player/jump/cuphead_jump_0007.png",
    "assets/sprites/player/jump/cuphead_jump_0008.png",
  ]),
  playerTurn: await loadImages([
    "assets/sprites/player/run/cuphead_run_turnaround_0001.png",
    "assets/sprites/player/run/cuphead_run_turnaround_0002.png",
  ]),
  playerShoot: await loadImages([
    "assets/sprites/player/shoot/straight/cuphead_shoot_straight_0001.png",
    "assets/sprites/player/shoot/straight/cuphead_shoot_straight_0002.png",
    "assets/sprites/player/shoot/straight/cuphead_shoot_straight_0003.png",
  ]),
  playerUpShoot: await loadImages([
    "assets/sprites/player/shoot/up/cuphead_aim_up_0001.png",
    "assets/sprites/player/shoot/up/cuphead_aim_up_0002.png",
    "assets/sprites/player/shoot/up/cuphead_aim_up_0003.png",
    "assets/sprites/player/shoot/up/cuphead_aim_up_0004.png",
    "assets/sprites/player/shoot/up/cuphead_aim_up_0005.png",
  ]),
  playerRunShoot: await loadImages([
    "assets/sprites/player/shoot/run/cuphead_run_shoot_0001.png",
    "assets/sprites/player/shoot/run/cuphead_run_shoot_0002.png",
    "assets/sprites/player/shoot/run/cuphead_run_shoot_0003.png",
    "assets/sprites/player/shoot/run/cuphead_run_shoot_0004.png",
    "assets/sprites/player/shoot/run/cuphead_run_shoot_0005.png",
    "assets/sprites/player/shoot/run/cuphead_run_shoot_0006.png",
    "assets/sprites/player/shoot/run/cuphead_run_shoot_0007.png",
    "assets/sprites/player/shoot/run/cuphead_run_shoot_0008.png",
    "assets/sprites/player/shoot/run/cuphead_run_shoot_0009.png",
    "assets/sprites/player/shoot/run/cuphead_run_shoot_0010.png",
    "assets/sprites/player/shoot/run/cuphead_run_shoot_0011.png",
    "assets/sprites/player/shoot/run/cuphead_run_shoot_0012.png",
    "assets/sprites/player/shoot/run/cuphead_run_shoot_0013.png",
    "assets/sprites/player/shoot/run/cuphead_run_shoot_0014.png",
    "assets/sprites/player/shoot/run/cuphead_run_shoot_0015.png",
    "assets/sprites/player/shoot/run/cuphead_run_shoot_0016.png",
  ]),
  playerHit: await loadImages([
    "assets/sprites/player/hit/Ground/cuphead_hit_0001.png",
    "assets/sprites/player/hit/Ground/cuphead_hit_0002.png",
    "assets/sprites/player/hit/Ground/cuphead_hit_0003.png",
    "assets/sprites/player/hit/Ground/cuphead_hit_0004.png",
    "assets/sprites/player/hit/Ground/cuphead_hit_0005.png",
    "assets/sprites/player/hit/Ground/cuphead_hit_0006.png",
  ]),
  playerHitAir: await loadImages([
    "assets/sprites/player/hit/Air/cuphead_hit_air_0001.png",
    "assets/sprites/player/hit/Air/cuphead_hit_air_0002.png",
    "assets/sprites/player/hit/Air/cuphead_hit_air_0003.png",
    "assets/sprites/player/hit/Air/cuphead_hit_air_0004.png",
    "assets/sprites/player/hit/Air/cuphead_hit_air_0005.png",
    "assets/sprites/player/hit/Air/cuphead_hit_air_0006.png",
  ]),
  playerDeath: await loadImages([
    "assets/sprites/player/death/cuphead_death_body_0001.png",
    "assets/sprites/player/death/cuphead_death_body_0002.png",
    "assets/sprites/player/death/cuphead_death_body_0003.png",
    "assets/sprites/player/death/cuphead_death_body_0004.png",
    "assets/sprites/player/death/cuphead_death_body_0005.png",
    "assets/sprites/player/death/cuphead_death_body_0006.png",
    "assets/sprites/player/death/cuphead_death_body_0007.png",
    "assets/sprites/player/death/cuphead_death_body_0008.png",
    "assets/sprites/player/death/cuphead_death_body_0009.png",
    "assets/sprites/player/death/cuphead_death_body_0010.png",
    "assets/sprites/player/death/cuphead_death_body_0011.png",
    "assets/sprites/player/death/cuphead_death_body_0012.png",
    "assets/sprites/player/death/cuphead_death_body_0013.png",
    "assets/sprites/player/death/cuphead_death_body_0014.png",
    "assets/sprites/player/death/cuphead_death_body_0015.png",
    "assets/sprites/player/death/cuphead_death_body_0016.png",
  ]),
  bulletSpawn: [
    { x: 3, y: 3, w: 60, h: 69, offsetX: 20, offsetY: 28 },
    { x: 68, y: 3, w: 65, h: 78, offsetX: 30, offsetY: 34 },
    { x: 138, y: 3, w: 91, h: 87, offsetX: 36, offsetY: 34 },
    { x: 234, y: 3, w: 101, h: 97, offsetX: 37, offsetY: 37 },
  ],
  bulletLoop: [
    { x: 0, y: 105, w: 54, h: 37, offsetX: 8, offsetY: 0 },
    { x: 59, y: 105, w: 75, h: 40, offsetX: 34, offsetY: 3 },
    { x: 139, y: 105, w: 157, h: 41, offsetX: 110, offsetY: 3 },
    { x: 301, y: 105, w: 148, h: 44, offsetX: 103, offsetY: 6 },
    { x: 454, y: 105, w: 144, h: 41, offsetX: 98, offsetY: 3 },
    { x: 603, y: 105, w: 159, h: 48, offsetX: 115, offsetY: 5 },
    { x: 767, y: 105, w: 136, h: 45, offsetX: 88, offsetY: 2 },
    { x: 908, y: 105, w: 122, h: 37, offsetX: 78, offsetY: 0 },
  ],
  bulletDeath: [
    { x: 0, y: 34, w: 64, h: 64 },
    { x: 64, y: 34, w: 64, h: 64 },
    { x: 128, y: 34, w: 64, h: 64 },
    { x: 192, y: 34, w: 64, h: 64 },
  ],
  peashooterSheet: await loadImage("assets/sprites/peashooter.png"),
  enemyIdle: await loadImages([
    "assets/sprites/enemy/idle/lg_slime_idle_0001.png",
    "assets/sprites/enemy/idle/lg_slime_idle_0002.png",
    "assets/sprites/enemy/idle/lg_slime_idle_0003.png",
    "assets/sprites/enemy/idle/lg_slime_idle_0004.png",
    "assets/sprites/enemy/idle/lg_slime_idle_0005.png",
  ]),
  enemyAirUp: await loadImages([
    "assets/sprites/enemy/air Up/slime_air_up_0001.png",
    "assets/sprites/enemy/air Up/slime_air_up_0002.png",
    "assets/sprites/enemy/air Up/slime_air_up_0003.png",
  ]),
  enemyAirDown: await loadImages([
    "assets/sprites/enemy/air Down/slime_air_down_0001.png",
    "assets/sprites/enemy/air Down/slime_air_down_0002.png",
    "assets/sprites/enemy/air Down/slime_air_down_0003.png",
  ]),
  enemyPunch: await loadImages([
    "assets/sprites/enemy/Punch/slime_punch_0001.png",
    "assets/sprites/enemy/Punch/slime_punch_0002.png",
    "assets/sprites/enemy/Punch/slime_punch_0003.png",
    "assets/sprites/enemy/Punch/slime_punch_0004.png",
    "assets/sprites/enemy/Punch/slime_punch_0005.png",
    "assets/sprites/enemy/Punch/slime_punch_0006.png",
    "assets/sprites/enemy/Punch/slime_punch_0007.png",
    "assets/sprites/enemy/Punch/slime_punch_0008.png",
    "assets/sprites/enemy/Punch/slime_punch_0009.png",
    "assets/sprites/enemy/Punch/slime_punch_0010.png",
    "assets/sprites/enemy/Punch/slime_punch_0011.png",
    "assets/sprites/enemy/Punch/slime_punch_0012.png",
    "assets/sprites/enemy/Punch/slime_punch_0013.png",
    "assets/sprites/enemy/Punch/slime_punch_0014.png",
    "assets/sprites/enemy/Punch/slime_punch_0015.png",
    "assets/sprites/enemy/Punch/slime_punch_0016.png",
  ]),
  enemyFalling: await loadImages([
    "assets/sprites/enemy/falling/lg_slime_falling_0001.png",
    "assets/sprites/enemy/falling/lg_slime_falling_0002.png",
    "assets/sprites/enemy/falling/lg_slime_falling_0003.png",
  ]),
  enemyDeath: await loadImages([
    "assets/sprites/enemy/death/lg_slime_death_0001.png",
    "assets/sprites/enemy/death/lg_slime_death_0002.png",
    "assets/sprites/enemy/death/lg_slime_death_0003.png",
    "assets/sprites/enemy/death/lg_slime_death_0004.png",
    "assets/sprites/enemy/death/lg_slime_death_0005.png",
    "assets/sprites/enemy/death/lg_slime_death_0006.png",
    "assets/sprites/enemy/death/lg_slime_death_0007.png",
    "assets/sprites/enemy/death/lg_slime_death_0008.png",
    "assets/sprites/enemy/death/lg_slime_death_0009.png",
    "assets/sprites/enemy/death/lg_slime_death_0010.png",
    "assets/sprites/enemy/death/lg_slime_death_0011.png",
    "assets/sprites/enemy/death/lg_slime_death_0012.png",
    "assets/sprites/enemy/death/lg_slime_death_0013.png",
    "assets/sprites/enemy/death/lg_slime_death_0014.png",
    "assets/sprites/enemy/death/lg_slime_death_0015.png",
    "assets/sprites/enemy/death/lg_slime_death_0016.png",
    "assets/sprites/enemy/death/lg_slime_death_0017.png",
    "assets/sprites/enemy/death/lg_slime_death_0018.png",
    "assets/sprites/enemy/death/lg_slime_death_0019.png",
    "assets/sprites/enemy/death/lg_slime_death_0020.png",
  ]),
};

const bgLayers = [
  { img: await loadImage("assets/bg/boss-background.png"), x: 0, speed: 0 },
];

function precropSprite({ x, y, w, h }) {
  const c = document.createElement("canvas");
  c.width = w; c.height = h;
  c.getContext("2d").drawImage(sprites.peashooterSheet, x, y, w, h, 0, 0, w, h);
  return c;
}

const bulletFrames = {
  spawn: sprites.bulletSpawn.map(precropSprite),
  loop:  sprites.bulletLoop.map(precropSprite),
};

// ---------- INTRO ----------
function drawIntro() {
  ctx.fillStyle = "rgba(0,0,0,0.75)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const cx = canvas.width / 2;
  const cy = canvas.height / 2;

  ctx.fillStyle = "#fff";
  ctx.font = "bold 48px serif";
  ctx.textAlign = "center";
  ctx.fillText("CUPHEAD", cx, cy - 180);

  ctx.strokeStyle = "#fff";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(cx - 220, cy - 155);
  ctx.lineTo(cx + 220, cy - 155);
  ctx.stroke();

  ctx.font = "24px serif";
  const controls = [
    "← →    Move",
    "SPACE   Jump",
    "Z       Shoot",
    "↑ + Z   Shoot Up",
    "X       Dash",
  ];
  controls.forEach((line, i) => {
    ctx.fillText(line, cx, cy - 100 + i * 48);
  });

  ctx.beginPath();
  ctx.moveTo(cx - 220, cy + 140);
  ctx.lineTo(cx + 220, cy + 140);
  ctx.stroke();

  const blink = Math.floor(performance.now() / 500) % 2 === 0;
  if (blink) {
    ctx.font = "bold 28px serif";
    ctx.fillStyle = "#FFD700";
    ctx.fillText("Pressione ENTER para começar", cx, cy + 185);
  }

  ctx.textAlign = "left";
}

window.addEventListener("keydown", (e) => {
  if (e.code === "Enter" && !gameStarted) {
    gameStarted = true;
    sounds.bgMusic.loop = true;
    sounds.bgMusic.play();
  }
  if (e.code === "Enter" && gameOver && showGameOver) {
    resetGame();
  }
});

// ---------- HUD ----------
const CARD_W = Math.round(478 / 6);
const CARD_H = 34;

function getHpCardIndex(hp) {
  if (hp <= 0) return 0;
  if (hp === 1) return 3;
  if (hp === 2) return 4;
  return 5;
}

function drawHUD() {
  const idx = getHpCardIndex(player.hp);
  const scale = 1.5;
  const dw = Math.round(CARD_W * scale);
  const dh = Math.round(CARD_H * scale);
  const margin = 16;
  ctx.drawImage(hpSheet, idx * CARD_W, 0, CARD_W, CARD_H, margin, canvas.height - dh - margin, dw, dh);
}

// ---------- GAME OVER ----------
function triggerGameOver() {
  sounds.bgMusic.pause();
  sounds.bgMusic.currentTime = 0;
  gameOver = true;
  deathFrame = 0;
  deathNextAt = performance.now();
  showGameOver = false;
  if (isRapidFiring) { sounds.rapidFire.pause(); sounds.rapidFire.currentTime = 0; isRapidFiring = false; }
}

function updateGameOver() {
  const now = performance.now();
  if (!showGameOver && now >= deathNextAt) {
    if (deathFrame < sprites.playerDeath.length) {
      player.image = sprites.playerDeath[deathFrame++];
      deathNextAt = now + 70;
    } else { showGameOver = true; }
  }
}

function drawGameOver() {
  ctx.save();
  if (player.facing === -1) {
    ctx.translate(player.x + player.w, player.y); ctx.scale(-1, 1);
    ctx.drawImage(player.image, 0, 0, player.w, player.h);
  } else { ctx.drawImage(player.image, player.x, player.y, player.w, player.h); }
  ctx.restore();

  if (showGameOver) {
    ctx.fillStyle = "rgba(0,0,0,0.5)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    const frameW = Math.round(3238 / 3), frameH = Math.round(1646 / 7), inset = 6;
    const gw = Math.min(canvas.width * 0.5, 540);
    const gh = gw * ((frameH - inset * 2) / (frameW - inset * 2));
    ctx.drawImage(gameOverImg, inset, inset, frameW - inset * 2, frameH - inset * 2,
    canvas.width / 2 - gw / 2, canvas.height / 2 - gh / 2, gw, gh);
    const blink = Math.floor(performance.now() / 500) % 2 === 0;
    if (blink) {
      ctx.font = "bold 28px serif";
      ctx.fillStyle = "#FFD700";
      ctx.textAlign = "center";
      ctx.fillText("Press ENTER to Continue", canvas.width / 2, canvas.height / 2 + 160);
      ctx.textAlign = "left";
    }  
  }
}

// ---------- PLAYER ----------
class Player extends Entity {
  constructor() {
    super(100, GROUND_Y - 128, 96, 128, sprites.playerIdle[0]);
    this.init();
  }

  init() {
    this.delayIdle = 90; this.delayRun = 30; this.delayTurn = 80;
    this.delayShoot = 40; this.delayJump = 75; this.delayHit = 60;
    this.frame = 0; this.nextFrameAt = 0; this.state = "idle";
    this.facing = 1; this.turnFrom = 0; this.shootUntil = 0;
    this.hp = 3; this.invincibleUntil = 0; this.grounded = true;
    this.dashCooldown = 0; this.dashUntil = 0;
    this.dashSpeed = 900; this.dashDuration = 300; this.dashCooldownTime = 1000;
  }

  isInvincible() { return performance.now() < this.invincibleUntil; }

  takeHit(fromX) {
    if (this.isInvincible()) return;
    this.hp--;
    if (this.hp <= 0) { triggerGameOver(); return; }
    this.invincibleUntil = performance.now() + 2000;
    const dir = this.x + this.w / 2 < fromX ? -1 : 1;
    this.sx = dir * 400; this.sy = -500; this.grounded = false;
    this.state = "hit"; this.frame = 0; this.nextFrameAt = 0;
  }

  animate(seq, delay, stayLast = false) {
    const now = performance.now();
    if (now >= this.nextFrameAt) {
      if (!stayLast || this.frame < seq.length - 1) this.frame = (this.frame + 1) % seq.length;
      this.image = seq[this.frame];
      this.nextFrameAt = now + delay;
    }
  }

  update(dt) {
    const speed = 300, jump = -750, gravity = 1500;
    const left = input.pressed("ArrowLeft");
    const right = input.pressed("ArrowRight");
    const both = left && right;

    if (victory) {
      this.sx = 0; this.state = "idle";
      this.animate(sprites.playerIdle, this.delayIdle);
      this.sy += gravity * dt; this.y += this.sy * dt;
      if (this.y >= GROUND_Y - this.h) { this.y = GROUND_Y - this.h; this.sy = 0; }
      return;
    }

    if (this.state !== "hit") {
      if ((this.state === "run" || this.state === "runAndShoot") && this.turnFrom === 0 && !both) {
        if (left && this.facing === 1) this.startTurn(1);
        if (right && this.facing === -1) this.startTurn(-1);
      }

      switch (this.state) {
        case "idle":
          if (left ^ right) { this.state = "run"; this.frame = 0; }
          else { this.sx = 0; this.animate(sprites.playerIdle, this.delayIdle); }
          break;
        case "jump":
          this.sx = (left ? -1 : right ? 1 : 0) * speed;
          if (this.sy < 0) this.animate(sprites.playerJump.slice(0, 4), this.delayJump);
          else this.animate(sprites.playerJump.slice(4, 8), this.delayJump);
          if (this.grounded) { this.state = "idle"; this.frame = 0; }
          break;
        case "dash":
          this.animate(sprites.playerDashGround, 40);
          this.sx = this.facing === 1 ? this.dashSpeed : -this.dashSpeed;
          if (performance.now() > this.dashUntil) { this.state = "idle"; this.frame = 0; this.sx = 0; }
          break;
        case "dashAir":
          this.animate(sprites.playerDashAir, 40);
          this.sx = this.facing === 1 ? this.dashSpeed : -this.dashSpeed;
          this.sy = 0;
          if (performance.now() > this.dashUntil) { this.state = "jump"; this.frame = 0; this.sx = 0; }
          break;
        case "run":
          if (!(left ^ right) || both) { this.state = "idle"; this.frame = 0; break; }
          if (input.pressed("KeyZ")) { this.state = "runAndShoot"; this.frame = 0; break; }
          this.sx = (left ? -1 : 1) * speed; this.facing = left ? -1 : 1;
          this.animate(sprites.playerRun, this.delayRun); break;
        case "runAndShoot":
          if (!(left ^ right) || both || !input.pressed("KeyZ")) { this.state = "run"; this.frame = 0; break; }
          this.sx = (left ? -1 : 1) * speed; this.facing = left ? -1 : 1;
          this.animate(sprites.playerRunShoot, this.delayShoot); break;
        case "shootUp":
          this.sx = 0;
          this.animate(sprites.playerUpShoot, this.delayShoot);
          if (performance.now() > this.shootUntil) { this.state = "idle"; this.frame = 0; }
          break;
        case "turn":
          this.sx = 0;
          this.animate(sprites.playerTurn, this.delayTurn, true);
          const oppositeHeld = (this.turnFrom === 1 && left) || (this.turnFrom === -1 && right);
          if (this.frame === sprites.playerTurn.length - 1) {
            if (oppositeHeld) {
              this.facing *= -1; this.state = "run"; this.frame = 0; this.turnFrom = 0;
            } else {
              this.state = "idle"; this.frame = 0; this.turnFrom = 0;
            }
          }
          break;
        case "shoot":
          this.sx = 0;
          if ((left ^ right) && input.pressed("KeyZ")) { this.state = "runAndShoot"; break; }
          if ((left ^ right) && !input.pressed("KeyZ")) { this.state = "run"; this.frame = 0; break; }
          this.animate(sprites.playerShoot, this.delayShoot);
          if (performance.now() > this.shootUntil) { this.state = "idle"; this.frame = 0; }
          break;
      }

      if (this.grounded && input.pressed("KeyX") && performance.now() > this.dashCooldown) {
        this.state = "dash"; this.frame = 0;
        this.dashUntil = performance.now() + this.dashDuration;
        this.dashCooldown = performance.now() + this.dashCooldownTime;
      }

      if (!this.grounded && this.state === "jump" && input.pressed("KeyX") && performance.now() > this.dashCooldown) {
        this.state = "dashAir"; this.frame = 0;
        this.dashUntil = performance.now() + this.dashDuration;
        this.dashCooldown = performance.now() + this.dashCooldownTime;
      }

      if (this.grounded && input.pressed("Space")) {
        this.sy = jump; this.grounded = false; this.state = "jump"; this.frame = 0;
      }
    } else {
      const seq = this.grounded ? sprites.playerHit : sprites.playerHitAir;
      this.animate(seq, this.delayHit, true);
      this.sx *= 0.85;
      if (this.frame === seq.length - 1) { this.state = "idle"; this.frame = 0; this.sx = 0; }
    }

    this.sy += gravity * dt;
    this.x += this.sx * dt;
    this.y += this.sy * dt;
    if (this.x < 0) this.x = 0;
    if (this.x + this.w > canvas.width) this.x = canvas.width - this.w;
    if (this.y >= GROUND_Y - this.h) { this.y = GROUND_Y - this.h; this.sy = 0; this.grounded = true; }

    this.handleShooting();
  }

  handleShooting() {
    if (this.state === "hit" || this.state === "dash" || this.state === "dashAir") {
      fireButtonPressedAt = 0;
      if (isRapidFiring) { sounds.rapidFire.pause(); sounds.rapidFire.currentTime = 0; isRapidFiring = false; }
      return;
    }

    const aimingUp = input.pressed("ArrowUp") && !input.pressed("ArrowLeft") && !input.pressed("ArrowRight");
    const isShooting = input.pressed("KeyZ");
    const now = performance.now();
    const canRunAndShoot = this.state === "run" || this.state === "runAndShoot";
    const canIdleShoot = this.state === "idle" || this.state === "shoot" || this.state === "shootUp";

    if (aimingUp && isShooting && this.grounded) {
      if (canShoot()) {
        const bulletX = this.facing === 1 ? this.x + this.w * 0.48 : this.x + this.w * -0.28;
        bullets.push(new Bullet(bulletX, this.y - 20, 0, true));
        this.state = "shootUp"; this.frame = 0;
        this.shootUntil = performance.now() + 300;
        lastShot = performance.now() + 150;
      }
      return;
    }

    if (isShooting && (canRunAndShoot || canIdleShoot)) {
      if (!fireButtonPressedAt) fireButtonPressedAt = now;
      if (now - fireButtonPressedAt > 50 && !isRapidFiring) {
        sounds.rapidFire.currentTime = 0; sounds.rapidFire.loop = true; sounds.rapidFire.play();
        isRapidFiring = true;
      }
      if (canShoot()) {
        const bulletX = this.facing === 1 ? this.x + this.w : this.x;
        bullets.push(new Bullet(bulletX, this.y + this.h / 2 - 8, this.facing));
        if (canIdleShoot) { this.state = "shoot"; this.frame = 0; }
        else if (canRunAndShoot) { this.state = "runAndShoot"; }
        this.shootUntil = now + 300;
        if (!isRapidFiring) {
          shotsInARow++;
          clearTimeout(shotTimer);
          shotTimer = setTimeout(() => { playShotSound(); shotsInARow = 0; }, 100);
        }
      }
    } else {
      fireButtonPressedAt = 0;
      if (isRapidFiring) { sounds.rapidFire.pause(); sounds.rapidFire.currentTime = 0; isRapidFiring = false; }
    }
  }

  startTurn(dir) { this.state = "turn"; this.frame = 0; this.turnFrom = dir; }

  draw(ctx) {
    if (this.isInvincible() && Math.floor(performance.now() / 100) % 2 === 0) return;
    ctx.save();
    if (this.facing === -1) {
      ctx.translate(this.x + this.w, this.y); ctx.scale(-1, 1);
      ctx.drawImage(this.image, 0, 0, this.w, this.h);
    } else { ctx.drawImage(this.image, this.x, this.y, this.w, this.h); }
    ctx.restore();
  }
}

// ---------- ENEMY ----------
class Enemy extends Entity {
  constructor(x) {
    const base = sprites.enemyIdle[0];
    const desiredH = 256;
    const scale = desiredH / base.height;
    const w = Math.round(base.width * scale);
    const h = Math.round(base.height * scale);
    super(x, GROUND_Y - h, w, h, base);

    this.scale = scale; this.baseW = w; this.baseH = h;
    this.delayIdle = 80; this.frame = 0; this.nextFrameAt = 0;
    this.hp = 200; this.alive = true; this.facing = -1; this.flashUntil = 0;
    this.sy = 0; this.sx = 0; this.grounded = true;
    this.jumpInterval = 1650; this.nextJumpAt = performance.now() + this.jumpInterval;
    this.jumpsLeft = 5; this.state = "jumping";
    this.punchFrame = 0; this.punchNextAt = 0; this.punchDone = false;
    this.falling = false; this.fallingTriggered = false;
    this.dying = false; this.deathFrame = 0; this.deathNextAt = 0;
    this.deathDone = false; this._flashImg = null;
  }

  getPhase() {
    if (this.hp > BOSS_MAX_HP * 0.66) return 1;
    if (this.hp > BOSS_MAX_HP * 0.33) return 2;
    return 3;
  }

  animate(seq, delay) {
    const now = performance.now();
    if (now >= this.nextFrameAt) {
      this.frame = (this.frame + 1) % seq.length;
      this.image = seq[this.frame];
      this.nextFrameAt = now + delay;
    }
  }

  hit(dmg = 1) {
    if (!this.alive || this.dying) return;
    this.hp -= dmg;
    this.flashUntil = performance.now() + 80;
    this._flashImg = null;
    if (this.hp <= 0) {
      this.dying = true; this.deathFrame = 0; this.deathNextAt = performance.now();
      if (enemies.every(e => e.dying || !e.alive)) triggerVictory();
    }
  }

  getPunchScale(f) {
    const maxW = 2.2, maxH = 1.4; let sw = 1, sh = 1;
    if (f >= 3 && f <= 7) { const t = (f-3)/4; sw = 1+t*(maxW-1); sh = 1+t*(maxH-1); }
    else if (f >= 8 && f <= 11) { sw = maxW; sh = maxH; }
    else if (f >= 12 && f <= 16) { const t = (f-12)/4; sw = maxW-t*(maxW-1); sh = maxH-t*(maxH-1); }
    return { sw, sh };
  }

  update(dt, player) {
    if (this.dying) {
      const now = performance.now();
      if (!this.deathDone) {
        if (now >= this.deathNextAt) {
          if (this.deathFrame < sprites.enemyDeath.length - 1) {
            this.image = sprites.enemyDeath[this.deathFrame++];
            this.deathNextAt = now + 75;
          } else { this.image = sprites.enemyDeath[sprites.enemyDeath.length - 1]; this.deathDone = true; }
        }
      } else { this.animate(sprites.enemyDeath, 75); }
      return;
    }
    if (!this.alive) return;

    const phase = this.getPhase();
    const gravity = 1800;
    const jumpForce    = phase === 1 ? -1300 : phase === 2 ? -1450 : -1600;
    const jumpSpeed    = phase === 1 ?   230 : phase === 2 ?   320 :   420;
    const punchDelay   = phase === 1 ?    55 : phase === 2 ?    40 :    25;
    this.jumpInterval  = phase === 1 ?  1650 : phase === 2 ?  1100 :   700;

    const now = performance.now();
    this.facing = player.x + player.w / 2 < this.x + this.w / 2 ? -1 : 1;

    if (this.falling) {
      this.sy += 4000 * dt; this.x += this.sx * dt; this.y += this.sy * dt;
      this.animate(sprites.enemyFalling, 80);
      if (this.y >= GROUND_Y - this.h) {
        this.y = GROUND_Y - this.h; this.sy = 0; this.sx = 0;
        this.grounded = true; this.fallingTriggered = false; this.falling = false;
      }
      return;
    }

    if (this.state === "jumping") {
      if (this.grounded && now >= this.nextJumpAt) {
        if (this.jumpsLeft > 0) {
          const toPlayer = player.x + player.w / 2 < this.x + this.w / 2 ? -1 : 1;
          this.sx = toPlayer * jumpSpeed; this.sy = jumpForce;
          this.grounded = false; this.nextJumpAt = now + this.jumpInterval; this.jumpsLeft--;
        } else {
          this.state = "punch"; this.punchFrame = 0; this.punchNextAt = now; this.punchDone = false;
        }
      }

      this.sy += gravity * dt; this.x += this.sx * dt; this.y += this.sy * dt;

      if (!this.grounded && !this.fallingTriggered && this.sy > 0 && this.sy < 50) {
        const distX = Math.abs((this.x + this.w/2) - (player.x + player.w/2));
        if (distX < 150 && Math.random() < 0.15) {
          this.falling = true; this.fallingTriggered = true;
          this.x = player.x + player.w/2 - this.w/2; this.sx = 0;
          triggerShake(25, 22);
        }
      }

      if (this.x < 0) { this.x = 0; this.sx = 0; }
      if (this.x + this.w > canvas.width) { this.x = canvas.width - this.w; this.sx = 0; }
      if (this.y >= GROUND_Y - this.h) {
        this.y = GROUND_Y - this.h; this.sy = 0; this.sx = 0;
        this.grounded = true; this.fallingTriggered = false;
      }

      if (this.grounded) this.animate(sprites.enemyIdle, this.delayIdle);
      else if (this.sy < 0) this.animate(sprites.enemyAirUp, 60);
      else this.animate(sprites.enemyAirDown, 60);

    } else if (this.state === "punch") {
      if (!this.punchDone && now >= this.punchNextAt) {
        this.image = sprites.enemyPunch[this.punchFrame];
        const { sw, sh } = this.getPunchScale(this.punchFrame);
        this.w = Math.round(this.baseW * sw); this.h = Math.round(this.baseH * sh);
        this.y = GROUND_Y - this.h; this.punchFrame++; this.punchNextAt = now + punchDelay;
        if (this.punchFrame >= sprites.enemyPunch.length) this.punchDone = true;
      }
      if (this.punchDone) {
        this.w = this.baseW; this.h = this.baseH; this.y = GROUND_Y - this.h;
        this.state = "jumping"; this.jumpsLeft = 5; this.nextJumpAt = now + this.jumpInterval; this.frame = 0;
      }
    }
  }

  draw(ctx) {
    if (!this.alive && !this.dying) return;
    const flashing = performance.now() < this.flashUntil;
    let img = this.image;
    if (flashing) {
      if (!this._flashImg || this._flashImg.width !== this.w || this._flashImg.height !== this.h) {
        const tmp = document.createElement("canvas");
        tmp.width = this.w; tmp.height = this.h;
        const t = tmp.getContext("2d");
        t.drawImage(this.image, 0, 0, this.w, this.h);
        t.globalCompositeOperation = "source-atop";
        t.fillStyle = "white"; t.fillRect(0, 0, this.w, this.h);
        this._flashImg = tmp;
      }
      img = this._flashImg;
    } else { this._flashImg = null; }

    ctx.save();
    if (this.facing === -1) { ctx.drawImage(img, this.x, this.y, this.w, this.h); }
    else { ctx.translate(this.x + this.w, this.y); ctx.scale(-1, 1); ctx.drawImage(img, 0, 0, this.w, this.h); }

    ctx.restore();
  }
}

// ---------- BULLET ----------
class Bullet extends Entity {
  constructor(x, y, direction = 1, vertical = false) {
    const frame = sprites.bulletSpawn[0];
    super(x, y, frame.w, frame.h, null);
    this.state = "spawn"; this.frame = 0; this.nextFrameAt = 0;
    this.vertical = vertical;
    this.speed = vertical ? 0 : 800 * direction;
    this.speedY = vertical ? -800 : 0;
    this.offsetX = frame.offsetX || 0; this.offsetY = frame.offsetY || 0;
    this.image = bulletFrames.spawn[0];
  }

  animate(seq, frameData, delay, loop = true) {
    const now = performance.now();
    if (now >= this.nextFrameAt) {
      this.frame = loop ? (this.frame + 1) % seq.length : Math.min(this.frame + 1, seq.length - 1);
      const fd = frameData[this.frame];
      this.image = seq[this.frame];
      this.w = fd.w; this.h = fd.h;
      this.offsetX = fd.offsetX || 0; this.offsetY = fd.offsetY || 0;
      this.nextFrameAt = now + delay;
      if (!loop && this.frame === seq.length - 1 && this.state === "spawn") { this.state = "loop"; this.frame = -1; }
    }
  }

  update(dt) {
    if (this.state === "spawn") this.animate(bulletFrames.spawn, sprites.bulletSpawn, 50, false);
    else if (this.state === "loop") {
      this.animate(bulletFrames.loop, sprites.bulletLoop, 60);
      this.x += this.speed * dt;
      this.y += this.speedY * dt;
    }
  }

  draw(ctx) {
    ctx.save();
    if (this.vertical) {
      ctx.translate(this.x + this.w / 2, this.y + this.h / 2);
      ctx.rotate(-Math.PI / 2);
      ctx.drawImage(this.image, -this.w / 2, -this.h / 2, this.w, this.h);
    } else if (this.speed < 0) {
      ctx.translate(this.x - this.offsetX + this.w, this.y - this.offsetY);
      ctx.scale(-1, 1); ctx.drawImage(this.image, 0, 0, this.w, this.h);
    } else { ctx.drawImage(this.image, this.x - this.offsetX, this.y - this.offsetY, this.w, this.h); }
    ctx.restore();
  }
}

// ---------- GAME LOOP ----------
const player = new Player();
const bullets = [];
const enemies = [new Enemy(1640)];
let last = 0;

function loop(t) {
  const dt = Math.min((t - last) / 1000, 0.05);
  last = t;

  if (!gameStarted) {
    render();
    drawIntro();
    requestAnimationFrame(loop);
    return;
  }

  if (!gameOver && !victory) {
    player.update(dt);
    enemies.forEach(e => e.update(dt, player));
    bullets.forEach(b => b.update(dt));
    updateParticles(dt);
    handleBulletEnemyCollisions();
    handlePlayerEnemyCollisions();
    for (let i = bullets.length - 1; i >= 0; i--) {
      if (bullets[i].x < -200 || bullets[i].x > canvas.width + 200) bullets.splice(i, 1);
    }
  } else if (gameOver && !victory) {
    updateGameOver();
  } else if (victory) {
    player.update(dt);
    enemies.forEach(e => e.update(dt, player));
  }

  if (victory) updateVictory();
  render();
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);

function render() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.save();
  applyShake();
  bgLayers.forEach(l => ctx.drawImage(l.img, 0, 0, canvas.width, canvas.height));

  if (!gameOver) {
    enemies.forEach(e => e.draw(ctx));
    player.draw(ctx);
    bullets.forEach(b => b.draw(ctx));
    drawParticles();
  } else {
    enemies.forEach(e => e.draw(ctx));
    drawGameOver();
  }
  ctx.restore();
  if (gameStarted) drawHUD();
  if (gameStarted && !gameOver) drawBossHUD();
  if (victory) drawVictory();
}

// ---------- BOSS HP BAR ----------
const BOSS_MAX_HP = 200;
const BOSS_NAME = "King Slime"; // troca pelo nome que quiser

function drawBossHUD() {
  const boss = enemies[0];
  if (!boss || boss.deathDone) return;

  const barW = Math.min(canvas.width * 0.55, 600);
  const barH = 18;
  const cx = canvas.width / 2;
  const barX = cx - barW / 2;
  const barY = 38;
  const hpRatio = Math.max(0, boss.hp / BOSS_MAX_HP);

  // ── Nome do boss ──────────────────────────────────────────────
  ctx.save();
  ctx.font = "bold 15px serif";
  ctx.letterSpacing = "3px";
  ctx.textAlign = "center";

  // sombra
  ctx.fillStyle = "rgba(0,0,0,0.8)";
  ctx.fillText(BOSS_NAME.toUpperCase(), cx + 2, barY - 10 + 2);

  // texto principal com contorno amarelo
  ctx.strokeStyle = "#b8860b";
  ctx.lineWidth = 3;
  ctx.strokeText(BOSS_NAME.toUpperCase(), cx + 2, barY - 10);
  ctx.fillStyle = "#fff8dc";
  ctx.fillText(BOSS_NAME.toUpperCase(), cx + 2, barY - 10);
  ctx.restore();

  // ── Fundo da barra (borda externa) ───────────────────────────
  ctx.save();
  ctx.fillStyle = "#1a0a00";
  roundRect(ctx, barX - 4, barY - 4, barW + 8, barH + 8, 5);
  ctx.fill();

  // borda dourada
  ctx.strokeStyle = "#b8860b";
  ctx.lineWidth = 2;
  roundRect(ctx, barX - 4, barY - 4, barW + 8, barH + 8, 5);
  ctx.stroke();

  // ── Fundo interno (trilho vazio) ──────────────────────────────
  ctx.fillStyle = "#2a0a00";
  roundRect(ctx, barX, barY, barW, barH, 3);
  ctx.fill();

  // ── Barra de HP com degradê ───────────────────────────────────
  if (hpRatio > 0) {
    const filledW = barW * hpRatio;

    // cor muda conforme HP: verde → amarelo → vermelho
    let color1, color2;
    if (hpRatio > 0.5) {
      color1 = "#e8f000"; color2 = "#a8b000"; // amarelo Cuphead
    } else if (hpRatio > 0.25) {
      color1 = "#ff8800"; color2 = "#cc5500"; // laranja
    } else {
      color1 = "#ff2200"; color2 = "#aa0000"; // vermelho crítico
    }

    const grad = ctx.createLinearGradient(barX, barY, barX, barY + barH);
    grad.addColorStop(0, color1);
    grad.addColorStop(0.5, color2);
    grad.addColorStop(1, color1);

    ctx.fillStyle = grad;
    roundRect(ctx, barX, barY, filledW, barH, 3);
    ctx.fill();

    // brilho no topo da barra
    const shine = ctx.createLinearGradient(barX, barY, barX, barY + barH * 0.45);
    shine.addColorStop(0, "rgba(255,255,255,0.35)");
    shine.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = shine;
    roundRect(ctx, barX, barY, filledW, barH * 0.45, 3);
    ctx.fill();
  }

  [0.33, 0.66].forEach(pct => {
    const divX = barX + barW * pct;
    ctx.strokeStyle = "rgba(0,0,0,0.6)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(divX, barY + 2);
    ctx.lineTo(divX, barY + barH - 2);
    ctx.stroke();
  });

  ctx.restore();
}

// ---------- CAMERA SHAKE ----------
let shakeDuration = 0;
let shakeMagnitude = 0;

function triggerShake(duration, magnitude) {
  shakeDuration = duration;
  shakeMagnitude = magnitude;
}

function applyShake() {
  if (shakeDuration <= 0) return;
  const dx = (Math.random() * 2 - 1) * shakeMagnitude;
  const dy = (Math.random() * 2 - 1) * shakeMagnitude;
  ctx.translate(dx, dy);
  shakeDuration--;
  shakeMagnitude *= 0.85;
}

// ---------- SLIME PARTICLES ----------
const particles = [];

const SLIME_COLORS = ["#3a9de0", "#1a6db8", "#70c8ff", "#0d4a8a", "#a0ddff"];

function spawnSlimeParticles(x, y) {
  const count = 6 + Math.floor(Math.random() * 6); // 6 a 11 partículas
  for (let i = 0; i < count; i++) {
    const big = Math.random() < 0.3; // 30% de chance de ser grande
    const angle = Math.random() * Math.PI * 2;
    const speed = big ? 80 + Math.random() * 120 : 180 + Math.random() * 260;
    particles.push({
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - (big ? 80 : 140), // leve arco pra cima
      r: big ? 7 + Math.random() * 6 : 2 + Math.random() * 4,
      color: SLIME_COLORS[Math.floor(Math.random() * SLIME_COLORS.length)],
      alpha: 1,
      life: big ? 0.45 + Math.random() * 0.2 : 0.25 + Math.random() * 0.2,
      maxLife: 0,
      gravity: 600,
      squash: 1, // estica na direção do movimento
    });
    particles[particles.length - 1].maxLife = particles[particles.length - 1].life;
  }
}

function updateParticles(dt) {
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.vy += p.gravity * dt;
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.life -= dt;
    p.alpha = Math.max(0, p.life / p.maxLife);

    const spd = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
    p.squash = 1 + spd / 800;

    if (p.life <= 0) particles.splice(i, 1);
  }
}

function drawParticles() {
  particles.forEach(p => {
    const angle = Math.atan2(p.vy, p.vx);
    ctx.save();
    ctx.globalAlpha = p.alpha;
    ctx.translate(p.x, p.y);
    ctx.rotate(angle);
    ctx.scale(p.squash, 1 / p.squash); // estica no eixo do movimento

    // gota de slime
    ctx.beginPath();
    ctx.ellipse(0, 0, p.r * p.squash, p.r, 0, 0, Math.PI * 2);
    ctx.fillStyle = p.color;
    ctx.fill();

    // brilhinho no topo da gota
    ctx.beginPath();
    ctx.ellipse(-p.r * 0.2, -p.r * 0.25, p.r * 0.3, p.r * 0.2, -0.5, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255,255,255,0.5)";
    ctx.fill();

    ctx.restore();
  });
  ctx.globalAlpha = 1;
}

// ---------- UTIL ----------
function resize() { canvas.width = innerWidth; canvas.height = innerHeight; GROUND_Y = canvas.height - 120; }

function createAudio(src) { const a = new Audio(src); a.preload = "auto"; a.load(); return a; }

function loadImage(src) {
  return new Promise(res => { const img = new Image(); img.src = src; img.onload = () => res(img); });
}

function loadImages(srcArray) { return Promise.all(srcArray.map(loadImage)); }

function canShoot() {
  const now = performance.now();
  if (now - lastShot > 150) { lastShot = now; return true; }
  return false;
}

function playShotSound() {
  if (shotsInARow === 1) { sounds.oneShoot.currentTime = 0; sounds.oneShoot.play(); }
  else if (shotsInARow > 1) { sounds.rapidFire.currentTime = 0; sounds.rapidFire.play(); }
}

function handleBulletEnemyCollisions() {
  for (let i = bullets.length - 1; i >= 0; i--) {
    if (i >= bullets.length) continue;
    const b = bullets[i]; if (!b) continue;
    const bx = b.x - b.offsetX, by = b.y - b.offsetY;
    if (b.y < -200 || b.x < -200 || b.x > canvas.width + 200) { bullets.splice(i, 1); continue; }
    for (let j = 0; j < enemies.length; j++) {
      const e = enemies[j];
      if (!e.alive || e.dying) continue;
      if (aabb(bx, by, b.w, b.h, e.x, e.y, e.w, e.h)) {
        e.hit(1);
        spawnSlimeParticles(bx + b.w / 2, by + b.h / 2); 
        bullets.splice(i, 1);
        break;
      }
    }
  }
}

function handlePlayerEnemyCollisions() {
  if (player.state === "dash" || player.state === "dashAir") return;

  enemies.forEach(e => {
    if (!e.alive || e.dying) return;
    if (aabb(player.x, player.y, player.w, player.h, e.x, e.y, e.w, e.h)) player.takeHit(e.x + e.w / 2);
  });
}

function aabb(x1, y1, w1, h1, x2, y2, w2, h2) {
  return x1 < x2 + w2 && x1 + w1 > x2 && y1 < y2 + h2 && y1 + h1 > y2;
}

function triggerVictory() {
  victory = true; victoryFrame = 0; victoryNextAt = performance.now(); victoryDone = false;
  sounds.bgMusic.pause();
  sounds.bgMusic.currentTime = 0;
  if (isRapidFiring) { sounds.rapidFire.pause(); sounds.rapidFire.currentTime = 0; isRapidFiring = false; }
  fireButtonPressedAt = 0; clearTimeout(shotTimer);
  player.state = "idle"; player.frame = 0; player.sx = 0; player.sy = 0;
  bullets.length = 0;
}

function updateVictory() {
  if (victoryDone) return;
  const now = performance.now();
  if (now >= victoryNextAt) { victoryFrame++; victoryNextAt = now + 60; if (victoryFrame >= 8) victoryDone = true; }
}

function drawVictory() {
  const cols = 4, rows = 7;
  const fw = Math.round(5130 / cols), fh = Math.round(5056 / rows);
  const col = victoryFrame % cols, row = Math.floor(victoryFrame / cols);
  const inset = 6;
  ctx.save();
  ctx.globalCompositeOperation = "screen";
  ctx.drawImage(victoryImg, col*fw+inset, row*fh+inset, fw-inset*2, fh-inset*2, 0, 0, canvas.width, canvas.height);
  ctx.restore();
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function resetGame() {
  gameOver = false; showGameOver = false;
  deathFrame = 0; deathNextAt = 0;
  bullets.length = 0; particles.length = 0;
  player.x = 100; player.y = GROUND_Y - 128;
  player.sx = 0; player.sy = 0;
  player.init();
  enemies[0] = new Enemy(1640);
  sounds.bgMusic.currentTime = 0;
  sounds.bgMusic.play();
}