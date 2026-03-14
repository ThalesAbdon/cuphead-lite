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
};

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
  ctx.drawImage(
    hpSheet,
    idx * CARD_W, 0, CARD_W, CARD_H,
    margin, canvas.height - dh - margin, dw, dh
  );
}

// ---------- GAME OVER ----------
function triggerGameOver() {
  gameOver = true;
  deathFrame = 0;
  deathNextAt = performance.now();
  showGameOver = false;
  if (isRapidFiring) {
    sounds.rapidFire.pause();
    sounds.rapidFire.currentTime = 0;
    isRapidFiring = false;
  }
}

function updateGameOver() {
  const now = performance.now();
  if (!showGameOver && now >= deathNextAt) {
    if (deathFrame < sprites.playerDeath.length) {
      player.image = sprites.playerDeath[deathFrame];
      deathFrame++;
      deathNextAt = now + 70;
    } else {
      showGameOver = true;
    }
  }
}

function drawGameOver() {
  ctx.save();
  if (player.facing === -1) {
    ctx.translate(player.x + player.w, player.y);
    ctx.scale(-1, 1);
    ctx.drawImage(player.image, 0, 0, player.w, player.h);
  } else {
    ctx.drawImage(player.image, player.x, player.y, player.w, player.h);
  }
  ctx.restore();

  if (showGameOver) {
    ctx.fillStyle = "rgba(0,0,0,0.5)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const frameW = Math.round(3238 / 3);
    const frameH = Math.round(1646 / 7);
    const inset = 6; 
    const gw = Math.min(canvas.width * 0.5, 540);
    const gh = gw * ((frameH - inset * 2) / (frameW - inset * 2));
    ctx.drawImage(
      gameOverImg,
      inset, inset, frameW - inset * 2, frameH - inset * 2,
      canvas.width / 2 - gw / 2,
      canvas.height / 2 - gh / 2,
      gw, gh
    );
  }
}

// ---------- PLAYER ----------
class Player extends Entity {
  constructor() {
    super(100, 0, 96, 128, sprites.playerIdle[0]);
    this.init();
  }

  init() {
    this.delayIdle = 90;
    this.delayRun = 30;
    this.delayTurn = 80;
    this.delayShoot = 40;
    this.delayJump = 75;
    this.delayHit = 60;
    this.frame = 0;
    this.nextFrameAt = 0;
    this.state = "idle";
    this.facing = 1;
    this.turnFrom = 0;
    this.shootUntil = 0;
    this.hp = 3;
    this.invincibleUntil = 0;
    this.grounded = true;
  }

  isInvincible() {
    return performance.now() < this.invincibleUntil;
  }

  takeHit(fromX) {
    if (this.isInvincible()) return;
    this.hp--;

    if (this.hp <= 0) {
      triggerGameOver();
      return;
    }

    this.invincibleUntil = performance.now() + 2000;
    const dir = this.x + this.w / 2 < fromX ? -1 : 1;
    this.sx = dir * 400;
    this.sy = -500;
    this.grounded = false;
    this.state = "hit";
    this.frame = 0;
    this.nextFrameAt = 0;
  }

