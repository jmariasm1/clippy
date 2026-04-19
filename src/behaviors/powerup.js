(() => {
const ClippyGame = window.ClippyGame || (window.ClippyGame = {});

const POWERUP_BEHAVIORS = Object.freeze({
  scribblePowerup: {
    init({ entity, profile, helpers }) {
      helpers.initScribblePowerup(entity, profile);
    },
    update({ entity, dt, worldSpeed, helpers, emit }) {
      helpers.updateScribblePowerup(entity, dt, worldSpeed, emit);
    },
    collides({ entity, player, helpers }) {
      return helpers.collidesScribblePowerup(entity, player);
    },
    collect({ entity, helpers }) {
      helpers.collectScribblePowerup(entity);
    },
    draw({ entity, ctx, helpers }) {
      helpers.drawScribblePowerup(entity, ctx);
    },
  },
  logoPowerup: {
    init({ entity, profile, helpers }) {
      helpers.initLogoPowerup(entity, profile);
    },
    update({ entity, dt, worldSpeed, helpers, emit }) {
      helpers.updateLogoPowerup(entity, dt, worldSpeed, emit);
    },
    collides({ entity, player, helpers }) {
      return helpers.collidesLogoPowerup(entity, player);
    },
    collect({ entity, helpers }) {
      helpers.collectLogoPowerup(entity);
    },
    draw({ entity, ctx, helpers }) {
      helpers.drawLogoPowerup(entity, ctx);
    },
  },
  motherNaturePowerup: {
    init({ entity, profile, helpers }) {
      helpers.initMotherNaturePowerup(entity, profile);
    },
    update({ entity, dt, worldSpeed, helpers, emit }) {
      helpers.updateMotherNaturePowerup(entity, dt, worldSpeed, emit);
    },
    collides({ entity, player, helpers }) {
      return helpers.collidesMotherNaturePowerup(entity, player);
    },
    collect({ entity, helpers }) {
      helpers.collectMotherNaturePowerup(entity);
    },
    draw({ entity, ctx, helpers }) {
      helpers.drawMotherNaturePowerup(entity, ctx);
    },
  },
  willPowerup: {
    init({ entity, profile, helpers }) {
      helpers.initWillPowerup(entity, profile);
    },
    update({ entity, dt, worldSpeed, helpers, emit }) {
      helpers.updateWillPowerup(entity, dt, worldSpeed, emit);
    },
    collides({ entity, player, helpers }) {
      return helpers.collidesWillPowerup(entity, player);
    },
    collect({ entity, helpers }) {
      helpers.collectWillPowerup(entity);
    },
    draw({ entity, ctx, helpers }) {
      helpers.drawWillPowerup(entity, ctx);
    },
  },
});

ClippyGame.POWERUP_BEHAVIORS = POWERUP_BEHAVIORS;
})();
