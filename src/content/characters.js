(() => {
const ClippyGame = window.ClippyGame || (window.ClippyGame = {});

const family = ({
  id,
  sortOrder,
  nameKey,
  unlockScore,
  menuCard,
  assetKeys,
  roles,
  ...rest
}) => ({
  id,
  sortOrder,
  nameKey,
  unlockScore,
  menuCard,
  assetKeys,
  roles,
  ...rest,
});

const CHARACTER_FAMILIES = Object.freeze([
  family({
    id: "clippy",
    sortOrder: 0,
    nameKey: "family.clippy.name",
    unlockScore: 0,
    menuCard: { assetKey: "character.clippy.idle" },
    assetKeys: {
      idle: "character.clippy.idle",
    },
    roles: {
      playable: {
        behavior: "clippyPlayable",
        hitRadius: 18,
        spriteWidth: 94,
        spriteHeight: 74,
      },
    },
  }),
  family({
    id: "dot",
    sortOrder: 1,
    nameKey: "family.dot.name",
    unlockScore: 30,
    menuCard: { assetKey: "character.dot.idle", lockHintKey: "best30" },
    assetKeys: {
      idle: "character.dot.idle",
      bouncing: "character.dot.bouncing",
      inGround: "character.dot.inGround",
      star1: "character.dot.star1",
      star2: "character.dot.star2",
    },
    roles: {
      playable: {
        behavior: "dotPlayable",
        hitRadius: 20,
        spriteWidth: 66,
        spriteHeight: 66,
      },
      obstacle: {
        behavior: "dotObstacle",
        availabilityScore: 20,
        width: 64,
        radius: 27,
      },
    },
  }),
  family({
    id: "powerpup",
    sortOrder: 2,
    nameKey: "family.powerpup.name",
    unlockScore: 20,
    menuCard: { assetKey: "character.powerpup.idle", lockHintKey: "best20" },
    assetKeys: {
      idle: "character.powerpup.idle",
      flyingUp: "character.powerpup.flyingUp",
    },
    roles: {
      playable: {
        behavior: "powerpupPlayable",
        hitRadius: 21,
        spriteWidth: 80,
        spriteHeight: 80,
      },
      obstacle: {
        behavior: "powerpupObstacle",
        availabilityScore: 10,
        width: 80,
        radius: 34,
      },
    },
  }),
  family({
    id: "hoverbot",
    sortOrder: 3,
    nameKey: "family.hoverbot.name",
    unlockScore: 10,
    menuCard: { assetKey: "character.hoverbot.body", lockHintKey: "best10" },
    assetKeys: {
      body: "character.hoverbot.body",
      eyeSequence: [
        "character.hoverbot.eye1",
        "character.hoverbot.eye2",
        "character.hoverbot.eye3",
        "character.hoverbot.eye4",
        "character.hoverbot.eye5",
        "character.hoverbot.eye6",
        "character.hoverbot.eye7",
      ],
    },
    roles: {
      playable: {
        behavior: "hoverbotPlayable",
        hitRadius: 22,
        spriteWidth: 96,
        spriteHeight: 64,
      },
      obstacle: {
        behavior: "hoverbotObstacle",
        availabilityScore: 0,
        width: 96,
        height: 64,
      },
    },
  }),
  family({
    id: "scribble",
    sortOrder: 4,
    nameKey: "family.scribble.name",
    unlockScore: 5,
    menuCard: { assetKey: "character.scribble.idle1", lockHintKey: "best5" },
    assetKeys: {
      idle: [
        "character.scribble.idle1",
        "character.scribble.idle2",
        "character.scribble.idle3",
      ],
      jump: [
        "character.scribble.jump0",
        "character.scribble.jump1",
        "character.scribble.jump2",
        "character.scribble.jump3",
        "character.scribble.jump4",
      ],
    },
    roles: {
      playable: {
        behavior: "scribblePlayable",
        hitRadius: 20,
        spriteWidth: 92,
        spriteHeight: 60,
        mountedWidth: 88,
        mountedHeight: 72,
        restFrame: 3,
        bounceDuration: 0.5,
      },
      powerup: {
        behavior: "scribblePowerup",
        availabilityScore: 0,
        spawnChance: 0.16,
        spacingMin: 1480,
        spacingMax: 2340,
        spacingDifficultyBonus: 180,
      },
    },
  }),
  family({
    id: "logo",
    sortOrder: 5,
    nameKey: "family.logo.name",
    unlockScore: 25,
    menuCard: { assetKey: "character.logo.idle", lockHintKey: "best25" },
    assetKeys: {
      idle: "character.logo.idle",
    },
    roles: {
      playable: {
        behavior: "logoPlayable",
        hitRadius: 21,
        spriteWidth: 60,
        spriteHeight: 60,
      },
      powerup: {
        behavior: "logoPowerup",
        availabilityScore: 15,
        spawnChance: 0.1,
        spacingMin: 2100,
        spacingMax: 3200,
        spacingDifficultyBonus: 220,
      },
    },
  }),
  family({
    id: "staticLogo",
    sortOrder: 6,
    nameKey: "family.staticLogo.name",
    unlockScore: 0,
    menuCard: { assetKey: "character.logo.idle" },
    assetKeys: {
      idle: "character.logo.idle",
    },
    passwordUnlockKey: "staticLogo",
    roles: {
      playable: {
        behavior: "staticLogoPlayable",
        hitRadius: 21,
        spriteWidth: 60,
        spriteHeight: 60,
      },
    },
  }),
  family({
    id: "motherNature",
    sortOrder: 7,
    nameKey: "family.motherNature.name",
    unlockScore: 35,
    menuCard: { assetKey: "character.motherNature.idle1", lockHintKey: "best35" },
    assetKeys: {
      idle: [
        "character.motherNature.idle1",
        "character.motherNature.idle2",
        "character.motherNature.idle3",
        "character.motherNature.idle4",
      ],
    },
    roles: {
      playable: {
        behavior: "motherNaturePlayable",
        hitRadius: 21,
        spriteWidth: 60,
        spriteHeight: 60,
      },
      powerup: {
        behavior: "motherNaturePowerup",
        availabilityScore: 25,
        spawnChance: 0.08,
        spacingMin: 2400,
        spacingMax: 3400,
        spacingDifficultyBonus: 210,
      },
    },
  }),
  family({
    id: "will",
    sortOrder: 8,
    nameKey: "family.will.name",
    unlockScore: 15,
    menuCard: { assetKey: "character.will.idle1", lockHintKey: "best15" },
    assetKeys: {
      idle: [
        "character.will.idle1",
        "character.will.idle2",
        "character.will.idle3",
        "character.will.idle4",
        "character.will.idle5",
      ],
      feather: "character.will.feather",
    },
    roles: {
      playable: {
        behavior: "willPlayable",
        hitRadius: 21,
        spriteWidth: 76,
        spriteHeight: 76,
      },
      powerup: {
        behavior: "willPowerup",
        availabilityScore: 5,
        spawnChance: 0.08,
        spacingMin: 2500,
        spacingMax: 3500,
        spacingDifficultyBonus: 220,
      },
    },
  }),
]);

const CHARACTER_FAMILY_MAP = Object.freeze(
  Object.fromEntries(CHARACTER_FAMILIES.map((entry) => [entry.id, entry]))
);

const PLAYABLE_FAMILIES = Object.freeze(
  [...CHARACTER_FAMILIES]
    .filter((entry) => Boolean(entry.roles.playable))
    .sort((a, b) => a.sortOrder - b.sortOrder)
);

const getCharacterFamily = (familyId) =>
  CHARACTER_FAMILY_MAP[familyId] || CHARACTER_FAMILY_MAP.clippy;

const getPlayableFamilies = () => PLAYABLE_FAMILIES;

const isFamilyUnlocked = (bestScore, familyId) => {
  const familyEntry = getCharacterFamily(familyId);
  if (familyEntry.passwordUnlockKey) {
    return false;
  }
  return Number(bestScore || 0) >= Number(familyEntry.unlockScore || 0);
};

const isRoleAvailable = (bestScore, familyId, role) => {
  const familyEntry = getCharacterFamily(familyId);
  const roleProfile = familyEntry.roles?.[role];
  if (!roleProfile) {
    return false;
  }
  const threshold = Number.isFinite(roleProfile.availabilityScore)
    ? roleProfile.availabilityScore
    : familyEntry.unlockScore;
  return Number(bestScore || 0) >= Number(threshold || 0);
};

ClippyGame.CHARACTER_FAMILIES = CHARACTER_FAMILIES;
ClippyGame.CHARACTER_FAMILY_MAP = CHARACTER_FAMILY_MAP;
ClippyGame.PLAYABLE_FAMILIES = PLAYABLE_FAMILIES;
ClippyGame.getCharacterFamily = getCharacterFamily;
ClippyGame.getPlayableFamilies = getPlayableFamilies;
ClippyGame.isFamilyUnlocked = isFamilyUnlocked;
ClippyGame.isRoleAvailable = isRoleAvailable;
})();
