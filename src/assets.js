(() => {
const ClippyGame = window.ClippyGame || (window.ClippyGame = {});

const imageAsset = (src) => {
  const img = new Image();
  const asset = { img, ready: false, error: null };
  img.onload = () => {
    asset.ready = true;
  };
  img.onerror = () => {
    asset.error = new Error(`Failed to load asset: ${src}`);
  };
  img.src = src;
  if (img.complete && img.naturalWidth > 0) {
    asset.ready = true;
  }
  return asset;
};

const ASSET_MANIFEST = Object.freeze({
  "character.clippy.idle": "./assets/sprites/characters/clippy/clippy_idle.png",
  "character.dot.idle": "./assets/sprites/characters/dot/dot_idle.png",
  "character.dot.bouncing": "./assets/sprites/characters/dot/dot_bouncing.png",
  "character.dot.inGround": "./assets/sprites/characters/dot/dot_in_ground.png",
  "character.dot.star1": "./assets/sprites/characters/dot/dot_star_1.png",
  "character.dot.star2": "./assets/sprites/characters/dot/dot_star_2.png",
  "character.powerpup.idle": "./assets/sprites/characters/powerpup/powerpup_idle.png",
  "character.powerpup.flyingUp": "./assets/sprites/characters/powerpup/powerpup_flying_up.png",
  "character.hoverbot.body": "./assets/sprites/characters/hoverbot/hover_body.png",
  "character.hoverbot.eye1": "./assets/sprites/characters/hoverbot/hover_eye_1.png",
  "character.hoverbot.eye2": "./assets/sprites/characters/hoverbot/hover_eye_2.png",
  "character.hoverbot.eye3": "./assets/sprites/characters/hoverbot/hover_eye_3.png",
  "character.hoverbot.eye4": "./assets/sprites/characters/hoverbot/hover_eye_4.png",
  "character.hoverbot.eye5": "./assets/sprites/characters/hoverbot/hover_eye_5.png",
  "character.hoverbot.eye6": "./assets/sprites/characters/hoverbot/hover_eye_6.png",
  "character.hoverbot.eye7": "./assets/sprites/characters/hoverbot/hover_eye_7.png",
  "character.scribble.idle1": "./assets/sprites/characters/scribble/scribble_idle_1.png",
  "character.scribble.idle2": "./assets/sprites/characters/scribble/scribble_idle_2.png",
  "character.scribble.idle3": "./assets/sprites/characters/scribble/scribble_idle_3.png",
  "character.scribble.jump0": "./assets/sprites/characters/scribble/scribble_jump_0.png",
  "character.scribble.jump1": "./assets/sprites/characters/scribble/scribble_jump_1.png",
  "character.scribble.jump2": "./assets/sprites/characters/scribble/scribble_jump_2.png",
  "character.scribble.jump3": "./assets/sprites/characters/scribble/scribble_jump_3.png",
  "character.scribble.jump4": "./assets/sprites/characters/scribble/scribble_jump_4.png",
  "character.logo.idle": "./assets/sprites/characters/logo/logo_idle.png",
  "character.motherNature.idle1": "./assets/sprites/characters/mother_nature/mother_nature_idle_1.png",
  "character.motherNature.idle2": "./assets/sprites/characters/mother_nature/mother_nature_idle_2.png",
  "character.motherNature.idle3": "./assets/sprites/characters/mother_nature/mother_nature_idle_3.png",
  "character.motherNature.idle4": "./assets/sprites/characters/mother_nature/mother_nature_idle_4.png",
  "character.will.idle1": "./assets/sprites/characters/will/will_idle_1.png",
  "character.will.idle2": "./assets/sprites/characters/will/will_idle_2.png",
  "character.will.idle3": "./assets/sprites/characters/will/will_idle_3.png",
  "character.will.idle4": "./assets/sprites/characters/will/will_idle_4.png",
  "character.will.idle5": "./assets/sprites/characters/will/will_idle_5.png",
  "character.will.feather": "./assets/sprites/characters/will/will_feather.png",
});

const preloadAssets = async (manifest = ASSET_MANIFEST, onProgress) => {
  const entries = Object.entries(manifest);
  const assets = {};
  let completed = 0;

  const notify = () => {
    if (typeof onProgress === "function") {
      onProgress({
        completed,
        total: entries.length,
        ratio: entries.length === 0 ? 1 : completed / entries.length,
      });
    }
  };

  notify();

  await Promise.all(
    entries.map(async ([key, src]) => {
      const asset = imageAsset(src);
      assets[key] = asset;

      if (asset.ready || asset.error) {
        completed += 1;
        notify();
        return;
      }

      await new Promise((resolve) => {
        asset.img.onload = () => {
          asset.ready = true;
          completed += 1;
          notify();
          resolve();
        };
        asset.img.onerror = () => {
          asset.error = new Error(`Failed to load asset: ${src}`);
          completed += 1;
          notify();
          resolve();
        };
      });
    })
  );

  return assets;
};

ClippyGame.ASSET_MANIFEST = ASSET_MANIFEST;
ClippyGame.preloadAssets = preloadAssets;
})();
