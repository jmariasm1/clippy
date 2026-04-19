(() => {
const ClippyGame = window.ClippyGame || (window.ClippyGame = {});
const {
  OBSTACLE_BEHAVIORS,
  PLAYABLE_BEHAVIORS,
  POWERUP_BEHAVIORS,
  getCharacterFamily,
  getPlayableFamilies: getPlayableFamilyEntries,
  isFamilyUnlocked,
  getObstacleType,
  getAvailablePowerupEntries,
  pickWeightedSpawnEntry,
  resolveObstacleSpawnEntries,
  getFamilyName,
  getText,
  getUnlockBodyKey,
  getUnlockTitleKey,
  createUnlockStore,
  createSpecialUnlockStore,
  readBestScore,
  writeBestScore,
} = ClippyGame;

const GAME_W = 420;
const GAME_H = 760;
const CEILING_Y = 38;
const GROUND_Y = 640;
const DEV_BEST_SCORE_PASSWORD = "v7dev";
const DEV_STATIC_LOGO_PASSWORD = "staticlogo";

const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
const lerp = (a, b, t) => a + (b - a) * t;
const rand = (min, max) => min + Math.random() * (max - min);

function loadImageAsset(src) {
  const img = new Image();
  const asset = { img, ready: false };
  img.onload = () => {
    asset.ready = true;
  };
  img.src = src;
  if (img.complete && img.naturalWidth > 0) {
    asset.ready = true;
  }
  return asset;
}

function createCanvasAsset(width, height, drawFn) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (ctx && typeof drawFn === "function") {
    drawFn(ctx, width, height);
  }
  return { img: canvas, ready: true };
}

const createMissingAsset = (key) => {
  const canvas = document.createElement("canvas");
  canvas.width = 2;
  canvas.height = 2;
  return {
    img: canvas,
    ready: false,
    error: new Error(`Missing asset: ${key}`),
  };
};

let RUNTIME_ASSETS = {};
let CLIPPY_SPRITE = createMissingAsset("character.clippy.idle");
let DOT_SPRITES = {
  idle: createMissingAsset("character.dot.idle"),
  bouncing: createMissingAsset("character.dot.bouncing"),
  inGround: createMissingAsset("character.dot.inGround"),
};
let DOT_PLAYER_SPRITES = {
  idle: createMissingAsset("character.dot.idle"),
  star1: createMissingAsset("character.dot.star1"),
  star2: createMissingAsset("character.dot.star2"),
};
let POWERPUP_SPRITES = {
  idle: createMissingAsset("character.powerpup.idle"),
  flyingUp: createMissingAsset("character.powerpup.flyingUp"),
};
let HOVERBOT_SPRITES = {
  body: createMissingAsset("character.hoverbot.body"),
  eyes: [
    createMissingAsset("character.hoverbot.eye1"),
    createMissingAsset("character.hoverbot.eye2"),
    createMissingAsset("character.hoverbot.eye3"),
    createMissingAsset("character.hoverbot.eye4"),
    createMissingAsset("character.hoverbot.eye5"),
    createMissingAsset("character.hoverbot.eye6"),
    createMissingAsset("character.hoverbot.eye7"),
  ],
};
let SCRIBBLE_SPRITES = {
  idle: [
    createMissingAsset("character.scribble.idle1"),
    createMissingAsset("character.scribble.idle2"),
    createMissingAsset("character.scribble.idle3"),
  ],
  jump: [
    createMissingAsset("character.scribble.jump0"),
    createMissingAsset("character.scribble.jump1"),
    createMissingAsset("character.scribble.jump2"),
    createMissingAsset("character.scribble.jump3"),
    createMissingAsset("character.scribble.jump4"),
  ],
};
let LOGO_SPRITE = createMissingAsset("character.logo.idle");
let MOTHER_NATURE_SPRITES = [
  createMissingAsset("character.motherNature.idle1"),
  createMissingAsset("character.motherNature.idle2"),
  createMissingAsset("character.motherNature.idle3"),
  createMissingAsset("character.motherNature.idle4"),
];
let WILL_SPRITES = [
  createMissingAsset("character.will.idle1"),
  createMissingAsset("character.will.idle2"),
  createMissingAsset("character.will.idle3"),
  createMissingAsset("character.will.idle4"),
  createMissingAsset("character.will.idle5"),
];
let WILL_FEATHER_SPRITE = createMissingAsset("character.will.feather");

function getRuntimeAsset(key) {
  return RUNTIME_ASSETS[key] || createMissingAsset(key);
}

function configureRuntimeAssets(assets) {
  RUNTIME_ASSETS = assets || {};
  CLIPPY_SPRITE = getRuntimeAsset("character.clippy.idle");
  DOT_SPRITES = {
    idle: getRuntimeAsset("character.dot.idle"),
    bouncing: getRuntimeAsset("character.dot.bouncing"),
    inGround: getRuntimeAsset("character.dot.inGround"),
  };
  DOT_PLAYER_SPRITES = {
    idle: getRuntimeAsset("character.dot.idle"),
    star1: getRuntimeAsset("character.dot.star1"),
    star2: getRuntimeAsset("character.dot.star2"),
  };
  POWERPUP_SPRITES = {
    idle: getRuntimeAsset("character.powerpup.idle"),
    flyingUp: getRuntimeAsset("character.powerpup.flyingUp"),
  };
  HOVERBOT_SPRITES = {
    body: getRuntimeAsset("character.hoverbot.body"),
    eyes: [
      getRuntimeAsset("character.hoverbot.eye1"),
      getRuntimeAsset("character.hoverbot.eye2"),
      getRuntimeAsset("character.hoverbot.eye3"),
      getRuntimeAsset("character.hoverbot.eye4"),
      getRuntimeAsset("character.hoverbot.eye5"),
      getRuntimeAsset("character.hoverbot.eye6"),
      getRuntimeAsset("character.hoverbot.eye7"),
    ],
  };
  SCRIBBLE_SPRITES = {
    idle: [
      getRuntimeAsset("character.scribble.idle1"),
      getRuntimeAsset("character.scribble.idle2"),
      getRuntimeAsset("character.scribble.idle3"),
    ],
    jump: [
      getRuntimeAsset("character.scribble.jump0"),
      getRuntimeAsset("character.scribble.jump1"),
      getRuntimeAsset("character.scribble.jump2"),
      getRuntimeAsset("character.scribble.jump3"),
      getRuntimeAsset("character.scribble.jump4"),
    ],
  };
  LOGO_SPRITE = getRuntimeAsset("character.logo.idle");
  MOTHER_NATURE_SPRITES = [
    getRuntimeAsset("character.motherNature.idle1"),
    getRuntimeAsset("character.motherNature.idle2"),
    getRuntimeAsset("character.motherNature.idle3"),
    getRuntimeAsset("character.motherNature.idle4"),
  ];
  WILL_SPRITES = [
    getRuntimeAsset("character.will.idle1"),
    getRuntimeAsset("character.will.idle2"),
    getRuntimeAsset("character.will.idle3"),
    getRuntimeAsset("character.will.idle4"),
    getRuntimeAsset("character.will.idle5"),
  ];
  WILL_FEATHER_SPRITE = getRuntimeAsset("character.will.feather");
}

  function roundedRectPath(ctx, x, y, w, h, r) {
    const rr = Math.min(r, w * 0.5, h * 0.5);
    ctx.beginPath();
    ctx.moveTo(x + rr, y);
    ctx.arcTo(x + w, y, x + w, y + h, rr);
    ctx.arcTo(x + w, y + h, x, y + h, rr);
    ctx.arcTo(x, y + h, x, y, rr);
    ctx.arcTo(x, y, x + w, y, rr);
    ctx.closePath();
  }

  function fillRoundedRect(ctx, x, y, w, h, r) {
    roundedRectPath(ctx, x, y, w, h, r);
    ctx.fill();
  }

  function strokeRoundedRect(ctx, x, y, w, h, r) {
    roundedRectPath(ctx, x, y, w, h, r);
    ctx.stroke();
  }

  function drawRibbonText(ctx, text, x, y, fontSize) {
    ctx.save();
    ctx.font = `900 ${fontSize}px Trebuchet MS, Segoe UI, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.lineWidth = 8;
    ctx.strokeStyle = "rgba(255,255,255,0.88)";
    ctx.strokeText(text, x, y);
    ctx.fillStyle = "#1f365c";
    ctx.fillText(text, x, y);
    ctx.restore();
  }

  function drawWrappedCenteredText(ctx, text, x, y, maxWidth, lineHeight) {
    const words = String(text || "").split(/\s+/).filter((w) => w.length > 0);
    if (words.length === 0) {
      return 0;
    }

    const lines = [];
    let line = words[0];
    for (let i = 1; i < words.length; i += 1) {
      const next = `${line} ${words[i]}`;
      if (ctx.measureText(next).width <= maxWidth) {
        line = next;
      } else {
        lines.push(line);
        line = words[i];
      }
    }
    lines.push(line);

    for (let i = 0; i < lines.length; i += 1) {
      ctx.fillText(lines[i], x, y + i * lineHeight);
    }
    return lines.length;
  }

  function getWrappedTextLines(ctx, text, maxWidth) {
    const words = String(text || "").split(/\s+/).filter((w) => w.length > 0);
    if (words.length === 0) {
      return [];
    }

    const lines = [];
    let line = words[0];
    for (let i = 1; i < words.length; i += 1) {
      const next = `${line} ${words[i]}`;
      if (ctx.measureText(next).width <= maxWidth) {
        line = next;
      } else {
        lines.push(line);
        line = words[i];
      }
    }
    lines.push(line);
    return lines;
  }

  function drawCenteredLineBlock(ctx, text, x, centerY, maxWidth, lineHeight, maxLines) {
    const lines = getWrappedTextLines(ctx, text, maxWidth);
    if (lines.length === 0) {
      return 0;
    }
    const trimmedLines = Number.isFinite(maxLines) ? lines.slice(0, maxLines) : lines;
    const totalHeight = (trimmedLines.length - 1) * lineHeight;
    const startY = centerY - totalHeight * 0.5;
    for (let i = 0; i < trimmedLines.length; i += 1) {
      ctx.fillText(trimmedLines[i], x, startY + i * lineHeight);
    }
    return trimmedLines.length;
  }

  const ASSET_BOUNDS_CACHE = new WeakMap();
  const ASSET_BOUNDS_CANVAS = document.createElement("canvas");
  const ASSET_BOUNDS_CTX = ASSET_BOUNDS_CANVAS.getContext("2d");

  function getAssetOpaqueBounds(asset, alphaThreshold) {
    if (!asset || !asset.img) {
      return null;
    }
    const img = asset.img;
    if (ASSET_BOUNDS_CACHE.has(img)) {
      return ASSET_BOUNDS_CACHE.get(img) || null;
    }

    const threshold = Number.isFinite(alphaThreshold) ? alphaThreshold : 38;
    const srcW = img.naturalWidth || img.width || 0;
    const srcH = img.naturalHeight || img.height || 0;
    if (srcW <= 0 || srcH <= 0 || !ASSET_BOUNDS_CTX) {
      const fallback = { sx: 0, sy: 0, sw: Math.max(1, srcW), sh: Math.max(1, srcH) };
      ASSET_BOUNDS_CACHE.set(img, fallback);
      return fallback;
    }

    ASSET_BOUNDS_CANVAS.width = srcW;
    ASSET_BOUNDS_CANVAS.height = srcH;
    ASSET_BOUNDS_CTX.clearRect(0, 0, srcW, srcH);
    ASSET_BOUNDS_CTX.drawImage(img, 0, 0, srcW, srcH);

    let pixels;
    try {
      pixels = ASSET_BOUNDS_CTX.getImageData(0, 0, srcW, srcH).data;
    } catch (_) {
      const fallback = { sx: 0, sy: 0, sw: srcW, sh: srcH };
      ASSET_BOUNDS_CACHE.set(img, fallback);
      return fallback;
    }

    let minX = srcW;
    let minY = srcH;
    let maxX = -1;
    let maxY = -1;
    for (let y = 0; y < srcH; y += 1) {
      for (let x = 0; x < srcW; x += 1) {
        const a = pixels[(y * srcW + x) * 4 + 3];
        if (a > threshold) {
          if (x < minX) minX = x;
          if (y < minY) minY = y;
          if (x > maxX) maxX = x;
          if (y > maxY) maxY = y;
        }
      }
    }

    const bounds = maxX >= minX && maxY >= minY
      ? { sx: minX, sy: minY, sw: maxX - minX + 1, sh: maxY - minY + 1 }
      : { sx: 0, sy: 0, sw: srcW, sh: srcH };
    ASSET_BOUNDS_CACHE.set(img, bounds);
    return bounds;
  }


  class AudioManager {
    constructor() {
      this.ctx = null;
      this.enabled = true;
      this.master = 0.22;
    }

    unlock() {
      if (!this.enabled) {
        return;
      }
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) {
        this.enabled = false;
        return;
      }
      if (!this.ctx) {
        try {
          this.ctx = new Ctx();
        } catch (_) {
          this.enabled = false;
          return;
        }
      }
      if (this.ctx && this.ctx.state === "suspended") {
        this.ctx.resume().catch(() => {});
      }
    }

    tone(freq, duration, type, volume, slide) {
      if (!this.ctx || this.ctx.state !== "running") {
        return;
      }
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(Math.max(40, freq), now);
      if (slide) {
        osc.frequency.exponentialRampToValueAtTime(Math.max(40, freq + slide), now + duration);
      }

      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(Math.max(0.0002, volume * this.master), now + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + duration + 0.02);
    }

    noise(duration, volume) {
      if (!this.ctx || this.ctx.state !== "running") {
        return;
      }
      const sampleRate = this.ctx.sampleRate;
      const length = Math.floor(sampleRate * duration);
      const buffer = this.ctx.createBuffer(1, length, sampleRate);
      const data = buffer.getChannelData(0);

      for (let i = 0; i < length; i += 1) {
        data[i] = (Math.random() * 2 - 1) * (1 - i / length);
      }

      const source = this.ctx.createBufferSource();
      source.buffer = buffer;
      const filter = this.ctx.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.value = 1100;
      filter.Q.value = 0.8;

      const gain = this.ctx.createGain();
      const now = this.ctx.currentTime;
      gain.gain.setValueAtTime(Math.max(0.0001, volume * this.master), now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      source.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);
      source.start(now);
      source.stop(now + duration);
    }

    flap() {
      this.tone(380, 0.08, "triangle", 0.35, 130);
      this.tone(540, 0.06, "sine", 0.2, -70);
    }

    score() {
      this.tone(720, 0.08, "square", 0.2, 180);
      setTimeout(() => this.tone(940, 0.09, "triangle", 0.2, 110), 30);
    }

    crash() {
      this.tone(230, 0.24, "sawtooth", 0.4, -180);
      this.tone(130, 0.32, "triangle", 0.35, -60);
      this.noise(0.18, 0.28);
    }

    ui() {
      this.tone(440, 0.06, "triangle", 0.2, 50);
    }

    dotBounce() {
      this.tone(220, 0.045, "square", 0.16, 40);
      this.tone(310, 0.04, "triangle", 0.1, -30);
    }

    powerpupFly() {
      this.tone(560, 0.11, "sawtooth", 0.12, 220);
      this.tone(360, 0.13, "triangle", 0.1, 180);
    }

    hoverbotLaser() {
      this.tone(980, 0.075, "square", 0.14, -180);
      this.tone(620, 0.11, "triangle", 0.1, -140);
      this.noise(0.055, 0.085);
    }

    scribblePurr() {
      this.tone(170, 0.12, "triangle", 0.08, 16);
      setTimeout(() => this.tone(140, 0.12, "sine", 0.05, 10), 32);
      setTimeout(() => this.tone(150, 0.1, "triangle", 0.045, 14), 68);
    }

    logoShieldStart() {
      this.tone(392, 0.15, "triangle", 0.16, 84);
      setTimeout(() => this.tone(523, 0.18, "sine", 0.13, 72), 32);
      setTimeout(() => this.tone(659, 0.2, "triangle", 0.11, 54), 76);
      setTimeout(() => this.tone(784, 0.24, "sine", 0.1, 40), 118);
    }

    logoShieldPulse(intensity) {
      const strength = clamp(Number.isFinite(intensity) ? intensity : 1, 0.25, 1);
      this.tone(468, 0.12, "sine", 0.04 + strength * 0.05, 44);
      setTimeout(() => this.tone(702, 0.11, "triangle", 0.035 + strength * 0.04, -24), 38);
    }

    logoShieldBlock() {
      this.tone(840, 0.08, "square", 0.12, -180);
      this.tone(620, 0.12, "triangle", 0.09, -70);
      this.noise(0.04, 0.045);
    }

    natureStart() {
      this.tone(320, 0.18, "sine", 0.08, 24);
      setTimeout(() => this.tone(480, 0.24, "triangle", 0.07, -14), 46);
      setTimeout(() => this.tone(640, 0.2, "sine", 0.05, 18), 88);
    }

    naturePulse(intensity) {
      const strength = clamp(Number.isFinite(intensity) ? intensity : 1, 0.25, 1);
      this.tone(430, 0.16, "sine", 0.035 + strength * 0.035, 28);
      setTimeout(() => this.tone(580, 0.14, "triangle", 0.03 + strength * 0.03, -12), 54);
    }

    featherRideStart() {
      this.tone(510, 0.16, "triangle", 0.08, 110);
      setTimeout(() => this.tone(730, 0.18, "sine", 0.07, 90), 34);
    }
  }

  class Particle {
    constructor(x, y, vx, vy, size, life, color, gravity) {
      this.x = x;
      this.y = y;
      this.vx = vx;
      this.vy = vy;
      this.size = size;
      this.life = life;
      this.maxLife = life;
      this.color = color;
      this.gravity = gravity;
    }

    update(dt) {
      this.life -= dt;
      this.vx *= 0.985;
      this.vy += this.gravity * dt;
      this.x += this.vx * dt;
      this.y += this.vy * dt;
    }

    draw(ctx) {
      if (this.life <= 0) {
        return;
      }
      const t = this.life / this.maxLife;
      ctx.globalAlpha = t;
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size * (0.7 + t * 0.6), 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    }
  }

  class SparkleParticle {
    constructor(x, y, vx, vy, size, life, color) {
      this.x = x;
      this.y = y;
      this.vx = vx;
      this.vy = vy;
      this.size = size;
      this.life = life;
      this.maxLife = life;
      this.color = color;
      this.angle = rand(0, Math.PI * 2);
      this.spin = rand(-5.5, 5.5);
    }

    update(dt) {
      this.life -= dt;
      this.x += this.vx * dt;
      this.y += this.vy * dt;
      this.vx *= 0.992;
      this.vy *= 0.986;
      this.angle += this.spin * dt;
    }

    draw(ctx) {
      if (this.life <= 0) {
        return;
      }
      const t = clamp(this.life / this.maxLife, 0, 1);
      const ray = this.size * (0.78 + (1 - t) * 0.58);
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.angle);
      ctx.globalAlpha = t * 0.28;
      ctx.strokeStyle = this.color;
      ctx.lineWidth = Math.max(2, this.size * 0.34);
      ctx.beginPath();
      ctx.moveTo(-ray * 1.08, 0);
      ctx.lineTo(ray * 1.08, 0);
      ctx.moveTo(0, -ray * 1.08);
      ctx.lineTo(0, ray * 1.08);
      ctx.stroke();
      ctx.globalAlpha = 0.2 + t * 0.8;
      ctx.strokeStyle = this.color;
      ctx.lineWidth = Math.max(1.4, this.size * 0.2);
      ctx.beginPath();
      ctx.moveTo(-ray, 0);
      ctx.lineTo(ray, 0);
      ctx.moveTo(0, -ray);
      ctx.lineTo(0, ray);
      ctx.stroke();
      ctx.rotate(Math.PI * 0.25);
      ctx.globalAlpha = t * 0.7;
      ctx.beginPath();
      ctx.moveTo(-ray * 0.7, 0);
      ctx.lineTo(ray * 0.7, 0);
      ctx.moveTo(0, -ray * 0.7);
      ctx.lineTo(0, ray * 0.7);
      ctx.stroke();
      ctx.rotate(-Math.PI * 0.25);
      ctx.globalAlpha = 0.45 + t * 0.4;
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(0, 0, this.size * 0.18 + (1 - t) * 0.14, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  class FlowerParticle {
    constructor(x, y, vx, vy, size, life, petalColor, centerColor) {
      this.x = x;
      this.y = y;
      this.vx = vx;
      this.vy = vy;
      this.size = size;
      this.life = life;
      this.maxLife = life;
      this.petalColor = petalColor;
      this.centerColor = centerColor;
      this.rotation = rand(0, Math.PI * 2);
      this.spin = rand(-2.8, 2.8);
    }

    update(dt) {
      this.life -= dt;
      this.x += this.vx * dt;
      this.y += this.vy * dt;
      this.vy += 120 * dt;
      this.vx *= 0.992;
      this.rotation += this.spin * dt;
    }

    draw(ctx) {
      if (this.life <= 0) {
        return;
      }
      const t = clamp(this.life / this.maxLife, 0, 1);
      const scale = this.size * (0.72 + t * 0.35);
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.rotation);
      ctx.globalAlpha = t;
      ctx.fillStyle = this.petalColor;
      for (let i = 0; i < 5; i += 1) {
        ctx.save();
        ctx.rotate((Math.PI * 2 * i) / 5);
        ctx.beginPath();
        ctx.ellipse(scale * 0.46, 0, scale * 0.34, scale * 0.2, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
      ctx.fillStyle = this.centerColor;
      ctx.beginPath();
      ctx.arc(0, 0, scale * 0.18, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  class ScorePop {
    constructor(x, y, text) {
      this.x = x;
      this.y = y;
      this.text = text;
      this.life = 0.55;
      this.maxLife = 0.55;
    }

    update(dt) {
      this.life -= dt;
      this.y -= 42 * dt;
    }

    draw(ctx) {
      const t = clamp(this.life / this.maxLife, 0, 1);
      ctx.save();
      ctx.globalAlpha = t;
      const scale = 0.8 + (1 - t) * 0.5;
      ctx.translate(this.x, this.y);
      ctx.scale(scale, scale);
      ctx.fillStyle = "#203a63";
      ctx.font = "900 24px Trebuchet MS, Segoe UI, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(this.text, 0, 0);
      ctx.restore();
    }
  }


  const HOVERBOT_EYE_SEQUENCE = [0, 1, 2, 3, 4, 5, 6, 5, 4, 3, 2, 1, 0];

  const HOVERBOT_LASER_ASSETS = {
    beam: createCanvasAsset(256, 22, (ctx, w, h) => {
      const g = ctx.createLinearGradient(0, h * 0.5, w, h * 0.5);
      g.addColorStop(0, "rgba(255,80,64,0)");
      g.addColorStop(0.2, "rgba(255,70,54,0.58)");
      g.addColorStop(0.55, "rgba(255,44,36,0.92)");
      g.addColorStop(1, "rgba(255,20,20,0.12)");
      ctx.fillStyle = g;
      fillRoundedRect(ctx, 0, 0, w, h, 10);
    }),
    core: createCanvasAsset(256, 8, (ctx, w, h) => {
      const g = ctx.createLinearGradient(0, h * 0.5, w, h * 0.5);
      g.addColorStop(0, "rgba(255,255,170,0)");
      g.addColorStop(0.12, "rgba(255,255,185,0.9)");
      g.addColorStop(0.85, "rgba(255,230,120,0.95)");
      g.addColorStop(1, "rgba(255,180,80,0.2)");
      ctx.fillStyle = g;
      fillRoundedRect(ctx, 0, 0, w, h, 4);
    }),
    charge: createCanvasAsset(64, 64, (ctx, w, h) => {
      const cx = w * 0.5;
      const cy = h * 0.5;
      const r = 16;
      const g = ctx.createRadialGradient(cx, cy, 3, cx, cy, r);
      g.addColorStop(0, "rgba(255,255,180,0.96)");
      g.addColorStop(0.45, "rgba(255,228,80,0.86)");
      g.addColorStop(1, "rgba(255,90,64,0)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();
    })
  };

  const HOVERBOT_EYE_LAYER = (() => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    return { canvas, ctx };
  })();

  function getHoverbotEyeAsset(phase) {
    if (HOVERBOT_SPRITES.eyes.length === 0) {
      return null;
    }
    const step = Math.floor(phase) % HOVERBOT_EYE_SEQUENCE.length;
    const normalized = (step + HOVERBOT_EYE_SEQUENCE.length) % HOVERBOT_EYE_SEQUENCE.length;
    return HOVERBOT_SPRITES.eyes[HOVERBOT_EYE_SEQUENCE[normalized]];
  }

  function hoverbotDomeClipPath(ctx, width, height) {
    ctx.beginPath();
    ctx.moveTo(-width * 0.33, height * 0.02);
    ctx.bezierCurveTo(
      -width * 0.31,
      -height * 0.24,
      -width * 0.21,
      -height * 0.52,
      0,
      -height * 0.54
    );
    ctx.bezierCurveTo(
      width * 0.23,
      -height * 0.52,
      width * 0.35,
      -height * 0.24,
      width * 0.33,
      height * 0.04
    );
    ctx.bezierCurveTo(
      width * 0.11,
      0,
      -width * 0.12,
      -height * 0.02,
      -width * 0.33,
      height * 0.02
    );
    ctx.closePath();
  }

  function drawHoverbotComposite(ctx, cx, cy, width, height, eyePhase, facingLeft) {
    ctx.save();
    ctx.translate(cx, cy);
    if (facingLeft) {
      ctx.scale(-1, 1);
    }

    if (HOVERBOT_SPRITES.body.ready) {
      ctx.drawImage(HOVERBOT_SPRITES.body.img, -width * 0.5, -height * 0.5, width, height);
    } else {
      ctx.fillStyle = "#c6c8ce";
      ctx.beginPath();
      ctx.ellipse(0, 0, width * 0.45, height * 0.46, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    const eyeAsset = getHoverbotEyeAsset(eyePhase);
    const eyeY = -height * 0.215;
    const eyeX = width * 0.01;
    const eyeW = width * 0.185;
    const eyeH = height * 0.082;

    const drawEyeTo = (targetCtx, cxEye, cyEye) => {
      const eyeRotation = -0.11;
      targetCtx.save();
      targetCtx.translate(cxEye, cyEye);
      targetCtx.rotate(eyeRotation);
      if (eyeAsset && eyeAsset.ready) {
        const srcW = eyeAsset.img.naturalWidth || eyeAsset.img.width || 1;
        const srcH = eyeAsset.img.naturalHeight || eyeAsset.img.height || 1;
        targetCtx.drawImage(
          eyeAsset.img,
          0,
          0,
          srcW,
          srcH,
          -eyeW * 0.5,
          -eyeH * 0.5,
          eyeW,
          eyeH
        );
      } else {
        targetCtx.fillStyle = "#ff1d1d";
        targetCtx.beginPath();
        targetCtx.arc(0, 0, width * 0.022, 0, Math.PI * 2);
        targetCtx.fill();
        targetCtx.fillStyle = "#fff14f";
        targetCtx.beginPath();
        targetCtx.arc(0, 0, width * 0.012, 0, Math.PI * 2);
        targetCtx.fill();
      }
      targetCtx.restore();
    };

    if (HOVERBOT_SPRITES.body.ready && HOVERBOT_EYE_LAYER.ctx) {
      const layerCanvas = HOVERBOT_EYE_LAYER.canvas;
      const layerCtx = HOVERBOT_EYE_LAYER.ctx;
      const layerW = Math.max(1, Math.round(width));
      const layerH = Math.max(1, Math.round(height));
      if (layerCanvas.width !== layerW || layerCanvas.height !== layerH) {
        layerCanvas.width = layerW;
        layerCanvas.height = layerH;
      }
      layerCtx.clearRect(0, 0, layerW, layerH);
      drawEyeTo(layerCtx, layerW * 0.5 + eyeX, layerH * 0.5 + eyeY);
      layerCtx.globalCompositeOperation = "destination-in";
      layerCtx.drawImage(HOVERBOT_SPRITES.body.img, 0, 0, layerW, layerH);
      layerCtx.globalCompositeOperation = "source-over";
      ctx.drawImage(layerCanvas, -width * 0.5, -height * 0.5, width, height);
    } else {
      ctx.save();
      hoverbotDomeClipPath(ctx, width, height);
      ctx.clip();
      drawEyeTo(ctx, eyeX, eyeY);
      ctx.restore();
    }

    ctx.restore();
  }


  const SCRIBBLE_IDLE_SEQUENCE = [0, 1, 2, 1];
  const SCRIBBLE_JUMP_SEQUENCE = [0, 1, 2, 3, 4];

  function getScribbleIdleSprite(t) {
    const frames = SCRIBBLE_SPRITES.idle;
    if (!frames || frames.length === 0) {
      return null;
    }
    const time = Number.isFinite(t) ? Math.max(0, t) : 0;
    const index = SCRIBBLE_IDLE_SEQUENCE[Math.floor(time * 5.4) % SCRIBBLE_IDLE_SEQUENCE.length];
    return frames[index] || frames[0];
  }

  function getScribbleJumpSprite(t) {
    const frames = SCRIBBLE_SPRITES.jump;
    if (!frames || frames.length === 0) {
      return null;
    }
    const time = Number.isFinite(t) ? Math.max(0, t) : 0;
    const index = SCRIBBLE_JUMP_SEQUENCE[Math.floor(time * 8.2) % SCRIBBLE_JUMP_SEQUENCE.length];
    return frames[index] || frames[0];
  }

  const MOTHER_NATURE_SEQUENCE = [0, 1, 2, 3, 2, 1];

  function getMotherNatureIdleSprite(t) {
    const frames = MOTHER_NATURE_SPRITES;
    if (!frames || frames.length === 0) {
      return null;
    }
    const time = Number.isFinite(t) ? Math.max(0, t) : 0;
    const index = MOTHER_NATURE_SEQUENCE[Math.floor(time * 3.4) % MOTHER_NATURE_SEQUENCE.length];
    return frames[index] || frames[0];
  }

  function getWillExpressionSprite(index) {
    return WILL_SPRITES[index] || WILL_SPRITES[0] || null;
  }

  function drawTrimmedAssetCentered(ctx, asset, x, y, w, h, alphaThreshold, flipX) {
    if (!asset || !asset.ready) {
      return false;
    }
    const bounds = getAssetOpaqueBounds(asset, alphaThreshold);
    if (!bounds || bounds.sw <= 0 || bounds.sh <= 0) {
      return false;
    }

    ctx.save();
    ctx.translate(x, y);
    if (flipX) {
      ctx.scale(-1, 1);
    }
    ctx.drawImage(
      asset.img,
      bounds.sx,
      bounds.sy,
      bounds.sw,
      bounds.sh,
      -w * 0.5,
      -h * 0.5,
      w,
      h
    );
    ctx.restore();
    return true;
  }

  function drawClosedBook(ctx, x, y, w, h) {
    ctx.save();
    ctx.translate(x, y);

    const body = ctx.createLinearGradient(-w * 0.5, 0, w * 0.5, 0);
    body.addColorStop(0, "#305f87");
    body.addColorStop(1, "#4da7b7");
    ctx.fillStyle = body;
    fillRoundedRect(ctx, -w * 0.5, -h * 0.5, w, h, 8);

    ctx.fillStyle = "rgba(255,255,255,0.18)";
    fillRoundedRect(ctx, -w * 0.5 + 6, -h * 0.5 + 4, w - 12, h * 0.26, 6);

    ctx.fillStyle = "#f7e4b0";
    fillRoundedRect(ctx, -w * 0.5 + 10, h * 0.1, w - 20, h * 0.16, 4);

    ctx.fillStyle = "#22435e";
    fillRoundedRect(ctx, -w * 0.12, -h * 0.5 + 2, w * 0.08, h - 4, 3);

    ctx.strokeStyle = "rgba(12,38,56,0.35)";
    ctx.lineWidth = 2;
    strokeRoundedRect(ctx, -w * 0.5, -h * 0.5, w, h, 8);
    ctx.restore();
  }

  function drawScribbleSprite(ctx, x, y, w, h, asset, flipX) {
    if (drawTrimmedAssetCentered(ctx, asset, x, y, w, h, 16, flipX)) {
      return;
    }

    ctx.save();
    ctx.translate(x, y);
    if (flipX) {
      ctx.scale(-1, 1);
    }
    ctx.fillStyle = "#74418f";
    ctx.beginPath();
    ctx.ellipse(0, 0, w * 0.3, h * 0.3, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function drawLogoSprite(ctx, x, y, w, h, angle, axisScaleX, alpha) {
    const drawAlpha = Number.isFinite(alpha) ? alpha : 1;
    const horizontalScale = Number.isFinite(axisScaleX) ? axisScaleX : 1;

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(Number.isFinite(angle) ? angle : 0);
    ctx.scale(horizontalScale, 1);
    ctx.globalAlpha = drawAlpha;

    if (LOGO_SPRITE.ready) {
      const opaque = getAssetOpaqueBounds(LOGO_SPRITE, 18);
      if (opaque && opaque.sw > 0 && opaque.sh > 0) {
        ctx.drawImage(
          LOGO_SPRITE.img,
          opaque.sx,
          opaque.sy,
          opaque.sw,
          opaque.sh,
          -w * 0.5,
          -h * 0.5,
          w,
          h
        );
      } else {
        ctx.drawImage(LOGO_SPRITE.img, -w * 0.5, -h * 0.5, w, h);
      }
      ctx.restore();
      return;
    }

    const ring = ctx.createLinearGradient(-w * 0.5, 0, w * 0.5, 0);
    ring.addColorStop(0, "#50b6ff");
    ring.addColorStop(0.35, "#68e2a8");
    ring.addColorStop(0.68, "#ffd85f");
    ring.addColorStop(1, "#ff7285");
    ctx.strokeStyle = ring;
    ctx.lineWidth = Math.max(4, w * 0.12);
    ctx.beginPath();
    ctx.arc(0, 0, w * 0.28, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  function drawLogoGlow(ctx, x, y, radius, t, alphaBoost) {
    const colors = [
      { angle: t * 2.4, color: "rgba(80,182,255,0.28)" },
      { angle: t * 2.8 + Math.PI * 0.5, color: "rgba(255,101,90,0.24)" },
      { angle: t * 3.1 + Math.PI, color: "rgba(110,232,151,0.26)" },
      { angle: t * 2.6 + Math.PI * 1.5, color: "rgba(255,220,104,0.25)" },
    ];
    const boost = Number.isFinite(alphaBoost) ? alphaBoost : 1;

    ctx.save();
    for (const layer of colors) {
      const px = x + Math.cos(layer.angle) * radius * 0.16;
      const py = y + Math.sin(layer.angle) * radius * 0.16;
      const glow = ctx.createRadialGradient(px, py, 0, px, py, radius);
      glow.addColorStop(0, layer.color.replace(/0\.\d+\)/, `${Math.min(0.55, 0.28 * boost)})`));
      glow.addColorStop(0.55, layer.color);
      glow.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(px, py, radius, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  function drawMotherNatureSprite(ctx, x, y, w, h, asset, alpha) {
    const drawAlpha = Number.isFinite(alpha) ? alpha : 1;
    if (asset && asset.ready) {
      const bounds = getAssetOpaqueBounds(asset, 18);
      ctx.save();
      ctx.translate(x, y);
      ctx.globalAlpha = drawAlpha;
      if (bounds && bounds.sw > 0 && bounds.sh > 0) {
        ctx.drawImage(
          asset.img,
          bounds.sx,
          bounds.sy,
          bounds.sw,
          bounds.sh,
          -w * 0.5,
          -h * 0.5,
          w,
          h
        );
      } else {
        ctx.drawImage(asset.img, -w * 0.5, -h * 0.5, w, h);
      }
      ctx.restore();
      return;
    }

    ctx.save();
    ctx.translate(x, y);
    ctx.globalAlpha = drawAlpha;
    const g = ctx.createRadialGradient(0, 0, w * 0.1, 0, 0, w * 0.52);
    g.addColorStop(0, "#f8fff8");
    g.addColorStop(0.45, "#86d8ff");
    g.addColorStop(0.72, "#69b54b");
    g.addColorStop(1, "#2c83d3");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(0, 0, w * 0.45, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function drawMotherNatureGlow(ctx, x, y, radius, t, alphaBoost) {
    const boost = Number.isFinite(alphaBoost) ? alphaBoost : 1;
    const colors = [
      { angle: t * 1.8, color: "rgba(96,197,104,0.24)" },
      { angle: t * 2.1 + Math.PI * 0.5, color: "rgba(122,217,255,0.22)" },
      { angle: t * 1.6 + Math.PI, color: "rgba(255,221,127,0.2)" },
    ];

    ctx.save();
    for (const layer of colors) {
      const px = x + Math.cos(layer.angle) * radius * 0.12;
      const py = y + Math.sin(layer.angle) * radius * 0.12;
      const glow = ctx.createRadialGradient(px, py, 0, px, py, radius);
      glow.addColorStop(0, layer.color.replace(/0\.\d+\)/, `${Math.min(0.46, 0.25 * boost)})`));
      glow.addColorStop(0.55, layer.color);
      glow.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(px, py, radius, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  function drawWillSprite(ctx, x, y, w, h, asset, grayscale, alpha) {
    const drawAlpha = Number.isFinite(alpha) ? alpha : 1;
    ctx.save();
    ctx.translate(x, y);
    ctx.globalAlpha = drawAlpha;
    if (grayscale) {
      ctx.filter = "grayscale(1)";
    }

    if (asset && asset.ready) {
      const opaque = getAssetOpaqueBounds(asset, 18);
      if (opaque && opaque.sw > 0 && opaque.sh > 0) {
        ctx.drawImage(
          asset.img,
          opaque.sx,
          opaque.sy,
          opaque.sw,
          opaque.sh,
          -w * 0.5,
          -h * 0.5,
          w,
          h
        );
      } else {
        ctx.drawImage(asset.img, -w * 0.5, -h * 0.5, w, h);
      }
      ctx.restore();
      return;
    }

    ctx.fillStyle = grayscale ? "#c6cad2" : "#c84d73";
    ctx.beginPath();
    ctx.arc(0, -h * 0.16, w * 0.24, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function drawWillBustStand(ctx, x, y, scale, grayscale, asset, alpha) {
    const width = 72 * scale;
    const height = 82 * scale;
    ctx.save();
    ctx.translate(x, y);

    const marble = ctx.createLinearGradient(-28 * scale, 0, 28 * scale, 0);
    marble.addColorStop(0, "#d9d8df");
    marble.addColorStop(0.5, "#f7f7fb");
    marble.addColorStop(1, "#c9c8d4");
    ctx.fillStyle = marble;
    fillRoundedRect(ctx, -32 * scale, 24 * scale, 64 * scale, 18 * scale, 6 * scale);
    fillRoundedRect(ctx, -22 * scale, 8 * scale, 44 * scale, 20 * scale, 5 * scale);
    ctx.strokeStyle = "rgba(102,108,132,0.34)";
    ctx.lineWidth = Math.max(1.2, scale * 1.6);
    strokeRoundedRect(ctx, -32 * scale, 24 * scale, 64 * scale, 18 * scale, 6 * scale);
    strokeRoundedRect(ctx, -22 * scale, 8 * scale, 44 * scale, 20 * scale, 5 * scale);

    drawWillSprite(ctx, 0, -2 * scale, width, height, asset, grayscale, alpha);
    ctx.restore();
  }

  function drawFeatherSprite(ctx, x, y, w, h, rotation, alpha) {
    const drawAlpha = Number.isFinite(alpha) ? alpha : 1;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(Number.isFinite(rotation) ? rotation : 0);
    ctx.globalAlpha = drawAlpha;

    if (WILL_FEATHER_SPRITE.ready) {
      const opaque = getAssetOpaqueBounds(WILL_FEATHER_SPRITE, 18);
      if (opaque && opaque.sw > 0 && opaque.sh > 0) {
        ctx.drawImage(
          WILL_FEATHER_SPRITE.img,
          opaque.sx,
          opaque.sy,
          opaque.sw,
          opaque.sh,
          -w * 0.5,
          -h * 0.5,
          w,
          h
        );
      } else {
        ctx.drawImage(WILL_FEATHER_SPRITE.img, -w * 0.5, -h * 0.5, w, h);
      }
      ctx.restore();
      return;
    }

    ctx.strokeStyle = "#b4d8ff";
    ctx.lineWidth = Math.max(3, h * 0.08);
    ctx.beginPath();
    ctx.moveTo(-w * 0.46, 0);
    ctx.quadraticCurveTo(-w * 0.1, -h * 0.46, w * 0.46, 0);
    ctx.quadraticCurveTo(-w * 0.08, h * 0.18, -w * 0.46, 0);
    ctx.stroke();
    ctx.restore();
  }

  const FAMILY_FALLBACK_COLORS = Object.freeze({
    clippy: "#9db2ce",
    dot: "#f35a6f",
    powerpup: "#f4b15e",
    hoverbot: "#c6c8ce",
    scribble: "#c18b63",
    logo: "#7dbdff",
    staticLogo: "#88d9ff",
    motherNature: "#6ec27a",
    will: "#d26b8c",
  });

  function getFamilyFallbackColor(familyId) {
    return FAMILY_FALLBACK_COLORS[familyId] || "#9db2ce";
  }

  function drawFamilyShowcaseSprite(ctx, familyId, x, y, size, t, index) {
    const pulseT = Number.isFinite(t) ? t : 0;
    const slotIndex = Number.isFinite(index) ? index : 0;
    const bob = Math.sin(pulseT * 2.2 + slotIndex * 0.6) * 2.2;

    ctx.save();
    ctx.translate(x, y + bob);

    if (familyId === "clippy") {
      if (CLIPPY_SPRITE.ready) {
        const w = size * 1.12;
        const h = size * 0.88;
        ctx.rotate(Math.sin(pulseT * 1.4 + slotIndex) * 0.08);
        ctx.drawImage(CLIPPY_SPRITE.img, -w * 0.5, -h * 0.5, w, h);
      } else {
        ctx.fillStyle = getFamilyFallbackColor(familyId);
        fillRoundedRect(ctx, -size * 0.48, -size * 0.36, size * 0.96, size * 0.72, 10);
      }
      ctx.restore();
      return;
    }

    if (familyId === "dot") {
      const cycle = Math.floor((pulseT * 6 + slotIndex) % 8);
      const asset = cycle === 2 ? DOT_PLAYER_SPRITES.star1 : (cycle === 3 ? DOT_PLAYER_SPRITES.star2 : DOT_PLAYER_SPRITES.idle);
      if (asset.ready) {
        const w = size * 0.88;
        const h = size * 0.88;
        ctx.drawImage(asset.img, -w * 0.5, -h * 0.5, w, h);
      } else {
        ctx.fillStyle = getFamilyFallbackColor(familyId);
        ctx.beginPath();
        ctx.arc(0, 0, size * 0.26, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
      return;
    }

    if (familyId === "powerpup") {
      const w = size * 1.02;
      const h = size * 1.02;
      ctx.rotate(Math.sin(pulseT * 2.4 + slotIndex) * 0.18 + Math.PI / 7);
      if (POWERPUP_SPRITES.flyingUp.ready) {
        ctx.save();
        ctx.scale(-1, 1);
        ctx.drawImage(POWERPUP_SPRITES.flyingUp.img, -w * 0.5, -h * 0.5, w, h);
        ctx.restore();
      } else {
        ctx.fillStyle = getFamilyFallbackColor(familyId);
        fillRoundedRect(ctx, -w * 0.38, -h * 0.34, w * 0.76, h * 0.68, 10);
      }
      ctx.restore();
      return;
    }

    if (familyId === "hoverbot") {
      drawHoverbotComposite(ctx, 0, 0, size * 1.14, size * 0.78, pulseT * 8.4 + slotIndex, false);
      ctx.restore();
      return;
    }

    if (familyId === "scribble") {
      drawScribbleSprite(ctx, 0, 0, size * 1.08, size * 0.74, getScribbleIdleSprite(pulseT * 1.15 + slotIndex * 0.1), false);
      ctx.restore();
      return;
    }

    if (familyId === "logo") {
      drawLogoGlow(ctx, 0, 0, size * 0.34, pulseT * 1.4, 1);
      drawLogoSprite(ctx, 0, 0, size * 0.76, size * 0.76, pulseT * 2.6 * (slotIndex % 2 === 0 ? 1 : -1), 1, 1);
      ctx.restore();
      return;
    }

    if (familyId === "staticLogo") {
      ctx.rotate(Math.PI);
      drawLogoGlow(ctx, 0, 0, size * 0.38, pulseT * 1.2, 1.25);
      drawLogoSprite(ctx, 0, 0, size * 0.76, size * 0.76, 0, 1, 1);
      ctx.restore();
      return;
    }

    if (familyId === "motherNature") {
      drawMotherNatureGlow(ctx, 0, 0, size * 0.36, pulseT * 0.95, 1);
      drawMotherNatureSprite(ctx, 0, 0, size * 0.82, size * 0.82, getMotherNatureIdleSprite(pulseT * 1.1 + slotIndex * 0.15), 1);
      ctx.restore();
      return;
    }

    if (familyId === "will") {
      const willSequence = [0, 0, 1, 0, 2, 0, 3, 0, 4, 0];
      const frame = willSequence[Math.floor((pulseT * 2.4 + slotIndex * 0.7) % willSequence.length)];
      drawWillSprite(ctx, 0, 0, size * 0.98, size * 0.98, getWillExpressionSprite(frame), false, 1);
      ctx.restore();
      return;
    }

    ctx.fillStyle = getFamilyFallbackColor(familyId);
    ctx.beginPath();
    ctx.arc(0, 0, size * 0.28, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }


const PLAYER_HELPERS = Object.freeze({
  drawClippyPlayable(ctx, player) {
    if (CLIPPY_SPRITE.ready) {
      ctx.drawImage(
        CLIPPY_SPRITE.img,
        -player.spriteWidth * 0.5,
        -player.spriteHeight * 0.5,
        player.spriteWidth,
        player.spriteHeight
      );
      return;
    }
    ctx.fillStyle = "#9db2ce";
    fillRoundedRect(
      ctx,
      -player.spriteWidth * 0.5,
      -player.spriteHeight * 0.5,
      player.spriteWidth,
      player.spriteHeight,
      10
    );
  },
  drawDotPlayable(ctx, player) {
    let dotSprite = DOT_PLAYER_SPRITES.idle;
    if (player.dotStarTimer > 0.09) {
      dotSprite = DOT_PLAYER_SPRITES.star1;
    } else if (player.dotStarTimer > 0.045) {
      dotSprite = DOT_PLAYER_SPRITES.star2;
    }

    if (dotSprite.ready) {
      ctx.drawImage(
        dotSprite.img,
        -player.dotWidth * 0.5,
        -player.dotHeight * 0.5,
        player.dotWidth,
        player.dotHeight
      );
      return;
    }

    ctx.fillStyle = "#f35a6f";
    ctx.beginPath();
    ctx.arc(0, 0, player.hitRadius + 2, 0, Math.PI * 2);
    ctx.fill();
  },
  drawPowerpupPlayable(ctx, player) {
    if (POWERPUP_SPRITES.flyingUp.ready) {
      ctx.save();
      ctx.scale(-1, 1);
      ctx.drawImage(
        POWERPUP_SPRITES.flyingUp.img,
        -player.powerpupWidth * 0.5,
        -player.powerpupHeight * 0.5,
        player.powerpupWidth,
        player.powerpupHeight
      );
      ctx.restore();
      return;
    }

    ctx.fillStyle = "#f4b15e";
    fillRoundedRect(
      ctx,
      -player.powerpupWidth * 0.4,
      -player.powerpupHeight * 0.35,
      player.powerpupWidth * 0.8,
      player.powerpupHeight * 0.7,
      12
    );
  },
  drawHoverbotPlayable(ctx, player) {
    drawHoverbotComposite(
      ctx,
      0,
      0,
      player.hoverbotWidth,
      player.hoverbotHeight,
      player.hoverEyePhase,
      false
    );
  },
  drawScribblePlayable(ctx, player) {
    const jumpFrames = SCRIBBLE_SPRITES.jump;
    const restAsset = jumpFrames[player.scribbleRestFrame]
      || jumpFrames[jumpFrames.length - 1]
      || null;
    const scribbleWidth = player.scribbleMounted ? player.scribbleMountedWidth : player.scribbleWidth;
    const scribbleHeight = player.scribbleMounted ? player.scribbleMountedHeight : player.scribbleHeight;
    let asset = player.scribbleMounted
      ? getScribbleIdleSprite(player.scribbleAnimT)
      : restAsset;

    if (!player.scribbleMounted && player.scribbleJumpTimer > 0.001 && jumpFrames.length > 0) {
      const bounceFrames = [4, 0, 1, 2, 3];
      const progress = 1 - clamp(player.scribbleJumpTimer / player.scribbleBounceDuration, 0, 1);
      const frameIndex = Math.min(
        bounceFrames.length - 1,
        Math.floor(progress * bounceFrames.length)
      );
      asset = jumpFrames[bounceFrames[frameIndex]] || restAsset || jumpFrames[0];
    }

    drawScribbleSprite(ctx, 0, 0, scribbleWidth, scribbleHeight, asset, false);
  },
  drawLogoPlayable(ctx, player) {
    drawLogoSprite(
      ctx,
      0,
      0,
      player.logoWidth,
      player.logoHeight,
      player.logoSpinAngle,
      1,
      1
    );
  },
  drawStaticLogoPlayable(ctx, player) {
    drawLogoGlow(ctx, 0, 0, player.logoWidth * 0.42, player.idleT * 1.05, 1.2);
    drawLogoSprite(
      ctx,
      0,
      0,
      player.logoWidth,
      player.logoHeight,
      0,
      1,
      1
    );
  },
  drawMotherNaturePlayable(ctx, player) {
    const asset = getMotherNatureIdleSprite(player.idleT + player.motherNatureAnimOffset);
    drawMotherNatureGlow(ctx, 0, 0, player.motherNatureWidth * 0.38, player.idleT * 0.9, 0.9);
    drawMotherNatureSprite(ctx, 0, 0, player.motherNatureWidth, player.motherNatureHeight, asset, 1);
  },
  drawWillPlayable(ctx, player) {
    const asset = getWillExpressionSprite(player.willExpressionFrame);
    drawWillSprite(ctx, 0, 0, player.willWidth, player.willHeight, asset, false, 1);
  },
});

class Player {
  constructor() {
    this.defaultX = 120;
    this.targetX = this.defaultX;
    this.x = this.defaultX;
    this.y = 350;
    this.vy = 0;
    this.rotation = 0;
    this.hitRadius = 18;
    this.flapPulse = 0;
    this.idleT = 0;

    this.character = "clippy";
    this.family = getCharacterFamily("clippy");
    this.playableProfile = this.family.roles.playable;
    this.playableBehavior = PLAYABLE_BEHAVIORS[this.playableProfile.behavior] || PLAYABLE_BEHAVIORS.clippyPlayable;

    this.spriteWidth = 94;
    this.spriteHeight = 74;
    this.dotStarTimer = 0;
    this.dotWidth = 66;
    this.dotHeight = 66;
    this.powerpupWidth = 80;
    this.powerpupHeight = 80;
    this.hoverbotWidth = 96;
    this.hoverbotHeight = 64;
    this.hoverEyePhase = 0;
    this.hoverEyeSpeed = 9.4;
    this.scribbleWidth = 92;
    this.scribbleHeight = 60;
    this.scribbleMountedWidth = 88;
    this.scribbleMountedHeight = 72;
    this.scribbleRestFrame = 3;
    this.scribbleBounceDuration = 0.5;
    this.scribbleMounted = false;
    this.scribbleAnimT = 0;
    this.scribbleJumpTimer = 0;
    this.logoWidth = 60;
    this.logoHeight = 60;
    this.logoSpinAngle = 0;
    this.logoSpinDirection = Math.random() < 0.5 ? -1 : 1;
    this.motherNatureWidth = 60;
    this.motherNatureHeight = 60;
    this.motherNatureAnimOffset = rand(0, 2);
    this.willWidth = 76;
    this.willHeight = 76;
    this.willExpressionFrame = 0;
    this.willExpressionTimer = rand(1.3, 2.2);

    this.setCharacter("clippy");
  }

  setCharacter(character) {
    const family = getCharacterFamily(character);
    const profile = family.roles?.playable || getCharacterFamily("clippy").roles.playable;
    const behavior = PLAYABLE_BEHAVIORS[profile.behavior] || PLAYABLE_BEHAVIORS.clippyPlayable;

    this.character = family.id;
    this.family = family;
    this.playableProfile = profile;
    this.playableBehavior = behavior;

    this.spriteWidth = profile.spriteWidth || 94;
    this.spriteHeight = profile.spriteHeight || 74;

    const dotProfile = getCharacterFamily("dot").roles.playable;
    this.dotWidth = dotProfile.spriteWidth || 66;
    this.dotHeight = dotProfile.spriteHeight || 66;

    const powerpupProfile = getCharacterFamily("powerpup").roles.playable;
    this.powerpupWidth = powerpupProfile.spriteWidth || 80;
    this.powerpupHeight = powerpupProfile.spriteHeight || 80;

    const hoverbotProfile = getCharacterFamily("hoverbot").roles.playable;
    this.hoverbotWidth = hoverbotProfile.spriteWidth || 96;
    this.hoverbotHeight = hoverbotProfile.spriteHeight || 64;

    const scribbleProfile = getCharacterFamily("scribble").roles.playable;
    this.scribbleWidth = scribbleProfile.spriteWidth || 92;
    this.scribbleHeight = scribbleProfile.spriteHeight || 60;
    this.scribbleMountedWidth = scribbleProfile.mountedWidth || 88;
    this.scribbleMountedHeight = scribbleProfile.mountedHeight || 72;
    this.scribbleRestFrame = scribbleProfile.restFrame || 3;
    this.scribbleBounceDuration = scribbleProfile.bounceDuration || 0.5;

    const logoProfile = getCharacterFamily("logo").roles.playable;
    this.logoWidth = logoProfile.spriteWidth || 60;
    this.logoHeight = logoProfile.spriteHeight || 60;
    this.logoSpinDirection = Math.random() < 0.5 ? -1 : 1;
    this.logoSpinAngle = 0;

    const motherNatureProfile = getCharacterFamily("motherNature").roles.playable;
    this.motherNatureWidth = motherNatureProfile.spriteWidth || 60;
    this.motherNatureHeight = motherNatureProfile.spriteHeight || 60;
    this.motherNatureAnimOffset = rand(0, 2.5);

    const willProfile = getCharacterFamily("will").roles.playable;
    this.willWidth = willProfile.spriteWidth || 76;
    this.willHeight = willProfile.spriteHeight || 76;
    this.willExpressionFrame = 0;
    this.willExpressionTimer = rand(1.3, 2.2);

    behavior.applyProfile(this, profile);
  }

  reset() {
    this.x = this.defaultX;
    this.targetX = this.defaultX;
    this.y = 350;
    this.vy = 0;
    this.rotation = 0;
    this.flapPulse = 0;
    this.idleT = 0;
    this.dotStarTimer = 0;
    this.hoverEyePhase = 0;
    this.scribbleMounted = false;
    this.scribbleAnimT = 0;
    this.scribbleJumpTimer = 0;
    this.logoSpinDirection = Math.random() < 0.5 ? -1 : 1;
    this.logoSpinAngle = 0;
    this.motherNatureAnimOffset = rand(0, 2.5);
    this.willExpressionFrame = 0;
    this.willExpressionTimer = rand(1.3, 2.2);
  }

  flap() {
    this.vy = -500;
    this.flapPulse = 1;
    if (this.playableBehavior?.onFlap) {
      this.playableBehavior.onFlap(this, this.playableProfile);
    }
  }

  updateHorizontal(dt, strength) {
    const rate = Number.isFinite(strength) ? strength : 5.6;
    const follow = 1 - Math.exp(-dt * rate);
    this.x = lerp(this.x, this.targetX, follow);
  }

  advanceWillExpression(dt) {
    this.willExpressionTimer -= dt;
    if (this.willExpressionFrame === 0) {
      if (this.willExpressionTimer <= 0) {
        this.willExpressionFrame = Math.floor(rand(1, 5.999));
        this.willExpressionTimer = rand(0.08, 0.18);
      }
    } else if (this.willExpressionTimer <= 0) {
      this.willExpressionFrame = 0;
      this.willExpressionTimer = rand(1.2, 2.6);
    }
  }

  updateShared(dt) {
    this.flapPulse = Math.max(0, this.flapPulse - dt * 5.5);
    this.dotStarTimer = Math.max(0, this.dotStarTimer - dt);
    this.hoverEyePhase += dt * this.hoverEyeSpeed;
    this.idleT += dt;
    this.scribbleAnimT += dt;
    this.scribbleJumpTimer = Math.max(0, this.scribbleJumpTimer - dt);
    this.logoSpinAngle += dt * 3.2 * this.logoSpinDirection;
    this.advanceWillExpression(dt);
  }

  update(dt) {
    this.scribbleMounted = false;
    this.updateHorizontal(dt, 5.6);
    this.vy += 1600 * dt;
    this.vy = Math.min(this.vy, 670);
    this.y += this.vy * dt;

    if (this.y < CEILING_Y + 12) {
      this.y = CEILING_Y + 12;
      this.vy = Math.max(this.vy, 70);
    }

    this.rotation = clamp(this.vy / 520, -0.55, 1.1);
    this.updateShared(dt);
  }

  idle(dt) {
    this.scribbleMounted = false;
    this.updateHorizontal(dt, 4.6);
    this.idleT += dt;
    this.y = 350 + Math.sin(this.idleT * 2.2) * 14;
    this.vy = 0;
    this.rotation = Math.sin(this.idleT * 1.7) * 0.1;
    this.flapPulse = Math.max(0, this.flapPulse - dt * 4);
    this.dotStarTimer = Math.max(0, this.dotStarTimer - dt);
    this.hoverEyePhase += dt * this.hoverEyeSpeed;
    this.scribbleAnimT += dt;
    this.scribbleJumpTimer = 0;
    this.logoSpinAngle += dt * 3.2 * this.logoSpinDirection;
    this.advanceWillExpression(dt);
  }

  updateRide(dt, anchorX, anchorY, rideType) {
    this.scribbleMounted = rideType === "scribble";
    this.targetX = anchorX;
    this.updateHorizontal(dt, 8);
    this.y = lerp(this.y, anchorY, 1 - Math.exp(-dt * 9));
    this.vy = 0;
    this.rotation = Math.sin((this.idleT + dt) * 2.7) * 0.05;
    this.flapPulse = Math.max(0, this.flapPulse - dt * 4.2);
    this.dotStarTimer = Math.max(0, this.dotStarTimer - dt);
    this.hoverEyePhase += dt * this.hoverEyeSpeed;
    this.idleT += dt;
    this.scribbleAnimT += dt;
    this.scribbleJumpTimer = Math.max(this.scribbleJumpTimer, 0.08);
    this.logoSpinAngle += dt * 3.2 * this.logoSpinDirection;
    this.advanceWillExpression(dt);
  }

  updateAfterCrash(dt) {
    this.scribbleMounted = false;
    this.updateHorizontal(dt, 4.2);
    this.vy += 1700 * dt;
    this.vy = Math.min(this.vy, 760);
    this.y += this.vy * dt;
    this.rotation = clamp(this.rotation + dt * 1.7, -1, 1.4);
    this.flapPulse = Math.max(0, this.flapPulse - dt * 3.2);
    this.dotStarTimer = Math.max(0, this.dotStarTimer - dt);
    this.hoverEyePhase += dt * this.hoverEyeSpeed;
    this.idleT += dt;
    this.scribbleAnimT += dt;
    this.scribbleJumpTimer = Math.max(0, this.scribbleJumpTimer - dt);
    this.logoSpinAngle += dt * 3.2 * this.logoSpinDirection;
    this.advanceWillExpression(dt);
  }

  draw(ctx) {
    const bob = this.character === "scribble" ? 0 : Math.sin(this.idleT * 5.2) * 1.4;
    ctx.save();
    ctx.translate(this.x, this.y + bob);
    if (this.character === "powerpup") {
      ctx.rotate(this.rotation * 0.55 + Math.PI / 6);
    } else if (this.character === "hoverbot") {
      ctx.rotate(this.rotation * 0.38);
    } else if (this.character === "logo") {
      ctx.rotate(this.rotation * 0.18);
    } else if (this.character === "staticLogo") {
      ctx.rotate(Math.PI);
    } else if (this.character === "motherNature") {
      ctx.rotate(this.rotation * 0.1);
    } else if (this.character === "scribble") {
      ctx.rotate(this.rotation * 0.26 - 0.14);
    } else {
      ctx.rotate(this.rotation * 0.85);
    }

    if (this.character === "clippy" && this.flapPulse > 0.02) {
      ctx.save();
      ctx.globalAlpha = 0.2 * this.flapPulse;
      ctx.strokeStyle = "#aec4df";
      ctx.lineWidth = 2;
      for (let i = 0; i < 3; i += 1) {
        const trailX = -42 - i * 11;
        const trailY = -3 + i * 4;
        ctx.beginPath();
        ctx.moveTo(trailX, trailY);
        ctx.lineTo(trailX - 11, trailY + 2);
        ctx.stroke();
      }
      ctx.restore();
    }

    this.playableBehavior.draw({ ctx, player: this, helpers: PLAYER_HELPERS });
    ctx.restore();
  }
}

const POWERUP_HELPERS = Object.freeze({
  initScribblePowerup(entity) {
    entity.width = 98;
    entity.height = 64;
    entity.baseY = GROUND_Y - 60;
    entity.bookY = GROUND_Y - 22;
    entity.bookX = entity.x;
    entity.bookWidth = 72;
    entity.bookHeight = 22;
    entity.bookVisible = true;
    entity.collected = false;
    entity.state = "perched";
    entity.perchTimer = rand(0.34, 0.52);
    entity.animT = rand(0, 2.5);
    entity.jumpTimer = 0;
    entity.jumpDuration = rand(0.66, 0.76);
    entity.jumpHeight = rand(122, 146);
    entity.driftSpeed = rand(30, 46);
    entity.pickupRadius = 24;
  },
  getScribblePowerupY(entity) {
    if (entity.state === "perched") {
      return entity.baseY - 10;
    }
    const progress = clamp(entity.jumpTimer / entity.jumpDuration, 0, 1);
    const arc = Math.sin(progress * Math.PI);
    return entity.baseY - arc * entity.jumpHeight;
  },
  updateScribblePowerup(entity, dt, worldSpeed, emit) {
    entity.animT += dt;

    if (entity.state === "perched" && !entity.collected) {
      entity.perchTimer = Math.max(0, entity.perchTimer - dt);
      entity.x -= Math.max(8, worldSpeed * 0.03) * dt;
      entity.bookX = entity.x;
      if (entity.perchTimer <= 0) {
        entity.state = "free";
        entity.jumpTimer = 0;
        emit("jump");
      }
      return;
    }

    if (entity.bookVisible) {
      entity.bookX -= worldSpeed * dt;
      if (entity.bookX + entity.bookWidth * 0.6 < -90) {
        entity.bookVisible = false;
      }
    }

    if (entity.collected) {
      return;
    }

    entity.x -= entity.driftSpeed * dt;
    entity.jumpTimer += dt;
    while (entity.jumpTimer >= entity.jumpDuration) {
      entity.jumpTimer -= entity.jumpDuration;
      emit("jump");
    }
  },
  collidesScribblePowerup(entity, player) {
    if (entity.collected) {
      return false;
    }
    const dx = player.x - entity.x;
    const dy = player.y - (POWERUP_HELPERS.getScribblePowerupY(entity) - 6);
    const rr = player.hitRadius + entity.pickupRadius;
    return dx * dx + dy * dy < rr * rr;
  },
  collectScribblePowerup(entity) {
    entity.collected = true;
    entity.bookX = entity.x;
  },
  isScribblePowerupOffscreen(entity) {
    if (entity.collected) {
      return !entity.bookVisible;
    }
    const catOffscreen = entity.x + entity.width * 0.6 < -90;
    return catOffscreen && !entity.bookVisible;
  },
  drawScribblePowerup(entity, ctx) {
    if (entity.bookVisible) {
      drawClosedBook(ctx, entity.bookX, entity.bookY, entity.bookWidth, entity.bookHeight);
    }
    if (entity.collected) {
      return;
    }
    const y = POWERUP_HELPERS.getScribblePowerupY(entity);
    if (entity.state === "perched") {
      drawScribbleSprite(ctx, entity.x, y, entity.width, entity.height, SCRIBBLE_SPRITES.jump[0], false);
    } else {
      drawScribbleSprite(ctx, entity.x, y, entity.width, entity.height, getScribbleJumpSprite(entity.animT), false);
    }
  },
  initLogoPowerup(entity) {
    entity.width = 58;
    entity.height = 58;
    entity.baseY = rand(CEILING_Y + 110, GROUND_Y - 140);
    entity.hoverPhase = rand(0, Math.PI * 2);
    entity.rotation = rand(0, Math.PI * 2);
    entity.axisScaleX = 1;
    entity.pickupRadius = 26;
    entity.collected = false;
    const roll = Math.random();
    entity.spinMode = roll < 0.34 ? "clockwise" : (roll < 0.68 ? "counterclockwise" : "flip");
    entity.spinSpeed = rand(2.2, 4.2);
    entity.flipPhase = rand(0, Math.PI * 2);
  },
  getLogoPowerupY(entity) {
    return entity.baseY + Math.sin(entity.hoverPhase) * 8;
  },
  updateLogoPowerup(entity, dt, worldSpeed) {
    entity.x -= worldSpeed * dt;
    entity.hoverPhase += dt * 2.2;
    if (entity.spinMode === "clockwise") {
      entity.rotation += dt * entity.spinSpeed;
      entity.axisScaleX = 1;
    } else if (entity.spinMode === "counterclockwise") {
      entity.rotation -= dt * entity.spinSpeed;
      entity.axisScaleX = 1;
    } else {
      entity.flipPhase += dt * 5.1;
      entity.rotation += dt * 1.2;
      entity.axisScaleX = Math.cos(entity.flipPhase);
      if (Math.abs(entity.axisScaleX) < 0.12) {
        entity.axisScaleX = 0.12 * Math.sign(entity.axisScaleX || 1);
      }
    }
  },
  collidesLogoPowerup(entity, player) {
    if (entity.collected) {
      return false;
    }
    const dx = player.x - entity.x;
    const dy = player.y - POWERUP_HELPERS.getLogoPowerupY(entity);
    const rr = player.hitRadius + entity.pickupRadius;
    return dx * dx + dy * dy < rr * rr;
  },
  collectLogoPowerup(entity) {
    entity.collected = true;
  },
  drawLogoPowerup(entity, ctx) {
    if (entity.collected) {
      return;
    }
    const y = POWERUP_HELPERS.getLogoPowerupY(entity);
    drawLogoGlow(ctx, entity.x, y, 26, entity.hoverPhase, 1);
    drawLogoSprite(ctx, entity.x, y, entity.width, entity.height, entity.rotation, entity.axisScaleX, 1);
  },
  initMotherNaturePowerup(entity) {
    entity.width = 58;
    entity.height = 58;
    entity.baseY = rand(CEILING_Y + 110, GROUND_Y - 150);
    entity.hoverPhase = rand(0, Math.PI * 2);
    entity.animT = rand(0, 3);
    entity.pickupRadius = 28;
    entity.collected = false;
  },
  getMotherNaturePowerupY(entity) {
    return entity.baseY + Math.sin(entity.hoverPhase) * 9;
  },
  updateMotherNaturePowerup(entity, dt, worldSpeed) {
    entity.x -= worldSpeed * dt;
    entity.hoverPhase += dt * 1.9;
    entity.animT += dt;
  },
  collidesMotherNaturePowerup(entity, player) {
    if (entity.collected) {
      return false;
    }
    const dx = player.x - entity.x;
    const dy = player.y - POWERUP_HELPERS.getMotherNaturePowerupY(entity);
    const rr = player.hitRadius + entity.pickupRadius;
    return dx * dx + dy * dy < rr * rr;
  },
  collectMotherNaturePowerup(entity) {
    entity.collected = true;
  },
  drawMotherNaturePowerup(entity, ctx) {
    if (entity.collected) {
      return;
    }
    const y = POWERUP_HELPERS.getMotherNaturePowerupY(entity);
    drawMotherNatureGlow(ctx, entity.x, y, 28, entity.animT, 1);
    drawMotherNatureSprite(ctx, entity.x, y, entity.width, entity.height, getMotherNatureIdleSprite(entity.animT), 1);
  },
  initWillPowerup(entity) {
    entity.width = 78;
    entity.height = 82;
    entity.baseY = GROUND_Y - 74;
    entity.pickupRadius = 26;
    entity.collected = false;
    entity.animT = rand(0, 2);
    entity.expressionFrame = 0;
    entity.expressionTimer = rand(1.1, 2.3);
  },
  getWillPowerupY(entity) {
    return entity.baseY + Math.sin(entity.animT * 1.2) * 2.5;
  },
  updateWillPowerup(entity, dt, worldSpeed) {
    entity.x -= worldSpeed * dt;
    entity.animT += dt;
    entity.expressionTimer -= dt;
    if (entity.expressionFrame === 0) {
      if (entity.expressionTimer <= 0) {
        entity.expressionFrame = Math.floor(rand(1, 5.999));
        entity.expressionTimer = rand(0.08, 0.18);
      }
    } else if (entity.expressionTimer <= 0) {
      entity.expressionFrame = 0;
      entity.expressionTimer = rand(1.1, 2.4);
    }
  },
  collidesWillPowerup(entity, player) {
    if (entity.collected) {
      return false;
    }
    const dx = player.x - entity.x;
    const dy = player.y - (POWERUP_HELPERS.getWillPowerupY(entity) - 10);
    const rr = player.hitRadius + entity.pickupRadius;
    return dx * dx + dy * dy < rr * rr;
  },
  collectWillPowerup(entity) {
    entity.collected = true;
  },
  drawWillPowerup(entity, ctx) {
    if (entity.collected) {
      return;
    }
    const y = POWERUP_HELPERS.getWillPowerupY(entity);
    drawWillBustStand(ctx, entity.x, y, 0.88, true, getWillExpressionSprite(entity.expressionFrame), 1);
  },
  isPowerupOffscreen(entity) {
    if (entity.family?.id === "scribble") {
      if (entity.collected) {
        return !entity.bookVisible;
      }
      const catOffscreen = entity.x + entity.width * 0.6 < -90;
      return catOffscreen && !entity.bookVisible;
    }
    if (entity.family?.id === "logo" || entity.family?.id === "motherNature" || entity.family?.id === "will") {
      return entity.collected || entity.x + entity.width * 0.6 < -90;
    }
    return entity.x + (entity.width || 0) * 0.6 < -90;
  },
});

class SpawnedPowerup {
  constructor(entry, config = {}) {
    this.entry = entry;
    this.family = getCharacterFamily(entry.familyId);
    this.profile = this.family.roles.powerup;
    this.behavior = POWERUP_BEHAVIORS[this.profile.behavior];
    this.x = GAME_W + rand(90, 150);
    Object.assign(this, config);
    this.behavior.init({ entity: this, profile: this.profile, helpers: POWERUP_HELPERS });
  }

  update(dt, worldSpeed) {
    let jumpCount = 0;
    this.behavior.update({
      entity: this,
      dt,
      worldSpeed,
      helpers: POWERUP_HELPERS,
      emit: (type) => {
        if (type === "jump") {
          jumpCount += 1;
        }
      },
    });
    return { jumpCount };
  }

  collides(player) {
    return this.behavior.collides({ entity: this, player, helpers: POWERUP_HELPERS });
  }

  collect() {
    this.behavior.collect({ entity: this, helpers: POWERUP_HELPERS });
  }

  isOffscreen() {
    return POWERUP_HELPERS.isPowerupOffscreen(this);
  }

  draw(ctx) {
    this.behavior.draw({ entity: this, ctx, helpers: POWERUP_HELPERS });
  }
}

class PowerupManager {
  constructor(getBestScore) {
    this.getBestScore = getBestScore;
    this.items = [];
    this.distanceToNext = rand(1180, 1820);
  }

  reset() {
    this.items = [];
    this.distanceToNext = rand(1180, 1820);
  }

  nextSpacing(difficulty, entry) {
    const min = Number.isFinite(entry?.spacingMin) ? entry.spacingMin : 1480;
    const max = Number.isFinite(entry?.spacingMax) ? entry.spacingMax : 2340;
    const bonus = Number.isFinite(entry?.spacingDifficultyBonus) ? entry.spacingDifficultyBonus : 180;
    return rand(min, max) + difficulty * bonus;
  }

  update(dt, worldSpeed, difficulty, allowSpawn, player, obstacleManager) {
    let jumpCount = 0;
    let pickedUp = null;
    const spawnedItems = [];
    const availableEntries = getAvailablePowerupEntries(this.getBestScore());

    if (allowSpawn && this.items.length === 0 && availableEntries.length > 0) {
      this.distanceToNext -= worldSpeed * dt;
      while (this.distanceToNext <= 0) {
        const totalChance = availableEntries.reduce((sum, entry) => sum + Math.max(0, entry.chance || 0), 0);
        if (Math.random() < totalChance) {
          const weightedEntries = availableEntries.map((entry) => ({
            ...entry,
            weight: Math.max(0.001, entry.chance || 0),
          }));
          const entry = pickWeightedSpawnEntry(weightedEntries);
          if (entry) {
            const spawned = new SpawnedPowerup(entry);
            if (obstacleManager && typeof obstacleManager.getPowerupSpawnX === "function") {
              const spawnX = obstacleManager.getPowerupSpawnX(spawned.width || 72, GAME_W + 90, GAME_W + 150, 24);
              if (Number.isFinite(spawnX)) {
                const spawnShift = spawnX - spawned.x;
                spawned.x = spawnX;
                if (spawned.family?.id === "scribble" && Number.isFinite(spawned.bookX)) {
                  spawned.bookX += spawnShift;
                }
              }
            }
            this.items.push(spawned);
            spawnedItems.push(spawned);
            this.distanceToNext += this.nextSpacing(difficulty, entry);
            continue;
          }
        }
        this.distanceToNext += this.nextSpacing(difficulty);
      }
    }

    for (let i = 0; i < this.items.length; i += 1) {
      const item = this.items[i];
      const result = item.update(dt, worldSpeed);
      jumpCount += result.jumpCount;
      if (!pickedUp && item.collides(player)) {
        pickedUp = item;
      }
    }

    if (pickedUp) {
      pickedUp.collect();
    }

    this.items = this.items.filter((item) => !item.isOffscreen());
    return { jumpCount, pickedUp, spawnedItems };
  }

  draw(ctx) {
    for (let i = 0; i < this.items.length; i += 1) {
      this.items[i].draw(ctx);
    }
  }
}

  function drawPencilSegment(ctx, x, y, w, h, isTop) {
    const bodyX = x + 12;
    const bodyW = w - 24;

    const g = ctx.createLinearGradient(bodyX, y, bodyX + bodyW, y);
    g.addColorStop(0, "#f7dc67");
    g.addColorStop(1, "#efc84c");
    ctx.fillStyle = g;
    fillRoundedRect(ctx, bodyX, y, bodyW, h, 10);

    ctx.strokeStyle = "#c7a43f";
    ctx.lineWidth = 2;
    strokeRoundedRect(ctx, bodyX, y, bodyW, h, 10);

    ctx.strokeStyle = "rgba(171,131,25,0.42)";
    ctx.lineWidth = 1.5;
    for (let yy = y + 14; yy < y + h - 10; yy += 18) {
      ctx.beginPath();
      ctx.moveTo(bodyX + 3, yy);
      ctx.lineTo(bodyX + bodyW - 3, yy);
      ctx.stroke();
    }

    if (isTop) {
      ctx.fillStyle = "#c6c8d2";
      fillRoundedRect(ctx, bodyX, y + 4, bodyW, 9, 3);
      ctx.fillStyle = "#f4abc1";
      fillRoundedRect(ctx, bodyX, y + 12, bodyW, 15, 4);
    } else {
      ctx.fillStyle = "#c6c8d2";
      fillRoundedRect(ctx, bodyX, y + h - 13, bodyW, 9, 3);
      ctx.fillStyle = "#f4abc1";
      fillRoundedRect(ctx, bodyX, y + h - 28, bodyW, 15, 4);
    }

    const tipLen = 20;
    const baseY = isTop ? y + h : y;
    ctx.fillStyle = "#d6b089";
    ctx.beginPath();
    if (isTop) {
      ctx.moveTo(bodyX, baseY);
      ctx.lineTo(bodyX + bodyW * 0.5, baseY + tipLen);
      ctx.lineTo(bodyX + bodyW, baseY);
    } else {
      ctx.moveTo(bodyX, baseY);
      ctx.lineTo(bodyX + bodyW * 0.5, baseY - tipLen);
      ctx.lineTo(bodyX + bodyW, baseY);
    }
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = "#3c3c43";
    ctx.beginPath();
    if (isTop) {
      ctx.moveTo(bodyX + bodyW * 0.5 - 4, baseY + tipLen - 4);
      ctx.lineTo(bodyX + bodyW * 0.5, baseY + tipLen + 5);
      ctx.lineTo(bodyX + bodyW * 0.5 + 4, baseY + tipLen - 4);
    } else {
      ctx.moveTo(bodyX + bodyW * 0.5 - 4, baseY - tipLen + 4);
      ctx.lineTo(bodyX + bodyW * 0.5, baseY - tipLen - 5);
      ctx.lineTo(bodyX + bodyW * 0.5 + 4, baseY - tipLen + 4);
    }
    ctx.closePath();
    ctx.fill();
  }

  function drawScissorSegment(ctx, x, y, w, h, isTop, t, phase) {
    const center = x + w * 0.5;
    const stemW = 20;
    const g = ctx.createLinearGradient(center - stemW, y, center + stemW, y);
    g.addColorStop(0, "#c9d6e7");
    g.addColorStop(1, "#a8b7cd");
    ctx.fillStyle = g;
    fillRoundedRect(ctx, center - stemW * 0.5, y, stemW, h, 8);

    ctx.strokeStyle = "#7e8ea8";
    ctx.lineWidth = 2;
    strokeRoundedRect(ctx, center - stemW * 0.5, y, stemW, h, 8);

    ctx.fillStyle = "rgba(243,247,255,0.9)";
    for (let yy = y + 16; yy < y + h - 12; yy += 30) {
      ctx.beginPath();
      ctx.arc(center, yy, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }

    const sign = isTop ? 1 : -1;
    const gapY = isTop ? y + h : y;
    const sway = Math.sin(t * 3.6 + phase) * 4;

    ctx.fillStyle = "#dce6f4";
    ctx.strokeStyle = "#8fa0bb";
    ctx.lineWidth = 1.5;

    ctx.beginPath();
    ctx.moveTo(center - 3, gapY - sign * 26);
    ctx.lineTo(center - 20 - sway * 0.2, gapY + sign * 12);
    ctx.lineTo(center - 9, gapY + sign * 12);
    ctx.lineTo(center + 1, gapY - sign * 20);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(center + 3, gapY - sign * 26);
    ctx.lineTo(center + 20 + sway * 0.2, gapY + sign * 12);
    ctx.lineTo(center + 9, gapY + sign * 12);
    ctx.lineTo(center - 1, gapY - sign * 20);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    const handleY = isTop ? y + 24 : y + h - 24;
    ctx.strokeStyle = "#5d7aa7";
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(center - 13, handleY, 10, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(center + 13, handleY, 10, 0, Math.PI * 2);
    ctx.stroke();
  }

  function drawBinderSegment(ctx, x, y, w, h, isTop) {
    const bodyX = x + 10;
    const bodyW = w - 20;

    const g = ctx.createLinearGradient(bodyX, y, bodyX + bodyW, y);
    g.addColorStop(0, "#4f576a");
    g.addColorStop(1, "#2f3443");
    ctx.fillStyle = g;
    fillRoundedRect(ctx, bodyX, y, bodyW, h, 9);

    ctx.strokeStyle = "#1f2330";
    ctx.lineWidth = 2;
    strokeRoundedRect(ctx, bodyX, y, bodyW, h, 9);

    ctx.strokeStyle = "#cbd6e8";
    ctx.lineWidth = 1.8;
    for (let yy = y + 18; yy < y + h - 8; yy += 32) {
      ctx.beginPath();
      ctx.arc(x + w * 0.5 - 10, yy, 8, Math.PI * 0.2, Math.PI * 1.8);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(x + w * 0.5 + 10, yy, 8, Math.PI * 0.2, Math.PI * 1.8);
      ctx.stroke();
    }

    const edgeY = isTop ? y + h - 22 : y;
    ctx.fillStyle = "#2a2f3f";
    fillRoundedRect(ctx, bodyX + 2, edgeY, bodyW - 4, 22, 5);

    ctx.strokeStyle = "#dee6f5";
    ctx.lineWidth = 2;
    const wireY = isTop ? edgeY - 1 : edgeY + 23;
    ctx.beginPath();
    ctx.moveTo(x + w * 0.5 - 14, wireY);
    ctx.quadraticCurveTo(x + w * 0.5 - 16, wireY + (isTop ? -12 : 12), x + w * 0.5 - 8, wireY + (isTop ? -20 : 20));
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x + w * 0.5 + 14, wireY);
    ctx.quadraticCurveTo(x + w * 0.5 + 16, wireY + (isTop ? -12 : 12), x + w * 0.5 + 8, wireY + (isTop ? -20 : 20));
    ctx.stroke();
  }

  function drawCoffeeSegment(ctx, x, y, w, h, isTop, t, phase) {
    const bodyX = x + 12;
    const bodyW = w - 24;

    const g = ctx.createLinearGradient(bodyX, y, bodyX + bodyW, y);
    g.addColorStop(0, "#d6b38d");
    g.addColorStop(1, "#b8845f");
    ctx.fillStyle = g;
    fillRoundedRect(ctx, bodyX, y, bodyW, h, 10);

    ctx.strokeStyle = "#9a6a47";
    ctx.lineWidth = 2;
    strokeRoundedRect(ctx, bodyX, y, bodyW, h, 10);

    for (let yy = y + 16; yy < y + h - 10; yy += 24) {
      ctx.fillStyle = "rgba(255,255,255,0.22)";
      fillRoundedRect(ctx, bodyX + 3, yy, bodyW - 6, 8, 3);
    }

    const cupW = bodyW;
    const cupH = 34;
    const cupY = isTop ? y + h - cupH - 2 : y + 2;

    ctx.fillStyle = "#f3f6fb";
    ctx.beginPath();
    ctx.moveTo(bodyX + 2, cupY + 2);
    ctx.lineTo(bodyX + cupW - 2, cupY + 2);
    ctx.lineTo(bodyX + cupW - 7, cupY + cupH);
    ctx.lineTo(bodyX + 7, cupY + cupH);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = "#6b3f2b";
    fillRoundedRect(ctx, bodyX + 4, cupY + 4, cupW - 8, 8, 3);

    ctx.strokeStyle = "#cad5e7";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(bodyX + 8, cupY + 16);
    ctx.lineTo(bodyX + cupW - 8, cupY + 16);
    ctx.stroke();

    ctx.fillStyle = "#6b3f2b";
    for (let i = 0; i < 4; i += 1) {
      const dx = bodyX + 6 + i * ((cupW - 12) / 3);
      const floatY = Math.sin(t * 8 + phase + i) * 2;
      const dy = isTop ? y + h + 5 + i * 6 + floatY : y - 5 - i * 6 + floatY;
      ctx.beginPath();
      ctx.arc(dx, dy, 3.2 - i * 0.45, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function drawFolderSegment(ctx, x, y, w, h, isTop) {
    const bodyX = x + 8;
    const bodyW = w - 16;

    const g = ctx.createLinearGradient(bodyX, y, bodyX + bodyW, y);
    g.addColorStop(0, "#f2c95d");
    g.addColorStop(1, "#e59e3b");
    ctx.fillStyle = g;
    fillRoundedRect(ctx, bodyX, y, bodyW, h, 8);

    ctx.strokeStyle = "#b8782c";
    ctx.lineWidth = 2;
    strokeRoundedRect(ctx, bodyX, y, bodyW, h, 8);

    const tabOffset = isTop ? 0 : 5;
    for (let yy = y + 14; yy < y + h - 8; yy += 24) {
      ctx.fillStyle = "#ffd982";
      fillRoundedRect(ctx, bodyX + 2 + tabOffset, yy, bodyW - 4, 16, 3);
      ctx.fillStyle = "#f0b64e";
      fillRoundedRect(ctx, bodyX + 8 + ((yy / 24) % 3) * 6, yy - 5, 18, 6, 2);
      ctx.strokeStyle = "rgba(132,84,27,0.32)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(bodyX + 8, yy + 8);
      ctx.lineTo(bodyX + bodyW - 8, yy + 8);
      ctx.stroke();
    }
  }

  function drawStickySegment(ctx, x, y, w, h, isTop, t, phase) {
    const bodyX = x + 10;
    const bodyW = w - 20;

    const g = ctx.createLinearGradient(bodyX, y, bodyX + bodyW, y);
    g.addColorStop(0, "#dff0ff");
    g.addColorStop(1, "#b7d7ff");
    ctx.fillStyle = g;
    fillRoundedRect(ctx, bodyX, y, bodyW, h, 8);

    ctx.strokeStyle = "#7da6d3";
    ctx.lineWidth = 2;
    strokeRoundedRect(ctx, bodyX, y, bodyW, h, 8);

    const colors = ["#ffe87b", "#a7f0b2", "#ffbcbd", "#b6f0ff"];
    for (let i = 0; i < 6; i += 1) {
      const ny = y + 16 + i * ((h - 30) / 6);
      const nx = x + 14 + (i % 2) * 16;
      const rot = Math.sin(t * 2.5 + phase + i) * 0.15;
      ctx.save();
      ctx.translate(nx + 12, ny + 10);
      ctx.rotate(rot);
      ctx.fillStyle = colors[i % colors.length];
      fillRoundedRect(ctx, -12, -10, 24, 20, 3);
      ctx.fillStyle = "rgba(255,255,255,0.65)";
      ctx.beginPath();
      ctx.moveTo(4, -10);
      ctx.lineTo(12, -10);
      ctx.lineTo(12, -2);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    const clusterY = isTop ? y + h - 18 : y + 2;
    ctx.fillStyle = "#ffe87b";
    fillRoundedRect(ctx, x + 13, clusterY, w - 26, 18, 4);
  }

  function drawRulerSegment(ctx, x, y, w, h, isTop) {
    const bodyX = x + 11;
    const bodyW = w - 22;

    const g = ctx.createLinearGradient(bodyX, y, bodyX + bodyW, y);
    g.addColorStop(0, "#f7d66f");
    g.addColorStop(1, "#efc550");
    ctx.fillStyle = g;
    fillRoundedRect(ctx, bodyX, y, bodyW, h, 7);

    ctx.strokeStyle = "#b58a2f";
    ctx.lineWidth = 2;
    strokeRoundedRect(ctx, bodyX, y, bodyW, h, 7);

    ctx.strokeStyle = "#7d5e20";
    for (let yy = y + 10; yy < y + h - 8; yy += 9) {
      const big = Math.round((yy - y) / 9) % 5 === 0;
      ctx.lineWidth = big ? 2 : 1;
      ctx.beginPath();
      ctx.moveTo(bodyX + 4, yy);
      ctx.lineTo(bodyX + (big ? 15 : 10), yy);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(bodyX + bodyW - 4, yy);
      ctx.lineTo(bodyX + bodyW - (big ? 15 : 10), yy);
      ctx.stroke();
    }

    const tipY = isTop ? y + h : y;
    ctx.fillStyle = "#dec06a";
    ctx.beginPath();
    if (isTop) {
      ctx.moveTo(bodyX, tipY);
      ctx.lineTo(bodyX + bodyW * 0.5, tipY + 11);
      ctx.lineTo(bodyX + bodyW, tipY);
    } else {
      ctx.moveTo(bodyX, tipY);
      ctx.lineTo(bodyX + bodyW * 0.5, tipY - 11);
      ctx.lineTo(bodyX + bodyW, tipY);
    }
    ctx.closePath();
    ctx.fill();
  }

  function drawPushpinSegment(ctx, x, y, w, h, isTop, t, phase) {
    const bodyX = x + 10;
    const bodyW = w - 20;

    const g = ctx.createLinearGradient(bodyX, y, bodyX + bodyW, y);
    g.addColorStop(0, "#ff8d8f");
    g.addColorStop(1, "#ef5f64");
    ctx.fillStyle = g;
    fillRoundedRect(ctx, bodyX, y, bodyW, h, 9);

    ctx.strokeStyle = "#b33f46";
    ctx.lineWidth = 2;
    strokeRoundedRect(ctx, bodyX, y, bodyW, h, 9);

    for (let yy = y + 16; yy < y + h - 6; yy += 30) {
      ctx.fillStyle = "#ffd8d9";
      ctx.beginPath();
      ctx.arc(x + w * 0.5, yy, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#a1363e";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(x + w * 0.5, yy + 6);
      ctx.lineTo(x + w * 0.5, yy + 13);
      ctx.stroke();
    }

    const sign = isTop ? 1 : -1;
    const gapY = isTop ? y + h : y;
    const bob = Math.sin(t * 5 + phase) * 2.5;

    ctx.fillStyle = "#ffb4b6";
    ctx.beginPath();
    ctx.arc(x + w * 0.5, gapY - sign * 12, 10, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "#8b2f35";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x + w * 0.5, gapY - sign * 2);
    ctx.lineTo(x + w * 0.5 + bob * 0.15, gapY + sign * 12);
    ctx.stroke();

    ctx.fillStyle = "#8b2f35";
    ctx.beginPath();
    if (isTop) {
      ctx.moveTo(x + w * 0.5 - 2, gapY + 12);
      ctx.lineTo(x + w * 0.5, gapY + 18);
      ctx.lineTo(x + w * 0.5 + 2, gapY + 12);
    } else {
      ctx.moveTo(x + w * 0.5 - 2, gapY - 12);
      ctx.lineTo(x + w * 0.5, gapY - 18);
      ctx.lineTo(x + w * 0.5 + 2, gapY - 12);
    }
    ctx.closePath();
    ctx.fill();
  }

  function drawEraserSegment(ctx, x, y, w, h, isTop) {
    const bodyX = x + 10;
    const bodyW = w - 20;

    const g = ctx.createLinearGradient(bodyX, y, bodyX + bodyW, y);
    g.addColorStop(0, "#ffb8d0");
    g.addColorStop(1, "#ff96bf");
    ctx.fillStyle = g;
    fillRoundedRect(ctx, bodyX, y, bodyW, h, 8);

    ctx.strokeStyle = "#cf6892";
    ctx.lineWidth = 2;
    strokeRoundedRect(ctx, bodyX, y, bodyW, h, 8);

    ctx.fillStyle = "#b6daf5";
    fillRoundedRect(ctx, bodyX + 2, y + h * 0.38, bodyW - 4, h * 0.24, 6);

    ctx.strokeStyle = "rgba(122,75,100,0.3)";
    for (let yy = y + 14; yy < y + h - 8; yy += 20) {
      ctx.beginPath();
      ctx.moveTo(bodyX + 5, yy);
      ctx.lineTo(bodyX + bodyW - 5, yy);
      ctx.stroke();
    }

    const edgeY = isTop ? y + h : y;
    ctx.fillStyle = "#ff84b2";
    ctx.beginPath();
    if (isTop) {
      ctx.moveTo(bodyX, edgeY);
      ctx.lineTo(bodyX + bodyW * 0.5, edgeY + 9);
      ctx.lineTo(bodyX + bodyW, edgeY);
    } else {
      ctx.moveTo(bodyX, edgeY);
      ctx.lineTo(bodyX + bodyW * 0.5, edgeY - 9);
      ctx.lineTo(bodyX + bodyW, edgeY);
    }
    ctx.closePath();
    ctx.fill();
  }

  function drawHazardSegment(ctx, kind, x, y, w, h, isTop, t, phase) {
    if (h <= 0) {
      return;
    }
    switch (kind) {
      case "pencil":
        drawPencilSegment(ctx, x, y, w, h, isTop);
        break;
      case "scissors":
        drawScissorSegment(ctx, x, y, w, h, isTop, t, phase);
        break;
      case "binder":
        drawBinderSegment(ctx, x, y, w, h, isTop);
        break;
      case "coffee":
        drawCoffeeSegment(ctx, x, y, w, h, isTop, t, phase);
        break;
      case "folders":
        drawFolderSegment(ctx, x, y, w, h, isTop);
        break;
      case "sticky":
        drawStickySegment(ctx, x, y, w, h, isTop, t, phase);
        break;
      case "ruler":
        drawRulerSegment(ctx, x, y, w, h, isTop);
        break;
      case "pushpin":
        drawPushpinSegment(ctx, x, y, w, h, isTop, t, phase);
        break;
      case "eraser":
        drawEraserSegment(ctx, x, y, w, h, isTop);
        break;
      default:
        drawPencilSegment(ctx, x, y, w, h, isTop);
        break;
    }
  }

  function drawPaperCloud(ctx, x, y, scale) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);

    ctx.fillStyle = "#fdfefe";
    ctx.strokeStyle = "#cad7ea";
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.moveTo(-40, 12);
    ctx.bezierCurveTo(-50, -5, -28, -20, -8, -12);
    ctx.bezierCurveTo(0, -28, 30, -26, 36, -10);
    ctx.bezierCurveTo(54, -12, 64, 4, 56, 16);
    ctx.bezierCurveTo(42, 28, 0, 28, -28, 24);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.save();
    ctx.clip();
    ctx.strokeStyle = "rgba(129,163,212,0.35)";
    ctx.lineWidth = 1.4;
    for (let yy = -12; yy <= 24; yy += 7) {
      ctx.beginPath();
      ctx.moveTo(-45, yy);
      ctx.lineTo(60, yy);
      ctx.stroke();
    }
    ctx.restore();

    ctx.restore();
  }

  function drawFloatingDocument(ctx, x, y, s, rot, tint) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);
    ctx.scale(s, s);

    ctx.fillStyle = tint;
    fillRoundedRect(ctx, -16, -20, 32, 40, 4);
    ctx.strokeStyle = "rgba(73,99,138,0.36)";
    ctx.lineWidth = 1.6;
    strokeRoundedRect(ctx, -16, -20, 32, 40, 4);

    ctx.fillStyle = "rgba(91,121,165,0.32)";
    fillRoundedRect(ctx, -10, -12, 20, 3, 1);
    fillRoundedRect(ctx, -10, -5, 20, 3, 1);
    fillRoundedRect(ctx, -10, 2, 14, 3, 1);

    ctx.fillStyle = "rgba(108,166,235,0.35)";
    fillRoundedRect(ctx, -10, 9, 9, 7, 1.5);

    ctx.restore();
  }

  function drawFloatingSticky(ctx, x, y, s, rot, color) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);
    ctx.scale(s, s);

    ctx.fillStyle = color;
    fillRoundedRect(ctx, -12, -12, 24, 24, 3);
    ctx.strokeStyle = "rgba(90,95,120,0.3)";
    ctx.lineWidth = 1;
    strokeRoundedRect(ctx, -12, -12, 24, 24, 3);

    ctx.fillStyle = "rgba(255,255,255,0.52)";
    ctx.beginPath();
    ctx.moveTo(3, -12);
    ctx.lineTo(12, -12);
    ctx.lineTo(12, -3);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }

  function drawRetroIcon(ctx, x, y, s, phase) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(s, s);

    ctx.fillStyle = "#eef4ff";
    fillRoundedRect(ctx, -12, -12, 24, 24, 4);
    ctx.strokeStyle = "rgba(78,103,145,0.46)";
    ctx.lineWidth = 1.2;
    strokeRoundedRect(ctx, -12, -12, 24, 24, 4);

    ctx.fillStyle = "#95b5e3";
    fillRoundedRect(ctx, -9, -8, 18, 4, 1.5);
    ctx.fillStyle = "#5e85bf";
    fillRoundedRect(ctx, -8, -2, 6, 10, 1.2);
    ctx.fillStyle = "#7ea2d8";
    fillRoundedRect(ctx, 0, -2, 8, 10, 1.2);

    ctx.strokeStyle = "rgba(45,69,106,0.42)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-8, 10);
    ctx.lineTo(8 + Math.sin(phase) * 1.5, 10);
    ctx.stroke();

    ctx.restore();
  }

  function gapInsetForKind(kind) {
    switch (kind) {
      case "scissors":
        return 12;
      case "pencil":
      case "pushpin":
        return 10;
      case "ruler":
      case "coffee":
        return 8;
      default:
        return 6;
    }
  }


const OBSTACLE_HELPERS = Object.freeze({
  initOfficeHazard(entity) {
    entity.kind = entity.contentId;
    entity.width = 78;
  },
  collidesOfficeHazard(entity, player) {
    const r = player.hitRadius - 1;
    const left = entity.x + 8;
    const right = entity.x + entity.width - 8;
    if (player.x + r < left || player.x - r > right) {
      return false;
    }
    const inset = entity.profile?.gapInset ?? gapInsetForKind(entity.kind);
    const topBound = entity.gapTop + inset;
    const bottomBound = entity.gapBottom - inset;
    return player.y - r < topBound || player.y + r > bottomBound;
  },
  drawOfficeHazard(entity, ctx, t) {
    const topH = entity.gapTop;
    const bottomY = entity.gapBottom;
    const bottomH = GROUND_Y - bottomY;

    drawHazardSegment(ctx, entity.kind, entity.x, 0, entity.width, topH, true, t * entity.wave, entity.phase);
    drawHazardSegment(
      ctx,
      entity.kind,
      entity.x,
      bottomY,
      entity.width,
      bottomH,
      false,
      t * entity.wave,
      entity.phase + 0.8
    );

    const lineAlpha = entity.kind === "ruler" ? 0.22 : 0.14;
    ctx.strokeStyle = `rgba(31,55,92,${lineAlpha})`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(entity.x + 10, entity.gapTop);
    ctx.lineTo(entity.x + entity.width - 10, entity.gapTop);
    ctx.moveTo(entity.x + 10, entity.gapBottom);
    ctx.lineTo(entity.x + entity.width - 10, entity.gapBottom);
    ctx.stroke();
  },
  initDotObstacle(entity) {
    entity.width = 64;
    entity.dotRadius = 27;
    entity.dotY = clamp(entity.spawnY, CEILING_Y + entity.dotRadius + 20, GROUND_Y - entity.dotRadius - 2);
    entity.dotVY = rand(-280, 180);
    entity.dotBounceStrength = entity.bounceStrength;
    entity.dotOnGroundTimer = 0;
    entity.dotBouncingTimer = 0;
  },
  updateDotObstacle(entity, dt, speed, emit) {
    entity.x -= speed * dt;

    const floorY = GROUND_Y - entity.dotRadius - 1;
    const ceilingY = CEILING_Y + entity.dotRadius + 8;

    entity.dotVY += 1650 * dt;
    entity.dotY += entity.dotVY * dt;

    if (entity.dotY >= floorY) {
      entity.dotY = floorY;
      if (entity.dotVY > 0) {
        const bounce = entity.dotBounceStrength + Math.min(300, entity.dotVY * 0.28);
        entity.dotVY = -bounce;
        entity.dotOnGroundTimer = 0.17;
        entity.dotBouncingTimer = 0.24;
        emit("dotBounce");
      }
    }

    if (entity.dotY < ceilingY) {
      entity.dotY = ceilingY;
      entity.dotVY = Math.max(entity.dotVY, 90);
    }

    entity.dotOnGroundTimer = Math.max(0, entity.dotOnGroundTimer - dt);
    entity.dotBouncingTimer = Math.max(0, entity.dotBouncingTimer - dt);
  },
  collidesDotObstacle(entity, player) {
    const dx = player.x - (entity.x + entity.width * 0.5);
    const dy = player.y - entity.dotY;
    const rr = player.hitRadius + entity.dotRadius - 2;
    return dx * dx + dy * dy < rr * rr;
  },
  drawDotObstacle(entity, ctx) {
    const cx = entity.x + entity.width * 0.5;
    const cy = entity.dotY;
    let sprite = DOT_SPRITES.idle;
    if (entity.dotOnGroundTimer > 0.001) {
      sprite = DOT_SPRITES.inGround;
    } else if (entity.dotBouncingTimer > 0.001 && entity.dotVY < 0) {
      sprite = DOT_SPRITES.bouncing;
    }

    if (sprite.ready) {
      const w = entity.dotRadius * 2.35;
      const h = entity.dotRadius * 2.35;
      ctx.drawImage(sprite.img, cx - w * 0.5, cy - h * 0.5, w, h);
      return;
    }

    ctx.fillStyle = "#f35a6f";
    ctx.beginPath();
    ctx.arc(cx, cy, entity.dotRadius, 0, Math.PI * 2);
    ctx.fill();
  },
  initPowerpupObstacle(entity) {
    entity.width = 80;
    entity.powerpupRadius = 34;
    entity.powerpupY = GROUND_Y - entity.powerpupRadius - 2;
    entity.powerpupVY = 0;
    entity.powerpupIdleTimer = rand(0.18, 0.36);
    entity.powerpupFlySpeed = rand(460, 580);
  },
  updatePowerpupObstacle(entity, dt, speed, emit) {
    entity.x -= speed * dt;

    if (entity.powerpupIdleTimer > 0) {
      entity.powerpupIdleTimer = Math.max(0, entity.powerpupIdleTimer - dt);
      entity.powerpupY = GROUND_Y - entity.powerpupRadius - 2;
      if (entity.powerpupIdleTimer <= 0) {
        entity.powerpupVY = -entity.powerpupFlySpeed;
        emit("powerpupTakeoff");
      }
      return;
    }

    entity.powerpupY += entity.powerpupVY * dt;
  },
  collidesPowerpupObstacle(entity, player) {
    const dx = player.x - (entity.x + entity.width * 0.5);
    const dy = player.y - entity.powerpupY;
    const rr = player.hitRadius + entity.powerpupRadius - 4;
    return dx * dx + dy * dy < rr * rr;
  },
  drawPowerpupObstacle(entity, ctx) {
    const cx = entity.x + entity.width * 0.5;
    const cy = entity.powerpupY;
    const sprite = entity.powerpupIdleTimer > 0.001 ? POWERPUP_SPRITES.idle : POWERPUP_SPRITES.flyingUp;
    if (sprite.ready) {
      const w = entity.powerpupRadius * 2.75;
      const h = entity.powerpupRadius * 2.75;
      ctx.drawImage(sprite.img, cx - w * 0.5, cy - h * 0.5, w, h);
      return;
    }

    ctx.fillStyle = "#f4b15e";
    fillRoundedRect(ctx, cx - 22, cy - 22, 44, 44, 10);
  },
  initHoverbotObstacle(entity) {
    entity.width = 96;
    entity.hoverbotHeight = 64;
    entity.hoverbotBaseY = clamp(entity.spawnY, CEILING_Y + 116, GROUND_Y - 124);
    entity.hoverbotY = entity.hoverbotBaseY;
    entity.hoverbotPhase = rand(0, Math.PI * 2);
    entity.hoverbotAmp = rand(10, 16);
    entity.hoverbotWave = rand(1.9, 2.7);
    entity.hoverbotEyePhase = rand(0, HOVERBOT_EYE_SEQUENCE.length);
    entity.hoverbotEyeSpeed = rand(8.8, 11.2);
    entity.hoverbotLaserState = "idle";
    entity.hoverbotLaserTimer = rand(0.35, 0.8);
    entity.hoverbotLaserStrength = 0;
    entity.hoverbotLaserCooldown = rand(1.1, 1.6);
  },
  updateHoverbotObstacle(entity, dt, speed, emit) {
    entity.x -= speed * dt;
    entity.hoverbotPhase += dt * entity.hoverbotWave;
    entity.hoverbotY = entity.hoverbotBaseY + Math.sin(entity.hoverbotPhase) * entity.hoverbotAmp;
    entity.hoverbotEyePhase += dt * entity.hoverbotEyeSpeed;

    const nearEnough = entity.x <= 295 && entity.x + entity.width >= 80;
    if (entity.hoverbotLaserState === "idle") {
      entity.hoverbotLaserTimer = Math.max(0, entity.hoverbotLaserTimer - dt);
      if (nearEnough && entity.hoverbotLaserTimer <= 0) {
        entity.hoverbotLaserState = "charge";
        entity.hoverbotLaserTimer = 0.62;
        entity.hoverbotLaserStrength = 0;
      }
    } else if (entity.hoverbotLaserState === "charge") {
      entity.hoverbotLaserTimer = Math.max(0, entity.hoverbotLaserTimer - dt);
      entity.hoverbotLaserStrength = clamp(1 - entity.hoverbotLaserTimer / 0.62, 0, 1);
      if (entity.hoverbotLaserTimer <= 0) {
        entity.hoverbotLaserState = "fire";
        entity.hoverbotLaserTimer = 0.38;
        entity.hoverbotLaserStrength = 1;
        emit("hoverbotLaserShot");
      }
    } else if (entity.hoverbotLaserState === "fire") {
      entity.hoverbotLaserTimer = Math.max(0, entity.hoverbotLaserTimer - dt);
      if (entity.hoverbotLaserTimer <= 0) {
        entity.hoverbotLaserState = "cooldown";
        entity.hoverbotLaserTimer = entity.hoverbotLaserCooldown;
        entity.hoverbotLaserStrength = 0;
      }
    } else {
      entity.hoverbotLaserTimer = Math.max(0, entity.hoverbotLaserTimer - dt);
      if (entity.hoverbotLaserTimer <= 0) {
        entity.hoverbotLaserState = "idle";
        entity.hoverbotLaserTimer = rand(0.28, 0.6);
      }
    }
  },
  getHoverbotEyeY(entity) {
    return entity.hoverbotY - entity.hoverbotHeight * 0.215;
  },
  getHoverbotEyeX(entity) {
    return entity.x + entity.width * 0.49;
  },
  collidesHoverbotObstacle(entity, player) {
    const cx = entity.x + entity.width * 0.5;
    const cy = entity.hoverbotY;
    const dx = player.x - cx;
    const dy = player.y - cy;
    const bodyR = entity.hoverbotHeight * 0.44;
    const rr = player.hitRadius + bodyR - 4;
    if (dx * dx + dy * dy < rr * rr) {
      return true;
    }
    if (entity.hoverbotLaserState === "fire") {
      const eyeX = OBSTACLE_HELPERS.getHoverbotEyeX(entity);
      const eyeY = OBSTACLE_HELPERS.getHoverbotEyeY(entity);
      const laserLeft = -50;
      const laserRight = eyeX;
      const closestX = clamp(player.x, laserLeft, laserRight);
      const ldx = player.x - closestX;
      const ldy = player.y - eyeY;
      const laserRadius = player.hitRadius + 8;
      return ldx * ldx + ldy * ldy < laserRadius * laserRadius;
    }
    return false;
  },
  drawHoverbotObstacle(entity, ctx, t) {
    const cx = entity.x + entity.width * 0.5;
    const cy = entity.hoverbotY;

    drawHoverbotComposite(ctx, cx, cy, entity.width, entity.hoverbotHeight, entity.hoverbotEyePhase, true);

    const eyeX = OBSTACLE_HELPERS.getHoverbotEyeX(entity);
    const eyeY = OBSTACLE_HELPERS.getHoverbotEyeY(entity);
    const beamLength = Math.max(80, eyeX + 45);
    if (entity.hoverbotLaserState === "charge") {
      const pulse = Math.sin(t * 18) * 0.5 + 0.5;
      const warningLength = beamLength * (0.38 + entity.hoverbotLaserStrength * 0.62);
      ctx.save();
      ctx.globalAlpha = 0.38 + entity.hoverbotLaserStrength * 0.4;
      ctx.drawImage(HOVERBOT_LASER_ASSETS.core.img, eyeX - warningLength, eyeY - 2, warningLength, 4);
      ctx.globalAlpha = 0.45 + pulse * 0.42;
      ctx.drawImage(HOVERBOT_LASER_ASSETS.charge.img, eyeX - 12, eyeY - 12, 24, 24);
      ctx.restore();
      return;
    }

    if (entity.hoverbotLaserState === "fire") {
      const jitter = Math.sin(t * 44 + entity.phase) * 1.2;
      ctx.save();
      ctx.globalAlpha = 0.9;
      ctx.drawImage(HOVERBOT_LASER_ASSETS.beam.img, eyeX - beamLength, eyeY - 11 + jitter, beamLength, 22);
      ctx.globalAlpha = 0.98;
      ctx.drawImage(HOVERBOT_LASER_ASSETS.core.img, eyeX - beamLength, eyeY - 3 + jitter, beamLength, 6);
      ctx.restore();
    }
  },
});

class SpawnedObstacle {
  constructor(entry, config) {
    this.entry = entry;
    this.roleType = entry.type;
    this.contentId = entry.type === "obstacleType" ? entry.id : entry.familyId;
    this.role = entry.type === "obstacleType" ? "obstacleType" : entry.role;
    this.profile = entry.type === "obstacleType"
      ? getObstacleType(entry.id)
      : getCharacterFamily(entry.familyId).roles.obstacle;
    this.behavior = OBSTACLE_BEHAVIORS[this.profile.behavior] || OBSTACLE_BEHAVIORS.officeHazard;
    this.passed = false;
    this.phase = rand(0, Math.PI * 2);
    this.wave = rand(0.9, 1.35);
    this.x = GAME_W + 70;
    this.width = 78;
    Object.assign(this, config);
    this.behavior.init({ entity: this, profile: this.profile, helpers: OBSTACLE_HELPERS });
  }

  update(dt, speed) {
    const result = {
      dotBounceCount: 0,
      powerpupTakeoffCount: 0,
      hoverbotLaserShotCount: 0,
    };
    this.behavior.update({
      entity: this,
      dt,
      speed,
      helpers: OBSTACLE_HELPERS,
      emit: (type) => {
        if (type === "dotBounce") {
          result.dotBounceCount += 1;
        } else if (type === "powerpupTakeoff") {
          result.powerpupTakeoffCount += 1;
        } else if (type === "hoverbotLaserShot") {
          result.hoverbotLaserShotCount += 1;
        }
      },
    });
    return result;
  }

  get gapTop() {
    return this.gapY - this.gapSize * 0.5;
  }

  get gapBottom() {
    return this.gapY + this.gapSize * 0.5;
  }

  collides(player) {
    return this.behavior.collides({ entity: this, player, helpers: OBSTACLE_HELPERS });
  }

  isOffscreen() {
    return this.x + this.width < -120;
  }

  draw(ctx, t) {
    this.behavior.draw({ entity: this, ctx, t, helpers: OBSTACLE_HELPERS });
  }
}

class ObstacleManager {
  constructor(getBestScore) {
    this.getBestScore = getBestScore;
    this.items = [];
    this.distanceToNext = 250;
    this.lastGapY = 340;
    this.skipSpawnCount = 0;
  }

  reset() {
    this.items = [];
    this.distanceToNext = 240;
    this.lastGapY = 340;
    this.skipSpawnCount = 0;
  }

  queueEmptySpawns(count) {
    this.skipSpawnCount += Math.max(0, Math.floor(count || 0));
  }

  clearUpcomingHazards(count, playerX) {
    let remaining = Math.max(0, Math.floor(count || 0));
    if (remaining <= 0) {
      return;
    }

    const hazardItems = this.items
      .filter((item) => item.roleType === "obstacleType" && !item.passed && item.x + item.width >= playerX - 8)
      .sort((a, b) => a.x - b.x);

    for (let i = 0; i < hazardItems.length && remaining > 0; i += 1) {
      const target = hazardItems[i];
      this.items = this.items.filter((item) => item !== target);
      remaining -= 1;
    }

    if (remaining > 0) {
      this.queueEmptySpawns(remaining);
    }
  }

  getPowerupSpawnX(width, minX = GAME_W + 90, maxX = GAME_W + 150, padding = 24) {
    const safeWidth = Math.max(36, Number(width || 0));
    const halfWidth = safeWidth * 0.5;
    let candidate = rand(minX, maxX);
    const sortedItems = [...this.items].sort((a, b) => a.x - b.x);

    for (let i = 0; i < sortedItems.length; i += 1) {
      const obstacle = sortedItems[i];
      const left = candidate - halfWidth - padding;
      const right = candidate + halfWidth + padding;
      const obstacleLeft = obstacle.x;
      const obstacleRight = obstacle.x + (obstacle.width || 0);
      if (obstacleRight < left || obstacleLeft > right) {
        continue;
      }
      candidate = obstacleRight + halfWidth + padding + rand(8, 20);
    }

    return candidate;
  }

  clearPowerupSpawnConflicts(powerupItems, padding = 24) {
    const activePowerups = Array.isArray(powerupItems)
      ? powerupItems.filter((item) => item && !item.collected)
      : [];
    if (activePowerups.length === 0 || this.items.length === 0) {
      return 0;
    }

    let removed = 0;
    for (let i = 0; i < activePowerups.length; i += 1) {
      const powerup = activePowerups[i];
      const halfWidth = (powerup.width || 0) * 0.5;
      const left = powerup.x - halfWidth - padding;
      const right = powerup.x + halfWidth + padding;
      let bestIndex = -1;
      let bestDistance = Number.POSITIVE_INFINITY;

      for (let j = 0; j < this.items.length; j += 1) {
        const obstacle = this.items[j];
        const obstacleLeft = obstacle.x;
        const obstacleRight = obstacle.x + (obstacle.width || 0);
        if (obstacleRight < left || obstacleLeft > right) {
          continue;
        }
        const obstacleCenter = obstacle.x + (obstacle.width || 0) * 0.5;
        const distance = Math.abs(obstacleCenter - powerup.x);
        if (distance < bestDistance) {
          bestDistance = distance;
          bestIndex = j;
        }
      }

      if (bestIndex >= 0) {
        this.items.splice(bestIndex, 1);
        removed += 1;
      }
    }

    return removed;
  }

  nextSpacing(difficulty) {
    const base = lerp(270, 210, clamp(difficulty / 1.2, 0, 1));
    return base + rand(36, 106);
  }

  conflictsWithPowerupSpawns(obstacle, powerupItems, padding = 24) {
    const activePowerups = Array.isArray(powerupItems)
      ? powerupItems.filter((item) => item && !item.collected)
      : [];
    if (activePowerups.length === 0 || !obstacle) {
      return false;
    }

    const obstacleLeft = obstacle.x;
    const obstacleRight = obstacle.x + (obstacle.width || 0);
    for (let i = 0; i < activePowerups.length; i += 1) {
      const powerup = activePowerups[i];
      const halfWidth = (powerup.width || 0) * 0.5;
      const left = powerup.x - halfWidth - padding;
      const right = powerup.x + halfWidth + padding;
      if (obstacleRight >= left && obstacleLeft <= right) {
        return true;
      }
    }
    return false;
  }

  getPowerupReservationSpacing(powerupItems, padding = 24) {
    const activePowerups = Array.isArray(powerupItems)
      ? powerupItems.filter((item) => item && !item.collected)
      : [];
    if (activePowerups.length === 0) {
      return 0;
    }

    const spawnLeft = GAME_W + 70;
    let farthestRight = spawnLeft + 84;
    for (let i = 0; i < activePowerups.length; i += 1) {
      const powerup = activePowerups[i];
      const halfWidth = (powerup.width || 0) * 0.5;
      farthestRight = Math.max(farthestRight, powerup.x + halfWidth + padding);
    }
    return Math.max(92, Math.ceil(farthestRight - spawnLeft + 18));
  }

  queueSpawnedItem(item, spacing, powerupItems) {
    if (this.conflictsWithPowerupSpawns(item, powerupItems, 24)) {
      this.distanceToNext += this.getPowerupReservationSpacing(powerupItems, 24);
      return false;
    }

    this.items.push(item);
    this.distanceToNext += spacing;
    return true;
  }

  spawn(difficulty, powerupItems) {
    if (this.skipSpawnCount > 0) {
      this.skipSpawnCount -= 1;
      this.distanceToNext += this.nextSpacing(difficulty) + rand(16, 42);
      return;
    }

    const entries = resolveObstacleSpawnEntries(this.getBestScore(), difficulty);
    const entry = pickWeightedSpawnEntry(entries);
    if (!entry) {
      this.distanceToNext += this.nextSpacing(difficulty);
      return;
    }

    if (entry.type === "characterRole" && entry.familyId === "dot") {
      const dotY = rand(CEILING_Y + 120, GROUND_Y - 90);
      const bounceStrength = lerp(690, 880, clamp(difficulty / 1.2, 0, 1));
      this.queueSpawnedItem(
        new SpawnedObstacle(entry, { spawnY: dotY, bounceStrength }),
        this.nextSpacing(difficulty) + rand(18, 64),
        powerupItems
      );
      return;
    }

    if (entry.type === "characterRole" && entry.familyId === "powerpup") {
      this.queueSpawnedItem(
        new SpawnedObstacle(entry, {}),
        this.nextSpacing(difficulty) + rand(20, 72),
        powerupItems
      );
      return;
    }

    if (entry.type === "characterRole" && entry.familyId === "hoverbot") {
      const hoverY = rand(CEILING_Y + 166, GROUND_Y - 152);
      this.queueSpawnedItem(
        new SpawnedObstacle(entry, { spawnY: hoverY }),
        this.nextSpacing(difficulty) + rand(24, 86),
        powerupItems
      );
      return;
    }

    const gapSize = lerp(222, 154, clamp(difficulty / 1.2, 0, 1));
    const margin = 48;
    const minY = CEILING_Y + gapSize * 0.5 + margin;
    const maxY = GROUND_Y - gapSize * 0.5 - margin;

    let gapY = rand(minY, maxY);
    gapY = clamp(gapY, this.lastGapY - 150, this.lastGapY + 150);
    this.lastGapY = gapY;

    let spacing = this.nextSpacing(difficulty);
    if (Math.random() < 0.12 + difficulty * 0.08) {
      spacing += 42;
    }
    this.queueSpawnedItem(new SpawnedObstacle(entry, { gapY, gapSize }), spacing, powerupItems);
  }

  update(dt, speed, difficulty, allowSpawn, powerupItems) {
    const totals = {
      dotBounceCount: 0,
      powerpupTakeoffCount: 0,
      hoverbotLaserShotCount: 0,
    };

    if (allowSpawn) {
      this.distanceToNext -= speed * dt;
      while (this.distanceToNext <= 0) {
        this.spawn(difficulty, powerupItems);
      }
    }

    for (let i = 0; i < this.items.length; i += 1) {
      const result = this.items[i].update(dt, speed);
      totals.dotBounceCount += result.dotBounceCount;
      totals.powerpupTakeoffCount += result.powerpupTakeoffCount;
      totals.hoverbotLaserShotCount += result.hoverbotLaserShotCount;
    }

    this.items = this.items.filter((item) => !item.isOffscreen());
    return totals;
  }

  collides(player) {
    for (let i = 0; i < this.items.length; i += 1) {
      if (this.items[i].collides(player)) {
        return true;
      }
    }
    return false;
  }

  draw(ctx, t) {
    for (let i = 0; i < this.items.length; i += 1) {
      this.items[i].draw(ctx, t);
    }
  }
}

  class Background {
    constructor() {
      this.clouds = [];
      this.floaters = [];
      this.icons = [];
      this.cabinetShift = 0;

      for (let i = 0; i < 8; i += 1) {
        this.clouds.push({
          x: rand(-30, GAME_W + 120),
          y: rand(70, 245),
          s: rand(0.7, 1.2),
          speed: rand(0.85, 1.2)
        });
      }

      const stickyColors = ["#ffef8a", "#ffe2a8", "#c7f2b9", "#b9ecff", "#ffd0d0"];
      const docColors = ["#f2f7ff", "#edf5ff", "#f6fbff"];

      for (let i = 0; i < 20; i += 1) {
        const kindRoll = Math.random();
        const kind = kindRoll < 0.42 ? "doc" : (kindRoll < 0.78 ? "sticky" : "icon");
        this.floaters.push({
          kind,
          x: rand(-120, GAME_W + 220),
          y: rand(110, 560),
          s: rand(0.8, 1.3),
          rot: rand(-0.22, 0.22),
          speed: rand(0.8, 1.35),
          color: kind === "sticky"
            ? stickyColors[Math.floor(rand(0, stickyColors.length))]
            : docColors[Math.floor(rand(0, docColors.length))],
          phase: rand(0, Math.PI * 2)
        });
      }

      for (let i = 0; i < 12; i += 1) {
        this.icons.push({
          x: rand(-80, GAME_W + 160),
          y: rand(160, 470),
          s: rand(0.72, 1.05),
          speed: rand(0.9, 1.4),
          phase: rand(0, Math.PI * 2)
        });
      }
    }

    update(dt, scrollSpeed, t) {
      const far = scrollSpeed * 0.12 * dt;
      const mid = scrollSpeed * 0.22 * dt;
      const near = scrollSpeed * 0.32 * dt;

      this.cabinetShift = (this.cabinetShift + scrollSpeed * 0.45 * dt) % 88;

      for (let i = 0; i < this.clouds.length; i += 1) {
        const c = this.clouds[i];
        c.x -= far * c.speed;
        if (c.x < -120) {
          c.x = GAME_W + rand(40, 180);
          c.y = rand(70, 250);
          c.s = rand(0.7, 1.2);
          c.speed = rand(0.85, 1.2);
        }
      }

      for (let i = 0; i < this.floaters.length; i += 1) {
        const f = this.floaters[i];
        f.x -= mid * f.speed;
        f.phase += dt * (0.7 + f.speed * 0.5);
        if (f.x < -140) {
          f.x = GAME_W + rand(40, 220);
          f.y = rand(100, 575);
          f.s = rand(0.8, 1.3);
          f.rot = rand(-0.22, 0.22);
          f.speed = rand(0.8, 1.35);
          f.phase = rand(0, Math.PI * 2);
        }
      }

      for (let i = 0; i < this.icons.length; i += 1) {
        const icon = this.icons[i];
        icon.x -= near * icon.speed;
        icon.phase += dt * 2.1;
        if (icon.x < -64) {
          icon.x = GAME_W + rand(20, 130);
          icon.y = rand(150, 480);
          icon.s = rand(0.72, 1.05);
          icon.speed = rand(0.9, 1.4);
          icon.phase = rand(0, Math.PI * 2);
        }
      }

    }

    draw(ctx, t) {
      const sky = ctx.createLinearGradient(0, 0, 0, GROUND_Y);
      sky.addColorStop(0, "#f4f9ff");
      sky.addColorStop(1, "#deecff");
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, GAME_W, GROUND_Y);

      ctx.globalAlpha = 0.28;
      ctx.strokeStyle = "#a9c2e4";
      ctx.lineWidth = 1;
      for (let y = 20; y < GROUND_Y - 18; y += 24) {
        ctx.beginPath();
        ctx.moveTo(0, y + Math.sin((y + t * 40) * 0.02) * 0.8);
        ctx.lineTo(GAME_W, y + Math.sin((y + t * 40) * 0.02) * 0.8);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;

      for (let i = 0; i < this.clouds.length; i += 1) {
        const c = this.clouds[i];
        drawPaperCloud(ctx, c.x, c.y + Math.sin(t * 0.8 + i) * 4, c.s);
      }

      for (let i = 0; i < this.floaters.length; i += 1) {
        const f = this.floaters[i];
        const wobble = Math.sin(f.phase) * 3;
        if (f.kind === "doc") {
          drawFloatingDocument(ctx, f.x, f.y + wobble, f.s, f.rot + Math.sin(f.phase * 0.7) * 0.05, f.color);
        } else if (f.kind === "sticky") {
          drawFloatingSticky(ctx, f.x, f.y + wobble, f.s, f.rot + Math.sin(f.phase * 0.8) * 0.08, f.color);
        } else {
          drawRetroIcon(ctx, f.x, f.y + wobble, f.s, f.phase);
        }
      }

      ctx.fillStyle = "rgba(94,122,159,0.28)";
      for (let i = -2; i < 10; i += 1) {
        const x = i * 88 - this.cabinetShift;
        const h = 62 + (i % 3) * 16;
        fillRoundedRect(ctx, x, GROUND_Y - h - 14, 76, h, 5);

        ctx.fillStyle = "rgba(67,93,128,0.28)";
        fillRoundedRect(ctx, x + 10, GROUND_Y - h + 8 - 14, 56, 12, 2);
        ctx.fillStyle = "rgba(94,122,159,0.28)";
      }

      const desk = ctx.createLinearGradient(0, GROUND_Y, 0, GAME_H);
      desk.addColorStop(0, "#d6bf9f");
      desk.addColorStop(1, "#b89263");
      ctx.fillStyle = desk;
      fillRoundedRect(ctx, 0, GROUND_Y, GAME_W, GAME_H - GROUND_Y + 20, 0);

      ctx.strokeStyle = "rgba(123,83,44,0.25)";
      ctx.lineWidth = 1;
      for (let y = GROUND_Y + 10; y < GAME_H; y += 15) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(GAME_W, y);
        ctx.stroke();
      }

      ctx.fillStyle = "rgba(255,255,255,0.28)";
      fillRoundedRect(ctx, 0, GROUND_Y + 2, GAME_W, 10, 0);
    }
  }


class Game {
  constructor(ctx, assets) {
    configureRuntimeAssets(assets);

    this.ctx = ctx;
    this.audio = new AudioManager();
    this.background = new Background();
    this.unlockStore = createUnlockStore();
    this.unlockStore.migrateLegacyKeys();
    this.specialUnlockStore = createSpecialUnlockStore();

    this.best = readBestScore();
    this.player = new Player();
    this.obstacles = new ObstacleManager(() => this.best);
    this.powerups = new PowerupManager(() => this.best);

    this.selectedCharacter = "clippy";
    this.language = "en";
    this.player.setCharacter(this.selectedCharacter);

    this.state = "start";
    this.stateTime = 0;
    this.runTime = 0;
    this.scrollSpeed = 185;
    this.difficulty = 0;

    this.score = 0;
    this.scorePulse = 0;

    this.flash = 0;
    this.shake = 0;
    this.time = 0;

    this.particles = [];
    this.scorePops = [];
    this.pausedByVisibility = false;
    this.lastDotBounceSoundAt = -10;
    this.lastPowerpupFlySoundAt = -10;
    this.lastHoverbotLaserSoundAt = -10;
    this.lastScribblePurrAt = -10;
    this.lastLogoShieldBlockAt = -10;
    this.unlockNoticeFamilyId = "";
    this.unlockNoticeTimer = 0;
    this.unlockNoticeQueue = [];
    this.powerupRide = null;
    this.logoShield = null;
    this.motherNatureAura = null;

    this.characterButtons = [];
    this.startButton = { x: GAME_W * 0.5 - 118, y: 600, w: 236, h: 64 };
    this.langEnButton = { x: GAME_W * 0.5 - 118, y: 214, w: 108, h: 34 };
    this.langEsButton = { x: GAME_W * 0.5 + 10, y: 214, w: 108, h: 34 };
    this.resetScoreButton = { x: 28, y: GAME_H - 46, w: 124, h: 28 };
    this.devModeButton = { x: GAME_W - 168, y: GAME_H - 46, w: 140, h: 28 };
    this.replayButton = { x: GAME_W * 0.5 - 110, y: 500, w: 220, h: 62 };
    this.resumeButton = { x: GAME_W * 0.5 - 102, y: 500, w: 204, h: 60 };
    this.devMode = {
      open: false,
      step: "password",
      value: "",
      error: "",
    };

    this.layoutCharacterButtons();
  }

  t(key) {
    return getText(this.language, key);
  }

  isCharacterUnlocked(familyId) {
    const family = getCharacterFamily(familyId);
    if (family.passwordUnlockKey) {
      return this.specialUnlockStore.hasUnlocked(family.passwordUnlockKey);
    }
    return isFamilyUnlocked(this.best, familyId);
  }

  getVisiblePlayableFamilies() {
    return getPlayableFamilyEntries().filter((family) => this.isCharacterUnlocked(family.id));
  }

  getLockedPlayableFamilyIds(bestScore = this.best) {
    return getPlayableFamilyEntries()
      .filter((family) => !family.passwordUnlockKey && family.unlockScore > 0 && !isFamilyUnlocked(bestScore, family.id))
      .map((family) => family.id);
  }

  syncSelectedCharacter() {
    if (this.isCharacterUnlocked(this.selectedCharacter)) {
      return;
    }
    this.selectedCharacter = "clippy";
    this.player.setCharacter(this.selectedCharacter);
  }

  queueUnlockNotice(familyId) {
    if (!familyId) {
      return;
    }
    this.unlockNoticeQueue.push(familyId);
    if (this.unlockNoticeTimer <= 0) {
      this.unlockNoticeFamilyId = this.unlockNoticeQueue.shift() || "";
      this.unlockNoticeTimer = this.unlockNoticeFamilyId ? 4 : 0;
    }
  }

  saveBestScore() {
    writeBestScore(this.best);
  }

  applyBestScore(bestScore, options = {}) {
    const {
      resetUnlockStore = false,
      showUnlockNotices = !resetUnlockStore,
      lockedBefore = this.getLockedPlayableFamilyIds(this.best),
    } = options;

    this.best = Math.max(0, Math.floor(Number(bestScore) || 0));
    this.saveBestScore();

    if (resetUnlockStore) {
      this.unlockStore.reset();
      this.unlockNoticeFamilyId = "";
      this.unlockNoticeTimer = 0;
      this.unlockNoticeQueue.length = 0;
    } else if (showUnlockNotices) {
      for (const family of getPlayableFamilyEntries()) {
        if (family.unlockScore <= 0) {
          continue;
        }
        if (!lockedBefore.includes(family.id)) {
          continue;
        }
        if (this.isCharacterUnlocked(family.id) && !this.unlockStore.hasSeen(family.id)) {
          this.unlockStore.markSeen(family.id);
          this.queueUnlockNotice(family.id);
        }
      }
    }

    this.syncSelectedCharacter();
    this.layoutCharacterButtons();
  }

  resetBestScore() {
    this.applyBestScore(0, {
      resetUnlockStore: true,
      showUnlockNotices: false,
    });
  }

  openPasswordMode() {
    this.devMode.open = true;
    this.devMode.step = "password";
    this.devMode.value = "";
    this.devMode.error = "";
    this.audio.ui();
    return true;
  }

  closePasswordMode() {
    this.devMode.open = false;
    this.devMode.step = "password";
    this.devMode.value = "";
    this.devMode.error = "";
  }

  getPasswordModeLayout() {
    const panelW = 308;
    const panelH = 252;
    const panelX = (GAME_W - panelW) * 0.5;
    const panelY = 228;
    return {
      panel: { x: panelX, y: panelY, w: panelW, h: panelH },
      field: { x: panelX + 24, y: panelY + 104, w: panelW - 48, h: 46 },
      cancel: { x: panelX + 24, y: panelY + 186, w: 116, h: 40 },
      submit: { x: panelX + panelW - 140, y: panelY + 186, w: 116, h: 40 },
    };
  }

  submitPasswordMode() {
    const trimmed = String(this.devMode.value || "").trim();

    if (this.devMode.step === "password") {
      if (trimmed === DEV_STATIC_LOGO_PASSWORD) {
        const wasUnlocked = this.specialUnlockStore.hasUnlocked("staticLogo");
        this.specialUnlockStore.unlock("staticLogo");
        this.selectedCharacter = "staticLogo";
        this.player.setCharacter(this.selectedCharacter);
        this.layoutCharacterButtons();
        if (!wasUnlocked && !this.unlockStore.hasSeen("staticLogo")) {
          this.unlockStore.markSeen("staticLogo");
          this.queueUnlockNotice("staticLogo");
        }
        this.closePasswordMode();
        this.audio.ui();
        return true;
      }

      if (trimmed !== DEV_BEST_SCORE_PASSWORD) {
        this.devMode.error = this.t("devPasswordError");
        return false;
      }
      this.devMode.step = "score";
      this.devMode.value = String(this.best);
      this.devMode.error = "";
      this.audio.ui();
      return true;
    }

    if (!/^\d+$/.test(trimmed)) {
      this.devMode.error = this.t("devBestInvalid");
      return false;
    }

    this.applyBestScore(Number.parseInt(trimmed, 10));
    this.closePasswordMode();
    this.audio.ui();
    return true;
  }

  handlePasswordModePointer(point) {
    const layout = this.getPasswordModeLayout();
    if (this.isInButton(point, layout.cancel)) {
      this.closePasswordMode();
      this.audio.ui();
      return true;
    }
    if (this.isInButton(point, layout.submit)) {
      this.submitPasswordMode();
      return true;
    }
    return this.isInButton(point, layout.panel);
  }

  handleKeyDown(event) {
    if (!this.devMode.open) {
      return false;
    }

    const key = event.key;
    if (key === "Escape") {
      this.closePasswordMode();
      this.audio.ui();
      return true;
    }
    if (key === "Enter") {
      this.submitPasswordMode();
      return true;
    }
    if (key === "Backspace") {
      this.devMode.value = this.devMode.value.slice(0, -1);
      this.devMode.error = "";
      return true;
    }
    if (key === "Tab") {
      return true;
    }
    if (key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
      if (this.devMode.step === "password") {
        if (this.devMode.value.length < 24) {
          this.devMode.value += key;
        }
      } else if (/\d/.test(key) && this.devMode.value.length < 5) {
        this.devMode.value += key;
      }
      this.devMode.error = "";
      return true;
    }
    return true;
  }

  isInButton(point, button) {
    if (!point || !button) {
      return false;
    }
    return point.x >= button.x
      && point.x <= button.x + button.w
      && point.y >= button.y
      && point.y <= button.y + button.h;
  }

  playPlayerJumpSound() {
    if (this.player.character === "scribble") {
      this.audio.scribblePurr();
    } else {
      this.audio.flap();
    }
  }

  isOfficeHazardEntity(entity) {
    return entity && entity.roleType === "obstacleType";
  }

  getCharacterSelectLayout(screen = this.state) {
    const count = this.getVisiblePlayableFamilies().length;
    const multiRow = count >= 5;
    if (screen === "gameover") {
      return multiRow
        ? {
          rowY: 454,
          titleY: 438,
          maxWidth: GAME_W - 94,
          rowGap: 78,
          rows: 2,
          panelY: 126,
          panelH: 572,
          replayY: 620,
        }
        : {
          rowY: 460,
          titleY: 444,
          maxWidth: GAME_W - 76,
          rowGap: 0,
          rows: 1,
          panelY: 138,
          panelH: 500,
          replayY: 548,
        };
    }
    return multiRow
      ? {
        rowY: 480,
        titleY: 464,
        maxWidth: GAME_W - 94,
        rowGap: 68,
        rows: 2,
        panelY: 64,
        panelH: 640,
        startY: 632,
        bestY: 706,
      }
      : {
        rowY: 500,
        titleY: 484,
        maxWidth: GAME_W - 56,
        rowGap: 0,
        rows: 1,
        panelY: 76,
        panelH: 592,
        startY: 600,
        bestY: 696,
      };
  }

  layoutCharacterButtons(rowY, maxWidth, rowGap, rows) {
    const families = this.getVisiblePlayableFamilies();
    const count = Math.max(1, families.length);
    const resolvedRowY = Number.isFinite(rowY) ? rowY : this.getCharacterSelectLayout().rowY;
    const resolvedMaxWidth = Number.isFinite(maxWidth) ? maxWidth : this.getCharacterSelectLayout().maxWidth;
    const resolvedRows = Number.isFinite(rows) ? rows : (count >= 5 ? 2 : 1);

    if (resolvedRows <= 1) {
      const gap = count >= 6 ? 4 : (count >= 5 ? 6 : (count === 4 ? 8 : 12));
      const buttonW = clamp(
        Math.floor((resolvedMaxWidth - gap * (count - 1)) / count),
        54,
        92
      );
      const buttonH = buttonW <= 58 ? 74 : (buttonW <= 66 ? 76 : 82);
      const totalW = count * buttonW + (count - 1) * gap;
      const startX = (GAME_W - totalW) * 0.5;

      this.characterButtons = families.map((family, index) => ({
        familyId: family.id,
        x: startX + index * (buttonW + gap),
        y: resolvedRowY,
        w: buttonW,
        h: buttonH,
      }));
      return;
    }

    const topCount = Math.ceil(count / 2);
    const bottomCount = count - topCount;
    const maxRowCount = Math.max(topCount, bottomCount || 0);
    const gap = maxRowCount >= 4 ? 6 : 10;
    const buttonW = clamp(
      Math.floor((resolvedMaxWidth - gap * (maxRowCount - 1)) / maxRowCount),
      56,
      74
    );
    const buttonH = 68;
    const resolvedRowGap = Number.isFinite(rowGap) ? rowGap : 76;

    const mapRow = (rowFamilies, rowIndex) => {
      const totalW = rowFamilies.length * buttonW + Math.max(0, rowFamilies.length - 1) * gap;
      const startX = (GAME_W - totalW) * 0.5;
      return rowFamilies.map((family, index) => ({
        familyId: family.id,
        x: startX + index * (buttonW + gap),
        y: resolvedRowY + rowIndex * resolvedRowGap,
        w: buttonW,
        h: buttonH,
      }));
    };

    this.characterButtons = [
      ...mapRow(families.slice(0, topCount), 0),
      ...mapRow(families.slice(topCount), 1),
    ];
  }

  getCharacterButtonForFamily(familyId) {
    return this.characterButtons.find((button) => button.familyId === familyId) || null;
  }

  selectCharacter(familyId) {
    if (!this.isCharacterUnlocked(familyId)) {
      return false;
    }
    this.selectedCharacter = familyId;
    this.player.setCharacter(this.selectedCharacter);
    return true;
  }

  startScribbleRide() {
    this.powerupRide = {
      kind: "scribble",
      state: "carrying",
      animT: rand(0, 2),
      jumpTimer: 0,
      jumpDuration: 0.64,
      jumpHeight: 122,
      obstaclesRemaining: 5,
      x: this.player.x + 20,
      y: this.player.y + 18,
      playerY: this.player.y,
      vx: 0,
      vy: 0,
      sparkleTimer: 0,
    };
    this.player.targetX = GAME_W * 0.5;
  }

  startWillRide() {
    const { minY, maxY } = this.getWillRideVerticalBounds();
    const initialTargetY = clamp(this.player.y - 8, minY, maxY);
    this.powerupRide = {
      kind: "will",
      state: "carrying",
      timer: 15,
      duration: 15,
      animT: rand(0, 2),
      x: this.player.x + 10,
      y: this.player.y + 18,
      playerY: initialTargetY,
      targetY: initialTargetY,
      featherRotation: -0.16,
      sparkleTimer: 0,
      vx: 0,
      vy: 0,
    };
    this.audio.featherRideStart();
    this.player.targetX = GAME_W * 0.5;
  }

  hasActiveProtectiveRide() {
    return Boolean(this.powerupRide && this.powerupRide.state === "carrying" && this.powerupRide.kind === "scribble");
  }

  hasActiveLogoShield() {
    return Boolean(this.logoShield && this.logoShield.timer > 0);
  }

  hasActiveMotherNatureAura() {
    return Boolean(this.motherNatureAura && this.motherNatureAura.timer > 0);
  }

  getLogoShieldPosition() {
    if (!this.logoShield) {
      return null;
    }
    const shield = this.logoShield;
    return {
      x: this.player.x + Math.cos(shield.orbitAngle) * shield.orbitRadius,
      y: this.player.y - 6 + Math.sin(shield.orbitAngle * 1.18) * shield.orbitHeight,
    };
  }

  getMotherNatureAuraPosition() {
    if (!this.motherNatureAura) {
      return null;
    }
    const aura = this.motherNatureAura;
    return {
      x: this.player.x + Math.cos(aura.orbitAngle) * aura.orbitRadius,
      y: this.player.y - 10 + Math.sin(aura.orbitAngle * 1.07) * aura.orbitHeight,
    };
  }

  startLogoShield() {
    this.logoShield = {
      timer: 20,
      duration: 20,
      orbitAngle: rand(0, Math.PI * 2),
      orbitRadius: 58,
      orbitHeight: 26,
      rotation: rand(0, Math.PI * 2),
      spinSpeed: rand(4.4, 6.2),
      spinDirection: Math.random() < 0.5 ? -1 : 1,
      flipMode: Math.random() < 0.45,
      flipPhase: rand(0, Math.PI * 2),
      axisScaleX: 1,
      sparkleTimer: 0,
      soundTimer: 0.82,
    };
    this.audio.logoShieldStart();
  }

  startMotherNatureAura() {
    this.motherNatureAura = {
      timer: 15,
      duration: 15,
      orbitAngle: rand(0, Math.PI * 2),
      orbitRadius: 62,
      orbitHeight: 24,
      animT: rand(0, 2.4),
      flowerTimer: 0,
      soundTimer: 0.8,
    };
    this.audio.natureStart();
  }

  finishScribbleRide() {
    if (!this.powerupRide || this.powerupRide.state !== "carrying" || this.powerupRide.kind !== "scribble") {
      return;
    }

    this.player.x = GAME_W * 0.5;
    this.player.targetX = GAME_W * 0.5;
    this.player.y = 336;
    this.player.vy = 0;
    this.player.rotation = 0;
    this.obstacles.clearUpcomingHazards(2, this.player.x);

    this.powerupRide.state = "exiting";
    this.powerupRide.x = this.player.x + 22;
    this.powerupRide.y = this.player.y + 20;
    this.powerupRide.vx = 110;
    this.powerupRide.vy = -360;
  }

  finishWillRide() {
    if (!this.powerupRide || this.powerupRide.state !== "carrying" || this.powerupRide.kind !== "will") {
      return;
    }

    const ride = this.powerupRide;
    ride.state = "exiting";
    ride.vx = 140;
    ride.vy = -220;
  }

  getWillRideVerticalBounds() {
    return {
      minY: CEILING_Y + 72,
      maxY: GROUND_Y - 122,
    };
  }

  intersectSafeIntervals(intervals, safeTop, safeBottom) {
    const next = [];
    for (let i = 0; i < intervals.length; i += 1) {
      const interval = intervals[i];
      const top = Math.max(interval.top, safeTop);
      const bottom = Math.min(interval.bottom, safeBottom);
      if (bottom - top >= 18) {
        next.push({ top, bottom });
      }
    }
    return next;
  }

  subtractUnsafeInterval(intervals, unsafeTop, unsafeBottom) {
    const next = [];
    for (let i = 0; i < intervals.length; i += 1) {
      const interval = intervals[i];
      if (unsafeBottom <= interval.top || unsafeTop >= interval.bottom) {
        next.push(interval);
        continue;
      }
      if (unsafeTop - interval.top >= 18) {
        next.push({ top: interval.top, bottom: unsafeTop });
      }
      if (interval.bottom - unsafeBottom >= 18) {
        next.push({ top: unsafeBottom, bottom: interval.bottom });
      }
    }
    return next;
  }

  pickWillRideSideTarget(currentY, blockTop, blockBottom, minY, maxY) {
    const options = [];
    if (blockTop - minY >= 18) {
      options.push((minY + blockTop) * 0.5);
    }
    if (maxY - blockBottom >= 18) {
      options.push((blockBottom + maxY) * 0.5);
    }
    if (options.length === 0) {
      return clamp(currentY, minY, maxY);
    }
    return options.reduce((best, option) =>
      Math.abs(option - currentY) < Math.abs(best - currentY) ? option : best,
    options[0]);
  }

  getWillRideTargetY(currentY) {
    const { minY, maxY } = this.getWillRideVerticalBounds();
    const fallbackY = clamp(currentY, minY, maxY);
    const playerX = GAME_W * 0.5;
    const playerRadius = Math.max(12, this.player.hitRadius - 1);
    const padding = 16;
    const lookAhead = 235 + this.scrollSpeed * 0.9;
    const lookBehind = playerRadius + 22;
    const relevantObstacles = this.obstacles.items
      .filter((item) =>
        !item.passed
        && item.x + (item.width || 0) >= playerX - lookBehind
        && item.x <= playerX + lookAhead)
      .sort((a, b) => a.x - b.x)
      .slice(0, 4);

    if (relevantObstacles.length === 0) {
      return fallbackY;
    }

    let safeIntervals = [{ top: minY, bottom: maxY }];
    for (let i = 0; i < relevantObstacles.length; i += 1) {
      const obstacle = relevantObstacles[i];
      if (obstacle.roleType === "obstacleType") {
        const inset = obstacle.profile?.gapInset ?? gapInsetForKind(obstacle.kind);
        const safeTop = clamp(obstacle.gapTop + inset + playerRadius + padding, minY, maxY);
        const safeBottom = clamp(obstacle.gapBottom - inset - playerRadius - padding, minY, maxY);
        safeIntervals = this.intersectSafeIntervals(safeIntervals, safeTop, safeBottom);
      } else if (obstacle.contentId === "dot") {
        const blockRadius = obstacle.dotRadius + playerRadius + 10;
        safeIntervals = this.subtractUnsafeInterval(
          safeIntervals,
          obstacle.dotY - blockRadius,
          obstacle.dotY + blockRadius
        );
      } else if (obstacle.contentId === "powerpup") {
        const blockRadius = obstacle.powerpupRadius + playerRadius + 10;
        safeIntervals = this.subtractUnsafeInterval(
          safeIntervals,
          obstacle.powerpupY - blockRadius,
          obstacle.powerpupY + blockRadius
        );
      } else if (obstacle.contentId === "hoverbot") {
        const bodyRadius = obstacle.hoverbotHeight * 0.44 + playerRadius + 10;
        let blockTop = obstacle.hoverbotY - bodyRadius;
        let blockBottom = obstacle.hoverbotY + bodyRadius;
        if (obstacle.hoverbotLaserState !== "idle" || obstacle.x <= playerX + 150) {
          const eyeY = OBSTACLE_HELPERS.getHoverbotEyeY(obstacle);
          const laserRadius = playerRadius + 16;
          blockTop = Math.min(blockTop, eyeY - laserRadius);
          blockBottom = Math.max(blockBottom, eyeY + laserRadius);
        }
        safeIntervals = this.subtractUnsafeInterval(safeIntervals, blockTop, blockBottom);
      }

      if (safeIntervals.length === 0) {
        break;
      }
    }

    if (safeIntervals.length === 0) {
      const obstacle = relevantObstacles[0];
      if (obstacle?.roleType === "obstacleType") {
        const inset = obstacle.profile?.gapInset ?? gapInsetForKind(obstacle.kind);
        return clamp((obstacle.gapTop + inset + obstacle.gapBottom - inset) * 0.5, minY, maxY);
      }
      if (obstacle?.contentId === "dot") {
        const radius = obstacle.dotRadius + playerRadius + 10;
        return this.pickWillRideSideTarget(fallbackY, obstacle.dotY - radius, obstacle.dotY + radius, minY, maxY);
      }
      if (obstacle?.contentId === "powerpup") {
        const radius = obstacle.powerpupRadius + playerRadius + 10;
        return this.pickWillRideSideTarget(
          fallbackY,
          obstacle.powerpupY - radius,
          obstacle.powerpupY + radius,
          minY,
          maxY
        );
      }
      if (obstacle?.contentId === "hoverbot") {
        const bodyRadius = obstacle.hoverbotHeight * 0.44 + playerRadius + 10;
        return this.pickWillRideSideTarget(
          fallbackY,
          obstacle.hoverbotY - bodyRadius,
          obstacle.hoverbotY + bodyRadius,
          minY,
          maxY
        );
      }
      return fallbackY;
    }

    const bestInterval = safeIntervals.reduce((best, interval) => {
      const center = (interval.top + interval.bottom) * 0.5;
      const span = interval.bottom - interval.top;
      const score = Math.abs(center - fallbackY) - span * 0.08;
      if (!best || score < best.score) {
        return { interval, score };
      }
      return best;
    }, null);

    return clamp((bestInterval.interval.top + bestInterval.interval.bottom) * 0.5, minY, maxY);
  }

  spawnLogoShieldSparkles(x, y) {
    const sparkleColors = ["#55b8ff", "#ff6f70", "#6fe594", "#ffd85b"];
    for (let i = 0; i < sparkleColors.length; i += 1) {
      this.particles.push(
        new SparkleParticle(
          x + rand(-18, 18),
          y + rand(-18, 18),
          rand(-48, 48),
          rand(-54, 54),
          rand(5, 8),
          rand(0.22, 0.34),
          sparkleColors[i]
        )
      );
    }
    if (this.particles.length > 360) {
      this.particles.splice(0, this.particles.length - 360);
    }
  }

  spawnFlowerPetals(x, y, count, driftScale = 1) {
    const palette = [
      ["#ffe6f4", "#f2bf3d"],
      ["#ffe29c", "#f3a443"],
      ["#d8f6ff", "#f5c743"],
      ["#f4ddff", "#f6d251"],
      ["#e2ffd7", "#f6c746"],
    ];
    const total = Number.isFinite(count) ? count : 5;
    for (let i = 0; i < total; i += 1) {
      const pair = palette[Math.floor(rand(0, palette.length))];
      this.particles.push(
        new FlowerParticle(
          x + rand(-18, 18),
          y + rand(-14, 14),
          rand(-26, 26) * driftScale,
          rand(28, 74) * driftScale,
          rand(5.5, 8.5),
          rand(0.6, 1),
          pair[0],
          pair[1]
        )
      );
    }
    if (this.particles.length > 420) {
      this.particles.splice(0, this.particles.length - 420);
    }
  }

  updateLogoShield(dt) {
    if (!this.logoShield) {
      return;
    }

    const shield = this.logoShield;
    shield.timer = Math.max(0, shield.timer - dt);
    if (shield.timer <= 0) {
      this.logoShield = null;
      return;
    }

    shield.orbitAngle += dt * 4.7;
    shield.rotation += dt * shield.spinSpeed * shield.spinDirection;
    if (shield.flipMode) {
      shield.flipPhase += dt * 6.4;
      shield.axisScaleX = Math.cos(shield.flipPhase);
      if (Math.abs(shield.axisScaleX) < 0.1) {
        shield.axisScaleX = 0.1 * Math.sign(shield.axisScaleX || 1);
      }
    } else {
      shield.axisScaleX = 1;
    }

    shield.sparkleTimer -= dt;
    while (shield.sparkleTimer <= 0) {
      shield.sparkleTimer += rand(0.05, 0.08);
      const logoPos = this.getLogoShieldPosition();
      if (logoPos) {
        this.spawnLogoShieldSparkles(logoPos.x, logoPos.y);
      }
      this.spawnLogoShieldSparkles(this.player.x, this.player.y);
    }

    shield.soundTimer -= dt;
    while (shield.soundTimer <= 0) {
      shield.soundTimer += rand(0.72, 1.02);
      this.audio.logoShieldPulse(shield.timer / shield.duration);
    }
  }

  updateMotherNatureAura(dt) {
    if (!this.motherNatureAura) {
      return;
    }

    const aura = this.motherNatureAura;
    aura.timer = Math.max(0, aura.timer - dt);
    if (aura.timer <= 0) {
      this.motherNatureAura = null;
      return;
    }

    aura.orbitAngle += dt * 2.2;
    aura.animT += dt;

    aura.flowerTimer -= dt;
    while (aura.flowerTimer <= 0) {
      aura.flowerTimer += rand(0.1, 0.16);
      const auraPos = this.getMotherNatureAuraPosition();
      if (auraPos) {
        this.spawnFlowerPetals(auraPos.x, auraPos.y, 3, 1);
      }
      this.spawnFlowerPetals(this.player.x, this.player.y + 4, 3, 1.1);
    }

    aura.soundTimer -= dt;
    while (aura.soundTimer <= 0) {
      aura.soundTimer += rand(0.72, 1.02);
      this.audio.naturePulse(aura.timer / aura.duration);
    }
  }

  spawnRideSparkles(x, y) {
    const sparkleColors = ["#fff7bf", "#d7f6ff", "#ffffff", "#ffe1ff"];
    for (let i = 0; i < 4; i += 1) {
      this.particles.push(
        new SparkleParticle(
          x + rand(-28, 2),
          y + rand(-26, 12),
          -this.scrollSpeed - rand(60, 125),
          rand(-20, 22),
          rand(7, 11),
          rand(0.28, 0.42),
          sparkleColors[i % sparkleColors.length]
        )
      );
    }
    if (this.particles.length > 340) {
      this.particles.splice(0, this.particles.length - 340);
    }
  }

  updatePowerupRide(dt) {
    if (!this.powerupRide) {
      return 0;
    }

    const ride = this.powerupRide;
    ride.animT += dt;

    if (ride.state === "carrying" && ride.kind === "scribble") {
      ride.jumpTimer += dt;
      let jumpCount = 0;
      while (ride.jumpTimer >= ride.jumpDuration) {
        ride.jumpTimer -= ride.jumpDuration;
        jumpCount += 1;
      }

      const jumpArc = Math.sin(clamp(ride.jumpTimer / ride.jumpDuration, 0, 1) * Math.PI);
      const playerX = GAME_W * 0.5;
      ride.x = playerX + 20;
      ride.y = 404 - jumpArc * ride.jumpHeight;
      ride.playerY = ride.y - 32;
      this.player.updateRide(dt, playerX, ride.playerY, "scribble");

      ride.sparkleTimer -= dt;
      while (ride.sparkleTimer <= 0) {
        ride.sparkleTimer += rand(0.045, 0.075);
        this.spawnRideSparkles(ride.x + 6, ride.y - 12);
      }

      return jumpCount;
    }

    if (ride.state === "carrying" && ride.kind === "will") {
      ride.timer = Math.max(0, ride.timer - dt);
      const desiredY = this.getWillRideTargetY(ride.playerY);
      ride.targetY = desiredY;
      ride.playerY = lerp(ride.playerY, desiredY, 1 - Math.exp(-dt * 6.6));
      const playerX = GAME_W * 0.5;
      ride.x = playerX + 8;
      ride.y = ride.playerY + 20 + Math.sin(ride.animT * 3.4) * 4;
      const steering = clamp((desiredY - ride.playerY) / 88, -1, 1);
      ride.featherRotation = -0.12 + steering * 0.2 + Math.sin(ride.animT * 2.7) * 0.05;
      this.player.updateRide(dt, playerX, ride.playerY, "will");

      ride.sparkleTimer -= dt;
      while (ride.sparkleTimer <= 0) {
        ride.sparkleTimer += rand(0.08, 0.13);
        this.spawnRideSparkles(ride.x + 6, ride.y - 10);
      }

      if (ride.timer <= 0) {
        this.finishWillRide();
      }
      return 0;
    }

    ride.x += ride.vx * dt;
    ride.y += ride.vy * dt;
    ride.vy -= 620 * dt;
    if (ride.y + 80 < -40 || ride.x - 80 > GAME_W + 160) {
      this.powerupRide = null;
    }
    return 0;
  }

  spawnFlapParticles() {
    for (let i = 0; i < 7; i += 1) {
      this.particles.push(
        new Particle(
          this.player.x - 28,
          this.player.y + rand(-8, 10),
          rand(-110, -35),
          rand(-40, 40),
          rand(1.8, 3.2),
          rand(0.18, 0.32),
          "#e8f2ff",
          55
        )
      );
    }
    if (this.particles.length > 220) {
      this.particles.splice(0, this.particles.length - 220);
    }
  }

  spawnCrashParticles() {
    for (let i = 0; i < 26; i += 1) {
      const hue = i % 2 === 0 ? "#dfe8f5" : "#adb9cc";
      this.particles.push(
        new Particle(
          this.player.x + rand(-8, 8),
          this.player.y + rand(-8, 8),
          rand(-200, 240),
          rand(-260, 130),
          rand(2.2, 4.8),
          rand(0.34, 0.7),
          hue,
          790
        )
      );
    }
    this.particles.push(
      new Particle(this.player.x, this.player.y, rand(-120, 180), rand(-180, -120), 7, 0.35, "#ffdbd3", 720)
    );
    if (this.particles.length > 260) {
      this.particles.splice(0, this.particles.length - 260);
    }
  }

  beginRun() {
    if (!this.isCharacterUnlocked(this.selectedCharacter)) {
      this.selectedCharacter = "clippy";
    }
    this.player.setCharacter(this.selectedCharacter);
    this.state = "running";
    this.stateTime = 0;
    this.runTime = 0;
    this.score = 0;
    this.scorePulse = 0;
    this.scrollSpeed = 185;
    this.difficulty = 0;
    this.flash = 0;
    this.shake = 0;
    this.particles.length = 0;
    this.scorePops.length = 0;
    this.obstacles.reset();
    this.powerups.reset();
    this.powerupRide = null;
    this.logoShield = null;
    this.motherNatureAura = null;
    this.player.reset();
    this.pausedByVisibility = false;
    this.lastScribblePurrAt = -10;
    this.lastLogoShieldBlockAt = -10;
  }

  victory() {
    if (this.state !== "running") {
      return;
    }

    const lockedBefore = this.getLockedPlayableFamilyIds(this.best);
    this.state = "victory";
    this.stateTime = 0;
    this.flash = 0.3;
    this.shake = 0;
    this.powerups.reset();
    this.powerupRide = null;
    this.logoShield = null;
    this.motherNatureAura = null;
    this.player.reset();

    if (this.score > this.best) {
      this.applyBestScore(this.score, { lockedBefore });
    }
  }

  crash() {
    if (this.state !== "running") {
      return;
    }

    const lockedBefore = this.getLockedPlayableFamilyIds(this.best);

    this.state = "gameover";
    this.stateTime = 0;
    this.flash = 0.86;
    this.shake = 14;
    this.audio.crash();
    this.spawnCrashParticles();
    this.powerups.reset();
    this.powerupRide = null;
    this.logoShield = null;
    this.motherNatureAura = null;

    if (this.score > this.best) {
      this.applyBestScore(this.score, { lockedBefore });
      return;
    }

    this.layoutCharacterButtons();
  }

  pause(fromVisibility) {
    if (this.state !== "running") {
      return;
    }
    this.state = "paused";
    this.stateTime = 0;
    this.pausedByVisibility = !!fromVisibility;
  }

  resume() {
    if (this.state !== "paused") {
      return;
    }
    this.state = "running";
    this.stateTime = 0;
    this.pausedByVisibility = false;
  }

  handlePrimaryAction(point, fromKeyboard) {
    this.audio.unlock();

    if (this.devMode.open) {
      if (point) {
        this.handlePasswordModePointer(point);
      }
      return;
    }

    if (this.state === "running") {
      if (this.powerupRide && this.powerupRide.state === "carrying") {
        return;
      }
      this.player.flap();
      this.playPlayerJumpSound();
      this.spawnFlapParticles();
      return;
    }

    if (this.state === "start") {
      const layout = this.getCharacterSelectLayout("start");
      this.layoutCharacterButtons(layout.rowY, layout.maxWidth, layout.rowGap, layout.rows);
      this.startButton.x = GAME_W * 0.5 - 118;
      this.startButton.y = layout.startY;
      this.startButton.w = 236;
      this.startButton.h = 64;
      this.devModeButton.x = GAME_W - 168;
      this.devModeButton.y = GAME_H - 46;
      this.devModeButton.w = 140;
      this.devModeButton.h = 28;
      if (point) {
        if (this.isInButton(point, this.resetScoreButton)) {
          this.resetBestScore();
          this.audio.ui();
          return;
        }
        if (this.isInButton(point, this.devModeButton)) {
          this.openPasswordMode();
          return;
        }
        if (this.isInButton(point, this.langEnButton)) {
          if (this.language !== "en") {
            this.language = "en";
            this.audio.ui();
          }
          return;
        }
        if (this.isInButton(point, this.langEsButton)) {
          if (this.language !== "es") {
            this.language = "es";
            this.audio.ui();
          }
          return;
        }

        for (const button of this.characterButtons) {
          if (this.isInButton(point, button)) {
            if (this.selectCharacter(button.familyId)) {
              this.audio.ui();
            }
            return;
          }
        }
      }

      if (!point || this.isInButton(point, this.startButton) || fromKeyboard) {
        this.beginRun();
        this.player.flap();
        this.playPlayerJumpSound();
        this.spawnFlapParticles();
      }
      return;
    }

    if (this.state === "paused") {
      if (!point || this.isInButton(point, this.resumeButton) || fromKeyboard) {
        this.audio.ui();
        this.resume();
      }
      return;
    }

    if (this.state === "gameover" && this.stateTime > 0.2) {
      const layout = this.getCharacterSelectLayout("gameover");
      this.layoutCharacterButtons(layout.rowY, layout.maxWidth, layout.rowGap, layout.rows);
      this.replayButton.x = GAME_W * 0.5 - 110;
      this.replayButton.y = layout.replayY;
      this.replayButton.w = 220;
      this.replayButton.h = 62;
      this.devModeButton.x = GAME_W * 0.5 - 70;
      this.devModeButton.y = layout.replayY + 70;
      this.devModeButton.w = 140;
      this.devModeButton.h = 24;
      if (point) {
        for (const button of this.characterButtons) {
          if (this.isInButton(point, button)) {
            if (this.selectCharacter(button.familyId)) {
              this.audio.ui();
            }
            return;
          }
        }
        if (this.isInButton(point, this.devModeButton)) {
          this.openPasswordMode();
          return;
        }
      }
      if (!point || this.isInButton(point, this.replayButton) || fromKeyboard) {
        this.audio.ui();
        this.beginRun();
        this.player.flap();
        this.playPlayerJumpSound();
        this.spawnFlapParticles();
      }
      return;
    }

    if (this.state === "victory" && this.stateTime > 0.2) {
      this.replayButton.x = GAME_W * 0.5 - 110;
      this.replayButton.y = 618;
      this.replayButton.w = 220;
      this.replayButton.h = 62;
      if (!point || this.isInButton(point, this.replayButton) || fromKeyboard) {
        this.audio.ui();
        this.beginRun();
        this.player.flap();
        this.playPlayerJumpSound();
        this.spawnFlapParticles();
      }
    }
  }

  handlePauseToggle() {
    if (this.state === "running") {
      this.pause(false);
    } else if (this.state === "paused") {
      this.resume();
    }
  }

  updateParticles(dt) {
    for (let i = 0; i < this.particles.length; i += 1) {
      this.particles[i].update(dt);
    }
    this.particles = this.particles.filter((particle) => particle.life > 0);
  }

  updateScorePops(dt) {
    for (let i = 0; i < this.scorePops.length; i += 1) {
      this.scorePops[i].update(dt);
    }
    this.scorePops = this.scorePops.filter((pop) => pop.life > 0);
  }

  update(dt, t) {
    this.time = t;
    this.stateTime += dt;
    this.scorePulse = Math.max(0, this.scorePulse - dt * 4.4);
    this.shake = Math.max(0, this.shake - dt * 29);
    this.flash = Math.max(0, this.flash - dt * 2.6);

    if (this.unlockNoticeTimer > 0) {
      this.unlockNoticeTimer = Math.max(0, this.unlockNoticeTimer - dt);
      if (this.unlockNoticeTimer <= 0) {
        this.unlockNoticeFamilyId = "";
        if (this.unlockNoticeQueue.length > 0) {
          this.unlockNoticeFamilyId = this.unlockNoticeQueue.shift() || "";
          this.unlockNoticeTimer = this.unlockNoticeFamilyId ? 4 : 0;
        }
      }
    }

    this.updateParticles(dt);
    this.updateScorePops(dt);

    if (this.state === "start") {
      this.background.update(dt, 95, t);
      this.player.targetX = this.player.defaultX;
      this.player.idle(dt);
      this.obstacles.update(dt, 100, 0, false);
      return;
    }

    if (this.state === "paused") {
      return;
    }

    if (this.state === "running") {
      this.runTime += dt;
      this.updateLogoShield(dt);
      this.updateMotherNatureAura(dt);
      this.difficulty = clamp((this.runTime + this.score * 1.9) / 95, 0, 1.35);
      const carryActive = Boolean(this.powerupRide && this.powerupRide.state === "carrying");
      const speedRideActive = Boolean(carryActive && this.powerupRide.kind === "scribble");
      const protectiveRide = this.hasActiveProtectiveRide();
      const shieldActive = this.hasActiveLogoShield();
      const natureActive = this.hasActiveMotherNatureAura();
      const baseSpeed = 185 + Math.min(this.difficulty, 1.2) * 125;
      this.scrollSpeed = (baseSpeed + (speedRideActive ? 72 : 0)) * (natureActive ? 0.8 : 1);

      this.background.update(dt, this.scrollSpeed, t);
      this.player.targetX = (carryActive || this.obstacles.skipSpawnCount > 0)
        ? GAME_W * 0.5
        : this.player.defaultX;

      let rideJumpCount = 0;
      if (carryActive) {
        rideJumpCount = this.updatePowerupRide(dt);
      } else {
        this.player.update(dt);
        rideJumpCount = this.updatePowerupRide(dt);
      }

      const powerupAudio = this.powerups.update(
        dt,
        this.scrollSpeed,
        this.difficulty,
        !this.powerupRide && !shieldActive && !natureActive,
        this.player,
        this.obstacles
      );
      if (powerupAudio.pickedUp) {
        if (powerupAudio.pickedUp.family.id === "scribble") {
          this.startScribbleRide();
        } else if (powerupAudio.pickedUp.family.id === "logo") {
          this.startLogoShield();
        } else if (powerupAudio.pickedUp.family.id === "motherNature") {
          this.startMotherNatureAura();
        } else if (powerupAudio.pickedUp.family.id === "will") {
          this.startWillRide();
        }
      }

      const obstacleAudio = this.obstacles.update(
        dt,
        this.scrollSpeed,
        this.difficulty,
        true,
        powerupAudio.spawnedItems
      );
      if (obstacleAudio.dotBounceCount > 0 && t - this.lastDotBounceSoundAt > 0.08) {
        this.audio.dotBounce();
        this.lastDotBounceSoundAt = t;
      }
      if (obstacleAudio.powerpupTakeoffCount > 0 && t - this.lastPowerpupFlySoundAt > 0.12) {
        this.audio.powerpupFly();
        this.lastPowerpupFlySoundAt = t;
      }
      if (obstacleAudio.hoverbotLaserShotCount > 0 && t - this.lastHoverbotLaserSoundAt > 0.08) {
        this.audio.hoverbotLaser();
        this.lastHoverbotLaserSoundAt = t;
      }
      if ((powerupAudio.jumpCount + rideJumpCount) > 0 && t - this.lastScribblePurrAt > 0.12) {
        this.audio.scribblePurr();
        this.lastScribblePurrAt = t;
      }

      for (let i = 0; i < this.obstacles.items.length; i += 1) {
        const item = this.obstacles.items[i];
        if (!item.passed && item.x + item.width < this.player.x - this.player.hitRadius) {
          item.passed = true;
          this.score += 1;
          this.scorePulse = 1;
          this.audio.score();
          this.scorePops.push(new ScorePop(78, 84, "+1"));
          if (this.scorePops.length > 6) {
            this.scorePops.shift();
          }
          if (this.powerupRide
            && this.powerupRide.state === "carrying"
            && this.powerupRide.kind === "scribble"
            && this.isOfficeHazardEntity(item)) {
            this.powerupRide.obstaclesRemaining = Math.max(0, this.powerupRide.obstaclesRemaining - 1);
            if (this.powerupRide.obstaclesRemaining <= 0) {
              this.finishScribbleRide();
            }
          }
          if (this.score >= 40) {
            this.victory();
            return;
          }
        }
      }

      const hitObstacle = this.obstacles.collides(this.player);
      const hitGround = this.player.y + this.player.hitRadius >= GROUND_Y - 1;
      const alwaysInvincible = this.player.character === "staticLogo";
      const shieldActiveNow = this.hasActiveLogoShield() || alwaysInvincible;
      const autoPilotRideActive = Boolean(carryActive && this.powerupRide && this.powerupRide.kind === "will");

      if (shieldActiveNow && hitObstacle && t - this.lastLogoShieldBlockAt > 0.12) {
        const logoPos = this.getLogoShieldPosition();
        this.audio.logoShieldBlock();
        this.lastLogoShieldBlockAt = t;
        if (logoPos && this.hasActiveLogoShield()) {
          this.spawnLogoShieldSparkles(logoPos.x, logoPos.y);
        }
        this.spawnLogoShieldSparkles(this.player.x, this.player.y);
      }

      if (shieldActiveNow) {
        if (hitGround) {
          this.player.y = GROUND_Y - this.player.hitRadius - 1;
          this.player.vy = Math.min(this.player.vy, -220);
          this.player.rotation = Math.min(this.player.rotation, 0.12);
        }
      } else if ((!protectiveRide && !autoPilotRideActive && hitObstacle) || (!carryActive && hitGround)) {
        this.player.y = Math.min(this.player.y, GROUND_Y - this.player.hitRadius);
        this.crash();
      }
      return;
    }

    if (this.state === "gameover") {
      this.background.update(dt, this.scrollSpeed * 0.24, t);
      this.obstacles.update(dt, this.scrollSpeed * 0.36, this.difficulty, false);
      this.powerups.reset();
      this.player.updateAfterCrash(dt);
      if (this.player.y + this.player.hitRadius > GROUND_Y - 2) {
        this.player.y = GROUND_Y - this.player.hitRadius;
        this.player.vy = 0;
      }
      return;
    }

    if (this.state === "victory") {
      this.background.update(dt, 72, t);
      this.player.targetX = this.player.defaultX;
      this.player.idle(dt);
    }
  }

  drawButton(ctx, button, label, pulse) {
    ctx.save();
    ctx.translate(button.x + button.w * 0.5, button.y + button.h * 0.5);
    const scale = 1 + Math.sin(this.time * 4.2) * 0.015 * pulse;
    ctx.scale(scale, scale);

    const g = ctx.createLinearGradient(0, -button.h * 0.5, 0, button.h * 0.5);
    g.addColorStop(0, "#ffe07f");
    g.addColorStop(1, "#f4b948");
    ctx.fillStyle = g;
    fillRoundedRect(ctx, -button.w * 0.5, -button.h * 0.5, button.w, button.h, 14);

    ctx.strokeStyle = "#9a6b1f";
    ctx.lineWidth = 2;
    strokeRoundedRect(ctx, -button.w * 0.5, -button.h * 0.5, button.w, button.h, 14);

    ctx.fillStyle = "rgba(255,255,255,0.38)";
    fillRoundedRect(ctx, -button.w * 0.5 + 4, -button.h * 0.5 + 4, button.w - 8, 14, 8);

    ctx.fillStyle = "#412805";
    ctx.font = "900 25px Trebuchet MS, Segoe UI, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(label, 0, 1);
    ctx.restore();
  }

  drawUtilityButton(ctx, button, label) {
    ctx.save();
    ctx.fillStyle = "rgba(245,250,255,0.96)";
    fillRoundedRect(ctx, button.x, button.y, button.w, button.h, 9);
    ctx.strokeStyle = "rgba(77,111,156,0.62)";
    ctx.lineWidth = 1.5;
    strokeRoundedRect(ctx, button.x, button.y, button.w, button.h, 9);

    ctx.fillStyle = "#2a4b78";
    ctx.font = button.h <= 24
      ? "600 11px Trebuchet MS, Segoe UI, sans-serif"
      : "600 12px Trebuchet MS, Segoe UI, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(label, button.x + button.w * 0.5, button.y + button.h * 0.5);
    ctx.restore();
  }

  drawHud(ctx) {
    ctx.save();
    const pulse = 1 + this.scorePulse * 0.22;
    ctx.translate(24, 20);

    ctx.fillStyle = "rgba(255,255,255,0.78)";
    fillRoundedRect(ctx, 0, 0, 126, 62, 14);
    ctx.strokeStyle = "rgba(63,95,138,0.45)";
    ctx.lineWidth = 2;
    strokeRoundedRect(ctx, 0, 0, 126, 62, 14);

    ctx.fillStyle = "#2d4b79";
    ctx.font = "700 14px Trebuchet MS, Segoe UI, sans-serif";
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.fillText(this.t("scoreLabel"), 14, 8);

    ctx.save();
    ctx.translate(64, 42);
    ctx.scale(pulse, pulse);
    ctx.fillStyle = "#1a345a";
    ctx.font = "900 34px Trebuchet MS, Segoe UI, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(String(this.score), 0, 0);
    ctx.restore();

    ctx.fillStyle = "rgba(255,255,255,0.76)";
    fillRoundedRect(ctx, GAME_W - 158, 0, 134, 44, 12);
    ctx.strokeStyle = "rgba(63,95,138,0.38)";
    ctx.lineWidth = 2;
    strokeRoundedRect(ctx, GAME_W - 158, 0, 134, 44, 12);

    ctx.fillStyle = "#2d4b79";
    ctx.font = "700 14px Trebuchet MS, Segoe UI, sans-serif";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillText(this.t("bestLabel"), GAME_W - 143, 22);

    ctx.font = "900 22px Trebuchet MS, Segoe UI, sans-serif";
    ctx.textAlign = "right";
    ctx.fillStyle = "#1a345a";
    ctx.fillText(String(this.best), GAME_W - 34, 22);
    ctx.restore();

    for (let i = 0; i < this.scorePops.length; i += 1) {
      this.scorePops[i].draw(ctx);
    }
  }

  drawParticles(ctx) {
    for (let i = 0; i < this.particles.length; i += 1) {
      this.particles[i].draw(ctx);
    }
  }

  drawPowerupRide(ctx) {
    if (!this.powerupRide) {
      return;
    }
    const ride = this.powerupRide;
    if (ride.kind === "will") {
      const warningProgress = ride.state === "carrying" ? clamp((5 - ride.timer) / 5, 0, 1) : 0;
      const blinkRate = lerp(4.8, 12.2, warningProgress);
      const featherVisible = ride.state !== "carrying"
        || ride.timer > 5
        || Math.sin(this.time * blinkRate * Math.PI * 2) > lerp(-0.15, 0.52, warningProgress);
      const featherAlpha = featherVisible ? 1 : 0.14;

      ctx.save();
      const glow = ctx.createRadialGradient(ride.x, ride.y + 8, 0, ride.x, ride.y + 8, 44);
      glow.addColorStop(0, "rgba(242,249,255,0.28)");
      glow.addColorStop(0.55, "rgba(188,220,255,0.18)");
      glow.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(ride.x, ride.y + 8, 44, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      drawFeatherSprite(ctx, ride.x, ride.y + 10, 132, 56, ride.featherRotation, featherAlpha);
      return;
    }

    const asset = ride.state === "carrying"
      ? getScribbleJumpSprite(ride.animT)
      : getScribbleJumpSprite(ride.animT + 0.18);
    drawScribbleSprite(ctx, ride.x, ride.y, 98, 64, asset, false);
  }

  drawLogoShield(ctx) {
    if (!this.logoShield) {
      return;
    }
    const shield = this.logoShield;
    const logoPos = this.getLogoShieldPosition();
    if (!logoPos) {
      return;
    }

    const pulse = 0.8 + Math.sin(this.time * 8.5) * 0.2;
    const timerPulse = 0.55 + (shield.timer / shield.duration) * 0.45;
    const warningProgress = clamp((5 - shield.timer) / 5, 0, 1);
    const blinkRate = lerp(4.5, 11.5, warningProgress);
    const logoVisible = shield.timer > 5
      || Math.sin(this.time * blinkRate * Math.PI * 2) > lerp(-0.2, 0.45, warningProgress);

    drawLogoGlow(ctx, this.player.x, this.player.y, 34 + pulse * 8, this.time * 1.3, timerPulse);
    if (logoVisible) {
      drawLogoGlow(ctx, logoPos.x, logoPos.y, 28 + pulse * 6, this.time * 1.8, timerPulse);
    }

    ctx.save();
    ctx.globalAlpha = 0.16 + timerPulse * 0.18;
    ctx.strokeStyle = "#b7d8ff";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(this.player.x, this.player.y, 24 + pulse * 6, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    if (logoVisible) {
      drawLogoSprite(ctx, logoPos.x, logoPos.y, 56, 56, shield.rotation, shield.axisScaleX, 1);
    }
  }

  drawMotherNatureAura(ctx) {
    if (!this.motherNatureAura) {
      return;
    }
    const aura = this.motherNatureAura;
    const auraPos = this.getMotherNatureAuraPosition();
    if (!auraPos) {
      return;
    }

    const pulse = 0.82 + Math.sin(this.time * 6.4) * 0.18;
    const timerPulse = 0.55 + (aura.timer / aura.duration) * 0.45;
    const warningProgress = clamp((5 - aura.timer) / 5, 0, 1);
    const blinkRate = lerp(4.1, 10.8, warningProgress);
    const auraVisible = aura.timer > 5
      || Math.sin(this.time * blinkRate * Math.PI * 2) > lerp(-0.15, 0.5, warningProgress);

    drawMotherNatureGlow(ctx, this.player.x, this.player.y, 34 + pulse * 7, aura.animT, timerPulse);
    if (auraVisible) {
      drawMotherNatureGlow(ctx, auraPos.x, auraPos.y, 28 + pulse * 5, aura.animT * 1.1, timerPulse);
    }

    ctx.save();
    ctx.globalAlpha = 0.14 + timerPulse * 0.16;
    ctx.strokeStyle = "#89d2a2";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(this.player.x, this.player.y, 24 + pulse * 6, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    if (auraVisible) {
      drawMotherNatureSprite(
        ctx,
        auraPos.x,
        auraPos.y,
        58,
        58,
        getMotherNatureIdleSprite(aura.animT),
        1
      );
    }
  }

  drawCharacterCard(ctx, button, family, selected, locked) {
    ctx.save();
    const border = selected ? "#2a5695" : "rgba(57,86,130,0.5)";
    const fill = selected ? "rgba(229,239,253,0.98)" : "rgba(244,249,255,0.95)";
    ctx.fillStyle = fill;
    fillRoundedRect(ctx, button.x, button.y, button.w, button.h, 14);
    ctx.strokeStyle = border;
    ctx.lineWidth = selected ? 3 : 2;
    strokeRoundedRect(ctx, button.x, button.y, button.w, button.h, 14);

    const cx = button.x + button.w * 0.5;
    const cy = button.y + (button.h < 72 ? 24 : 26);
    const showcaseSize = clamp(
      Math.min(button.w - 16, button.h - 30, selected ? 42 : 40),
      24,
      42
    );
    drawFamilyShowcaseSprite(ctx, family.id, cx, cy, showcaseSize, this.time, family.sortOrder || 0);

    const familyName = getFamilyName(this.language, family.id);
    ctx.fillStyle = "#26416d";
    ctx.font = button.w < 60
      ? "700 10px Trebuchet MS, Segoe UI, sans-serif"
      : (button.w < 80
      ? "700 11px Trebuchet MS, Segoe UI, sans-serif"
      : "700 13px Trebuchet MS, Segoe UI, sans-serif");
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    if (ctx.measureText(familyName).width > button.w - 12 && /\s/.test(familyName)) {
      ctx.font = button.w < 80
        ? "700 9px Trebuchet MS, Segoe UI, sans-serif"
        : "700 10px Trebuchet MS, Segoe UI, sans-serif";
      drawCenteredLineBlock(ctx, familyName, cx, button.y + button.h - 14, button.w - 10, 10, 2);
    } else {
      ctx.fillText(familyName, cx, button.y + button.h - 14);
    }

    if (locked) {
      ctx.fillStyle = "rgba(14,28,50,0.56)";
      fillRoundedRect(ctx, button.x, button.y, button.w, button.h, 14);
      ctx.fillStyle = "#ffffff";
      ctx.font = "700 12px Trebuchet MS, Segoe UI, sans-serif";
      ctx.fillText(this.t("locked"), cx, button.y + button.h * 0.5 - 6);
      ctx.font = "600 10px Trebuchet MS, Segoe UI, sans-serif";
      ctx.fillText(this.t(family.menuCard?.lockHintKey || "best10"), cx, button.y + button.h * 0.5 + 9);
    }

    ctx.restore();
  }

  drawLanguageSelect(ctx) {
    ctx.save();
    ctx.fillStyle = "#203a63";
    ctx.font = "700 14px Trebuchet MS, Segoe UI, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(this.t("language"), GAME_W * 0.5, this.langEnButton.y - 16);

    const drawLangButton = (button, key, active) => {
      ctx.fillStyle = active ? "rgba(229,239,253,0.98)" : "rgba(244,249,255,0.94)";
      fillRoundedRect(ctx, button.x, button.y, button.w, button.h, 10);
      ctx.strokeStyle = active ? "#2a5695" : "rgba(57,86,130,0.5)";
      ctx.lineWidth = active ? 3 : 2;
      strokeRoundedRect(ctx, button.x, button.y, button.w, button.h, 10);
      ctx.fillStyle = "#26416d";
      ctx.font = "700 13px Trebuchet MS, Segoe UI, sans-serif";
      ctx.fillText(this.t(key), button.x + button.w * 0.5, button.y + button.h * 0.5);
    };

    drawLangButton(this.langEnButton, "english", this.language === "en");
    drawLangButton(this.langEsButton, "spanish", this.language === "es");
    ctx.restore();
  }

  drawCharacterSelect(ctx, options = {}) {
    const layout = {
      ...this.getCharacterSelectLayout(),
      ...options,
    };
    this.layoutCharacterButtons(layout.rowY, layout.maxWidth, layout.rowGap, layout.rows);
    if (layout.showTitle !== false) {
      ctx.fillStyle = "#203a63";
      ctx.font = "700 16px Trebuchet MS, Segoe UI, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(this.t("character"), GAME_W * 0.5, layout.titleY);
    }

    for (const family of this.getVisiblePlayableFamilies()) {
      const button = this.getCharacterButtonForFamily(family.id);
      if (!button) {
        continue;
      }
      this.drawCharacterCard(
        ctx,
        button,
        family,
        this.selectedCharacter === family.id,
        false
      );
    }
  }

  drawStartOverlay(ctx) {
    const alpha = clamp(this.stateTime * 2.2, 0, 1);
    ctx.save();
    ctx.globalAlpha = alpha;

    ctx.fillStyle = "rgba(11,24,45,0.26)";
    ctx.fillRect(0, 0, GAME_W, GAME_H);

    this.langEnButton.x = GAME_W * 0.5 - 118;
    this.langEnButton.y = 212;
    this.langEsButton.x = GAME_W * 0.5 + 10;
    this.langEsButton.y = 212;
    const startCharacterLayout = this.getCharacterSelectLayout("start");
    this.layoutCharacterButtons(
      startCharacterLayout.rowY,
      startCharacterLayout.maxWidth,
      startCharacterLayout.rowGap,
      startCharacterLayout.rows
    );
    this.startButton.x = GAME_W * 0.5 - 118;
    this.startButton.y = startCharacterLayout.startY;
    this.startButton.w = 236;
    this.startButton.h = 64;

    ctx.fillStyle = "rgba(255,255,255,0.9)";
    fillRoundedRect(ctx, 20, startCharacterLayout.panelY, GAME_W - 40, startCharacterLayout.panelH, 26);
    ctx.strokeStyle = "rgba(57,86,130,0.55)";
    ctx.lineWidth = 2;
    strokeRoundedRect(ctx, 20, startCharacterLayout.panelY, GAME_W - 40, startCharacterLayout.panelH, 26);

    drawRibbonText(ctx, this.t("title"), GAME_W * 0.5, 142, 36);

    ctx.fillStyle = "#284775";
    ctx.font = "700 19px Trebuchet MS, Segoe UI, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(this.t("startBlurb1"), GAME_W * 0.5, 284);
    ctx.fillText(this.t("startBlurb2"), GAME_W * 0.5, 312);

    ctx.fillStyle = "#f6fbff";
    fillRoundedRect(ctx, 52, 334, GAME_W - 104, 126, 16);
    ctx.strokeStyle = "rgba(88,120,166,0.45)";
    ctx.lineWidth = 2;
    strokeRoundedRect(ctx, 52, 334, GAME_W - 104, 126, 16);

    ctx.fillStyle = "#203a63";
    ctx.font = "700 18px Trebuchet MS, Segoe UI, sans-serif";
    ctx.fillText(this.t("controls"), GAME_W * 0.5, 362);
    ctx.font = "600 16px Trebuchet MS, Segoe UI, sans-serif";
    ctx.fillText(this.t("flapControls"), GAME_W * 0.5, 392);
    ctx.fillText(this.t("pauseControls"), GAME_W * 0.5, 418);
    ctx.font = "600 13px Trebuchet MS, Segoe UI, sans-serif";
    ctx.textBaseline = "top";
    drawWrappedCenteredText(ctx, this.t("avoid"), GAME_W * 0.5, 432, GAME_W - 132, 16);

    this.drawLanguageSelect(ctx);
    this.drawCharacterSelect(ctx, { ...startCharacterLayout, showTitle: false });
    this.drawButton(ctx, this.startButton, this.t("startFlight"), 1);

    this.resetScoreButton.x = 28;
    this.resetScoreButton.y = GAME_H - 46;
    this.resetScoreButton.w = 124;
    this.resetScoreButton.h = 28;
    this.drawUtilityButton(ctx, this.resetScoreButton, this.t("resetScore"));

    this.devModeButton.x = GAME_W - 168;
    this.devModeButton.y = GAME_H - 46;
    this.devModeButton.w = 140;
    this.devModeButton.h = 28;
    this.drawUtilityButton(ctx, this.devModeButton, this.t("passwordMode"));

    ctx.fillStyle = "rgba(31,55,92,0.75)";
    ctx.font = "600 13px Trebuchet MS, Segoe UI, sans-serif";
    ctx.textBaseline = "middle";
    ctx.fillText(this.t("bestSavedPrefix") + this.best, GAME_W * 0.5, startCharacterLayout.bestY);

    ctx.restore();
  }

  drawPauseOverlay(ctx) {
    const alpha = clamp(this.stateTime * 3, 0, 1);
    ctx.save();
    ctx.globalAlpha = alpha;

    ctx.fillStyle = "rgba(7,18,35,0.46)";
    ctx.fillRect(0, 0, GAME_W, GAME_H);

    ctx.fillStyle = "rgba(255,255,255,0.93)";
    fillRoundedRect(ctx, 62, 196, GAME_W - 124, 320, 22);
    ctx.strokeStyle = "rgba(58,88,132,0.55)";
    ctx.lineWidth = 2;
    strokeRoundedRect(ctx, 62, 196, GAME_W - 124, 320, 22);

    drawRibbonText(ctx, this.t("paused"), GAME_W * 0.5, 264, 34);

    ctx.fillStyle = "#1f385f";
    ctx.textAlign = "center";
    ctx.font = "700 18px Trebuchet MS, Segoe UI, sans-serif";
    ctx.fillText(this.pausedByVisibility ? this.t("pausedHidden") : this.t("takeBreath"), GAME_W * 0.5, 324);
    ctx.font = "600 16px Trebuchet MS, Segoe UI, sans-serif";
    ctx.fillText(this.t("resumeHint"), GAME_W * 0.5, 356);

    this.drawButton(ctx, this.resumeButton, this.t("resume"), 0.65);
    ctx.restore();
  }

  drawGameOverOverlay(ctx) {
    const alpha = clamp(this.stateTime * 3, 0, 1);
    const gameOverCharacterLayout = this.getCharacterSelectLayout("gameover");
    ctx.save();
    ctx.globalAlpha = alpha;

    ctx.fillStyle = "rgba(10,20,35,0.56)";
    ctx.fillRect(0, 0, GAME_W, GAME_H);

    ctx.fillStyle = "rgba(255,255,255,0.94)";
    fillRoundedRect(ctx, 36, gameOverCharacterLayout.panelY, GAME_W - 72, gameOverCharacterLayout.panelH, 24);
    ctx.strokeStyle = "rgba(56,88,132,0.58)";
    ctx.lineWidth = 2;
    strokeRoundedRect(ctx, 36, gameOverCharacterLayout.panelY, GAME_W - 72, gameOverCharacterLayout.panelH, 24);

    drawRibbonText(ctx, this.t("gameOver"), GAME_W * 0.5, 218, 34);

    ctx.fillStyle = "#24416c";
    ctx.font = "700 20px Trebuchet MS, Segoe UI, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(this.t("runScore"), GAME_W * 0.5, 280);

    ctx.font = "900 52px Trebuchet MS, Segoe UI, sans-serif";
    ctx.fillStyle = "#163257";
    ctx.fillText(String(this.score), GAME_W * 0.5, 338);

    ctx.font = "700 20px Trebuchet MS, Segoe UI, sans-serif";
    ctx.fillStyle = "#274773";
    ctx.fillText(this.t("bestScorePrefix") + this.best, GAME_W * 0.5, 388);

    ctx.font = "600 16px Trebuchet MS, Segoe UI, sans-serif";
    ctx.fillStyle = "#395a89";
    ctx.fillText(this.t("replayHint"), GAME_W * 0.5, 426);

    this.drawCharacterSelect(ctx, gameOverCharacterLayout);

    this.replayButton.x = GAME_W * 0.5 - 110;
    this.replayButton.y = gameOverCharacterLayout.replayY;
    this.replayButton.w = 220;
    this.replayButton.h = 62;
    this.drawButton(ctx, this.replayButton, this.t("replay"), 1);

    this.devModeButton.x = GAME_W * 0.5 - 70;
    this.devModeButton.y = gameOverCharacterLayout.replayY + 70;
    this.devModeButton.w = 140;
    this.devModeButton.h = 24;
    this.drawUtilityButton(ctx, this.devModeButton, this.t("passwordMode"));
    ctx.restore();
  }

  drawVictoryOverlay(ctx) {
    const alpha = clamp(this.stateTime * 2.8, 0, 1);
    const families = this.getVisiblePlayableFamilies();

    ctx.save();
    ctx.globalAlpha = alpha;

    ctx.fillStyle = "rgba(8,20,38,0.62)";
    ctx.fillRect(0, 0, GAME_W, GAME_H);

    ctx.fillStyle = "rgba(255,255,255,0.95)";
    fillRoundedRect(ctx, 24, 84, GAME_W - 48, 612, 26);
    ctx.strokeStyle = "rgba(73,115,168,0.58)";
    ctx.lineWidth = 2;
    strokeRoundedRect(ctx, 24, 84, GAME_W - 48, 612, 26);

    drawRibbonText(ctx, this.t("victory"), GAME_W * 0.5, 146, 34);

    ctx.fillStyle = "#24426d";
    ctx.font = "700 17px Trebuchet MS, Segoe UI, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    drawWrappedCenteredText(ctx, this.t("victoryBody"), GAME_W * 0.5, 178, GAME_W - 118, 22);

    ctx.fillStyle = "rgba(244,249,255,0.95)";
    fillRoundedRect(ctx, 58, 232, 132, 78, 16);
    fillRoundedRect(ctx, GAME_W - 190, 232, 132, 78, 16);
    ctx.strokeStyle = "rgba(77,111,156,0.46)";
    strokeRoundedRect(ctx, 58, 232, 132, 78, 16);
    strokeRoundedRect(ctx, GAME_W - 190, 232, 132, 78, 16);

    ctx.fillStyle = "#31527f";
    ctx.font = "700 14px Trebuchet MS, Segoe UI, sans-serif";
    ctx.fillText(this.t("runScore"), 124, 254);
    ctx.fillText(this.t("bestLabel"), GAME_W - 124, 254);

    ctx.fillStyle = "#17345b";
    ctx.font = "900 34px Trebuchet MS, Segoe UI, sans-serif";
    ctx.fillText(String(this.score), 124, 286);
    ctx.fillText(String(this.best), GAME_W - 124, 286);

    for (let i = 0; i < 18; i += 1) {
      const confettiX = 44 + ((i * 31) % (GAME_W - 88));
      const confettiY = 196 + ((i * 43) % 192);
      const phase = this.time * 2 + i * 0.6;
      const colors = ["#6fb7ff", "#ff8f9a", "#74dfa2", "#ffd965"];
      ctx.save();
      ctx.translate(confettiX, confettiY + Math.sin(phase) * 6);
      ctx.rotate(phase * 0.8);
      ctx.fillStyle = colors[i % colors.length];
      fillRoundedRect(ctx, -4, -8, 8, 16, 2);
      ctx.restore();
    }

    const rowY = 498;
    const availableWidth = GAME_W - 112;
    const count = Math.max(1, families.length);
    const spacing = count <= 1 ? 0 : Math.min(70, availableWidth / (count - 1));
    const startX = GAME_W * 0.5 - ((count - 1) * spacing) * 0.5;
    const showcaseSize = clamp(Math.min(60, spacing * 0.86), 44, 60);

    for (let i = 0; i < families.length; i += 1) {
      const family = families[i];
      const x = startX + i * spacing;
      const y = rowY + Math.sin(this.time * 2.1 + i * 0.5) * 3;
      drawFamilyShowcaseSprite(ctx, family.id, x, y, showcaseSize, this.time, i);
    }

    this.replayButton.x = GAME_W * 0.5 - 110;
    this.replayButton.y = 618;
    this.replayButton.w = 220;
    this.replayButton.h = 62;
    this.drawButton(ctx, this.replayButton, this.t("replay"), 1);
    ctx.restore();
  }

  drawPasswordModeOverlay(ctx) {
    if (!this.devMode.open) {
      return;
    }

    const layout = this.getPasswordModeLayout();
    const isPasswordStep = this.devMode.step === "password";
    const fieldValue = isPasswordStep
      ? "*".repeat(this.devMode.value.length)
      : this.devMode.value;

    ctx.save();
    ctx.fillStyle = "rgba(8,18,36,0.7)";
    ctx.fillRect(0, 0, GAME_W, GAME_H);

    ctx.fillStyle = "rgba(255,255,255,0.97)";
    fillRoundedRect(ctx, layout.panel.x, layout.panel.y, layout.panel.w, layout.panel.h, 22);
    ctx.strokeStyle = "rgba(58,88,132,0.55)";
    ctx.lineWidth = 2;
    strokeRoundedRect(ctx, layout.panel.x, layout.panel.y, layout.panel.w, layout.panel.h, 22);

    ctx.fillStyle = "#7b2930";
    ctx.font = "900 26px Trebuchet MS, Segoe UI, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(this.t("passwordMode"), GAME_W * 0.5, layout.panel.y + 34);

    ctx.fillStyle = "#23436f";
    ctx.font = "600 15px Trebuchet MS, Segoe UI, sans-serif";
    drawWrappedCenteredText(
      ctx,
      this.t(isPasswordStep ? "devPasswordPrompt" : "devBestPrompt"),
      GAME_W * 0.5,
      layout.panel.y + 68,
      layout.panel.w - 46,
      18
    );

    ctx.fillStyle = "#35547f";
    ctx.font = "700 13px Trebuchet MS, Segoe UI, sans-serif";
    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";
    ctx.fillText(this.t(isPasswordStep ? "devPasswordLabel" : "devBestLabel"), layout.field.x, layout.field.y - 10);

    ctx.fillStyle = "#f4f8ff";
    fillRoundedRect(ctx, layout.field.x, layout.field.y, layout.field.w, layout.field.h, 12);
    ctx.strokeStyle = this.devMode.error ? "#b54e53" : "rgba(70,103,147,0.55)";
    ctx.lineWidth = 2;
    strokeRoundedRect(ctx, layout.field.x, layout.field.y, layout.field.w, layout.field.h, 12);

    ctx.fillStyle = fieldValue ? "#153359" : "rgba(45,75,120,0.38)";
    ctx.font = "700 20px Trebuchet MS, Segoe UI, sans-serif";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillText(fieldValue || " ", layout.field.x + 14, layout.field.y + layout.field.h * 0.5 + 1);

    if (this.devMode.error) {
      ctx.fillStyle = "#a63d44";
      ctx.font = "700 13px Trebuchet MS, Segoe UI, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(this.devMode.error, GAME_W * 0.5, layout.field.y + layout.field.h + 20);
    }

    this.drawUtilityButton(ctx, layout.cancel, this.t("devCancel"));
    this.drawUtilityButton(ctx, layout.submit, this.t(isPasswordStep ? "devContinue" : "devApply"));

    ctx.fillStyle = "#5a7092";
    ctx.font = "600 12px Trebuchet MS, Segoe UI, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(this.t("devKeyboardHint"), GAME_W * 0.5, layout.panel.y + layout.panel.h - 16);
    ctx.restore();
  }

  drawOverlays(ctx) {
    if (this.state === "start") {
      this.drawStartOverlay(ctx);
    } else if (this.state === "paused") {
      this.drawPauseOverlay(ctx);
    } else if (this.state === "gameover") {
      this.drawGameOverOverlay(ctx);
    } else if (this.state === "victory") {
      this.drawVictoryOverlay(ctx);
    }

    this.drawUnlockNotice(ctx);

    if (this.flash > 0) {
      ctx.save();
      ctx.globalAlpha = this.flash * 0.35;
      ctx.fillStyle = "#ff9d9a";
      ctx.fillRect(0, 0, GAME_W, GAME_H);
      ctx.restore();
    }

    this.drawPasswordModeOverlay(ctx);
  }

  drawUnlockPreview(ctx, familyId) {
    if (familyId === "motherNature") {
      const natureY = 334 + Math.sin(this.time * 2.2) * 6;
      drawMotherNatureGlow(ctx, GAME_W * 0.5, natureY, 28, this.time * 1.05, 1);
      drawMotherNatureSprite(
        ctx,
        GAME_W * 0.5,
        natureY,
        56,
        56,
        getMotherNatureIdleSprite(this.time * 1.1),
        1
      );
      return;
    }

    if (familyId === "will") {
      const frameSeq = [0, 0, 1, 0, 2, 0, 3, 0, 4, 0];
      const frame = frameSeq[Math.floor((this.time * 2.4) % frameSeq.length)];
      const willY = 336 + Math.sin(this.time * 1.9) * 4;
      drawWillSprite(ctx, GAME_W * 0.5, willY, 66, 66, getWillExpressionSprite(frame), false, 1);
      return;
    }

    if (familyId === "logo") {
      const logoY = 334 + Math.sin(this.time * 2.4) * 6;
      drawLogoGlow(ctx, GAME_W * 0.5, logoY, 28, this.time * 1.5, 1);
      drawLogoSprite(
        ctx,
        GAME_W * 0.5,
        logoY,
        58,
        58,
        this.time * 2.6,
        1,
        1
      );
      return;
    }

    if (familyId === "staticLogo") {
      const logoY = 334 + Math.sin(this.time * 2.4) * 4;
      ctx.save();
      ctx.translate(GAME_W * 0.5, logoY);
      ctx.rotate(Math.PI);
      drawLogoGlow(ctx, 0, 0, 28, this.time * 1.3, 1.2);
      drawLogoSprite(ctx, 0, 0, 58, 58, 0, 1, 1);
      ctx.restore();
      return;
    }

    if (familyId === "scribble") {
      const scribbleY = 334 + Math.sin(this.time * 2.8) * 5;
      drawScribbleSprite(ctx, GAME_W * 0.5, scribbleY, 84, 58, getScribbleIdleSprite(this.time * 0.95), false);
      return;
    }

    if (familyId === "hoverbot") {
      const hoverY = 332 + Math.sin(this.time * 3.2) * 6;
      drawHoverbotComposite(ctx, GAME_W * 0.5, hoverY, 98, 68, this.time * 9.2, true);

      const eyeX = GAME_W * 0.5 - 98 * 0.01;
      const eyeY = hoverY - 68 * 0.215;
      const previewLength = 126;
      const pulse = 0.5 + Math.sin(this.time * 16) * 0.5;
      ctx.save();
      ctx.globalAlpha = 0.3 + pulse * 0.35;
      ctx.drawImage(HOVERBOT_LASER_ASSETS.core.img, eyeX - previewLength, eyeY - 2, previewLength, 4);
      ctx.restore();
      return;
    }

    if (familyId === "powerpup") {
      const cycle = this.time % 1.05;
      let y = 338;
      let sprite = POWERPUP_SPRITES.idle;
      if (cycle > 0.22) {
        sprite = POWERPUP_SPRITES.flyingUp;
        y = 338 - Math.min(90, ((cycle - 0.22) / 0.83) * 120);
      }
      if (sprite.ready) {
        const w = 68;
        const h = 68;
        ctx.drawImage(sprite.img, GAME_W * 0.5 - w * 0.5, y - h * 0.5, w, h);
      } else {
        ctx.fillStyle = "#f4b15e";
        fillRoundedRect(ctx, GAME_W * 0.5 - 22, y - 22, 44, 44, 10);
      }
      return;
    }

    const cycle = this.time % 0.95;
    const floorY = 330;
    let dotY = floorY;
    let sprite = DOT_SPRITES.inGround;
    if (cycle < 0.12) {
      sprite = DOT_SPRITES.inGround;
    } else if (cycle < 0.24) {
      sprite = DOT_SPRITES.bouncing;
      dotY = floorY - ((cycle - 0.12) / 0.12) * 42;
    } else if (cycle < 0.58) {
      sprite = DOT_SPRITES.idle;
      dotY = floorY - 42 + ((cycle - 0.24) / 0.34) * 42;
    } else {
      sprite = DOT_SPRITES.idle;
    }

    if (sprite.ready) {
      ctx.drawImage(sprite.img, GAME_W * 0.5 - 30, dotY - 30, 60, 60);
    } else {
      ctx.fillStyle = "#f35a6f";
      ctx.beginPath();
      ctx.arc(GAME_W * 0.5, dotY, 20, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  drawUnlockNotice(ctx) {
    if (this.unlockNoticeTimer <= 0 || !this.unlockNoticeFamilyId) {
      return;
    }
    const alpha = clamp(
      Math.min(1, this.unlockNoticeTimer / 0.45, (4 - this.unlockNoticeTimer) / 0.45),
      0,
      1
    );
    ctx.save();
    ctx.globalAlpha = alpha;

    ctx.fillStyle = "rgba(9,21,40,0.52)";
    fillRoundedRect(ctx, 38, 224, GAME_W - 76, 186, 20);
    ctx.fillStyle = "rgba(22,47,84,0.94)";
    fillRoundedRect(ctx, 42, 228, GAME_W - 84, 178, 18);
    ctx.strokeStyle = "rgba(132,175,232,0.94)";
    ctx.lineWidth = 2;
    strokeRoundedRect(ctx, 42, 228, GAME_W - 84, 178, 18);

    ctx.fillStyle = "#f1f7ff";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = "800 24px Trebuchet MS, Segoe UI, sans-serif";
    ctx.fillText(this.t(getUnlockTitleKey(this.unlockNoticeFamilyId)), GAME_W * 0.5, 266);

    this.drawUnlockPreview(ctx, this.unlockNoticeFamilyId);

    ctx.fillStyle = "#d4e7ff";
    ctx.font = "600 14px Trebuchet MS, Segoe UI, sans-serif";
    ctx.fillText(this.t(getUnlockBodyKey(this.unlockNoticeFamilyId)), GAME_W * 0.5, 380);
    ctx.restore();
  }

  drawCredits(ctx) {
    ctx.save();
    ctx.fillStyle = "rgba(20,42,74,0.76)";
    ctx.font = "600 11px Trebuchet MS, Segoe UI, sans-serif";
    ctx.textAlign = "right";
    ctx.textBaseline = "bottom";
    ctx.fillText(this.t("credits"), GAME_W - 10, GAME_H - 8);
    ctx.restore();
  }

  draw(ctx) {
    const shakeX = this.shake > 0 ? rand(-this.shake, this.shake) : 0;
    const shakeY = this.shake > 0 ? rand(-this.shake * 0.8, this.shake * 0.8) : 0;

    ctx.save();
    ctx.translate(shakeX, shakeY);

    const drawStep = (label, fn) => {
      try {
        fn();
      } catch (error) {
        error.message = `[${label}] ${error.message || error}`;
        throw error;
      }
    };

    drawStep("background", () => this.background.draw(ctx, this.time));
    drawStep("obstacles", () => this.obstacles.draw(ctx, this.time));
    drawStep("powerups", () => this.powerups.draw(ctx));
    drawStep("particles", () => this.drawParticles(ctx));
    drawStep("player", () => this.player.draw(ctx, this.time));
    drawStep("powerupRide", () => this.drawPowerupRide(ctx));
    drawStep("logoShield", () => this.drawLogoShield(ctx));
    drawStep("natureAura", () => this.drawMotherNatureAura(ctx));
    drawStep("hud", () => this.drawHud(ctx));
    drawStep("overlays", () => this.drawOverlays(ctx));
    drawStep("credits", () => this.drawCredits(ctx));

    ctx.restore();
  }
}

ClippyGame.Game = Game;
ClippyGame.GAME_W = GAME_W;
ClippyGame.GAME_H = GAME_H;
})();
