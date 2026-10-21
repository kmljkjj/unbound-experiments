/**
 * Unbound plugin: Experiments
 * Attempts to unlock Discord Experiments / developer settings on mobile.
 *
 * WARNING: Experiments are unreleased features. They can crash Discord,
 * break UI, or cause unexpected behavior. Enable only what you understand.
 *
 * This is a best-effort patch using Metro module finding. Discord updates
 * frequently change internal module shapes; the plugin may stop working
 * after an app update and need adjustments.
 */

const { metro, patcher, utils } = require('@unbound-app/api');

const Patcher = patcher.createPatcher('experiments');

function tryFind(props) {
  try {
    return metro.findByProps(...props);
  } catch (e) {
    return null;
  }
}

function tryFindStore(name) {
  try {
    if (typeof metro.findStore === 'function') {
      return metro.findStore(name);
    }
  } catch (e) {}
  return null;
}

function unlockExperiments() {
  // Common pattern: force isDeveloper / isStaff style flags so the
  // Experiments settings section becomes visible.
  const candidates = [
    () => tryFind(['isDeveloper']),
    () => tryFind(['isStaff']),
    () => tryFind(['getCurrentUser', 'getUser']),
    () => tryFindStore('UserStore'),
    () => tryFindStore('ExperimentStore'),
    () => tryFindStore('DeveloperExperimentStore'),
  ];

  for (const find of candidates) {
    const mod = find();
    if (!mod) continue;

    // isDeveloper getter / property
    if (mod && typeof mod === 'object') {
      if ('isDeveloper' in mod) {
        try {
          Patcher.instead(mod, 'isDeveloper', () => true);
        } catch (e) {
          try {
            Object.defineProperty(mod, 'isDeveloper', {
              get: () => true,
              configurable: true,
            });
          } catch (_) {}
        }
      }

      // Sometimes nested under default / Z / Y (minified exports)
      for (const key of ['default', 'Z', 'Y', 'exports']) {
        const inner = mod[key];
        if (!inner || typeof inner !== 'object') continue;
        if ('isDeveloper' in inner) {
          try {
            Patcher.instead(inner, 'isDeveloper', () => true);
          } catch (e) {
            try {
              Object.defineProperty(inner, 'isDeveloper', {
                get: () => true,
                configurable: true,
              });
            } catch (_) {}
          }
        }
        if (typeof inner.getCurrentUser === 'function') {
          try {
            Patcher.after(inner, 'getCurrentUser', (_args, user) => {
              if (user && typeof user === 'object') {
                try {
                  user.isStaff = () => true;
                  if (typeof user.hasFlag === 'function') {
                    const orig = user.hasFlag.bind(user);
                    user.hasFlag = (flag) => flag === 1 || orig(flag);
                  }
                } catch (_) {}
              }
              return user;
            });
          } catch (_) {}
        }
      }
    }
  }

  // Try to nudge ExperimentStore / DeveloperExperimentStore if present
  try {
    const ExperimentStore =
      tryFindStore('ExperimentStore') || tryFind(['getExperimentBucket', 'getAllExperiments']);
    const DeveloperExperimentStore =
      tryFindStore('DeveloperExperimentStore') || tryFind(['getSerializedState']);

    // No-op if missing — visibility is usually gated by isDeveloper/isStaff
    void ExperimentStore;
    void DeveloperExperimentStore;
  } catch (_) {}
}

module.exports = {
  start() {
    unlockExperiments();
  },
  stop() {
    Patcher.unpatchAll();
  },
};
