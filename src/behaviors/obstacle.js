(() => {
const ClippyGame = window.ClippyGame || (window.ClippyGame = {});

const OBSTACLE_BEHAVIORS = Object.freeze({
  officeHazard: {
    init({ entity, profile, helpers }) {
      helpers.initOfficeHazard(entity, profile);
    },
    update({ entity, dt, speed }) {
      entity.x -= speed * dt;
    },
    collides({ entity, player, helpers }) {
      return helpers.collidesOfficeHazard(entity, player);
    },
    draw({ entity, ctx, t, helpers }) {
      helpers.drawOfficeHazard(entity, ctx, t);
    },
  },
  dotObstacle: {
    init({ entity, profile, helpers }) {
      helpers.initDotObstacle(entity, profile);
    },
    update({ entity, dt, speed, helpers, emit }) {
      helpers.updateDotObstacle(entity, dt, speed, emit);
    },
    collides({ entity, player, helpers }) {
      return helpers.collidesDotObstacle(entity, player);
    },
    draw({ entity, ctx, t, helpers }) {
      helpers.drawDotObstacle(entity, ctx, t);
    },
  },
  powerpupObstacle: {
    init({ entity, profile, helpers }) {
      helpers.initPowerpupObstacle(entity, profile);
    },
    update({ entity, dt, speed, helpers, emit }) {
      helpers.updatePowerpupObstacle(entity, dt, speed, emit);
    },
    collides({ entity, player, helpers }) {
      return helpers.collidesPowerpupObstacle(entity, player);
    },
    draw({ entity, ctx, t, helpers }) {
      helpers.drawPowerpupObstacle(entity, ctx, t);
    },
  },
  hoverbotObstacle: {
    init({ entity, profile, helpers }) {
      helpers.initHoverbotObstacle(entity, profile);
    },
    update({ entity, dt, speed, helpers, emit }) {
      helpers.updateHoverbotObstacle(entity, dt, speed, emit);
    },
    collides({ entity, player, helpers }) {
      return helpers.collidesHoverbotObstacle(entity, player);
    },
    draw({ entity, ctx, t, helpers }) {
      helpers.drawHoverbotObstacle(entity, ctx, t);
    },
  },
});

ClippyGame.OBSTACLE_BEHAVIORS = OBSTACLE_BEHAVIORS;
})();
