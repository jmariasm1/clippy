(() => {
const ClippyGame = window.ClippyGame || (window.ClippyGame = {});

const BEST_SCORE_KEY = "clippy_airmail_best";
const UNLOCK_SEEN_MAP_KEY = "clippy_airmail_unlock_seen";
const SPECIAL_UNLOCKS_KEY = "clippy_airmail_special_unlocks";

const LEGACY_UNLOCK_KEYS = Object.freeze({
  dot: "clippy_airmail_dot_unlock_seen",
  powerpup: "clippy_airmail_powerpup_unlock_seen",
  hoverbot: "clippy_airmail_hoverbot_unlock_seen",
  scribble: "clippy_airmail_scribble_unlock_seen",
});

const safeStorage = () => {
  if (typeof window === "undefined" || !window.localStorage) {
    return null;
  }
  return window.localStorage;
};

const readBestScore = () => {
  try {
    const storage = safeStorage();
    if (!storage) {
      return 0;
    }
    const raw = storage.getItem(BEST_SCORE_KEY);
    const value = Number.parseInt(raw || "0", 10);
    return Number.isFinite(value) ? Math.max(0, value) : 0;
  } catch (_) {
    return 0;
  }
};

const writeBestScore = (value) => {
  try {
    const storage = safeStorage();
    if (storage) {
      storage.setItem(BEST_SCORE_KEY, String(Math.max(0, Math.floor(value || 0))));
    }
  } catch (_) {
    // Ignore storage failures.
  }
};

const parseUnlockSeenMap = (storage) => {
  try {
    const raw = storage.getItem(UNLOCK_SEEN_MAP_KEY);
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch (_) {
    return null;
  }
};

const readLegacyUnlocks = (storage) => {
  const seen = {};
  for (const [familyId, key] of Object.entries(LEGACY_UNLOCK_KEYS)) {
    try {
      seen[familyId] = storage.getItem(key) === "1";
    } catch (_) {
      seen[familyId] = false;
    }
  }
  return seen;
};

const saveUnlockSeenMap = (storage, seenMap) => {
  try {
    storage.setItem(UNLOCK_SEEN_MAP_KEY, JSON.stringify(seenMap));
  } catch (_) {
    // Ignore storage failures.
  }
};

const createUnlockStore = () => {
  const storage = safeStorage();
  let seen = {};

  const load = () => {
    if (!storage) {
      seen = {};
      return seen;
    }
    const storedMap = parseUnlockSeenMap(storage);
    if (storedMap) {
      seen = storedMap;
      return seen;
    }
    seen = readLegacyUnlocks(storage);
    if (Object.values(seen).some(Boolean)) {
      saveUnlockSeenMap(storage, seen);
    }
    return seen;
  };

  const persist = () => {
    if (storage) {
      saveUnlockSeenMap(storage, seen);
    }
  };

  load();

  return {
    getSeenMap() {
      return { ...seen };
    },
    hasSeen(familyId) {
      return Boolean(seen[familyId]);
    },
    markSeen(familyId) {
      seen = { ...seen, [familyId]: true };
      persist();
    },
    reset() {
      seen = {};
      try {
        if (storage) {
          storage.removeItem(UNLOCK_SEEN_MAP_KEY);
          Object.values(LEGACY_UNLOCK_KEYS).forEach((key) => storage.removeItem(key));
        }
      } catch (_) {
        // Ignore storage failures.
      }
    },
    migrateLegacyKeys() {
      load();
      persist();
      return { ...seen };
    },
  };
};

const parseSpecialUnlockMap = (storage) => {
  try {
    const raw = storage.getItem(SPECIAL_UNLOCKS_KEY);
    if (!raw) {
      return {};
    }
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch (_) {
    return {};
  }
};

const saveSpecialUnlockMap = (storage, unlockMap) => {
  try {
    storage.setItem(SPECIAL_UNLOCKS_KEY, JSON.stringify(unlockMap));
  } catch (_) {
    // Ignore storage failures.
  }
};

const createSpecialUnlockStore = () => {
  const storage = safeStorage();
  let unlocked = storage ? parseSpecialUnlockMap(storage) : {};

  const persist = () => {
    if (storage) {
      saveSpecialUnlockMap(storage, unlocked);
    }
  };

  return {
    getUnlockMap() {
      return { ...unlocked };
    },
    hasUnlocked(id) {
      return Boolean(unlocked[id]);
    },
    unlock(id) {
      unlocked = { ...unlocked, [id]: true };
      persist();
    },
    reset() {
      unlocked = {};
      try {
        if (storage) {
          storage.removeItem(SPECIAL_UNLOCKS_KEY);
        }
      } catch (_) {
        // Ignore storage failures.
      }
    },
  };
};

ClippyGame.BEST_SCORE_KEY = BEST_SCORE_KEY;
ClippyGame.LEGACY_UNLOCK_KEYS = LEGACY_UNLOCK_KEYS;
ClippyGame.UNLOCK_SEEN_MAP_KEY = UNLOCK_SEEN_MAP_KEY;
ClippyGame.SPECIAL_UNLOCKS_KEY = SPECIAL_UNLOCKS_KEY;
ClippyGame.readBestScore = readBestScore;
ClippyGame.writeBestScore = writeBestScore;
ClippyGame.createUnlockStore = createUnlockStore;
ClippyGame.createSpecialUnlockStore = createSpecialUnlockStore;
})();
