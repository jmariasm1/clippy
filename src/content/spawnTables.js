(() => {
const ClippyGame = window.ClippyGame || (window.ClippyGame = {});
const { isRoleAvailable } = ClippyGame;

const SPAWN_TABLES = Object.freeze({
  obstacles: [
    { type: "obstacleType", id: "pencil", weightBase: 56, weightDifficulty: -8 },
    { type: "obstacleType", id: "scissors", weightBase: 7, weightDifficulty: 4 },
    { type: "obstacleType", id: "binder", weightBase: 7, weightDifficulty: 5 },
    { type: "obstacleType", id: "coffee", weightBase: 7, weightDifficulty: 4 },
    { type: "obstacleType", id: "folders", weightBase: 7, weightDifficulty: 4 },
    { type: "obstacleType", id: "sticky", weightBase: 5, weightDifficulty: 4 },
    { type: "obstacleType", id: "ruler", weightBase: 5, weightDifficulty: 3 },
    {
      type: "characterRole",
      familyId: "dot",
      role: "obstacle",
      weightBase: 12,
      weightDifficulty: 10,
    },
    {
      type: "characterRole",
      familyId: "powerpup",
      role: "obstacle",
      weightBase: 7,
      weightDifficulty: 6,
    },
    {
      type: "characterRole",
      familyId: "hoverbot",
      role: "obstacle",
      weightBase: 4,
      weightDifficulty: 4.5,
    },
    { type: "obstacleType", id: "pushpin", weightBase: 3, weightDifficulty: 3 },
    { type: "obstacleType", id: "eraser", weightBase: 3, weightDifficulty: 3 },
  ],
  powerups: [
    {
      type: "characterRole",
      familyId: "scribble",
      role: "powerup",
      chance: 0.16,
      spacingMin: 1480,
      spacingMax: 2340,
      spacingDifficultyBonus: 180,
    },
    {
      type: "characterRole",
      familyId: "logo",
      role: "powerup",
      chance: 0.1,
      spacingMin: 2100,
      spacingMax: 3200,
      spacingDifficultyBonus: 220,
    },
    {
      type: "characterRole",
      familyId: "motherNature",
      role: "powerup",
      chance: 0.08,
      spacingMin: 2400,
      spacingMax: 3400,
      spacingDifficultyBonus: 210,
    },
    {
      type: "characterRole",
      familyId: "will",
      role: "powerup",
      chance: 0.08,
      spacingMin: 2500,
      spacingMax: 3500,
      spacingDifficultyBonus: 220,
    },
  ],
});

const resolveObstacleSpawnEntries = (bestScore, difficulty) =>
  SPAWN_TABLES.obstacles
    .filter((entry) => {
      if (entry.type !== "characterRole") {
        return true;
      }
      return isRoleAvailable(bestScore, entry.familyId, entry.role);
    })
    .map((entry) => ({
      ...entry,
      weight: Math.max(0, (entry.weightBase || 0) + difficulty * (entry.weightDifficulty || 0)),
    }));

const pickWeightedSpawnEntry = (entries, randomValue = Math.random()) => {
  const total = entries.reduce((sum, entry) => sum + Math.max(0, entry.weight || 0), 0);
  if (total <= 0) {
    return entries[0] || null;
  }
  let roll = randomValue * total;
  for (const entry of entries) {
    roll -= Math.max(0, entry.weight || 0);
    if (roll <= 0) {
      return entry;
    }
  }
  return entries[0] || null;
};

const getAvailablePowerupEntries = (bestScore) =>
  SPAWN_TABLES.powerups.filter((powerupEntry) =>
    isRoleAvailable(bestScore, powerupEntry.familyId, powerupEntry.role)
  );

ClippyGame.SPAWN_TABLES = SPAWN_TABLES;
ClippyGame.resolveObstacleSpawnEntries = resolveObstacleSpawnEntries;
ClippyGame.pickWeightedSpawnEntry = pickWeightedSpawnEntry;
ClippyGame.getAvailablePowerupEntries = getAvailablePowerupEntries;
})();