  animate(seq, delay, stayLast = false) {
    const now = performance.now();
    if (now >= this.nextFrameAt) {
      if (!stayLast || this.frame < seq.length - 1) {
        this.frame = (this.frame + 1) % seq.length;
      }
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
      this.sx = 0;
      this.state = "idle";
      this.animate(sprites.playerIdle, this.delayIdle);
      this.sy += gravity * dt;
      this.y += this.sy * dt;
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

        case "run":
          if (!(left ^ right) || both) { this.state = "idle"; this.frame = 0; break; }
          if (input.pressed("KeyZ")) { this.state = "runAndShoot"; this.frame = 0; break; }
          this.sx = (left ? -1 : 1) * speed;
          this.facing = left ? -1 : 1;
          this.animate(sprites.playerRun, this.delayRun);
          break;

        case "runAndShoot":
          if (!(left ^ right) || both || !input.pressed("KeyZ")) { this.state = "run"; this.frame = 0; break; }
          this.sx = (left ? -1 : 1) * speed;
          this.facing = left ? -1 : 1;
          this.animate(sprites.playerRunShoot, this.delayShoot);
          break;

        case "turn":
          this.sx = 0;
          this.animate(sprites.playerTurn, this.delayTurn, true);
          const oppositeHeld = (this.turnFrom === 1 && left) || (this.turnFrom === -1 && right);
          if (this.frame === sprites.playerTurn.length - 1 && oppositeHeld) {
            this.facing *= -1;
            this.state = "run";
            this.frame = 0;
            this.turnFrom = 0;
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

      if (this.grounded && input.pressed("Space")) {
        this.sy = jump;
        this.grounded = false;
        this.state = "jump";
        this.frame = 0;
      }

    } else {
      const seq = this.grounded ? sprites.playerHit : sprites.playerHitAir;
      this.animate(seq, this.delayHit, true);
      this.sx *= 0.85;
      if (this.frame === seq.length - 1) {
        this.state = "idle";
        this.frame = 0;
        this.sx = 0;
      }
    }

    this.sy += gravity * dt;
    this.x += this.sx * dt;
    this.y += this.sy * dt;

    if (this.x < 0) this.x = 0;
    if (this.x + this.w > canvas.width) this.x = canvas.width - this.w;

    if (this.y >= GROUND_Y - this.h) {
      this.y = GROUND_Y - this.h;
      this.sy = 0;
      this.grounded = true;
    }

    this.handleShooting();
  }

  handleShooting() {
    if (this.state === "hit") {
      fireButtonPressedAt = 0;
      if (isRapidFiring) {
        sounds.rapidFire.pause();
        sounds.rapidFire.currentTime = 0;
        isRapidFiring = false;
      }
      return;
    }

    const isShooting = input.pressed("KeyZ");
    const now = performance.now();
    const canRunAndShoot = this.state === "run" || this.state === "runAndShoot";
    const canIdleShoot = this.state === "idle" || this.state === "shoot";

    if (isShooting && (canRunAndShoot || canIdleShoot)) {
      if (!fireButtonPressedAt) fireButtonPressedAt = now;
      const holdTime = now - fireButtonPressedAt;
      if (holdTime > 50 && !isRapidFiring) {
        sounds.rapidFire.currentTime = 0;
        sounds.rapidFire.loop = true;
        sounds.rapidFire.play();
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
      if (isRapidFiring) {
        sounds.rapidFire.pause();
        sounds.rapidFire.currentTime = 0;
        isRapidFiring = false;
      }
    }
  }

  startTurn(dir) {
    this.state = "turn";
    this.frame = 0;
    this.turnFrom = dir;
  }

  draw(ctx) {
    if (this.isInvincible()) {
      const blink = Math.floor(performance.now() / 100) % 2 === 0;
      if (!blink) return;
    }
    ctx.save();
    if (this.facing === -1) {
      ctx.translate(this.x + this.w, this.y);
      ctx.scale(-1, 1);
      ctx.drawImage(this.image, 0, 0, this.w, this.h);
    } else {
      ctx.drawImage(this.image, this.x, this.y, this.w, this.h);
    }
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

    this.scale = scale;
    this.baseW = w;
    this.baseH = h;
    this.delayIdle = 80;
    this.frame = 0;
    this.nextFrameAt = 0;
    this.hp = 200;
    this.alive = true;
    this.facing = -1;
    this.flashUntil = 0;

    this.sy = 0;
    this.sx = 0;
    this.grounded = true;
    this.jumpInterval = 1650;
    this.nextJumpAt = performance.now() + this.jumpInterval;

    this.jumpsLeft = 5;
    this.state = "jumping";
    this.punchFrame = 0;
    this.punchNextAt = 0;
    this.punchDone = false;

    this.dying = false;
    this.deathFrame = 0;
    this.deathNextAt = 0;
    this.deathDone = false; 
    this._flashImg = null;  
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
      this.dying = true;
      this.deathFrame = 0;
      this.deathNextAt = performance.now();
      console.log("enemy dying, every check:", enemies.every(e => e.dying || !e.alive));
      if (enemies.every(e => e.dying || !e.alive)) triggerVictory();
    }
  }

  getPunchScale(f) {
    const maxW = 2.2, maxH = 1.4;
    let sw = 1, sh = 1;
    if (f >= 3 && f <= 7) {
      const t = (f - 3) / 4;
      sw = 1 + t * (maxW - 1); sh = 1 + t * (maxH - 1);
    } else if (f >= 8 && f <= 11) {
      sw = maxW; sh = maxH;
    } else if (f >= 12 && f <= 16) {
      const t = (f - 12) / 4;
      sw = maxW - t * (maxW - 1); sh = maxH - t * (maxH - 1);
    }
    return { sw, sh };
  }

  update(dt, player) {

   if (this.dying) {
    const now = performance.now();
    if (!this.deathDone) {
      if (now >= this.deathNextAt) {
        if (this.deathFrame < sprites.enemyDeath.length - 1) {
          this.image = sprites.enemyDeath[this.deathFrame];
          this.deathFrame++;
          this.deathNextAt = now + 75;
        } else {
          this.image = sprites.enemyDeath[sprites.enemyDeath.length - 1];
          this.deathDone = true;
        }
      }
    } else {
      this.animate(sprites.enemyDeath, 75);
    }
    return; // 👈 esse return garante que sai do update sempre que dying=true
  }
  if (!this.alive) return; // 👈 volta pra só !this.alive aqui

    const gravity = 1800, jumpForce = -1300, jumpSpeed = 230;
    const now = performance.now();

    this.facing = player.x + player.w / 2 < this.x + this.w / 2 ? -1 : 1;

    if (this.state === "jumping") {
      if (this.grounded && now >= this.nextJumpAt) {
        if (this.jumpsLeft > 0) {
          const toPlayer = player.x + player.w / 2 < this.x + this.w / 2 ? -1 : 1;
          this.sx = toPlayer * jumpSpeed;
          this.sy = jumpForce;
          this.grounded = false;
          this.nextJumpAt = now + this.jumpInterval;
          this.jumpsLeft--;
        } else {
          this.state = "punch";
          this.punchFrame = 0;
          this.punchNextAt = now;
          this.punchDone = false;
        }
      }

      this.sy += gravity * dt;
      this.x += this.sx * dt;
      this.y += this.sy * dt;

      if (this.x < 0) { this.x = 0; this.sx = 0; }
      if (this.x + this.w > canvas.width) { this.x = canvas.width - this.w; this.sx = 0; }

      if (this.y >= GROUND_Y - this.h) {
        this.y = GROUND_Y - this.h;
        this.sy = 0; this.sx = 0;
        this.grounded = true;
      }

      if (this.grounded) this.animate(sprites.enemyIdle, this.delayIdle);
      else if (this.sy < 0) this.animate(sprites.enemyAirUp, 60);
      else this.animate(sprites.enemyAirDown, 60);

    } else if (this.state === "punch") {
      if (!this.punchDone && now >= this.punchNextAt) {
        this.image = sprites.enemyPunch[this.punchFrame];
        const { sw, sh } = this.getPunchScale(this.punchFrame);
        this.w = Math.round(this.baseW * sw);
        this.h = Math.round(this.baseH * sh);
        this.y = GROUND_Y - this.h;
        this.punchFrame++;
        this.punchNextAt = now + 55;
        if (this.punchFrame >= sprites.enemyPunch.length) this.punchDone = true;
      }

      if (this.punchDone) {
        this.w = this.baseW; this.h = this.baseH;
        this.y = GROUND_Y - this.h;
        this.state = "jumping";
        this.jumpsLeft = 5;
        this.nextJumpAt = now + this.jumpInterval;
        this.frame = 0;
      }
    }
  }

   draw(ctx) {
    if (!this.alive && !this.dying) return;

    const flashing = performance.now() < this.flashUntil;
    let img = this.image;

    if (flashing) {
      // cria o canvas branco só uma vez por hit
      if (!this._flashImg || this._flashImg.width !== this.w || this._flashImg.height !== this.h) {
        const tmp = document.createElement("canvas");
        tmp.width = this.w; tmp.height = this.h;
        const t = tmp.getContext("2d");
        t.drawImage(this.image, 0, 0, this.w, this.h);
        t.globalCompositeOperation = "source-atop";
        t.fillStyle = "white";
        t.fillRect(0, 0, this.w, this.h);
        this._flashImg = tmp;
      }
      img = this._flashImg;
    } else {
      this._flashImg = null; // limpa quando não está flashando
    }

    ctx.save();
    if (this.facing === -1) {
      ctx.drawImage(img, this.x, this.y, this.w, this.h);
    } else {
      ctx.translate(this.x + this.w, this.y);
      ctx.scale(-1, 1);
      ctx.drawImage(img, 0, 0, this.w, this.h);
    }
    ctx.restore();
  }
}

// ---------- BULLET -----------
class Bullet extends Entity {
  constructor(x, y, direction = 1) {
    const frame = sprites.bulletSpawn[0];
    super(x, y, frame.w, frame.h, null);
    this.state = "spawn";
    this.frame = 0;
    this.nextFrameAt = 0;
    this.speed = 800 * direction;
    this.offsetX = frame.offsetX || 0;
    this.offsetY = frame.offsetY || 0;
    this.image = bulletFrames.spawn[0];
  }

