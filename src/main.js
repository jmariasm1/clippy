(() => {
const ClippyGame = window.ClippyGame || (window.ClippyGame = {});
const { preloadAssets, Game, GAME_H, GAME_W } = ClippyGame;

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d", { alpha: false });

let screenW = 0;
let screenH = 0;
let dpr = 1;
let viewScale = 1;
let viewX = 0;
let viewY = 0;
let game = null;
let loadingRatio = 0;

const drawRoundedRect = (x, y, w, h, r) => {
  const rr = Math.min(r, w * 0.5, h * 0.5);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
};

const resize = () => {
  screenW = window.innerWidth;
  screenH = window.innerHeight;
  dpr = Math.min(3, window.devicePixelRatio || 1);

  canvas.width = Math.round(screenW * dpr);
  canvas.height = Math.round(screenH * dpr);
  canvas.style.width = `${screenW}px`;
  canvas.style.height = `${screenH}px`;

  viewScale = Math.min(screenW / GAME_W, screenH / GAME_H);
  viewX = (screenW - GAME_W * viewScale) * 0.5;
  viewY = (screenH - GAME_H * viewScale) * 0.5;
};

const screenToWorld = (clientX, clientY) => ({
  x: (clientX - viewX) / viewScale,
  y: (clientY - viewY) / viewScale,
});

const drawFrameBackground = () => {
  const bg = ctx.createLinearGradient(0, 0, 0, screenH);
  bg.addColorStop(0, "#dce6f2");
  bg.addColorStop(1, "#c2d2e7");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, screenW, screenH);

  const framePad = 10;
  const frameX = viewX - framePad;
  const frameY = viewY - framePad;
  const frameW = GAME_W * viewScale + framePad * 2;
  const frameH = GAME_H * viewScale + framePad * 2;

  ctx.fillStyle = "rgba(28,52,88,0.2)";
  drawRoundedRect(frameX, frameY, frameW, frameH, 16);
  ctx.fill();
};

const drawLoadingState = () => {
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  drawFrameBackground();

  ctx.save();
  ctx.translate(viewX, viewY);
  ctx.scale(viewScale, viewScale);

  ctx.fillStyle = "rgba(255,255,255,0.92)";
  drawRoundedRect(70, 270, GAME_W - 140, 180, 20);
  ctx.fill();

  ctx.strokeStyle = "rgba(57,86,130,0.4)";
  ctx.lineWidth = 2;
  drawRoundedRect(70, 270, GAME_W - 140, 180, 20);
  ctx.stroke();

  ctx.fillStyle = "#203a63";
  ctx.font = "900 26px Trebuchet MS, Segoe UI, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("Loading v7 assets...", GAME_W * 0.5, 328);

  ctx.fillStyle = "rgba(32,58,99,0.16)";
  drawRoundedRect(108, 372, GAME_W - 216, 18, 9);
  ctx.fill();

  ctx.fillStyle = "#4a76ba";
  drawRoundedRect(108, 372, (GAME_W - 216) * loadingRatio, 18, 9);
  ctx.fill();

  ctx.font = "700 14px Trebuchet MS, Segoe UI, sans-serif";
  ctx.fillStyle = "#32517f";
  ctx.fillText(`${Math.round(loadingRatio * 100)}%`, GAME_W * 0.5, 418);

  ctx.restore();
};

const drawBootError = (error) => {
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  drawFrameBackground();

  ctx.save();
  ctx.translate(viewX, viewY);
  ctx.scale(viewScale, viewScale);

  ctx.fillStyle = "rgba(255,255,255,0.95)";
  drawRoundedRect(40, 240, GAME_W - 80, 230, 22);
  ctx.fill();

  ctx.strokeStyle = "rgba(160,58,58,0.35)";
  ctx.lineWidth = 2;
  drawRoundedRect(40, 240, GAME_W - 80, 230, 22);
  ctx.stroke();

  ctx.fillStyle = "#7b2930";
  ctx.font = "900 28px Trebuchet MS, Segoe UI, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("V7 failed to start", GAME_W * 0.5, 290);

  ctx.fillStyle = "#334c74";
  ctx.font = "700 16px Trebuchet MS, Segoe UI, sans-serif";
  ctx.fillText("Open this page from the repository and check the console.", GAME_W * 0.5, 336);

  ctx.fillStyle = "#4b5d7d";
  ctx.font = "600 14px Trebuchet MS, Segoe UI, sans-serif";
  const message = String(error?.message || error || "Unknown error");
  const lines = [];
  const words = message.split(/\s+/).filter(Boolean);
  let line = "";
  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (ctx.measureText(candidate).width < GAME_W - 130) {
      line = candidate;
    } else {
      if (line) lines.push(line);
      line = word;
    }
  }
  if (line) {
    lines.push(line);
  }
  lines.slice(0, 4).forEach((text, index) => {
    ctx.fillText(text, GAME_W * 0.5, 382 + index * 24);
  });

  ctx.restore();
};

const handlePointer = (event) => {
  if (!game) {
    return;
  }
  event.preventDefault();
  const point = screenToWorld(event.clientX, event.clientY);
  game.handlePrimaryAction(point, false);
};

const boot = async () => {
  resize();
  drawLoadingState();

  const assets = await preloadAssets(undefined, ({ ratio }) => {
    loadingRatio = ratio;
    drawLoadingState();
  });

  game = new Game(ctx, assets);

  canvas.addEventListener("pointerdown", handlePointer, { passive: false });
  canvas.addEventListener("touchstart", (event) => event.preventDefault(), { passive: false });
  canvas.addEventListener("touchmove", (event) => event.preventDefault(), { passive: false });
  canvas.addEventListener("contextmenu", (event) => event.preventDefault());

  window.addEventListener("keydown", (event) => {
    if (!game) {
      return;
    }
    if (typeof game.handleKeyDown === "function" && game.handleKeyDown(event)) {
      event.preventDefault();
      return;
    }
    const code = event.code;
    if (code === "Space" || code === "ArrowUp" || code === "KeyW") {
      event.preventDefault();
      game.handlePrimaryAction(null, true);
      return;
    }
    if (code === "KeyP" || code === "Escape") {
      event.preventDefault();
      game.handlePauseToggle();
    }
  });

  document.addEventListener("visibilitychange", () => {
    if (document.hidden && game) {
      game.pause(true);
    }
  });

  window.addEventListener("resize", () => {
    resize();
    if (!game) {
      drawLoadingState();
    }
  });

  let last = performance.now();
  const loop = (now) => {
    if (!game) {
      return;
    }
    try {
      const dt = Math.min(0.033, Math.max(0.001, (now - last) / 1000));
      last = now;

      game.update(dt, now * 0.001);

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      drawFrameBackground();

      ctx.save();
      ctx.translate(viewX, viewY);
      ctx.scale(viewScale, viewScale);
      game.draw(ctx);
      ctx.restore();

      requestAnimationFrame(loop);
    } catch (error) {
      console.error("Frame render failed in Clippy Air Mail v7.", error);
      if (typeof ClippyGame.showStartupError === "function") {
        ClippyGame.showStartupError("V7 frame failure", error?.stack || error?.message || String(error));
      }
      drawBootError(error);
    }
  };

  requestAnimationFrame(loop);
};

boot().catch((error) => {
  console.error("Failed to boot Clippy Air Mail v7.", error);
  if (typeof ClippyGame.showStartupError === "function") {
    ClippyGame.showStartupError("V7 boot failure", error?.stack || error?.message || String(error));
  }
  resize();
  drawBootError(error);
});
})();
