(() => {
const ClippyGame = window.ClippyGame || (window.ClippyGame = {});

const PLAYABLE_BEHAVIORS = Object.freeze({
  clippyPlayable: {
    applyProfile(player, profile) {
      player.hitRadius = profile.hitRadius;
    },
    onFlap() {},
    draw({ ctx, player, helpers }) {
      helpers.drawClippyPlayable(ctx, player);
    },
  },
  dotPlayable: {
    applyProfile(player, profile) {
      player.hitRadius = profile.hitRadius;
    },
    onFlap(player) {
      player.dotStarTimer = 0.14;
    },
    draw({ ctx, player, helpers }) {
      helpers.drawDotPlayable(ctx, player);
    },
  },
  powerpupPlayable: {
    applyProfile(player, profile) {
      player.hitRadius = profile.hitRadius;
    },
    onFlap() {},
    draw({ ctx, player, helpers }) {
      helpers.drawPowerpupPlayable(ctx, player);
    },
  },
  hoverbotPlayable: {
    applyProfile(player, profile) {
      player.hitRadius = profile.hitRadius;
    },
    onFlap() {},
    draw({ ctx, player, helpers }) {
      helpers.drawHoverbotPlayable(ctx, player);
    },
  },
  scribblePlayable: {
    applyProfile(player, profile) {
      player.hitRadius = profile.hitRadius;
    },
    onFlap(player) {
      player.scribbleJumpTimer = player.scribbleBounceDuration;
    },
    draw({ ctx, player, helpers }) {
      helpers.drawScribblePlayable(ctx, player);
    },
  },
  logoPlayable: {
    applyProfile(player, profile) {
      player.hitRadius = profile.hitRadius;
    },
    onFlap() {},
    draw({ ctx, player, helpers }) {
      helpers.drawLogoPlayable(ctx, player);
    },
  },
  staticLogoPlayable: {
    applyProfile(player, profile) {
      player.hitRadius = profile.hitRadius;
    },
    onFlap() {},
    draw({ ctx, player, helpers }) {
      helpers.drawStaticLogoPlayable(ctx, player);
    },
  },
  motherNaturePlayable: {
    applyProfile(player, profile) {
      player.hitRadius = profile.hitRadius;
    },
    onFlap() {},
    draw({ ctx, player, helpers }) {
      helpers.drawMotherNaturePlayable(ctx, player);
    },
  },
  willPlayable: {
    applyProfile(player, profile) {
      player.hitRadius = profile.hitRadius;
    },
    onFlap() {},
    draw({ ctx, player, helpers }) {
      helpers.drawWillPlayable(ctx, player);
    },
  },
});

ClippyGame.PLAYABLE_BEHAVIORS = PLAYABLE_BEHAVIORS;
})();