  animate(seq, frameData, delay, loop = true) {
    const now = performance.now();
    if (now >= this.nextFrameAt) {
      this.frame = loop
        ? (this.frame + 1) % seq.length
        : Math.min(this.frame + 1, seq.length - 1);
      const fd = frameData[this.frame];
      this.image = seq[this.frame];
      this.w = fd.w; this.h = fd.h;
      this.offsetX = fd.offsetX || 0;
      this.offsetY = fd.offsetY || 0;
      this.nextFrameAt = now + delay;

      if (!loop && this.frame === seq.length - 1 && this.state === "spawn") {
        this.state = "loop"; this.frame = -1;
      }
    }
  }

  update(dt) {
    if (this.state === "spawn") {
      this.animate(bulletFrames.spawn, sprites.bulletSpawn, 50, false);
    } else if (this.state === "loop") {
      this.animate(bulletFrames.loop, sprites.bulletLoop, 60);
      this.x += this.speed * dt;
    }
  }

  draw(ctx) {
    ctx.save();
    if (this.speed < 0) {
      ctx.translate(this.x - this.offsetX + this.w, this.y - this.offsetY);
      ctx.scale(-1, 1);
      ctx.drawImage(this.image, 0, 0, this.w, this.h);
    } else {
      ctx.drawImage(this.image, this.x - this.offsetX, this.y - this.offsetY, this.w, this.h);
    }
    ctx.restore();
  }
}

// ---------- GAME LOOP ----------
const player = new Player();
const bullets = [];
const enemies = [new Enemy(720)];
let last = 0;

function loop(t) {
  const dt = Math.min((t - last) / 1000, 0.05);
  last = t;

  if (!gameOver && !victory) {
    player.update(dt);
    enemies.forEach(e => e.update(dt, player));
    bullets.forEach(b => b.update(dt));
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
  bgLayers.forEach(l => ctx.drawImage(l.img, 0, 0, canvas.width, canvas.height));

  if (!gameOver) {
    enemies.forEach(e => e.draw(ctx));
    player.draw(ctx);
    bullets.forEach(b => b.draw(ctx));
  } else {
    enemies.forEach(e => e.draw(ctx));
    drawGameOver();
  }

  drawHUD();
  if (victory) drawVictory();
}

// ---------- UTIL ----------
function resize() {
  canvas.width = innerWidth;
  canvas.height = innerHeight;
  GROUND_Y = canvas.height - 120;
}

function createAudio(src) {
  const a = new Audio(src);
  a.preload = "auto";
  a.load();
  return a;
}

function loadImage(src) {
  return new Promise(res => {
    const img = new Image();
    img.src = src;
    img.onload = () => res(img);
  });
}

function loadImages(srcArray) {
  return Promise.all(srcArray.map(loadImage));
}

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
    const b = bullets[i];
    if (!b) continue; 
    const bx = b.x - b.offsetX, by = b.y - b.offsetY;
    for (let j = 0; j < enemies.length; j++) {
      const e = enemies[j];
      if (!e.alive || e.dying) continue;
      if (aabb(bx, by, b.w, b.h, e.x, e.y, e.w, e.h)) {
        e.hit(1);
        bullets.splice(i, 1);
        break;
      }
    }
  }
}

