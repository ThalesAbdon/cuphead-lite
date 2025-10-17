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

// ---------- LOAD ASSETS ----------
const sounds = {
  oneShoot: createAudio("assets/audio/one shoot.mp3"),
  twoBullets: createAudio("assets/audio/two bullets.mp3"),
  rapidFire: createAudio("assets/audio/rapid fire.mp3"),
};

const sprites = {
  playerIdle: await loadImages([
    "assets/sprites/idle/cuphead_idle_0001.png",
    "assets/sprites/idle/cuphead_idle_0002.png",
    "assets/sprites/idle/cuphead_idle_0003.png",
    "assets/sprites/idle/cuphead_idle_0004.png",
    "assets/sprites/idle/cuphead_idle_0005.png",
  ]),
  playerRun: await loadImages([
    "assets/sprites/run/cuphead_run_0001.png",
    "assets/sprites/run/cuphead_run_0002.png",
    "assets/sprites/run/cuphead_run_0003.png",
    "assets/sprites/run/cuphead_run_0004.png",
    "assets/sprites/run/cuphead_run_0005.png",
    "assets/sprites/run/cuphead_run_0006.png",
    "assets/sprites/run/cuphead_run_0007.png",
    "assets/sprites/run/cuphead_run_0008.png",
    "assets/sprites/run/cuphead_run_0009.png",
    "assets/sprites/run/cuphead_run_0010.png",
    "assets/sprites/run/cuphead_run_0011.png",
    "assets/sprites/run/cuphead_run_0012.png",
    "assets/sprites/run/cuphead_run_0013.png",
    "assets/sprites/run/cuphead_run_0014.png",
    "assets/sprites/run/cuphead_run_0015.png",
    "assets/sprites/run/cuphead_run_0016.png",
  ]),
  playerJump: await loadImages([
    "assets/sprites/jump/cuphead_jump_0001.png",
    "assets/sprites/jump/cuphead_jump_0002.png",
    "assets/sprites/jump/cuphead_jump_0003.png",
    "assets/sprites/jump/cuphead_jump_0004.png",
    "assets/sprites/jump/cuphead_jump_0005.png",
    "assets/sprites/jump/cuphead_jump_0006.png",
    "assets/sprites/jump/cuphead_jump_0007.png",
    "assets/sprites/jump/cuphead_jump_0008.png",
  ]),
  playerTurn: await loadImages([
    "assets/sprites/run/cuphead_run_turnaround_0001.png",
    "assets/sprites/run/cuphead_run_turnaround_0002.png",
  ]),
  playerShoot: await loadImages([
    "assets/sprites/shoot/straight/cuphead_shoot_straight_0001.png",
    "assets/sprites/shoot/straight/cuphead_shoot_straight_0002.png",
    "assets/sprites/shoot/straight/cuphead_shoot_straight_0003.png",
  ]),
  playerRunShoot: await loadImages([
    "assets/sprites/shoot/run/cuphead_run_shoot_0001.png",
    "assets/sprites/shoot/run/cuphead_run_shoot_0002.png",
    "assets/sprites/shoot/run/cuphead_run_shoot_0003.png",
    "assets/sprites/shoot/run/cuphead_run_shoot_0004.png",
    "assets/sprites/shoot/run/cuphead_run_shoot_0005.png",
    "assets/sprites/shoot/run/cuphead_run_shoot_0006.png",
    "assets/sprites/shoot/run/cuphead_run_shoot_0007.png",
    "assets/sprites/shoot/run/cuphead_run_shoot_0008.png",
    "assets/sprites/shoot/run/cuphead_run_shoot_0009.png",
    "assets/sprites/shoot/run/cuphead_run_shoot_0010.png",
    "assets/sprites/shoot/run/cuphead_run_shoot_0011.png",
    "assets/sprites/shoot/run/cuphead_run_shoot_0012.png",
    "assets/sprites/shoot/run/cuphead_run_shoot_0013.png",
    "assets/sprites/shoot/run/cuphead_run_shoot_0014.png",
    "assets/sprites/shoot/run/cuphead_run_shoot_0015.png",
    "assets/sprites/shoot/run/cuphead_run_shoot_0016.png",
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
};

const bgLayers = [
  { img: await loadImage("assets/bg/boss-background.png"), x: 0, speed: 0 },
];

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
    this.frame = 0;
    this.delayJump = 75;
    this.nextFrameAt = 0;
    this.state = "idle";
    this.facing = 1;
    this.turnFrom = 0;
    this.shootUntil = 0;
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
    const speed = 200,
      jump = -750,
      gravity = 1500;
    const left = input.pressed("ArrowLeft");
    const right = input.pressed("ArrowRight");
    const both = left && right;

    if ((this.state === "run" || this.state === "runAndShoot") && this.turnFrom === 0 && !both) {
      if (left && this.facing === 1) this.startTurn(1);
      if (right && this.facing === -1) this.startTurn(-1);
    }

    switch (this.state) {
      case "idle":
        if (left ^ right) {
          this.state = "run";
          this.frame = 0;
        } else {
          this.sx = 0;
          this.animate(sprites.playerIdle, this.delayIdle);
        }
        break;

      case "jump":
        this.sx = (left ? -1 : right ? 1 : 0) * speed;
        if (this.sy < 0) {
          // Está subindo
          this.animate(sprites.playerJump.slice(0, 4), this.delayJump);
        } else {
          // Está caindo
          this.animate(sprites.playerJump.slice(4, 8), this.delayJump);
        }
        if (this.grounded) {
          this.state = "idle";
          this.frame = 0;
        }
        break;

      case "run":
  if (!(left ^ right) || both) {
    this.state = "idle";
    this.frame = 0;
    break;
  }
  if (input.pressed("KeyZ")) {
    this.state = "runAndShoot";
    this.frame = 0;
    break;
  }

  this.sx = (left ? -1 : 1) * speed;
  this.facing = left ? -1 : 1;
  this.animate(sprites.playerRun, this.delayRun);
  break;

case "runAndShoot":
  if (!(left ^ right) || both || !input.pressed("KeyZ")) {
    this.state = "run";
    this.frame = 0;
    break;
  }

  this.sx = (left ? -1 : 1) * speed;
  this.facing = left ? -1 : 1;
  this.animate(sprites.playerRunShoot, this.delayShoot);
  break;

      case "turn":
        this.sx = 0;
        this.animate(sprites.playerTurn, this.delayTurn, true);
        const oppositeHeld =
          (this.turnFrom === 1 && left) || (this.turnFrom === -1 && right);
        if (this.frame === sprites.playerTurn.length - 1 && oppositeHeld) {
          this.facing *= -1;
          this.state = "run";
          this.frame = 0;
          this.turnFrom = 0;
        }
        break;

      case "shoot":
        this.sx = 0;
        this.animate(sprites.playerShoot, this.delayShoot);
        if (performance.now() > this.shootUntil) {
          this.state = "idle";
          this.frame = 0;
        }
        break;
    }

    if (this.grounded && input.pressed("Space")) {
      this.sy = jump;
      this.grounded = false;
      this.state = "jump";
      this.frame = 0;
    }

    this.sy += gravity * dt;
    this.x += this.sx * dt;
    this.y += this.sy * dt;

    if (this.y >= GROUND_Y - this.h) {
      this.y = GROUND_Y - this.h;
      this.sy = 0;
      this.grounded = true;
    }

    this.handleShooting();
  }

handleShooting() {
  const isShooting = input.pressed("KeyZ");
  const now = performance.now();

  // Pode atirar parado, correndo ou correndo-atirando
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
      // 💥 Cria o projétil
      const bulletX = this.facing === 1 ? this.x + this.w : this.x;
      bullets.push(new Bullet(bulletX, this.y + this.h / 2 - 8, this.facing));

      // 🧠 Define o estado de animação corretamente
      if (canIdleShoot) {
        this.state = "shoot";
        this.frame = 0;
      } else if (canRunAndShoot) {
        this.state = "runAndShoot";
        // Não reseta frame — deixa a animação fluir
      }

      // ⏱️ Garante intervalo de tiro correto
      this.shootUntil = now + 300;

      // 🔊 Sons
      if (!isRapidFiring) {
        shotsInARow++;
        clearTimeout(shotTimer);
        shotTimer = setTimeout(() => {
          playShotSound();
          shotsInARow = 0;
        }, 100);
      }
    }
  } else {
    // 🔇 Solta o botão — para o rapid fire
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

// ---------- BULLET ----------
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
    this.image = this.cropSprite(frame);
  }

  animate(seq, delay, loop = true) {
    const now = performance.now();
    if (now >= this.nextFrameAt) {
      this.frame = loop
        ? (this.frame + 1) % seq.length
        : Math.min(this.frame + 1, seq.length - 1);
      const frameData = seq[this.frame];
      this.image = this.cropSprite(frameData);
      this.w = frameData.w;
      this.h = frameData.h;
      this.offsetX = frameData.offsetX || 0;
      this.offsetY = frameData.offsetY || 0;
      this.nextFrameAt = now + delay;

      if (!loop && this.frame === seq.length - 1 && this.state === "spawn") {
        this.state = "loop";
        this.frame = -1;
      }
    }
  }

  cropSprite({ x, y, w, h }) {
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(sprites.peashooterSheet, x, y, w, h, 0, 0, w, h);
    return canvas;
  }

  update(dt) {
    if (this.state === "spawn") this.animate(sprites.bulletSpawn, 50, false);
    else if (this.state === "loop") {
      this.animate(sprites.bulletLoop, 60);
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
    ctx.drawImage(
      this.image,
      this.x - this.offsetX,
      this.y - this.offsetY,
      this.w,
      this.h
    );
  }

  ctx.restore();
}
}

// ---------- GAME LOOP ----------
const player = new Player();
const bullets = [];
let last = 0;

function loop(t) {
  const dt = (t - last) / 1000;
  last = t;
  player.update(dt);
  bullets.forEach((b) => b.update(dt));
  render();
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);

function render() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  bgLayers.forEach((l) =>
    ctx.drawImage(l.img, 0, 0, canvas.width, canvas.height)
  );
  player.draw(ctx);
  bullets.forEach((b) => b.draw(ctx));
}

// ---------- UTIL ----------
function resize() {
  canvas.width = innerWidth;
  canvas.height = innerHeight;
  GROUND_Y = canvas.height - 120;
}

function createAudio(src) {
  const audio = new Audio(src);
  audio.preload = "auto";
  audio.load();
  return audio;
}

function loadImage(src) {
  return new Promise((res) => {
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
  if (now - lastShot > 150) {
    lastShot = now;
    return true;
  }
  return false;
}

function playShotSound() {
  if (shotsInARow === 1) {
    sounds.oneShoot.currentTime = 0;
    sounds.oneShoot.play();
  } else if (shotsInARow > 1) {
    sounds.rapidFire.currentTime = 0;
    sounds.rapidFire.play();
  }
}
