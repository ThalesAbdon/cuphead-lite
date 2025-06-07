export class Input {
  constructor() {
    this.keys = new Set();
    window.addEventListener("keydown", (e) => this.keys.add(e.code));
    window.addEventListener("keyup", (e) => this.keys.delete(e.code));
  }
  pressed(code) {
    return this.keys.has(code);
  }
}

export class Entity {
  constructor(x, y, w, h, image) {
    Object.assign(this, { x, y, w, h, sx: 0, sy: 0, image });
  }
  update(dt) {}
  draw(ctx) {
    ctx.drawImage(this.image, this.x, this.y, this.w, this.h);
  }
}