function handlePlayerEnemyCollisions() {
  enemies.forEach(e => {
    if (!e.alive || e.dying) return;
    if (aabb(player.x, player.y, player.w, player.h, e.x, e.y, e.w, e.h)) {
      player.takeHit(e.x + e.w / 2);
    }
  });
}

function aabb(x1, y1, w1, h1, x2, y2, w2, h2) {
  return x1 < x2 + w2 && x1 + w1 > x2 && y1 < y2 + h2 && y1 + h1 > y2;
}

function triggerVictory() {
  victory = true;
  victoryFrame = 0;
  victoryNextAt = performance.now();
  victoryDone = false;

  // para todos os sons
  if (isRapidFiring) {
    sounds.rapidFire.pause();
    sounds.rapidFire.currentTime = 0;
    isRapidFiring = false;
  }
  fireButtonPressedAt = 0;
  clearTimeout(shotTimer);

  // força player pro idle
  player.state = "idle";
  player.frame = 0;
  player.sx = 0;
  player.sy = 0;

  // limpa todas as balas
  bullets.length = 0;
}

function updateVictory() {
  if (victoryDone) return;
  const now = performance.now();
  if (now >= victoryNextAt) {
    victoryFrame++;
    victoryNextAt = now + 60;
    if (victoryFrame >= 8) victoryDone = true; // para no último frame
  }
}

function drawVictory() {
  const cols = 4, rows = 7;
  const fw = Math.round(5130 / cols);
  const fh = Math.round(5056 / rows);
  const col = victoryFrame % cols;
  const row = Math.floor(victoryFrame / cols);
  const inset = 6;
  const gw = canvas.width;  
  const gh = canvas.height;

  ctx.save();
  ctx.globalCompositeOperation = "screen"; 
  ctx.drawImage(
    victoryImg,
    col * fw + inset, row * fh + inset, fw - inset * 2, fh - inset * 2,
    0, 0, gw, gh
  );
  ctx.restore();
}