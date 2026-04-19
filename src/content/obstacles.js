(() => {
const ClippyGame = window.ClippyGame || (window.ClippyGame = {});

const obstacle = ({ id, behavior, gapInset }) => ({
  id,
  behavior,
  gapInset,
});

const OBSTACLE_TYPES = Object.freeze([
  obstacle({ id: "pencil", behavior: "officeHazard", gapInset: 10 }),
  obstacle({ id: "scissors", behavior: "officeHazard", gapInset: 12 }),
  obstacle({ id: "binder", behavior: "officeHazard", gapInset: 6 }),
  obstacle({ id: "coffee", behavior: "officeHazard", gapInset: 8 }),
  obstacle({ id: "folders", behavior: "officeHazard", gapInset: 6 }),
  obstacle({ id: "sticky", behavior: "officeHazard", gapInset: 6 }),
  obstacle({ id: "ruler", behavior: "officeHazard", gapInset: 8 }),
  obstacle({ id: "pushpin", behavior: "officeHazard", gapInset: 10 }),
  obstacle({ id: "eraser", behavior: "officeHazard", gapInset: 6 }),
]);

const OBSTACLE_TYPE_MAP = Object.freeze(
  Object.fromEntries(OBSTACLE_TYPES.map((entry) => [entry.id, entry]))
);

const getObstacleType = (obstacleId) => OBSTACLE_TYPE_MAP[obstacleId] || null;

ClippyGame.OBSTACLE_TYPES = OBSTACLE_TYPES;
ClippyGame.OBSTACLE_TYPE_MAP = OBSTACLE_TYPE_MAP;
ClippyGame.getObstacleType = getObstacleType;
})();
