(function () {
  "use strict";

  const canvas = document.getElementById("gameCanvas");
  const ctx = canvas.getContext("2d");
  const miniMap = document.getElementById("miniMapCanvas");
  const miniCtx = miniMap.getContext("2d");
  const speedReadout = document.getElementById("speedReadout");
  const staminaReadout = document.getElementById("staminaReadout");
  const collisionReadout = document.getElementById("collisionReadout");
  const touchStick = document.getElementById("touchStick");
  const touchKnob = document.getElementById("touchKnob");
  const touchUseButton = document.getElementById("touchUseButton");
  const touchInteractButton = document.getElementById("touchInteractButton");
  const touchAttackButton = document.getElementById("touchAttackButton");
  const touchSkillButton = document.getElementById("touchSkillButton");
  const touchShadowButton = document.getElementById("touchShadowButton");
  const roleOverlay = document.getElementById("roleOverlay");
  const roleActions = document.getElementById("roleActions");
  const roleDialogTitle = document.getElementById("roleDialogTitle");
  const characterPanel = document.getElementById("characterPanel");
  const characterBackButton = document.getElementById("characterBackButton");
  const roleButtons = document.querySelectorAll("[data-role]");
  const characterButtons = document.querySelectorAll("[data-character]");

  const PLAYER_ROLE = {
    survivor: "survivor",
    hunter: "hunter"
  };

  const SURVIVOR_CHARACTERS = {
    clockmaker: {
      name: "钟表匠",
      roleTag: "修机位",
      rescuePriority: 4,
      chaseDifficulty: 0.92,
      repairDuration: 0.76,
      vaultDuration: 1.16,
      rescueDuration: 1,
      healPower: 1,
      crawlSpeed: 1,
      hitBoostDuration: 1,
      fill: "#e9efe6",
      core: "#d9b76a"
    },
    actor: {
      name: "演员",
      roleTag: "救人位",
      rescuePriority: 1,
      chaseDifficulty: 1.12,
      repairDuration: 1,
      vaultDuration: 0.95,
      rescueDuration: 0.9,
      healPower: 1,
      crawlSpeed: 1,
      hitBoostDuration: 1.15,
      fill: "#f0cfb7",
      core: "#c87f55"
    },
    messenger: {
      name: "信使",
      roleTag: "牵制位",
      rescuePriority: 2,
      chaseDifficulty: 1.38,
      repairDuration: 1.2,
      vaultDuration: 0.66,
      rescueDuration: 1,
      healPower: 1,
      crawlSpeed: 1,
      hitBoostDuration: 1,
      fill: "#c9d6f2",
      core: "#6d8fd4"
    },
    apprentice: {
      name: "学徒",
      roleTag: "辅助位",
      rescuePriority: 3,
      chaseDifficulty: 0.96,
      repairDuration: 1,
      vaultDuration: 1,
      rescueDuration: 1,
      healPower: 1,
      crawlSpeed: 1,
      hitBoostDuration: 1,
      fill: "#b7d6c1",
      core: "#5aa475"
    }
  };

  const HUNTER_CHARACTERS = {
    standard: {
      name: "标准追捕者",
      speed: 292,
      attackRange: 86,
      hitRecovery: 1,
      missRecovery: 1,
      vaultDuration: 1
    },
    brute: {
      name: "重击追捕者",
      speed: 280,
      attackRange: 120,
      hitRecovery: 1.16,
      missRecovery: 1.08,
      vaultDuration: 1.08
    },
    lanternKeeper: {
      name: "提灯人",
      speed: 286,
      attackRange: 92,
      hitRecovery: 1,
      missRecovery: 1,
      vaultDuration: 1,
      fill: "#b95f52",
      core: "#ffd5cd"
    },
    sawbone: {
      name: "锯骨",
      speed: 288,
      attackRange: 96,
      hitRecovery: 1.04,
      missRecovery: 1,
      vaultDuration: 1,
      fill: "#d8d0bd",
      core: "#8f4f45"
    }
  };

  const AI_SURVIVOR_CHARACTER_ORDER = ["clockmaker", "actor", "messenger", "apprentice"];
  const AI_HUNTER_CHARACTER_ORDER = ["standard", "brute", "lanternKeeper", "sawbone"];

  const ATTACK_KEY = "j";
  const SKILL_KEY = "q";
  const SHADOW_KEY = "f";
  const CLOCKMAKER_ID = "clockmaker";
  const ACTOR_ID = "actor";
  const HUNTER_HIT_RECOVERY = 3000;
  const HUNTER_MISS_RECOVERY = 760;
  const HEAL_INJURED_DURATION = 9000;
  const HEAL_DOWNED_DURATION = 11000;
  const SURVIVOR_PALLET_PROMPT_RANGE = 112;
  const SURVIVOR_WINDOW_PROMPT_RANGE = 108;
  const HUNTER_PALLET_PROMPT_RANGE = 126;
  const HUNTER_WINDOW_PROMPT_RANGE = 142;
  const HUNTER_WINDOW_VAULT_DURATION = 640;
  const REPAIR_REQUIRED = 5;
  const HATCH_REPAIR_REQUIRED = 3;
  const PLAYER_REPAIR_DURATION = 60000;
  const AI_REPAIR_DURATION = 60000;
  const GATE_OPEN_DURATION = 25000;
  const ESCAPE_DURATION = 1200;
  const DOWNED_CRAWL_SPEED = 58;
  const CHAIR_ELIMINATION_DURATION = 60000;
  const BLEED_OUT_DURATION = 100000;
  const PICKUP_SURVIVOR_DURATION = 1400;
  const RESCUE_DURATION = 2000;
  const CARRY_STRUGGLE_DURATION = 10500;
  const CARRY_ESCAPE_STUN = 1400;
  const RESCUE_SPEED_BOOST_DURATION = 1800;
  const CHAIR_PRESSURE_RANGE = 420;
  const ACTION_STALE_GRACE = 1400;
  const STUCK_RECOVERY_RADIUS = 22;
  const AI_OBJECTIVE_ABORT_RANGE = 320;
  const AI_HEAL_MIN_INJURED_AGE = 9000;
  const AI_HEAL_TARGET_MIN_HUNTER_DISTANCE = 520;
  const AI_HEALER_MIN_HUNTER_DISTANCE = 540;
  const PRESENCE_TIER_ONE_HITS = 2;
  const PRESENCE_TIER_TWO_HITS = 5;
  const MESSENGER_ID = "messenger";
  const PACKAGE_COOLDOWN = 25000;
  const PACKAGE_STUN_DURATION = 1500;
  const PACKAGE_SPEED = 760;
  const PACKAGE_RANGE = 620;
  const PACKAGE_RADIUS = 13;
  const PACKAGE_HIT_RADIUS = 34;
  const APPRENTICE_ID = "apprentice";
  const STITCH_PACK_PICKUP_RADIUS = 34;
  const STITCH_HEAL_DELAY = 15000;
  const LANTERN_KEEPER_ID = "lanternKeeper";
  const LANTERN_AURA_RANGE = 300;
  const LANTERN_REPAIR_SLOWDOWN = 0.92;
  const SOUL_LAMP_RANGE = 300;
  const SOUL_LAMP_HUNTER_SPEED_BOOST = 1.2;
  const SOUL_LAMP_SURVIVOR_VAULT_SLOWDOWN = 1.1;
  const SOUL_LAMP_LIMIT = 2;
  const SOUL_LAMP_COOLDOWN = 20000;
  const SOUL_LAMP_SHADOW_TELEPORT_COOLDOWN = 30000;
  const SOUL_LAMP_ALERT_COOLDOWN = 4000;
  const SOUL_LAMP_ALERT_DURATION = 2400;
  const SOUL_LAMP_DETECT_FLASH = 1300;
  const SOUL_LAMP_RECALL_RANGE = 112;
  const SOUL_LAMP_DISMANTLE_RANGE = 90;
  const SOUL_LAMP_AI_DISMANTLE_RANGE = 230;
  const SOUL_LAMP_DISMANTLE_DURATION = 4000;
  const REPAIR_CALIBRATION_FIRST_MIN = 7000;
  const REPAIR_CALIBRATION_FIRST_MAX = 10000;
  const REPAIR_CALIBRATION_INTERVAL_MIN = 14000;
  const REPAIR_CALIBRATION_INTERVAL_MAX = 20000;
  const REPAIR_CALIBRATION_DURATION = 2200;
  const REPAIR_CALIBRATION_SUCCESS_BONUS = 0.05;
  const REPAIR_CALIBRATION_PERFECT_BONUS = 0.08;
  const REPAIR_CALIBRATION_FAIL_PENALTY = 0.05;
  const REPAIR_CALIBRATION_SUCCESS_SIZE = 0.24;
  const REPAIR_CALIBRATION_PERFECT_SIZE = 0.08;
  const CLOCKMAKER_CALIBRATION_RANGE_MULTIPLIER = 0.85;
  const CLOCKMAKER_CALIBRATION_BONUS = 0.1;
  const TIME_REWIND_COOLDOWN = 30000;
  const TIME_REWIND_WINDOW = 10000;
  const TIME_REWIND_STEALTH_DURATION = 3000;
  const MAGIC_SHOW_COOLDOWN = 25000;
  const ACTOR_HIT_STEALTH_DURATION = 3000;
  const ACTOR_HIT_SPEED_BOOST = 1.15;
  const ACTOR_DECOY_DURATION = 7600;
  const ACTOR_DECOY_SPEED = 210;
  const SAWBONE_ID = "sawbone";
  const BONE_BLEED_DURATION = 10000;
  const BONE_BLEED_MAX_STACKS = 3;
  const BONE_BLEED_SLOW = 0.05;
  const BONE_BLEED_TIER_TWO_SLOW = 0.06;
  const SAW_DASH_COOLDOWN = 20000;
  const SAW_DASH_DURATION = 680;
  const SAW_DASH_RANGE = 380;
  const SAW_DASH_TURN_SPEED = Math.PI * 2.15;
  const SAW_DASH_TIER_TWO_RANGE = 500;
  const SAW_DASH_TIER_TWO_TURN_SPEED = Math.PI * 2.45;
  const SAW_DASH_TIER_TWO_DURABILITY = 100;
  const SAW_DASH_DURABILITY_BASE_DRAIN = 3;
  const SAW_DASH_DURABILITY_TURN_DRAIN = 5;
  const SAW_DASH_DURABILITY_SLIDE_DRAIN = 0.16;
  const SAW_DASH_ATTACK_LOCKOUT = 3000;
  const SHORT_SAW_WINDOW = 1500;
  const SHORT_SAW_TIER_TWO_WINDOW = 2000;
  const SHORT_SAW_DURATION = 390;
  const SHORT_SAW_RANGE = 230;
  const SHORT_SAW_TURN_SPEED = Math.PI * 2.65;

  const world = {
    width: 2400,
    height: 1760,
    tile: 80
  };

  const nav = {
    cell: 80,
    cols: Math.ceil(world.width / 80),
    rows: Math.ceil(world.height / 80)
  };

  const player = {
    name: "你",
    kind: "player",
    characterId: CLOCKMAKER_ID,
    initialX: 340,
    initialY: 330,
    x: 340,
    y: 330,
    radius: 22,
    speed: 250,
    sprintSpeed: 360,
    vx: 0,
    vy: 0,
    stamina: 100,
    angle: 0,
    state: "healthy",
    healProgress: 0,
    damageProgress: 0,
    bleedStacks: [],
    chairProgress: 0,
    injuredAt: null,
    downedAt: null,
    nextChairEliminates: false,
    carryProgress: 0,
    chair: null,
    boostUntil: 0,
    stitchPack: null,
    timeDevice: null,
    invisibleUntil: 0,
    action: null,
    fill: "#e9efe6",
    core: "#d9b76a",
    nextInteractAt: 0,
    nextPackageAt: 0,
    nextTimeRewindAt: 0,
    nextMagicShowAt: 0,
    magicShowMode: "rescue",
    wanderTarget: null,
    kiteDecision: null,
    healDecision: null,
    objectiveDecision: null,
    path: [],
    pathGoal: null,
    repathAt: 0
  };

  const teammates = [
    createAISurvivor("队友1", 1120, 380, "#b7d6c1", "#5aa475"),
    createAISurvivor("队友2", 460, 1260, "#c9d6f2", "#6d8fd4"),
    createAISurvivor("队友3", 1720, 1180, "#f0cfb7", "#c87f55")
  ];

  const hunter = {
    kind: "hunter",
    characterId: "standard",
    x: 960,
    y: 360,
    radius: 25,
    speed: 292,
    vx: 0,
    vy: 0,
    turnSpeed: Math.PI * 1.8,
    attackRange: 86,
    attackArc: Math.PI,
    attackCooldown: 0.65,
    attackWindup: 0.16,
    lastAttackAt: -10000,
    wipeUntil: 0,
    lastAttackHit: false,
    stunnedUntil: 0,
    presenceHits: 0,
    presenceTier: 0,
    nextShadowTeleportAt: 0,
    nextSawDashAt: 0,
    sawAttackLockedUntil: 0,
    shortSawAvailableUntil: 0,
    pendingSawWipe: false,
    pendingSawWipeAt: 0,
    action: null,
    angle: Math.PI,
    status: "chasing",
    target: null,
    carrying: null,
    path: [],
    pathGoal: null,
    repathAt: 0
  };

  const camera = {
    x: 0,
    y: 0,
    zoom: 1
  };

  const input = {
    up: false,
    down: false,
    left: false,
    right: false,
    sprint: false,
    touchX: 0,
    touchY: 0
  };

  const walls = [
    rect(0, 0, world.width, 54),
    rect(0, world.height - 54, world.width, 54),
    rect(0, 0, 54, world.height),
    rect(world.width - 54, 0, 54, world.height),
    rect(250, 190, 360, 70),
    rect(760, 170, 92, 390),
    rect(1010, 170, 430, 76),
    rect(1650, 160, 92, 360),
    rect(330, 470, 90, 420),
    rect(540, 620, 460, 80),
    rect(1210, 460, 90, 520),
    rect(1450, 640, 410, 78),
    rect(1900, 480, 80, 430),
    rect(170, 1030, 420, 80),
    rect(760, 930, 88, 420),
    rect(1020, 1120, 360, 86),
    rect(610, 190, 40, 70),
    rect(720, 190, 40, 70),
    rect(1000, 620, 50, 80),
    rect(1140, 620, 70, 80),
    rect(590, 1030, 40, 80),
    rect(720, 1030, 40, 80),
    rect(1440, 1120, 40, 86),
    rect(1560, 1120, 40, 86),
    rect(1890, 1124, 44, 72),
    rect(2006, 1124, 44, 72),
    rect(1760, 1464, 44, 72),
    rect(1876, 1464, 44, 72),
    rect(2050, 1204, 44, 72),
    rect(2166, 1204, 44, 72),
    rect(2070, 1564, 44, 72),
    rect(2186, 1564, 44, 72)
  ];

  const pallets = [
    prop(685, 225, 82, 10, 0, "standing"),
    prop(1095, 660, 92, 10, 0, "standing"),
    prop(675, 1070, 92, 10, 0, "standing"),
    prop(1520, 1163, 84, 10, 0, "standing"),
    prop(1970, 1160, 68, 10, 0, "standing"),
    prop(1840, 1500, 68, 10, 0, "standing"),
    prop(2130, 1240, 68, 10, 0, "standing"),
    prop(2150, 1600, 68, 10, 0, "standing")
  ];

  const windows = [
    prop(390, 225, 118, 44, 0, "window"),
    prop(806, 350, 44, 118, 0, "window"),
    prop(1220, 208, 118, 44, 0, "window"),
    prop(1696, 320, 44, 118, 0, "window"),
    prop(375, 685, 44, 118, 0, "window"),
    prop(750, 660, 118, 44, 0, "window"),
    prop(1255, 700, 44, 118, 0, "window"),
    prop(360, 1070, 118, 44, 0, "window"),
    prop(805, 1140, 44, 118, 0, "window")
  ];

  const repairPoints = [
    objective(585, 360),
    objective(1130, 375),
    objective(1800, 330),
    objective(1040, 850),
    objective(440, 1270),
    objective(1620, 1320),
    objective(1980, 1120),
    objective(2120, 1500),
    objective(2250, 820)
  ];

  const exitGates = [
    exitGate(190, 720),
    exitGate(2240, 1460)
  ];

  const hatch = {
    x: 1510,
    y: 1510,
    spawned: false,
    opened: false
  };

  const chairs = [
    chair(190, 320), chair(520, 320), chair(910, 330), chair(1450, 320), chair(1970, 330),
    chair(220, 560), chair(700, 520), chair(1120, 520), chair(1530, 520), chair(2190, 650),
    chair(260, 860), chair(650, 830), chair(1110, 900), chair(1540, 850), chair(2040, 1060),
    chair(360, 1320), chair(1180, 1320), chair(1730, 1440), chair(2220, 1300), chair(2260, 1600)
  ];

  let width = 0;
  let height = 0;
  let dpr = 1;
  let lastTime = performance.now();
  let chasePulseUntil = 0;
  let selectedRole = null;
  let pendingRole = null;
  let selectedSurvivorCharacter = CLOCKMAKER_ID;
  let selectedHunterCharacter = "standard";
  let matchStarted = false;
  let matchResult = null;
  let nextSoulLampAt = 0;
  let lanternAlert = null;
  let soulLampId = 0;
  let packageProjectileId = 0;
  let packageAim = null;
  let lastAimPointer = null;
  let stitchPackDropId = 0;
  let actorDecoyId = 0;
  const soulLamps = [];
  const packageProjectiles = [];
  const stitchPackDrops = [];
  const actorDecoys = [];
  const DEVICE_ASSET_ROOT = `${window.location.pathname.includes("/demos/") ? "../" : "./"}assets/devices/`;
  const DEVICE_IMAGES = createDeviceImages({
    repair: "repair-machine.png",
    chair: "rocket-chair.png",
    gate: "exit-gate.png",
    hatchClosed: "hatch-closed.png",
    hatchOpen: "hatch-open.png"
  });

  function createDeviceImages(files) {
    return Object.fromEntries(Object.entries(files).map(([key, file]) => {
      const image = new Image();
      image.decoding = "async";
      image.src = `${DEVICE_ASSET_ROOT}${file}`;
      return [key, image];
    }));
  }

  function rect(x, y, w, h) {
    return { x, y, w, h };
  }

  function prop(x, y, w, h, angle, label) {
    return { x, y, w, h, angle, label };
  }

  function objective(x, y) {
    return { x, y, progress: 0, completed: false, workers: [] };
  }

  function exitGate(x, y) {
    return { x, y, label: "exit", progress: 0, opened: false, workers: [] };
  }

  function chair(x, y) {
    return { x, y, survivor: null };
  }

  function createAISurvivor(name, x, y, fill, core) {
    return {
      name,
      kind: "ai",
      characterId: CLOCKMAKER_ID,
      initialX: x,
      initialY: y,
      x,
      y,
      radius: 22,
      speed: player.speed,
      sprintSpeed: player.sprintSpeed,
      vx: 0,
      vy: 0,
      stamina: 100,
      angle: 0,
      state: "healthy",
      healProgress: 0,
      damageProgress: 0,
      bleedStacks: [],
      chairProgress: 0,
      injuredAt: null,
      downedAt: null,
      nextChairEliminates: false,
      carryProgress: 0,
      chair: null,
      boostUntil: 0,
      stitchPack: null,
      timeDevice: null,
      invisibleUntil: 0,
      action: null,
      fill,
      core,
      nextInteractAt: 0,
      nextPackageAt: 0,
      nextTimeRewindAt: 0,
      nextMagicShowAt: 0,
      magicShowMode: "rescue",
      wanderTarget: null,
      kiteDecision: null,
      healDecision: null,
      objectiveDecision: null,
      path: [],
      pathGoal: null,
      repathAt: 0
    };
  }

  function getSurvivors() {
    return [player].concat(teammates);
  }

  function getSurvivorCharacter(actor) {
    return SURVIVOR_CHARACTERS[actor.characterId] || SURVIVOR_CHARACTERS.clockmaker;
  }

  function isClockmaker(actor) {
    return actor && actor.characterId === CLOCKMAKER_ID;
  }

  function isActor(actor) {
    return actor && actor.characterId === ACTOR_ID;
  }

  function isMessenger(actor) {
    return actor && actor.characterId === MESSENGER_ID;
  }

  function isApprentice(actor) {
    return actor && actor.characterId === APPRENTICE_ID;
  }

  function hasSurvivorSkill(actor) {
    return isMessenger(actor) || isApprentice(actor) || isClockmaker(actor) || isActor(actor);
  }

  function getSurvivorMultiplier(actor, key, fallback = 1) {
    const value = getSurvivorCharacter(actor)[key];
    return Number.isFinite(value) ? value : fallback;
  }

  function getSurvivorRoleLabel(actor) {
    return getSurvivorCharacter(actor).roleTag || "修机位";
  }

  function getSurvivorRescuePriority(actor) {
    return getSurvivorCharacter(actor).rescuePriority || 4;
  }

  function getHunterCharacter() {
    return HUNTER_CHARACTERS[hunter.characterId] || HUNTER_CHARACTERS.standard;
  }

  function isLanternKeeper() {
    return hunter.characterId === LANTERN_KEEPER_ID;
  }

  function isSawbone() {
    return hunter.characterId === SAWBONE_ID;
  }

  function hunterHasSkill() {
    return isLanternKeeper() || isSawbone();
  }

  function getSoulLampLimit() {
    return isLanternKeeper() && hunter.presenceTier >= 2 ? SOUL_LAMP_LIMIT + 1 : SOUL_LAMP_LIMIT;
  }

  function applySurvivorCharacter(survivor, characterId) {
    const config = SURVIVOR_CHARACTERS[characterId] || SURVIVOR_CHARACTERS.clockmaker;
    survivor.characterId = characterId;
    survivor.fill = config.fill;
    survivor.core = config.core;
  }

  function applyHunterCharacter(characterId) {
    const config = HUNTER_CHARACTERS[characterId] || HUNTER_CHARACTERS.standard;
    hunter.characterId = characterId;
    hunter.speed = config.speed;
    hunter.attackRange = config.attackRange;
  }

  function assignCharactersForMatch() {
    if (selectedRole === PLAYER_ROLE.survivor) {
      applyHunterCharacter(pickAIHunterCharacter());
      applySurvivorCharacter(player, selectedSurvivorCharacter);
      const remaining = shuffled(AI_SURVIVOR_CHARACTER_ORDER.filter((id) => id !== selectedSurvivorCharacter));
      teammates.forEach((survivor, index) => {
        applySurvivorCharacter(survivor, remaining[index] || AI_SURVIVOR_CHARACTER_ORDER[index]);
      });
      return;
    }

    applyHunterCharacter(selectedHunterCharacter);
    const survivorCharacters = shuffled(AI_SURVIVOR_CHARACTER_ORDER);
    getSurvivors().forEach((survivor, index) => {
      applySurvivorCharacter(survivor, survivorCharacters[index] || CLOCKMAKER_ID);
    });
  }

  function pickAIHunterCharacter() {
    const options = shuffled(AI_HUNTER_CHARACTER_ORDER);
    return options[0] || "standard";
  }

  function getSurvivorVaultDuration(actor, baseDuration) {
    return Math.round(baseDuration * getSurvivorMultiplier(actor, "vaultDuration") * getSoulLampVaultSlowdown(actor));
  }

  function getHunterVaultDuration(baseDuration) {
    return Math.round(baseDuration * getHunterCharacter().vaultDuration);
  }

  function isInSoulLampRange(actor) {
    return isLanternKeeper() && soulLamps.some((lamp) => distanceBetween(actor, lamp) <= SOUL_LAMP_RANGE);
  }

  function getHunterMoveSpeed() {
    return hunter.speed * (isInSoulLampRange(hunter) ? SOUL_LAMP_HUNTER_SPEED_BOOST : 1);
  }

  function getSurvivorMoveSpeedMultiplier(actor, now = performance.now()) {
    const actorBoost = isActor(actor) && isSurvivorInvisible(actor, now) ? ACTOR_HIT_SPEED_BOOST : 1;
    return getBoneBleedSpeedMultiplier(actor, now) * actorBoost;
  }

  function getBoneBleedStacks(actor, now = performance.now()) {
    if (!actor || !Array.isArray(actor.bleedStacks)) return 0;
    return actor.bleedStacks.filter((expiresAt) => expiresAt > now).length;
  }

  function getBoneBleedSpeedMultiplier(actor, now = performance.now()) {
    const stacks = getBoneBleedStacks(actor, now);
    if (stacks <= 0) return 1;
    const slowPerStack = hunter.presenceTier >= 2 ? BONE_BLEED_TIER_TWO_SLOW : BONE_BLEED_SLOW;
    return Math.max(0.64, 1 - stacks * slowPerStack);
  }

  function pruneBoneBleed(actor, now) {
    if (!actor || !Array.isArray(actor.bleedStacks) || actor.bleedStacks.length === 0) return;
    actor.bleedStacks = actor.bleedStacks.filter((expiresAt) => expiresAt > now);
  }

  function applyBoneBleed(actor, now) {
    if (!actor || actor.escaped || actor.state === "eliminated") return;
    pruneBoneBleed(actor, now);
    actor.bleedStacks.push(now + BONE_BLEED_DURATION);
    actor.bleedStacks.sort((a, b) => a - b);
    if (actor.bleedStacks.length > BONE_BLEED_MAX_STACKS) {
      actor.bleedStacks = actor.bleedStacks.slice(actor.bleedStacks.length - BONE_BLEED_MAX_STACKS);
    }
  }

  function isSurvivorInvisible(survivor, now = performance.now()) {
    return Boolean(survivor && now < (survivor.invisibleUntil || 0));
  }

  function shouldHideSurvivorFromHunterView(survivor, now = performance.now()) {
    return selectedRole === PLAYER_ROLE.hunter && isActor(survivor) && isSurvivorInvisible(survivor, now);
  }

  function getSoulLampVaultSlowdown(actor) {
    return isInSoulLampRange(actor) ? SOUL_LAMP_SURVIVOR_VAULT_SLOWDOWN : 1;
  }

  function getSurvivorRepairDuration(actor, baseDuration) {
    return Math.round(baseDuration * getSurvivorMultiplier(actor, "repairDuration"));
  }

  function getSurvivorRescueDuration(actor) {
    return Math.round(RESCUE_DURATION * getSurvivorMultiplier(actor, "rescueDuration"));
  }

  function getSurvivorHitBoostDuration(actor, baseDuration) {
    return Math.round(baseDuration * getSurvivorMultiplier(actor, "hitBoostDuration"));
  }

  function getSurvivorHealPower(actor) {
    return getSurvivorMultiplier(actor, "healPower");
  }

  function getRepairSpeedMultiplier(actor) {
    if (isLanternKeeper() && distanceBetween(actor, hunter) <= LANTERN_AURA_RANGE) {
      return LANTERN_REPAIR_SLOWDOWN;
    }
    return 1;
  }

  function getSoulLampCooldownLeft(now) {
    return Math.max(0, nextSoulLampAt - now);
  }

  function getShadowTeleportCooldownLeft(now) {
    return Math.max(0, (hunter.nextShadowTeleportAt || 0) - now);
  }

  function getSawDashCooldownLeft(now) {
    if (canUseShortSaw(now)) return 0;
    return Math.max(0, (hunter.nextSawDashAt || 0) - now);
  }

  function getSawAttackLockoutLeft(now) {
    return Math.max(0, (hunter.sawAttackLockedUntil || 0) - now);
  }

  function getPackageCooldownLeft(actor, now) {
    return Math.max(0, (actor.nextPackageAt || 0) - now);
  }

  function getTimeRewindCooldownLeft(actor, now) {
    return Math.max(0, (actor.nextTimeRewindAt || 0) - now);
  }

  function getMagicShowCooldownLeft(actor, now) {
    return Math.max(0, (actor.nextMagicShowAt || 0) - now);
  }

  function canThrowPackage(actor, now) {
    return matchStarted &&
      isMessenger(actor) &&
      actor.state !== "downed" &&
      actor.state !== "seated" &&
      actor.state !== "carried" &&
      actor.state !== "eliminated" &&
      !actor.action &&
      !actor.escaped &&
      now >= (actor.nextPackageAt || 0);
  }

  function canPlaceTimeDevice(actor, now) {
    return matchStarted &&
      isClockmaker(actor) &&
      (actor.state === "healthy" || actor.state === "injured") &&
      !actor.action &&
      !actor.escaped &&
      !actor.timeDevice &&
      now >= (actor.nextTimeRewindAt || 0);
  }

  function canUseMagicShow(actor, now) {
    return matchStarted &&
      isActor(actor) &&
      (actor.state === "healthy" || actor.state === "injured") &&
      !actor.action &&
      !actor.escaped &&
      now >= (actor.nextMagicShowAt || 0);
  }

  function canActivateTimeRewind(actor, now) {
    return matchStarted &&
      isClockmaker(actor) &&
      actor.timeDevice &&
      now <= actor.timeDevice.until &&
      !actor.escaped &&
      actor.state !== "seated" &&
      actor.state !== "carried" &&
      actor.state !== "eliminated";
  }

  function canPlaceStitchPack(actor) {
    return matchStarted &&
      isApprentice(actor) &&
      actor.state !== "downed" &&
      actor.state !== "seated" &&
      actor.state !== "carried" &&
      actor.state !== "eliminated" &&
      !actor.action &&
      !actor.escaped;
  }

  function canPlaceSoulLamp(now) {
    return matchStarted &&
      selectedRole === PLAYER_ROLE.hunter &&
      isLanternKeeper() &&
      !hunter.action &&
      !hunter.carrying &&
      now >= hunter.stunnedUntil &&
      now >= hunter.wipeUntil &&
      now >= nextSoulLampAt &&
      soulLamps.length < getSoulLampLimit();
  }

  function canShadowTeleport(now) {
    return matchStarted &&
      selectedRole === PLAYER_ROLE.hunter &&
      isLanternKeeper() &&
      hunter.presenceTier >= 1 &&
      soulLamps.length > 0 &&
      !hunter.action &&
      !hunter.carrying &&
      now >= hunter.stunnedUntil &&
      now >= hunter.wipeUntil &&
      now >= (hunter.nextShadowTeleportAt || 0);
  }

  function canUseShortSaw(now) {
    return isSawbone() &&
      hunter.presenceTier >= 1 &&
      now < (hunter.shortSawAvailableUntil || 0);
  }

  function canStartSawDash(now) {
    return matchStarted &&
      isSawbone() &&
      !hunter.action &&
      !hunter.carrying &&
      now >= hunter.stunnedUntil &&
      now >= hunter.wipeUntil &&
      (canUseShortSaw(now) || now >= (hunter.nextSawDashAt || 0));
  }

  function resize() {
    dpr = Math.max(1, Math.min(window.devicePixelRatio || 1, 2));
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const miniBox = miniMap.getBoundingClientRect();
    miniMap.width = Math.floor(miniBox.width * dpr);
    miniMap.height = Math.floor(miniBox.height * dpr);
    miniCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function keyToInput(key, value) {
    const code = key.toLowerCase();
    if (value && code === "r" && selectedRole) restartCurrentMatch();
    if (value && key === " ") handlePlayerInteraction(performance.now());
    if (value && code === "e") handlePlayerUse(performance.now());
    if (value && code === ATTACK_KEY) handlePlayerAttack(performance.now());
    if (value && code === SHADOW_KEY) handlePlayerShadowSkill(performance.now());
    if (code === SKILL_KEY) {
      if (selectedRole === PLAYER_ROLE.survivor && isMessenger(player)) {
        if (value) startPackageAim(player, performance.now());
        else finishPackageAim(performance.now());
      } else if (selectedRole === PLAYER_ROLE.survivor && isApprentice(player)) {
        if (value) handlePlayerSkill(performance.now());
      } else if (selectedRole === PLAYER_ROLE.hunter && isSawbone()) {
        if (value) handlePlayerSkill(performance.now());
      } else if (value) {
        handlePlayerSkill(performance.now());
      }
    }
    if (code === "w" || key === "ArrowUp") input.up = value;
    if (code === "s" || key === "ArrowDown") input.down = value;
    if (code === "a" || key === "ArrowLeft") input.left = value;
    if (code === "d" || key === "ArrowRight") input.right = value;
    if (key === "Shift") input.sprint = value;
  }

  function getMoveVector() {
    let x = 0;
    let y = 0;
    if (input.left) x -= 1;
    if (input.right) x += 1;
    if (input.up) y -= 1;
    if (input.down) y += 1;
    x += input.touchX;
    y += input.touchY;

    const length = Math.hypot(x, y);
    if (length > 1) {
      x /= length;
      y /= length;
    }
    return { x, y, length };
  }

  function circleHitsRect(cx, cy, radius, box) {
    const closestX = Math.max(box.x, Math.min(cx, box.x + box.w));
    const closestY = Math.max(box.y, Math.min(cy, box.y + box.h));
    return Math.hypot(cx - closestX, cy - closestY) < radius;
  }

  function collides(x, y, radius = player.radius) {
    return getCollisionRects().some((wall) => circleHitsRect(x, y, radius, wall));
  }

  function getCollisionRects() {
    const droppedPallets = pallets
      .filter((pallet) => pallet.label === "dropped")
      .map(getPalletCollisionRect);
    return walls.concat(droppedPallets);
  }

  function getPalletCollisionRect(pallet) {
    const width = Math.max(34, pallet.w - 28);
    const thickness = 10;
    if (Math.abs(pallet.angle - Math.PI / 2) < 0.1) {
      return rect(pallet.x - thickness / 2, pallet.y - width / 2, thickness, width);
    }
    return rect(pallet.x - width / 2, pallet.y - thickness / 2, width, thickness);
  }

  function movePlayer(dt) {
    if (selectedRole === PLAYER_ROLE.hunter) return moveControlledHunter(dt);
    return moveControlledSurvivor(dt);
  }

  function moveControlledSurvivor(dt) {
    if (player.escaped) {
      player.vx = 0;
      player.vy = 0;
      return;
    }

    const now = performance.now();
    const move = getMoveVector();
    if (shouldCancelActionOnMove(player, move)) {
      cancelActionFromMovement(player);
    }

    if (updateActorAction(player, now)) return;

    if (player.state === "downed") {
      if (isBeingPickedUp(player)) {
        player.vx = 0;
        player.vy = 0;
        return;
      }
      const crawlSpeed = DOWNED_CRAWL_SPEED * getSurvivorMultiplier(player, "crawlSpeed") * getSurvivorMoveSpeedMultiplier(player, now);
      const dx = move.x * crawlSpeed * dt;
      const dy = move.y * crawlSpeed * dt;
      if (move.length > 0.1) player.angle = Math.atan2(move.y, move.x);
      moveActor(player, dx, dy);
      player.vx = dx / Math.max(dt, 0.001);
      player.vy = dy / Math.max(dt, 0.001);
      return;
    }

    if (player.state !== "healthy" && player.state !== "injured") {
      player.vx = 0;
      player.vy = 0;
      return;
    }

    const wantsSprint = input.sprint && player.stamina > 2 && move.length > 0.1;
    const injuredPenalty = player.state === "injured" ? 0.88 : 1;
    const hitBoost = now < player.boostUntil ? 1.45 : 1;
    const speed = (wantsSprint ? player.sprintSpeed : player.speed) * injuredPenalty * hitBoost * getSurvivorMoveSpeedMultiplier(player, now);
    const dx = move.x * speed * dt;
    const dy = move.y * speed * dt;

    if (move.length > 0.1) {
      player.angle = Math.atan2(move.y, move.x);
    }

    moveActor(player, dx, dy);

    if (wantsSprint) {
      player.stamina = Math.max(0, player.stamina - 29 * dt);
    } else {
      player.stamina = Math.min(100, player.stamina + 22 * dt);
    }

    player.vx = dx / Math.max(dt, 0.001);
    player.vy = dy / Math.max(dt, 0.001);
  }

  function moveControlledHunter(dt) {
    const now = performance.now();
    if (updateActorAction(hunter, now)) return;

    if (now < hunter.stunnedUntil) {
      hunter.status = "stunned";
      hunter.vx = 0;
      hunter.vy = 0;
      return;
    }

    if (now < hunter.wipeUntil) {
      hunter.status = hunter.lastAttackHit ? "wipe" : "miss";
      hunter.vx = 0;
      hunter.vy = 0;
      return;
    }

    updateCarriedSurvivorPosition();

    const move = getMoveVector();
    const speed = getHunterMoveSpeed() * getHunterCarrySpeedMultiplier();
    const dx = move.x * speed * dt;
    const dy = move.y * speed * dt;
    const beforeX = hunter.x;
    const beforeY = hunter.y;

    if (move.length > 0.1) hunter.angle = Math.atan2(move.y, move.x);
    moveActor(hunter, dx, dy);
    hunter.vx = (hunter.x - beforeX) / Math.max(dt, 0.001);
    hunter.vy = (hunter.y - beforeY) / Math.max(dt, 0.001);
    hunter.target = chooseHunterTarget();
    hunter.status = hunter.carrying ? "carrying" : hunter.target ? "controlled" : "allDowned";
  }

  function updateTeammates(dt, now) {
    const aiSurvivors = selectedRole === PLAYER_ROLE.hunter ? getSurvivors() : teammates;
    aiSurvivors.forEach((survivor) => updateAISurvivor(survivor, dt, now));
  }

  function updateAISurvivor(survivor, dt, now) {
    if (survivor.escaped) return;
    if (survivor.state === "eliminated" || survivor.state === "seated" || survivor.state === "carried") return;
    const hunterDistance = distanceBetween(survivor, hunter);
    if (maybeInterruptAIObjectiveForHunterThreat(survivor, hunterDistance, now)) {
      handleAIInteraction(survivor, now, hunterDistance);
      moveAISurvivorAway(survivor, dt, now, hunterDistance);
      return;
    }
    if (maybeInterruptAIHealingForHunterThreat(survivor, hunterDistance, now)) {
      handleAIInteraction(survivor, now, hunterDistance);
      moveAISurvivorAway(survivor, dt, now, hunterDistance);
      return;
    }
    maybeInterruptAIObjectiveForRescue(survivor, now);
    if (updateActorAction(survivor, now)) return;

    if (survivor.state === "downed") {
      if (isBeingPickedUp(survivor)) {
        survivor.vx = 0;
        survivor.vy = 0;
        return;
      }
      if (updateAIDownedHatchCrawl(survivor, dt, now)) return;
      survivor.vx = 0;
      survivor.vy = 0;
      return;
    }

    maybeThrowAIPackage(survivor, hunterDistance, now);
    if (maybeUseAIStitchPack(survivor, hunterDistance, now)) return;

    if (updateAIChairRescue(survivor, dt, now, hunterDistance)) return;
    if (updateAISoulLampDismantle(survivor, dt, now, hunterDistance)) return;
    if (survivor.healDecision && updateAIHealing(survivor, dt, now, hunterDistance)) return;

    if (isAISafeForObjective(survivor, hunterDistance)) {
      if (updateAIObjective(survivor, dt, now, hunterDistance)) return;
    }

    if (updateAIHealing(survivor, dt, now, hunterDistance)) return;

    if (hunter.target !== survivor && updateAIObjective(survivor, dt, now, hunterDistance)) return;

    if (hunterDistance < 580) {
      handleAIInteraction(survivor, now, hunterDistance);
      moveAISurvivorAway(survivor, dt, now, hunterDistance);
      return;
    }

    if (updateAIObjective(survivor, dt, now, hunterDistance)) return;

    moveAISurvivorWander(survivor, dt, now);
  }

  function maybeInterruptAIObjectiveForHunterThreat(survivor, hunterDistance, now) {
    if (!survivor.action || !["repairing", "openingGate"].includes(survivor.action.kind)) return false;
    if (hunterDistance > AI_OBJECTIVE_ABORT_RANGE) return false;

    if (survivor.action.kind === "repairing") cancelRepair(survivor.action);
    if (survivor.action.kind === "openingGate") cancelGateOpen(survivor.action);
    survivor.action = null;
    survivor.objectiveDecision = null;
    survivor.kiteDecision = null;
    survivor.wanderTarget = null;
    survivor.path = [];
    survivor.pathGoal = null;
    survivor.nextInteractAt = now + 450;
    return true;
  }

  function maybeThrowAIPackage(survivor, hunterDistance, now) {
    if (!canThrowPackage(survivor, now)) return false;
    const pressured = hunter.target === survivor && hunterDistance < 460;
    const rescueCarry = Boolean(hunter.carrying) && hunterDistance < 520;
    if (!pressured && !rescueCarry) return false;
    if (!hasWalkableLine(survivor.x, survivor.y, hunter.x, hunter.y, PACKAGE_RADIUS)) return false;
    throwPackage(survivor, Math.atan2(hunter.y - survivor.y, hunter.x - survivor.x), now);
    return true;
  }

  function maybeUseAIStitchPack(survivor, hunterDistance, now) {
    if (!canPlaceStitchPack(survivor)) return false;
    if (hunter.target === survivor || hunterDistance < 260) return false;
    const target = findNearestStitchPackTarget(survivor, 280);
    if (!target) return false;
    placeStitchPack(survivor, now, target);
    return true;
  }

  function maybeInterruptAIObjectiveForRescue(survivor, now) {
    if (!survivor.action || !["repairing", "openingGate"].includes(survivor.action.kind)) return;
    if (survivor.state === "downed" || survivor.escaped || hunter.target === survivor) return;
    if (distanceBetween(survivor, hunter) < 180) return;

    const chairTarget = getAIChairRescueTarget(survivor);
    if (chairTarget && isAISafeToRescueChair(survivor, distanceBetween(survivor, hunter), chairTarget)) {
      cancelAIObjectiveAction(survivor);
      return;
    }

    return;
  }

  function cancelAIObjectiveAction(survivor) {
    if (survivor.action && survivor.action.kind === "repairing") cancelRepair(survivor.action);
    if (survivor.action && survivor.action.kind === "openingGate") cancelGateOpen(survivor.action);
    survivor.action = null;
    survivor.objectiveDecision = null;
    survivor.kiteDecision = null;
    survivor.wanderTarget = null;
    survivor.path = [];
  }

  function maybeInterruptAIHealingForHunterThreat(survivor, hunterDistance, now) {
    if (!survivor.action || survivor.action.kind !== "healing") return false;
    const target = survivor.action.target;
    const targetHunterDistance = target ? distanceBetween(hunter, target) : Infinity;
    if (hunter.target !== survivor && hunterDistance > 220 && targetHunterDistance > 190) return false;

    cancelHealing(survivor.action);
    survivor.action = null;
    survivor.healDecision = null;
    survivor.kiteDecision = null;
    survivor.wanderTarget = null;
    survivor.path = [];
    survivor.pathGoal = null;
    survivor.nextInteractAt = now + 650;
    return true;
  }

  function updateAIHealing(survivor, dt, now, hunterDistance) {
    if (!isAISafeToHeal(survivor, hunterDistance)) {
      survivor.healDecision = null;
      return false;
    }

    const target = getAIHealTarget(survivor, now);
    if (!target) return false;

    survivor.kiteDecision = null;
    survivor.wanderTarget = null;

    if (distanceBetween(survivor, target) < 88) {
      startHealing(survivor, target, now);
      survivor.healDecision = null;
      return true;
    }

    const standPoint = getHealStandPoint(survivor, target);
    const moved = moveActorToPoint(survivor, standPoint.x, standPoint.y, survivor.speed * 0.92, dt, now);
    if (moved < 0.5 && now > survivor.repathAt - 120) {
      survivor.path = [];
      survivor.healDecision = null;
    }
    return true;
  }

  function isAISafeToHeal(survivor, hunterDistance) {
    if (survivor.action || survivor.state === "downed") return false;
    if (survivor.state === "seated" || survivor.state === "carried" || survivor.state === "eliminated") return false;
    if (hunter.target === survivor) return false;
    if (hunterDistance < AI_HEALER_MIN_HUNTER_DISTANCE) return false;
    if (hunter.status === "attacking" || hunter.status === "cooldown") return false;
    return true;
  }

  function updateAIObjective(survivor, dt, now, hunterDistance) {
    if (!isAISafeForObjective(survivor, hunterDistance)) {
      survivor.objectiveDecision = null;
      return false;
    }

    if (isHatchOpen()) {
      return updateAIHatchEscape(survivor, dt, now);
    }

    if (areExitsPowered()) {
      return updateAIEscape(survivor, dt, now);
    }

    return updateAIRepair(survivor, dt, now);
  }

  function updateAIChairRescue(survivor, dt, now, hunterDistance) {
    if (!isPreferredAIChairRescuer(survivor)) return false;
    const target = getAIChairRescueTarget(survivor);
    if (!target || !isAISafeToRescueChair(survivor, hunterDistance, target)) return false;

    survivor.healDecision = null;
    survivor.objectiveDecision = null;
    survivor.kiteDecision = null;
    survivor.wanderTarget = null;

    if (distanceBetween(survivor, target.chair) < 92) {
      startRescue(survivor, target, now);
      return true;
    }

    const standPoint = findNearestSafePosition(target.chair.x + 52, target.chair.y + 38, survivor.radius);
    const moved = moveActorToPoint(survivor, standPoint.x, standPoint.y, survivor.speed * 0.95, dt, now);
    if (moved < 0.5 && now > survivor.repathAt - 120) survivor.path = [];
    return true;
  }

  function isPreferredAIChairRescuer(survivor) {
    if (!isAvailableAIChairRescuer(survivor)) return false;
    const ownPriority = getSurvivorRescuePriority(survivor);
    return !teammates.some((other) => {
      if (other === survivor || !isAvailableAIChairRescuer(other)) return false;
      return getSurvivorRescuePriority(other) < ownPriority;
    });
  }

  function isAvailableAIChairRescuer(survivor) {
    if (!survivor || survivor.escaped || survivor.action) return false;
    if (survivor.state !== "healthy" && survivor.state !== "injured") return false;
    if (hunter.target === survivor) return false;
    return true;
  }

  function isAISafeToRescueChair(survivor, hunterDistance, target) {
    if (survivor.action || survivor.state !== "healthy" && survivor.state !== "injured") return false;
    if (hunter.target === survivor) return false;
    const chairHunterDistance = target && target.chair ? distanceBetween(hunter, target.chair) : Infinity;
    const urgent = target && target.chairProgress >= 0.58;
    if (hunterDistance < 220 && !urgent) return false;
    if (chairHunterDistance < 235 && !urgent) return false;
    return true;
  }

  function getAIChairRescueTarget(rescuer) {
    let best = null;
    let bestScore = Infinity;
    getSurvivors().forEach((target) => {
      if (target === rescuer || target.state !== "seated" || !target.chair) return;
      if (isBeingRescued(target)) return;
      const distance = distanceBetween(rescuer, target.chair);
      const urgency = target.chairProgress * 520;
      const hunterDistance = distanceBetween(hunter, target.chair);
      const score = distance - urgency - hunterDistance * 0.12;
      if (score < bestScore) {
        best = target;
        bestScore = score;
      }
    });
    return best;
  }

  function isAISafeForObjective(survivor, hunterDistance) {
    if (survivor.action || survivor.state !== "healthy" && survivor.state !== "injured" || survivor.escaped) return false;
    if (hunter.target === survivor) return false;
    return hunterDistance >= AI_OBJECTIVE_ABORT_RANGE + 35;
  }

  function updateAISoulLampDismantle(survivor, dt, now, hunterDistance) {
    if (!isLanternKeeper() || soulLamps.length === 0) return false;
    if (!isAISafeForObjective(survivor, hunterDistance)) return false;

    const lamp = findNearestSoulLamp(survivor, SOUL_LAMP_AI_DISMANTLE_RANGE);
    if (!lamp) return false;

    survivor.kiteDecision = null;
    survivor.objectiveDecision = null;
    survivor.wanderTarget = null;

    if (distanceBetween(survivor, lamp) < SOUL_LAMP_DISMANTLE_RANGE) {
      startDismantleSoulLamp(survivor, lamp, now);
      return true;
    }

    const moved = moveActorToPoint(survivor, lamp.x, lamp.y, survivor.speed * 0.72, dt, now);
    if (moved < 0.5 && now > survivor.repathAt - 120) survivor.path = [];
    return true;
  }

  function updateAIRepair(survivor, dt, now) {
    const point = getAIRepairTarget(survivor, now);
    if (!point) return false;

    survivor.kiteDecision = null;
    survivor.wanderTarget = null;

    if (distanceBetween(survivor, point) < 96) {
      startRepair(survivor, point, now);
      survivor.objectiveDecision = null;
      return true;
    }

    const moved = moveActorToPoint(survivor, point.x, point.y, survivor.speed * 0.62, dt, now);
    if (moved < 0.5 && now > survivor.repathAt - 120) {
      survivor.path = [];
      survivor.objectiveDecision = null;
    }
    return true;
  }

  function updateAIEscape(survivor, dt, now) {
    const gate = getAIEscapeTarget(survivor, now);
    if (!gate) return false;

    survivor.kiteDecision = null;
    survivor.wanderTarget = null;

    if (distanceBetween(survivor, gate) < 88) {
      if (gate.opened) startEscape(survivor, gate, now);
      else startOpenGate(survivor, gate, now);
      survivor.objectiveDecision = null;
      return true;
    }

    const moved = moveActorToPoint(survivor, gate.x, gate.y, survivor.speed * 0.72, dt, now);
    if (moved < 0.5 && now > survivor.repathAt - 120) {
      survivor.path = [];
      survivor.objectiveDecision = null;
    }
    return true;
  }

  function updateAIHatchEscape(survivor, dt, now) {
    survivor.kiteDecision = null;
    survivor.wanderTarget = null;

    if (distanceBetween(survivor, hatch) < 88) {
      startHatchEscape(survivor, now);
      survivor.objectiveDecision = null;
      return true;
    }

    const moved = moveActorToPoint(survivor, hatch.x, hatch.y, survivor.speed * 0.72, dt, now);
    if (moved < 0.5 && now > survivor.repathAt - 120) {
      survivor.path = [];
      survivor.objectiveDecision = null;
    }
    return true;
  }

  function updateAIDownedHatchCrawl(survivor, dt, now) {
    const activeSurvivors = getActiveSurvivors();
    if (!isHatchOpen() || activeSurvivors.length !== 1 || activeSurvivors[0] !== survivor) return false;
    if (distanceBetween(survivor, hatch) < 88) {
      startHatchEscape(survivor, now);
      return true;
    }
    const crawlSpeed = DOWNED_CRAWL_SPEED * getSurvivorMultiplier(survivor, "crawlSpeed") * 0.85 * getSurvivorMoveSpeedMultiplier(survivor, now);
    const moved = moveActorToPoint(survivor, hatch.x, hatch.y, crawlSpeed, dt, now);
    if (moved < 0.4 && now > survivor.repathAt - 120) survivor.path = [];
    return true;
  }

  function getAIRepairTarget(survivor, now) {
    if (shouldKeepObjectiveDecision(survivor, now, "repair")) return survivor.objectiveDecision.target;

    let best = null;
    let bestScore = Infinity;
    repairPoints.forEach((point) => {
      if (point.completed || isRepairingPoint(survivor, point)) return;
      const distance = distanceBetween(survivor, point) * 0.68;
      const progressBonus = point.progress * 980;
      const hunterPenalty = Math.max(0, 520 - distanceBetween(hunter, point));
      const score = distance + hunterPenalty - progressBonus;
      if (score < bestScore) {
        best = point;
        bestScore = score;
      }
    });

    survivor.objectiveDecision = best ? { kind: "repair", target: best, until: now + 2400 } : null;
    return best;
  }

  function getAIEscapeTarget(survivor, now) {
    if (shouldKeepObjectiveDecision(survivor, now, "escape")) return survivor.objectiveDecision.target;

    let best = null;
    let bestScore = Infinity;
    exitGates.forEach((gate) => {
      const distance = distanceBetween(survivor, gate);
      const hunterPenalty = Math.max(0, 620 - distanceBetween(hunter, gate));
      const score = distance + hunterPenalty * 0.65;
      if (score < bestScore) {
        best = gate;
        bestScore = score;
      }
    });

    survivor.objectiveDecision = best ? { kind: "escape", target: best, until: now + 1800 } : null;
    return best;
  }

  function shouldKeepObjectiveDecision(survivor, now, kind) {
    const decision = survivor.objectiveDecision;
    if (!decision || decision.kind !== kind || now >= decision.until) return false;
    if (kind === "repair") return !decision.target.completed && !isRepairingPoint(survivor, decision.target);
    return areExitsPowered();
  }

  function isRepairingPoint(actor, point) {
    return actor.action && actor.action.kind === "repairing" && actor.action.point === point;
  }

  function isOpeningGate(actor, gate) {
    return actor.action && actor.action.kind === "openingGate" && actor.action.gate === gate;
  }

  function getAIHealTarget(survivor, now) {
    if (shouldKeepHealDecision(survivor, now)) return survivor.healDecision.target;

    const target = findBestAIHealTarget(survivor);
    if (!target) {
      survivor.healDecision = null;
      return null;
    }

    survivor.healDecision = {
      target,
      until: now + 5200
    };
    return target;
  }

  function shouldKeepHealDecision(survivor, now) {
    const decision = survivor.healDecision;
    if (!decision || now >= decision.until) return false;
    return canAIHealTarget(decision.target, survivor);
  }

  function findBestAIHealTarget(healer) {
    let best = null;
    let bestScore = Infinity;
    getSurvivors().forEach((target) => {
      if (target === healer || !canAIHealTarget(target, healer)) return;
      const distance = distanceBetween(healer, target);
      if (distance > 760) return;
      const hunterDistance = distanceBetween(hunter, target);
      const score = distance - hunterDistance * 0.08 - (target.healProgress || 0) * 180;
      if (score < bestScore) {
        best = target;
        bestScore = score;
      }
    });
    return best;
  }

  function canAIHealTarget(target, healer = null) {
    if (!canBeHealed(target) || target.state !== "injured" || hunter.target === target) return false;
    if (target.injuredAt && performance.now() - target.injuredAt < AI_HEAL_MIN_INJURED_AGE) return false;
    if (distanceBetween(hunter, target) < AI_HEAL_TARGET_MIN_HUNTER_DISTANCE) return false;
    const assigned = getAssignedAIHealer(target, healer);
    return !assigned;
  }

  function getAssignedAIHealer(target, requester = null) {
    const active = getActiveHealers(target).find((healer) => healer !== requester && healer.kind === "ai");
    if (active) return active;
    return getSurvivors().find((survivor) => {
      if (survivor === requester || survivor === target || survivor.kind !== "ai") return false;
      return survivor.healDecision &&
        survivor.healDecision.target === target &&
        (!survivor.healDecision.until || performance.now() < survivor.healDecision.until);
    });
  }

  function getHealStandPoint(healer, target) {
    const away = normalizeVector(target.x - hunter.x, target.y - hunter.y);
    const baseAngle = Math.atan2(away.y, away.x);
    const angleOffsets = [0, 0.8, -0.8, 1.6, -1.6, Math.PI];
    const distances = [58, 74, 92];

    for (const distance of distances) {
      for (const offset of angleOffsets) {
        const angle = baseAngle + offset;
        const x = target.x + Math.cos(angle) * distance;
        const y = target.y + Math.sin(angle) * distance;
        if (isSafePosition(x, y, healer.radius)) return { x, y };
      }
    }

    return findNearestSafePosition(target.x + away.x * 74, target.y + away.y * 74, healer.radius);
  }

  function handleAIInteraction(survivor, now, hunterDistance) {
    if (survivor.action || now < survivor.nextInteractAt) return;

    const escapePoint = getKiteEscapeDestination(survivor, hunterDistance, now);
    const routeWindow = findUsefulWindowForRoute(survivor, escapePoint, 118);
    if (routeWindow && hunterDistance < 430) {
      startVault(survivor, routeWindow, getSurvivorVaultDuration(survivor, 320), now, "vaulting");
      survivor.nextInteractAt = now + 900;
      return;
    }

    const standingPallet = findNearestPallet(survivor, "standing", 86);
    if (standingPallet && hunterDistance < 210 && distanceBetween(hunter, standingPallet) < 130) {
      dropPallet(standingPallet, now);
      survivor.nextInteractAt = now + 850;
      return;
    }

    const droppedPallet = findNearestPallet(survivor, "dropped", 76);
    if (droppedPallet && hunterDistance < 260) {
      startVault(survivor, droppedPallet, getSurvivorVaultDuration(survivor, 260), now, "vaulting");
      survivor.nextInteractAt = now + 850;
      return;
    }

    const nearWindow = findNearestWindow(survivor, 78);
    if (nearWindow && hunterDistance < 330) {
      startVault(survivor, nearWindow, getSurvivorVaultDuration(survivor, 320), now, "vaulting");
      survivor.nextInteractAt = now + 850;
    }
  }

  function moveAISurvivorAway(survivor, dt, now, hunterDistance) {
    const destination = getKiteEscapeDestination(survivor, hunterDistance, now);
    const routeWindow = findUsefulWindowForRoute(survivor, destination, 118);
    if (routeWindow && hunterDistance < 430 && !survivor.action && now >= survivor.nextInteractAt) {
      startVault(survivor, routeWindow, getSurvivorVaultDuration(survivor, 320), now, "vaulting");
      survivor.nextInteractAt = now + 900;
      return;
    }

    const injuredPenalty = survivor.state === "injured" ? 0.88 : 1;
    const hitBoost = now < survivor.boostUntil ? 1.45 : 1;
    const panicBoost = hunterDistance < 310 ? 1.12 : 1;
    const speed = survivor.speed * injuredPenalty * hitBoost * panicBoost * getSurvivorMoveSpeedMultiplier(survivor, now);
    const moved = moveActorToPoint(survivor, destination.x, destination.y, speed, dt, now);
    if (moved < 0.5 && now > survivor.repathAt - 120) {
      survivor.path = [];
      survivor.wanderTarget = pickWanderTarget();
    }
  }

  function moveAISurvivorWander(survivor, dt, now) {
    if (!survivor.wanderTarget || distanceBetween(survivor, survivor.wanderTarget) < 70) {
      survivor.wanderTarget = pickWanderTarget();
    }

    const moved = moveActorToPoint(
      survivor,
      survivor.wanderTarget.x,
      survivor.wanderTarget.y,
      survivor.speed * 0.45,
      dt,
      now
    );
    if (moved < 0.5 && now > survivor.repathAt - 120) {
      survivor.path = [];
      survivor.wanderTarget = pickWanderTarget();
    }
  }

  function getKiteEscapeDestination(survivor, hunterDistance, now) {
    if (shouldKeepKiteDecision(survivor, now)) {
      if (distanceBetween(survivor, survivor.kiteDecision.destination) < 58) {
        refreshKiteDecisionDestination(survivor, now);
      }
      return survivor.kiteDecision.destination;
    }

    const away = normalizeVector(survivor.x - hunter.x, survivor.y - hunter.y);
    const farTarget = findBestDistantKiteTarget(survivor, hunterDistance);
    if (farTarget) {
      survivor.kiteDecision = createKiteDecision(survivor, farTarget, "rotate", away, now);
      return survivor.kiteDecision.destination;
    }

    const loopTarget = findBestLocalKiteTarget(survivor);
    if (loopTarget) {
      survivor.kiteDecision = createKiteDecision(survivor, loopTarget, "loop", away, now);
      return survivor.kiteDecision.destination;
    }

    survivor.kiteDecision = null;
    return getEscapeDestination(survivor);
  }

  function shouldKeepKiteDecision(survivor, now) {
    const decision = survivor.kiteDecision;
    if (!decision || !decision.anchor || now >= decision.until) return false;
    if (decision.anchor.label === "broken") return false;

    const hunterDistanceToAnchor = distanceBetween(hunter, decision.anchor);
    if (decision.mode === "rotate" && hunterDistanceToAnchor < 250) return false;
    if (decision.mode === "loop" && distanceBetween(survivor, decision.anchor) > 420) return false;
    return true;
  }

  function createKiteDecision(survivor, anchor, mode, away, now) {
    const normal = getObstacleNormal(anchor);
    const tangent = { x: -normal.y, y: normal.x };
    const side = Math.sign((survivor.x - anchor.x) * normal.x + (survivor.y - anchor.y) * normal.y) ||
      Math.sign(away.x * normal.x + away.y * normal.y) ||
      1;
    const circleDirection = Math.sign((hunter.x - anchor.x) * tangent.x + (hunter.y - anchor.y) * tangent.y) || 1;
    const decision = {
      mode,
      anchor,
      side,
      circleDirection,
      destination: null,
      until: now + (mode === "rotate" ? 1750 : 1350)
    };
    decision.destination = getKiteDecisionDestination(survivor, decision, away);
    return decision;
  }

  function refreshKiteDecisionDestination(survivor, now) {
    const away = normalizeVector(survivor.x - hunter.x, survivor.y - hunter.y);
    survivor.kiteDecision.destination = getKiteDecisionDestination(survivor, survivor.kiteDecision, away);
    survivor.kiteDecision.until = now + (survivor.kiteDecision.mode === "rotate" ? 1250 : 950);
  }

  function getKiteDecisionDestination(survivor, decision, away) {
    if (decision.mode === "rotate") {
      return getKiteApproachPoint(decision.anchor, away, survivor.radius, decision.side);
    }
    return getKiteLoopPoint(survivor, decision.anchor, away, decision.side, decision.circleDirection);
  }

  function findBestDistantKiteTarget(survivor, currentHunterDistance) {
    const candidates = getKiteSpawnAnchors();
    let best = null;
    let bestScore = -Infinity;
    candidates.forEach((item) => {
      const survivorDistance = distanceBetween(survivor, item);
      const hunterDistance = distanceBetween(hunter, item);
      if (survivorDistance < 120 || survivorDistance > 900) return;
      if (hunterDistance < 420) return;

      const safetyGain = hunterDistance - currentHunterDistance;
      const raceAdvantage = hunterDistance - survivorDistance;
      if (safetyGain < 120 && raceAdvantage < 70) return;

      const routePenalty = hasWalkableLine(survivor.x, survivor.y, item.x, item.y, survivor.radius) ? 0 : 70;
      const score = hunterDistance * 1.16 + raceAdvantage * 0.85 - survivorDistance * 0.38 - routePenalty;
      if (score > bestScore) {
        best = item;
        bestScore = score;
      }
    });
    return best;
  }

  function findBestLocalKiteTarget(survivor) {
    const candidates = getKiteSpawnAnchors();
    let best = null;
    let bestScore = Infinity;
    candidates.forEach((item) => {
      const survivorDistance = distanceBetween(survivor, item);
      if (survivorDistance > 330) return;
      const hunterDistance = distanceBetween(hunter, item);
      const score = survivorDistance - hunterDistance * 0.22;
      if (score < bestScore) {
        best = item;
        bestScore = score;
      }
    });
    return best;
  }

  function getKiteApproachPoint(anchor, away, radius, lockedSide = null) {
    const normal = getObstacleNormal(anchor);
    const tangent = { x: -normal.y, y: normal.x };
    const side = lockedSide || Math.sign(away.x * normal.x + away.y * normal.y) || 1;
    const distances = anchor.label === "window" ? [110, 140, 170, 210] : [86, 118, 150, 190];
    const offsets = [0, 28, -28, 56, -56, 84, -84];

    for (const distance of distances) {
      for (const offset of offsets) {
        const x = anchor.x + normal.x * side * distance + tangent.x * offset;
        const y = anchor.y + normal.y * side * distance + tangent.y * offset;
        if (isSafePosition(x, y, radius)) return { x, y };
      }
    }

    return findNearestSafePosition(anchor.x + away.x * 150, anchor.y + away.y * 150, radius);
  }

  function getKiteLoopPoint(survivor, anchor, away, lockedSide = null, lockedCircleDirection = null) {
    const normal = getObstacleNormal(anchor);
    const tangent = { x: -normal.y, y: normal.x };
    const side = lockedSide || Math.sign((survivor.x - anchor.x) * normal.x + (survivor.y - anchor.y) * normal.y) || 1;
    const circleDirection = lockedCircleDirection ||
      Math.sign((hunter.x - anchor.x) * tangent.x + (hunter.y - anchor.y) * tangent.y) ||
      1;
    const distances = anchor.label === "window" ? [118, 150, 180] : [92, 122, 156];
    const offsets = [80, 120, 160, -80, -120, -160];

    for (const distance of distances) {
      for (const offset of offsets) {
        const adjustedOffset = offset * -circleDirection;
        const x = anchor.x + normal.x * side * distance + tangent.x * adjustedOffset + away.x * 28;
        const y = anchor.y + normal.y * side * distance + tangent.y * adjustedOffset + away.y * 28;
        if (isSafePosition(x, y, survivor.radius)) return { x, y };
      }
    }

    return getKiteApproachPoint(anchor, away, survivor.radius);
  }

  function findBestKiteTarget(survivor) {
    return findBestDistantKiteTarget(survivor, distanceBetween(survivor, hunter)) ||
      findBestLocalKiteTarget(survivor);
  }

  function getEscapeDestination(survivor) {
    const away = normalizeVector(survivor.x - hunter.x, survivor.y - hunter.y);
    return findNearestSafePosition(
      survivor.x + away.x * 360,
      survivor.y + away.y * 360,
      survivor.radius
    );
  }

  function findUsefulWindowForRoute(actor, goal, range) {
    if (hasWalkableLine(actor.x, actor.y, goal.x, goal.y, actor.radius)) return null;

    let best = null;
    let bestScore = Infinity;
    windows.forEach((item) => {
      const distance = distanceBetween(actor, item);
      if (distance > range) return;
      const normal = getObstacleNormal(item);
      const side = Math.sign((actor.x - item.x) * normal.x + (actor.y - item.y) * normal.y) || 1;
      const destination = findVaultDestination(actor, item, normal, side);
      if (distanceBetween(destination, actor) < 20) return;
      const improvement = distanceBetween(actor, goal) - distanceBetween(destination, goal);
      const wall = findWallContainingWindow(item);
      const longWallBonus = wall && Math.max(wall.w, wall.h) >= 220 ? 80 : 0;
      const score = distance - improvement * 0.8 - longWallBonus;
      if (improvement > -30 && score < bestScore) {
        best = item;
        bestScore = score;
      }
    });
    return best;
  }

  function findWallContainingWindow(windowItem) {
    return walls.find((wall) => {
      const margin = 24;
      return windowItem.x >= wall.x - margin &&
        windowItem.x <= wall.x + wall.w + margin &&
        windowItem.y >= wall.y - margin &&
        windowItem.y <= wall.y + wall.h + margin;
    });
  }

  function normalizeVector(x, y) {
    const length = Math.hypot(x, y);
    if (length < 0.001) return { x: 0, y: 0 };
    return { x: x / length, y: y / length };
  }

  function moveActor(actor, dx, dy) {
    if (actor.kind === "player" && selectedRole !== PLAYER_ROLE.hunter) return moveActorSimple(actor, dx, dy);
    return moveActorSmart(actor, dx, dy);
  }

  function moveActorSimple(actor, dx, dy) {
    const beforeX = actor.x;
    const beforeY = actor.y;

    if (!collides(actor.x + dx, actor.y, actor.radius)) actor.x += dx;
    if (!collides(actor.x, actor.y + dy, actor.radius)) actor.y += dy;

    return Math.hypot(actor.x - beforeX, actor.y - beforeY);
  }

  function moveActorSmart(actor, dx, dy) {
    const beforeX = actor.x;
    const beforeY = actor.y;
    const distance = Math.hypot(dx, dy);
    if (distance < 0.001) return 0;

    if (!collides(actor.x + dx, actor.y + dy, actor.radius)) {
      actor.x += dx;
      actor.y += dy;
      return Math.hypot(actor.x - beforeX, actor.y - beforeY);
    }

    const primaryFirst = Math.abs(dx) >= Math.abs(dy);
    const attempts = primaryFirst
      ? [[dx, 0], [0, dy], [dx * 0.55, 0], [0, dy * 0.55]]
      : [[0, dy], [dx, 0], [0, dy * 0.55], [dx * 0.55, 0]];

    for (const [tryDx, tryDy] of attempts) {
      if (!collides(actor.x + tryDx, actor.y + tryDy, actor.radius)) {
        actor.x += tryDx;
        actor.y += tryDy;
        return Math.hypot(actor.x - beforeX, actor.y - beforeY);
      }
    }

    return 0;
  }

  function moveActorToPoint(actor, targetX, targetY, speed, dt, now) {
    const directDistance = Math.hypot(targetX - actor.x, targetY - actor.y);
    if (directDistance < 4) {
      actor.vx = 0;
      actor.vy = 0;
      return 0;
    }

    const goal = findNearestSafePosition(targetX, targetY, actor.radius);
    let waypoint = goal;

    if (!hasWalkableLine(actor.x, actor.y, goal.x, goal.y, actor.radius)) {
      const goalChanged = !actor.pathGoal || distanceBetween(actor.pathGoal, goal) > nav.cell;
      if (!actor.path || actor.path.length === 0 || goalChanged || now >= actor.repathAt) {
        actor.path = findPath(actor.x, actor.y, goal.x, goal.y, actor.radius);
        actor.path = smoothPath(actor.x, actor.y, actor.path, actor.radius);
        actor.pathGoal = goal;
        actor.repathAt = now + 1100;
      }

      while (actor.path && actor.path.length > 1 && distanceBetween(actor, actor.path[0]) < 54) {
        actor.path.shift();
      }

      if (actor.path && actor.path.length > 0) {
        waypoint = actor.path[0];
      }
    } else {
      actor.path = [];
      actor.pathGoal = goal;
    }

    const toWaypoint = normalizeVector(waypoint.x - actor.x, waypoint.y - actor.y);
    const step = Math.min(speed * dt, Math.max(0, distanceBetween(actor, waypoint) - 3));
    const dx = toWaypoint.x * step;
    const dy = toWaypoint.y * step;
    const beforeX = actor.x;
    const beforeY = actor.y;
    const moved = moveActorSmart(actor, dx, dy);

    if (moved > 0.01) {
      actor.angle = Math.atan2(actor.y - beforeY, actor.x - beforeX);
      actor.vx = (actor.x - beforeX) / Math.max(dt, 0.001);
      actor.vy = (actor.y - beforeY) / Math.max(dt, 0.001);
    } else if (now >= actor.repathAt - 160) {
      actor.path = [];
      actor.repathAt = now + 260;
    }

    return moved;
  }

  function hasWalkableLine(fromX, fromY, toX, toY, radius) {
    const distance = Math.hypot(toX - fromX, toY - fromY);
    const steps = Math.max(1, Math.ceil(distance / 32));
    for (let i = 1; i <= steps; i += 1) {
      const t = i / steps;
      const x = fromX + (toX - fromX) * t;
      const y = fromY + (toY - fromY) * t;
      if (!isSafePosition(x, y, radius)) return false;
    }
    return true;
  }

  function findPath(startX, startY, goalX, goalY, radius) {
    const start = nearestWalkableCell(worldToCell(startX, startY), radius);
    const goal = nearestWalkableCell(worldToCell(goalX, goalY), radius);
    if (!start || !goal) return [];

    const startKey = cellKey(start);
    const goalKey = cellKey(goal);
    const open = [start];
    const cameFrom = new Map();
    const gScore = new Map([[startKey, 0]]);
    const fScore = new Map([[startKey, cellDistance(start, goal)]]);
    const closed = new Set();

    while (open.length > 0) {
      open.sort((a, b) => (fScore.get(cellKey(a)) ?? Infinity) - (fScore.get(cellKey(b)) ?? Infinity));
      const current = open.shift();
      const currentKey = cellKey(current);
      if (currentKey === goalKey) return reconstructPath(cameFrom, current).map(cellToWorld);
      closed.add(currentKey);

      for (const neighbor of getNeighbors(current, radius)) {
        const neighborKey = cellKey(neighbor);
        if (closed.has(neighborKey)) continue;

        const tentativeG = (gScore.get(currentKey) ?? Infinity) + cellDistance(current, neighbor);
        if (tentativeG >= (gScore.get(neighborKey) ?? Infinity)) continue;

        cameFrom.set(neighborKey, current);
        gScore.set(neighborKey, tentativeG);
        fScore.set(neighborKey, tentativeG + cellDistance(neighbor, goal));
        if (!open.some((cell) => cellKey(cell) === neighborKey)) open.push(neighbor);
      }
    }

    return [];
  }

  function worldToCell(x, y) {
    return {
      col: actorClamp(Math.floor(x / nav.cell), 0, nav.cols - 1),
      row: actorClamp(Math.floor(y / nav.cell), 0, nav.rows - 1)
    };
  }

  function cellToWorld(cell) {
    return {
      x: actorClamp(cell.col * nav.cell + nav.cell / 2, 80, world.width - 80),
      y: actorClamp(cell.row * nav.cell + nav.cell / 2, 80, world.height - 80)
    };
  }

  function cellKey(cell) {
    return `${cell.col},${cell.row}`;
  }

  function cellDistance(a, b) {
    return Math.hypot(a.col - b.col, a.row - b.row);
  }

  function isCellWalkable(cell, radius) {
    if (cell.col < 0 || cell.row < 0 || cell.col >= nav.cols || cell.row >= nav.rows) return false;
    const point = cellToWorld(cell);
    return isSafePosition(point.x, point.y, radius);
  }

  function nearestWalkableCell(cell, radius) {
    if (isCellWalkable(cell, radius)) return cell;
    for (let ring = 1; ring <= 5; ring += 1) {
      for (let dc = -ring; dc <= ring; dc += 1) {
        for (let dr = -ring; dr <= ring; dr += 1) {
          if (Math.abs(dc) !== ring && Math.abs(dr) !== ring) continue;
          const candidate = { col: cell.col + dc, row: cell.row + dr };
          if (isCellWalkable(candidate, radius)) return candidate;
        }
      }
    }
    return null;
  }

  function getNeighbors(cell, radius) {
    const dirs = [
      { col: 1, row: 0 },
      { col: -1, row: 0 },
      { col: 0, row: 1 },
      { col: 0, row: -1 },
      { col: 1, row: 1 },
      { col: 1, row: -1 },
      { col: -1, row: 1 },
      { col: -1, row: -1 }
    ];
    return dirs
      .map((dir) => ({ col: cell.col + dir.col, row: cell.row + dir.row, dir }))
      .filter((candidate) => {
        if (!isCellWalkable(candidate, radius)) return false;
        if (candidate.dir.col !== 0 && candidate.dir.row !== 0) {
          const horizontal = { col: cell.col + candidate.dir.col, row: cell.row };
          const vertical = { col: cell.col, row: cell.row + candidate.dir.row };
          return isCellWalkable(horizontal, radius) && isCellWalkable(vertical, radius);
        }
        return true;
      })
      .map((candidate) => ({ col: candidate.col, row: candidate.row }));
  }

  function reconstructPath(cameFrom, current) {
    const path = [current];
    let key = cellKey(current);
    while (cameFrom.has(key)) {
      current = cameFrom.get(key);
      path.unshift(current);
      key = cellKey(current);
    }
    return path.slice(1);
  }

  function smoothPath(fromX, fromY, path, radius) {
    if (!path || path.length <= 1) return path || [];

    const result = [];
    let anchor = { x: fromX, y: fromY };
    let index = 0;

    while (index < path.length) {
      let farthest = index;
      for (let next = path.length - 1; next >= index; next -= 1) {
        if (hasWalkableLine(anchor.x, anchor.y, path[next].x, path[next].y, radius)) {
          farthest = next;
          break;
        }
      }
      result.push(path[farthest]);
      anchor = path[farthest];
      index = farthest + 1;
    }

    return result;
  }

  function updateHunter(dt, now) {
    if (updateActorAction(hunter, now)) return;
    updateCarriedSurvivorPosition();

    if (now < hunter.stunnedUntil) {
      hunter.status = "stunned";
      return;
    }

    if (now < hunter.wipeUntil) {
      hunter.status = hunter.lastAttackHit ? "wipe" : "miss";
      return;
    }

    if (updateAIHunterChairing(dt, now)) return;

    const target = chooseHunterTarget();
    hunter.target = target;
    if (!target) {
      hunter.status = "allDowned";
      return;
    }

    const toTargetX = target.x - hunter.x;
    const toTargetY = target.y - hunter.y;
    const distance = Math.hypot(toTargetX, toTargetY);
    const canAttack = canHunterAttack(now);

    const desiredAttackAngle = Math.atan2(toTargetY, toTargetX);
    hunter.angle = turnToward(hunter.angle, desiredAttackAngle, hunter.turnSpeed * dt);

    if (!isActorDecoyTarget(target) && maybeStartAISawDash(target, now, distance)) return;

    if (isSurvivorInHunterAttackCone(target) && canAttack) {
      performHunterAttack(now);
      return;
    }

    if (now - hunter.lastAttackAt < hunter.attackCooldown * 1000) {
      hunter.status = "cooldown";
    } else {
      hunter.status = "chasing";
    }

    if (distance > hunter.attackRange * 0.72) {
      moveHunterToward(dt, now, target);
    }
  }

  function handlePlayerAttack(now) {
    if (!matchStarted || selectedRole !== PLAYER_ROLE.hunter) return;
    if (!canHunterAttack(now)) return;
    performHunterAttack(now);
  }

  function handlePlayerSkill(now) {
    if (selectedRole === PLAYER_ROLE.survivor && canUseMagicShow(player, now)) {
      performMagicShow(player, now);
      return;
    }
    if (selectedRole === PLAYER_ROLE.survivor && canActivateTimeRewind(player, now)) {
      activateTimeRewind(player, now);
      return;
    }
    if (selectedRole === PLAYER_ROLE.survivor && canPlaceTimeDevice(player, now)) {
      placeTimeDevice(player, now);
      return;
    }
    if (selectedRole === PLAYER_ROLE.survivor && canThrowPackage(player, now)) {
      throwPackage(player, player.angle, now);
      return;
    }
    if (selectedRole === PLAYER_ROLE.survivor && canPlaceStitchPack(player)) {
      placeStitchPack(player, now);
      return;
    }
    if (selectedRole === PLAYER_ROLE.hunter && canStartSawDash(now)) {
      startSawDash(now);
      return;
    }
    if (canRecallSoulLamp(now)) {
      recallSoulLamp(findNearestSoulLamp(hunter, SOUL_LAMP_RECALL_RANGE), now);
      return;
    }
    if (canPlaceSoulLamp(now)) {
      placeSoulLamp(now);
      return;
    }
  }

  function handlePlayerShadowSkill(now) {
    if (selectedRole === PLAYER_ROLE.survivor && isActor(player)) {
      toggleMagicShowMode(player);
      return;
    }
    if (canShadowTeleport(now)) {
      shadowTeleportToSoulLamp(now);
    }
  }

  function canHunterAttack(now) {
    return !hunter.action &&
      now >= hunter.stunnedUntil &&
      now >= hunter.wipeUntil &&
      now >= (hunter.sawAttackLockedUntil || 0) &&
      now - hunter.lastAttackAt >= hunter.attackCooldown * 1000;
  }

  function performHunterAttack(now) {
    const target = findHunterAttackTarget();
    const isBalloonAttack = Boolean(hunter.carrying);
    hunter.lastAttackAt = now;
    hunter.status = "attacking";
    hunter.lastAttackHit = Boolean(target);
    chasePulseUntil = now + 280;

    if (target) {
      if (isActorDecoyTarget(target)) {
        breakActorDecoy(target, now);
        hunter.wipeUntil = isBalloonAttack ? now : now + HUNTER_HIT_RECOVERY * getHunterCharacter().hitRecovery;
        return;
      }
      addHunterPresenceHit(now);
      applyHunterHit(target, now, { applyBoneBleed: isSawbone() });
      hunter.wipeUntil = isBalloonAttack ? now : now + HUNTER_HIT_RECOVERY * getHunterCharacter().hitRecovery;
      return;
    }

    hunter.wipeUntil = now + HUNTER_MISS_RECOVERY * getHunterCharacter().missRecovery;
  }

  function maybeStartAISawDash(target, now, distance) {
    if (!target || selectedRole === PLAYER_ROLE.hunter || !canStartSawDash(now)) return false;
    if (hunter.carrying) return false;
    const config = getSawDashConfig(canUseShortSaw(now));
    if (distance < hunter.attackRange * 0.8 || distance > config.range * 0.9) return false;
    if (!hasWalkableLine(hunter.x, hunter.y, target.x, target.y, hunter.radius)) return false;
    startSawDash(now, target);
    return true;
  }

  function getSawDashConfig(short = false) {
    if (short) {
      return {
        duration: SHORT_SAW_DURATION,
        range: SHORT_SAW_RANGE,
        turnSpeed: SHORT_SAW_TURN_SPEED,
        noTimeLimit: false,
        noDistanceLimit: false
      };
    }
    const tierTwo = hunter.presenceTier >= 2;
    return {
      duration: tierTwo ? SAW_DASH_DURATION + 90 : SAW_DASH_DURATION,
      range: tierTwo ? SAW_DASH_TIER_TWO_RANGE : SAW_DASH_RANGE,
      turnSpeed: tierTwo ? SAW_DASH_TIER_TWO_TURN_SPEED : SAW_DASH_TURN_SPEED,
      noTimeLimit: tierTwo,
      noDistanceLimit: tierTwo,
      durability: tierTwo ? SAW_DASH_TIER_TWO_DURABILITY : null
    };
  }

  function startSawDash(now, target = null) {
    const short = canUseShortSaw(now);
    const config = getSawDashConfig(short);
    if (!short) hunter.nextSawDashAt = now + SAW_DASH_COOLDOWN;
    hunter.shortSawAvailableUntil = 0;
    hunter.action = {
      kind: "sawDash",
      start: now,
      until: now + config.duration,
      lastAt: now,
      range: config.range,
      duration: config.duration,
      turnSpeed: config.turnSpeed,
      noTimeLimit: config.noTimeLimit,
      noDistanceLimit: config.noDistanceLimit,
      durability: config.durability,
      short,
      target,
      hit: false,
      traveled: 0
    };
    hunter.status = short ? "shortSaw" : "sawDash";
    hunter.path = [];
    hunter.pathGoal = null;
    chasePulseUntil = now + 420;
  }

  function updateSawDashAction(action, now) {
    const dt = Math.min(0.033, Math.max(0, (now - (action.lastAt || action.start)) / 1000));
    action.lastAt = now;
    if (dt <= 0) return true;

    const previousAngle = hunter.angle;
    const steerAngle = getSawDashSteerAngle(action);
    if (Number.isFinite(steerAngle)) {
      hunter.angle = turnToward(hunter.angle, steerAngle, action.turnSpeed * dt);
    }

    const speed = action.range / Math.max(action.duration / 1000, 0.001);
    const step = speed * dt;
    const beforeX = hunter.x;
    const beforeY = hunter.y;
    const moved = moveActorSmart(hunter, Math.cos(hunter.angle) * step, Math.sin(hunter.angle) * step);
    action.traveled += moved;
    drainSawDashDurability(action, dt, Math.abs(angleDifference(previousAngle, hunter.angle)), Math.max(0, step - moved));
    hunter.vx = (hunter.x - beforeX) / Math.max(dt, 0.001);
    hunter.vy = (hunter.y - beforeY) / Math.max(dt, 0.001);
    hunter.status = action.short ? "shortSaw" : "sawDash";

    const target = findSawDashHitTarget();
    if (target) {
      finishSawDashHit(action, target, now);
      hunter.action = null;
      return true;
    }

    if (moved < step * 0.35 || (Number.isFinite(action.durability) && action.durability <= 0) || (!action.noTimeLimit && now >= action.until) || (!action.noDistanceLimit && action.traveled >= action.range)) {
      hunter.action = null;
      hunter.vx = 0;
      hunter.vy = 0;
      hunter.status = hunter.target ? "chasing" : "ready";
      return true;
    }

    return true;
  }

  function drainSawDashDurability(action, dt, turnAmount, blockedDistance) {
    if (!Number.isFinite(action.durability)) return;
    action.durability -= SAW_DASH_DURABILITY_BASE_DRAIN * dt;
    action.durability -= turnAmount * SAW_DASH_DURABILITY_TURN_DRAIN;
    action.durability -= blockedDistance * SAW_DASH_DURABILITY_SLIDE_DRAIN;
  }

  function getSawDashSteerAngle(action) {
    if (selectedRole === PLAYER_ROLE.hunter) {
      const move = getMoveVector();
      if (move.length > 0.1) return Math.atan2(move.y, move.x);
      return hunter.angle;
    }
    if (action.target && !action.target.escaped && action.target.state !== "eliminated" && !isSurvivorInvisible(action.target)) {
      return Math.atan2(action.target.y - hunter.y, action.target.x - hunter.x);
    }
    return hunter.angle;
  }

  function findSawDashHitTarget() {
    let best = null;
    let bestDistance = Infinity;
    getSurvivors().forEach((survivor) => {
      if (survivor.escaped || survivor.state === "downed" || survivor.state === "seated" || survivor.state === "carried" || survivor.state === "eliminated") return;
      if (isSurvivorInvisible(survivor)) return;
      const distance = distanceBetween(hunter, survivor);
      if (distance > hunter.radius + survivor.radius + 18) return;
      const targetAngle = Math.atan2(survivor.y - hunter.y, survivor.x - hunter.x);
      if (Math.abs(angleDifference(hunter.angle, targetAngle)) > Math.PI * 0.58) return;
      if (distance < bestDistance) {
        best = survivor;
        bestDistance = distance;
      }
    });
    return best;
  }

  function finishSawDashHit(action, target, now) {
    hunter.sawAttackLockedUntil = Math.max(hunter.sawAttackLockedUntil || 0, now + SAW_DASH_ATTACK_LOCKOUT);
    if (action.short) {
      applyHunterHit(target, now, {
        allowTerrorShock: false,
        applyBoneBleed: false,
        damage: 0.5
      });
    } else {
      addHunterPresenceHit(now);
      applyHunterHit(target, now, { applyBoneBleed: false });
    }
    if (action.short) {
      startSawHitRecovery(now);
    } else if (hunter.presenceTier >= 1) {
      hunter.shortSawAvailableUntil = now + (hunter.presenceTier >= 2 ? SHORT_SAW_TIER_TWO_WINDOW : SHORT_SAW_WINDOW);
      hunter.pendingSawWipe = true;
      hunter.pendingSawWipeAt = hunter.shortSawAvailableUntil;
    } else {
      startSawHitRecovery(now);
    }
    hunter.status = "sawHit";
    chasePulseUntil = now + 480;
  }

  function startSawHitRecovery(now) {
    hunter.pendingSawWipe = false;
    hunter.pendingSawWipeAt = 0;
    hunter.shortSawAvailableUntil = 0;
    hunter.lastAttackHit = true;
    hunter.wipeUntil = now + HUNTER_HIT_RECOVERY * getHunterCharacter().hitRecovery;
    hunter.status = "wipe";
  }

  function updateSawbonePendingWipe(now) {
    if (!hunter.pendingSawWipe) return;
    if (hunter.action || now < hunter.pendingSawWipeAt) return;
    if (now < hunter.stunnedUntil) return;
    startSawHitRecovery(now);
  }

  function addHunterPresenceHit(now) {
    const previousTier = hunter.presenceTier || 0;
    hunter.presenceHits = Math.min(PRESENCE_TIER_TWO_HITS, (hunter.presenceHits || 0) + 1);
    hunter.presenceTier = getPresenceTierFromHits(hunter.presenceHits);
    if (hunter.presenceTier > previousTier) {
      lanternAlert = {
        text: hunter.presenceTier === 1 ? "存在感 一阶" : "存在感 二阶",
        until: now + 1600
      };
    }
  }

  function getPresenceTierFromHits(hits) {
    if (hits >= PRESENCE_TIER_TWO_HITS) return 2;
    if (hits >= PRESENCE_TIER_ONE_HITS) return 1;
    return 0;
  }

  function findHunterAttackTarget() {
    const decoyTarget = selectedRole !== PLAYER_ROLE.hunter ? findActorDecoyAttackTarget() : null;
    if (decoyTarget) return decoyTarget;

    let best = null;
    let bestDistance = Infinity;
    getSurvivors().forEach((survivor) => {
      if (survivor.escaped) return;
      if (survivor.state === "downed" || survivor.state === "seated" || survivor.state === "carried" || survivor.state === "eliminated") return;
      if (isSurvivorInvisible(survivor)) return;
      if (!isSurvivorInHunterAttackCone(survivor)) return;
      const distance = distanceBetween(hunter, survivor);
      if (distance < bestDistance) {
        best = survivor;
        bestDistance = distance;
      }
    });
    return best;
  }

  function chooseHunterTarget() {
    if (selectedRole !== PLAYER_ROLE.hunter) {
      const decoyTarget = chooseActorDecoyTarget();
      if (decoyTarget) return decoyTarget;
    }

    let best = null;
    let bestScore = Infinity;
    getSurvivors().forEach((survivor) => {
      if (survivor.escaped) return;
      if (survivor.state === "downed" || survivor.state === "seated" || survivor.state === "carried" || survivor.state === "eliminated") return;
      if (isSurvivorInvisible(survivor)) return;
      const distance = distanceBetween(hunter, survivor);
      const healthPriority = getTargetHealthPriority(survivor);
      const chaseDifficulty = getTargetChaseDifficulty(survivor);
      const stickiness = survivor === hunter.target ? -115 : 0;
      const objectivePressure = getTargetObjectivePressure(survivor);
      const score = healthPriority * 460 + distance * chaseDifficulty + objectivePressure + stickiness;
      if (score < bestScore) {
        best = survivor;
        bestScore = score;
      }
    });
    return best;
  }

  function isActorDecoyTarget(target) {
    return Boolean(target && target.kind === "actorDecoy");
  }

  function chooseActorDecoyTarget() {
    let best = null;
    let bestScore = Infinity;
    actorDecoys.forEach((decoy) => {
      const distance = distanceBetween(hunter, decoy);
      if (distance < bestScore) {
        best = decoy;
        bestScore = distance;
      }
    });
    return best;
  }

  function findActorDecoyAttackTarget() {
    let best = null;
    let bestDistance = Infinity;
    actorDecoys.forEach((decoy) => {
      if (!isSurvivorInHunterAttackCone(decoy)) return;
      const distance = distanceBetween(hunter, decoy);
      if (distance < bestDistance) {
        best = decoy;
        bestDistance = distance;
      }
    });
    return best;
  }

  function breakActorDecoy(decoy, now) {
    const index = actorDecoys.indexOf(decoy);
    if (index >= 0) actorDecoys.splice(index, 1);
    if (hunter.target === decoy) hunter.target = null;
    lanternAlert = {
      text: "击中替身",
      until: now + 1200
    };
    chasePulseUntil = now + 360;
  }

  function getTargetChaseDifficulty(survivor) {
    const base = getSurvivorMultiplier(survivor, "chaseDifficulty", 1);
    const injuredModifier = survivor.state === "injured" ? 0.82 : 1;
    const actionModifier = survivor.action && ["repairing", "openingGate", "healing", "rescuing"].includes(survivor.action.kind) ? 0.86 : 1;
    return base * injuredModifier * actionModifier;
  }

  function getTargetObjectivePressure(survivor) {
    if (!survivor.action) return 0;
    if (survivor.action.kind === "rescuing") return -220;
    if (survivor.action.kind === "openingGate") return -130;
    if (survivor.action.kind === "repairing") return -80;
    if (survivor.action.kind === "healing") return -60;
    return 0;
  }

  function getTargetHealthPriority(survivor) {
    if (survivor.action && survivor.action.kind === "rescuing") return -2;
    if (isPressuringOccupiedChair(survivor)) return survivor.state === "injured" ? -1 : 0.25;
    if (survivor.state === "injured") return 0;
    if (survivor.state === "healthy") return 1;
    return 2;
  }

  function isPressuringOccupiedChair(survivor) {
    if (survivor.escaped || survivor.state !== "healthy" && survivor.state !== "injured") return false;
    return chairs.some((item) => {
      return item.survivor &&
        item.survivor.state === "seated" &&
        distanceBetween(survivor, item) < CHAIR_PRESSURE_RANGE;
    });
  }

  function moveHunterToward(dt, now, target) {
    const nearDroppedPallet = findNearestPallet(hunter, "dropped", 88);
    if (nearDroppedPallet) {
      startBreakPallet(nearDroppedPallet, now);
      return;
    }

    const routeWindow = findUsefulWindowForRoute(hunter, target, 132);
    if (routeWindow && !hunter.action) {
      startVault(hunter, routeWindow, getHunterVaultDuration(HUNTER_WINDOW_VAULT_DURATION), now, "vaulting");
      return;
    }

    const moved = moveActorToPoint(hunter, target.x, target.y, getHunterMoveSpeed(), dt, now);
    if (moved > 0.4) return;

    const nearWindow = findNearestWindow(hunter, 108);
    if (nearWindow && !hasWalkableLine(hunter.x, hunter.y, target.x, target.y, hunter.radius)) {
      startVault(hunter, nearWindow, getHunterVaultDuration(HUNTER_WINDOW_VAULT_DURATION), now, "vaulting");
      return;
    }

    hunter.path = [];
    if (dt > 0) hunter.status = "chasing";
  }

  function updateAIHunterChairing(dt, now) {
    if (hunter.carrying) {
      if (canHunterAttack(now)) {
        const attackTarget = findHunterAttackTarget();
        if (attackTarget) {
          performHunterAttack(now);
          updateCarriedSurvivorPosition();
          return true;
        }
      }

      const chairTarget = findNearestEmptyChair(hunter, Infinity);
      if (!chairTarget) return false;
      if (distanceBetween(hunter, chairTarget) < 88) {
        startChairSurvivor(hunter.carrying, chairTarget, now);
        return true;
      }

      const nearDroppedPallet = findNearestPallet(hunter, "dropped", 88);
      if (nearDroppedPallet) {
        startBreakPallet(nearDroppedPallet, now);
        updateCarriedSurvivorPosition();
        return true;
      }

      const routeWindow = findUsefulWindowForRoute(hunter, chairTarget, 132);
      if (routeWindow && !hunter.action) {
        startVault(hunter, routeWindow, getHunterVaultDuration(HUNTER_WINDOW_VAULT_DURATION), now, "vaulting");
        updateCarriedSurvivorPosition();
        return true;
      }

      hunter.status = "carrying";
      moveActorToPoint(hunter, chairTarget.x, chairTarget.y, getHunterMoveSpeed() * getHunterCarrySpeedMultiplier(), dt, now);
      updateCarriedSurvivorPosition();
      return true;
    }

    const downed = findNearestDownedSurvivor(hunter, 118);
    if (downed) {
      startPickupSurvivor(downed, now);
      return true;
    }

    const target = findNearestDownedSurvivor(hunter, 520);
    if (!target) return false;
    hunter.status = "toChair";
    moveActorToPoint(hunter, target.x, target.y, getHunterMoveSpeed() * 0.86, dt, now);
    return true;
  }

  function applyHunterHit(survivor, now, options = {}) {
    if (survivor.escaped || survivor.state === "seated" || survivor.state === "carried" || survivor.state === "eliminated") return;
    if (isSurvivorInvisible(survivor, now)) return;
    const terrorShock = isTerrorShockVulnerable(survivor);
    if (options.applyBoneBleed) applyBoneBleed(survivor, now);
    if (survivor.action && (survivor.action.kind === "healing" || survivor.action.kind === "beingHealed")) {
      cancelHealing(survivor.action);
      survivor.action = null;
    }
    if (survivor.action && survivor.action.kind === "repairing") {
      cancelRepair(survivor.action);
      survivor.action = null;
    }
    if (survivor.action && survivor.action.kind === "openingGate") {
      cancelGateOpen(survivor.action);
      survivor.action = null;
    }
    if (survivor.action && survivor.action.kind === "escaping") {
      survivor.action = null;
    }
    if (survivor.action && survivor.action.kind === "rescuing") {
      survivor.action = null;
    }
    if (survivor.action && survivor.action.kind === "vaulting") {
      survivor.action = null;
    }

    if (terrorShock && options.allowTerrorShock !== false) {
      downSurvivor(survivor);
      survivor.boostUntil = 0;
      chasePulseUntil = now + 420;
      return;
    }

    applySurvivorDamage(survivor, now, options.damage ?? 1);
    triggerActorHitPerformance(survivor, now);
  }

  function triggerActorHitPerformance(survivor, now) {
    if (!isActor(survivor)) return;
    if (survivor.state !== "healthy" && survivor.state !== "injured") return;
    createActorDecoy(survivor, now);
    survivor.invisibleUntil = Math.max(survivor.invisibleUntil || 0, now + ACTOR_HIT_STEALTH_DURATION);
    survivor.boostUntil = Math.max(survivor.boostUntil || 0, now + ACTOR_HIT_STEALTH_DURATION);
    if (hunter.target === survivor) hunter.target = null;
  }

  function createActorDecoy(actor, now) {
    const angle = Number.isFinite(actor.angle) ? actor.angle : 0;
    actorDecoys.push({
      id: ++actorDecoyId,
      kind: "actorDecoy",
      name: actor.name,
      owner: actor,
      x: actor.x,
      y: actor.y,
      state: actor.state === "healthy" ? "healthy" : "injured",
      damageProgress: actor.damageProgress || 0,
      radius: actor.radius,
      angle,
      vx: Math.cos(angle) * ACTOR_DECOY_SPEED,
      vy: Math.sin(angle) * ACTOR_DECOY_SPEED,
      fill: actor.fill,
      core: actor.core,
      until: now + ACTOR_DECOY_DURATION
    });
  }

  function applySurvivorDamage(survivor, now, amount) {
    survivor.damageProgress = (survivor.damageProgress || 0) + amount;
    if (survivor.damageProgress < 1) {
      survivor.healProgress = 0;
      chasePulseUntil = now + 260;
      return;
    }

    survivor.damageProgress -= 1;
    if (survivor.state === "healthy") {
      survivor.state = "injured";
      survivor.injuredAt = now;
      survivor.healProgress = 0;
      survivor.boostUntil = now + getSurvivorHitBoostDuration(survivor, 1800);
      return;
    }

    if (survivor.state === "injured") {
      survivor.damageProgress = 0;
      downSurvivor(survivor);
    }
  }

  function isTerrorShockVulnerable(survivor) {
    return Boolean(survivor.action && ["vaulting", "rescuing", "repairing", "dismantlingLamp"].includes(survivor.action.kind));
  }

  function downSurvivor(survivor) {
    const wasDowned = survivor.state === "downed";
    survivor.state = "downed";
    survivor.healProgress = 0;
    survivor.damageProgress = 0;
    survivor.injuredAt = null;
    survivor.stitchPack = null;
    survivor.chair = null;
    survivor.carryProgress = 0;
    survivor.downedAt = wasDowned && survivor.downedAt ? survivor.downedAt : performance.now();
    survivor.action = null;
    survivor.vx = 0;
    survivor.vy = 0;
    survivor.path = [];
    survivor.pathGoal = null;
    survivor.kiteDecision = null;
    survivor.objectiveDecision = null;
    survivor.healDecision = null;
  }

  function resetMatch() {
    matchResult = null;

    pallets.forEach((pallet) => {
      pallet.label = "standing";
    });

    repairPoints.forEach((point) => {
      point.progress = 0;
      point.completed = false;
      point.workers = [];
    });

    exitGates.forEach((gate) => {
      gate.progress = 0;
      gate.opened = false;
      gate.workers = [];
    });
    hatch.spawned = false;
    hatch.opened = false;
    soulLamps.length = 0;
    packageProjectiles.length = 0;
    stitchPackDrops.length = 0;
    actorDecoys.length = 0;
    nextSoulLampAt = 0;
    lanternAlert = null;

    chairs.forEach((item) => {
      item.survivor = null;
    });

    const survivors = getSurvivors();
    const survivorSpawns = pickSurvivorSpawns(survivors);
    survivors.forEach((survivor, index) => resetSurvivor(survivor, survivorSpawns[index]));

    const hunterSpawn = pickHunterSpawn(survivorSpawns);

    hunter.x = hunterSpawn.x;
    hunter.y = hunterSpawn.y;
    hunter.vx = 0;
    hunter.vy = 0;
    hunter.angle = Math.PI;
    hunter.lastAttackAt = -10000;
    hunter.wipeUntil = 0;
    hunter.lastAttackHit = false;
    hunter.stunnedUntil = 0;
    hunter.presenceHits = 0;
    hunter.presenceTier = 0;
    hunter.nextShadowTeleportAt = 0;
    hunter.nextSawDashAt = 0;
    hunter.sawAttackLockedUntil = 0;
    hunter.shortSawAvailableUntil = 0;
    hunter.pendingSawWipe = false;
    hunter.pendingSawWipeAt = 0;
    hunter.action = null;
    hunter.carrying = null;
    hunter.status = "chasing";
    hunter.target = null;
    hunter.path = [];
    hunter.pathGoal = null;
    hunter.repathAt = 0;
  }

  function showCharacterSelection(role) {
    pendingRole = role;
    if (roleDialogTitle) roleDialogTitle.textContent = role === PLAYER_ROLE.hunter ? "选择追捕者" : "选择逃生者";
    if (roleActions) roleActions.classList.add("is-hidden");
    if (characterPanel) characterPanel.classList.remove("is-hidden");
    characterButtons.forEach((button) => {
      button.classList.toggle("is-hidden", button.dataset.characterRole !== role);
    });
  }

  function showRoleSelection() {
    pendingRole = null;
    if (roleDialogTitle) roleDialogTitle.textContent = "选择阵营";
    if (roleActions) roleActions.classList.remove("is-hidden");
    if (characterPanel) characterPanel.classList.add("is-hidden");
  }

  function startMatch(role, characterId = null) {
    selectedRole = role;
    if (role === PLAYER_ROLE.survivor && characterId) selectedSurvivorCharacter = characterId;
    if (role === PLAYER_ROLE.hunter && characterId) selectedHunterCharacter = characterId;
    assignCharactersForMatch();
    resetMatch();
    matchStarted = true;
    setRoleOverlayVisible(false);
  }

  function restartCurrentMatch() {
    if (!selectedRole) return;
    assignCharactersForMatch();
    resetMatch();
    matchStarted = true;
    setRoleOverlayVisible(false);
  }

  function setRoleOverlayVisible(visible) {
    if (!roleOverlay) return;
    roleOverlay.classList.toggle("is-hidden", !visible);
    if (visible) showRoleSelection();
  }

  function resetSurvivor(survivor, spawn) {
    survivor.x = spawn ? spawn.x : survivor.initialX;
    survivor.y = spawn ? spawn.y : survivor.initialY;
    survivor.vx = 0;
    survivor.vy = 0;
    survivor.stamina = 100;
    survivor.angle = 0;
    survivor.state = "healthy";
    survivor.healProgress = 0;
    survivor.damageProgress = 0;
    survivor.bleedStacks = [];
    survivor.chairProgress = 0;
    survivor.injuredAt = null;
    survivor.downedAt = null;
    survivor.nextChairEliminates = false;
    survivor.carryProgress = 0;
    survivor.chair = null;
    survivor.escaped = false;
    survivor.boostUntil = 0;
    survivor.stitchPack = null;
    survivor.timeDevice = null;
    survivor.invisibleUntil = 0;
    survivor.action = null;
    survivor.nextPackageAt = 0;
    survivor.nextTimeRewindAt = 0;
    survivor.nextMagicShowAt = 0;
    survivor.magicShowMode = "rescue";
    survivor.path = [];
    survivor.pathGoal = null;
    survivor.repathAt = 0;
    survivor.kiteDecision = null;
    survivor.healDecision = null;
    survivor.objectiveDecision = null;
    if (survivor.kind === "ai") {
      survivor.nextInteractAt = 0;
      survivor.wanderTarget = pickWanderTarget();
    }
  }

  function pickSurvivorSpawns(survivors) {
    const anchors = shuffled(getKiteSpawnAnchors());
    const spawns = [];
    survivors.forEach((survivor, index) => {
      const anchor = anchors.find((item) => isFarFromAll(item, spawns, 420)) || anchors[index % anchors.length];
      spawns.push(pickSpawnNearKiteAnchor(anchor, spawns, 280, survivor.radius));
    });
    return spawns;
  }

  function pickHunterSpawn(survivorSpawns) {
    const candidates = getSpawnCandidates(hunter.radius);
    return pickHighScoreSpawn(candidates, survivorSpawns, 620, hunter.radius);
  }

  function getKiteSpawnAnchors() {
    return windows.concat(pallets.filter((pallet) => pallet.label !== "broken"));
  }

  function pickSpawnNearKiteAnchor(anchor, exclusions, minDistance, radius) {
    const candidates = getSpawnCandidates(radius)
      .filter((point) => {
        const anchorDistance = distanceBetween(point, anchor);
        return anchorDistance >= 100 && anchorDistance <= 300;
      });
    return pickHighScoreSpawn(candidates, exclusions, minDistance, radius, anchor);
  }

  function pickHighScoreSpawn(candidates, exclusions, minDistance, radius, anchor = null) {
    const relaxedDistances = [minDistance, minDistance * 0.78, minDistance * 0.55, 0];
    for (const requiredDistance of relaxedDistances) {
      const validCandidates = candidates.filter((point) => isFarFromAll(point, exclusions, requiredDistance));
      if (validCandidates.length > 0) {
        const best = validCandidates
          .map((point) => ({ point, score: scoreSpawnPoint(point, exclusions, anchor) + Math.random() * 120 }))
          .sort((a, b) => b.score - a.score)
          .slice(0, 8);
        return best[Math.floor(Math.random() * best.length)].point;
      }
    }

    return getFallbackSpawn(radius);
  }

  function getSpawnCandidates(radius) {
    const candidates = [];
    for (let row = 1; row < nav.rows - 1; row += 1) {
      for (let col = 1; col < nav.cols - 1; col += 1) {
        const point = cellToWorld({ col, row });
        if (isSafePosition(point.x, point.y, radius + 8)) candidates.push(point);
      }
    }
    return shuffled(candidates);
  }

  function scoreSpawnPoint(point, exclusions, anchor) {
    const separation = exclusions.length === 0
      ? 420
      : Math.min(...exclusions.map((other) => distanceBetween(point, other)));
    if (!anchor) return separation;
    const anchorDistance = distanceBetween(point, anchor);
    const kiteBonus = 220 - Math.abs(anchorDistance - 170);
    return separation + kiteBonus * 1.8;
  }

  function getFallbackSpawn(radius) {
    const candidates = getSpawnCandidates(radius);
    if (candidates.length > 0) return candidates[Math.floor(Math.random() * candidates.length)];
    return findNearestSafePosition(world.width / 2, world.height / 2, radius);
  }

  function isFarFromAll(point, others, minDistance) {
    return others.every((other) => distanceBetween(point, other) >= minDistance);
  }

  function shuffled(items) {
    const result = items.slice();
    for (let index = result.length - 1; index > 0; index -= 1) {
      const randomIndex = Math.floor(Math.random() * (index + 1));
      [result[index], result[randomIndex]] = [result[randomIndex], result[index]];
    }
    return result;
  }

  function handlePlayerInteraction(now) {
    if (selectedRole === PLAYER_ROLE.hunter) {
      handleHunterInteraction(now);
      return;
    }

    if (!matchStarted || selectedRole !== PLAYER_ROLE.survivor) return;
    if (player.state !== "healthy" && player.state !== "injured" || player.action) return;

    const standingPallet = findNearestPallet(player, "standing", SURVIVOR_PALLET_PROMPT_RANGE);
    if (standingPallet) {
      dropPallet(standingPallet, now);
      return;
    }

    const droppedPallet = findNearestPallet(player, "dropped", SURVIVOR_PALLET_PROMPT_RANGE);
    if (droppedPallet) {
      startVault(player, droppedPallet, getSurvivorVaultDuration(player, 260), now, "vaulting");
      return;
    }

    const nearWindow = findNearestWindow(player, SURVIVOR_WINDOW_PROMPT_RANGE);
    if (nearWindow) {
      startVault(player, nearWindow, getSurvivorVaultDuration(player, 320), now, "vaulting");
    }
  }

  function handleHunterInteraction(now) {
    if (!matchStarted || hunter.action || now < hunter.stunnedUntil || now < hunter.wipeUntil) return;

    if (hunter.carrying) {
      const chairTarget = findNearestEmptyChair(hunter, 116);
      if (chairTarget) {
        startChairSurvivor(hunter.carrying, chairTarget, now);
        return;
      }
    } else {
      const downedSurvivor = findNearestDownedSurvivor(hunter, 112);
      if (downedSurvivor) {
        startPickupSurvivor(downedSurvivor, now);
        return;
      }
    }

    const droppedPallet = findNearestPallet(hunter, "dropped", HUNTER_PALLET_PROMPT_RANGE);
    if (droppedPallet) {
      startBreakPallet(droppedPallet, now);
      return;
    }

    const nearWindow = findNearestWindow(hunter, HUNTER_WINDOW_PROMPT_RANGE);
    if (nearWindow) {
      startVault(hunter, nearWindow, getHunterVaultDuration(HUNTER_WINDOW_VAULT_DURATION), now, "vaulting");
    }
  }

  function handlePlayerUse(now) {
    if (!matchStarted || selectedRole !== PLAYER_ROLE.survivor) return;
    if (player.action && player.action.kind === "dismantlingLamp") {
      player.action = null;
      return;
    }
    if (player.action && player.action.kind === "healing") {
      cancelHealing(player.action);
      player.action = null;
      return;
    }
    if (player.action && player.action.kind === "repairing") {
      if (resolvePlayerRepairCalibration(now)) return;
      cancelRepair(player.action);
      player.action = null;
      return;
    }
    if (player.action && player.action.kind === "openingGate") {
      cancelGateOpen(player.action);
      player.action = null;
      return;
    }
    if (player.action && player.action.kind === "rescuing") {
      player.action = null;
      return;
    }
    const hatchTarget = findNearestHatch(player, 96);
    if (hatchTarget && (player.state === "healthy" || player.state === "injured" || player.state === "downed")) {
      startHatchEscape(player, now);
      return;
    }
    if (player.state !== "healthy" && player.state !== "injured" || player.action || player.escaped) return;

    const soulLamp = findNearestSoulLamp(player, SOUL_LAMP_DISMANTLE_RANGE);
    if (soulLamp) {
      startDismantleSoulLamp(player, soulLamp, now);
      return;
    }

    const seatedTarget = findNearestSeatedTeammate(player, 96);
    if (seatedTarget) {
      startRescue(player, seatedTarget, now);
      return;
    }

    const target = findNearestHealableTeammate(player, 92);
    if (target) {
      startHealing(player, target, now);
      return;
    }

    if (areExitsPowered()) {
      const gate = findNearestExitGate(player, 96);
      if (gate) {
        if (gate.opened) startEscape(player, gate, now);
        else startOpenGate(player, gate, now);
        return;
      }
    }

    const repairPoint = findNearestRepairPoint(player, 110);
    if (repairPoint) startRepair(player, repairPoint, now);
  }

  function findNearestHealableTeammate(actor, range) {
    let nearest = null;
    let nearestDistance = Infinity;
    teammates.forEach((survivor) => {
      if (!canBeHealed(survivor)) return;
      const distance = distanceBetween(actor, survivor);
      if (distance < range && distance < nearestDistance) {
        nearest = survivor;
        nearestDistance = distance;
      }
    });
    return nearest;
  }

  function findNearestStitchPackTarget(actor, range) {
    let nearest = null;
    let nearestDistance = Infinity;
    getSurvivors().forEach((survivor) => {
      if (survivor === actor || !canReceiveStitchPack(survivor)) return;
      const distance = distanceBetween(actor, survivor);
      if (distance < range && distance < nearestDistance) {
        nearest = survivor;
        nearestDistance = distance;
      }
    });
    return nearest;
  }

  function canReceiveStitchPack(survivor) {
    return survivor &&
      survivor.state === "injured" &&
      !survivor.escaped &&
      !survivor.stitchPack &&
      (!survivor.action || survivor.action.kind !== "beingHealed");
  }

  function findNearestSeatedTeammate(actor, range) {
    let nearest = null;
    let nearestDistance = Infinity;
    getSurvivors().forEach((survivor) => {
      if (survivor === actor || survivor.state !== "seated" || !survivor.chair || isBeingRescued(survivor)) return;
      const distance = distanceBetween(actor, survivor.chair);
      if (distance < range && distance < nearestDistance) {
        nearest = survivor;
        nearestDistance = distance;
      }
    });
    return nearest;
  }

  function findNearestRepairPoint(actor, range) {
    let nearest = null;
    let nearestDistance = Infinity;
    repairPoints.forEach((point) => {
      if (point.completed || isRepairingPoint(actor, point)) return;
      const distance = distanceBetween(actor, point);
      if (distance < range && distance < nearestDistance) {
        nearest = point;
        nearestDistance = distance;
      }
    });
    return nearest;
  }

  function findNearestExitGate(actor, range) {
    let nearest = null;
    let nearestDistance = Infinity;
    exitGates.forEach((gate) => {
      const distance = distanceBetween(actor, gate);
      if (distance < range && distance < nearestDistance) {
        nearest = gate;
        nearestDistance = distance;
      }
    });
    return nearest;
  }

  function findNearestHatch(actor, range) {
    if (!isHatchOpen()) return null;
    return distanceBetween(actor, hatch) < range ? hatch : null;
  }

  function findNearestSoulLamp(actor, range) {
    let nearest = null;
    let nearestDistance = Infinity;
    soulLamps.forEach((lamp) => {
      const distance = distanceBetween(actor, lamp);
      if (distance < range && distance < nearestDistance) {
        nearest = lamp;
        nearestDistance = distance;
      }
    });
    return nearest;
  }

  function canRecallSoulLamp(now) {
    return matchStarted &&
      selectedRole === PLAYER_ROLE.hunter &&
      isLanternKeeper() &&
      !hunter.action &&
      !hunter.carrying &&
      now >= hunter.stunnedUntil &&
      now >= hunter.wipeUntil &&
      Boolean(findNearestSoulLamp(hunter, SOUL_LAMP_RECALL_RANGE));
  }

  function placeSoulLamp(now) {
    const safe = findNearestSafePosition(hunter.x, hunter.y, 8);
    soulLamps.push({
      id: ++soulLampId,
      x: safe.x,
      y: safe.y,
      createdAt: now,
      lastAlertAt: -Infinity,
      detectingUntil: 0
    });
    nextSoulLampAt = now + SOUL_LAMP_COOLDOWN;
    lanternAlert = {
      text: `寄魂灯 ${soulLamps.length}/${getSoulLampLimit()}`,
      until: now + 1400
    };
    chasePulseUntil = now + 320;
  }

  function recallSoulLamp(lamp, now) {
    const index = soulLamps.indexOf(lamp);
    if (index === -1) return;
    soulLamps.splice(index, 1);
    if (lanternAlert && lanternAlert.lamp === lamp) lanternAlert = null;
    lanternAlert = {
      text: `收回寄魂灯 ${soulLamps.length}/${getSoulLampLimit()}`,
      until: now + 1400
    };
    chasePulseUntil = now + 320;
  }

  function getShadowTeleportTarget() {
    return findNearestSoulLamp(hunter, Infinity);
  }

  function shadowTeleportToSoulLamp(now) {
    const lamp = getShadowTeleportTarget();
    if (!lamp) return;
    const safe = findNearestSafePosition(lamp.x, lamp.y, hunter.radius);
    hunter.x = safe.x;
    hunter.y = safe.y;
    hunter.vx = 0;
    hunter.vy = 0;
    hunter.path = [];
    hunter.pathGoal = null;
    hunter.repathAt = 0;
    hunter.nextShadowTeleportAt = now + SOUL_LAMP_SHADOW_TELEPORT_COOLDOWN;
    hunter.status = "chasing";
    lanternAlert = {
      text: "灯影之人",
      until: now + 1400
    };
    chasePulseUntil = now + 420;
  }

  function screenToWorld(clientX, clientY) {
    const box = canvas.getBoundingClientRect();
    const localX = actorClamp(clientX - box.left, 0, box.width || width);
    const localY = actorClamp(clientY - box.top, 0, box.height || height);
    return {
      x: camera.x + localX / camera.zoom,
      y: camera.y + localY / camera.zoom
    };
  }

  function rememberAimPointer(clientX, clientY) {
    lastAimPointer = { clientX, clientY };
  }

  function getAimTargetFromPointer(clientX, clientY, useLastPointer = true) {
    if (typeof clientX === "number" && typeof clientY === "number") {
      rememberAimPointer(clientX, clientY);
      return screenToWorld(clientX, clientY);
    }
    if (useLastPointer && lastAimPointer) return screenToWorld(lastAimPointer.clientX, lastAimPointer.clientY);
    return null;
  }

  function getDefaultPackageTarget(actor) {
    return {
      x: actor.x + Math.cos(actor.angle) * PACKAGE_RANGE,
      y: actor.y + Math.sin(actor.angle) * PACKAGE_RANGE
    };
  }

  function startPackageAim(actor, now, clientX = null, clientY = null, pointerId = null, useLastPointer = true) {
    if (packageAim || !canThrowPackage(actor, now)) return false;
    const target = getAimTargetFromPointer(clientX, clientY, useLastPointer) || getDefaultPackageTarget(actor);
    packageAim = {
      actor,
      targetX: target.x,
      targetY: target.y,
      pointerId
    };
    return true;
  }

  function updatePackageAim(clientX, clientY, pointerId = null) {
    if (packageAim && packageAim.pointerId !== null && pointerId !== null && packageAim.pointerId !== pointerId) return;
    if (typeof clientX === "number" && typeof clientY === "number") rememberAimPointer(clientX, clientY);
    if (!packageAim) return;
    const target = getAimTargetFromPointer(clientX, clientY);
    if (!target) return;
    packageAim.targetX = target.x;
    packageAim.targetY = target.y;
  }

  function finishPackageAim(now, pointerId = null) {
    if (!packageAim) return false;
    if (packageAim.pointerId !== null && pointerId !== null && packageAim.pointerId !== pointerId) return false;
    const aim = packageAim;
    packageAim = null;
    if (!canThrowPackage(aim.actor, now)) return false;
    const dx = aim.targetX - aim.actor.x;
    const dy = aim.targetY - aim.actor.y;
    const distance = Math.hypot(dx, dy);
    const angle = distance > 8 ? Math.atan2(dy, dx) : aim.actor.angle;
    const range = Math.min(PACKAGE_RANGE, Math.max(80, distance || PACKAGE_RANGE));
    throwPackage(aim.actor, angle, now, range);
    return true;
  }

  function cancelPackageAim(pointerId = null) {
    if (!packageAim) return;
    if (packageAim.pointerId !== null && pointerId !== null && packageAim.pointerId !== pointerId) return;
    packageAim = null;
  }

  function placeTimeDevice(actor, now) {
    if (!canPlaceTimeDevice(actor, now)) return;
    actor.timeDevice = {
      x: actor.x,
      y: actor.y,
      state: actor.state,
      damageProgress: actor.damageProgress || 0,
      healProgress: actor.healProgress || 0,
      until: now + TIME_REWIND_WINDOW
    };
    actor.nextTimeRewindAt = now + TIME_REWIND_COOLDOWN;
    chasePulseUntil = now + 360;
  }

  function activateTimeRewind(actor, now) {
    if (!canActivateTimeRewind(actor, now)) return;
    const device = actor.timeDevice;
    cancelSurvivorAction(actor);
    const safe = findNearestSafePosition(device.x, device.y, actor.radius);
    actor.x = safe.x;
    actor.y = safe.y;
    actor.vx = 0;
    actor.vy = 0;
    actor.state = device.state;
    actor.damageProgress = device.damageProgress || 0;
    actor.healProgress = device.healProgress || 0;
    actor.downedAt = null;
    actor.chair = null;
    actor.carryProgress = 0;
    actor.boostUntil = 0;
    actor.invisibleUntil = now + TIME_REWIND_STEALTH_DURATION;
    actor.timeDevice = null;
    actor.path = [];
    actor.pathGoal = null;
    actor.healDecision = null;
    actor.objectiveDecision = null;
    if (hunter.target === actor) hunter.target = null;
    chasePulseUntil = now + 520;
  }

  function toggleMagicShowMode(actor) {
    if (!isActor(actor)) return;
    actor.magicShowMode = actor.magicShowMode === "rescue" ? "hunter" : "rescue";
    lanternAlert = {
      text: actor.magicShowMode === "rescue" ? "魔术秀：转移椅上队友" : "魔术秀：转移监管者",
      until: performance.now() + 1200
    };
  }

  function performMagicShow(actor, now) {
    if (!canUseMagicShow(actor, now)) return;
    const success = actor.magicShowMode === "hunter"
      ? magicShowMoveHunter(actor, now)
      : magicShowMoveSeatedSurvivor(actor, now);
    if (!success) {
      lanternAlert = {
        text: actor.magicShowMode === "hunter" ? "附近没有空椅子" : "没有可转移的上椅队友",
        until: now + 1400
      };
      return;
    }
    actor.nextMagicShowAt = now + MAGIC_SHOW_COOLDOWN;
    chasePulseUntil = now + 520;
  }

  function magicShowMoveSeatedSurvivor(actor, now) {
    const target = findNearestSeatedSurvivor(actor, Infinity);
    if (!target || !target.chair) return false;
    const targetChair = findNearestEmptyChair(actor, Infinity);
    if (!targetChair) return false;

    cancelRescuesForTarget(target);
    const oldChair = target.chair;
    const progress = target.chairProgress || 0;
    oldChair.survivor = null;
    targetChair.survivor = target;
    target.chair = targetChair;
    target.x = targetChair.x;
    target.y = targetChair.y;
    target.vx = 0;
    target.vy = 0;
    target.chairProgress = progress;
    target.chairStart = now - progress * CHAIR_ELIMINATION_DURATION;
    target.path = [];
    target.pathGoal = null;
    lanternAlert = { text: `魔术秀转移 ${target.name}`, until: now + 1500 };
    return true;
  }

  function magicShowMoveHunter(actor, now) {
    const targetChair = findNearestEmptyChair(actor, Infinity);
    if (!targetChair) return false;
    const safe = findNearestSafePosition(targetChair.x + 58, targetChair.y + 18, hunter.radius);
    hunter.x = safe.x;
    hunter.y = safe.y;
    hunter.vx = 0;
    hunter.vy = 0;
    hunter.action = null;
    hunter.path = [];
    hunter.pathGoal = null;
    hunter.target = null;
    hunter.status = "chasing";
    if (hunter.carrying) updateCarriedSurvivorPosition();
    lanternAlert = { text: "魔术秀转移监管者", until: now + 1500 };
    return true;
  }

  function findNearestSeatedSurvivor(actor, range) {
    let nearest = null;
    let nearestDistance = Infinity;
    getSurvivors().forEach((survivor) => {
      if (survivor === actor || survivor.state !== "seated" || !survivor.chair) return;
      const distance = distanceBetween(actor, survivor.chair);
      if (distance < range && distance < nearestDistance) {
        nearest = survivor;
        nearestDistance = distance;
      }
    });
    return nearest;
  }

  function cancelRescuesForTarget(target) {
    getSurvivors().forEach((survivor) => {
      if (survivor.action && survivor.action.kind === "rescuing" && survivor.action.target === target) {
        survivor.action = null;
      }
    });
  }

  function throwPackage(actor, angle, now, range = PACKAGE_RANGE) {
    actor.nextPackageAt = now + PACKAGE_COOLDOWN;
    packageProjectiles.push({
      id: ++packageProjectileId,
      owner: actor,
      x: actor.x + Math.cos(angle) * (actor.radius + 12),
      y: actor.y + Math.sin(angle) * (actor.radius + 12),
      vx: Math.cos(angle) * PACKAGE_SPEED,
      vy: Math.sin(angle) * PACKAGE_SPEED,
      angle,
      range,
      traveled: 0,
      createdAt: now
    });
    chasePulseUntil = now + 240;
  }

  function updatePackageProjectiles(dt, now) {
    for (let index = packageProjectiles.length - 1; index >= 0; index -= 1) {
      const item = packageProjectiles[index];
      const dx = item.vx * dt;
      const dy = item.vy * dt;
      item.x += dx;
      item.y += dy;
      item.traveled += Math.hypot(dx, dy);

      if (packageHitsHunter(item, now)) {
        packageProjectiles.splice(index, 1);
        continue;
      }

      if (item.traveled >= item.range || collides(item.x, item.y, PACKAGE_RADIUS)) {
        packageProjectiles.splice(index, 1);
      }
    }
  }

  function packageHitsHunter(item, now) {
    if (distanceBetween(item, hunter) > hunter.radius + PACKAGE_HIT_RADIUS) return false;
    applyPackageHit(now);
    return true;
  }

  function applyPackageHit(now) {
    interruptHunterByStun(now, PACKAGE_STUN_DURATION);
    chasePulseUntil = now + 420;
  }

  function startDismantleSoulLamp(actor, lamp, now) {
    if (!lamp || actor.action || actor.state !== "healthy" && actor.state !== "injured" || actor.escaped) return;
    actor.action = {
      kind: "dismantlingLamp",
      start: now,
      until: now + SOUL_LAMP_DISMANTLE_DURATION,
      lamp
    };
    actor.vx = 0;
    actor.vy = 0;
  }

  function finishDismantleSoulLamp(action) {
    const lamp = action.lamp;
    const index = soulLamps.indexOf(lamp);
    if (index === -1) return;
    soulLamps.splice(index, 1);
    if (lanternAlert && lanternAlert.lamp === lamp) lanternAlert = null;
    chasePulseUntil = performance.now() + 320;
  }

  function getCompletedRepairCount() {
    return repairPoints.filter((point) => point.completed).length;
  }

  function isHatchSpawned() {
    return hatch.spawned;
  }

  function isHatchOpen() {
    return hatch.spawned && hatch.opened;
  }

  function areExitsPowered() {
    return getCompletedRepairCount() >= REPAIR_REQUIRED;
  }

  function canBeHealed(survivor) {
    if (!isHealableState(survivor) || survivor.escaped) return false;
    return !survivor.action || survivor.action.kind === "beingHealed";
  }

  function findNearestDownedSurvivor(actor, range) {
    let nearest = null;
    let nearestDistance = Infinity;
    getSurvivors().forEach((survivor) => {
      if (survivor.state !== "downed" || survivor.escaped) return;
      const distance = distanceBetween(actor, survivor);
      if (distance < range && distance < nearestDistance) {
        nearest = survivor;
        nearestDistance = distance;
      }
    });
    return nearest;
  }

  function findNearestEmptyChair(actor, range) {
    let nearest = null;
    let nearestDistance = Infinity;
    chairs.forEach((item) => {
      if (item.survivor) return;
      const distance = distanceBetween(actor, item);
      if (distance < range && distance < nearestDistance) {
        nearest = item;
        nearestDistance = distance;
      }
    });
    return nearest;
  }

  function isHealableState(survivor) {
    return survivor.state === "injured" || survivor.state === "downed";
  }

  function placeStitchPack(apprentice, now, target = null) {
    if (!canPlaceStitchPack(apprentice)) return;
    const placedNearTarget = target && canReceiveStitchPack(target) && distanceBetween(apprentice, target) < 280;
    const baseX = placedNearTarget ? target.x : apprentice.x + Math.cos(apprentice.angle) * 42;
    const baseY = placedNearTarget ? target.y : apprentice.y + Math.sin(apprentice.angle) * 42;
    const safe = findNearestSafePosition(baseX, baseY, 10);
    const existing = stitchPackDrops.find((item) => item.owner === apprentice);
    if (existing) {
      existing.x = safe.x;
      existing.y = safe.y;
      existing.createdAt = now;
    } else {
      stitchPackDrops.push({
        id: ++stitchPackDropId,
        owner: apprentice,
        x: safe.x,
        y: safe.y,
        createdAt: now
      });
    }
    apprentice.nextInteractAt = now + 450;
    apprentice.path = [];
    apprentice.pathGoal = null;
    if (apprentice.kind === "ai") apprentice.healDecision = null;
    chasePulseUntil = now + 260;
  }

  function applyStitchPack(target, now, from = null) {
    if (!target || !canReceiveStitchPack(target)) return;
    target.stitchPack = {
      from,
      appliedAt: now,
      healAt: now + STITCH_HEAL_DELAY
    };
    target.healProgress = 0;
    chasePulseUntil = now + 320;
  }

  function startHealing(healer, target, now) {
    if (healer.action || healer.state !== "healthy" && healer.state !== "injured" || !canBeHealed(target) || healer === target) return;
    if (healer.kind === "ai" && hunter.target === healer) return;
    healer.action = {
      kind: "healing",
      start: now,
      target,
      healer
    };
    if (!target.action) {
      target.action = {
        kind: "beingHealed",
        start: now,
        target
      };
    }
    if (healer.kind === "ai") healer.healDecision = null;
    if (target.kind === "ai") target.healDecision = null;
    healer.vx = 0;
    healer.vy = 0;
    target.vx = 0;
    target.vy = 0;
  }

  function startRepair(actor, point, now) {
    if (actor.action || actor.state === "downed" || actor.escaped || point.completed || isRepairingPoint(actor, point)) return;
    const baseDuration = actor === player && selectedRole === PLAYER_ROLE.survivor
      ? PLAYER_REPAIR_DURATION
      : AI_REPAIR_DURATION;
    const duration = getSurvivorRepairDuration(actor, baseDuration);
    actor.action = {
      kind: "repairing",
      start: now,
      point,
      actor,
      duration,
      calibration: null,
      calibrationFeedback: null,
      nextCalibrationAt: getNextRepairCalibrationAt(now, true)
    };
    point.workers.push(actor);
    actor.vx = 0;
    actor.vy = 0;
  }

  function finishRepair(point) {
    point.progress = 1;
    point.completed = true;
    point.workers.forEach((worker) => {
      if (worker.action && worker.action.kind === "repairing" && worker.action.point === point) {
        worker.action = null;
      }
    });
    point.workers = [];
    chasePulseUntil = performance.now() + 360;
    getSurvivors().forEach((survivor) => {
      if (survivor.objectiveDecision && survivor.objectiveDecision.target === point) {
        survivor.objectiveDecision = null;
      }
    });
  }

  function cancelRepair(action) {
    if (!action || !action.point) return;
    action.point.workers = action.point.workers.filter((worker) => worker !== action.actor);
  }

  function getNextRepairCalibrationAt(now, first = false) {
    const min = first ? REPAIR_CALIBRATION_FIRST_MIN : REPAIR_CALIBRATION_INTERVAL_MIN;
    const max = first ? REPAIR_CALIBRATION_FIRST_MAX : REPAIR_CALIBRATION_INTERVAL_MAX;
    return now + min + Math.random() * (max - min);
  }

  function updateRepairCalibration(action, now) {
    if (!action || action.actor !== player || selectedRole !== PLAYER_ROLE.survivor) return;
    if (action.calibrationFeedback && now >= action.calibrationFeedback.until) action.calibrationFeedback = null;
    if (!action.calibration && now >= (action.nextCalibrationAt || Infinity)) {
      startRepairCalibration(action, now);
    }
    if (action.calibration && now >= action.calibration.until) {
      finishRepairCalibration(action, now, "fail");
    }
  }

  function startRepairCalibration(action, now) {
    const successSize = REPAIR_CALIBRATION_SUCCESS_SIZE * getRepairCalibrationRangeMultiplier(action.actor);
    const perfectSize = REPAIR_CALIBRATION_PERFECT_SIZE * getRepairCalibrationRangeMultiplier(action.actor);
    const successStart = 0.44 + Math.random() * 0.24;
    const successEnd = Math.min(0.92, successStart + successSize);
    const perfectStart = successStart + (successEnd - successStart - perfectSize) * (0.35 + Math.random() * 0.3);
    action.calibration = {
      start: now,
      until: now + REPAIR_CALIBRATION_DURATION,
      successStart,
      successEnd,
      perfectStart,
      perfectEnd: perfectStart + perfectSize
    };
    action.calibrationFeedback = null;
  }

  function getRepairCalibrationRangeMultiplier(actor) {
    return isClockmaker(actor) ? CLOCKMAKER_CALIBRATION_RANGE_MULTIPLIER : 1;
  }

  function getRepairCalibrationBonus(actor) {
    return isClockmaker(actor) ? CLOCKMAKER_CALIBRATION_BONUS : 0;
  }

  function resolvePlayerRepairCalibration(now) {
    const action = player.action;
    if (!action || action.kind !== "repairing" || !action.calibration) return false;
    const needle = getRepairCalibrationNeedle(action.calibration, now);
    if (needle >= action.calibration.perfectStart && needle <= action.calibration.perfectEnd) {
      finishRepairCalibration(action, now, "perfect");
    } else if (needle >= action.calibration.successStart && needle <= action.calibration.successEnd) {
      finishRepairCalibration(action, now, "success");
    } else {
      finishRepairCalibration(action, now, "fail");
    }
    return true;
  }

  function getRepairCalibrationNeedle(calibration, now) {
    if (!calibration) return 0;
    return Math.max(0, Math.min(1, (now - calibration.start) / Math.max(calibration.until - calibration.start, 1)));
  }

  function finishRepairCalibration(action, now, result) {
    if (!action || !action.point || !action.calibration) return;
    action.calibration = null;
    action.nextCalibrationAt = getNextRepairCalibrationAt(now);

    if (result === "perfect") {
      const bonus = REPAIR_CALIBRATION_PERFECT_BONUS + getRepairCalibrationBonus(action.actor);
      applyRepairCalibrationDelta(action, bonus);
      action.calibrationFeedback = { label: `完美校准 +${Math.round(bonus * 100)}%`, color: "#d9b76a", until: now + 1200 };
    } else if (result === "success") {
      const bonus = REPAIR_CALIBRATION_SUCCESS_BONUS + getRepairCalibrationBonus(action.actor);
      applyRepairCalibrationDelta(action, bonus);
      action.calibrationFeedback = { label: `校准成功 +${Math.round(bonus * 100)}%`, color: "#b7d6c1", until: now + 1200 };
    } else {
      applyRepairCalibrationDelta(action, -REPAIR_CALIBRATION_FAIL_PENALTY);
      action.calibrationFeedback = { label: "炸机 -5%", color: "#b95f52", until: now + 1400 };
      chasePulseUntil = now + 520;
    }
  }

  function applyRepairCalibrationDelta(action, delta) {
    const point = action.point;
    if (!point || point.completed) return;
    point.progress = Math.max(0, Math.min(1, point.progress + delta));
    if (point.progress >= 1) finishRepair(point);
  }

  function startOpenGate(actor, gate, now) {
    if (actor.action || actor.state === "downed" || actor.escaped || !areExitsPowered() || gate.opened || isOpeningGate(actor, gate)) return;
    actor.action = {
      kind: "openingGate",
      start: now,
      gate,
      actor,
      duration: GATE_OPEN_DURATION
    };
    gate.workers.push(actor);
    actor.vx = 0;
    actor.vy = 0;
  }

  function finishOpenGate(gate) {
    gate.progress = 1;
    gate.opened = true;
    gate.workers.forEach((worker) => {
      if (worker.action && worker.action.kind === "openingGate" && worker.action.gate === gate) {
        worker.action = null;
      }
    });
    gate.workers = [];
    chasePulseUntil = performance.now() + 360;
  }

  function cancelGateOpen(action) {
    if (!action || !action.gate) return;
    action.gate.workers = action.gate.workers.filter((worker) => worker !== action.actor);
  }

  function startEscape(actor, gate, now) {
    if (actor.action || actor.state === "downed" || actor.escaped || !areExitsPowered() || !gate.opened) return;
    actor.action = {
      kind: "escaping",
      start: now,
      until: now + ESCAPE_DURATION,
      gate
    };
    actor.vx = 0;
    actor.vy = 0;
  }

  function startHatchEscape(actor, now) {
    if (actor.action || actor.escaped || !isHatchOpen()) return;
    if (actor.state !== "healthy" && actor.state !== "injured" && actor.state !== "downed") return;
    actor.action = {
      kind: "escaping",
      start: now,
      until: now + ESCAPE_DURATION,
      hatch
    };
    actor.vx = 0;
    actor.vy = 0;
  }

  function finishEscape(actor) {
    actor.escaped = true;
    actor.action = null;
    actor.path = [];
    actor.pathGoal = null;
    actor.kiteDecision = null;
    actor.healDecision = null;
    actor.objectiveDecision = null;
    chasePulseUntil = performance.now() + 360;
  }

  function startPickupSurvivor(survivor, now) {
    if (!survivor || hunter.carrying || hunter.action || survivor.state !== "downed") return;
    hunter.action = {
      kind: "pickingUp",
      start: now,
      until: now + PICKUP_SURVIVOR_DURATION,
      target: survivor
    };
    hunter.status = "pickingUp";
    hunter.vx = 0;
    hunter.vy = 0;
    survivor.vx = 0;
    survivor.vy = 0;
    chasePulseUntil = now + 260;
  }

  function isBeingPickedUp(survivor) {
    return Boolean(
      survivor &&
      hunter.action &&
      hunter.action.kind === "pickingUp" &&
      hunter.action.target === survivor
    );
  }

  function finishPickupSurvivor(survivor) {
    if (!survivor || hunter.carrying || survivor.state !== "downed") return;
    cancelSurvivorAction(survivor);
    survivor.state = "carried";
    survivor.chair = null;
    survivor.carryProgress = 0;
    survivor.downedAt = null;
    survivor.vx = 0;
    survivor.vy = 0;
    survivor.path = [];
    survivor.pathGoal = null;
    hunter.carrying = survivor;
    hunter.status = "carrying";
    updateCarriedSurvivorPosition();
  }

  function cancelPickupAction(action, now = performance.now(), releaseAsInjured = false) {
    if (!action || action.kind !== "pickingUp") return;
    if (!action.target || action.target.state !== "downed") return;
    if (releaseAsInjured) {
      dropPickupTargetFromControl(action.target, now);
      return;
    }
    action.target.vx = 0;
    action.target.vy = 0;
  }

  function updateCarriedSurvivorPosition() {
    if (!hunter.carrying) return;
    const carried = hunter.carrying;
    carried.x = hunter.x - Math.cos(hunter.angle) * 26;
    carried.y = hunter.y - Math.sin(hunter.angle) * 26;
    carried.angle = hunter.angle;
    carried.vx = hunter.vx;
    carried.vy = hunter.vy;
  }

  function updateCarryStruggle(dt, now) {
    const carried = hunter.carrying;
    if (!carried) return;
    if (carried.state !== "carried") {
      hunter.carrying = null;
      return;
    }

    carried.carryProgress = Math.min(1, (carried.carryProgress || 0) + (dt * 1000) / CARRY_STRUGGLE_DURATION);
    if (carried.carryProgress >= 1) {
      breakFreeFromCarry(carried, now);
      return;
    }

    updateCarriedSurvivorPosition();
  }

  function breakFreeFromCarry(survivor, now) {
    if (!survivor || hunter.carrying !== survivor) return;
    hunter.carrying = null;
    survivor.state = "injured";
    survivor.injuredAt = now;
    survivor.carryProgress = 0;
    survivor.chair = null;
    survivor.action = null;
    survivor.downedAt = null;
    survivor.boostUntil = now + getSurvivorHitBoostDuration(survivor, RESCUE_SPEED_BOOST_DURATION);
    survivor.path = [];
    survivor.pathGoal = null;
    survivor.healDecision = null;
    survivor.objectiveDecision = null;

    const safe = findNearestSafePosition(
      hunter.x - Math.cos(hunter.angle) * 92,
      hunter.y - Math.sin(hunter.angle) * 92,
      survivor.radius
    );
    survivor.x = safe.x;
    survivor.y = safe.y;
    survivor.vx = 0;
    survivor.vy = 0;
    hunter.stunnedUntil = now + CARRY_ESCAPE_STUN;
    hunter.wipeUntil = 0;
    hunter.status = "stunned";
    hunter.path = [];
    hunter.pathGoal = null;
    chasePulseUntil = now + 360;
  }

  function dropCarriedSurvivorFromControl(now) {
    const carried = hunter.carrying;
    if (!carried) return;
    hunter.carrying = null;
    carried.state = "injured";
    carried.injuredAt = now;
    carried.carryProgress = 0;
    carried.chair = null;
    carried.action = null;
    carried.downedAt = null;
    carried.boostUntil = now + getSurvivorHitBoostDuration(carried, 900);
    carried.path = [];
    carried.pathGoal = null;
    carried.healDecision = null;
    carried.objectiveDecision = null;
    const safe = findNearestSafePosition(
      hunter.x - Math.cos(hunter.angle) * 74,
      hunter.y - Math.sin(hunter.angle) * 74,
      carried.radius
    );
    carried.x = safe.x;
    carried.y = safe.y;
    carried.vx = 0;
    carried.vy = 0;
  }

  function dropPickupTargetFromControl(survivor, now) {
    survivor.state = "injured";
    survivor.injuredAt = now;
    survivor.carryProgress = 0;
    survivor.chair = null;
    survivor.action = null;
    survivor.downedAt = null;
    survivor.boostUntil = now + getSurvivorHitBoostDuration(survivor, 900);
    survivor.path = [];
    survivor.pathGoal = null;
    survivor.healDecision = null;
    survivor.objectiveDecision = null;
    const safe = findNearestSafePosition(
      hunter.x - Math.cos(hunter.angle) * 74,
      hunter.y - Math.sin(hunter.angle) * 74,
      survivor.radius
    );
    survivor.x = safe.x;
    survivor.y = safe.y;
    survivor.vx = 0;
    survivor.vy = 0;
  }

  function interruptHunterByStun(now, duration) {
    if (hunter.action && hunter.action.kind === "pickingUp") {
      cancelPickupAction(hunter.action, now, true);
      hunter.action = null;
    }
    dropCarriedSurvivorFromControl(now);
    hunter.stunnedUntil = Math.max(hunter.stunnedUntil, now + duration);
    hunter.wipeUntil = 0;
    hunter.status = "stunned";
    hunter.path = [];
    hunter.pathGoal = null;
    hunter.vx = 0;
    hunter.vy = 0;
  }

  function getHunterCarrySpeedMultiplier() {
    if (!hunter.carrying) return 1;
    return Math.max(0.66, 0.84 - (hunter.carrying.carryProgress || 0) * 0.18);
  }

  function startChairSurvivor(survivor, targetChair, now) {
    if (!survivor || !targetChair || targetChair.survivor || survivor.state !== "carried") return;
    if (survivor.nextChairEliminates) {
      hunter.carrying = null;
      survivor.carryProgress = 0;
      eliminateSurvivor(survivor);
      hunter.status = "chasing";
      chasePulseUntil = now + 360;
      return;
    }

    survivor.state = "seated";
    survivor.x = targetChair.x;
    survivor.y = targetChair.y;
    survivor.vx = 0;
    survivor.vy = 0;
    survivor.action = null;
    survivor.chair = targetChair;
    survivor.chairStart = now;
    survivor.carryProgress = 0;
    survivor.downedAt = null;
    targetChair.survivor = survivor;
    hunter.carrying = null;
    hunter.status = "chasing";
    chasePulseUntil = now + 360;
  }

  function startRescue(rescuer, target, now) {
    if (!target || target.state !== "seated" || !target.chair || isBeingRescued(target) || rescuer.action || rescuer.state !== "healthy" && rescuer.state !== "injured") return;
    rescuer.action = {
      kind: "rescuing",
      start: now,
      until: now + getSurvivorRescueDuration(rescuer),
      target
    };
    rescuer.vx = 0;
    rescuer.vy = 0;
  }

  function finishRescue(action) {
    const target = action.target;
    if (!target || target.state !== "seated" || !target.chair) return;
    const chair = target.chair;
    if (target.chairProgress >= 0.5) {
      target.nextChairEliminates = true;
    } else {
      target.chairProgress = 0.5;
      target.nextChairEliminates = false;
    }
    target.state = "injured";
    target.injuredAt = performance.now();
    target.action = null;
    target.chair = null;
    target.carryProgress = 0;
    target.downedAt = null;
    target.boostUntil = performance.now() + getSurvivorHitBoostDuration(target, RESCUE_SPEED_BOOST_DURATION);
    chair.survivor = null;
    const safe = findNearestSafePosition(chair.x + 58, chair.y + 36, target.radius);
    target.x = safe.x;
    target.y = safe.y;
    target.path = [];
    target.pathGoal = null;
    target.healDecision = null;
    target.objectiveDecision = null;
    chasePulseUntil = performance.now() + 360;
  }

  function isBeingRescued(target) {
    return getSurvivors().some((survivor) => {
      return survivor.action && survivor.action.kind === "rescuing" && survivor.action.target === target;
    });
  }

  function eliminateSurvivor(survivor) {
    if (!survivor || survivor.state === "eliminated") return;
    if (survivor.chair) survivor.chair.survivor = null;
    if (hunter.carrying === survivor) hunter.carrying = null;
    cancelSurvivorAction(survivor);
    survivor.state = "eliminated";
    survivor.escaped = false;
    survivor.chair = null;
    survivor.nextChairEliminates = false;
    survivor.carryProgress = 0;
    survivor.downedAt = null;
    survivor.stitchPack = null;
    survivor.timeDevice = null;
    survivor.invisibleUntil = 0;
    survivor.vx = 0;
    survivor.vy = 0;
    survivor.path = [];
    survivor.pathGoal = null;
    chasePulseUntil = performance.now() + 360;
  }

  function cancelSurvivorAction(survivor) {
    if (!survivor.action) return;
    if (survivor.action.kind === "healing" || survivor.action.kind === "beingHealed") cancelHealing(survivor.action);
    if (survivor.action.kind === "repairing") cancelRepair(survivor.action);
    if (survivor.action.kind === "openingGate") cancelGateOpen(survivor.action);
    survivor.action = null;
  }

  function shouldCancelActionOnMove(actor, move) {
    if (!actor.action || move.length <= 0.12) return false;
    if (actor.state !== "healthy" && actor.state !== "injured") return false;
    return ["healing", "beingHealed", "repairing", "openingGate", "escaping", "rescuing", "dismantlingLamp"].includes(actor.action.kind);
  }

  function cancelActionFromMovement(actor) {
    if (!actor.action) return;
    const action = actor.action;
    if (action.kind === "healing" || action.kind === "beingHealed") cancelHealing(action);
    if (action.kind === "repairing") cancelRepair(action);
    if (action.kind === "openingGate") cancelGateOpen(action);
    actor.action = null;
    actor.vx = 0;
    actor.vy = 0;
  }

  function recoverActorsFromStuckStates(now) {
    getSurvivors().forEach((survivor) => recoverSurvivorState(survivor, now));
    recoverActorPosition(hunter);
    recoverStaleTimedAction(hunter, now);
  }

  function recoverSurvivorState(survivor, now) {
    if (survivor.state === "eliminated" || survivor.state === "seated" || survivor.state === "carried") return;
    recoverActorPosition(survivor);
    recoverStaleTimedAction(survivor, now);
  }

  function recoverActorPosition(actor) {
    if (actor.action && ["vaulting", "breaking"].includes(actor.action.kind)) return;
    if (!collides(actor.x, actor.y, Math.max(STUCK_RECOVERY_RADIUS, actor.radius))) return;
    const safe = findNearestSafePosition(actor.x, actor.y, actor.radius);
    actor.x = safe.x;
    actor.y = safe.y;
    actor.vx = 0;
    actor.vy = 0;
    actor.path = [];
    actor.pathGoal = null;
    actor.repathAt = 0;
  }

  function recoverStaleTimedAction(actor, now) {
    if (!actor.action || !actor.action.until) return;
    if (actor.action.kind === "sawDash" && actor.action.noTimeLimit) return;
    if (now <= actor.action.until + ACTION_STALE_GRACE) return;

    const action = actor.action;
    if (action.kind === "repairing") cancelRepair(action);
    if (action.kind === "openingGate") cancelGateOpen(action);
    if (action.kind === "healing" || action.kind === "beingHealed") cancelHealing(action);
    actor.action = null;

    if (typeof action.toX === "number" && typeof action.toY === "number") {
      const safe = findNearestSafePosition(action.toX, action.toY, actor.radius);
      actor.x = safe.x;
      actor.y = safe.y;
    }
    actor.vx = 0;
    actor.vy = 0;
  }

  function finishHealing(target) {
    getActiveHealers(target).forEach((healer) => {
      healer.action = null;
    });
    if (target.state === "downed") {
      target.state = "injured";
      target.injuredAt = performance.now();
      target.boostUntil = performance.now() + getSurvivorHitBoostDuration(target, 900);
      target.carryProgress = 0;
      target.downedAt = null;
    } else if (target.state === "injured") {
      target.state = "healthy";
      target.injuredAt = null;
      target.boostUntil = 0;
    }
    target.healProgress = 0;
    target.damageProgress = 0;
    target.stitchPack = null;
    target.action = null;
    target.kiteDecision = null;
    target.healDecision = null;
    target.path = [];
    target.pathGoal = null;
    target.repathAt = 0;
  }

  function cancelHealing(action) {
    if (!action) return;
    if (action.kind === "beingHealed") {
      getActiveHealers(action.target).forEach((healer) => {
        healer.action = null;
      });
      if (action.target && action.target.action === action) action.target.action = null;
      return;
    }

    if (action.kind === "healing") {
      const target = action.target;
      const remainingHealers = target ? getActiveHealers(target).filter((healer) => healer !== action.healer) : [];
      if (target && target.action && target.action.kind === "beingHealed" && remainingHealers.length === 0) {
        target.action = null;
      }
    }
  }

  function getActiveHealers(target) {
    return getSurvivors().filter((survivor) => {
      if (survivor === target || survivor.escaped) return false;
      return survivor.action &&
        survivor.action.kind === "healing" &&
        survivor.action.target === target &&
        isHealableState(target) &&
        distanceBetween(survivor, target) <= 112;
    });
  }

  function isSurvivorInHunterAttackCone(survivor) {
    const dx = survivor.x - hunter.x;
    const dy = survivor.y - hunter.y;
    const distance = Math.hypot(dx, dy);
    if (distance > hunter.attackRange + survivor.radius * 0.5) return false;
    const targetAngle = Math.atan2(dy, dx);
    return Math.abs(angleDifference(hunter.angle, targetAngle)) <= hunter.attackArc / 2;
  }

  function angleDifference(a, b) {
    return Math.atan2(Math.sin(b - a), Math.cos(b - a));
  }

  function turnToward(current, target, maxStep) {
    const diff = angleDifference(current, target);
    if (Math.abs(diff) <= maxStep) return target;
    return current + Math.sign(diff) * maxStep;
  }

  function dropPallet(pallet, now) {
    pallet.label = "dropped";
    chasePulseUntil = now + 320;
    if (distanceBetween(hunter, pallet) < 92 && now >= hunter.stunnedUntil) {
      interruptHunterByStun(now, 3000);
    }
  }

  function startBreakPallet(pallet, now) {
    if (hunter.action || hunter.status === "stunned") return;
    hunter.status = "breaking";
    hunter.action = {
      kind: "breaking",
      start: now,
      until: now + 1550,
      pallet
    };
  }

  function startVault(actor, obstacle, duration, now, kind) {
    if (actor.action) return;
    const normal = getObstacleNormal(obstacle);
    const side = Math.sign((actor.x - obstacle.x) * normal.x + (actor.y - obstacle.y) * normal.y) || 1;
    const destination = findVaultDestination(actor, obstacle, normal, side);

    actor.action = {
      kind,
      start: now,
      until: now + duration,
      fromX: actor.x,
      fromY: actor.y,
      toX: destination.x,
      toY: destination.y
    };
  }

  function findVaultDestination(actor, obstacle, normal, side) {
    const radius = actor.radius;
    const tangent = { x: -normal.y, y: normal.x };
    const distances = obstacle.label === "window"
      ? [86, 104, 124, 146, 170]
      : [74, 88, 104, 122];
    const tangentOffsets = [0, 18, -18, 34, -34, 52, -52];

    for (const distance of distances) {
      for (const offset of tangentOffsets) {
        const x = obstacle.x - normal.x * side * distance + tangent.x * offset;
        const y = obstacle.y - normal.y * side * distance + tangent.y * offset;
        if (isSafePosition(x, y, radius)) return { x, y };
      }
    }

    return findNearestSafePosition(
      obstacle.x - normal.x * side * distances[distances.length - 1],
      obstacle.y - normal.y * side * distances[distances.length - 1],
      radius
    );
  }

  function isSafePosition(x, y, radius) {
    if (x < 70 || y < 70 || x > world.width - 70 || y > world.height - 70) return false;
    return !collides(x, y, radius);
  }

  function findNearestSafePosition(x, y, radius) {
    if (isSafePosition(x, y, radius)) return { x, y };

    for (let ring = 1; ring <= 8; ring += 1) {
      const distance = ring * 24;
      for (let step = 0; step < 16; step += 1) {
        const angle = (Math.PI * 2 * step) / 16;
        const candidateX = x + Math.cos(angle) * distance;
        const candidateY = y + Math.sin(angle) * distance;
        if (isSafePosition(candidateX, candidateY, radius)) {
          return { x: candidateX, y: candidateY };
        }
      }
    }

    return { x: actorClamp(x, 80, world.width - 80), y: actorClamp(y, 80, world.height - 80) };
  }

  function actorClamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function updateActorAction(actor, now) {
    if (!actor.action) return false;

    const action = actor.action;
    if (action.kind === "sawDash") {
      return updateSawDashAction(action, now);
    }

    if (action.kind === "pickingUp") {
      actor.vx = 0;
      actor.vy = 0;
      actor.status = "pickingUp";
      if (action.target) actor.angle = Math.atan2(action.target.y - actor.y, action.target.x - actor.x);
      if (
        actor !== hunter ||
        hunter.carrying ||
        !action.target ||
        action.target.state !== "downed" ||
        distanceBetween(actor, action.target) > 126
      ) {
        cancelPickupAction(action);
        actor.action = null;
        return true;
      }
      if (now < hunter.stunnedUntil) {
        cancelPickupAction(action, now, true);
        actor.action = null;
        return true;
      }
      if (now >= action.until) {
        finishPickupSurvivor(action.target);
        actor.action = null;
      }
      return true;
    }

    if (action.kind === "healing") {
      actor.vx = 0;
      actor.vy = 0;
      actor.angle = Math.atan2(action.target.y - actor.y, action.target.x - actor.x);
      if (actor.kind === "ai" && (hunter.target === actor || !canAIHealTarget(action.target, actor))) {
        cancelHealing(action);
        actor.action = null;
        actor.healDecision = null;
        return true;
      }
      if (!isHealableState(action.target) || action.target.escaped || distanceBetween(actor, action.target) > 112) {
        cancelHealing(action);
        actor.action = null;
        return true;
      }
      if (!action.target.action) {
        action.target.action = {
          kind: "beingHealed",
          start: action.start,
          target: action.target
        };
      } else if (action.target.action.kind !== "beingHealed") {
        cancelHealing(action);
        actor.action = null;
        return true;
      }
      return true;
    }

    if (action.kind === "rescuing") {
      actor.vx = 0;
      actor.vy = 0;
      actor.angle = Math.atan2(action.target.y - actor.y, action.target.x - actor.x);
      if (action.target.state !== "seated" || !action.target.chair || distanceBetween(actor, action.target.chair) > 112) {
        actor.action = null;
        return true;
      }
      if (now >= action.until) {
        finishRescue(action);
        actor.action = null;
      }
      return true;
    }

    if (action.kind === "dismantlingLamp") {
      actor.vx = 0;
      actor.vy = 0;
      actor.angle = Math.atan2(action.lamp.y - actor.y, action.lamp.x - actor.x);
      if (!soulLamps.includes(action.lamp) || actor.state !== "healthy" && actor.state !== "injured" || distanceBetween(actor, action.lamp) > SOUL_LAMP_DISMANTLE_RANGE + 18) {
        actor.action = null;
        return true;
      }
      if (now >= action.until) {
        finishDismantleSoulLamp(action);
        actor.action = null;
      }
      return true;
    }

    if (action.kind === "beingHealed") {
      actor.vx = 0;
      actor.vy = 0;
      if (!isHealableState(actor) || getActiveHealers(actor).length === 0) {
        actor.action = null;
      }
      return true;
    }

    if (action.kind === "repairing") {
      actor.vx = 0;
      actor.vy = 0;
      actor.angle = Math.atan2(action.point.y - actor.y, action.point.x - actor.x);
      if (actor.state === "downed" || actor.escaped || action.point.completed || distanceBetween(actor, action.point) > 130) {
        cancelRepair(action);
        actor.action = null;
        return true;
      }
      updateRepairCalibration(action, now);
      return true;
    }

    if (action.kind === "openingGate") {
      actor.vx = 0;
      actor.vy = 0;
      actor.angle = Math.atan2(action.gate.y - actor.y, action.gate.x - actor.x);
      if (!areExitsPowered() || action.gate.opened || actor.state === "downed" || actor.escaped || distanceBetween(actor, action.gate) > 120) {
        cancelGateOpen(action);
        actor.action = null;
        return true;
      }
      return true;
    }

    if (action.kind === "escaping") {
      const escapeTarget = action.gate || action.hatch;
      const isHatchEscape = Boolean(action.hatch);
      actor.vx = 0;
      actor.vy = 0;
      actor.angle = Math.atan2(escapeTarget.y - actor.y, escapeTarget.x - actor.x);
      if (
        !escapeTarget ||
        actor.escaped ||
        (isHatchEscape ? !isHatchOpen() : (!areExitsPowered() || actor.state === "downed")) ||
        distanceBetween(actor, escapeTarget) > 120
      ) {
        actor.action = null;
        return true;
      }
      if (now >= action.until) finishEscape(actor);
      return true;
    }

    if (action.kind === "breaking") {
      hunter.status = "breaking";
      if (now >= action.until) {
        action.pallet.label = "broken";
        actor.action = null;
      }
      return true;
    }

    const progress = Math.min(1, (now - action.start) / Math.max(action.until - action.start, 1));
    const eased = progress < 0.5
      ? 2 * progress * progress
      : 1 - Math.pow(-2 * progress + 2, 2) / 2;

    actor.x = action.fromX + (action.toX - action.fromX) * eased;
    actor.y = action.fromY + (action.toY - action.fromY) * eased;
    actor.angle = Math.atan2(action.toY - action.fromY, action.toX - action.fromX);

    if (actor === hunter) hunter.status = "vaulting";
    if (now >= action.until) actor.action = null;
    return true;
  }

  function findNearestPallet(actor, state, range) {
    let nearest = null;
    let nearestDistance = Infinity;
    pallets.forEach((pallet) => {
      if (pallet.label !== state) return;
      const distance = distanceToProp(actor, pallet);
      if (distance < range && distance < nearestDistance) {
        nearest = pallet;
        nearestDistance = distance;
      }
    });
    return nearest;
  }

  function findNearestWindow(actor, range) {
    let nearest = null;
    let nearestDistance = Infinity;
    windows.forEach((item) => {
      const distance = distanceToProp(actor, item);
      if (distance < range && distance < nearestDistance) {
        nearest = item;
        nearestDistance = distance;
      }
    });
    return nearest;
  }

  function distanceBetween(a, b) {
    return Math.hypot(a.x - b.x, a.y - b.y);
  }

  function distanceToProp(actor, item) {
    const halfW = item.w / 2;
    const halfH = item.h / 2;
    const closestX = Math.max(item.x - halfW, Math.min(actor.x, item.x + halfW));
    const closestY = Math.max(item.y - halfH, Math.min(actor.y, item.y + halfH));
    return Math.max(0, Math.hypot(actor.x - closestX, actor.y - closestY) - actor.radius);
  }

  function pickWanderTarget() {
    const anchors = getKiteSpawnAnchors();
    for (let attempt = 0; attempt < 18; attempt += 1) {
      const picked = anchors[Math.floor(Math.random() * anchors.length)];
      const target = pickSpawnNearKiteAnchor(picked, [], 0, 24);
      if (isSafePosition(target.x, target.y, 24)) return target;
    }

    for (let attempt = 0; attempt < 30; attempt += 1) {
      const x = 110 + Math.random() * (world.width - 220);
      const y = 110 + Math.random() * (world.height - 220);
      if (isSafePosition(x, y, 24)) return { x, y };
    }

    return { x: world.width / 2, y: world.height / 2 };
  }

  function getObstacleNormal(item) {
    if (Math.abs(item.angle - Math.PI / 2) < 0.1) return { x: 1, y: 0 };
    if (item.w > item.h) return { x: 0, y: 1 };
    return { x: 1, y: 0 };
  }

  function updateCamera(dt) {
    const target = getCameraTarget();
    const targetX = target.x - width / 2 / camera.zoom;
    const targetY = target.y - height / 2 / camera.zoom;
    const maxX = world.width - width / camera.zoom;
    const maxY = world.height - height / camera.zoom;
    const clampedX = Math.max(0, Math.min(targetX, Math.max(0, maxX)));
    const clampedY = Math.max(0, Math.min(targetY, Math.max(0, maxY)));
    const smoothing = 1 - Math.pow(0.001, dt);
    camera.x += (clampedX - camera.x) * smoothing;
    camera.y += (clampedY - camera.y) * smoothing;
  }

  function getCameraTarget() {
    if (selectedRole === PLAYER_ROLE.hunter) return hunter;
    if (player.escaped) {
      return teammates.find((survivor) => !survivor.escaped && survivor.state !== "downed") ||
        teammates.find((survivor) => !survivor.escaped) ||
        hunter;
    }
    return player;
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);
    ctx.save();
    ctx.scale(camera.zoom, camera.zoom);
    ctx.translate(-camera.x, -camera.y);

    drawGround();
    drawObjectives();
    drawSoulLamps();
    drawStitchPackDrops();
    drawTimeDevices();
    drawActorDecoys();
    drawRects(walls, "#141b16", "#293529");
    drawWindows();
    drawPallets();
    drawPackageAim();
    drawPackageProjectiles();
    drawHunter();
    drawTeammates();
    drawPlayer();
    drawVignette();

    ctx.restore();
    drawMatchResult();
    drawLanternAlert();
    drawRepairCalibration();
    drawMiniMap();
    updateReadouts();
  }

  function drawGround() {
    ctx.fillStyle = "#202b23";
    ctx.fillRect(0, 0, world.width, world.height);

    ctx.strokeStyle = "rgba(238, 243, 237, 0.035)";
    ctx.lineWidth = 1;
    for (let x = 0; x <= world.width; x += world.tile) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, world.height);
      ctx.stroke();
    }
    for (let y = 0; y <= world.height; y += world.tile) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(world.width, y);
      ctx.stroke();
    }

    ctx.fillStyle = "rgba(217, 183, 106, 0.06)";
    ctx.fillRect(54, 54, world.width - 108, world.height - 108);

  }

  function drawRects(items, fill, stroke) {
    ctx.fillStyle = fill;
    ctx.strokeStyle = stroke;
    ctx.lineWidth = 3;
    items.forEach((item) => {
      ctx.beginPath();
      ctx.roundRect(item.x, item.y, item.w, item.h, 8);
      ctx.fill();
      ctx.stroke();
    });
  }

  function drawObjectives() {
    chairs.forEach(drawChair);
    repairPoints.forEach(drawRepairPoint);
    exitGates.forEach(drawExitGate);
    drawHatch();
  }

  function drawDeviceImage(key, maxWidth, maxHeight, alpha = 1) {
    const image = DEVICE_IMAGES[key];
    if (!image || !image.complete || !image.naturalWidth || !image.naturalHeight) return false;
    const scale = Math.min(maxWidth / image.naturalWidth, maxHeight / image.naturalHeight);
    const drawWidth = image.naturalWidth * scale;
    const drawHeight = image.naturalHeight * scale;
    ctx.save();
    ctx.globalAlpha *= alpha;
    ctx.drawImage(image, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);
    ctx.restore();
    return true;
  }

  function drawChair(item) {
    const survivor = item.survivor;
    ctx.save();
    ctx.translate(item.x, item.y);
    const hasImage = drawDeviceImage("chair", 58, 88, survivor ? 1 : 0.88);
    if (hasImage) {
      if (survivor) {
        ctx.strokeStyle = "#eef3ed";
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(0, 0, 35, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * survivor.chairProgress);
        ctx.stroke();

        ctx.strokeStyle = "rgba(238, 243, 237, 0.55)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, 27, -Math.PI / 2, Math.PI / 2);
        ctx.stroke();
      }
      ctx.restore();
      return;
    }

    ctx.fillStyle = survivor ? "rgba(185, 95, 82, 0.28)" : "rgba(217, 183, 106, 0.14)";
    ctx.strokeStyle = survivor ? "#b95f52" : "#d9b76a";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(-18, -24, 36, 48, 6);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = survivor ? "#f2cbc5" : "#fff0bc";
    ctx.fillRect(-10, -18, 20, 7);
    ctx.fillRect(-10, 12, 20, 7);
    ctx.fillRect(-3, -10, 6, 24);

    if (survivor) {
      ctx.strokeStyle = "#eef3ed";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(0, 0, 31, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * survivor.chairProgress);
      ctx.stroke();

      ctx.strokeStyle = "rgba(238, 243, 237, 0.55)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, 24, -Math.PI / 2, Math.PI / 2);
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawRepairPoint(point) {
    const progress = point.completed ? 1 : point.progress;
    ctx.save();
    ctx.translate(point.x, point.y);
    const hasImage = drawDeviceImage("repair", 62, 74, point.completed ? 0.92 : 1);
    if (hasImage) {
      ctx.strokeStyle = point.completed ? "#b7d6c1" : "#d9b76a";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(0, 0, 39, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * progress);
      ctx.stroke();

      if (point.completed) {
        ctx.fillStyle = "#b7d6c1";
        ctx.font = "900 18px ui-sans-serif, system-ui";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("✓", 0, -1);
      }
      ctx.restore();
      return;
    }

    ctx.fillStyle = point.completed ? "rgba(183, 214, 193, 0.24)" : "rgba(217, 183, 106, 0.18)";
    ctx.strokeStyle = point.completed ? "#b7d6c1" : "#d9b76a";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, 0, 22, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.strokeStyle = "#eef3ed";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(0, 0, 28, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * progress);
    ctx.stroke();

    ctx.fillStyle = point.completed ? "#b7d6c1" : "#fff0bc";
    ctx.font = "800 13px ui-sans-serif, system-ui";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(point.completed ? "✓" : "R", 0, 1);
    ctx.restore();
  }

  function drawExitGate(gate) {
    const powered = areExitsPowered();
    const opened = powered && gate.opened;
    ctx.save();
    ctx.translate(gate.x, gate.y);
    const hasImage = drawDeviceImage("gate", 78, 72, opened ? 1 : powered ? 0.95 : 0.68);
    if (hasImage) {
      if (powered && !opened) {
        ctx.strokeStyle = "#eef3ed";
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(0, 0, 43, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * gate.progress);
        ctx.stroke();
      }

      if (!powered) {
        ctx.fillStyle = "#f2cbc5";
        ctx.font = "900 14px ui-sans-serif, system-ui";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("锁", 0, 1);
      }
      ctx.restore();
      return;
    }

    ctx.fillStyle = opened
      ? "rgba(183, 214, 193, 0.24)"
      : powered ? "rgba(217, 183, 106, 0.2)" : "rgba(185, 95, 82, 0.2)";
    ctx.strokeStyle = opened ? "#b7d6c1" : powered ? "#d9b76a" : "#b95f52";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.roundRect(-28, -24, 56, 48, 8);
    ctx.fill();
    ctx.stroke();

    if (powered && !opened) {
      ctx.strokeStyle = "#eef3ed";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(0, 0, 35, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * gate.progress);
      ctx.stroke();
    }

    ctx.fillStyle = opened ? "#e6f3e9" : powered ? "#fff0bc" : "#f2cbc5";
    ctx.font = "800 14px ui-sans-serif, system-ui";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(opened ? "门" : powered ? "开" : "锁", 0, 1);
    ctx.restore();
  }

  function drawHatch() {
    if (!isHatchSpawned()) return;
    ctx.save();
    ctx.translate(hatch.x, hatch.y);
    const hasImage = drawDeviceImage(isHatchOpen() ? "hatchOpen" : "hatchClosed", 78, 70);
    if (hasImage) {
      ctx.strokeStyle = isHatchOpen() ? "#b7d6c1" : "#d9b76a";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, 0, 43, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
      return;
    }

    ctx.fillStyle = isHatchOpen() ? "rgba(183, 214, 193, 0.28)" : "rgba(217, 183, 106, 0.16)";
    ctx.strokeStyle = isHatchOpen() ? "#b7d6c1" : "#d9b76a";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.roundRect(-30, -20, 60, 40, 6);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = isHatchOpen() ? "#101611" : "#263126";
    ctx.beginPath();
    ctx.roundRect(-20, -12, 40, 24, 4);
    ctx.fill();

    ctx.fillStyle = isHatchOpen() ? "#e6f3e9" : "#fff0bc";
    ctx.font = "800 13px ui-sans-serif, system-ui";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(isHatchOpen() ? "开" : "H", 0, 1);
    ctx.restore();
  }

  function drawSoulLamps() {
    if (soulLamps.length === 0) return;
    const now = performance.now();
    soulLamps.forEach((lamp) => {
      const active = now < lamp.detectingUntil;
      ctx.save();
      ctx.translate(lamp.x, lamp.y);

      ctx.fillStyle = active ? "rgba(93, 178, 255, 0.16)" : "rgba(93, 178, 255, 0.07)";
      ctx.strokeStyle = active ? "rgba(93, 178, 255, 0.68)" : "rgba(93, 178, 255, 0.24)";
      ctx.lineWidth = active ? 3 : 2;
      ctx.beginPath();
      ctx.arc(0, 0, SOUL_LAMP_RANGE, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = active ? "#5db2ff" : "#2f7fc1";
      ctx.strokeStyle = active ? "#d7efff" : "#9ed2ff";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.roundRect(-16, -14, 32, 28, 5);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = active ? "rgba(215, 239, 255, 0.88)" : "rgba(215, 239, 255, 0.58)";
      ctx.fillRect(-9, -7, 18, 5);
      ctx.fillRect(-9, 4, 18, 5);

      ctx.strokeStyle = active ? "rgba(215, 239, 255, 0.95)" : "rgba(158, 210, 255, 0.72)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-8, -15);
      ctx.quadraticCurveTo(0, -24, 8, -15);
      ctx.stroke();
      ctx.restore();
    });
  }

  function drawPackageProjectiles() {
    packageProjectiles.forEach((item) => {
      ctx.save();
      ctx.translate(item.x, item.y);
      ctx.rotate(item.angle);
      ctx.fillStyle = "#c99554";
      ctx.strokeStyle = "#101611";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.roundRect(-13, -9, 26, 18, 4);
      ctx.fill();
      ctx.stroke();

      ctx.strokeStyle = "#fff0bc";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-9, 0);
      ctx.lineTo(9, 0);
      ctx.moveTo(0, -7);
      ctx.lineTo(0, 7);
      ctx.stroke();
      ctx.restore();
    });
  }

  function drawStitchPackDrops() {
    stitchPackDrops.forEach((item) => {
      ctx.save();
      ctx.translate(item.x, item.y);
      ctx.fillStyle = "rgba(183, 214, 193, 0.18)";
      ctx.beginPath();
      ctx.arc(0, 0, 34, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#b7d6c1";
      ctx.strokeStyle = "#101611";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.roundRect(-14, -10, 28, 20, 5);
      ctx.fill();
      ctx.stroke();

      ctx.strokeStyle = "#5aa475";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-8, -2);
      ctx.lineTo(8, -2);
      ctx.moveTo(-5, 4);
      ctx.lineTo(5, 4);
      ctx.stroke();
      ctx.restore();
    });
  }

  function drawTimeDevices() {
    getSurvivors().forEach((survivor) => {
      const device = survivor.timeDevice;
      if (!device) return;
      const timeLeft = Math.max(0, (device.until - performance.now()) / TIME_REWIND_WINDOW);
      ctx.save();
      ctx.translate(device.x, device.y);
      ctx.fillStyle = "rgba(217, 183, 106, 0.16)";
      ctx.beginPath();
      ctx.arc(0, 0, 35, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#263128";
      ctx.strokeStyle = "#d9b76a";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, 0, 17, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.strokeStyle = "#fff0bc";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(0, -10);
      ctx.moveTo(0, 0);
      ctx.lineTo(8, 4);
      ctx.stroke();

      ctx.strokeStyle = "rgba(238, 243, 237, 0.72)";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, 0, 25, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * timeLeft);
      ctx.stroke();
      ctx.restore();
    });
  }

  function drawActorDecoys() {
    const now = performance.now();
    actorDecoys.forEach((decoy) => {
      const fade = Math.max(0, Math.min(1, (decoy.until - now) / ACTOR_DECOY_DURATION));
      ctx.save();
      ctx.translate(decoy.x, decoy.y);
      ctx.rotate(decoy.angle);
      ctx.globalAlpha = selectedRole === PLAYER_ROLE.hunter ? 1 : 0.34 + fade * 0.34;

      ctx.fillStyle = "rgba(0, 0, 0, 0.22)";
      ctx.beginPath();
      ctx.ellipse(2, 8, 24, 16, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = decoy.fill;
      ctx.strokeStyle = "#101611";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(27, 0);
      ctx.lineTo(-13, -19);
      ctx.lineTo(-7, 0);
      ctx.lineTo(-13, 19);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = decoy.core;
      ctx.beginPath();
      ctx.arc(-5, 0, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      if (hunter.target === decoy) {
        ctx.save();
        ctx.translate(decoy.x, decoy.y);
        ctx.strokeStyle = "rgba(185, 95, 82, 0.75)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, 34, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }

      if (hunter.target === decoy || decoy.state !== "healthy" || (decoy.damageProgress || 0) > 0) {
        drawSurvivorLabel(decoy);
      }
    });
  }

  function drawPackageAim() {
    if (!packageAim) return;
    const actor = packageAim.actor;
    const dx = packageAim.targetX - actor.x;
    const dy = packageAim.targetY - actor.y;
    const distance = Math.hypot(dx, dy);
    const angle = distance > 8 ? Math.atan2(dy, dx) : actor.angle;
    const range = Math.min(PACKAGE_RANGE, Math.max(80, distance || PACKAGE_RANGE));
    const targetX = actor.x + Math.cos(angle) * range;
    const targetY = actor.y + Math.sin(angle) * range;

    ctx.save();
    ctx.strokeStyle = "rgba(255, 240, 188, 0.82)";
    ctx.lineWidth = 3;
    ctx.setLineDash([12, 8]);
    ctx.beginPath();
    ctx.moveTo(actor.x, actor.y);
    ctx.lineTo(targetX, targetY);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = "rgba(201, 149, 84, 0.22)";
    ctx.strokeStyle = "#fff0bc";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(targetX, targetY, 18, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  function drawPallets() {
    pallets.forEach((item) => {
      ctx.save();
      ctx.translate(item.x, item.y);
      ctx.rotate(item.angle);

      if (item.label === "broken") {
        ctx.fillStyle = "rgba(142, 89, 57, 0.5)";
        ctx.fillRect(-item.w / 2 + 8, -4, item.w * 0.28, 7);
        ctx.fillRect(item.w / 2 - item.w * 0.36, 3, item.w * 0.28, 7);
        ctx.restore();
        return;
      }

      if (item.label === "standing") {
        ctx.translate(-item.w / 2 - 8, 0);
        ctx.rotate(Math.PI / 2);
        drawWoodBoard(46, 10);
        ctx.restore();
        return;
      }

      drawWoodBoard(item.w, item.h);
      ctx.fillStyle = "#d9b76a";
      ctx.fillRect(-item.w / 2 - 4, -item.h / 2 - 2, 4, item.h + 4);
      ctx.fillRect(item.w / 2, -item.h / 2 - 2, 4, item.h + 4);
      ctx.restore();
    });
  }

  function drawWoodBoard(boardWidth, boardHeight) {
      ctx.fillStyle = "#8b5a36";
      ctx.strokeStyle = "#d9b76a";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
    ctx.roundRect(-boardWidth / 2, -boardHeight / 2, boardWidth, boardHeight, 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = "rgba(255, 236, 186, 0.35)";
    ctx.fillRect(-boardWidth / 2 + 8, -1, Math.max(0, boardWidth - 16), 2);
  }

  function drawWindowOpening(item) {
    ctx.fillStyle = "#202b23";
    ctx.beginPath();
    ctx.roundRect(-item.w / 2, -item.h / 2, item.w, item.h, 4);
    ctx.fill();

    ctx.strokeStyle = "#b7d6c1";
    ctx.lineWidth = 4;
    if (item.w > item.h) {
      ctx.beginPath();
      ctx.moveTo(-item.w / 2 + 12, -item.h / 2 + 8);
      ctx.lineTo(item.w / 2 - 12, -item.h / 2 + 8);
      ctx.moveTo(-item.w / 2 + 12, item.h / 2 - 8);
      ctx.lineTo(item.w / 2 - 12, item.h / 2 - 8);
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.moveTo(-item.w / 2 + 8, -item.h / 2 + 12);
      ctx.lineTo(-item.w / 2 + 8, item.h / 2 - 12);
      ctx.moveTo(item.w / 2 - 8, -item.h / 2 + 12);
      ctx.lineTo(item.w / 2 - 8, item.h / 2 - 12);
      ctx.stroke();
    }
  }

  function drawWindows() {
    windows.forEach((item) => {
      ctx.save();
      ctx.translate(item.x, item.y);
      drawWindowOpening(item);
      ctx.restore();
    });
  }

  function drawPlayer() {
    if (player.escaped || player.state === "eliminated") return;
    const now = performance.now();
    if (shouldHideSurvivorFromHunterView(player, now)) return;
    ctx.save();
    ctx.translate(player.x, player.y);
    ctx.rotate(player.angle);
    if (isSurvivorInvisible(player, now)) ctx.globalAlpha = 0.48;

    ctx.fillStyle = "rgba(0, 0, 0, 0.28)";
    ctx.beginPath();
    ctx.ellipse(2, 8, 26, 17, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = player.state === "downed" ? "#9ba99d" : player.fill;
    ctx.strokeStyle = "#101611";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(28, 0);
    ctx.lineTo(-14, -20);
    ctx.lineTo(-7, 0);
    ctx.lineTo(-14, 20);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = player.core;
    ctx.beginPath();
    ctx.arc(-5, 0, 7, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();

    if (player.action && ["repairing", "openingGate", "escaping", "rescuing", "dismantlingLamp"].includes(player.action.kind)) {
      drawSurvivorLabel(player);
    } else if (player.state !== "healthy" || (player.damageProgress || 0) > 0 || getBoneBleedStacks(player) > 0 || isSurvivorInvisible(player, now)) {
      drawSurvivorLabel(player);
    }

    if (hunter.target === player) {
      ctx.save();
      ctx.translate(player.x, player.y);
      ctx.strokeStyle = "rgba(185, 95, 82, 0.75)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, 34, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    drawPlayerInteractionHint();
  }

  function drawTeammates() {
    teammates.forEach((survivor) => {
      if (!survivor.escaped && survivor.state !== "eliminated" && !shouldHideSurvivorFromHunterView(survivor)) drawSurvivor(survivor, false);
    });
  }

  function drawSurvivor(survivor, showName) {
    const now = performance.now();
    if (shouldHideSurvivorFromHunterView(survivor, now)) return;
    ctx.save();
    ctx.translate(survivor.x, survivor.y);
    ctx.rotate(survivor.angle);
    if (isSurvivorInvisible(survivor, now)) ctx.globalAlpha = 0.48;

    ctx.fillStyle = "rgba(0, 0, 0, 0.26)";
    ctx.beginPath();
    ctx.ellipse(2, 8, 24, 16, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = survivor.state === "downed" ? "#879188" : survivor.fill;
    ctx.strokeStyle = "#101611";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(27, 0);
    ctx.lineTo(-13, -19);
    ctx.lineTo(-7, 0);
    ctx.lineTo(-13, 19);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = survivor.core;
    ctx.beginPath();
    ctx.arc(-5, 0, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    if (hunter.target === survivor) {
      ctx.save();
      ctx.translate(survivor.x, survivor.y);
      ctx.strokeStyle = "rgba(185, 95, 82, 0.75)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, 34, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    if (showName || survivor.state !== "healthy" || (survivor.damageProgress || 0) > 0 || getBoneBleedStacks(survivor) > 0 || survivor.stitchPack || isSurvivorInvisible(survivor, now) || survivor.action && survivor.action.kind === "dismantlingLamp" || now < survivor.boostUntil) {
      drawSurvivorLabel(survivor);
    }
  }

  function drawSurvivorLabel(survivor) {
    let label = survivor.name;
    if (survivor.action && survivor.action.kind === "healing") {
      label = "治疗中";
    } else if (survivor.action && survivor.action.kind === "beingHealed") {
      label = `治疗 ${Math.round((survivor.healProgress || 0) * 100)}%`;
    } else if (survivor.action && survivor.action.kind === "repairing") {
      label = `修理 ${Math.round(survivor.action.point.progress * 100)}%`;
    } else if (survivor.action && survivor.action.kind === "openingGate") {
      label = `开门 ${Math.round(survivor.action.gate.progress * 100)}%`;
    } else if (survivor.action && survivor.action.kind === "escaping") {
      const progress = getActionProgress(survivor.action, performance.now());
      label = `逃出 ${Math.round(progress * 100)}%`;
    } else if (survivor.action && survivor.action.kind === "rescuing") {
      const progress = getActionProgress(survivor.action, performance.now());
      label = `救援 ${Math.round(progress * 100)}%`;
    } else if (survivor.action && survivor.action.kind === "dismantlingLamp") {
      const progress = getActionProgress(survivor.action, performance.now());
      label = `拆灯 ${Math.round(progress * 100)}%`;
    } else if (survivor.stitchPack) label = `${survivor.name} 针线 ${getStitchSecondsLeft(survivor)}秒`;
    else if (isSurvivorInvisible(survivor)) label = `${survivor.name} 隐身`;
    else if ((survivor.damageProgress || 0) > 0) label = `${survivor.name} 裂伤${Math.round((survivor.damageProgress || 0) * 100)}%`;
    else if (getBoneBleedStacks(survivor) > 0) label = `${survivor.name} 流血x${getBoneBleedStacks(survivor)}`;
    else if (performance.now() < survivor.boostUntil) label = `${survivor.name} 加速`;
    else if (survivor.state === "injured") label = `${survivor.name} 受伤`;
    else if (survivor.state === "downed") label = `${survivor.name} 放血 ${getBleedOutSecondsLeft(survivor)}秒`;
    else if (survivor.state === "carried") label = `挣扎 ${Math.round((survivor.carryProgress || 0) * 100)}%`;
    else if (survivor.state === "seated") label = `上椅 ${Math.round(survivor.chairProgress * 100)}%`;

    ctx.save();
    ctx.translate(survivor.x, survivor.y - 38);
    ctx.fillStyle = survivor.action && ["beingHealed", "repairing", "openingGate", "escaping", "rescuing", "dismantlingLamp"].includes(survivor.action.kind) || survivor.stitchPack || isSurvivorInvisible(survivor)
      ? "#b7d6c1"
      : (survivor.damageProgress || 0) > 0 ? "#d9b76a" : getBoneBleedStacks(survivor) > 0 ? "#c78068" : survivor.state === "healthy" ? "rgba(16, 22, 18, 0.86)" : survivor.state === "injured" ? "#d9b76a" : "#b95f52";
    ctx.beginPath();
    ctx.roundRect(-40, -9, 80, 18, 6);
    ctx.fill();
    ctx.fillStyle = survivor.state === "healthy" && (survivor.damageProgress || 0) <= 0 && getBoneBleedStacks(survivor) <= 0 && !survivor.stitchPack && !isSurvivorInvisible(survivor) && (!survivor.action || !["beingHealed", "repairing", "openingGate", "escaping", "rescuing", "dismantlingLamp"].includes(survivor.action.kind)) ? "#eef3ed" : "#101611";
    ctx.font = "700 11px ui-sans-serif, system-ui";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(label, 0, 1);
    ctx.restore();
  }

  function drawPlayerInteractionHint() {
    if (selectedRole !== PLAYER_ROLE.survivor) return;
    if (player.action || player.escaped) return;

    const nearHatch = findNearestHatch(player, 96);
    if (nearHatch && (player.state === "healthy" || player.state === "injured" || player.state === "downed")) {
      drawFloatingPrompt(player.x, player.y + 42, "E 跳地窖");
      return;
    }

    if (player.state !== "healthy" && player.state !== "injured") return;

    const seatedTarget = findNearestSeatedTeammate(player, 96);
    const healTarget = findNearestHealableTeammate(player, 92);
    const canDropStitchPack = isApprentice(player) && canPlaceStitchPack(player);
    const soulLamp = findNearestSoulLamp(player, SOUL_LAMP_DISMANTLE_RANGE);
    const nearExit = areExitsPowered() ? findNearestExitGate(player, 96) : null;
    const repairPoint = findNearestRepairPoint(player, 110);
    const standingPallet = findNearestPallet(player, "standing", SURVIVOR_PALLET_PROMPT_RANGE);
    const droppedPallet = findNearestPallet(player, "dropped", SURVIVOR_PALLET_PROMPT_RANGE);
    const nearWindow = findNearestWindow(player, SURVIVOR_WINDOW_PROMPT_RANGE);
    let label = "";
    if (soulLamp) label = "E 拆魂灯";
    else if (seatedTarget) label = `E 救${seatedTarget.name}`;
    else if (canDropStitchPack) label = "Q 放针线包";
    else if (healTarget) label = `E 治疗${healTarget.name}`;
    else if (nearExit) label = nearExit.opened ? "E 逃出" : "E 开门";
    else if (repairPoint) label = "E 修理";
    else if (standingPallet) label = "Space 下板";
    else if (droppedPallet) label = "Space 翻板";
    else if (nearWindow) label = "Space 翻窗";
    if (!label) return;

    drawFloatingPrompt(player.x, player.y + 42, label);
  }

  function drawFloatingPrompt(x, y, label) {
    ctx.save();
    ctx.translate(x, y);
    ctx.fillStyle = "rgba(16, 22, 18, 0.86)";
    ctx.strokeStyle = "rgba(238, 243, 237, 0.18)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(-48, -15, 96, 30, 8);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#eef3ed";
    ctx.font = "700 12px ui-sans-serif, system-ui";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(label, 0, 1);
    ctx.restore();
  }

  function getActionProgress(action, now) {
    return Math.max(0, Math.min(1, (now - action.start) / Math.max(action.until - action.start, 1)));
  }

  function drawHunter() {
    const now = performance.now();
    const character = getHunterCharacter();

    ctx.save();
    ctx.translate(hunter.x, hunter.y);

    drawHunterAttackCone(now);

    if (hunter.action && hunter.action.kind === "sawDash") {
      ctx.strokeStyle = hunter.action.short ? "rgba(238, 243, 237, 0.42)" : "rgba(217, 208, 189, 0.5)";
      ctx.lineWidth = hunter.action.short ? 12 : 18;
      ctx.beginPath();
      ctx.moveTo(-Math.cos(hunter.angle) * 42, -Math.sin(hunter.angle) * 42);
      ctx.lineTo(-Math.cos(hunter.angle) * 110, -Math.sin(hunter.angle) * 110);
      ctx.stroke();
    }

    ctx.rotate(hunter.angle);
    ctx.fillStyle = "rgba(0, 0, 0, 0.32)";
    ctx.beginPath();
    ctx.ellipse(2, 10, 30, 18, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = character.fill || "#b95f52";
    ctx.strokeStyle = "#101611";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(31, 0);
    ctx.lineTo(-16, -23);
    ctx.lineTo(-7, 0);
    ctx.lineTo(-16, 23);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = character.core || "#ffd5cd";
    ctx.beginPath();
    ctx.arc(-4, 0, 7, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();

    if (hunter.status === "stunned" || hunter.status === "wipe" || hunter.status === "miss" || hunter.status === "breaking" || hunter.status === "pickingUp" || hunter.status === "sawDash" || hunter.status === "shortSaw" || hunter.status === "sawHit") {
      ctx.save();
      ctx.translate(hunter.x, hunter.y - 42);
      ctx.fillStyle = hunter.status === "stunned" ? "#d9b76a" : "#b95f52";
      ctx.beginPath();
      ctx.roundRect(-30, -9, 60, 18, 6);
      ctx.fill();
      ctx.fillStyle = "#101611";
      ctx.font = "700 12px ui-sans-serif, system-ui";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(getHunterStatusLabel(hunter.status), 0, 1);
      ctx.restore();
    }

    drawHunterInteractionHint(now);
  }

  function drawHunterInteractionHint(now) {
    if (selectedRole !== PLAYER_ROLE.hunter || !matchStarted) return;
    if (hunter.action || now < hunter.stunnedUntil || now < hunter.wipeUntil) return;

    const emptyChair = hunter.carrying ? findNearestEmptyChair(hunter, 116) : null;
    const downedSurvivor = !hunter.carrying ? findNearestDownedSurvivor(hunter, 112) : null;
    const droppedPallet = findNearestPallet(hunter, "dropped", HUNTER_PALLET_PROMPT_RANGE);
    const nearWindow = findNearestWindow(hunter, HUNTER_WINDOW_PROMPT_RANGE);
    let label = "";
    if (emptyChair) label = "Space 挂椅";
    else if (downedSurvivor) label = "Space 牵起";
    else if (droppedPallet) label = "Space 踩板";
    else if (nearWindow) label = "Space 翻窗";
    else if (canRecallSoulLamp(now)) label = "Q 收回灯";
    else if (canPlaceSoulLamp(now)) label = "Q 寄魂灯";
    else if (canShadowTeleport(now)) label = "F 灯影";
    else if (canHunterAttack(now)) label = "J 攻击";
    if (!label) return;

    ctx.save();
    ctx.translate(hunter.x, hunter.y + 46);
    ctx.fillStyle = "rgba(16, 22, 18, 0.86)";
    ctx.strokeStyle = "rgba(238, 243, 237, 0.18)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(-48, -15, 96, 30, 8);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#eef3ed";
    ctx.font = "700 12px ui-sans-serif, system-ui";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(label, 0, 1);
    ctx.restore();
  }

  function drawLanternAlert() {
    if (!lanternAlert || performance.now() >= lanternAlert.until) return;
    ctx.save();
    ctx.translate(width / 2, 72);
    ctx.fillStyle = lanternAlert.kind === "detected" ? "rgba(93, 178, 255, 0.92)" : "rgba(16, 22, 18, 0.9)";
    ctx.strokeStyle = "rgba(215, 239, 255, 0.75)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(-86, -18, 172, 36, 8);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = lanternAlert.kind === "detected" ? "#101611" : "#d7efff";
    ctx.font = "800 14px ui-sans-serif, system-ui";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(lanternAlert.text, 0, 1);
    ctx.restore();
  }

  function drawRepairCalibration() {
    if (selectedRole !== PLAYER_ROLE.survivor || !player.action || player.action.kind !== "repairing") return;
    const action = player.action;
    const now = performance.now();
    const calibration = action.calibration;
    const feedback = action.calibrationFeedback && now < action.calibrationFeedback.until
      ? action.calibrationFeedback
      : null;
    if (!calibration && !feedback) return;

    const panelWidth = Math.min(420, Math.max(280, width - 40));
    const panelHeight = calibration ? 96 : 54;
    const x = width / 2 - panelWidth / 2;
    const y = Math.max(112, height - panelHeight - 112);

    ctx.save();
    ctx.fillStyle = "rgba(16, 22, 18, 0.9)";
    ctx.strokeStyle = "rgba(238, 243, 237, 0.2)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(x, y, panelWidth, panelHeight, 8);
    ctx.fill();
    ctx.stroke();

    const title = feedback ? feedback.label : "修机校准";
    ctx.fillStyle = feedback ? feedback.color : "#eef3ed";
    ctx.font = "900 16px ui-sans-serif, system-ui";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(title, width / 2, y + 22);

    if (calibration) {
      const barX = x + 24;
      const barY = y + 50;
      const barW = panelWidth - 48;
      const barH = 18;
      const needle = getRepairCalibrationNeedle(calibration, now);

      ctx.fillStyle = "#263128";
      ctx.beginPath();
      ctx.roundRect(barX, barY, barW, barH, 6);
      ctx.fill();

      ctx.fillStyle = "rgba(183, 214, 193, 0.72)";
      ctx.beginPath();
      ctx.roundRect(barX + barW * calibration.successStart, barY, barW * (calibration.successEnd - calibration.successStart), barH, 5);
      ctx.fill();

      ctx.fillStyle = "#d9b76a";
      ctx.beginPath();
      ctx.roundRect(barX + barW * calibration.perfectStart, barY - 3, barW * (calibration.perfectEnd - calibration.perfectStart), barH + 6, 5);
      ctx.fill();

      ctx.strokeStyle = "#eef3ed";
      ctx.lineWidth = 3;
      const needleX = barX + barW * needle;
      ctx.beginPath();
      ctx.moveTo(needleX, barY - 8);
      ctx.lineTo(needleX, barY + barH + 8);
      ctx.stroke();

      ctx.fillStyle = "#9ba99d";
      ctx.font = "700 12px ui-sans-serif, system-ui";
      ctx.fillText("按 E / 使用", width / 2, y + 82);
    }

    ctx.restore();
  }

  function drawHunterAttackCone(now) {
    const halfArc = hunter.attackArc / 2;
    const pulseFill = now < chasePulseUntil ? 0.22 : 0.1;
    ctx.save();
    ctx.rotate(hunter.angle);
    ctx.fillStyle = `rgba(185, 95, 82, ${pulseFill})`;
    ctx.strokeStyle = now < chasePulseUntil ? "rgba(185, 95, 82, 0.72)" : "rgba(185, 95, 82, 0.32)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, hunter.attackRange, -halfArc, halfArc);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  function drawVignette() {
    const focus = getCameraTarget();
    const gradient = ctx.createRadialGradient(
      focus.x,
      focus.y,
      120,
      focus.x,
      focus.y,
      560
    );
    gradient.addColorStop(0, "rgba(0, 0, 0, 0)");
    gradient.addColorStop(1, "rgba(0, 0, 0, 0.28)");
    ctx.fillStyle = gradient;
    ctx.fillRect(camera.x, camera.y, width / camera.zoom, height / camera.zoom);
  }

  function drawMatchResult() {
    if (!matchResult) return;

    ctx.save();
    ctx.fillStyle = "rgba(16, 22, 18, 0.62)";
    ctx.fillRect(0, 0, width, height);
    ctx.translate(width / 2, height / 2);

    ctx.fillStyle = "rgba(23, 31, 25, 0.94)";
    ctx.strokeStyle = "rgba(238, 243, 237, 0.18)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(-190, -74, 380, 148, 8);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = matchResult.winner === "hunter" ? "#f2cbc5" : matchResult.winner === "draw" ? "#d9b76a" : "#b7d6c1";
    ctx.font = "900 30px ui-sans-serif, system-ui";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(matchResult.title, 0, -26);

    ctx.fillStyle = "#eef3ed";
    ctx.font = "700 14px ui-sans-serif, system-ui";
    ctx.fillText(matchResult.detail, 0, 16);

    ctx.fillStyle = "#9ba99d";
    ctx.font = "700 12px ui-sans-serif, system-ui";
    ctx.fillText("按 R 重新开始", 0, 46);
    ctx.restore();
  }

  function drawMiniMap() {
    const box = miniMap.getBoundingClientRect();
    const miniW = box.width;
    const miniH = box.height;
    miniCtx.clearRect(0, 0, miniW, miniH);
    miniCtx.fillStyle = "#1f2a22";
    miniCtx.fillRect(0, 0, miniW, miniH);

    const scale = Math.min(miniW / world.width, miniH / world.height);
    const offsetX = (miniW - world.width * scale) / 2;
    const offsetY = (miniH - world.height * scale) / 2;

    miniCtx.save();
    miniCtx.translate(offsetX, offsetY);
    miniCtx.scale(scale, scale);
    miniCtx.fillStyle = "#101611";
    walls.forEach((wall) => miniCtx.fillRect(wall.x, wall.y, wall.w, wall.h));
    miniCtx.fillStyle = "#b7d6c1";
    windows.forEach((item) => {
      if (item.w > item.h) {
        miniCtx.fillRect(item.x - 24, item.y - 3, 48, 6);
      } else {
        miniCtx.fillRect(item.x - 3, item.y - 24, 6, 48);
      }
    });
    miniCtx.fillStyle = "#8e5939";
    pallets.forEach((item) => {
      if (item.label === "broken") return;
      miniCtx.save();
      miniCtx.translate(item.x, item.y);
      miniCtx.rotate(item.angle);
      if (item.label === "standing") {
        miniCtx.translate(-25, 0);
        miniCtx.rotate(Math.PI / 2);
        miniCtx.fillRect(-10, -2, 20, 4);
      } else {
        miniCtx.fillRect(-22, -3, 44, 6);
      }
      miniCtx.restore();
    });
    chairs.forEach((item) => {
      miniCtx.fillStyle = item.survivor ? "#b95f52" : "#d9b76a";
      miniCtx.fillRect(item.x - 10, item.y - 10, 20, 20);
    });
    repairPoints.forEach((point) => {
      miniCtx.fillStyle = point.completed ? "#b7d6c1" : "#d9b76a";
      miniCtx.fillRect(point.x - 12, point.y - 12, 24, 24);
    });
    exitGates.forEach((gate) => {
      miniCtx.fillStyle = gate.opened ? "#b7d6c1" : areExitsPowered() ? "#d9b76a" : "#b95f52";
      miniCtx.fillRect(gate.x - 14, gate.y - 14, 28, 28);
    });
    if (isHatchSpawned()) {
      miniCtx.fillStyle = isHatchOpen() ? "#b7d6c1" : "#d9b76a";
      miniCtx.fillRect(hatch.x - 16, hatch.y - 10, 32, 20);
    }
    soulLamps.forEach((lamp) => {
      miniCtx.fillStyle = performance.now() < lamp.detectingUntil ? "#d7efff" : "#5db2ff";
      miniCtx.fillRect(lamp.x - 13, lamp.y - 11, 26, 22);
    });
    miniCtx.fillStyle = getHunterCharacter().fill || "#b95f52";
    miniCtx.beginPath();
    miniCtx.arc(hunter.x, hunter.y, 38, 0, Math.PI * 2);
    miniCtx.fill();
    teammates.forEach((survivor) => {
      if (survivor.escaped || survivor.state === "eliminated") return;
      if (shouldHideSurvivorFromHunterView(survivor)) return;
      miniCtx.fillStyle = survivor.core;
      miniCtx.beginPath();
      miniCtx.arc(survivor.x, survivor.y, 30, 0, Math.PI * 2);
      miniCtx.fill();
    });
    if (!player.escaped && player.state !== "eliminated" && !shouldHideSurvivorFromHunterView(player)) {
      miniCtx.fillStyle = "#eef3ed";
      miniCtx.beginPath();
      miniCtx.arc(player.x, player.y, 34, 0, Math.PI * 2);
      miniCtx.fill();
    }
    miniCtx.restore();
  }

  function updateReadouts() {
    speedReadout.textContent = getSurvivorReadout();
    staminaReadout.textContent = areExitsPowered()
      ? getExitReadout()
      : `${getCompletedRepairCount()}/${REPAIR_REQUIRED}`;
    collisionReadout.textContent = getHunterReadout();

    const repairsReadout = document.getElementById("repairsReadout");
    const exitsReadout = document.getElementById("exitsReadout");
    const escapeReadout = document.getElementById("escapeReadout");
    const controlsReadout = document.getElementById("controlsReadout");
    if (repairsReadout) repairsReadout.textContent = `${getCompletedRepairCount()}/${REPAIR_REQUIRED}`;
    if (exitsReadout) exitsReadout.textContent = getExitReadout();
    if (escapeReadout) {
      const escapedCount = getSurvivors().filter((survivor) => survivor.escaped).length;
      const eliminatedCount = getSurvivors().filter((survivor) => survivor.state === "eliminated").length;
      escapeReadout.textContent = `${escapedCount}/${eliminatedCount}`;
    }
    if (controlsReadout) controlsReadout.textContent = selectedRole === PLAYER_ROLE.hunter
      ? isLanternKeeper() ? "J / Q / F / Space" : isSawbone() ? "J / Q / Space" : "J / Space"
      : isActor(player) ? "E / Q / F / Space" : hasSurvivorSkill(player) ? "E / Q / Space" : "E / Space";
    updateTouchActions();
  }

  function updateTouchActions() {
    if (!touchUseButton || !touchInteractButton || !touchAttackButton || !touchSkillButton || !touchShadowButton) return;
    const isHunter = selectedRole === PLAYER_ROLE.hunter;
    const isSurvivor = selectedRole === PLAYER_ROLE.survivor;
    touchUseButton.classList.toggle("is-hidden", !isSurvivor);
    touchAttackButton.classList.toggle("is-hidden", !isHunter);
    touchSkillButton.classList.toggle("is-hidden", !(isHunter && hunterHasSkill() || isSurvivor && hasSurvivorSkill(player)));
    touchShadowButton.classList.toggle("is-hidden", !(isHunter && isLanternKeeper() && hunter.presenceTier >= 1 || isSurvivor && isActor(player)));
    touchInteractButton.classList.toggle("is-hidden", !selectedRole);

    if (isSurvivor) {
      touchUseButton.textContent = getSurvivorUseButtonLabel();
      touchSkillButton.textContent = getSurvivorSkillButtonLabel();
      touchShadowButton.textContent = isActor(player) ? "切换" : "灯影";
      touchInteractButton.textContent = "板窗";
    } else if (isHunter) {
      const sawLockout = isSawbone() ? getSawAttackLockoutLeft(performance.now()) : 0;
      touchAttackButton.textContent = sawLockout > 0 ? `锁刀${Math.ceil(sawLockout / 1000)}s` : "攻击";
      touchSkillButton.textContent = getHunterSkillButtonLabel();
      touchShadowButton.textContent = getHunterShadowButtonLabel();
      touchInteractButton.textContent = "交互";
    } else {
      touchUseButton.textContent = "使用";
      touchAttackButton.textContent = "攻击";
      touchSkillButton.textContent = "技能";
      touchShadowButton.textContent = "灯影";
      touchInteractButton.textContent = "交互";
    }
  }

  function getHunterSkillButtonLabel() {
    if (isSawbone()) {
      const now = performance.now();
      if (hunter.action && hunter.action.kind === "sawDash") {
        if (Number.isFinite(hunter.action.durability)) return `耐久${Math.max(0, Math.ceil(hunter.action.durability))}%`;
        return hunter.action.short ? "短锯中" : "拉锯中";
      }
      if (canUseShortSaw(now)) return "短锯";
      const cooldownLeft = getSawDashCooldownLeft(now);
      if (canStartSawDash(now)) return "拉锯";
      if (cooldownLeft > 0) return `${Math.ceil(cooldownLeft / 1000)}s`;
      return "拉锯";
    }
    if (!isLanternKeeper()) return "技能";
    const now = performance.now();
    if (canRecallSoulLamp(now)) return "收回灯";
    const cooldownLeft = getSoulLampCooldownLeft(now);
    if (canPlaceSoulLamp(now)) return "寄魂灯";
    if (soulLamps.length >= getSoulLampLimit()) return "满灯";
    if (cooldownLeft > 0) return `${Math.ceil(cooldownLeft / 1000)}s`;
    return "寄魂灯";
  }

  function getHunterShadowButtonLabel() {
    if (!isLanternKeeper()) return "灯影";
    if (hunter.presenceTier < 1) return "未解锁";
    if (canShadowTeleport(performance.now())) return "灯影";
    if (soulLamps.length === 0) return "无灯";
    const cooldownLeft = getShadowTeleportCooldownLeft(performance.now());
    if (cooldownLeft > 0) return `${Math.ceil(cooldownLeft / 1000)}s`;
    return "灯影";
  }

  function getSurvivorSkillButtonLabel() {
    if (isActor(player)) {
      const cooldownLeft = getMagicShowCooldownLeft(player, performance.now());
      if (cooldownLeft > 0) return `${Math.ceil(cooldownLeft / 1000)}s`;
      return player.magicShowMode === "hunter" ? "送监管" : "转椅";
    }
    if (isClockmaker(player)) {
      const now = performance.now();
      if (canActivateTimeRewind(player, now)) return "回溯";
      const cooldownLeft = getTimeRewindCooldownLeft(player, now);
      if (cooldownLeft > 0) return `${Math.ceil(cooldownLeft / 1000)}s`;
      return "时光装置";
    }
    if (isApprentice(player)) return "放针线包";
    if (!isMessenger(player)) return "技能";
    const cooldownLeft = getPackageCooldownLeft(player, performance.now());
    if (cooldownLeft > 0) return `${Math.ceil(cooldownLeft / 1000)}s`;
    return "邮包";
  }

  function getSurvivorUseButtonLabel() {
    if (player.action && player.action.kind === "dismantlingLamp") return "停止";
    if (player.action && player.action.kind === "healing") return "停止";
    if (player.action && player.action.kind === "repairing" && player.action.calibration) return "校准";
    if (player.action && player.action.kind === "repairing") return "停止";
    if (player.action && player.action.kind === "openingGate") return "停止";
    if (player.action && player.action.kind === "rescuing") return "停止";
    if (findNearestHatch(player, 96) && (player.state === "healthy" || player.state === "injured" || player.state === "downed")) return "地窖";
    if (findNearestSoulLamp(player, SOUL_LAMP_DISMANTLE_RANGE)) return "拆灯";
    if (findNearestSeatedTeammate(player, 96)) return "救人";
    if (areExitsPowered()) {
      const gate = findNearestExitGate(player, 96);
      if (gate) return gate.opened ? "逃出" : "开门";
    }
    if (findNearestHealableTeammate(player, 92)) return "治疗";
    if (findNearestRepairPoint(player, 110)) return "修理";
    return "使用";
  }

  function getSurvivorReadout() {
    if (selectedRole === PLAYER_ROLE.hunter) return getHunterCharacter().name;
    const characterName = getSurvivorCharacter(player).name;
    const label = `${characterName} · ${getSurvivorRoleLabel(player)}`;
    if (player.escaped) return `${label} · 已逃出`;
    if (isSurvivorInvisible(player)) return `${label} · 隐身`;
    if (isActor(player)) return `${label} · ${player.magicShowMode === "hunter" ? "送监管" : "转椅"}`;
    if (isClockmaker(player) && player.timeDevice) return `${label} · 可回溯`;
    if (player.action && player.action.kind === "repairing" && player.action.calibration) return `${label} · 校准`;
    if (player.action && player.action.kind === "repairing") return `${label} · 修理`;
    if (player.action && player.action.kind === "openingGate") return `${label} · 开门`;
    if (player.action && player.action.kind === "escaping") return `${label} · 逃出`;
    if (player.action && player.action.kind === "healing") return `${label} · 治疗`;
    if (player.action && player.action.kind === "dismantlingLamp") return `${label} · 拆灯`;
    if (player.stitchPack) return `${label} · 针线 ${getStitchSecondsLeft(player)}秒`;
    if ((player.damageProgress || 0) > 0) return `${label} · 裂伤${Math.round((player.damageProgress || 0) * 100)}%`;
    if (getBoneBleedStacks(player) > 0) return `${label} · 流血x${getBoneBleedStacks(player)}`;
    if (player.state === "downed" && !isBeingPickedUp(player) && getMoveVector().length > 0.1) return `${label} · 爬行`;
    if (performance.now() < player.boostUntil) return `${label} · 加速`;
    return `${label} · ${getStateLabel(player.state)}`;
  }

  function getExitReadout() {
    if (isHatchOpen()) return "地窖开启";
    if (isHatchSpawned()) return "地窖刷新";
    if (!areExitsPowered()) return "未开启";
    const openedCount = exitGates.filter((gate) => gate.opened).length;
    if (openedCount === exitGates.length) return "全开";
    if (openedCount > 0) return `${openedCount}/2`;
    return "可开门";
  }

  function getStateLabel(state) {
    if (state === "healthy") return "健康";
    if (state === "injured") return "受伤";
    if (state === "seated") return "上椅";
    if (state === "carried") return "牵起";
    if (state === "eliminated") return "淘汰";
    return "倒地";
  }

  function updateSharedInteractions(dt) {
    const now = performance.now();
    updateHatchState();
    updateCarryStruggle(dt, now);
    updateSoulLampAlerts(now);
    updatePackageProjectiles(dt, now);
    updateStitchPackPickups(now);
    updateStitchPacks(now);
    updateTimeDevices(now);
    updateActorDecoys(dt, now);
    updateBoneBleed(now);
    updateSawbonePendingWipe(now);
    updateSharedHealing(dt);
    updateSharedRepairs(dt);
    updateSharedGateOpening(dt);
    updateBleedOutProgress(now);
    updateChairProgress(dt);
  }

  function updateSoulLampAlerts(now) {
    if (!isLanternKeeper() || soulLamps.length === 0) {
      if (lanternAlert && lanternAlert.kind === "detected") lanternAlert = null;
      return;
    }

    soulLamps.forEach((lamp) => {
      const detected = getSurvivors().find((survivor) => {
        if (survivor.escaped || survivor.state === "eliminated" || survivor.state === "seated" || survivor.state === "carried") return false;
        return distanceBetween(survivor, lamp) <= SOUL_LAMP_RANGE;
      });
      if (!detected || now - lamp.lastAlertAt < SOUL_LAMP_ALERT_COOLDOWN) return;

      lamp.lastAlertAt = now;
      lamp.detectingUntil = now + SOUL_LAMP_DETECT_FLASH;
      lanternAlert = {
        kind: "detected",
        text: `魂灯发现 ${detected.name}`,
        lamp,
        survivor: detected,
        until: now + SOUL_LAMP_ALERT_DURATION
      };
      chasePulseUntil = now + 360;
    });

    if (lanternAlert && now >= lanternAlert.until) lanternAlert = null;
  }

  function updateHatchState() {
    hatch.spawned = getCompletedRepairCount() >= HATCH_REPAIR_REQUIRED;
    hatch.opened = hatch.spawned && getActiveSurvivors().length === 1;
  }

  function updateBoneBleed(now) {
    getSurvivors().forEach((survivor) => pruneBoneBleed(survivor, now));
  }

  function updateTimeDevices(now) {
    getSurvivors().forEach((survivor) => {
      if (survivor.timeDevice && now > survivor.timeDevice.until) survivor.timeDevice = null;
      if (hunter.target === survivor && isSurvivorInvisible(survivor, now)) hunter.target = null;
    });
  }

  function updateActorDecoys(dt, now) {
    for (let index = actorDecoys.length - 1; index >= 0; index -= 1) {
      const decoy = actorDecoys[index];
      if (now >= decoy.until) {
        actorDecoys.splice(index, 1);
        continue;
      }
      moveActorSmart(decoy, decoy.vx * dt, decoy.vy * dt);
      if (Math.hypot(decoy.vx, decoy.vy) > 0.01) decoy.angle = Math.atan2(decoy.vy, decoy.vx);
    }
  }

  function getActiveSurvivors() {
    return getSurvivors().filter((survivor) => !survivor.escaped && survivor.state !== "eliminated");
  }

  function getBleedOutSecondsLeft(survivor) {
    if (!survivor.downedAt) return Math.ceil(BLEED_OUT_DURATION / 1000);
    return Math.max(0, Math.ceil((BLEED_OUT_DURATION - (performance.now() - survivor.downedAt)) / 1000));
  }

  function getStitchSecondsLeft(survivor) {
    if (!survivor.stitchPack) return 0;
    return Math.max(0, Math.ceil((survivor.stitchPack.healAt - performance.now()) / 1000));
  }

  function updateBleedOutProgress(now) {
    getSurvivors().forEach((survivor) => {
      if (survivor.state !== "downed") return;
      if (!survivor.downedAt) survivor.downedAt = now;
      if (now - survivor.downedAt >= BLEED_OUT_DURATION) eliminateSurvivor(survivor);
    });
  }

  function updateChairProgress(dt) {
    chairs.forEach((item) => {
      const survivor = item.survivor;
      if (!survivor || survivor.state !== "seated") return;
      survivor.chairProgress = Math.min(1, survivor.chairProgress + (dt * 1000) / CHAIR_ELIMINATION_DURATION);
      if (survivor.chairProgress >= 1) eliminateSurvivor(survivor);
    });
  }

  function updateStitchPackPickups(now) {
    for (let index = stitchPackDrops.length - 1; index >= 0; index -= 1) {
      const drop = stitchPackDrops[index];
      const target = getSurvivors()
        .filter((survivor) => survivor !== drop.owner && canReceiveStitchPack(survivor))
        .sort((a, b) => distanceBetween(a, drop) - distanceBetween(b, drop))[0];
      if (!target || distanceBetween(target, drop) > target.radius + STITCH_PACK_PICKUP_RADIUS) continue;
      applyStitchPack(target, now, drop.owner);
      stitchPackDrops.splice(index, 1);
    }
  }

  function updateStitchPacks(now) {
    getSurvivors().forEach((survivor) => {
      if (!survivor.stitchPack) return;
      if (survivor.state !== "injured" || survivor.escaped) {
        survivor.stitchPack = null;
        return;
      }
      if (now < survivor.stitchPack.healAt) return;
      if (survivor.action && survivor.action.kind === "beingHealed") cancelHealing(survivor.action);
      survivor.state = "healthy";
      survivor.healProgress = 0;
      survivor.action = null;
      survivor.boostUntil = 0;
      survivor.stitchPack = null;
      survivor.healDecision = null;
      chasePulseUntil = now + 360;
    });
  }

  function updateSharedHealing(dt) {
    getSurvivors().forEach((target) => {
      if (!target.action || target.action.kind !== "beingHealed" || !isHealableState(target)) return;
      const healers = getActiveHealers(target);
      if (healers.length === 0) {
        target.action = null;
        return;
      }

      const duration = target.state === "downed" ? HEAL_DOWNED_DURATION : HEAL_INJURED_DURATION;
      const healPower = healers.reduce((total, healer) => total + getSurvivorHealPower(healer), 0);
      target.healProgress = Math.min(1, (target.healProgress || 0) + (dt * 1000 * healPower) / duration);
      if (target.healProgress >= 1) finishHealing(target);
    });
  }

  function updateSharedRepairs(dt) {
    repairPoints.forEach((point) => {
      if (point.completed) return;
      point.workers = getActiveRepairers(point);
      if (point.workers.length === 0) return;

      const progressGain = point.workers.reduce((total, worker) => {
        return total + ((dt * 1000) / worker.action.duration) * getRepairSpeedMultiplier(worker);
      }, 0);
      point.progress = Math.min(1, point.progress + progressGain);
      if (point.progress >= 1) finishRepair(point);
    });
  }

  function updateSharedGateOpening(dt) {
    exitGates.forEach((gate) => {
      if (!areExitsPowered() || gate.opened) return;
      gate.workers = getActiveGateOpeners(gate);
      if (gate.workers.length === 0) return;

      const progressGain = gate.workers.reduce((total, worker) => {
        return total + (dt * 1000) / worker.action.duration;
      }, 0);
      gate.progress = Math.min(1, gate.progress + progressGain);
      if (gate.progress >= 1) finishOpenGate(gate);
    });
  }

  function getActiveRepairers(point) {
    return point.workers.filter((worker) => {
      return worker.action &&
        worker.action.kind === "repairing" &&
        worker.action.point === point &&
        !worker.escaped &&
        worker.state !== "downed" &&
        distanceBetween(worker, point) <= 130;
    });
  }

  function getActiveGateOpeners(gate) {
    return gate.workers.filter((worker) => {
      return worker.action &&
        worker.action.kind === "openingGate" &&
        worker.action.gate === gate &&
        !worker.escaped &&
        worker.state !== "downed" &&
        distanceBetween(worker, gate) <= 120;
    });
  }

  function checkMatchResult() {
    if (matchResult) return;

    const survivors = getSurvivors();
    const escapedCount = survivors.filter((survivor) => survivor.escaped).length;
    const eliminatedCount = survivors.filter((survivor) => survivor.state === "eliminated").length;
    const activeSurvivors = survivors.filter((survivor) => !survivor.escaped && survivor.state !== "eliminated");

    if (escapedCount >= 3) {
      endMatch("survivor", "逃生胜利", `${escapedCount} 名逃生者已经逃出`);
      return;
    }

    if (eliminatedCount >= 3 && activeSurvivors.length === 0) {
      endMatch("hunter", "追捕者胜利", `${eliminatedCount} 名逃生者被淘汰`);
      return;
    }

    if (escapedCount === 2 && eliminatedCount >= 2) {
      endMatch("draw", "平局", "2 名逃生者逃出");
      return;
    }

    if (activeSurvivors.length === 0) {
      if (escapedCount === 2) {
        endMatch("draw", "平局", "2 名逃生者逃出");
      } else {
        endMatch("hunter", "追捕者胜利", `${escapedCount} 名逃生者逃出`);
      }
    }
  }

  function endMatch(winner, title, detail) {
    matchResult = { winner, title, detail };
    matchStarted = false;
    getSurvivors().forEach((survivor) => {
      if (survivor.action && ["healing", "beingHealed"].includes(survivor.action.kind)) cancelHealing(survivor.action);
      if (survivor.action && survivor.action.kind === "repairing") cancelRepair(survivor.action);
      if (survivor.action && survivor.action.kind === "openingGate") cancelGateOpen(survivor.action);
      if (survivor.chair) survivor.chair.survivor = null;
      survivor.action = null;
      survivor.vx = 0;
      survivor.vy = 0;
    });
    hunter.action = null;
    hunter.carrying = null;
    hunter.vx = 0;
    hunter.vy = 0;
  }

  function getHunterStatusLabel(status) {
    if (status === "attacking") return "攻击";
    if (status === "cooldown") return "冷却";
    if (status === "downed") return "倒地";
    if (status === "wipe") return "擦刀";
    if (status === "miss") return "空刀";
    if (status === "stunned") return "眩晕";
    if (status === "breaking") return "踩板";
    if (status === "vaulting") return "翻越";
    if (status === "pickingUp") return "牵人";
    if (status === "carrying") return "牵起";
    if (status === "toChair") return "找椅";
    if (status === "sawDash") return "拉锯";
    if (status === "shortSaw") return "短锯";
    if (status === "sawHit") return "命中";
    if (status === "allDowned") return "全倒地";
    if (status === "controlled") return "手动";
    return "追击";
  }

  function getHunterPresenceReadout() {
    const hits = hunter.presenceHits || 0;
    if ((hunter.presenceTier || 0) >= 2) return `${getHunterCharacter().name} · 二阶`;
    if ((hunter.presenceTier || 0) >= 1) return `${getHunterCharacter().name} · 一阶 ${hits}/${PRESENCE_TIER_TWO_HITS}`;
    return `${getHunterCharacter().name} · 存在 ${hits}/${PRESENCE_TIER_ONE_HITS}`;
  }

  function getHunterReadout() {
    const now = performance.now();
    if (lanternAlert && now < lanternAlert.until) return lanternAlert.text;
    if (hunter.carrying) return `挂椅 ${Math.round((hunter.carrying.carryProgress || 0) * 100)}%`;
    if (selectedRole === PLAYER_ROLE.hunter && isSawbone() && getSawAttackLockoutLeft(now) > 0) {
      return `${getHunterPresenceReadout()} · 锁刀${Math.ceil(getSawAttackLockoutLeft(now) / 1000)}s`;
    }
    if (selectedRole === PLAYER_ROLE.hunter && hunterHasSkill()) return `${getHunterPresenceReadout()} · ${getHunterSkillButtonLabel()}`;
    if (selectedRole === PLAYER_ROLE.hunter && canHunterAttack(now)) return `${getHunterPresenceReadout()} · J`;
    if (["wipe", "miss", "stunned", "breaking", "vaulting", "pickingUp", "sawDash", "shortSaw", "sawHit", "allDowned"].includes(hunter.status)) {
      return `${getHunterPresenceReadout()} · ${getHunterStatusLabel(hunter.status)}`;
    }
    if (hunter.target) return `${getHunterPresenceReadout()} · 追${hunter.target.name}`;
    return `${getHunterPresenceReadout()} · ${getHunterStatusLabel(hunter.status)}`;
  }

  function frame(now) {
    const dt = Math.min(0.033, (now - lastTime) / 1000);
    lastTime = now;
    if (matchStarted) {
      recoverActorsFromStuckStates(now);
      movePlayer(dt);
      updateTeammates(dt, now);
      if (selectedRole !== PLAYER_ROLE.hunter) updateHunter(dt, now);
      updateSharedInteractions(dt);
      recoverActorsFromStuckStates(now);
      checkMatchResult();
    }
    updateCamera(dt);
    draw();
    requestAnimationFrame(frame);
  }

  function bindTouchStick() {
    let activePointer = null;

    function setStick(clientX, clientY) {
      const box = touchStick.getBoundingClientRect();
      const centerX = box.left + box.width / 2;
      const centerY = box.top + box.height / 2;
      const max = Math.max(30, Math.min(box.width, box.height) * 0.34);
      let x = clientX - centerX;
      let y = clientY - centerY;
      const length = Math.hypot(x, y);
      if (length > max) {
        x = (x / length) * max;
        y = (y / length) * max;
      }
      input.touchX = x / max;
      input.touchY = y / max;
      touchKnob.style.transform = `translate(${x}px, ${y}px)`;
    }

    function resetStick() {
      activePointer = null;
      input.touchX = 0;
      input.touchY = 0;
      touchKnob.style.transform = "translate(0, 0)";
    }

    touchStick.addEventListener("pointerdown", (event) => {
      activePointer = event.pointerId;
      touchStick.setPointerCapture(activePointer);
      setStick(event.clientX, event.clientY);
    });

    touchStick.addEventListener("pointermove", (event) => {
      if (event.pointerId === activePointer) setStick(event.clientX, event.clientY);
    });

    touchStick.addEventListener("pointerup", resetStick);
    touchStick.addEventListener("pointercancel", resetStick);
  }

  function resetMovementInput() {
    input.up = false;
    input.down = false;
    input.left = false;
    input.right = false;
    input.sprint = false;
    input.touchX = 0;
    input.touchY = 0;
    cancelPackageAim();
    if (touchKnob) touchKnob.style.transform = "translate(0, 0)";
  }

  function bindTouchActions() {
    bindTouchButton(touchUseButton, () => handlePlayerUse(performance.now()));
    bindTouchButton(touchInteractButton, () => handlePlayerInteraction(performance.now()));
    bindTouchButton(touchAttackButton, () => handlePlayerAttack(performance.now()));
    bindTouchButton(touchShadowButton, () => handlePlayerShadowSkill(performance.now()));
    bindSkillButton();
  }

  function bindTouchButton(button, handler) {
    if (!button) return;
    button.addEventListener("pointerdown", (event) => {
      event.preventDefault();
      handler();
    });
  }

  function bindSkillButton() {
    if (!touchSkillButton) return;
    touchSkillButton.addEventListener("pointerdown", (event) => {
      event.preventDefault();
      if (selectedRole === PLAYER_ROLE.survivor && isMessenger(player)) {
        touchSkillButton.setPointerCapture(event.pointerId);
        startPackageAim(player, performance.now(), null, null, event.pointerId, false);
        return;
      }
      handlePlayerSkill(performance.now());
    });
    touchSkillButton.addEventListener("pointermove", (event) => {
      updatePackageAim(event.clientX, event.clientY, event.pointerId);
    });
    touchSkillButton.addEventListener("pointerup", (event) => {
      finishPackageAim(performance.now(), event.pointerId);
    });
    touchSkillButton.addEventListener("pointercancel", (event) => {
      cancelPackageAim(event.pointerId);
    });
  }

  window.addEventListener("resize", resize);
  window.addEventListener("keydown", (event) => {
    if ([" ", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.key)) {
      event.preventDefault();
    }
    keyToInput(event.key, true);
  });
  window.addEventListener("keyup", (event) => keyToInput(event.key, false));
  window.addEventListener("pointermove", (event) => updatePackageAim(event.clientX, event.clientY, event.pointerId));
  window.addEventListener("blur", resetMovementInput);
  roleButtons.forEach((button) => {
    button.addEventListener("click", () => showCharacterSelection(button.dataset.role));
  });
  characterButtons.forEach((button) => {
    button.addEventListener("click", () => startMatch(button.dataset.characterRole, button.dataset.character));
  });
  if (characterBackButton) characterBackButton.addEventListener("click", showRoleSelection);

  resize();
  bindTouchStick();
  bindTouchActions();
  resetMatch();
  setRoleOverlayVisible(true);
  requestAnimationFrame(frame);
})();
