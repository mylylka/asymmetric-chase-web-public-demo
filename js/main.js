(function () {
  "use strict";

  const canvas = document.getElementById("gameCanvas");
  const ctx = canvas.getContext("2d");
  const miniMap = document.getElementById("miniMapCanvas");
  const miniCtx = miniMap ? miniMap.getContext("2d") : null;
  const cipherStatusReadout = document.getElementById("cipherStatusReadout");
  const hunterPresenceBadge = document.getElementById("hunterPresenceBadge");
  const survivorStatusGrid = document.getElementById("survivorStatusGrid");
  const cooldownPanel = document.getElementById("cooldownPanel");
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
  const characterNextButton = document.getElementById("characterNextButton");
  const hiddenUnlockForm = document.getElementById("hiddenUnlockForm");
  const hiddenCodeInput = document.getElementById("hiddenCodeInput");
  const badgePanel = document.getElementById("badgePanel");
  const badgeLimitReadout = document.getElementById("badgeLimitReadout");
  const assistPanel = document.getElementById("assistPanel");
  const assistLimitReadout = document.getElementById("assistLimitReadout");
  const hunterSurvivorPreview = document.getElementById("hunterSurvivorPreview");
  const roleButtons = document.querySelectorAll("[data-role]");
  const modeButtons = document.querySelectorAll("[data-mode]");
  const characterButtons = document.querySelectorAll("[data-character]");
  const badgeButtons = document.querySelectorAll("[data-badge]");
  const assistButtons = document.querySelectorAll("[data-assist]");
  let survivorStatusHtml = "";
  const HIDDEN_HUNTER_UNLOCK_KEY = "asymmetricChase.hiddenHunterUnlocked";
  const HIDDEN_HUNTER_UNLOCK_CODE = "jianxian";
  const DEVELOPER_MODE_QUERY_KEY = "dev";

  const PLAYER_ROLE = {
    survivor: "survivor",
    hunter: "hunter"
  };

  const GAME_MODE = {
    normal: "normal",
    infiniteSawbone: "infiniteSawbone",
    soulBinderPractice: "soulBinderPractice",
    kiteSimulator: "kiteSimulator"
  };

  const BADGE_LIMITS = {
    purple: 2,
    blue: 4
  };
  const BADGE_CONFIG = {
    survivor: {
      cipher: { name: "齿轮", rarity: "blue", repairDuration: 0.94 },
      kite: { name: "羽步", rarity: "blue", vaultDuration: 0.93, hitBoostDuration: 1.12 },
      aid: { name: "援护", rarity: "blue", rescueDuration: 0.9, healPower: 1.12 },
      ember: { name: "余火", rarity: "blue", crawlSpeed: 1.22, hitBoostDuration: 1.08 },
      adrenaline: { name: "回光返照", rarity: "purple", endgameBoost: 1.5 },
      borrowedTime: { name: "搏命挣扎", rarity: "purple" },
      flywheel: { name: "飞轮效应", rarity: "purple" },
      kneeJerk: { name: "膝跳反射", rarity: "purple" }
    },
    hunter: {
      detention: { name: "挽留", rarity: "purple", detention: 1 },
      rampage: { name: "张狂", rarity: "purple" },
      trumpCard: { name: "底牌切换", rarity: "purple" },
      wanted: { name: "通缉", rarity: "blue" },
      hunt: { name: "猎步", rarity: "blue", speed: 1.035 },
      blade: { name: "锋刃", rarity: "blue", attackRange: 1.06 },
      pressure: { name: "压迫", rarity: "blue", chairSpeed: 1.08 },
      wipe: { name: "收刀", rarity: "blue", hitRecovery: 0.93, missRecovery: 0.9 }
    }
  };
  const HUNTER_ASSIST_SKILLS = {
    listen: { name: "聆听", cooldown: 42000 },
    peeper: { name: "插眼", cooldown: 50000 },
    patroller: { name: "巡视者", cooldown: 62000 },
    blink: { name: "闪现", cooldown: 55000 },
    shift: { name: "移形", cooldown: 68000 },
    excitement: { name: "兴奋", cooldown: 52000 }
  };
  const HUNTER_ASSIST_ORDER = ["listen", "peeper", "patroller", "blink", "shift", "excitement"];

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
    },
    medic: {
      name: "军医",
      roleTag: "救人位",
      rescuePriority: 1,
      chaseDifficulty: 1.08,
      repairDuration: 1.05,
      vaultDuration: 1,
      rescueDuration: 1 / 1.4,
      healPower: 1.08,
      crawlSpeed: 1,
      hitBoostDuration: 1,
      fill: "#e7f2ef",
      core: "#3d9f8b"
    },
    perfumer: {
      name: "调香师",
      roleTag: "辅助位",
      rescuePriority: 2,
      chaseDifficulty: 1.24,
      repairDuration: 1,
      vaultDuration: 0.96,
      rescueDuration: 1,
      healPower: 1,
      crawlSpeed: 1,
      hitBoostDuration: 1,
      fill: "#cfefff",
      core: "#4f9bd8"
    },
    fencer: {
      name: "击剑手",
      roleTag: "牵制位",
      rescuePriority: 2,
      chaseDifficulty: 1.32,
      repairDuration: 1,
      vaultDuration: 0.94,
      rescueDuration: 1,
      healPower: 1,
      crawlSpeed: 1,
      hitBoostDuration: 1,
      fill: "#e8eef5",
      core: "#6e8fcf"
    },
    general: {
      name: "将军",
      roleTag: "救人位",
      rescuePriority: 1,
      chaseDifficulty: 1.22,
      repairDuration: 1.06,
      vaultDuration: 1,
      rescueDuration: 1,
      healPower: 1,
      crawlSpeed: 1,
      hitBoostDuration: 1,
      fill: "#4f6044",
      core: "#d1b06a"
    }
  };

  const HUNTER_CHARACTERS = {
    standard: {
      name: "标准追捕者",
      speed: 304,
      attackRange: 86,
      attackWindup: 0.13,
      attackLunge: 58,
      hitRecovery: 1,
      missRecovery: 1,
      vaultDuration: 1
    },
    brute: {
      name: "重击追捕者",
      speed: 292,
      attackRange: 120,
      attackWindup: 0.23,
      attackLunge: 38,
      hitRecovery: 1.16,
      missRecovery: 1.08,
      vaultDuration: 1.08
    },
    lanternKeeper: {
      name: "提灯人",
      speed: 298,
      attackRange: 92,
      attackWindup: 0.12,
      attackLunge: 54,
      hitRecovery: 1,
      missRecovery: 1,
      vaultDuration: 1,
      fill: "#b95f52",
      core: "#ffd5cd"
    },
    sawbone: {
      name: "锯骨",
      speed: 300,
      attackRange: 96,
      attackWindup: 0.16,
      attackLunge: 52,
      hitRecovery: 1.04,
      missRecovery: 1,
      vaultDuration: 1,
      fill: "#d8d0bd",
      core: "#8f4f45"
    },
    soulBinder: {
      name: "引魂师",
      speed: 302,
      attackRange: 94,
      attackWindup: 0.15,
      attackLunge: 54,
      hitRecovery: 1,
      missRecovery: 1,
      vaultDuration: 1,
      fill: "#d8d0bd",
      core: "#7453a8"
    },
    twinSword: {
      name: "双生剑仙",
      speed: 316,
      attackRange: 130,
      attackWindup: 0.1,
      attackLunge: 24,
      hitRecovery: 0.67,
      missRecovery: 0.86,
      vaultDuration: 0.86,
      fill: "#d7efff",
      core: "#8f7dff"
    }
  };

  const AI_SURVIVOR_CHARACTER_ORDER = ["clockmaker", "actor", "messenger", "apprentice", "medic", "perfumer", "general"];
  const AI_HUNTER_CHARACTER_ORDER = ["standard", "brute", "lanternKeeper", "sawbone", "soulBinder"];

  const ATTACK_KEY = "j";
  const SKILL_KEY = "q";
  const SHADOW_KEY = "f";
  const CLOCKMAKER_ID = "clockmaker";
  const ACTOR_ID = "actor";
  const MEDIC_ID = "medic";
  const FENCER_ID = "fencer";
  const GENERAL_ID = "general";
  const TWIN_SWORD_ID = "twinSword";
  const PROFILE_UNLOCK_STORAGE_KEY = "asymmetric-chase-unlocks-v1";
  const PROFILE_TASK_STORAGE_KEY = "asymmetric-chase-unlock-tasks-v1";
  let developerUnlockAllCharacters = readDeveloperUnlockMode();
  const HUNTER_HIT_RECOVERY = 3000;
  const HUNTER_MISS_RECOVERY = 760;
  const HEAL_INJURED_DURATION = 9000;
  const HEAL_DOWNED_DURATION = 11000;
  const SELF_HEAL_DOWNED_DURATION = 14000;
  const SELF_HEAL_CAP = 0.95;
  const SURVIVOR_PALLET_PROMPT_RANGE = 112;
  const SURVIVOR_WINDOW_PROMPT_RANGE = 108;
  const HUNTER_PALLET_PROMPT_RANGE = 126;
  const HUNTER_WINDOW_PROMPT_RANGE = 142;
  const HUNTER_WINDOW_VAULT_DURATION = 640;
  const REPAIR_REQUIRED = 5;
  const HATCH_REPAIR_REQUIRED = 2;
  const PLAYER_REPAIR_DURATION = 60000;
  const AI_REPAIR_DURATION = 60000;
  const GATE_OPEN_DURATION = 25000;
  const GATE_ESCAPE_DURATION = 3000;
  const HATCH_ESCAPE_DURATION = 1500;
  const DOWNED_CRAWL_SPEED = 58;
  const CHAIR_ELIMINATION_DURATION = 60000;
  const BLEED_OUT_DURATION = 100000;
  const PICKUP_SURVIVOR_DURATION = 1400;
  const RESCUE_DURATION = 2000;
  const AI_RESCUE_FIRST_CHAIR_TARGET = 0.49;
  const AI_RESCUE_SECOND_CHAIR_TARGET = 0.99;
  const AI_RESCUE_FIRST_CHAIR_DANGER = 0.38;
  const AI_RESCUE_SECOND_CHAIR_DANGER = 0.82;
  const AI_RESCUE_HUNTER_NEAR_CHAIR = 300;
  const CARRY_STRUGGLE_DURATION = 10500;
  const CARRY_ESCAPE_STUN = 1400;
  const RESCUE_SPEED_BOOST_DURATION = 1800;
  const MEDIC_RESCUE_SHIELD_DURATION = 15000;
  const MEDIC_SHIELD_KNOCKBACK = 86;
  const MEDIC_SHIELD_STUN = 1000;
  const MEDIC_ADRENALINE_DURATION = 5000;
  const MEDIC_ADRENALINE_COOLDOWN = 35000;
  const MEDIC_ADRENALINE_SPEED_BOOST = 1.2;
  const CHAIR_PRESSURE_RANGE = 420;
  const ACTION_STALE_GRACE = 1400;
  const STUCK_RECOVERY_RADIUS = 22;
  const MOVE_COLLISION_STEP = 8;
  const COLLISION_PUSH_EPSILON = 0.35;
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
  const PERFUMER_ID = "perfumer";
  const PERFUMER_SENSE_FAR_RANGE = 1200;
  const PERFUMER_SENSE_NEAR_RANGE = 600;
  const PERFUME_MIST_RADIUS = 400;
  const PERFUME_MIST_DURATION = 10000;
  const PERFUME_MIST_COOLDOWN = 20000;
  const PERFUME_HUNTER_SPEED_MULTIPLIER = 0.9;
  const PERFUME_SELF_SPEED_BOOST = 1.15;
  const PERFUME_ULTIMATE_CHARGES = 4;
  const PERFUME_ULTIMATE_RADIUS = 600;
  const PERFUME_ULTIMATE_DURATION = 20000;
  const PERFUME_ULTIMATE_SURVIVOR_SPEED_BOOST = 1.2;
  const PERFUME_ULTIMATE_ILLUSIONS = 3;
  const FENCER_STRIDE_MARK_DURATION = 1000;
  const FENCER_STRIDE_MAX_MARKS = 10;
  const FENCER_STRIDE_SPEED_PER_MARK = 0.04;
  const FENCER_STRIDE_TURN_THRESHOLD = 0.46;
  const FENCER_STRIDE_TRIGGER_COOLDOWN = 160;
  const FENCER_LUNGE_DURATION = 500;
  const FENCER_LUNGE_DISTANCE = 480;
  const FENCER_LUNGE_COOLDOWN = 20000;
  const FENCER_LUNGE_TURN_ANGLE = Math.PI / 3;
  const FENCER_LUNGE_HUNTER_STUN = 500;
  const GENERAL_RIDE_DURATION = 20000;
  const GENERAL_RIDE_COOLDOWN = 40000;
  const GENERAL_RIDE_SPEED_BOOST = 1.4;
  const GENERAL_WHIP_COOLDOWN = 5000;
  const GENERAL_WHIP_SPEED_BOOST = 0.05;
  const FLYWHEEL_DURATION = 180;
  const FLYWHEEL_DISTANCE = 120;
  const FLYWHEEL_COOLDOWN = 50000;
  const KNEE_JERK_DURATION = 2000;
  const KNEE_JERK_COOLDOWN = 50000;
  const KNEE_JERK_SPEED_BOOST = 1.5;
  const WANTED_REVEAL_DURATION = 8000;
  const EXCITEMENT_GUARD_DURATION = 8000;
  const PERFUME_AI_CLOSE_VISION_RANGE = 96;
  const PERFUME_AI_WANDER_TURN_INTERVAL = 850;
  const PERFUME_AI_BLIND_ATTACK_CHANCE = 0.42;
  const STITCH_PACK_PICKUP_RADIUS = 34;
  const STITCH_HEAL_DELAY = 15000;
  const STITCH_PACK_COOLDOWN = 20000;
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
  const ACTOR_DECOY_SPEED = 250;
  const SAWBONE_ID = "sawbone";
  const SOUL_BINDER_ID = "soulBinder";
  const INITIAL_UNLOCKS = {
    survivor: [MESSENGER_ID, CLOCKMAKER_ID],
    hunter: [LANTERN_KEEPER_ID]
  };
  const CHARACTER_UNLOCK_TASKS = {
    apprentice: { role: PLAYER_ROLE.survivor, target: APPRENTICE_ID, progressKey: "healTeammate", goal: 2, label: "治疗队友 2 次" },
    actor: { role: PLAYER_ROLE.survivor, target: ACTOR_ID, progressKey: "rescue", goal: 3, label: "累计救人 3 次" },
    perfumer: { role: PLAYER_ROLE.survivor, target: PERFUMER_ID, progressKey: "escapeChase", goal: 2, label: "被追击后成功逃脱 2 次" },
    fencer: { role: PLAYER_ROLE.survivor, target: FENCER_ID, progressKey: "kiteSeconds", goal: 120, label: "牵制追捕 120 秒" },
    medic: { role: PLAYER_ROLE.survivor, target: MEDIC_ID, progressKey: "safeRescue", goal: 1, label: "救人后队友 30 秒内未倒地 1 次" },
    general: { role: PLAYER_ROLE.survivor, target: GENERAL_ID, progressKey: "injuredRescue", goal: 2, label: "受伤状态救人成功 2 次" },
    sawbone: { role: PLAYER_ROLE.hunter, target: SAWBONE_ID, progressKey: "hunterTierOne60", goal: 1, label: "60 秒内开启一阶" },
    soulBinder: { role: PLAYER_ROLE.hunter, target: SOUL_BINDER_ID, progressKey: "firstHitDown20", goal: 1, label: "首刀后 20 秒内击倒该求生者" },
    twinSwordFourKill: { role: PLAYER_ROLE.hunter, target: TWIN_SWORD_ID, progressKey: "fiveCipherFourKill", goal: 1, label: "5 台机尚未激活时拿下 4 抓" },
    twinSwordSkillBurst: { role: PLAYER_ROLE.hunter, target: TWIN_SWORD_ID, progressKey: "hunterSkillBurst5", goal: 1, label: "5 秒内释放 2 次追捕技能" },
    twinSwordRemoteDown: { role: PLAYER_ROLE.hunter, target: TWIN_SWORD_ID, progressKey: "remoteHunterDown", goal: 1, label: "远距离击倒逃生者" }
  };
  const SOUL_MARK_MAX = 3;
  const SOUL_BINDER_PRACTICE_SOUL_MARKS = 20;
  const SOUL_MARK_REPAIR_SLOWDOWN = 1.1;
  const SOUL_MARK_HEAL_POWER_MULTIPLIER = 0.8;
  const SOUL_MARK_VAULT_SLOWDOWN = 1.1;
  const SOUL_MARK_MOVE_SLOW = 0.85;
  const SOUL_SIPHON_DURATION = 7000;
  const SOUL_SIPHON_SPEED_BOOST = 1.2;
  const SOUL_SIPHON_FAIL_SLOW = 0.9;
  const SOUL_SIPHON_FAIL_DURATION = 3000;
  const SOUL_SIPHON_COOLDOWN = 25000;
  const BORROW_SOUL_DURATION = 15000;
  const BORROW_SOUL_COOLDOWN = 50000;
  const BORROW_SOUL_SPEED_PER_MARK = 0.03;
  const BORROW_SOUL_RECOVERY_PER_MARK = 0.05;
  const SOUL_RETURN_DURATION = 20000;
  const SOUL_RETURN_COOLDOWN = 50000;
  const SOUL_RETURN_CHAIR_SPEED = 1.3;
  const BONE_BLEED_DURATION = 10000;
  const BONE_BLEED_MAX_STACKS = 3;
  const BONE_BLEED_SLOW = 0.05;
  const BONE_BLEED_TIER_TWO_SLOW = 0.06;
  const DAMAGE_PROGRESS_EPSILON = 0.000001;
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
  const TWIN_FORM_QINGTIAN = "qingtian";
  const TWIN_FORM_CHIYIN = "chiyin";
  const TWIN_INTENT_MAX = 500;
  const TWIN_INTENT_INITIAL = 300;
  const TWIN_INTENT_REGEN = 25;
  const TWIN_ENLIGHTENMENT_DURATION = 30000;
  const TWIN_ENLIGHTENMENT_TIER_ONE_DURATION = 45000;
  const TWIN_FORM_COOLDOWN = 8000;
  const TWIN_TIME_POWER_COST = 200;
  const TWIN_TIME_POWER_DURATION = 10000;
  const TWIN_SPACE_POWER_COST = 100;
  const TWIN_SPACE_POWER_RANGE = 520;
  const TWIN_SHADOW_LOCK_COOLDOWN = 30000;
  const TWIN_SHADOW_LOCK_DURATION = 45000;
  const TWIN_SHADOW_LOCK_RANGE = 150;
  const TWIN_SHADOW_LOCK_CAST_RANGE = 460;
  const TWIN_SHADOW_STRIKE_COOLDOWN = 30000;
  const TWIN_SHADOW_STRIKE_RANGE = 145;
  const TWIN_SHADOW_STRIKE_CAST_RANGE = 480;
  const TWIN_SHACKLE_MAX = 100;
  const TWIN_GAZE_RANGE = 480;
  const TWIN_GAZE_ARC = Math.PI * 0.52;
  const TWIN_GAZE_GAIN = 10;
  const TWIN_SHADOW_LOCK_GAIN = 20;
  const TWIN_SHACKLE_DECAY_DELAY = 10000;
  const TWIN_SHACKLE_DECAY = 5;
  const TWIN_SHACKLE_LOCK_DURATION = 5000;
  const TWIN_FLYING_SWORD_SPEED = 820;
  const TWIN_FLYING_SWORD_RANGE = 720;
  const TWIN_FLYING_SWORD_RADIUS = 15;
  const TWIN_DUAL_CAST_COOLDOWN = 60000;
  const SHORT_SAW_WINDOW = 1500;
  const SHORT_SAW_TIER_TWO_WINDOW = 2000;
  const SHORT_SAW_DURATION = 390;
  const SHORT_SAW_RANGE = 230;
  const SHORT_SAW_TURN_SPEED = Math.PI * 2.65;
  const ASSIST_LISTEN_DURATION = 6200;
  const ASSIST_LISTEN_MOVE_THRESHOLD = 22;
  const ASSIST_PEEPER_RANGE = 220;
  const ASSIST_PEEPER_DURATION = 65000;
  const ASSIST_PEEPER_INTERACTION_SPEED = 0.9;
  const ASSIST_PATROLLER_DURATION = 12000;
  const ASSIST_PATROLLER_SPEED = 430;
  const ASSIST_PATROLLER_HIT_RANGE = 34;
  const ASSIST_PATROLLER_HOLD_DURATION = 1700;
  const ASSIST_PATROLLER_SLOW_DURATION = 6000;
  const ASSIST_PATROLLER_SLOW = 0.65;
  const ASSIST_BLINK_DISTANCE = 260;
  const ASSIST_BLINK_ATTACK_BUFFER = 520;
  const ASSIST_SHIFT_RANGE = 780;
  const ASSIST_SHIFT_DURATION = 20000;
  const ASSIST_SHIFT_RADIUS = 36;
  const ASSIST_SHIFT_TRIGGER_RANGE = 42;
  const ASSIST_SHIFT_USES = 2;
  const ASSIST_SHIFT_LOCKOUT = 620;
  const ADRENALINE_BOOST_DURATION = 5000;
  const BORROWED_TIME_DURATION = 20000;
  const FINAL_CIPHER_PRIME_PROGRESS = 0.99;
  const FINAL_CIPHER_GUARD_RANGE = 70;
  const CHARGED_ATTACK_HOLD_THRESHOLD = 180;
  const CHARGED_ATTACK_MAX_HOLD = 2000;
  const CHARGED_ATTACK_RANGE_MULTIPLIER = 1.18;
  const CHARGED_ATTACK_MOVE_MULTIPLIER = 1.1;
  const RAMPAGE_PRESENCE_INTERVAL = 30000;
  const RAMPAGE_PRESENCE_MAX_HITS = 2;
  const HEARTBEAT_RANGE = 520;
  const BASE_WORLD_WIDTH = 2400;
  const BASE_WORLD_HEIGHT = 1760;
  const MAP_SCALE = 1;
  const SCALE_EXISTING_MAP_LAYOUT = false;
  const CENTER_CLEARING_EXTRA_X = 0;
  const CENTER_CLEARING_EXTRA_Y = 0;

  const world = {
    width: BASE_WORLD_WIDTH + CENTER_CLEARING_EXTRA_X,
    height: BASE_WORLD_HEIGHT + CENTER_CLEARING_EXTRA_Y,
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
    selfHealUsed: false,
    bleedStacks: [],
    soulMarks: 0,
    soulReturnUntil: 0,
    chairProgress: 0,
    chairProgressPausedUntil: 0,
    injuredAt: null,
    downedAt: null,
    nextChairEliminates: false,
    carryProgress: 0,
    chair: null,
    boostUntil: 0,
    endgameBoostUntil: 0,
    adrenalineTriggered: false,
    borrowedTimeUntil: 0,
    borrowedTimePendingDamage: 0,
    borrowedTimeUsed: false,
    medicShieldUntil: 0,
    medicShieldHits: 0,
    medicAdrenalineUntil: 0,
    medicAdrenalinePendingDamage: 0,
    medicRescueShockPendingDamage: 0,
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
    nextStitchPackAt: 0,
    nextPerfumeMistAt: 0,
    nextFencerLungeAt: 0,
    nextMedicAdrenalineAt: 0,
    nextFlywheelAt: 0,
    nextKneeJerkWindowAt: 0,
    nextKneeJerkPalletAt: 0,
    kneeJerkBoostUntil: 0,
    nextGeneralRideAt: 0,
    generalRideUntil: 0,
    generalRideWhips: 0,
    nextGeneralWhipAt: 0,
    perfumeBoostUntil: 0,
    perfumeUltimateCharges: 0,
    fencerStrideMarks: [],
    fencerLastSprintAngle: null,
    fencerNextStrideAt: 0,
    fencerLungePreparing: false,
    fencerLungePreparingAt: 0,
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
    speed: 304,
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
    rampagePresenceGained: 0,
    nextRampageAt: 0,
    wantedTarget: null,
    wantedUntil: 0,
    trumpCardUsed: false,
    trumpCardSelecting: false,
    trumpCardSelectionUntil: 0,
    excitementGuardUntil: 0,
    nextShadowTeleportAt: 0,
    nextSawDashAt: 0,
    nextSoulSiphonAt: 0,
    soulSiphonTarget: null,
    soulSiphonUntil: 0,
    soulSiphonPenaltyUntil: 0,
    nextBorrowSoulAt: 0,
    borrowSoulUntil: 0,
    borrowSoulSpeedBonus: 0,
    borrowSoulRecoveryBonus: 0,
    nextSoulReturnAt: 0,
    soulSelectionMode: null,
    soulSelectionCandidate: null,
    soulSelectionCount: 0,
    soulSelectionAt: 0,
    sawAttackLockedUntil: 0,
    shortSawAvailableUntil: 0,
    pendingSawWipe: false,
    pendingSawWipeAt: 0,
    action: null,
    angle: Math.PI,
    status: "chasing",
    target: null,
    blindWanderAngle: Math.PI,
    nextBlindWanderTurnAt: 0,
    lastKnownTargetX: null,
    lastKnownTargetY: null,
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

  expandCenterClearingLayout();

  let width = 0;
  let height = 0;
  let dpr = 1;
  let lastTime = performance.now();
  let chasePulseUntil = 0;
  let selectedRole = null;
  let pendingRole = null;
  let currentMode = GAME_MODE.normal;
  let pendingMode = null;
  let selectedSurvivorCharacter = CLOCKMAKER_ID;
  let selectedHunterCharacter = LANTERN_KEEPER_ID;
  let selectedCharacterForSetup = null;
  let setupStep = "character";
  let hiddenHunterUnlocked = readHiddenHunterUnlock();
  let profileUnlocks = readProfileUnlocks();
  let profileTaskProgress = readProfileTaskProgress();
  let playerChaseTaskState = null;
  const pendingSafeRescueTasks = [];
  let hiddenUnlockBuffer = "";
  let twinAim = null;
  let twinShadowZoneId = 0;
  let twinSwordProjectileId = 0;
  let matchStarted = false;
  let matchStartedAt = 0;
  let matchResult = null;
  let selectedSurvivorBadges = [];
  let selectedHunterBadges = [];
  let selectedHunterAssist = "listen";
  let previewSurvivorCharacterOrder = null;
  let nextSoulLampAt = 0;
  let lanternAlert = null;
  let soulLampId = 0;
  let assistPeeperId = 0;
  let activePatroller = null;
  let activeShiftPortals = null;
  let assistListenTargets = [];
  let finalCipherGuard = null;
  let packageProjectileId = 0;
  let packageAim = null;
  let lastAimPointer = null;
  let stitchPackDropId = 0;
  let actorDecoyId = 0;
  let perfumeMistId = 0;
  const soulLamps = [];
  const assistPeeperWards = [];
  const packageProjectiles = [];
  const stitchPackDrops = [];
  const actorDecoys = [];
  const perfumeMists = [];
  const twinShadowZones = [];
  const twinSwordProjectiles = [];
  const DEVICE_ASSET_ROOT = `${window.location.pathname.includes("/demos/") ? "../" : "./"}assets/devices/`;
  const DEVICE_IMAGES = createDeviceImages({
    repair: "repair-machine.png",
    chair: "rocket-chair.png",
    gate: "exit-gate.png",
    hatchClosed: "hatch-closed.png",
    hatchOpen: "hatch-open.png"
  });
  const CHARACTER_ASSET_ROOT = `${window.location.pathname.includes("/demos/") ? "../" : "./"}assets/游戏图样/角色/optimized/`;
  const CHARACTER_ASSET_VERSION = "q512-20260626-general-smallman";
  const CHARACTER_SPRITE_CACHE = {};
  const CHARACTER_WARMUP_QUEUE = [];
  let characterWarmupScheduled = false;
  const CHARACTER_IMAGES = createCharacterImages({
    clockmaker: "钟表匠Q版.png",
    actor: "演员Q版.png",
    messenger: "信使Q版.png",
    apprentice: "学徒Q版.png",
    medic: "军医Q版.png",
    perfumer: "调香师Q版.png",
    fencer: "击剑手Q版.png",
    lanternKeeper: "提灯人Q版.png",
    sawbone: "锯骨Q版.png",
    soulBinder: "引魂师Q版.png",
    twinQingtian: "赵青天Q版.png",
    twinChiyin: "池音Q版.png"
  });

  function createDeviceImages(files) {
    return Object.fromEntries(Object.entries(files).map(([key, file]) => {
      const image = new Image();
      image.decoding = "async";
      image.src = `${DEVICE_ASSET_ROOT}${file}`;
      return [key, image];
    }));
  }

  function createCharacterImages(files) {
    return Object.fromEntries(Object.entries(files).map(([key, file]) => {
      const image = new Image();
      image.decoding = "async";
      image.src = encodeURI(`${CHARACTER_ASSET_ROOT}${file}?v=${CHARACTER_ASSET_VERSION}`);
      image.addEventListener("load", () => warmCharacterSprite(key, image), { once: true });
      return [key, image];
    }));
  }

  function warmCharacterSprite(key, image) {
    CHARACTER_WARMUP_QUEUE.push({ key, image });
    scheduleCharacterWarmup();
  }

  function scheduleCharacterWarmup() {
    if (characterWarmupScheduled) return;
    characterWarmupScheduled = true;
    const run = () => {
      characterWarmupScheduled = false;
      const item = CHARACTER_WARMUP_QUEUE.shift();
      if (!item) return;
      const { key, image } = item;
      if (!CHARACTER_SPRITE_CACHE[key] && image.complete && image.naturalWidth) {
        CHARACTER_SPRITE_CACHE[key] = buildCharacterSprite(image, key);
      }
      if (CHARACTER_WARMUP_QUEUE.length) {
        window.setTimeout(scheduleCharacterWarmup, 140);
      }
    };
    if (typeof window.requestIdleCallback === "function") {
      window.requestIdleCallback(run, { timeout: 1200 });
    } else {
      window.setTimeout(run, 80);
    }
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
    return { x, y, survivor: null, destroyed: false };
  }

  function cloneMapItem(item) {
    return { ...item };
  }

  function captureCurrentMapLayout(id, name, theme) {
    return {
      id,
      name,
      theme,
      walls: walls.map(cloneMapItem),
      pallets: pallets.map(cloneMapItem),
      windows: windows.map(cloneMapItem),
      repairPoints: repairPoints.map(({ x, y }) => objective(x, y)),
      exitGates: exitGates.map(({ x, y }) => exitGate(x, y)),
      hatch: { x: hatch.x, y: hatch.y },
      chairs: chairs.map(({ x, y }) => chair(x, y))
    };
  }

  function createHospitalMapLayout() {
    return {
      id: "abandonedHospital",
      name: "废弃医院",
      theme: "hospital",
      walls: [
        rect(0, 0, world.width, 54),
        rect(0, world.height - 54, world.width, 54),
        rect(0, 0, 54, world.height),
        rect(world.width - 54, 0, 54, world.height),
        rect(260, 170, 500, 72),
        rect(960, 150, 460, 72),
        rect(1660, 170, 420, 72),
        rect(260, 410, 84, 430),
        rect(470, 360, 88, 300),
        rect(680, 450, 430, 78),
        rect(1290, 350, 84, 470),
        rect(1540, 450, 470, 78),
        rect(2140, 360, 84, 360),
        rect(420, 770, 320, 74),
        rect(920, 710, 84, 410),
        rect(1170, 820, 400, 82),
        rect(1690, 760, 84, 410),
        rect(1990, 920, 270, 76),
        rect(190, 1160, 520, 78),
        rect(850, 1120, 86, 420),
        rect(1110, 1260, 420, 80),
        rect(1700, 1330, 470, 78),
        rect(340, 1340, 72, 220),
        rect(560, 1420, 72, 210),
        rect(1280, 1450, 72, 210),
        rect(1510, 1450, 72, 210),
        rect(2020, 1500, 72, 160),
        rect(432, 220, 86, 140),
        rect(626, 220, 86, 140),
        rect(1048, 210, 88, 140),
        rect(1216, 210, 88, 140),
        rect(1744, 220, 86, 140),
        rect(1904, 220, 86, 140),
        rect(752, 500, 86, 112),
        rect(922, 500, 86, 112),
        rect(1618, 500, 86, 112),
        rect(1788, 500, 86, 112),
        rect(420, 970, 260, 72),
        rect(1960, 720, 210, 110)
      ],
      pallets: [
        prop(572, 308, 82, 10, 0, "standing"),
        prop(1176, 296, 82, 10, 0, "standing"),
        prop(1864, 308, 82, 10, 0, "standing"),
        prop(880, 590, 82, 10, 0, "standing"),
        prop(1748, 590, 82, 10, 0, "standing"),
        prop(580, 725, 86, 10, 0, "standing"),
        prop(1430, 790, 86, 10, 0, "standing"),
        prop(2124, 1015, 72, 10, 0, "standing"),
        prop(630, 1110, 88, 10, 0, "standing"),
        prop(1320, 1210, 88, 10, 0, "standing"),
        prop(1936, 1420, 84, 10, 0, "standing"),
        prop(1395, 1490, 72, 10, 0, "standing")
      ],
      windows: [
        prop(510, 206, 118, 44, 0, "window"),
        prop(1190, 188, 118, 44, 0, "window"),
        prop(1870, 206, 118, 44, 0, "window"),
        prop(302, 620, 44, 118, 0, "window"),
        prop(514, 510, 44, 118, 0, "window"),
        prop(895, 488, 118, 44, 0, "window"),
        prop(1332, 560, 44, 118, 0, "window"),
        prop(1790, 488, 118, 44, 0, "window"),
        prop(2182, 530, 44, 118, 0, "window"),
        prop(962, 900, 44, 118, 0, "window"),
        prop(1370, 862, 118, 44, 0, "window"),
        prop(1732, 960, 44, 118, 0, "window"),
        prop(450, 1200, 118, 44, 0, "window"),
        prop(892, 1350, 44, 118, 0, "window"),
        prop(1320, 1300, 118, 44, 0, "window"),
        prop(2060, 1370, 118, 44, 0, "window")
      ],
      repairPoints: [
        objective(760, 390),
        objective(1210, 390),
        objective(1880, 370),
        objective(820, 700),
        objective(1510, 710),
        objective(2210, 1120),
        objective(720, 1500),
        objective(1230, 1110),
        objective(1840, 1540)
      ],
      exitGates: [
        exitGate(170, 980),
        exitGate(2235, 310)
      ],
      hatch: {
        x: 1510,
        y: 1090
      },
      chairs: [
        chair(210, 300), chair(820, 300), chair(1500, 300), chair(2180, 300),
        chair(210, 650), chair(610, 610), chair(1180, 610), chair(1490, 610), chair(2040, 650),
        chair(320, 950), chair(760, 910), chair(1120, 980), chair(1580, 1010), chair(2220, 1050),
        chair(250, 1450), chair(790, 1540), chair(1140, 1470), chair(1640, 1520), chair(1980, 1220), chair(2250, 1520)
      ]
    };
  }

  function replaceMapArray(target, source) {
    target.splice(0, target.length, ...source.map(cloneMapItem));
  }

  function applyMapLayout(layout) {
    replaceMapArray(walls, layout.walls);
    replaceMapArray(pallets, layout.pallets);
    replaceMapArray(windows, layout.windows);
    replaceMapArray(repairPoints, layout.repairPoints.map(({ x, y }) => objective(x, y)));
    replaceMapArray(exitGates, layout.exitGates.map(({ x, y }) => exitGate(x, y)));
    replaceMapArray(chairs, layout.chairs.map(({ x, y }) => chair(x, y)));
    hatch.x = layout.hatch.x;
    hatch.y = layout.hatch.y;
    hatch.spawned = false;
    hatch.opened = false;
    currentMapLayout = layout;
  }

  function applyRandomMapLayout() {
    const options = MAP_LAYOUTS;
    const picked = options[Math.floor(Math.random() * options.length)] || options[0];
    applyMapLayout(picked);
  }

  let currentMapLayout = null;
  const MAP_LAYOUTS = [
    captureCurrentMapLayout("oldEstate", "旧庄园", "estate"),
    createHospitalMapLayout()
  ];

  function scaleMapLayout() {
    if (!SCALE_EXISTING_MAP_LAYOUT || MAP_SCALE === 1) return;
    walls.slice(4).forEach(scaleRectCenterFromBaseWorld);
    pallets.forEach(scalePositionFromBaseWorld);
    windows.forEach(scalePositionFromBaseWorld);
    repairPoints.forEach(scalePositionFromBaseWorld);
    exitGates.forEach(scalePositionFromBaseWorld);
    chairs.forEach(scalePositionFromBaseWorld);
    scalePositionFromBaseWorld(hatch);
    [player, hunter, ...teammates].forEach(scaleActorStartFromBaseWorld);
  }

  function expandCenterClearingLayout() {
    if (!CENTER_CLEARING_EXTRA_X && !CENTER_CLEARING_EXTRA_Y) return;
    walls.slice(4).forEach(shiftRectFromBaseCenter);
    pallets.forEach(shiftPositionFromBaseCenter);
    windows.forEach(shiftPositionFromBaseCenter);
    repairPoints.forEach(shiftPositionFromBaseCenter);
    exitGates.forEach(shiftPositionFromBaseCenter);
    chairs.forEach(shiftPositionFromBaseCenter);
    shiftPositionFromBaseCenter(hatch);
    [player, hunter, ...teammates].forEach(shiftActorStartFromBaseCenter);
  }

  function shiftPositionFromBaseCenter(item) {
    if (item.x >= BASE_WORLD_WIDTH / 2) item.x += CENTER_CLEARING_EXTRA_X;
    if (item.y >= BASE_WORLD_HEIGHT / 2) item.y += CENTER_CLEARING_EXTRA_Y;
    return item;
  }

  function shiftRectFromBaseCenter(item) {
    const centerX = item.x + item.w / 2;
    const centerY = item.y + item.h / 2;
    if (centerX >= BASE_WORLD_WIDTH / 2) item.x += CENTER_CLEARING_EXTRA_X;
    if (centerY >= BASE_WORLD_HEIGHT / 2) item.y += CENTER_CLEARING_EXTRA_Y;
    return item;
  }

  function shiftActorStartFromBaseCenter(actor) {
    shiftPositionFromBaseCenter(actor);
    actor.initialX = actor.x;
    actor.initialY = actor.y;
  }

  function scalePositionFromBaseWorld(item) {
    const oldCenterX = BASE_WORLD_WIDTH / 2;
    const oldCenterY = BASE_WORLD_HEIGHT / 2;
    const newCenterX = world.width / 2;
    const newCenterY = world.height / 2;
    item.x = newCenterX + (item.x - oldCenterX) * MAP_SCALE;
    item.y = newCenterY + (item.y - oldCenterY) * MAP_SCALE;
    return item;
  }

  function scaleRectCenterFromBaseWorld(item) {
    const center = {
      x: item.x + item.w / 2,
      y: item.y + item.h / 2
    };
    const oldCenterX = BASE_WORLD_WIDTH / 2;
    const oldCenterY = BASE_WORLD_HEIGHT / 2;
    const newCenterX = world.width / 2;
    const newCenterY = world.height / 2;
    const scaledCenterX = newCenterX + (center.x - oldCenterX) * MAP_SCALE;
    const scaledCenterY = newCenterY + (center.y - oldCenterY) * MAP_SCALE;
    item.x = scaledCenterX - item.w / 2;
    item.y = scaledCenterY - item.h / 2;
    return item;
  }

  function scaleActorStartFromBaseWorld(actor) {
    scalePositionFromBaseWorld(actor);
    actor.initialX = actor.x;
    actor.initialY = actor.y;
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
      selfHealUsed: false,
      bleedStacks: [],
      soulMarks: 0,
      soulReturnUntil: 0,
      chairProgress: 0,
      chairProgressPausedUntil: 0,
      injuredAt: null,
      downedAt: null,
      nextChairEliminates: false,
      carryProgress: 0,
      chair: null,
      boostUntil: 0,
      endgameBoostUntil: 0,
      adrenalineTriggered: false,
      borrowedTimeUntil: 0,
      borrowedTimePendingDamage: 0,
      borrowedTimeUsed: false,
      medicShieldUntil: 0,
      medicShieldHits: 0,
      medicAdrenalineUntil: 0,
      medicAdrenalinePendingDamage: 0,
      medicRescueShockPendingDamage: 0,
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
      nextStitchPackAt: 0,
      nextPerfumeMistAt: 0,
      nextFencerLungeAt: 0,
      nextMedicAdrenalineAt: 0,
      nextFlywheelAt: 0,
      nextKneeJerkWindowAt: 0,
      nextKneeJerkPalletAt: 0,
      kneeJerkBoostUntil: 0,
      nextGeneralRideAt: 0,
      generalRideUntil: 0,
      generalRideWhips: 0,
      nextGeneralWhipAt: 0,
      perfumeBoostUntil: 0,
      perfumeUltimateCharges: 0,
      fencerStrideMarks: [],
      fencerLastSprintAngle: null,
      fencerNextStrideAt: 0,
      fencerLungePreparing: false,
      fencerLungePreparingAt: 0,
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
    const characterId = actor && (actor.characterId || actor.owner && actor.owner.characterId);
    return SURVIVOR_CHARACTERS[characterId] || SURVIVOR_CHARACTERS.clockmaker;
  }

  function getSurvivorDisplayName(survivor) {
    return getSurvivorCharacter(survivor).name || survivor.name;
  }

  function isClockmaker(actor) {
    return actor && actor.characterId === CLOCKMAKER_ID;
  }

  function isActor(actor) {
    return actor && actor.characterId === ACTOR_ID;
  }

  function isMedic(actor) {
    return actor && actor.characterId === MEDIC_ID;
  }

  function isMessenger(actor) {
    return actor && actor.characterId === MESSENGER_ID;
  }

  function isApprentice(actor) {
    return actor && actor.characterId === APPRENTICE_ID;
  }

  function isPerfumer(actor) {
    return actor && actor.characterId === PERFUMER_ID;
  }

  function isFencer(actor) {
    return actor && actor.characterId === FENCER_ID;
  }

  function isGeneral(actor) {
    return actor && actor.characterId === GENERAL_ID;
  }

  function hasSurvivorSkill(actor) {
    return isMessenger(actor) || isApprentice(actor) || isClockmaker(actor) || isActor(actor) || isMedic(actor) || isPerfumer(actor) || isFencer(actor) || isGeneral(actor);
  }

  function getSurvivorMultiplier(actor, key, fallback = 1) {
    const value = getSurvivorCharacter(actor)[key];
    const characterMultiplier = Number.isFinite(value) ? value : fallback;
    return characterMultiplier * getSurvivorBadgeMultiplier(actor, key);
  }

  function getSurvivorBadgeMultiplier(actor, key) {
    return getBadgeMultiplier(actor && actor.badges, BADGE_CONFIG.survivor, key);
  }

  function getHunterBadgeMultiplier(key) {
    return getBadgeMultiplier(hunter.badges, BADGE_CONFIG.hunter, key);
  }

  function getBadgeMultiplier(badges, config, key) {
    if (!Array.isArray(badges) || badges.length === 0) return 1;
    return badges.reduce((total, id) => {
      const badge = config[id];
      const value = badge && badge[key];
      return total * (Number.isFinite(value) ? value : 1);
    }, 1);
  }

  function getSelectedBadgesForRole(role) {
    return role === PLAYER_ROLE.hunter ? selectedHunterBadges : selectedSurvivorBadges;
  }

  function getBadgeNames(role, badges = getSelectedBadgesForRole(role)) {
    const config = role === PLAYER_ROLE.hunter ? BADGE_CONFIG.hunter : BADGE_CONFIG.survivor;
    return badges.map((id) => config[id] && config[id].name).filter(Boolean);
  }

  function getBadgeReadout(role, badges) {
    const names = getBadgeNames(role, badges);
    return names.length ? ` · 徽章${names.join("/")}` : "";
  }

  function getBadgeRarity(role, badgeId) {
    const badge = BADGE_CONFIG[role] && BADGE_CONFIG[role][badgeId];
    return badge && badge.rarity || "blue";
  }

  function countBadgesByRarity(role, badges, rarity) {
    return badges.filter((id) => getBadgeRarity(role, id) === rarity).length;
  }

  function hasHunterBadge(id) {
    return Array.isArray(hunter.badges) && hunter.badges.includes(id);
  }

  function hasSurvivorBadge(survivor, id) {
    return Boolean(survivor && Array.isArray(survivor.badges) && survivor.badges.includes(id));
  }

  function getHunterAssistConfig(id = hunter.assistSkill || selectedHunterAssist) {
    return HUNTER_ASSIST_SKILLS[id] || null;
  }

  function getHunterAssistName(id = hunter.assistSkill || selectedHunterAssist) {
    const config = getHunterAssistConfig(id);
    return config ? config.name : "辅助";
  }

  function hasHunterAssist() {
    return selectedRole === PLAYER_ROLE.hunter && Boolean(hunter.assistSkill) && !isInfiniteSawboneMode();
  }

  function getHunterAssistCooldownLeft(now = performance.now()) {
    return Math.max(0, (hunter.nextAssistAt || 0) - now);
  }

  function canUseTrumpCard(now = performance.now()) {
    return matchStarted &&
      selectedRole === PLAYER_ROLE.hunter &&
      hasHunterBadge("trumpCard") &&
      !hunter.trumpCardUsed &&
      !isInfiniteSawboneMode() &&
      !hunter.carrying &&
      !hunter.action &&
      now >= (hunter.wipeUntil || 0) &&
      now >= (hunter.stunnedUntil || 0);
  }

  function startTrumpCardSelection(now = performance.now()) {
    if (hunter.trumpCardSelecting) {
      hunter.trumpCardSelecting = false;
      showAssistAlert("取消底牌", now, 800);
      return true;
    }
    if (!canUseTrumpCard(now)) return false;
    hunter.trumpCardSelecting = true;
    hunter.trumpCardSelectionUntil = now + 8000;
    const options = HUNTER_ASSIST_ORDER.map((id, index) => `${index + 1}${HUNTER_ASSIST_SKILLS[id].name}`).join(" ");
    showAssistAlert(`底牌 ${options}`, now, 2600);
    return true;
  }

  function selectTrumpCardAssist(key, now = performance.now()) {
    if (!hunter.trumpCardSelecting || now > (hunter.trumpCardSelectionUntil || 0)) {
      hunter.trumpCardSelecting = false;
      return false;
    }
    const index = Number(key) - 1;
    const assistId = HUNTER_ASSIST_ORDER[index];
    if (!assistId || !HUNTER_ASSIST_SKILLS[assistId]) return false;
    if (activePatroller) activePatroller = null;
    if (activeShiftPortals) finishAssistShift(now);
    hunter.assistSkill = assistId;
    hunter.trumpCardSelecting = false;
    hunter.trumpCardSelectionUntil = 0;
    hunter.trumpCardUsed = true;
    hunter.nextAssistAt = now;
    showAssistAlert(`底牌切换 ${getHunterAssistName(assistId)}`, now, 1200);
    return true;
  }

  function isAssistRevealed(survivor, now = performance.now()) {
    return Boolean(survivor && (now < (survivor.listenRevealUntil || 0) || now < (survivor.assistRevealUntil || 0)));
  }

  function getSurvivorRoleLabel(actor) {
    return getSurvivorCharacter(actor).roleTag || "修机位";
  }

  function getSurvivorRescuePriority(actor) {
    return getSurvivorCharacter(actor).rescuePriority || 4;
  }

  function isRescueRoleSurvivor(actor) {
    return getSurvivorRoleLabel(actor) === "救人位";
  }

  function ensureBorrowedTimeForRescueRole(actor, badges) {
    const next = Array.isArray(badges) ? badges.slice() : [];
    if (!isRescueRoleSurvivor(actor) || next.includes("borrowedTime")) return next;
    const purpleLimit = BADGE_LIMITS.purple || 0;
    const purpleCount = countBadgesByRarity(PLAYER_ROLE.survivor, next, "purple");
    if (purpleCount < purpleLimit) {
      next.push("borrowedTime");
      return next;
    }
    const replaceIndex = next.findIndex((id) => getBadgeRarity(PLAYER_ROLE.survivor, id) === "purple" && id !== "borrowedTime");
    if (replaceIndex >= 0) next[replaceIndex] = "borrowedTime";
    return next;
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

  function isSoulBinder() {
    return hunter.characterId === SOUL_BINDER_ID;
  }

  function isTwinSword() {
    return hunter.characterId === TWIN_SWORD_ID;
  }

  function isTwinForm(form) {
    return isTwinSword() && hunter.twinForm === form;
  }

  function isInfiniteSawboneMode() {
    return currentMode === GAME_MODE.infiniteSawbone;
  }

  function isSoulBinderPracticeMode() {
    return currentMode === GAME_MODE.soulBinderPractice;
  }

  function isKiteSimulatorMode() {
    return currentMode === GAME_MODE.kiteSimulator;
  }

  function isPracticeTargetMode() {
    return isInfiniteSawboneMode() || isSoulBinderPracticeMode();
  }

  function hunterHasSkill() {
    return isLanternKeeper() || isSawbone() || isTwinSword() || isSoulBinder();
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
    hunter.speed = config.speed * getHunterBadgeMultiplier("speed");
    hunter.attackRange = config.attackRange * getHunterBadgeMultiplier("attackRange");
    hunter.attackWindup = Math.max(0.1, Math.min(0.3, config.attackWindup ?? 0.16));
    hunter.attackLunge = config.attackLunge || 0;
    hunter.hitRecoveryMultiplier = config.hitRecovery || 1;
    hunter.missRecoveryMultiplier = config.missRecovery || 1;
  }

  function assignCharactersForMatch() {
    if (selectedRole === PLAYER_ROLE.survivor) {
      hunter.badges = getAIHunterBadges();
      hunter.assistSkill = null;
      applyHunterCharacter(pickAIHunterCharacter());
      applySurvivorCharacter(player, selectedSurvivorCharacter);
      player.badges = ensureBorrowedTimeForRescueRole(player, selectedSurvivorBadges);
      const remaining = shuffled(AI_SURVIVOR_CHARACTER_ORDER.filter((id) => id !== selectedSurvivorCharacter));
      teammates.forEach((survivor, index) => {
        applySurvivorCharacter(survivor, remaining[index] || AI_SURVIVOR_CHARACTER_ORDER[index]);
        survivor.badges = getAISurvivorBadges(survivor);
      });
      return;
    }

    hunter.badges = selectedHunterBadges.slice();
    hunter.assistSkill = selectedHunterAssist;
    applyHunterCharacter(selectedHunterCharacter);
    const survivorCharacters = previewSurvivorCharacterOrder && previewSurvivorCharacterOrder.length
      ? previewSurvivorCharacterOrder.slice()
      : shuffled(AI_SURVIVOR_CHARACTER_ORDER);
    getSurvivors().forEach((survivor, index) => {
      applySurvivorCharacter(survivor, survivorCharacters[index] || CLOCKMAKER_ID);
      survivor.badges = getAISurvivorBadges(survivor);
    });
  }

  function getAISurvivorBadges(survivor = null) {
    return ensureBorrowedTimeForRescueRole(survivor, getRandomAIBadges(PLAYER_ROLE.survivor));
  }

  function getAIHunterBadges() {
    return getRandomAIBadges(PLAYER_ROLE.hunter);
  }

  function getRandomAIBadges(role) {
    const config = BADGE_CONFIG[role] || {};
    const selected = [];
    Object.keys(BADGE_LIMITS).forEach((rarity) => {
      const limit = BADGE_LIMITS[rarity] || 0;
      const pool = Object.keys(config).filter((id) => getBadgeRarity(role, id) === rarity);
      selected.push(...shuffled(pool).slice(0, limit));
    });
    return selected;
  }

  function pickAIHunterCharacter() {
    const options = shuffled(AI_HUNTER_CHARACTER_ORDER);
    return options[0] || "standard";
  }

  function getSurvivorVaultDuration(actor, baseDuration) {
    return Math.round(baseDuration * getSurvivorMultiplier(actor, "vaultDuration") * getSoulLampVaultSlowdown(actor) * getSoulMarkVaultSlowdown(actor) / getSurvivorInteractionSpeedMultiplier(actor));
  }

  function getHunterVaultDuration(baseDuration) {
    return Math.round(baseDuration * getHunterCharacter().vaultDuration);
  }

  function getHunterHitRecoveryDuration() {
    return HUNTER_HIT_RECOVERY * getHunterCharacter().hitRecovery * getHunterBadgeMultiplier("hitRecovery") * getBorrowSoulRecoveryMultiplier();
  }

  function getHunterMissRecoveryDuration() {
    return HUNTER_MISS_RECOVERY * getHunterCharacter().missRecovery * getHunterBadgeMultiplier("missRecovery") * getBorrowSoulRecoveryMultiplier();
  }

  function getHunterAttackWindupDuration() {
    return Math.round(Math.max(0.1, Math.min(0.3, hunter.attackWindup || getHunterCharacter().attackWindup || 0.16)) * 1000);
  }

  function getHunterAttackLungeDistance() {
    return hunter.carrying ? 0 : Math.max(0, hunter.attackLunge || getHunterCharacter().attackLunge || 0);
  }

  function isDetentionActive() {
    return hasHunterBadge("detention") && getCompletedRepairCount() >= REPAIR_REQUIRED;
  }

  function getHunterBasicAttackDamage() {
    return 1;
  }

  function isInSoulLampRange(actor) {
    return isLanternKeeper() && soulLamps.some((lamp) => distanceBetween(actor, lamp) <= SOUL_LAMP_RANGE);
  }

  function getHunterMoveSpeed() {
    const twinFormBoost = isTwinForm(TWIN_FORM_CHIYIN) ? 1.32 : isTwinForm(TWIN_FORM_QINGTIAN) ? 1.08 : 1;
    const twinTimeBoost = isTwinSword() && hunter.twinTimePower && hunter.twinTimePower.kind === "self" && performance.now() < hunter.twinTimePower.until
      ? hunter.twinTimePower.factor
      : 1;
    return hunter.speed * (isInSoulLampRange(hunter) ? SOUL_LAMP_HUNTER_SPEED_BOOST : 1) * twinFormBoost * twinTimeBoost * getSoulSiphonMoveMultiplier() * getBorrowSoulMoveMultiplier() * getPerfumeHunterSpeedMultiplier();
  }

  function getSurvivorMoveSpeedMultiplier(actor, now = performance.now()) {
    const actorBoost = isActor(actor) && isSurvivorInvisible(actor, now) ? ACTOR_HIT_SPEED_BOOST : 1;
    const twinSlow = isTwinSword() && hunter.twinTimePower && hunter.twinTimePower.kind === "survivor" && now < hunter.twinTimePower.until
      ? 1 / hunter.twinTimePower.factor
      : 1;
    const shackled = now < (actor.shackledUntil || 0) ? 0 : 1;
    const patrollerHold = now < (actor.patrollerHoldUntil || 0) ? 0 : 1;
    const patrollerSlow = now < (actor.patrollerSlowUntil || 0) ? ASSIST_PATROLLER_SLOW : 1;
    const endgameBoost = now < (actor.endgameBoostUntil || 0) ? getSurvivorBadgeMultiplier(actor, "endgameBoost") : 1;
    const perfumeSelfBoost = now < (actor.perfumeBoostUntil || 0) ? PERFUME_SELF_SPEED_BOOST : 1;
    const perfumeUltimateBoost = isInPerfumeUltimateMist(actor, now) ? PERFUME_ULTIMATE_SURVIVOR_SPEED_BOOST : 1;
    const fencerStrideBoost = isFencer(actor) ? 1 + getFencerStrideMarkCount(actor, now) * FENCER_STRIDE_SPEED_PER_MARK : 1;
    const medicAdrenalineBoost = now < (actor.medicAdrenalineUntil || 0) ? MEDIC_ADRENALINE_SPEED_BOOST : 1;
    const generalRideBoost = isGeneralRiding(actor, now) ? GENERAL_RIDE_SPEED_BOOST + (actor.generalRideWhips || 0) * GENERAL_WHIP_SPEED_BOOST : 1;
    const kneeJerkBoost = now < (actor.kneeJerkBoostUntil || 0) ? KNEE_JERK_SPEED_BOOST : 1;
    return getBoneBleedSpeedMultiplier(actor, now) * getSoulMarkMoveMultiplier(actor) * actorBoost * twinSlow * shackled * patrollerHold * patrollerSlow * endgameBoost * perfumeSelfBoost * perfumeUltimateBoost * fencerStrideBoost * medicAdrenalineBoost * generalRideBoost * kneeJerkBoost;
  }

  function getFencerStrideMarkCount(actor, now = performance.now()) {
    if (!isFencer(actor)) return 0;
    actor.fencerStrideMarks = (actor.fencerStrideMarks || []).filter((until) => now < until);
    return actor.fencerStrideMarks.length;
  }

  function maybeAddFencerStrideMark(actor, move, now) {
    if (!isFencer(actor)) return;
    if (move.length <= 0.1) return;

    const angle = Math.atan2(move.y, move.x);
    if (!Number.isFinite(actor.fencerLastSprintAngle)) {
      actor.fencerLastSprintAngle = angle;
      return;
    }

    const diff = Math.abs(angleDifference(angle, actor.fencerLastSprintAngle));
    actor.fencerLastSprintAngle = angle;
    if (diff < FENCER_STRIDE_TURN_THRESHOLD || now < (actor.fencerNextStrideAt || 0)) return;

    const until = now + FENCER_STRIDE_MARK_DURATION;
    actor.fencerStrideMarks = (actor.fencerStrideMarks || []).filter((markUntil) => now < markUntil);
    actor.fencerStrideMarks.push(until);
    if (actor.fencerStrideMarks.length > FENCER_STRIDE_MAX_MARKS) {
      actor.fencerStrideMarks = actor.fencerStrideMarks.slice(actor.fencerStrideMarks.length - FENCER_STRIDE_MAX_MARKS);
    }
    actor.fencerStrideMarks = actor.fencerStrideMarks.map(() => until);
    actor.fencerNextStrideAt = now + FENCER_STRIDE_TRIGGER_COOLDOWN;
  }

  function getPerfumeHunterSpeedMultiplier(now = performance.now()) {
    return isHunterInPerfumeMist(now) ? PERFUME_HUNTER_SPEED_MULTIPLIER : 1;
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

  function getSoulMarks(survivor) {
    const maxMarks = isSoulBinderPracticeMode() ? SOUL_BINDER_PRACTICE_SOUL_MARKS : SOUL_MARK_MAX;
    return actorClamp(survivor && survivor.soulMarks || 0, 0, maxMarks);
  }

  function addSoulMark(survivor, amount = 1) {
    if (!survivor || survivor.escaped || survivor.state === "eliminated") return 0;
    const before = getSoulMarks(survivor);
    const maxMarks = isSoulBinderPracticeMode() ? SOUL_BINDER_PRACTICE_SOUL_MARKS : SOUL_MARK_MAX;
    survivor.soulMarks = Math.min(maxMarks, before + amount);
    return survivor.soulMarks - before;
  }

  function clearOneSoulMark(survivor) {
    if (!survivor || getSoulMarks(survivor) <= 0) return false;
    survivor.soulMarks = Math.max(0, getSoulMarks(survivor) - 1);
    return true;
  }

  function getSoulMarkMoveMultiplier(survivor) {
    return getSoulMarks(survivor) >= 3 ? SOUL_MARK_MOVE_SLOW : 1;
  }

  function getSoulSiphonMoveMultiplier(now = performance.now()) {
    if (!isSoulBinder()) return 1;
    if (now < (hunter.soulSiphonPenaltyUntil || 0)) return SOUL_SIPHON_FAIL_SLOW;
    if (!hunter.soulSiphonTarget || now >= (hunter.soulSiphonUntil || 0)) return 1;
    const move = getMoveVector();
    if (move.length <= 0.1) return 1;
    const toTarget = normalizeVector(hunter.soulSiphonTarget.x - hunter.x, hunter.soulSiphonTarget.y - hunter.y);
    const alignment = move.x * toTarget.x + move.y * toTarget.y;
    return alignment > 0.35 ? SOUL_SIPHON_SPEED_BOOST : 1;
  }

  function isSoulSiphonPhasing(now = performance.now()) {
    return isSoulBinder() && Boolean(hunter.soulSiphonTarget) && now < (hunter.soulSiphonUntil || 0);
  }

  function isSoulSiphonPhaseMove(dx, dy, now = performance.now()) {
    if (!isSoulSiphonPhasing(now)) return false;
    const move = normalizeVector(dx, dy);
    if (!move.x && !move.y) return false;
    const toTarget = normalizeVector(hunter.soulSiphonTarget.x - hunter.x, hunter.soulSiphonTarget.y - hunter.y);
    return move.x * toTarget.x + move.y * toTarget.y > 0.35;
  }

  function getBorrowSoulMoveMultiplier(now = performance.now()) {
    return isSoulBinder() && now < (hunter.borrowSoulUntil || 0) ? 1 + (hunter.borrowSoulSpeedBonus || 0) : 1;
  }

  function getBorrowSoulRecoveryMultiplier(now = performance.now()) {
    return isSoulBinder() && now < (hunter.borrowSoulUntil || 0) ? Math.max(0.45, 1 - (hunter.borrowSoulRecoveryBonus || 0)) : 1;
  }

  function isSurvivorInvisible(survivor, now = performance.now()) {
    return Boolean(survivor && now < (survivor.invisibleUntil || 0));
  }

  function isHunterInvisibleToSurvivors(now = performance.now()) {
    return isTwinSword() && (isTwinForm(TWIN_FORM_CHIYIN) || now < (hunter.invisibleUntil || 0));
  }

  function shouldHideSurvivorFromHunterView(survivor, now = performance.now()) {
    if (isAssistRevealed(survivor, now)) return false;
    if (isSoulBinder() && getSoulMarks(survivor) >= 3) return false;
    return selectedRole === PLAYER_ROLE.hunter && isSurvivorInvisible(survivor, now);
  }

  function getSoulLampVaultSlowdown(actor) {
    return isInSoulLampRange(actor) ? SOUL_LAMP_SURVIVOR_VAULT_SLOWDOWN : 1;
  }

  function getSoulMarkVaultSlowdown(actor) {
    return getSoulMarks(actor) >= 2 ? SOUL_MARK_VAULT_SLOWDOWN : 1;
  }

  function getSurvivorRepairDuration(actor, baseDuration) {
    return Math.round(baseDuration * getSurvivorMultiplier(actor, "repairDuration"));
  }

  function getSurvivorRescueDuration(actor) {
    return Math.round(RESCUE_DURATION * getSurvivorMultiplier(actor, "rescueDuration") / getSurvivorInteractionSpeedMultiplier(actor));
  }

  function getSurvivorHitBoostDuration(actor, baseDuration) {
    return Math.round(baseDuration * getSurvivorMultiplier(actor, "hitBoostDuration"));
  }

  function getSurvivorHealPower(actor) {
    return getSurvivorMultiplier(actor, "healPower") * getSurvivorInteractionSpeedMultiplier(actor) * getSoulMarkHealPowerMultiplier(actor);
  }

  function getSoulMarkHealPowerMultiplier(actor) {
    return getSoulMarks(actor) >= 2 ? SOUL_MARK_HEAL_POWER_MULTIPLIER : 1;
  }

  function getRepairSpeedMultiplier(actor) {
    const soulSpeed = getSoulMarks(actor) >= 1 ? 1 / SOUL_MARK_REPAIR_SLOWDOWN : 1;
    const actionSpeed = getSurvivorInteractionSpeedMultiplier(actor) * soulSpeed;
    if (isLanternKeeper() && distanceBetween(actor, hunter) <= LANTERN_AURA_RANGE) {
      return LANTERN_REPAIR_SLOWDOWN * actionSpeed;
    }
    return actionSpeed;
  }

  function getSurvivorInteractionSpeedMultiplier(actor, now = performance.now()) {
    return getTwinSurvivorActionSpeedMultiplier(actor, now) * getPeeperInteractionSpeedMultiplier(actor, now);
  }

  function getPeeperInteractionSpeedMultiplier(actor, now = performance.now()) {
    if (!actor || assistPeeperWards.length === 0) return 1;
    return assistPeeperWards.some((ward) => now < ward.until && distanceBetween(actor, ward) <= ASSIST_PEEPER_RANGE)
      ? ASSIST_PEEPER_INTERACTION_SPEED
      : 1;
  }

  function getTwinSurvivorActionSpeedMultiplier(actor, now = performance.now()) {
    if (!actor || !isTwinSword()) return 1;
    if (hunter.twinTimePower && hunter.twinTimePower.kind === "survivor" && now < hunter.twinTimePower.until) {
      return 1 / hunter.twinTimePower.factor;
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
    if (isInfiniteSawboneMode()) return 0;
    if (canUseShortSaw(now)) return 0;
    return Math.max(0, (hunter.nextSawDashAt || 0) - now);
  }

  function getSawAttackLockoutLeft(now) {
    return Math.max(0, (hunter.sawAttackLockedUntil || 0) - now);
  }

  function getFencerLungeCooldownLeft(actor, now) {
    return Math.max(0, (actor.nextFencerLungeAt || 0) - now);
  }

  function getFlywheelCooldownLeft(actor, now) {
    return Math.max(0, (actor.nextFlywheelAt || 0) - now);
  }

  function getMedicAdrenalineCooldownLeft(actor, now) {
    return Math.max(0, (actor.nextMedicAdrenalineAt || 0) - now);
  }

  function getGeneralRideCooldownLeft(actor, now) {
    return Math.max(0, (actor.nextGeneralRideAt || 0) - now);
  }

  function getGeneralWhipCooldownLeft(actor, now) {
    return Math.max(0, (actor.nextGeneralWhipAt || 0) - now);
  }

  function isGeneralRiding(actor, now = performance.now()) {
    return Boolean(isGeneral(actor) && now < (actor.generalRideUntil || 0));
  }

  function getGeneralRideSecondsLeft(actor, now = performance.now()) {
    return Math.max(0, Math.ceil(((actor && actor.generalRideUntil || 0) - now) / 1000));
  }

  function canUseGeneralSkill(actor, now) {
    return matchStarted &&
      isGeneral(actor) &&
      !actor.action &&
      !actor.escaped &&
      (actor.state === "healthy" || actor.state === "injured") &&
      (isGeneralRiding(actor, now) ? getGeneralWhipCooldownLeft(actor, now) <= 0 : getGeneralRideCooldownLeft(actor, now) <= 0);
  }

  function useGeneralSkill(actor, now) {
    if (!canUseGeneralSkill(actor, now)) return false;
    if (isGeneralRiding(actor, now)) return whipGeneralHorse(actor, now);
    return startGeneralRide(actor, now);
  }

  function startGeneralRide(actor, now) {
    actor.generalRideUntil = now + GENERAL_RIDE_DURATION;
    actor.generalRideWhips = 0;
    actor.nextGeneralWhipAt = now;
    showAssistAlert("骑马", now, 900);
    return true;
  }

  function whipGeneralHorse(actor, now) {
    actor.generalRideWhips = (actor.generalRideWhips || 0) + 1;
    actor.nextGeneralWhipAt = now + GENERAL_WHIP_COOLDOWN;
    showAssistAlert(`鞭策 +${actor.generalRideWhips * 5}%`, now, 760);
    return true;
  }

  function finishGeneralRide(actor, now, reason = "timeout") {
    if (!actor || !isGeneral(actor) || !actor.generalRideUntil) return false;
    actor.generalRideUntil = 0;
    actor.generalRideWhips = 0;
    actor.nextGeneralWhipAt = 0;
    actor.nextGeneralRideAt = now + GENERAL_RIDE_COOLDOWN;
    if (reason === "hit") showAssistAlert("落马免伤", now, 900);
    return true;
  }

  function canUseMedicAdrenaline(actor, now) {
    return matchStarted &&
      isMedic(actor) &&
      !actor.action &&
      !actor.escaped &&
      (actor.state === "healthy" || actor.state === "injured") &&
      getMedicAdrenalineCooldownLeft(actor, now) <= 0;
  }

  function useMedicAdrenaline(actor, now) {
    if (!canUseMedicAdrenaline(actor, now)) return false;
    actor.medicAdrenalineUntil = now + MEDIC_ADRENALINE_DURATION;
    actor.medicAdrenalinePendingDamage = 0;
    actor.nextMedicAdrenalineAt = now + MEDIC_ADRENALINE_COOLDOWN;
    showAssistAlert("肾上腺素", now, 900);
    return true;
  }

  function canStartFencerLunge(actor, now) {
    return matchStarted &&
      selectedRole === PLAYER_ROLE.survivor &&
      actor === player &&
      isFencer(actor) &&
      !actor.action &&
      !actor.escaped &&
      (actor.state === "healthy" || actor.state === "injured") &&
      getFencerLungeCooldownLeft(actor, now) <= 0;
  }

  function startFencerLunge(actor, now) {
    if (!canStartFencerLunge(actor, now)) return false;
    actor.fencerLungePreparing = false;
    actor.fencerLungePreparingAt = 0;
    actor.action = {
      kind: "fencerLunge",
      start: now,
      until: now + FENCER_LUNGE_DURATION,
      lastUpdate: now,
      angle: actor.angle || 0,
      distance: 0,
      turned: false,
      hitHunter: false
    };
    actor.nextFencerLungeAt = now + FENCER_LUNGE_COOLDOWN;
    actor.fencerLastSprintAngle = null;
    showAssistAlert("突刺", now, 900);
    return true;
  }

  function prepareFencerLunge(actor, now) {
    if (!canStartFencerLunge(actor, now)) return false;
    actor.fencerLungePreparing = true;
    actor.fencerLungePreparingAt = now;
    showAssistAlert("突刺准备", now, 650);
    return true;
  }

  function releaseFencerLunge(actor, now) {
    if (!actor || !actor.fencerLungePreparing) return false;
    actor.fencerLungePreparing = false;
    actor.fencerLungePreparingAt = 0;
    return startFencerLunge(actor, now);
  }

  function cancelFencerLungePreparation(actor) {
    if (!actor) return;
    actor.fencerLungePreparing = false;
    actor.fencerLungePreparingAt = 0;
  }

  function canStartFlywheel(actor, now) {
    return matchStarted &&
      hasSurvivorBadge(actor, "flywheel") &&
      !actor.action &&
      !actor.escaped &&
      (actor.state === "healthy" || actor.state === "injured") &&
      getFlywheelCooldownLeft(actor, now) <= 0;
  }

  function startFlywheel(actor, now) {
    if (!canStartFlywheel(actor, now)) return false;
    actor.action = {
      kind: "flywheelDash",
      start: now,
      until: now + FLYWHEEL_DURATION,
      lastUpdate: now,
      angle: actor.angle || 0,
      distance: 0
    };
    actor.nextFlywheelAt = now + FLYWHEEL_COOLDOWN;
    showAssistAlert("飞轮效应", now, 850);
    return true;
  }

  function turnFencerLunge(actor, direction) {
    const action = actor && actor.action;
    if (!action || action.kind !== "fencerLunge" || action.turned) return false;
    action.angle += direction * FENCER_LUNGE_TURN_ANGLE;
    action.turned = true;
    actor.angle = action.angle;
    showAssistAlert(direction < 0 ? "左变向" : "右变向", performance.now(), 650);
    return true;
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

  function getPerfumeCooldownLeft(actor, now) {
    return Math.max(0, (actor.nextPerfumeMistAt || 0) - now);
  }

  function canUsePerfumeMist(actor, now) {
    return Boolean(
      isPerfumer(actor) &&
      (actor.state === "healthy" || actor.state === "injured") &&
      !actor.action &&
      !actor.escaped &&
      now >= (actor.nextPerfumeMistAt || 0)
    );
  }

  function hasPerfumeUltimate(actor) {
    return (actor.perfumeUltimateCharges || 0) >= PERFUME_ULTIMATE_CHARGES;
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
      !actor.escaped &&
      getStitchPackCooldownLeft(actor) <= 0;
  }

  function getStitchPackCooldownLeft(actor, now = performance.now()) {
    return Math.max(0, (actor && actor.nextStitchPackAt || 0) - now);
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
      !isHunterDisplacementBlocked(now) &&
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
      !isHunterDisplacementBlocked(now) &&
      (isInfiniteSawboneMode() || canUseShortSaw(now) || now >= (hunter.nextSawDashAt || 0));
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

    if (miniMap && miniCtx) {
      const miniBox = miniMap.getBoundingClientRect();
      miniMap.width = Math.floor(miniBox.width * dpr);
      miniMap.height = Math.floor(miniBox.height * dpr);
      miniCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
  }

  function keyToInput(key, value) {
    const code = key.toLowerCase();
    if (value && selectedRole === PLAYER_ROLE.hunter && hunter.trumpCardSelecting && /^[1-6]$/.test(key)) {
      if (selectTrumpCardAssist(key, performance.now())) return;
    }
    if (value && selectedRole === PLAYER_ROLE.hunter && code === "m") {
      if (startTrumpCardSelection(performance.now())) return;
    }
    if (selectedRole === PLAYER_ROLE.hunter && isTwinSword()) {
      if (value && code === "t") toggleTwinTimeMode();
      if (value && code === "g") activateTwinDualCast(performance.now());
      if (code === "e") {
        if (hunter.twinForm === TWIN_FORM_QINGTIAN) {
          if (value) castTwinPrimaryInstant(performance.now());
        } else if (value) {
          startTwinAim("primary", performance.now());
        } else {
          finishTwinAim(performance.now());
        }
        return;
      }
      if (code === "r") {
        if (value) startTwinAim("secondary", performance.now());
        else finishTwinAim(performance.now());
        return;
      }
      if (code === SHADOW_KEY) {
        if (value) startTwinAim("sword", performance.now());
        else finishTwinAim(performance.now());
        return;
      }
    } else if (value && code === "r" && selectedRole) {
      restartCurrentMatch();
    }
    if (
      value &&
      selectedRole === PLAYER_ROLE.survivor &&
      player.action &&
      player.action.kind === "fencerLunge" &&
      (code === "a" || code === "d" || key === "ArrowLeft" || key === "ArrowRight")
    ) {
      turnFencerLunge(player, code === "a" || key === "ArrowLeft" ? -1 : 1);
    }
    if (value && key === " ") handlePlayerInteraction(performance.now());
    if (value && code === "e") handlePlayerUse(performance.now());
    if (code === "l" && (value || selectedRole === PLAYER_ROLE.survivor)) {
      const now = performance.now();
      if (selectedRole === PLAYER_ROLE.survivor) {
        if (!value) startFlywheel(player, now);
      } else {
        handleHunterAssist(now);
      }
    }
    if (code === ATTACK_KEY && selectedRole === PLAYER_ROLE.hunter) {
      const now = performance.now();
      if (value) startHunterAttackPress(now);
      else releaseHunterAttackPress(now);
    }
    if (value && code === SHADOW_KEY) handlePlayerShadowSkill(performance.now());
    if (code === SKILL_KEY) {
      if (selectedRole === PLAYER_ROLE.survivor && isFencer(player)) {
        if (value) prepareFencerLunge(player, performance.now());
        else releaseFencerLunge(player, performance.now());
      } else if (selectedRole === PLAYER_ROLE.survivor && isMessenger(player)) {
        if (value) startPackageAim(player, performance.now());
        else finishPackageAim(performance.now());
      } else if (selectedRole === PLAYER_ROLE.survivor && isApprentice(player)) {
        if (value) handlePlayerSkill(performance.now());
      } else if (selectedRole === PLAYER_ROLE.hunter && isSawbone()) {
        if (value) handlePlayerSkill(performance.now());
      } else if (selectedRole === PLAYER_ROLE.hunter && isTwinSword()) {
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
    if (selectedRole === PLAYER_ROLE.hunter) {
      if (activePatroller) return moveControlledPatroller(dt, performance.now());
      return moveControlledHunter(dt);
    }
    return moveControlledSurvivor(dt);
  }

  function moveControlledPatroller(dt, now) {
    if (!activePatroller || now >= activePatroller.until) {
      activePatroller = null;
      return;
    }
    hunter.vx = 0;
    hunter.vy = 0;
    const move = getMoveVector();
    const dx = move.x * ASSIST_PATROLLER_SPEED * dt;
    const dy = move.y * ASSIST_PATROLLER_SPEED * dt;
    if (move.length > 0.1) activePatroller.angle = Math.atan2(move.y, move.x);
    moveActorSmart(activePatroller, dx, dy);
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
    maybeAddFencerStrideMark(player, move, now);
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
    updateAIFinalCipherGuard(aiSurvivors, now);
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
    if (isHatchOpen() && (survivor.state === "healthy" || survivor.state === "injured")) {
      if (survivor.action && survivor.action.kind === "escaping" && survivor.action.hatch) {
        if (updateActorAction(survivor, now)) return;
      }
      cancelSurvivorAction(survivor);
      if (updateAIHatchObjective(survivor, dt, now)) return;
    }
    if (updateActorAction(survivor, now)) return;

    if (survivor.state === "downed") {
      if (isBeingPickedUp(survivor)) {
        survivor.vx = 0;
        survivor.vy = 0;
        return;
      }
      if (maybeUseAIClockmakerSkill(survivor, hunterDistance, now)) return;
      if (updateAIDownedHatchCrawl(survivor, dt, now)) return;
      startSelfHealing(survivor, now);
      survivor.vx = 0;
      survivor.vy = 0;
      return;
    }

    if (isKiteSimulatorMode() && survivor !== player) {
      if (updateAIObjective(survivor, dt, now, hunterDistance)) return;
      moveAISurvivorWander(survivor, dt, now);
      return;
    }

    if (maybeUseAISurvivorSkill(survivor, hunterDistance, now)) return;
    maybeThrowAIPackage(survivor, hunterDistance, now);
    if (maybeUseAIStitchPack(survivor, hunterDistance, now)) return;

    if (updateAIFinalCipherGuardObjective(survivor, dt, now)) return;

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

  function maybeUseAISurvivorSkill(survivor, hunterDistance, now) {
    if (maybeUseAIFlywheel(survivor, hunterDistance, now)) return true;
    if (maybeUseAIGeneralSkill(survivor, hunterDistance, now)) return true;
    if (maybeUseAIMedicSkill(survivor, hunterDistance, now)) return true;
    if (maybeUseAIClockmakerSkill(survivor, hunterDistance, now)) return true;
    if (maybeUseAIActorSkill(survivor, hunterDistance, now)) return true;
    if (maybeUseAIPerfumerSkill(survivor, hunterDistance, now)) return true;
    return false;
  }

  function maybeUseAIFlywheel(survivor, hunterDistance, now) {
    if (!canStartFlywheel(survivor, now)) return false;
    const pressured = hunter.target === survivor || hunterDistance <= hunter.attackRange + survivor.radius + 80;
    if (!pressured || hunterDistance > 260) return false;
    const angle = Math.atan2(survivor.y - hunter.y, survivor.x - hunter.x);
    if (Number.isFinite(angle)) survivor.angle = angle;
    return startFlywheel(survivor, now);
  }

  function maybeUseAIMedicSkill(survivor, hunterDistance, now) {
    if (!canUseMedicAdrenaline(survivor, now)) return false;
    const pressured = hunter.target === survivor || hunterDistance <= hunter.attackRange + survivor.radius + 100;
    if (!pressured || hunterDistance > 320) return false;
    return useMedicAdrenaline(survivor, now);
  }

  function maybeUseAIGeneralSkill(survivor, hunterDistance, now) {
    if (!isGeneral(survivor) || !canUseGeneralSkill(survivor, now)) return false;
    if (isGeneralRiding(survivor, now)) {
      return whipGeneralHorse(survivor, now);
    }
    const pressured = hunter.target === survivor || hunterDistance <= hunter.attackRange + survivor.radius + 140;
    if (!pressured || hunterDistance > 420) return false;
    return startGeneralRide(survivor, now);
  }

  function maybeUseAIClockmakerSkill(survivor, hunterDistance, now) {
    if (!isClockmaker(survivor)) return false;
    const pressured = hunter.target === survivor || hunterDistance < 360;
    if (canActivateTimeRewind(survivor, now) && (survivor.state === "downed" || survivor.state === "injured" || hunterDistance < 240)) {
      activateTimeRewind(survivor, now);
      return true;
    }
    if (pressured && canPlaceTimeDevice(survivor, now)) {
      placeTimeDevice(survivor, now);
      return true;
    }
    return false;
  }

  function maybeUseAIActorSkill(survivor, hunterDistance, now) {
    if (!canUseMagicShow(survivor, now)) return false;
    const seatedTarget = findNearestSeatedSurvivor(survivor, Infinity);
    if (seatedTarget && hunterDistance > 180) {
      survivor.magicShowMode = "rescue";
      return performMagicShow(survivor, now);
    }
    return false;
  }

  function maybeUseAIPerfumerSkill(survivor, hunterDistance, now) {
    if (!canUsePerfumeMist(survivor, now)) return false;
    if (hunter.target !== survivor && hunterDistance >= PERFUMER_SENSE_NEAR_RANGE) return false;
    usePerfumeSkill(survivor, now);
    return true;
  }

  function maybeUseAIStitchPack(survivor, hunterDistance, now) {
    if (!canPlaceStitchPack(survivor)) return false;
    if (hunter.target === survivor || hunterDistance < 260) return false;
    if (canReceiveStitchPack(survivor)) {
      placeStitchPack(survivor, now, survivor);
      return true;
    }
    const target = findNearestStitchPackTarget(survivor, 280);
    if (!target) return false;
    placeStitchPack(survivor, now, target);
    return true;
  }

  function updateAIFinalCipherGuardObjective(survivor, dt, now) {
    if (!finalCipherGuard || finalCipherGuard.survivor !== survivor) return false;
    const point = finalCipherGuard.point;
    if (!point || point.completed || !isFinalCipherPoint(point)) return false;

    survivor.kiteDecision = null;
    survivor.objectiveDecision = { kind: "finalCipherGuard", target: point, until: now + 900 };
    survivor.wanderTarget = null;

    if (shouldPopPrimedFinalCipher(now)) {
      if (distanceBetween(survivor, point) < 96) {
        startRepair(survivor, point, now);
        return true;
      }
      const moved = moveActorToPoint(survivor, point.x, point.y, survivor.speed * 0.76, dt, now);
      if (moved < 0.5 && now > survivor.repathAt - 120) survivor.path = [];
      return true;
    }

    point.progress = Math.min(point.progress || 0, FINAL_CIPHER_PRIME_PROGRESS);
    if (survivor.action && survivor.action.kind === "repairing") {
      cancelRepair(survivor.action);
      survivor.action = null;
    }

    if (distanceBetween(survivor, point) > FINAL_CIPHER_GUARD_RANGE) {
      const moved = moveActorToPoint(survivor, point.x, point.y, survivor.speed * 0.68, dt, now);
      if (moved < 0.5 && now > survivor.repathAt - 120) survivor.path = [];
      return true;
    }

    survivor.vx = 0;
    survivor.vy = 0;
    return true;
  }

  function updateAIFinalCipherGuard(aiSurvivors, now) {
    const point = getPrimedFinalCipherPoint();
    if (!point) {
      finalCipherGuard = null;
      return;
    }

    if (
      finalCipherGuard &&
      finalCipherGuard.point === point &&
      isValidFinalCipherGuard(finalCipherGuard.survivor, point, now, aiSurvivors)
    ) {
      return;
    }

    const candidates = aiSurvivors.filter((survivor) => isValidFinalCipherGuard(survivor, point, now, aiSurvivors));
    candidates.sort((a, b) => getFinalCipherGuardScore(a, point) - getFinalCipherGuardScore(b, point));
    finalCipherGuard = candidates.length ? { point, survivor: candidates[0] } : null;
  }

  function getPrimedFinalCipherPoint() {
    if (getCompletedRepairCount() !== REPAIR_REQUIRED - 1) return null;
    return repairPoints
      .filter((point) => !point.completed && (point.progress || 0) >= FINAL_CIPHER_PRIME_PROGRESS)
      .sort((a, b) => (b.progress || 0) - (a.progress || 0))[0] || null;
  }

  function isValidFinalCipherGuard(survivor, point, now, aiSurvivors) {
    if (!survivor || survivor.kind !== "ai" || !aiSurvivors.includes(survivor)) return false;
    if (survivor.escaped || survivor.state !== "healthy" && survivor.state !== "injured") return false;
    if (hunter.target === survivor && distanceBetween(survivor, hunter) < 460) return false;
    if (!survivor.action) return true;
    return survivor.action.kind === "repairing" && survivor.action.point === point;
  }

  function getFinalCipherGuardScore(survivor, point) {
    const distance = distanceBetween(survivor, point);
    const hunterPressure = Math.max(0, 440 - distanceBetween(hunter, survivor));
    const injuredPenalty = survivor.state === "injured" ? 80 : 0;
    return distance + hunterPressure * 0.55 + injuredPenalty;
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
    if (isKiteSimulatorMode() && survivor !== player) {
      if (areExitsPowered()) return updateAIEscape(survivor, dt, now);
      return updateAIRepair(survivor, dt, now);
    }

    if (isPracticeTargetMode()) {
      survivor.objectiveDecision = null;
      return false;
    }

    if (isHatchOpen()) {
      return updateAIHatchObjective(survivor, dt, now);
    }

    if (!isAISafeForObjective(survivor, hunterDistance)) {
      survivor.objectiveDecision = null;
      return false;
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

    if (maybeUseAIChairRescueSkill(survivor, target, now, dt)) return true;

    if (distanceBetween(survivor, target.chair) < 92 && shouldAIStartChairRescueNow(survivor, target, now)) {
      startRescue(survivor, target, now);
      return true;
    }

    const standPoint = findNearestSafePosition(target.chair.x + 52, target.chair.y + 38, survivor.radius);
    const moved = moveActorToPoint(survivor, standPoint.x, standPoint.y, survivor.speed * 0.95, dt, now);
    if (moved < 0.5 && now > survivor.repathAt - 120) survivor.path = [];
    return true;
  }

  function maybeUseAIChairRescueSkill(survivor, target, now, dt = 0) {
    if (!target || !target.chair || !isHunterCampingChair(target, now)) return false;
    if (canUseMagicShow(survivor, now)) {
      const hunterDistance = distanceBetween(survivor, hunter);
      if (hunterDistance < 520) {
        const safe = getAIRescueSkillSafePoint(survivor, target);
        moveActorToPoint(survivor, safe.x, safe.y, survivor.speed * 0.95, dt, now);
        survivor.nextInteractAt = now + 220;
        return true;
      }
      survivor.magicShowMode = "rescue";
      return performMagicShow(survivor, now);
    }
    if (canThrowPackage(survivor, now) && hasWalkableLine(survivor.x, survivor.y, hunter.x, hunter.y, PACKAGE_RADIUS)) {
      throwPackage(survivor, Math.atan2(hunter.y - survivor.y, hunter.x - survivor.x), now);
      survivor.nextInteractAt = now + 520;
      return true;
    }
    if (canUsePerfumeMist(survivor, now)) {
      usePerfumeSkill(survivor, now);
      survivor.nextInteractAt = now + 520;
      return true;
    }
    if (canUseMedicAdrenaline(survivor, now)) {
      useMedicAdrenaline(survivor, now);
      survivor.nextInteractAt = now + 520;
      return true;
    }
    if (canUseGeneralSkill(survivor, now)) {
      useGeneralSkill(survivor, now);
      survivor.nextInteractAt = now + 520;
      return true;
    }
    if (canPlaceTimeDevice(survivor, now) && distanceBetween(survivor, target.chair) < 220) {
      placeTimeDevice(survivor, now);
      survivor.nextInteractAt = now + 520;
      return true;
    }
    return false;
  }

  function getAIRescueSkillSafePoint(survivor, target) {
    const awayFromHunter = normalizeVector(survivor.x - hunter.x, survivor.y - hunter.y);
    const fallback = normalizeVector(target.chair.x - hunter.x, target.chair.y - hunter.y);
    const direction = awayFromHunter.x || awayFromHunter.y ? awayFromHunter : fallback;
    const x = survivor.x + direction.x * 320;
    const y = survivor.y + direction.y * 320;
    return findNearestSafePosition(x, y, survivor.radius);
  }

  function isHunterCampingChair(target, now = performance.now()) {
    if (!target || !target.chair) return false;
    if (now < (hunter.wipeUntil || 0) || now < (hunter.stunnedUntil || 0)) return false;
    return distanceBetween(hunter, target.chair) < AI_RESCUE_HUNTER_NEAR_CHAIR;
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
    const rescuerChairDistance = target && target.chair ? distanceBetween(survivor, target.chair) : Infinity;
    const urgent = target && target.chairProgress >= getAIRescueDangerProgress(target);
    const committedToRescue = rescuerChairDistance < 150;
    const hasRescueTool = hasReadyAIChairRescueTool(survivor, target);
    if (hunterDistance < 220 && !urgent && !committedToRescue && !hasRescueTool) return false;
    if (chairHunterDistance < 235 && !urgent && !committedToRescue && !hasRescueTool) return false;
    return true;
  }

  function hasReadyAIChairRescueTool(survivor, target, now = performance.now()) {
    if (!target || !target.chair || !isHunterCampingChair(target, now)) return false;
    return canThrowPackage(survivor, now) ||
      canUsePerfumeMist(survivor, now) ||
      canUseMedicAdrenaline(survivor, now) ||
      canUseGeneralSkill(survivor, now) ||
      canUseMagicShow(survivor, now) ||
      canPlaceTimeDevice(survivor, now) ||
      hasActiveAIRescueProtection(survivor, now);
  }

  function shouldAIStartChairRescueNow(rescuer, target, now) {
    if (!target || !target.chair) return false;
    const progress = target.chairProgress || 0;
    const chairHunterDistance = distanceBetween(hunter, target.chair);
    const hunterNearby = chairHunterDistance < AI_RESCUE_HUNTER_NEAR_CHAIR;
    if (willChairEliminateBeforeRescueCompletes(rescuer, target)) return true;
    if (!hunterNearby) return progress >= getAIRescueTargetProgress(target);
    if (now < (hunter.wipeUntil || 0) || now < (hunter.stunnedUntil || 0)) return true;
    if (hasActiveAIRescueProtection(rescuer, now)) return true;
    if (hunter.target === rescuer && distanceBetween(hunter, rescuer) < 160 && progress < getAIRescueDangerProgress(target)) return false;
    return progress >= getAIRescueDangerProgress(target);
  }

  function hasActiveAIRescueProtection(rescuer, now = performance.now()) {
    return hasMedicShield(rescuer, now) ||
      isBorrowedTimeProtected(rescuer, now) ||
      now < (rescuer.medicAdrenalineUntil || 0) ||
      Boolean(getActivePerfumeMistForActor(hunter, now));
  }

  function willChairEliminateBeforeRescueCompletes(rescuer, target) {
    if (!target || target.state !== "seated") return false;
    const remaining = 1 - (target.chairProgress || 0);
    const rescueProgressCost = getSurvivorRescueDuration(rescuer) / CHAIR_ELIMINATION_DURATION;
    return remaining <= rescueProgressCost + 0.015;
  }

  function getAIRescueTargetProgress(target) {
    return target && (target.chairProgress || 0) >= 0.5 ? AI_RESCUE_SECOND_CHAIR_TARGET : AI_RESCUE_FIRST_CHAIR_TARGET;
  }

  function getAIRescueDangerProgress(target) {
    return target && (target.chairProgress || 0) >= 0.5 ? AI_RESCUE_SECOND_CHAIR_DANGER : AI_RESCUE_FIRST_CHAIR_DANGER;
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

    if (shouldHoldFinalCipherPoint(point, now)) {
      if (!finalCipherGuard || finalCipherGuard.survivor !== survivor) return false;
      point.progress = Math.min(point.progress || 0, FINAL_CIPHER_PRIME_PROGRESS);
      if (survivor.action && survivor.action.kind === "repairing") {
        cancelRepair(survivor.action);
        survivor.action = null;
      }
      survivor.vx = 0;
      survivor.vy = 0;
      return true;
    }

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

  function updateAIHatchObjective(survivor, dt, now) {
    if (!isHatchOpen()) return false;
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

  function updateAIHatchEscape(survivor, dt, now) {
    return isHatchOpen() && updateAIHatchObjective(survivor, dt, now);
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
      if (shouldHoldFinalCipherPoint(point, now) && (!finalCipherGuard || finalCipherGuard.survivor !== survivor)) return;
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

    const openedGate = getBestAIGateTarget(survivor, exitGates.filter((gate) => gate.opened));
    if (openedGate) {
      survivor.objectiveDecision = { kind: "escape", target: openedGate, until: now + 1800 };
      return openedGate;
    }

    const unopenedGate = getBestAIGateTarget(survivor, exitGates.filter((gate) => !gate.opened));
    survivor.objectiveDecision = unopenedGate ? { kind: "escape", target: unopenedGate, until: now + 1800 } : null;
    return unopenedGate;
  }

  function getBestAIGateTarget(survivor, gates) {
    let best = null;
    let bestScore = Infinity;
    gates.forEach((gate) => {
      const distance = distanceBetween(survivor, gate);
      const hunterPenalty = Math.max(0, 620 - distanceBetween(hunter, gate));
      const score = distance + hunterPenalty * 0.65;
      if (score < bestScore) {
        best = gate;
        bestScore = score;
      }
    });

    return best;
  }

  function shouldKeepObjectiveDecision(survivor, now, kind) {
    const decision = survivor.objectiveDecision;
    if (!decision || decision.kind !== kind || now >= decision.until) return false;
    if (kind === "repair") return !decision.target.completed && !isRepairingPoint(survivor, decision.target);
    if (kind === "escape" && decision.target && !decision.target.opened && exitGates.some((gate) => gate.opened)) return false;
    return areExitsPowered();
  }

  function isFinalCipherPoint(point) {
    return point && !point.completed && getCompletedRepairCount() === REPAIR_REQUIRED - 1;
  }

  function shouldHoldFinalCipherPoint(point, now = performance.now()) {
    return isFinalCipherPoint(point) &&
      (point.progress || 0) >= FINAL_CIPHER_PRIME_PROGRESS &&
      !shouldPopPrimedFinalCipher(now);
  }

  function shouldCompletePrimedFinalCipher(actor, now = performance.now()) {
    return Boolean(actor && actor.kind === "player") || shouldPopPrimedFinalCipher(now);
  }

  function shouldPopPrimedFinalCipher(now = performance.now()) {
    return getSurvivors().some((survivor) => {
      return !survivor.escaped &&
        survivor.state === "downed" &&
        hasSurvivorBadge(survivor, "adrenaline") &&
        !survivor.adrenalineTriggered;
    });
  }

  function pauseAIRepairers(point) {
    point.workers.forEach((worker) => {
      if (!worker || worker.kind !== "ai" || !worker.action || worker.action.kind !== "repairing") return;
      cancelRepair(worker.action);
      worker.action = null;
      worker.objectiveDecision = null;
      worker.vx = 0;
      worker.vy = 0;
    });
    point.workers = getActiveRepairers(point);
  }

  function cancelRepairPointWorkers(point) {
    point.workers.forEach((worker) => {
      if (!worker || !worker.action || worker.action.kind !== "repairing" || worker.action.point !== point) return;
      worker.action = null;
      worker.objectiveDecision = null;
      worker.vx = 0;
      worker.vy = 0;
    });
    point.workers = [];
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
    return moveActorSmart(actor, dx, dy);
  }

  function moveActorSimple(actor, dx, dy) {
    return moveActorSmart(actor, dx, dy);
  }

  function moveActorPhasing(actor, dx, dy) {
    const beforeX = actor.x;
    const beforeY = actor.y;
    actor.x = actorClamp(actor.x + dx, 70, world.width - 70);
    actor.y = actorClamp(actor.y + dy, 70, world.height - 70);
    return Math.hypot(actor.x - beforeX, actor.y - beforeY);
  }

  function moveActorSmart(actor, dx, dy) {
    if (actor === hunter && isSoulSiphonPhaseMove(dx, dy)) return moveActorPhasing(actor, dx, dy);
    const beforeX = actor.x;
    const beforeY = actor.y;
    const distance = Math.hypot(dx, dy);
    if (distance < 0.001) return 0;
    const steps = Math.max(1, Math.ceil(distance / MOVE_COLLISION_STEP));
    const stepDx = dx / steps;
    const stepDy = dy / steps;

    for (let step = 0; step < steps; step += 1) {
      moveActorStep(actor, stepDx, stepDy);
    }

    return Math.hypot(actor.x - beforeX, actor.y - beforeY);
  }

  function moveActorStep(actor, dx, dy) {
    const beforeX = actor.x;
    const beforeY = actor.y;
    if (!collides(actor.x + dx, actor.y + dy, actor.radius)) {
      actor.x += dx;
      actor.y += dy;
      resolveWallCornerOverlap(actor);
      return Math.hypot(actor.x - beforeX, actor.y - beforeY);
    }

    const primaryFirst = Math.abs(dx) >= Math.abs(dy);
    const attempts = primaryFirst
      ? [[dx, 0], [0, dy], [dx * 0.72, 0], [0, dy * 0.72], [dx * 0.42, 0], [0, dy * 0.42]]
      : [[0, dy], [dx, 0], [0, dy * 0.72], [dx * 0.72, 0], [0, dy * 0.42], [dx * 0.42, 0]];

    for (const [tryDx, tryDy] of attempts) {
      if (!collides(actor.x + tryDx, actor.y + tryDy, actor.radius)) {
        actor.x += tryDx;
        actor.y += tryDy;
        resolveWallCornerOverlap(actor);
        return Math.hypot(actor.x - beforeX, actor.y - beforeY);
      }
    }

    actor.x += dx;
    actor.y += dy;
    if (resolveWallCornerOverlap(actor)) {
      return Math.hypot(actor.x - beforeX, actor.y - beforeY);
    }

    actor.x = beforeX;
    actor.y = beforeY;
    return 0;
  }

  function resolveWallCornerOverlap(actor) {
    const startX = actor.x;
    const startY = actor.y;
    let changed = false;

    for (let pass = 0; pass < 4; pass += 1) {
      let pushedThisPass = false;
      for (const box of getCollisionRects()) {
        const push = getCircleRectPush(actor.x, actor.y, actor.radius, box);
        if (!push) continue;
        actor.x += push.x;
        actor.y += push.y;
        changed = true;
        pushedThisPass = true;
      }
      if (!pushedThisPass) break;
    }

    actor.x = actorClamp(actor.x, 70, world.width - 70);
    actor.y = actorClamp(actor.y, 70, world.height - 70);
    if (collides(actor.x, actor.y, actor.radius)) {
      actor.x = startX;
      actor.y = startY;
      return false;
    }
    return changed;
  }

  function getCircleRectPush(cx, cy, radius, box) {
    const closestX = Math.max(box.x, Math.min(cx, box.x + box.w));
    const closestY = Math.max(box.y, Math.min(cy, box.y + box.h));
    const dx = cx - closestX;
    const dy = cy - closestY;
    const distance = Math.hypot(dx, dy);

    if (distance > 0 && distance < radius) {
      const depth = radius - distance + COLLISION_PUSH_EPSILON;
      return { x: dx / distance * depth, y: dy / distance * depth };
    }
    if (distance >= radius) return null;

    const toLeft = Math.abs(cx - box.x);
    const toRight = Math.abs(box.x + box.w - cx);
    const toTop = Math.abs(cy - box.y);
    const toBottom = Math.abs(box.y + box.h - cy);
    const nearest = Math.min(toLeft, toRight, toTop, toBottom);
    if (nearest === toLeft) return { x: -(radius + toLeft + COLLISION_PUSH_EPSILON), y: 0 };
    if (nearest === toRight) return { x: radius + toRight + COLLISION_PUSH_EPSILON, y: 0 };
    if (nearest === toTop) return { x: 0, y: -(radius + toTop + COLLISION_PUSH_EPSILON) };
    return { x: 0, y: radius + toBottom + COLLISION_PUSH_EPSILON };
  }

  function moveActorToPoint(actor, targetX, targetY, speed, dt, now) {
    const directDistance = Math.hypot(targetX - actor.x, targetY - actor.y);
    if (directDistance < 4) {
      actor.vx = 0;
      actor.vy = 0;
      return 0;
    }

    if (actor === hunter && isSoulSiphonPhasing(now)) {
      const toTarget = normalizeVector(targetX - actor.x, targetY - actor.y);
      const step = Math.min(speed * dt, Math.max(0, directDistance - 3));
      const dx = toTarget.x * step;
      const dy = toTarget.y * step;
      const beforeX = actor.x;
      const beforeY = actor.y;
      const moved = moveActorSmart(actor, dx, dy);
      if (moved > 0.01) {
        actor.angle = Math.atan2(actor.y - beforeY, actor.x - beforeX);
        actor.vx = (actor.x - beforeX) / Math.max(dt, 0.001);
        actor.vy = (actor.y - beforeY) / Math.max(dt, 0.001);
      } else {
        actor.vx = 0;
        actor.vy = 0;
      }
      return moved;
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
      if (isHunterInPerfumeMist(now)) {
        updateAIHunterBlindInPerfume(dt, now);
        return;
      }
      hunter.status = "allDowned";
      return;
    }
    hunter.lastKnownTargetX = target.x;
    hunter.lastKnownTargetY = target.y;

    const toTargetX = target.x - hunter.x;
    const toTargetY = target.y - hunter.y;
    const distance = Math.hypot(toTargetX, toTargetY);
    const canAttack = canHunterAttack(now);

    const desiredAttackAngle = Math.atan2(toTargetY, toTargetX);
    hunter.angle = turnToward(hunter.angle, desiredAttackAngle, hunter.turnSpeed * dt);

    maybeUseAILanternKeeperSkill(target, now, distance);
    if (!isActorDecoyTarget(target) && maybeStartAISawDash(target, now, distance)) return;

    if (isSurvivorInHunterAttackCone(target) && canAttack) {
      startHunterBasicAttackWindup(now);
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
    startHunterBasicAttackWindup(now);
  }

  function startHunterBasicAttackWindup(now) {
    if (!canHunterAttack(now)) return false;
    hunter.status = "attacking";
    hunter.lastAttackHit = false;
    hunter.vx = 0;
    hunter.vy = 0;
    hunter.path = [];
    hunter.pathGoal = null;
    hunter.action = {
      kind: "attackWindup",
      start: now,
      until: now + getHunterAttackWindupDuration(),
      releaseStart: now,
      lastUpdate: now,
      angle: hunter.angle || 0,
      distance: 0,
      lungeDistance: getHunterAttackLungeDistance(),
      balloonAttack: Boolean(hunter.carrying),
      charging: false,
      releasing: true
    };
    chasePulseUntil = now + 180;
    return true;
  }

  function startHunterAttackPress(now) {
    if (!matchStarted || selectedRole !== PLAYER_ROLE.hunter) return;
    if (hunter.assistSkill === "blink" && canUseHunterAssist(now) && !findHunterAttackTarget()) {
      hunter.pendingBlinkAttackUntil = now + ASSIST_BLINK_ATTACK_BUFFER;
      lanternAlert = {
        kind: "assist",
        text: "闪现蓄刀",
        until: now + 900
      };
      return;
    }
    if (!canHunterAttack(now)) return;
    hunter.status = "attacking";
    hunter.lastAttackHit = false;
    hunter.vx = 0;
    hunter.vy = 0;
    hunter.action = {
      kind: "attackWindup",
      start: now,
      until: now + getHunterAttackWindupDuration(),
      lastUpdate: now,
      angle: hunter.angle || 0,
      distance: 0,
      lungeDistance: getHunterAttackLungeDistance(),
      balloonAttack: Boolean(hunter.carrying),
      charging: true,
      releasing: false
    };
    chasePulseUntil = now + 180;
  }

  function releaseHunterAttackPress(now) {
    if (selectedRole !== PLAYER_ROLE.hunter) return;
    const action = hunter.action;
    if (!action || action.kind !== "attackWindup" || !action.charging) return;
    const held = now - action.start;
    if (held < CHARGED_ATTACK_HOLD_THRESHOLD) {
      finishBasicHunterAttackWindup(action, now);
      return;
    }
    finishChargedHunterAttack(action, now, held);
  }

  function finishBasicHunterAttackWindup(action, now) {
    const windupDuration = getHunterAttackWindupDuration();
    action.charging = false;
    action.releasing = true;
    action.releaseStart = action.start;
    action.until = Math.max(now, action.start + windupDuration);
    action.lastUpdate = now;
    action.distance = 0;
    action.angle = hunter.angle || action.angle;
    action.rangeMultiplier = 1;
  }

  function finishChargedHunterAttack(action, now, held) {
    action.charging = false;
    action.releasing = true;
    action.releaseStart = now;
    action.until = now + getHunterAttackWindupDuration();
    action.lastUpdate = now;
    action.distance = 0;
    action.angle = hunter.angle || action.angle;
    action.rangeMultiplier = getChargedAttackRangeMultiplier(held);
  }

  function getChargedAttackRangeMultiplier(held) {
    const capped = Math.max(CHARGED_ATTACK_HOLD_THRESHOLD, Math.min(held, CHARGED_ATTACK_MAX_HOLD));
    const span = Math.max(1, CHARGED_ATTACK_MAX_HOLD - CHARGED_ATTACK_HOLD_THRESHOLD);
    const ratio = (capped - CHARGED_ATTACK_HOLD_THRESHOLD) / span;
    const effectiveRatio = 0.35 + ratio * 0.65;
    return 1 + (CHARGED_ATTACK_RANGE_MULTIPLIER - 1) * effectiveRatio;
  }

  function canUseHunterAssist(now) {
    if (hunter.assistSkill === "excitement") return canUseAssistExcitement(now);
    return matchStarted &&
      selectedRole === PLAYER_ROLE.hunter &&
      Boolean(hunter.assistSkill) &&
      !isInfiniteSawboneMode() &&
      !hunter.action &&
      !hunter.carrying &&
      now >= hunter.stunnedUntil &&
      now >= hunter.wipeUntil &&
      now >= (hunter.sawAttackLockedUntil || 0) &&
      now >= (hunter.nextAssistAt || 0);
  }

  function handleHunterAssist(now) {
    if (hunter.assistSkill === "excitement") {
      useAssistExcitement(now);
      return;
    }
    if (activePatroller) {
      activePatroller = null;
      return;
    }
    if (hunter.assistSkill === "shift" && activeShiftPortals) {
      showAssistAlert("移形门收回", now, 1000);
      finishAssistShift(now);
      return;
    }
    if (!canUseHunterAssist(now)) return;
    if (hunter.assistSkill === "listen") useAssistListen(now);
    else if (hunter.assistSkill === "peeper") useAssistPeeper(now);
    else if (hunter.assistSkill === "patroller") useAssistPatroller(now);
    else if (hunter.assistSkill === "blink") {
      if (isHunterDisplacementBlocked(now)) showAssistAlert("幻香封锁位移", now, 900);
      else useAssistBlink(now);
    } else if (hunter.assistSkill === "shift") {
      if (isHunterDisplacementBlocked(now)) showAssistAlert("幻香封锁位移", now, 900);
      else useAssistShift(now);
    }
  }

  function canUseAssistExcitement(now) {
    if (!matchStarted || selectedRole !== PLAYER_ROLE.hunter || hunter.assistSkill !== "excitement" || isInfiniteSawboneMode()) return false;
    if (hunter.carrying || now < (hunter.nextAssistAt || 0)) return false;
    if (now < (hunter.stunnedUntil || 0)) return true;
    return !hunter.action && now >= (hunter.wipeUntil || 0) && now >= (hunter.sawAttackLockedUntil || 0);
  }

  function setHunterAssistCooldown(now) {
    const config = getHunterAssistConfig();
    hunter.nextAssistAt = now + (config ? config.cooldown : 0);
  }

  function showAssistAlert(text, now, duration = 1300) {
    lanternAlert = {
      kind: "assist",
      text,
      until: now + duration
    };
    chasePulseUntil = now + 300;
  }

  function revealSurvivorByAssist(survivor, now, duration = 3600) {
    survivor.assistRevealUntil = Math.max(survivor.assistRevealUntil || 0, now + duration);
  }

  function useAssistListen(now) {
    let revealed = 0;
    assistListenTargets = [];
    getSurvivors().forEach((survivor) => {
      if (survivor.escaped || survivor.state === "eliminated" || survivor.state === "seated") return;
      if (Math.hypot(survivor.vx || 0, survivor.vy || 0) < ASSIST_LISTEN_MOVE_THRESHOLD) return;
      survivor.listenRevealUntil = now + ASSIST_LISTEN_DURATION;
      assistListenTargets.push({ survivor, until: now + ASSIST_LISTEN_DURATION });
      revealed += 1;
    });
    hunter.assistListenUntil = now + ASSIST_LISTEN_DURATION;
    setHunterAssistCooldown(now);
    trackHunterSkillUseUnlock(now);
    showAssistAlert(revealed > 0 ? `聆听发现 ${revealed} 人` : "聆听无人移动", now);
  }

  function useAssistPeeper(now) {
    assistPeeperWards.push({
      id: assistPeeperId += 1,
      x: hunter.x,
      y: hunter.y,
      radius: 12,
      until: now + ASSIST_PEEPER_DURATION,
      triggered: Object.create(null)
    });
    setHunterAssistCooldown(now);
    trackHunterSkillUseUnlock(now);
    showAssistAlert("插眼", now);
  }

  function useAssistPatroller(now) {
    activePatroller = {
      x: hunter.x,
      y: hunter.y,
      radius: 14,
      angle: hunter.angle,
      until: now + ASSIST_PATROLLER_DURATION
    };
    setHunterAssistCooldown(now);
    trackHunterSkillUseUnlock(now);
    showAssistAlert("巡视者出动", now);
  }

  function useAssistBlink(now) {
    const destination = getBlinkDestination();
    const dx = destination.x - hunter.x;
    const dy = destination.y - hunter.y;
    const distance = Math.hypot(dx, dy);
    if (distance > 8) hunter.angle = Math.atan2(dy, dx);
    const blinked = moveActorSmart(
      hunter,
      dx,
      dy
    );
    hunter.vx = 0;
    hunter.vy = 0;
    setHunterAssistCooldown(now);
    trackHunterSkillUseUnlock(now);
    if (blinked > 0 && now <= (hunter.pendingBlinkAttackUntil || 0) && canHunterAttack(now)) {
      startHunterBasicAttackWindup(now);
    } else {
      showAssistAlert("闪现", now);
    }
    hunter.pendingBlinkAttackUntil = 0;
  }

  function useAssistExcitement(now) {
    if (!canUseAssistExcitement(now)) return false;
    if (now < (hunter.stunnedUntil || 0)) {
      hunter.stunnedUntil = 0;
      hunter.status = "chasing";
      hunter.path = [];
      hunter.pathGoal = null;
      hunter.vx = 0;
      hunter.vy = 0;
      showAssistAlert("兴奋解除眩晕", now, 1000);
    } else {
      hunter.excitementGuardUntil = now + EXCITEMENT_GUARD_DURATION;
      showAssistAlert("兴奋免控", now, 1000);
    }
    setHunterAssistCooldown(now);
    trackHunterSkillUseUnlock(now);
    return true;
  }

  function getShiftDestination() {
    const target = getAimTargetFromPointer(null, null, true) || {
      x: hunter.x + Math.cos(hunter.angle) * ASSIST_SHIFT_RANGE,
      y: hunter.y + Math.sin(hunter.angle) * ASSIST_SHIFT_RANGE
    };
    const dx = target.x - hunter.x;
    const dy = target.y - hunter.y;
    const distance = Math.hypot(dx, dy);
    if (distance < 1) return findNearestSafePosition(hunter.x, hunter.y, hunter.radius);
    const scale = Math.min(ASSIST_SHIFT_RANGE, distance) / distance;
    return findNearestSafePosition(
      hunter.x + dx * scale,
      hunter.y + dy * scale,
      hunter.radius
    );
  }

  function useAssistShift(now) {
    if (activeShiftPortals) return;
    const near = findNearestSafePosition(hunter.x, hunter.y, hunter.radius);
    const far = getShiftDestination();
    if (distanceBetween(near, far) < ASSIST_SHIFT_RADIUS * 2) {
      showAssistAlert("移形距离太近", now);
      return;
    }
    activeShiftPortals = {
      near,
      far,
      usesLeft: ASSIST_SHIFT_USES,
      until: now + ASSIST_SHIFT_DURATION,
      lockoutUntil: now + ASSIST_SHIFT_LOCKOUT,
      armed: false
    };
    trackHunterSkillUseUnlock(now);
    showAssistAlert("移形门开启", now);
  }

  function finishAssistShift(now) {
    if (!activeShiftPortals) return;
    activeShiftPortals = null;
    setHunterAssistCooldown(now);
  }

  function getShiftPortalExit(portal) {
    if (!activeShiftPortals) return null;
    if (portal === activeShiftPortals.near) return activeShiftPortals.far;
    if (portal === activeShiftPortals.far) return activeShiftPortals.near;
    return null;
  }

  function teleportHunterThroughShiftPortal(portal, now) {
    const exit = getShiftPortalExit(portal);
    if (!exit || !activeShiftPortals) return;
    const angle = Math.atan2(exit.y - portal.y, exit.x - portal.x);
    const safe = findNearestSafePosition(
      exit.x + Math.cos(angle) * (ASSIST_SHIFT_RADIUS + hunter.radius + 8),
      exit.y + Math.sin(angle) * (ASSIST_SHIFT_RADIUS + hunter.radius + 8),
      hunter.radius
    );
    hunter.x = safe.x;
    hunter.y = safe.y;
    hunter.vx = 0;
    hunter.vy = 0;
    hunter.path = [];
    hunter.pathGoal = null;
    hunter.repathAt = 0;
    hunter.angle = angle;
    activeShiftPortals.usesLeft -= 1;
    activeShiftPortals.lockoutUntil = now + ASSIST_SHIFT_LOCKOUT;
    activeShiftPortals.armed = false;
    showAssistAlert(`移形 ${activeShiftPortals.usesLeft}/${ASSIST_SHIFT_USES}`, now, 900);
    if (activeShiftPortals.usesLeft <= 0) finishAssistShift(now);
  }

  function handlePlayerSkill(now) {
    if (selectedRole === PLAYER_ROLE.survivor && canUseGeneralSkill(player, now)) {
      useGeneralSkill(player, now);
      return;
    }
    if (selectedRole === PLAYER_ROLE.survivor && canUseMedicAdrenaline(player, now)) {
      useMedicAdrenaline(player, now);
      return;
    }
    if (selectedRole === PLAYER_ROLE.survivor && canStartFencerLunge(player, now)) {
      startFencerLunge(player, now);
      return;
    }
    if (selectedRole === PLAYER_ROLE.survivor && canUsePerfumeMist(player, now)) {
      usePerfumeSkill(player, now);
      return;
    }
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
    if (selectedRole === PLAYER_ROLE.hunter && isTwinSword()) {
      switchTwinForm(now);
      return;
    }
    if (selectedRole === PLAYER_ROLE.hunter && isSoulBinder()) {
      startSoulSiphonSelection(now);
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
      return;
    }
    if (selectedRole === PLAYER_ROLE.hunter && isSoulBinder()) {
      startSoulReturnSelection(now);
      return;
    }
    if (selectedRole === PLAYER_ROLE.hunter && isTwinSword()) {
      fireTwinFlyingSword(now);
    }
  }

  function canHunterAttack(now) {
    return !hunter.action &&
      !isTwinForm(TWIN_FORM_CHIYIN) &&
      now >= hunter.stunnedUntil &&
      now >= hunter.wipeUntil &&
      now >= (hunter.sawAttackLockedUntil || 0) &&
      now - hunter.lastAttackAt >= hunter.attackCooldown * 1000;
  }

  function performHunterAttack(now) {
    commitHunterAttack(now);
    resolveHunterAttack({
      balloonAttack: Boolean(hunter.carrying),
      rangeMultiplier: 1
    }, now);
  }

  function commitHunterAttack(now) {
    hunter.lastAttackAt = now;
    hunter.status = "attacking";
    hunter.lastAttackHit = false;
    hunter.vx = 0;
    hunter.vy = 0;
    if (isTwinSword() && now < (hunter.twinEnlightenedUntil || 0)) {
      hunter.twinFlyingSwords = (hunter.twinFlyingSwords || 0) + 1;
    }
  }

  function resolveHunterAttack(action, now) {
    const target = findHunterAttackTarget(action.rangeMultiplier || 1) || findSeatedHunterAttackTarget(action.rangeMultiplier || 1);
    const isBalloonAttack = Boolean(action.balloonAttack && hunter.carrying);
    hunter.action = null;
    hunter.status = "attacking";
    hunter.lastAttackHit = Boolean(target);
    chasePulseUntil = now + 280;

    if (target) {
      if (target.state === "seated") {
        hunter.wipeUntil = isBalloonAttack ? now : now + getHunterHitRecoveryDuration();
        return;
      }
      if (isActorDecoyTarget(target)) {
        breakActorDecoy(target, now);
        hunter.wipeUntil = isBalloonAttack ? now : now + getHunterHitRecoveryDuration();
        return;
      }
      if (isSurvivorInvulnerable(target, now)) {
        hunter.lastAttackHit = false;
        hunter.wipeUntil = now + getHunterMissRecoveryDuration();
        return;
      }
      addHunterPresenceHit(now);
      applyHunterHit(target, now, {
        applyBoneBleed: isSawbone(),
        detentionDown: isDetentionActive(),
        damage: getHunterBasicAttackDamage(),
        basicAttack: true
      });
      if (now < (hunter.stunnedUntil || 0)) return;
      hunter.wipeUntil = isBalloonAttack ? now : now + getHunterHitRecoveryDuration();
      return;
    }

    hunter.wipeUntil = now + getHunterMissRecoveryDuration();
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

  function canAIPlaceSoulLamp(now) {
    return matchStarted &&
      selectedRole !== PLAYER_ROLE.hunter &&
      isLanternKeeper() &&
      !hunter.action &&
      !hunter.carrying &&
      now >= hunter.stunnedUntil &&
      now >= hunter.wipeUntil &&
      now >= nextSoulLampAt &&
      soulLamps.length < getSoulLampLimit();
  }

  function maybeUseAILanternKeeperSkill(target, now, distance) {
    if (!target || isActorDecoyTarget(target) || !canAIPlaceSoulLamp(now)) return false;
    const targetPressured = distance < SOUL_LAMP_RANGE * 1.7;
    const objectivePressure = target.action && ["repairing", "openingGate", "rescuing", "healing", "dismantlingLamp"].includes(target.action.kind);
    if (!targetPressured && !objectivePressure) return false;
    const nearbyLamp = soulLamps.some((lamp) => {
      return distanceBetween(lamp, hunter) < SOUL_LAMP_RANGE * 0.72 ||
        distanceBetween(lamp, target) < SOUL_LAMP_RANGE * 0.86;
    });
    if (nearbyLamp) return false;
    placeSoulLamp(now);
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
    const tierTwo = hunter.presenceTier >= 2 || isInfiniteSawboneMode();
    return {
      duration: tierTwo ? SAW_DASH_DURATION + 90 : SAW_DASH_DURATION,
      range: tierTwo ? SAW_DASH_TIER_TWO_RANGE : SAW_DASH_RANGE,
      turnSpeed: tierTwo ? SAW_DASH_TIER_TWO_TURN_SPEED : SAW_DASH_TURN_SPEED,
      noTimeLimit: tierTwo,
      noDistanceLimit: tierTwo,
      durability: tierTwo && !isInfiniteSawboneMode() ? SAW_DASH_TIER_TWO_DURABILITY : null
    };
  }

  function startSawDash(now, target = null) {
    const short = canUseShortSaw(now);
    const config = getSawDashConfig(short);
    if (!short) hunter.nextSawDashAt = isInfiniteSawboneMode() ? now : now + SAW_DASH_COOLDOWN;
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
    trackHunterSkillUseUnlock(now);
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
    if (action.target && !action.target.escaped && action.target.state !== "eliminated" && !isSurvivorInvisible(action.target) && canAIHunterSeeThroughPerfume(action.target)) {
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
      if (!canAIHunterSeeThroughPerfume(survivor)) return;
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
    hunter.wipeUntil = now + getHunterHitRecoveryDuration();
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
      if (hunter.presenceTier >= 1 && previousTier < 1) trackHunterTierOneUnlock(now);
    }
  }

  function getPresenceTierFromHits(hits) {
    if (hits >= PRESENCE_TIER_TWO_HITS) return 2;
    if (hits >= PRESENCE_TIER_ONE_HITS) return 1;
    return 0;
  }

  function findHunterAttackTarget(rangeMultiplier = 1) {
    const decoyTarget = selectedRole !== PLAYER_ROLE.hunter ? findActorDecoyAttackTarget(rangeMultiplier) : null;
    if (decoyTarget) return decoyTarget;

    let best = null;
    let bestDistance = Infinity;
    getSurvivors().forEach((survivor) => {
      if (survivor.escaped) return;
      if (survivor.state === "downed" || survivor.state === "seated" || survivor.state === "carried" || survivor.state === "eliminated") return;
      if (isSurvivorInvisible(survivor)) return;
      if (!canAIHunterSeeThroughPerfume(survivor)) return;
      if (!isSurvivorInHunterAttackCone(survivor, rangeMultiplier)) return;
      const distance = distanceBetween(hunter, survivor);
      if (distance < bestDistance) {
        best = survivor;
        bestDistance = distance;
      }
    });
    return best;
  }

  function findSeatedHunterAttackTarget(rangeMultiplier = 1) {
    let best = null;
    let bestDistance = Infinity;
    getSurvivors().forEach((survivor) => {
      if (survivor.escaped || survivor.state !== "seated" || !survivor.chair) return;
      if (!isSurvivorInHunterAttackCone(survivor, rangeMultiplier)) return;
      const distance = distanceBetween(hunter, survivor);
      if (distance < bestDistance) {
        best = survivor;
        bestDistance = distance;
      }
    });
    return best;
  }

  function chooseHunterTarget() {
    if (isKiteSimulatorMode() && selectedRole === PLAYER_ROLE.survivor) {
      if (!player.escaped && player.state !== "seated" && player.state !== "carried" && player.state !== "eliminated") return player;
      return null;
    }

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
      if (!canAIHunterSeeThroughPerfume(survivor)) return;
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

  function findActorDecoyAttackTarget(rangeMultiplier = 1) {
    let best = null;
    let bestDistance = Infinity;
    actorDecoys.forEach((decoy) => {
      if (!isSurvivorInHunterAttackCone(decoy, rangeMultiplier)) return;
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

  function updateAIHunterBlindInPerfume(dt, now) {
    hunter.status = "blinded";
    const attackTarget = findHunterAttackTarget();
    if (attackTarget && canHunterAttack(now) && Math.random() < PERFUME_AI_BLIND_ATTACK_CHANCE) {
      startHunterBasicAttackWindup(now);
      return;
    }

    if (now >= (hunter.nextBlindWanderTurnAt || 0)) {
      let baseAngle = Number.isFinite(hunter.blindWanderAngle) ? hunter.blindWanderAngle : hunter.angle;
      if (Number.isFinite(hunter.lastKnownTargetX) && Number.isFinite(hunter.lastKnownTargetY)) {
        baseAngle = Math.atan2(hunter.lastKnownTargetY - hunter.y, hunter.lastKnownTargetX - hunter.x);
      }
      hunter.blindWanderAngle = baseAngle + (Math.random() - 0.5) * Math.PI * 0.9;
      hunter.nextBlindWanderTurnAt = now + PERFUME_AI_WANDER_TURN_INTERVAL + Math.random() * 650;
    }

    hunter.angle = turnToward(hunter.angle, hunter.blindWanderAngle || hunter.angle, hunter.turnSpeed * dt * 0.72);
    const moved = moveActorSmart(
      hunter,
      Math.cos(hunter.angle) * getHunterMoveSpeed() * dt * 0.82,
      Math.sin(hunter.angle) * getHunterMoveSpeed() * dt * 0.82
    );
    if (moved < 0.5 && now > (hunter.nextBlindWanderTurnAt || 0) - 220) {
      hunter.blindWanderAngle = hunter.angle + Math.PI * (0.55 + Math.random() * 0.9);
      hunter.nextBlindWanderTurnAt = now + 420;
    }
  }

  function updateAIHunterChairing(dt, now) {
    if (hunter.carrying) {
      if (canHunterAttack(now)) {
        const attackTarget = findHunterAttackTarget();
        if (attackTarget) {
          startHunterBasicAttackWindup(now);
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
    if (isSurvivorInvulnerable(survivor, now)) return;
    const terrorShock = isTerrorShockVulnerable(survivor);
    if (breakMedicShield(survivor, now)) return;
    if (absorbGeneralRideHit(survivor, now)) return;
    if (shouldQueueMedicRescueShock(survivor, terrorShock)) {
      queueMedicRescueShockDamage(survivor, getQueuedHitDamage(survivor, options, terrorShock), now);
      return;
    }
    if (isBorrowedTimeProtected(survivor, now)) {
      queueBorrowedTimeDamage(survivor, getQueuedHitDamage(survivor, options, terrorShock), now);
      return;
    }
    if (isMedicAdrenalineProtected(survivor, now)) {
      queueMedicAdrenalineDamage(survivor, getQueuedHitDamage(survivor, options, terrorShock), now);
      return;
    }
    if (options.applyBoneBleed) applyBoneBleed(survivor, now);
    if (options.basicAttack && isSoulBinder()) applySoulBinderBasicHit(survivor, now);
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

    const wasDowned = survivor.state === "downed";
    if (options.detentionDown || terrorShock && options.allowTerrorShock !== false) {
      applySurvivorDamage(survivor, now, getQueuedHitDamage(survivor, options, terrorShock));
      trackHunterFirstHitDownUnlock(survivor, now, wasDowned);
      trackHunterRemoteDownUnlock(survivor, now, wasDowned, options);
      if (!wasDowned && survivor.state === "downed") triggerWantedBadge(survivor, now);
      return;
    }

    applySurvivorDamage(survivor, now, options.damage ?? 1);
    trackHunterFirstHitDownUnlock(survivor, now, wasDowned);
    trackHunterRemoteDownUnlock(survivor, now, wasDowned, options);
    if (!wasDowned && survivor.state === "downed") triggerWantedBadge(survivor, now);
    triggerActorHitPerformance(survivor, now);
  }

  function hasMedicShield(survivor, now = performance.now()) {
    return survivor && (survivor.medicShieldHits || 0) > 0 && now < (survivor.medicShieldUntil || 0);
  }

  function absorbGeneralRideHit(survivor, now) {
    if (!isGeneralRiding(survivor, now)) return false;
    finishGeneralRide(survivor, now, "hit");
    survivor.healProgress = 0;
    chasePulseUntil = now + 320;
    return true;
  }

  function breakMedicShield(survivor, now) {
    if (!hasMedicShield(survivor, now)) return false;
    survivor.medicShieldHits = 0;
    survivor.medicShieldUntil = 0;
    knockHunterBackFrom(survivor, MEDIC_SHIELD_KNOCKBACK);
    stunHunterFromMedicShield(now);
    showAssistAlert("护盾破碎", now, 900);
    chasePulseUntil = now + 360;
    return true;
  }

  function stunHunterFromMedicShield(now) {
    if (consumeExcitementGuard(now)) return;
    if (hunter.action && hunter.action.kind === "attackWindup") {
      hunter.action = null;
      hunter.lastAttackHit = false;
    }
    if (hunter.action && hunter.action.kind === "pickingUp") {
      cancelPickupAction(hunter.action, now, true);
      hunter.action = null;
    }
    dropCarriedSurvivorFromControl(now);
    hunter.stunnedUntil = Math.max(hunter.stunnedUntil || 0, now + MEDIC_SHIELD_STUN);
    hunter.wipeUntil = 0;
    hunter.status = "stunned";
    hunter.path = [];
    hunter.pathGoal = null;
    hunter.vx = 0;
    hunter.vy = 0;
  }

  function knockHunterBackFrom(source, distance) {
    const angle = Math.atan2(hunter.y - source.y, hunter.x - source.x);
    const fallbackAngle = Number.isFinite(angle) ? angle : hunter.angle + Math.PI;
    const safe = findNearestSafePosition(
      hunter.x + Math.cos(fallbackAngle) * distance,
      hunter.y + Math.sin(fallbackAngle) * distance,
      hunter.radius
    );
    hunter.x = safe.x;
    hunter.y = safe.y;
    hunter.vx = 0;
    hunter.vy = 0;
    hunter.path = [];
    hunter.pathGoal = null;
  }

  function isMedicAdrenalineProtected(survivor, now = performance.now()) {
    return survivor && now < (survivor.medicAdrenalineUntil || 0) && survivor.state !== "downed";
  }

  function shouldQueueMedicRescueShock(survivor, terrorShock) {
    return Boolean(isMedic(survivor) && terrorShock && survivor.action && survivor.action.kind === "rescuing");
  }

  function queueMedicRescueShockDamage(survivor, amount, now) {
    survivor.medicRescueShockPendingDamage = Math.min(2, (survivor.medicRescueShockPendingDamage || 0) + amount);
    survivor.healProgress = 0;
    showAssistAlert("前线救护", now, 900);
    chasePulseUntil = now + 320;
  }

  function queueMedicAdrenalineDamage(survivor, amount, now) {
    survivor.medicAdrenalinePendingDamage = Math.min(2, (survivor.medicAdrenalinePendingDamage || 0) + amount);
    survivor.healProgress = 0;
    showAssistAlert("肾上腺素延伤", now, 900);
    chasePulseUntil = now + 320;
  }

  function isSurvivorInvulnerable(survivor, now) {
    if (!survivor || !survivor.action || now >= survivor.action.until) return false;
    return isFencer(survivor) && survivor.action.kind === "fencerLunge" ||
      hasSurvivorBadge(survivor, "flywheel") && survivor.action.kind === "flywheelDash";
  }

  function triggerWantedBadge(downedSurvivor, now) {
    if (!hasHunterBadge("wanted")) return;
    const candidates = getSurvivors().filter((survivor) => {
      return survivor !== downedSurvivor &&
        !survivor.escaped &&
        (survivor.state === "healthy" || survivor.state === "injured");
    });
    const target = candidates[Math.floor(Math.random() * candidates.length)];
    if (!target) return;
    hunter.wantedTarget = target;
    hunter.wantedUntil = now + WANTED_REVEAL_DURATION;
    if (selectedRole === PLAYER_ROLE.hunter) showAssistAlert(`通缉 ${getSurvivorDisplayName(target)}`, now, 1100);
  }

  function isBorrowedTimeProtected(survivor, now = performance.now()) {
    return survivor && now < (survivor.borrowedTimeUntil || 0) && survivor.state !== "downed";
  }

  function getQueuedHitDamage(survivor, options, terrorShock) {
    let amount = options.damage ?? 1;
    if (options.detentionDown || terrorShock && options.allowTerrorShock !== false) {
      amount = survivor.state === "healthy" ? 2 : 1;
    }
    return getEffectiveSurvivorDamage(survivor, amount, performance.now());
  }

  function getEffectiveSurvivorDamage(survivor, amount, now = performance.now()) {
    if (isGeneral(survivor) && amount > 1) {
      showAssistAlert("身经百战", now, 760);
      return 1;
    }
    return amount;
  }

  function getDamageProgressPercent(survivor) {
    const progress = survivor && survivor.damageProgress || 0;
    if (progress <= DAMAGE_PROGRESS_EPSILON) return 0;
    return Math.max(1, Math.min(99, Math.floor(progress * 100 + DAMAGE_PROGRESS_EPSILON)));
  }

  function getDamageProgressLabel(survivor) {
    const percent = getDamageProgressPercent(survivor);
    return percent > 0 ? `裂伤${percent}%` : "";
  }

  function queueBorrowedTimeDamage(survivor, amount, now) {
    survivor.borrowedTimePendingDamage = Math.min(2, (survivor.borrowedTimePendingDamage || 0) + amount);
    survivor.healProgress = 0;
    chasePulseUntil = now + 320;
    showAssistAlert("搏命延伤", now, 760);
  }

  function updateBorrowedTime(now) {
    getSurvivors().forEach((survivor) => {
      if (!survivor.borrowedTimeUntil || now < survivor.borrowedTimeUntil) return;
      survivor.borrowedTimeUntil = 0;
      settleBorrowedTimeDamage(survivor, now);
    });
  }

  function settleBorrowedTimeDamage(survivor, now) {
    const amount = getEffectiveSurvivorDamage(survivor, survivor.borrowedTimePendingDamage || 0, now);
    survivor.borrowedTimePendingDamage = 0;
    if (amount <= 0 || survivor.escaped || survivor.state === "eliminated" || survivor.state === "seated" || survivor.state === "carried") return;
    if (amount >= 2 || survivor.state === "injured") {
      downSurvivor(survivor);
      chasePulseUntil = now + 420;
      return;
    }
    applySurvivorDamage(survivor, now, 1);
  }

  function updateMedicEffects(now) {
    getSurvivors().forEach((survivor) => {
      if (survivor.medicShieldUntil && now >= survivor.medicShieldUntil) {
        survivor.medicShieldUntil = 0;
        survivor.medicShieldHits = 0;
      }
      if ((survivor.medicRescueShockPendingDamage || 0) > 0 && (!survivor.action || survivor.action.kind !== "rescuing")) {
        settleMedicRescueShockDamage(survivor, now);
      }
      if (survivor.medicAdrenalineUntil && now >= survivor.medicAdrenalineUntil) {
        survivor.medicAdrenalineUntil = 0;
        settleMedicAdrenalineDamage(survivor, now);
      }
    });
  }

  function updateGeneralEffects(now) {
    getSurvivors().forEach((survivor) => {
      if (isGeneral(survivor) && survivor.generalRideUntil && now >= survivor.generalRideUntil) {
        finishGeneralRide(survivor, now, "timeout");
      }
    });
  }

  function settleMedicRescueShockDamage(survivor, now) {
    const amount = survivor.medicRescueShockPendingDamage || 0;
    survivor.medicRescueShockPendingDamage = 0;
    applyDelayedMedicDamage(survivor, amount, now);
  }

  function settleMedicAdrenalineDamage(survivor, now) {
    const amount = survivor.medicAdrenalinePendingDamage || 0;
    survivor.medicAdrenalinePendingDamage = 0;
    applyDelayedMedicDamage(survivor, amount, now);
  }

  function applyDelayedMedicDamage(survivor, amount, now) {
    amount = getEffectiveSurvivorDamage(survivor, amount, now);
    if (amount <= 0 || survivor.escaped || survivor.state === "eliminated" || survivor.state === "seated" || survivor.state === "carried") return;
    if (isBorrowedTimeProtected(survivor, now)) {
      queueBorrowedTimeDamage(survivor, amount, now);
      return;
    }
    if (isMedicAdrenalineProtected(survivor, now)) {
      queueMedicAdrenalineDamage(survivor, amount, now);
      return;
    }
    const wasDowned = survivor.state === "downed";
    if (amount >= 2 || survivor.state === "injured") {
      downSurvivor(survivor);
      chasePulseUntil = now + 420;
      if (!wasDowned) triggerWantedBadge(survivor, now);
      return;
    }
    applySurvivorDamage(survivor, now, amount);
    if (!wasDowned && survivor.state === "downed") triggerWantedBadge(survivor, now);
  }

  function applySoulBinderBasicHit(survivor, now) {
    addSoulMark(survivor, 1);
    if (hunter.soulSiphonTarget !== survivor || now > (hunter.soulSiphonUntil || 0)) return;
    getSurvivors().forEach((target) => {
      if (target !== survivor && getSoulMarks(target) > 0) addSoulMark(target, 1);
    });
    hunter.soulSiphonTarget = null;
    hunter.soulSiphonUntil = 0;
    hunter.soulSelectionMode = null;
    showAssistAlert("摄魂命中", now, 1200);
  }

  function canStartSoulSiphon(now) {
    return matchStarted &&
      selectedRole === PLAYER_ROLE.hunter &&
      isSoulBinder() &&
      !hunter.action &&
      !hunter.carrying &&
      now >= hunter.stunnedUntil &&
      now >= hunter.wipeUntil &&
      now >= (hunter.nextSoulSiphonAt || 0) &&
      getSurvivors().some((survivor) => getSoulMarks(survivor) > 0 && !survivor.escaped && survivor.state !== "eliminated");
  }

  function startSoulSiphonSelection(now) {
    if (!canStartSoulSiphon(now)) {
      showAssistAlert(getSoulSiphonBlockedReason(now), now, 1200);
      return false;
    }
    hunter.soulSelectionMode = "siphon";
    hunter.soulSelectionCandidate = null;
    hunter.soulSelectionCount = 0;
    hunter.soulSelectionAt = now;
    showAssistAlert("双击魂印目标", now, 1200);
    return true;
  }

  function getSoulSiphonBlockedReason(now) {
    if (!matchStarted || selectedRole !== PLAYER_ROLE.hunter || !isSoulBinder()) return "摄魂不可用";
    if (hunter.action || hunter.carrying || now < hunter.stunnedUntil || now < hunter.wipeUntil) return "正在行动";
    if (now < (hunter.nextSoulSiphonAt || 0)) return `摄魂冷却${formatCooldown(hunter.nextSoulSiphonAt - now)}`;
    return "没有魂印目标";
  }

  function startSoulSiphon(target, now) {
    if (!canStartSoulSiphon(now) || !target || getSoulMarks(target) <= 0 || target.escaped || target.state === "eliminated") return false;
    hunter.soulSiphonTarget = target;
    hunter.soulSiphonUntil = now + SOUL_SIPHON_DURATION;
    hunter.nextSoulSiphonAt = now + SOUL_SIPHON_COOLDOWN;
    hunter.soulSelectionMode = null;
    showAssistAlert(`摄魂 ${target.name}`, now, 1200);
    return true;
  }

  function canBorrowSoul(now) {
    return matchStarted &&
      selectedRole === PLAYER_ROLE.hunter &&
      isSoulBinder() &&
      !hunter.action &&
      !hunter.carrying &&
      now >= hunter.stunnedUntil &&
      now >= hunter.wipeUntil &&
      (isSoulBinderPracticeMode() || now >= (hunter.nextBorrowSoulAt || 0)) &&
      getTotalSoulMarks() > 0;
  }

  function borrowSoul(now) {
    if (!canBorrowSoul(now)) return false;
    const total = getTotalSoulMarks();
    if (!isSoulBinderPracticeMode()) {
      getSurvivors().forEach((survivor) => {
        survivor.soulMarks = 0;
      });
    }
    hunter.borrowSoulSpeedBonus = total * BORROW_SOUL_SPEED_PER_MARK;
    hunter.borrowSoulRecoveryBonus = total * BORROW_SOUL_RECOVERY_PER_MARK;
    hunter.borrowSoulUntil = now + BORROW_SOUL_DURATION;
    hunter.nextBorrowSoulAt = isSoulBinderPracticeMode() ? now : now + BORROW_SOUL_COOLDOWN;
    showAssistAlert(`借魂 ${total}层`, now, 1200);
    return true;
  }

  function canStartSoulReturnSelection(now) {
    return matchStarted &&
      selectedRole === PLAYER_ROLE.hunter &&
      isSoulBinder() &&
      hunter.presenceTier >= 2 &&
      !hunter.action &&
      !hunter.carrying &&
      now >= hunter.stunnedUntil &&
      now >= hunter.wipeUntil &&
      now >= (hunter.nextSoulReturnAt || 0) &&
      getSurvivors().some((survivor) => survivor.state === "seated");
  }

  function startSoulReturnSelection(now) {
    if (!canStartSoulReturnSelection(now)) {
      showAssistAlert(getSoulReturnBlockedReason(now), now, 1200);
      return false;
    }
    hunter.soulSelectionMode = "return";
    hunter.soulSelectionCandidate = null;
    hunter.soulSelectionCount = 0;
    hunter.soulSelectionAt = now;
    showAssistAlert("双击上椅目标", now, 1200);
    return true;
  }

  function getSoulReturnBlockedReason(now) {
    if (!matchStarted || selectedRole !== PLAYER_ROLE.hunter || !isSoulBinder()) return "归途不可用";
    if (hunter.presenceTier < 2) return "需要二阶";
    if (hunter.action || hunter.carrying || now < hunter.stunnedUntil || now < hunter.wipeUntil) return "正在行动";
    if (now < (hunter.nextSoulReturnAt || 0)) return `归途冷却${formatCooldown(hunter.nextSoulReturnAt - now)}`;
    return "没有上椅目标";
  }

  function applySoulReturn(target, now) {
    if (!canStartSoulReturnSelection(now) || !target || target.state !== "seated") return false;
    target.soulReturnUntil = now + SOUL_RETURN_DURATION;
    hunter.nextSoulReturnAt = now + SOUL_RETURN_COOLDOWN;
    hunter.soulSelectionMode = null;
    showAssistAlert(`引魂归途 ${target.name}`, now, 1200);
    return true;
  }

  function getTotalSoulMarks() {
    return getSurvivors().reduce((total, survivor) => total + getSoulMarks(survivor), 0);
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
    actorDecoys.push(createSmartDecoy(actor, actor.x, actor.y, angle, {
      state: actor.state === "healthy" ? "healthy" : "injured",
      damageProgress: actor.damageProgress || 0,
      speed: ACTOR_DECOY_SPEED,
      until: now + ACTOR_DECOY_DURATION
    }));
  }

  function createSmartDecoy(owner, x, y, angle, options = {}) {
    return {
      id: ++actorDecoyId,
      kind: "actorDecoy",
      name: owner.name,
      owner,
      x,
      y,
      state: options.state || "healthy",
      damageProgress: options.damageProgress || 0,
      radius: owner.radius,
      angle,
      speed: options.speed || owner.speed || player.speed,
      sprintSpeed: options.sprintSpeed || owner.sprintSpeed || player.sprintSpeed,
      vx: Math.cos(angle) * (options.speed || ACTOR_DECOY_SPEED),
      vy: Math.sin(angle) * (options.speed || ACTOR_DECOY_SPEED),
      fill: owner.fill,
      core: owner.core,
      boostUntil: 0,
      action: null,
      nextInteractAt: 0,
      wanderTarget: null,
      kiteDecision: null,
      path: [],
      pathGoal: null,
      repathAt: 0,
      until: options.until || performance.now() + ACTOR_DECOY_DURATION
    };
  }

  function applySurvivorDamage(survivor, now, amount) {
    amount = getEffectiveSurvivorDamage(survivor, amount, now);
    if (!Number.isFinite(amount) || amount <= 0) return;

    let damageProgress = (survivor.damageProgress || 0) + amount;
    while (damageProgress + DAMAGE_PROGRESS_EPSILON >= 1) {
      damageProgress -= 1;
      if (damageProgress < DAMAGE_PROGRESS_EPSILON) damageProgress = 0;

      if (survivor.state === "healthy") {
        survivor.state = "injured";
        survivor.injuredAt = now;
        survivor.healProgress = 0;
        if (damageProgress + DAMAGE_PROGRESS_EPSILON < 1) {
          survivor.damageProgress = damageProgress;
          survivor.boostUntil = now + getSurvivorHitBoostDuration(survivor, 1800);
          return;
        }
        continue;
      }

      if (survivor.state === "injured") {
        survivor.damageProgress = 0;
        downSurvivor(survivor);
      }
      return;
    }

    survivor.damageProgress = Math.max(0, damageProgress);
    if (survivor.damageProgress > 0) {
      survivor.healProgress = 0;
      chasePulseUntil = now + 260;
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
    survivor.medicShieldUntil = 0;
    survivor.medicShieldHits = 0;
    survivor.medicAdrenalineUntil = 0;
    survivor.medicAdrenalinePendingDamage = 0;
    survivor.medicRescueShockPendingDamage = 0;
    survivor.generalRideUntil = 0;
    survivor.generalRideWhips = 0;
    survivor.nextGeneralWhipAt = 0;
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
    cancelFencerLungePreparation(survivor);
  }

  function resetMatch() {
    matchResult = null;
    matchStartedAt = performance.now();
    applyRandomMapLayout();

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
    assistPeeperWards.length = 0;
    packageProjectiles.length = 0;
    stitchPackDrops.length = 0;
    actorDecoys.length = 0;
    perfumeMists.length = 0;
    twinShadowZones.length = 0;
    twinSwordProjectiles.length = 0;
    twinAim = null;
    activePatroller = null;
    activeShiftPortals = null;
    assistListenTargets = [];
    finalCipherGuard = null;
    nextSoulLampAt = 0;
    lanternAlert = null;
    playerChaseTaskState = null;
    pendingSafeRescueTasks.length = 0;

    chairs.forEach((item) => {
      item.survivor = null;
      item.destroyed = false;
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
    hunter.rampagePresenceGained = 0;
    hunter.nextRampageAt = hasHunterBadge("rampage") ? performance.now() + RAMPAGE_PRESENCE_INTERVAL : 0;
    hunter.wantedTarget = null;
    hunter.wantedUntil = 0;
    hunter.trumpCardUsed = false;
    hunter.trumpCardSelecting = false;
    hunter.trumpCardSelectionUntil = 0;
    hunter.excitementGuardUntil = 0;
    hunter.nextShadowTeleportAt = 0;
    hunter.nextAssistAt = 0;
    hunter.pendingBlinkAttackUntil = 0;
    hunter.assistListenUntil = 0;
    hunter.nextSoulSiphonAt = 0;
    hunter.soulSiphonTarget = null;
    hunter.soulSiphonUntil = 0;
    hunter.soulSiphonPenaltyUntil = 0;
    hunter.nextBorrowSoulAt = 0;
    hunter.borrowSoulUntil = 0;
    hunter.borrowSoulSpeedBonus = 0;
    hunter.borrowSoulRecoveryBonus = 0;
    hunter.nextSoulReturnAt = 0;
    hunter.soulSelectionMode = null;
    hunter.soulSelectionCandidate = null;
    hunter.soulSelectionCount = 0;
    hunter.soulSelectionAt = 0;
    hunter.blindWanderAngle = hunter.angle;
    hunter.nextBlindWanderTurnAt = 0;
    hunter.lastKnownTargetX = null;
    hunter.lastKnownTargetY = null;
    hunter.nextSawDashAt = 0;
    hunter.sawAttackLockedUntil = 0;
    hunter.shortSawAvailableUntil = 0;
    hunter.pendingSawWipe = false;
    hunter.pendingSawWipeAt = 0;
    hunter.twinForm = TWIN_FORM_QINGTIAN;
    hunter.twinIntent = TWIN_INTENT_INITIAL;
    hunter.twinEnlightenedUntil = 0;
    hunter.twinEnlightenmentCount = 0;
    hunter.twinFlyingSwords = 0;
    hunter.nextTwinFormAt = 0;
    hunter.nextTwinShadowLockAt = 0;
    hunter.nextTwinShadowStrikeAt = 0;
    hunter.nextTwinDualCastAt = 0;
    hunter.twinDualCastUntil = 0;
    hunter.twinTimePower = null;
    hunter.twinTimeMode = "self";
    hunter.action = null;
    hunter.carrying = null;
    hunter.status = "chasing";
    hunter.target = null;
    hunter.unlockFirstHitRecords = new Map();
    hunter.path = [];
    hunter.pathGoal = null;
    hunter.repathAt = 0;
    applyModeAfterReset();
  }

  function applyModeAfterReset() {
    if (isInfiniteSawboneMode()) {
      hunter.presenceHits = PRESENCE_TIER_TWO_HITS;
      hunter.presenceTier = 2;
      hunter.nextSawDashAt = 0;
      hunter.shortSawAvailableUntil = 0;
      hunter.pendingSawWipe = false;
      hunter.pendingSawWipeAt = 0;
      hunter.status = "controlled";
      lanternAlert = {
        text: "娱乐模式 · 无限车移动靶",
        until: performance.now() + 1800
      };
      return;
    }

    if (isSoulBinderPracticeMode()) {
      hunter.presenceHits = PRESENCE_TIER_TWO_HITS;
      hunter.presenceTier = 2;
      hunter.nextBorrowSoulAt = 0;
      getSurvivors().forEach((survivor) => {
        if (!survivor.escaped && survivor.state !== "eliminated") survivor.soulMarks = SOUL_BINDER_PRACTICE_SOUL_MARKS;
      });
      lanternAlert = {
        text: "娱乐模式 · 20魂印无限借魂",
        until: performance.now() + 1800
      };
      return;
    }

    if (isKiteSimulatorMode()) {
      hunter.badges = getAIHunterBadges();
      applyHunterCharacter("standard");
      hunter.assistSkill = null;
      hunter.target = player;
      lanternAlert = {
        text: "娱乐模式 · 牵制模拟器",
        until: performance.now() + 1800
      };
    }
  }

  function showCharacterSelection(role) {
    pendingRole = role;
    setupStep = "character";
    selectedCharacterForSetup = role === PLAYER_ROLE.hunter ? selectedHunterCharacter : selectedSurvivorCharacter;
    if (role === PLAYER_ROLE.hunter) prepareHunterSurvivorPreview();
    updateSetupTitle();
    if (roleActions) roleActions.classList.add("is-hidden");
    if (characterPanel) characterPanel.classList.remove("is-hidden");
    updateSetupPanels();
    updateHunterSurvivorPreview(role);
    updateHiddenUnlockPanel(role);
  }

  function showRoleSelection() {
    pendingRole = null;
    pendingMode = null;
    setupStep = "character";
    selectedCharacterForSetup = null;
    currentMode = GAME_MODE.normal;
    if (roleDialogTitle) roleDialogTitle.textContent = "选择阵营";
    if (roleActions) roleActions.classList.remove("is-hidden");
    if (characterPanel) characterPanel.classList.add("is-hidden");
    updateHiddenUnlockPanel(null);
    updateBadgePanel(null);
    updateAssistPanel(null);
    updateHunterSurvivorPreview(null);
    updateSetupNextButton();
  }

  function prepareHunterSurvivorPreview() {
    previewSurvivorCharacterOrder = shuffled(AI_SURVIVOR_CHARACTER_ORDER);
  }

  function updateHunterSurvivorPreview(role = pendingRole) {
    if (!hunterSurvivorPreview) return;
    const visible = role === PLAYER_ROLE.hunter && Array.isArray(previewSurvivorCharacterOrder);
    hunterSurvivorPreview.classList.toggle("is-hidden", !visible);
    if (!visible) return;
    const names = previewSurvivorCharacterOrder.slice(0, 4).map((id) => SURVIVOR_CHARACTERS[id] && SURVIVOR_CHARACTERS[id].name || id);
    hunterSurvivorPreview.innerHTML = `
      <strong>本局求生者身份</strong>
      <span>${names.map(escapeHtml).join(" · ")}</span>
    `;
  }

  function startMatch(role, characterId = null) {
    currentMode = GAME_MODE.normal;
    if (role === PLAYER_ROLE.hunter && characterId === TWIN_SWORD_ID && !hiddenHunterUnlocked) {
      showCharacterSelection(role);
      return;
    }
    if (characterId && !isCharacterUnlocked(role, characterId)) {
      showCharacterSelection(role);
      return;
    }
    selectedRole = role;
    if (role === PLAYER_ROLE.survivor && characterId) selectedSurvivorCharacter = characterId;
    if (role === PLAYER_ROLE.hunter && characterId) selectedHunterCharacter = characterId;
    assignCharactersForMatch();
    resetMatch();
    matchStarted = true;
    setRoleOverlayVisible(false);
  }

  function selectCharacterForSetup(role, characterId) {
    if (role !== pendingRole) return;
    if (role === PLAYER_ROLE.hunter && characterId === TWIN_SWORD_ID && !hiddenHunterUnlocked) {
      showCharacterSelection(role);
      return;
    }
    if (!isCharacterUnlocked(role, characterId)) {
      if (roleDialogTitle) roleDialogTitle.textContent = getCharacterUnlockLabel(role, characterId);
      return;
    }
    selectedCharacterForSetup = characterId;
    if (role === PLAYER_ROLE.survivor) selectedSurvivorCharacter = characterId;
    if (role === PLAYER_ROLE.hunter) selectedHunterCharacter = characterId;
    setupStep = "badges";
    updateSetupTitle();
    updateSetupPanels();
  }

  function advanceSetupStep() {
    if (!pendingRole || !selectedCharacterForSetup) return;
    if (setupStep === "character") {
      setupStep = "badges";
      updateSetupTitle();
      updateSetupPanels();
      return;
    }
    if (setupStep === "badges" && pendingRole === PLAYER_ROLE.hunter) {
      setupStep = "assist";
      updateSetupTitle();
      updateSetupPanels();
      return;
    }
    if (pendingMode === GAME_MODE.kiteSimulator && pendingRole === PLAYER_ROLE.survivor) {
      startKiteSimulatorMode(selectedCharacterForSetup);
      return;
    }
    startMatch(pendingRole, selectedCharacterForSetup);
  }

  function backSetupStep() {
    if (setupStep === "assist") {
      setupStep = "badges";
      updateSetupTitle();
      updateSetupPanels();
      return;
    }
    if (setupStep === "badges") {
      setupStep = "character";
      updateSetupTitle();
      updateSetupPanels();
      return;
    }
    showRoleSelection();
  }

  function updateSetupTitle() {
    if (!roleDialogTitle || !pendingRole) return;
    const roleName = pendingRole === PLAYER_ROLE.hunter ? "追捕者" : "逃生者";
    if (pendingMode === GAME_MODE.kiteSimulator && setupStep === "character") roleDialogTitle.textContent = "牵制模拟器 · 选择逃生者";
    else if (setupStep === "badges") roleDialogTitle.textContent = `选择${roleName}徽章`;
    else if (setupStep === "assist") roleDialogTitle.textContent = "选择辅助技能";
    else roleDialogTitle.textContent = `选择${roleName}`;
  }

  function updateSetupPanels() {
    const showCharacters = Boolean(pendingRole) && setupStep === "character";
    const showBadges = Boolean(pendingRole) && setupStep === "badges";
    const showAssist = pendingRole === PLAYER_ROLE.hunter && setupStep === "assist";
    characterButtons.forEach((button) => {
      const characterId = button.dataset.character;
      const hasUnlockTask = getCharacterUnlockTasks(button.dataset.characterRole, characterId).length > 0;
      const lockedHidden = button.dataset.hiddenCharacter === "true" && !hiddenHunterUnlocked && !developerUnlockAllCharacters && !hasUnlockTask;
      const visible = showCharacters && button.dataset.characterRole === pendingRole && !lockedHidden;
      const locked = visible && !isCharacterUnlocked(button.dataset.characterRole, characterId);
      const detail = button.querySelector("strong");
      if (detail && !button.dataset.defaultDetail) button.dataset.defaultDetail = detail.textContent;
      if (detail && visible) detail.textContent = locked ? getCharacterUnlockLabel(button.dataset.characterRole, characterId) : button.dataset.defaultDetail;
      button.classList.toggle("is-hidden", !visible);
      button.classList.toggle("is-locked", locked);
      button.classList.toggle("is-selected", visible && button.dataset.character === selectedCharacterForSetup);
      button.disabled = false;
      button.setAttribute("aria-disabled", locked ? "true" : "false");
      if (visible) button.title = locked ? getCharacterUnlockLabel(button.dataset.characterRole, characterId) : "";
    });
    updateHiddenUnlockPanel(showCharacters ? pendingRole : null);
    updateBadgePanel(showBadges ? pendingRole : null);
    updateAssistPanel(showAssist ? pendingRole : null);
    updateSetupNextButton();
  }

  function updateSetupNextButton() {
    if (!characterNextButton) return;
    const visible = Boolean(pendingRole) && setupStep !== "character";
    characterNextButton.classList.toggle("is-hidden", !visible);
    if (!visible) return;
    characterNextButton.textContent = setupStep === "assist" || pendingRole === PLAYER_ROLE.survivor ? "开始游戏" : "下一步";
  }

  function startInfiniteSawboneMode() {
    currentMode = GAME_MODE.infiniteSawbone;
    selectedRole = PLAYER_ROLE.hunter;
    selectedHunterCharacter = SAWBONE_ID;
    selectedHunterBadges = [];
    selectedHunterAssist = null;
    assignCharactersForMatch();
    resetMatch();
    matchStarted = true;
    setRoleOverlayVisible(false);
  }

  function startSoulBinderPracticeMode() {
    currentMode = GAME_MODE.soulBinderPractice;
    selectedRole = PLAYER_ROLE.hunter;
    selectedHunterCharacter = SOUL_BINDER_ID;
    selectedHunterBadges = [];
    selectedHunterAssist = null;
    assignCharactersForMatch();
    resetMatch();
    matchStarted = true;
    setRoleOverlayVisible(false);
  }

  function startKiteSimulatorSetup() {
    pendingMode = GAME_MODE.kiteSimulator;
    showCharacterSelection(PLAYER_ROLE.survivor);
  }

  function startKiteSimulatorMode(characterId = null) {
    currentMode = GAME_MODE.kiteSimulator;
    pendingMode = null;
    selectedRole = PLAYER_ROLE.survivor;
    if (characterId) selectedSurvivorCharacter = characterId;
    assignCharactersForMatch();
    hunter.badges = getAIHunterBadges();
    applyHunterCharacter("standard");
    hunter.assistSkill = null;
    resetMatch();
    matchStarted = true;
    setRoleOverlayVisible(false);
  }

  function restartCurrentMatch() {
    if (!selectedRole) return;
    if (isInfiniteSawboneMode()) applyHunterCharacter(SAWBONE_ID);
    else if (isSoulBinderPracticeMode()) applyHunterCharacter(SOUL_BINDER_ID);
    else if (isKiteSimulatorMode()) applyHunterCharacter("standard");
    else assignCharactersForMatch();
    resetMatch();
    matchStarted = true;
    setRoleOverlayVisible(false);
  }

  function setRoleOverlayVisible(visible) {
    if (!roleOverlay) return;
    roleOverlay.classList.toggle("is-hidden", !visible);
    if (visible) showRoleSelection();
  }

  function readHiddenHunterUnlock() {
    try {
      return window.localStorage.getItem(HIDDEN_HUNTER_UNLOCK_KEY) === "true";
    } catch (error) {
      return false;
    }
  }

  function saveHiddenHunterUnlock() {
    try {
      window.localStorage.setItem(HIDDEN_HUNTER_UNLOCK_KEY, "true");
    } catch (error) {
      // 本地存储不可用时，本次页面会话内仍然解锁。
    }
  }

  function readDeveloperUnlockMode() {
    try {
      const params = new URLSearchParams(window.location.search);
      return params.has(DEVELOPER_MODE_QUERY_KEY) || params.get("mode") === "dev" || window.location.hash === "#dev";
    } catch (error) {
      return false;
    }
  }

  function getDefaultProfileUnlocks() {
    return {
      survivor: INITIAL_UNLOCKS.survivor.slice(),
      hunter: INITIAL_UNLOCKS.hunter.slice()
    };
  }

  function readProfileUnlocks() {
    const defaults = getDefaultProfileUnlocks();
    try {
      const saved = JSON.parse(window.localStorage.getItem(PROFILE_UNLOCK_STORAGE_KEY) || "{}");
      return {
        survivor: mergeUnique(defaults.survivor, Array.isArray(saved.survivor) ? saved.survivor : []),
        hunter: mergeUnique(defaults.hunter, Array.isArray(saved.hunter) ? saved.hunter : [])
      };
    } catch (error) {
      return defaults;
    }
  }

  function saveProfileUnlocks() {
    try {
      window.localStorage.setItem(PROFILE_UNLOCK_STORAGE_KEY, JSON.stringify(profileUnlocks));
    } catch (error) {
      // 本地存档不可用时，本次会话内仍然保留解锁。
    }
  }

  function readProfileTaskProgress() {
    const progress = {};
    Object.values(CHARACTER_UNLOCK_TASKS).forEach((task) => {
      progress[task.progressKey] = 0;
    });
    try {
      const saved = JSON.parse(window.localStorage.getItem(PROFILE_TASK_STORAGE_KEY) || "{}");
      Object.keys(progress).forEach((key) => {
        progress[key] = Math.max(0, Number(saved[key]) || 0);
      });
    } catch (error) {
      // 使用默认任务进度。
    }
    return progress;
  }

  function saveProfileTaskProgress() {
    try {
      window.localStorage.setItem(PROFILE_TASK_STORAGE_KEY, JSON.stringify(profileTaskProgress));
    } catch (error) {
      // 本地存档不可用时，本次会话内仍然保留任务进度。
    }
  }

  function mergeUnique(...lists) {
    return [...new Set(lists.flat().filter(Boolean))];
  }

  function isCharacterUnlocked(role, characterId) {
    if (developerUnlockAllCharacters) return true;
    return Boolean(profileUnlocks[role] && profileUnlocks[role].includes(characterId));
  }

  function getCharacterUnlockTask(role, characterId) {
    return getCharacterUnlockTasks(role, characterId)[0] || null;
  }

  function getCharacterUnlockTasks(role, characterId) {
    return Object.values(CHARACTER_UNLOCK_TASKS).filter((task) => task.role === role && task.target === characterId);
  }

  function getCharacterUnlockLabel(role, characterId) {
    const tasks = getCharacterUnlockTasks(role, characterId);
    if (tasks.length === 0) return "未解锁";
    const task = tasks.find((item) => !isUnlockTaskComplete(item)) || tasks[tasks.length - 1];
    const progress = Math.min(task.goal, profileTaskProgress[task.progressKey] || 0);
    const readout = task.progressKey === "kiteSeconds" ? `${Math.floor(progress)}/${task.goal}秒` : `${Math.floor(progress)}/${task.goal}`;
    const prefix = tasks.length > 1 ? `${tasks.findIndex((item) => item === task) + 1}/${tasks.length} ` : "";
    return `${prefix}${task.label} ${readout}`;
  }

  function isUnlockTaskComplete(task) {
    return (profileTaskProgress[task.progressKey] || 0) >= task.goal;
  }

  function areCharacterUnlockTasksComplete(role, characterId) {
    const tasks = getCharacterUnlockTasks(role, characterId);
    return tasks.length > 0 && tasks.every(isUnlockTaskComplete);
  }

  function unlockCharacter(role, characterId) {
    if (!profileUnlocks[role]) profileUnlocks[role] = [];
    if (profileUnlocks[role].includes(characterId)) return false;
    profileUnlocks[role].push(characterId);
    saveProfileUnlocks();
    updateSetupPanels();
    return true;
  }

  function addUnlockTaskProgress(progressKey, amount = 1) {
    const task = Object.values(CHARACTER_UNLOCK_TASKS).find((item) => item.progressKey === progressKey);
    if (!task || isCharacterUnlocked(task.role, task.target) && !developerUnlockAllCharacters) return;
    const current = Math.max(0, profileTaskProgress[progressKey] || 0);
    profileTaskProgress[progressKey] = Math.min(task.goal, current + amount);
    saveProfileTaskProgress();
    if (areCharacterUnlockTasksComplete(task.role, task.target) && unlockCharacter(task.role, task.target)) {
      showAssistAlert(`解锁 ${getCharacterName(task.role, task.target)}`, performance.now(), 1600);
    }
  }

  function getCharacterName(role, characterId) {
    const config = role === PLAYER_ROLE.hunter ? HUNTER_CHARACTERS[characterId] : SURVIVOR_CHARACTERS[characterId];
    return config && config.name || characterId;
  }

  function trackPlayerHealTeammate(target) {
    if (selectedRole !== PLAYER_ROLE.survivor || target === player) return;
    addUnlockTaskProgress("healTeammate", 1);
  }

  function isNormalHunterUnlockMatch() {
    return selectedRole === PLAYER_ROLE.hunter && currentMode === GAME_MODE.normal;
  }

  function trackHunterTierOneUnlock(now) {
    if (!isNormalHunterUnlockMatch()) return;
    if (now - matchStartedAt <= 60000) addUnlockTaskProgress("hunterTierOne60", 1);
  }

  function trackHunterFirstHitDownUnlock(survivor, now, wasDowned) {
    if (!isNormalHunterUnlockMatch() || !survivor || survivor.escaped || survivor.state === "eliminated") return;
    if (!hunter.unlockFirstHitRecords) hunter.unlockFirstHitRecords = new Map();
    if (!hunter.unlockFirstHitRecords.has(survivor)) hunter.unlockFirstHitRecords.set(survivor, now);
    const firstHitAt = hunter.unlockFirstHitRecords.get(survivor);
    if (!wasDowned && survivor.state === "downed" && now - firstHitAt <= 20000) {
      addUnlockTaskProgress("firstHitDown20", 1);
    }
  }

  function trackHunterRemoteDownUnlock(survivor, now, wasDowned, options = {}) {
    if (!isNormalHunterUnlockMatch() || !survivor || wasDowned || survivor.state !== "downed") return;
    if (options.basicAttack) return;
    if (distanceBetween(hunter, survivor) >= 260) addUnlockTaskProgress("remoteHunterDown", 1);
  }

  function trackHunterSkillUseUnlock(now) {
    if (!isNormalHunterUnlockMatch()) return;
    if (hunter.lastUnlockSkillUseAt && now - hunter.lastUnlockSkillUseAt <= 5000) {
      addUnlockTaskProgress("hunterSkillBurst5", 1);
    }
    hunter.lastUnlockSkillUseAt = now;
  }

  function trackHunterFourKillUnlock(winner) {
    if (!isNormalHunterUnlockMatch() || winner !== "hunter") return;
    const eliminatedCount = getSurvivors().filter((survivor) => survivor.state === "eliminated").length;
    if (eliminatedCount >= 4 && getCompletedRepairCount() === 0) addUnlockTaskProgress("fiveCipherFourKill", 1);
  }

  function trackPlayerRescue(rescuer, target, now) {
    if (selectedRole !== PLAYER_ROLE.survivor || rescuer !== player || !target || target === player) return;
    addUnlockTaskProgress("rescue", 1);
    if (player.state === "injured") addUnlockTaskProgress("injuredRescue", 1);
    pendingSafeRescueTasks.push({
      target,
      until: now + 30000
    });
  }

  function updateUnlockTaskRuntime(now, dt) {
    if (selectedRole !== PLAYER_ROLE.survivor || !matchStarted) return;
    updatePlayerKiteAndChaseEscapeTasks(now, dt);
    updateSafeRescueTasks(now);
  }

  function updatePlayerKiteAndChaseEscapeTasks(now, dt) {
    const active = player && !player.escaped && (player.state === "healthy" || player.state === "injured");
    const chased = active && hunter.target === player && distanceBetween(player, hunter) < 760;
    if (chased) {
      addUnlockTaskProgress("kiteSeconds", dt);
      if (!playerChaseTaskState) {
        playerChaseTaskState = { lastChasedAt: now };
      } else {
        playerChaseTaskState.lastChasedAt = now;
      }
      return;
    }
    if (!playerChaseTaskState) return;
    if (!active) {
      playerChaseTaskState = null;
      return;
    }
    if (now - playerChaseTaskState.lastChasedAt >= 2500) {
      addUnlockTaskProgress("escapeChase", 1);
      playerChaseTaskState = null;
    }
  }

  function updateSafeRescueTasks(now) {
    for (let index = pendingSafeRescueTasks.length - 1; index >= 0; index -= 1) {
      const task = pendingSafeRescueTasks[index];
      const target = task.target;
      if (!target || target.state === "downed" || target.state === "carried" || target.state === "seated" || target.state === "eliminated") {
        pendingSafeRescueTasks.splice(index, 1);
        continue;
      }
      if (now >= task.until) {
        addUnlockTaskProgress("safeRescue", 1);
        pendingSafeRescueTasks.splice(index, 1);
      }
    }
  }

  function unlockHiddenHunter() {
    hiddenHunterUnlocked = true;
    saveHiddenHunterUnlock();
    updateSetupPanels();
    if (hiddenCodeInput) hiddenCodeInput.value = "";
    if (roleDialogTitle && pendingRole === PLAYER_ROLE.hunter) roleDialogTitle.textContent = "选择追捕者 · 隐藏角色已解锁";
  }

  function updateHiddenUnlockPanel(role) {
    if (!hiddenUnlockForm) return;
    hiddenUnlockForm.classList.toggle("is-hidden", role !== PLAYER_ROLE.hunter || hiddenHunterUnlocked);
  }

  function submitHiddenHunterCode(event) {
    event.preventDefault();
    if (!hiddenCodeInput || pendingRole !== PLAYER_ROLE.hunter || hiddenHunterUnlocked) return;
    const code = hiddenCodeInput.value.trim().toLowerCase();
    if (code === HIDDEN_HUNTER_UNLOCK_CODE) {
      unlockHiddenHunter();
      return;
    }
    hiddenCodeInput.value = "";
    hiddenCodeInput.focus();
    if (roleDialogTitle) roleDialogTitle.textContent = "选择追捕者 · 暗号不对";
  }

  function handleHiddenCharacterUnlockKey(key) {
    if (!roleOverlay || roleOverlay.classList.contains("is-hidden")) return;
    if (!characterPanel || characterPanel.classList.contains("is-hidden")) return;
    if (pendingRole !== PLAYER_ROLE.hunter || hiddenHunterUnlocked) return;
    if (!key || key.length !== 1 || !/[a-z]/i.test(key)) return;

    hiddenUnlockBuffer = `${hiddenUnlockBuffer}${key.toLowerCase()}`.slice(-HIDDEN_HUNTER_UNLOCK_CODE.length);
    if (hiddenUnlockBuffer === HIDDEN_HUNTER_UNLOCK_CODE) unlockHiddenHunter();
  }

  function updateBadgePanel(role) {
    if (!badgePanel) return;
    badgePanel.classList.toggle("is-hidden", !role);
    const selected = role ? getSelectedBadgesForRole(role) : [];
    const purpleCount = role ? countBadgesByRarity(role, selected, "purple") : 0;
    const blueCount = role ? countBadgesByRarity(role, selected, "blue") : 0;
    if (badgeLimitReadout) badgeLimitReadout.textContent = `紫 ${purpleCount}/${BADGE_LIMITS.purple} · 蓝 ${blueCount}/${BADGE_LIMITS.blue}`;
    badgeButtons.forEach((button) => {
      const buttonRole = button.dataset.badgeRole;
      const rarity = button.dataset.badgeRarity || getBadgeRarity(buttonRole, button.dataset.badge);
      const selectedHere = selected.includes(button.dataset.badge);
      const limitReached = role && countBadgesByRarity(role, selected, rarity) >= (BADGE_LIMITS[rarity] || 0);
      button.classList.toggle("is-hidden", buttonRole !== role);
      button.classList.toggle("is-selected", selectedHere);
      button.disabled = buttonRole === role && !selectedHere && limitReached;
    });
  }

  function toggleBadgeSelection(role, badgeId) {
    if (!BADGE_CONFIG[role] || !BADGE_CONFIG[role][badgeId]) return;
    const selected = getSelectedBadgesForRole(role);
    const existingIndex = selected.indexOf(badgeId);
    if (existingIndex >= 0) {
      selected.splice(existingIndex, 1);
    } else {
      const rarity = getBadgeRarity(role, badgeId);
      const limit = BADGE_LIMITS[rarity] || 0;
      if (countBadgesByRarity(role, selected, rarity) >= limit) {
        updateBadgePanel(role);
        return;
      }
      selected.push(badgeId);
    }
    updateBadgePanel(role);
  }

  function updateAssistPanel(role) {
    if (!assistPanel) return;
    const visible = role === PLAYER_ROLE.hunter;
    assistPanel.classList.toggle("is-hidden", !visible);
    if (assistLimitReadout) assistLimitReadout.textContent = visible ? `已选 ${getHunterAssistName(selectedHunterAssist)}` : "携带 1 个";
    assistButtons.forEach((button) => {
      const selectedHere = button.dataset.assist === selectedHunterAssist;
      button.classList.toggle("is-hidden", !visible);
      button.classList.toggle("is-selected", selectedHere);
    });
  }

  function selectHunterAssist(assistId) {
    if (!HUNTER_ASSIST_SKILLS[assistId]) return;
    selectedHunterAssist = assistId;
    updateAssistPanel(pendingRole);
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
    survivor.selfHealUsed = false;
    survivor.bleedStacks = [];
    survivor.soulMarks = 0;
    survivor.soulReturnUntil = 0;
    survivor.shackleValue = 0;
    survivor.lastShackleAt = 0;
    survivor.shackledUntil = 0;
    survivor.chairProgress = 0;
    survivor.chairProgressPausedUntil = 0;
    survivor.injuredAt = null;
    survivor.downedAt = null;
    survivor.nextChairEliminates = false;
    survivor.carryProgress = 0;
    survivor.chair = null;
    survivor.escaped = false;
    survivor.boostUntil = 0;
    survivor.endgameBoostUntil = 0;
    survivor.adrenalineTriggered = false;
    survivor.borrowedTimeUntil = 0;
    survivor.borrowedTimePendingDamage = 0;
    survivor.borrowedTimeUsed = false;
    survivor.medicShieldUntil = 0;
    survivor.medicShieldHits = 0;
    survivor.medicAdrenalineUntil = 0;
    survivor.medicAdrenalinePendingDamage = 0;
    survivor.medicRescueShockPendingDamage = 0;
    survivor.stitchPack = null;
    survivor.timeDevice = null;
    survivor.invisibleUntil = 0;
    survivor.listenRevealUntil = 0;
    survivor.assistRevealUntil = 0;
    survivor.patrollerHoldUntil = 0;
    survivor.patrollerSlowUntil = 0;
    survivor.action = null;
    survivor.nextPackageAt = 0;
    survivor.nextTimeRewindAt = 0;
    survivor.nextMagicShowAt = 0;
    survivor.nextStitchPackAt = 0;
    survivor.nextPerfumeMistAt = 0;
    survivor.nextFencerLungeAt = 0;
    survivor.nextMedicAdrenalineAt = 0;
    survivor.nextFlywheelAt = 0;
    survivor.nextKneeJerkWindowAt = 0;
    survivor.nextKneeJerkPalletAt = 0;
    survivor.kneeJerkBoostUntil = 0;
    survivor.nextGeneralRideAt = 0;
    survivor.generalRideUntil = 0;
    survivor.generalRideWhips = 0;
    survivor.nextGeneralWhipAt = 0;
    survivor.perfumeBoostUntil = 0;
    survivor.perfumeUltimateCharges = 0;
    survivor.fencerStrideMarks = [];
    survivor.fencerLastSprintAngle = null;
    survivor.fencerNextStrideAt = 0;
    survivor.fencerLungePreparing = false;
    survivor.fencerLungePreparingAt = 0;
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
    if (selectedRole === PLAYER_ROLE.hunter && isSoulBinder()) {
      borrowSoul(now);
      return;
    }
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
    if (player.action && player.action.kind === "selfHealing") {
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

    if (player.state === "downed" && areExitsPowered()) {
      const gate = findNearestExitGate(player, 96);
      if (gate && gate.opened) {
        startEscape(player, gate, now);
        return;
      }
    }

    if (player.state === "downed") {
      startSelfHealing(player, now);
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
    if (areExitsPowered()) return null;
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

  function isInPerfumeMist(actor, kind = null, now = performance.now()) {
    return perfumeMists.some((mist) => {
      if (now >= mist.until) return false;
      if (kind && mist.kind !== kind) return false;
      return distanceBetween(actor, mist) <= mist.radius;
    });
  }

  function getActivePerfumeMistForActor(actor, now = performance.now()) {
    return perfumeMists.find((mist) => now < mist.until && distanceBetween(actor, mist) <= mist.radius) || null;
  }

  function isHunterInPerfumeMist(now = performance.now()) {
    return isInPerfumeMist(hunter, null, now);
  }

  function canAIHunterSeeThroughPerfume(target, now = performance.now()) {
    if (selectedRole === PLAYER_ROLE.hunter) return true;
    if (!getActivePerfumeMistForActor(hunter, now)) return true;
    if (distanceBetween(hunter, target) <= PERFUME_AI_CLOSE_VISION_RANGE) return true;
    return false;
  }

  function isInPerfumeUltimateMist(actor, now = performance.now()) {
    return isInPerfumeMist(actor, "ultimate", now);
  }

  function isHunterDisplacementBlocked(now = performance.now()) {
    return isInPerfumeUltimateMist(hunter, now);
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
    trackHunterSkillUseUnlock(now);
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

  function getBlinkDestination() {
    const target = getAimTargetFromPointer(null, null, true) || {
      x: hunter.x + Math.cos(hunter.angle) * ASSIST_BLINK_DISTANCE,
      y: hunter.y + Math.sin(hunter.angle) * ASSIST_BLINK_DISTANCE
    };
    const dx = target.x - hunter.x;
    const dy = target.y - hunter.y;
    const distance = Math.hypot(dx, dy);
    if (distance < 1) return { x: hunter.x, y: hunter.y };
    const scale = Math.min(ASSIST_BLINK_DISTANCE, distance) / distance;
    return {
      x: hunter.x + dx * scale,
      y: hunter.y + dy * scale
    };
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
    if (!canUseMagicShow(actor, now)) return false;
    const success = actor.magicShowMode === "hunter"
      ? magicShowMoveHunter(actor, now)
      : magicShowMoveSeatedSurvivor(actor, now);
    if (!success) {
      lanternAlert = {
        text: actor.magicShowMode === "hunter" ? "附近没有空椅子" : "没有可转移的上椅队友",
        until: now + 1400
      };
      return false;
    }
    actor.nextMagicShowAt = now + MAGIC_SHOW_COOLDOWN;
    chasePulseUntil = now + 520;
    return true;
  }

  function usePerfumeSkill(actor, now) {
    if (!canUsePerfumeMist(actor, now)) return false;
    if (hasPerfumeUltimate(actor)) {
      releasePerfumeUltimate(actor, now);
      return true;
    }
    releasePerfumeMist(actor, now);
    return true;
  }

  function releasePerfumeMist(actor, now) {
    perfumeMists.push({
      id: ++perfumeMistId,
      kind: "mist",
      owner: actor,
      x: actor.x,
      y: actor.y,
      radius: PERFUME_MIST_RADIUS,
      until: now + PERFUME_MIST_DURATION
    });
    actor.perfumeBoostUntil = now + PERFUME_MIST_DURATION;
    actor.perfumeUltimateCharges = Math.min(PERFUME_ULTIMATE_CHARGES, (actor.perfumeUltimateCharges || 0) + 1);
    actor.nextPerfumeMistAt = now + PERFUME_MIST_COOLDOWN;
    showAssistAlert(actor.perfumeUltimateCharges >= PERFUME_ULTIMATE_CHARGES ? "终极香炉已点燃" : "迷香", now, 1100);
  }

  function releasePerfumeUltimate(actor, now) {
    const mist = {
      id: ++perfumeMistId,
      kind: "ultimate",
      owner: actor,
      x: actor.x,
      y: actor.y,
      radius: PERFUME_ULTIMATE_RADIUS,
      until: now + PERFUME_ULTIMATE_DURATION
    };
    perfumeMists.push(mist);
    actor.perfumeUltimateCharges = 0;
    actor.nextPerfumeMistAt = now + PERFUME_MIST_COOLDOWN;
    spawnPerfumeIllusions(actor, mist, now);
    showAssistAlert("幻香大阵", now, 1200);
  }

  function spawnPerfumeIllusions(actor, mist, now) {
    for (let index = 0; index < PERFUME_ULTIMATE_ILLUSIONS; index += 1) {
      const angle = -Math.PI / 2 + index * (Math.PI * 2 / PERFUME_ULTIMATE_ILLUSIONS);
      const distance = mist.radius * 0.55;
      actorDecoys.push(createSmartDecoy(actor, mist.x + Math.cos(angle) * distance, mist.y + Math.sin(angle) * distance, angle, {
        state: "healthy",
        speed: actor.speed * 0.94,
        until: now + PERFUME_ULTIMATE_DURATION
      }));
    }
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

  function updateTwinSwordSystems(dt, now) {
    if (!isTwinSword()) {
      twinAim = null;
      return;
    }
    if (now >= (hunter.twinEnlightenedUntil || 0)) {
      if (hunter.twinWasEnlightened) {
        hunter.twinIntent = TWIN_INTENT_INITIAL;
        hunter.twinWasEnlightened = false;
      } else {
        hunter.twinIntent = Math.min(TWIN_INTENT_MAX, (hunter.twinIntent || TWIN_INTENT_INITIAL) + TWIN_INTENT_REGEN * dt);
      }
      if ((hunter.twinIntent || 0) >= TWIN_INTENT_MAX) enterTwinEnlightenment(now);
    }
    if (hunter.twinTimePower && now >= hunter.twinTimePower.until) hunter.twinTimePower = null;
    updateTwinSwordProjectiles(dt, now);
    updateTwinShadowZones(dt, now);
    updateTwinGaze(dt, now);
    updateTwinShackleDecay(dt, now);
  }

  function enterTwinEnlightenment(now) {
    const duration = hunter.presenceTier >= 1 ? TWIN_ENLIGHTENMENT_TIER_ONE_DURATION : TWIN_ENLIGHTENMENT_DURATION;
    hunter.twinIntent = TWIN_INTENT_MAX;
    hunter.twinEnlightenedUntil = now + duration;
    hunter.twinEnlightenmentCount = (hunter.twinEnlightenmentCount || 0) + 1;
    hunter.twinWasEnlightened = true;
    lanternAlert = {
      text: "万剑归宗",
      until: now + 1800
    };
  }

  function canTwinAffectSurvivor(survivor) {
    return survivor &&
      !survivor.escaped &&
      survivor.state !== "seated" &&
      survivor.state !== "carried" &&
      survivor.state !== "eliminated";
  }

  function updateTwinGaze(dt, now) {
    if (!isTwinForm(TWIN_FORM_CHIYIN)) return;
    getSurvivors().forEach((survivor) => {
      if (!canTwinAffectSurvivor(survivor)) return;
      const dx = survivor.x - hunter.x;
      const dy = survivor.y - hunter.y;
      const distance = Math.hypot(dx, dy);
      if (distance > TWIN_GAZE_RANGE) return;
      const angle = Math.atan2(dy, dx);
      if (Math.abs(angleDifference(hunter.angle, angle)) > TWIN_GAZE_ARC / 2) return;
      if (!hasWalkableLine(hunter.x, hunter.y, survivor.x, survivor.y, hunter.radius)) return;
      addTwinShackle(survivor, TWIN_GAZE_GAIN * dt, now, false);
    });
  }

  function updateTwinShadowZones(dt, now) {
    for (let index = twinShadowZones.length - 1; index >= 0; index -= 1) {
      const zone = twinShadowZones[index];
      if (now >= zone.until) {
        twinShadowZones.splice(index, 1);
        continue;
      }
      getSurvivors().forEach((survivor) => {
        if (!canTwinAffectSurvivor(survivor)) return;
        if (distanceBetween(survivor, zone) <= zone.radius) {
          addTwinShackle(survivor, TWIN_SHADOW_LOCK_GAIN * dt, now, hunter.presenceTier >= 2);
        }
      });
    }
  }

  function updateTwinShackleDecay(dt, now) {
    getSurvivors().forEach((survivor) => {
      if (!survivor.shackleValue || now - (survivor.lastShackleAt || 0) < TWIN_SHACKLE_DECAY_DELAY) return;
      survivor.shackleValue = Math.max(0, survivor.shackleValue - TWIN_SHACKLE_DECAY * dt);
    });
  }

  function addTwinShackle(survivor, amount, now, damageOnFull) {
    if (now < (survivor.shackledUntil || 0)) return;
    survivor.shackleValue = Math.min(TWIN_SHACKLE_MAX, (survivor.shackleValue || 0) + amount);
    survivor.lastShackleAt = now;
    if (survivor.shackleValue < TWIN_SHACKLE_MAX) return;
    survivor.shackleValue = 0;
    survivor.shackledUntil = now + TWIN_SHACKLE_LOCK_DURATION;
    if (damageOnFull) {
      applyHunterHit(survivor, now, {
        allowTerrorShock: false,
        applyBoneBleed: false,
        damage: 0.5
      });
    }
  }

  function updateTwinSwordProjectiles(dt, now) {
    for (let index = twinSwordProjectiles.length - 1; index >= 0; index -= 1) {
      const item = twinSwordProjectiles[index];
      const dx = item.vx * dt;
      const dy = item.vy * dt;
      item.x += dx;
      item.y += dy;
      item.traveled += Math.hypot(dx, dy);
      const target = getSurvivors().find((survivor) => {
        if (!canTwinAffectSurvivor(survivor) || survivor.state === "downed") return false;
        return distanceBetween(item, survivor) <= survivor.radius + TWIN_FLYING_SWORD_RADIUS;
      });
      if (target) {
        applyHunterHit(target, now, {
          allowTerrorShock: false,
          applyBoneBleed: false
        });
        twinSwordProjectiles.splice(index, 1);
        continue;
      }
      if (item.traveled >= TWIN_FLYING_SWORD_RANGE || collides(item.x, item.y, TWIN_FLYING_SWORD_RADIUS)) {
        twinSwordProjectiles.splice(index, 1);
      }
    }
  }

  function showTwinSkillFail(text, now = performance.now()) {
    lanternAlert = {
      text,
      until: now + 1100
    };
  }

  function getTwinSkillBlockReason(now) {
    if (!matchStarted || selectedRole !== PLAYER_ROLE.hunter || !isTwinSword()) return "未选择双生";
    if (hunter.action) return "动作中";
    if (hunter.carrying) return "牵人中";
    if (now < hunter.stunnedUntil || now < hunter.wipeUntil) return "硬直中";
    return "";
  }

  function canUseTwinSwordSkill(now, showReason = false) {
    const reason = getTwinSkillBlockReason(now);
    if (!reason) return true;
    if (showReason) showTwinSkillFail(reason, now);
    return false;
  }

  function switchTwinForm(now) {
    if (!canUseTwinSwordSkill(now, true)) return false;
    if (now < (hunter.nextTwinFormAt || 0)) {
      showTwinSkillFail("切换冷却中", now);
      return false;
    }
    hunter.twinForm = hunter.twinForm === TWIN_FORM_CHIYIN ? TWIN_FORM_QINGTIAN : TWIN_FORM_CHIYIN;
    hunter.nextTwinFormAt = now + TWIN_FORM_COOLDOWN;
    if (hunter.twinForm === TWIN_FORM_QINGTIAN) hunter.invisibleUntil = now + 5000;
    lanternAlert = {
      text: hunter.twinForm === TWIN_FORM_CHIYIN ? "池音形态" : "赵青天形态",
      until: now + 1400
    };
    return true;
  }

  function toggleTwinTimeMode() {
    if (!isTwinSword()) return;
    hunter.twinTimeMode = hunter.twinTimeMode === "self" ? "survivor" : "self";
    lanternAlert = {
      text: hunter.twinTimeMode === "self" ? "时之力 自身加速" : "时之力 求生减速",
      until: performance.now() + 1300
    };
  }

  function canActivateTwinDualCast(now) {
    return canUseTwinSwordSkill(now, true) &&
      hunter.presenceTier >= 1 &&
      now >= (hunter.nextTwinDualCastAt || 0);
  }

  function activateTwinDualCast(now) {
    if (!canActivateTwinDualCast(now)) {
      if (hunter.presenceTier < 1) showTwinSkillFail("需要一阶", now);
      else if (now < (hunter.nextTwinDualCastAt || 0)) showTwinSkillFail("双生冷却中", now);
      return false;
    }
    hunter.twinDualCastUntil = now + 8000;
    hunter.nextTwinDualCastAt = now + TWIN_DUAL_CAST_COOLDOWN;
    lanternAlert = {
      text: "双生之力 待发",
      until: now + 1400
    };
    return true;
  }

  function getTwinTimeFactor() {
    if (hunter.presenceTier >= 2) return Math.max(3, hunter.twinEnlightenmentCount || 0);
    return 2;
  }

  function startTwinAim(kind, now, clientX = null, clientY = null, pointerId = null, useLastPointer = true) {
    if (!canUseTwinSwordSkill(now, true)) return false;
    if (twinAim) return false;
    const target = getAimTargetFromPointer(clientX, clientY, useLastPointer) || {
      x: hunter.x + Math.cos(hunter.angle) * getTwinAimDefaultRange(kind),
      y: hunter.y + Math.sin(hunter.angle) * getTwinAimDefaultRange(kind)
    };
    twinAim = {
      kind,
      targetX: target.x,
      targetY: target.y,
      pointerId
    };
    return true;
  }

  function getTwinAimDefaultRange(kind) {
    if (kind === "sword") return TWIN_FLYING_SWORD_RANGE;
    if (kind === "secondary" && hunter.twinForm === TWIN_FORM_QINGTIAN) return hunter.presenceTier >= 2 ? 780 : TWIN_SPACE_POWER_RANGE;
    if (kind === "primary" && hunter.twinForm === TWIN_FORM_CHIYIN) return TWIN_SHADOW_LOCK_CAST_RANGE;
    return TWIN_SHADOW_STRIKE_CAST_RANGE;
  }

  function updateTwinAim(clientX, clientY, pointerId = null) {
    if (twinAim && twinAim.pointerId !== null && pointerId !== null && twinAim.pointerId !== pointerId) return;
    if (typeof clientX === "number" && typeof clientY === "number") rememberAimPointer(clientX, clientY);
    if (!twinAim) return;
    const target = getAimTargetFromPointer(clientX, clientY);
    if (!target) return;
    twinAim.targetX = target.x;
    twinAim.targetY = target.y;
  }

  function finishTwinAim(now, pointerId = null) {
    if (!twinAim) return false;
    if (twinAim.pointerId !== null && pointerId !== null && twinAim.pointerId !== pointerId) return false;
    const aim = twinAim;
    twinAim = null;
    if (!canUseTwinSwordSkill(now, true)) return false;
    if (aim.kind === "sword") return fireTwinFlyingSword(now, aim);
    const dual = hunter.presenceTier >= 1 && now < (hunter.twinDualCastUntil || 0);
    let used = false;
    if (hunter.twinForm === TWIN_FORM_QINGTIAN) {
      used = aim.kind === "primary" ? castTwinTimePower(now) : castTwinSpacePower(aim, now);
      if (dual) used = (aim.kind === "primary" ? castTwinShadowLock(aim, now, true) : castTwinShadowStrike(aim, now, true)) || used;
    } else {
      used = aim.kind === "primary" ? castTwinShadowLock(aim, now) : castTwinShadowStrike(aim, now);
      if (dual) used = (aim.kind === "primary" ? castTwinTimePower(now) : castTwinSpacePower(aim, now)) || used;
    }
    if (dual && used) hunter.twinDualCastUntil = 0;
    if (used) trackHunterSkillUseUnlock(now);
    return used;
  }

  function castTwinPrimaryInstant(now) {
    if (!canUseTwinSwordSkill(now, true)) return false;
    const dual = hunter.presenceTier >= 1 && now < (hunter.twinDualCastUntil || 0);
    const used = castTwinTimePower(now);
    if (dual && used) {
      castTwinShadowLock(getTwinAutoAim("primary"), now, true);
      hunter.twinDualCastUntil = 0;
    }
    if (used) trackHunterSkillUseUnlock(now);
    return used;
  }

  function getTwinAutoAim(kind) {
    const range = getTwinAimDefaultRange(kind);
    return {
      kind,
      targetX: hunter.x + Math.cos(hunter.angle) * range,
      targetY: hunter.y + Math.sin(hunter.angle) * range,
      pointerId: null
    };
  }

  function getClampedTwinAimPoint(aim, maxRange) {
    const dx = aim.targetX - hunter.x;
    const dy = aim.targetY - hunter.y;
    const distance = Math.hypot(dx, dy);
    const angle = distance > 6 ? Math.atan2(dy, dx) : hunter.angle;
    const range = Math.min(maxRange, Math.max(40, distance || maxRange));
    return {
      x: hunter.x + Math.cos(angle) * range,
      y: hunter.y + Math.sin(angle) * range,
      angle,
      range
    };
  }

  function spendTwinIntent(amount, now = performance.now()) {
    if ((hunter.twinIntent || 0) < amount) {
      showTwinSkillFail(`剑意不足 ${Math.floor(hunter.twinIntent || 0)}/${amount}`, now);
      return false;
    }
    hunter.twinIntent = Math.max(0, hunter.twinIntent - amount);
    return true;
  }

  function castTwinTimePower(now) {
    const factor = getTwinTimeFactor();
    const cost = hunter.presenceTier >= 2 ? 100 * factor : TWIN_TIME_POWER_COST;
    if (!spendTwinIntent(cost, now)) return false;
    hunter.twinTimePower = {
      kind: hunter.twinTimeMode || "self",
      factor,
      until: now + TWIN_TIME_POWER_DURATION
    };
    lanternAlert = {
      text: hunter.twinTimeMode === "self" ? `时之力 x${factor}` : `时之力 /${factor}`,
      until: now + 1500
    };
    chasePulseUntil = now + 360;
    return true;
  }

  function castTwinSpacePower(aim, now) {
    const target = getClampedTwinAimPoint(aim, hunter.presenceTier >= 2 ? 780 : TWIN_SPACE_POWER_RANGE);
    const cost = hunter.presenceTier >= 2 ? Math.ceil(target.range / 26) * 5 : TWIN_SPACE_POWER_COST;
    if (!spendTwinIntent(cost, now)) return false;
    const safe = findNearestSafePosition(target.x, target.y, hunter.radius);
    hunter.x = safe.x;
    hunter.y = safe.y;
    hunter.vx = 0;
    hunter.vy = 0;
    hunter.path = [];
    hunter.pathGoal = null;
    chasePulseUntil = now + 420;
    return true;
  }

  function castTwinShadowLock(aim, now, ignoreCooldown = false) {
    if (!ignoreCooldown && now < (hunter.nextTwinShadowLockAt || 0)) return false;
    const target = getClampedTwinAimPoint(aim, TWIN_SHADOW_LOCK_CAST_RANGE);
    twinShadowZones.push({
      id: ++twinShadowZoneId,
      x: target.x,
      y: target.y,
      radius: TWIN_SHADOW_LOCK_RANGE,
      until: now + TWIN_SHADOW_LOCK_DURATION
    });
    if (!ignoreCooldown) hunter.nextTwinShadowLockAt = now + TWIN_SHADOW_LOCK_COOLDOWN;
    chasePulseUntil = now + 360;
    return true;
  }

  function castTwinShadowStrike(aim, now, ignoreCooldown = false) {
    if (!ignoreCooldown && now < (hunter.nextTwinShadowStrikeAt || 0)) return false;
    const target = getClampedTwinAimPoint(aim, TWIN_SHADOW_STRIKE_CAST_RANGE);
    getSurvivors().forEach((survivor) => {
      if (!canTwinAffectSurvivor(survivor)) return;
      if (distanceBetween(survivor, target) > TWIN_SHADOW_STRIKE_RANGE) return;
      applyHunterHit(survivor, now, {
        allowTerrorShock: false,
        applyBoneBleed: false,
        damage: 0.5
      });
      if (hunter.presenceTier >= 2) addTwinShackle(survivor, 20, now, false);
    });
    if (!ignoreCooldown) hunter.nextTwinShadowStrikeAt = now + TWIN_SHADOW_STRIKE_COOLDOWN;
    chasePulseUntil = now + 420;
    return true;
  }

  function fireTwinFlyingSword(now, aim = null) {
    if (!canUseTwinSwordSkill(now, true)) return false;
    if ((hunter.twinFlyingSwords || 0) <= 0) {
      showTwinSkillFail("没有飞剑", now);
      return false;
    }
    const target = aim ? getClampedTwinAimPoint(aim, TWIN_FLYING_SWORD_RANGE) : null;
    const angle = target ? target.angle : hunter.angle;
    hunter.twinFlyingSwords -= 1;
    twinSwordProjectiles.push({
      id: ++twinSwordProjectileId,
      x: hunter.x + Math.cos(angle) * (hunter.radius + 18),
      y: hunter.y + Math.sin(angle) * (hunter.radius + 18),
      vx: Math.cos(angle) * TWIN_FLYING_SWORD_SPEED,
      vy: Math.sin(angle) * TWIN_FLYING_SWORD_SPEED,
      angle,
      traveled: 0
    });
    chasePulseUntil = now + 320;
    trackHunterSkillUseUnlock(now);
    return true;
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
    return !survivor.action || survivor.action.kind === "beingHealed" || survivor.action.kind === "selfHealing";
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
      if (item.destroyed || item.survivor) return;
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
    if (target === apprentice || !target && canReceiveStitchPack(apprentice)) {
      applyStitchPack(apprentice, now, apprentice);
      apprentice.nextStitchPackAt = now + STITCH_PACK_COOLDOWN;
      apprentice.nextInteractAt = now + 450;
      apprentice.path = [];
      apprentice.pathGoal = null;
      if (apprentice.kind === "ai") apprentice.healDecision = null;
      return;
    }
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
    apprentice.nextStitchPackAt = now + STITCH_PACK_COOLDOWN;
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
    if (hunter.carrying) return;
    if (healer.action || healer.state !== "healthy" && healer.state !== "injured" || !canBeHealed(target) || healer === target) return;
    if (healer.kind === "ai" && hunter.target === healer) return;
    healer.action = {
      kind: "healing",
      start: now,
      target,
      healer
    };
    if (!target.action || target.action.kind === "selfHealing") {
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

  function startSelfHealing(actor, now) {
    if (hunter.carrying) return false;
    if (!actor || actor.action || actor.escaped || actor.state !== "downed" || isBeingPickedUp(actor)) return false;
    if (actor.selfHealUsed && (actor.healProgress || 0) >= SELF_HEAL_CAP) return false;
    actor.action = {
      kind: "selfHealing",
      start: now,
      lastUpdate: now,
      actor
    };
    actor.vx = 0;
    actor.vy = 0;
    actor.healDecision = null;
    return true;
  }

  function cancelHealingDuringCarry(actor) {
    if (!hunter.carrying || !actor || !actor.action || !["healing", "beingHealed", "selfHealing"].includes(actor.action.kind)) return false;
    cancelHealing(actor.action);
    actor.action = null;
    actor.healDecision = null;
    actor.vx = 0;
    actor.vy = 0;
    return true;
  }

  function startRepair(actor, point, now) {
    if (isPracticeTargetMode() && actor.kind === "ai") return;
    if (areExitsPowered()) return;
    if (actor.action || actor.state === "downed" || actor.escaped || point.completed || isRepairingPoint(actor, point)) return;
    if (isFinalCipherPoint(point) && (point.progress || 0) >= FINAL_CIPHER_PRIME_PROGRESS && shouldCompletePrimedFinalCipher(actor, now)) {
      finishRepair(point);
      return;
    }
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
    if (finalCipherGuard && finalCipherGuard.point === point) finalCipherGuard = null;
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
    if (getCompletedRepairCount() === REPAIR_REQUIRED) triggerAdrenalineBadges(performance.now());
  }

  function triggerAdrenalineBadges(now) {
    let activated = 0;
    getSurvivors().forEach((survivor) => {
      if (!hasSurvivorBadge(survivor, "adrenaline") || survivor.adrenalineTriggered) return;
      if (survivor.escaped || survivor.state === "eliminated" || survivor.state === "seated" || survivor.state === "carried") return;
      survivor.adrenalineTriggered = true;
      activated += 1;
      restoreOneHealthState(survivor, now);
      survivor.endgameBoostUntil = Math.max(survivor.endgameBoostUntil || 0, now + ADRENALINE_BOOST_DURATION);
    });
    if (activated > 0) showAssistAlert("回光返照", now, 1400);
  }

  function restoreOneHealthState(survivor, now) {
    survivor.damageProgress = 0;
    survivor.healProgress = 0;
    if (survivor.state === "downed") {
      survivor.state = "injured";
      survivor.injuredAt = now;
      survivor.downedAt = null;
      survivor.action = null;
      return;
    }
    if (survivor.state === "injured") {
      survivor.state = "healthy";
      survivor.injuredAt = null;
    }
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
    if (actor.action || actor.escaped || !areExitsPowered() || !gate.opened) return;
    if (actor.state !== "healthy" && actor.state !== "injured" && actor.state !== "downed") return;
    actor.action = {
      kind: "escaping",
      start: now,
      until: now + GATE_ESCAPE_DURATION,
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
      until: now + HATCH_ESCAPE_DURATION,
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
    if (consumeExcitementGuard(now)) return;
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
    if (consumeExcitementGuard(now)) return;
    if (isTwinSword() && (hunter.twinFlyingSwords || 0) > 0) {
      hunter.twinFlyingSwords -= 1;
      lanternAlert = {
        text: "飞剑抵消控制",
        until: now + 1300
      };
      chasePulseUntil = now + 320;
      return;
    }
    if (hunter.action && hunter.action.kind === "attackWindup") {
      hunter.action = null;
      hunter.lastAttackHit = false;
    }
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

  function consumeExcitementGuard(now) {
    if (now >= (hunter.excitementGuardUntil || 0)) return false;
    hunter.excitementGuardUntil = 0;
    showAssistAlert("兴奋抵消眩晕", now, 1000);
    chasePulseUntil = now + 320;
    return true;
  }

  function getHunterCarrySpeedMultiplier() {
    if (!hunter.carrying) return 1;
    return Math.max(0.66, 0.84 - (hunter.carrying.carryProgress || 0) * 0.18);
  }

  function startChairSurvivor(survivor, targetChair, now) {
    if (!survivor || !targetChair || targetChair.destroyed || targetChair.survivor || survivor.state !== "carried") return;
    if (survivor.nextChairEliminates && !(isKiteSimulatorMode() && survivor === player)) {
      survivor.chair = targetChair;
      targetChair.survivor = survivor;
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
    const rescueUntil = now + getSurvivorRescueDuration(rescuer);
    rescuer.action = {
      kind: "rescuing",
      start: now,
      until: rescueUntil,
      target,
      rescuer
    };
    target.chairProgressPausedUntil = Math.max(target.chairProgressPausedUntil || 0, rescueUntil);
    rescuer.vx = 0;
    rescuer.vy = 0;
  }

  function finishRescue(action) {
    const target = action.target;
    if (!target || target.state !== "seated" || !target.chair) return;
    const rescuer = action.rescuer;
    const now = performance.now();
    const chair = target.chair;
    if (target.chairProgress >= 0.5) {
      target.nextChairEliminates = true;
    } else {
      target.chairProgress = 0.5;
      target.nextChairEliminates = false;
    }
    target.state = "injured";
    target.chairProgressPausedUntil = 0;
    target.injuredAt = now;
    target.action = null;
    target.chair = null;
    target.carryProgress = 0;
    target.downedAt = null;
    target.boostUntil = now + getSurvivorHitBoostDuration(target, RESCUE_SPEED_BOOST_DURATION);
    chair.survivor = null;
    const safe = findNearestSafePosition(chair.x + 58, chair.y + 36, target.radius);
    target.x = safe.x;
    target.y = safe.y;
    target.path = [];
    target.pathGoal = null;
    target.healDecision = null;
    target.objectiveDecision = null;
    applyMedicRescueShield(rescuer, target, now);
    applyBorrowedTimeRescue(rescuer, target, now);
    settleMedicRescueShockDamage(rescuer, now);
    trackPlayerRescue(rescuer, target, now);
    chasePulseUntil = now + 360;
  }

  function applyMedicRescueShield(rescuer, target, now) {
    if (!isMedic(rescuer)) return;
    [rescuer, target].forEach((survivor) => {
      if (!survivor || survivor.escaped || survivor.state === "eliminated") return;
      survivor.medicShieldUntil = now + MEDIC_RESCUE_SHIELD_DURATION;
      survivor.medicShieldHits = 1;
    });
    showAssistAlert("前线护盾", now, 1000);
  }

  function applyBorrowedTimeRescue(rescuer, target, now) {
    if (!rescuer || !hasSurvivorBadge(rescuer, "borrowedTime") || rescuer.borrowedTimeUsed) return;
    rescuer.borrowedTimeUsed = true;
    [rescuer, target].forEach((survivor) => {
      if (!survivor || survivor.escaped || survivor.state === "eliminated") return;
      survivor.borrowedTimeUntil = Math.max(survivor.borrowedTimeUntil || 0, now + BORROWED_TIME_DURATION);
      survivor.borrowedTimePendingDamage = 0;
    });
    showAssistAlert("搏命挣扎", now, 1200);
  }

  function isBeingRescued(target) {
    return getSurvivors().some((survivor) => {
      return survivor.action && survivor.action.kind === "rescuing" && survivor.action.target === target;
    });
  }

  function eliminateSurvivor(survivor) {
    if (!survivor || survivor.state === "eliminated") return;
    if (isKiteSimulatorMode() && survivor === player) {
      survivor.nextChairEliminates = false;
      survivor.carryProgress = 0;
      survivor.downedAt = null;
      survivor.chairProgress = Math.min(survivor.chairProgress || 0, 0.99);
      return;
    }
    if (survivor.chair) {
      survivor.chair.survivor = null;
      survivor.chair.destroyed = true;
    }
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
    const activeHealers = getActiveHealers(target);
    const playerHealedTeammate = activeHealers.includes(player) && target !== player;
    activeHealers.forEach((healer) => {
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
    clearOneSoulMark(target);
    target.stitchPack = null;
    target.action = null;
    target.kiteDecision = null;
    target.healDecision = null;
    target.path = [];
    target.pathGoal = null;
    target.repathAt = 0;
    if (playerHealedTeammate) trackPlayerHealTeammate(target);
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

  function isSurvivorInHunterAttackCone(survivor, rangeMultiplier = 1) {
    const dx = survivor.x - hunter.x;
    const dy = survivor.y - hunter.y;
    const distance = Math.hypot(dx, dy);
    if (distance > hunter.attackRange * rangeMultiplier + survivor.radius * 0.5) return false;
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
      toY: destination.y,
      obstacleLabel: obstacle.label
    };
  }

  function maybeTriggerKneeJerk(actor, action, now) {
    if (!actor || actor === hunter || !hasSurvivorBadge(actor, "kneeJerk")) return;
    if (!action || action.kind !== "vaulting") return;
    const isWindow = action.obstacleLabel === "window";
    const cooldownKey = isWindow ? "nextKneeJerkWindowAt" : "nextKneeJerkPalletAt";
    if (now < (actor[cooldownKey] || 0)) return;
    actor.kneeJerkBoostUntil = now + KNEE_JERK_DURATION;
    actor[cooldownKey] = now + KNEE_JERK_COOLDOWN;
    if (actor === player) showAssistAlert(isWindow ? "膝跳反射 窗" : "膝跳反射 板", now, 850);
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

  function updateFencerLungeAction(actor, action, now) {
    if (!isFencer(actor) || actor.state !== "healthy" && actor.state !== "injured" || actor.escaped) {
      actor.action = null;
      return true;
    }

    const dt = Math.max(0, (now - (action.lastUpdate || action.start)) / 1000);
    action.lastUpdate = now;
    const speed = FENCER_LUNGE_DISTANCE / (FENCER_LUNGE_DURATION / 1000);
    const remaining = Math.max(0, FENCER_LUNGE_DISTANCE - (action.distance || 0));
    const step = Math.min(speed * dt, remaining);
    const beforeX = actor.x;
    const beforeY = actor.y;
    const moved = moveActorSmart(actor, Math.cos(action.angle) * step, Math.sin(action.angle) * step);
    action.distance = (action.distance || 0) + moved;
    actor.angle = action.angle;
    actor.vx = (actor.x - beforeX) / Math.max(dt, 0.001);
    actor.vy = (actor.y - beforeY) / Math.max(dt, 0.001);

    if (!action.hitHunter && distanceBetween(actor, hunter) <= actor.radius + hunter.radius + 18) {
      interruptHunterByStun(now, FENCER_LUNGE_HUNTER_STUN);
      action.hitHunter = true;
      showAssistAlert("突刺命中", now, 650);
    }

    if (now >= action.until || action.distance >= FENCER_LUNGE_DISTANCE - 0.5 || moved < 0.01 && step > 0.5) {
      finishFencerLunge(actor, action, now);
    }
    return true;
  }

  function updateFlywheelAction(actor, action, now) {
    if (!hasSurvivorBadge(actor, "flywheel") || actor.state !== "healthy" && actor.state !== "injured" || actor.escaped) {
      actor.action = null;
      return true;
    }

    const dt = Math.max(0, (now - (action.lastUpdate || action.start)) / 1000);
    action.lastUpdate = now;
    const speed = FLYWHEEL_DISTANCE / (FLYWHEEL_DURATION / 1000);
    const remaining = Math.max(0, FLYWHEEL_DISTANCE - (action.distance || 0));
    const step = Math.min(speed * dt, remaining);
    const beforeX = actor.x;
    const beforeY = actor.y;
    const moved = moveActorSmart(actor, Math.cos(action.angle) * step, Math.sin(action.angle) * step);
    action.distance = (action.distance || 0) + moved;
    actor.angle = action.angle;
    actor.vx = (actor.x - beforeX) / Math.max(dt, 0.001);
    actor.vy = (actor.y - beforeY) / Math.max(dt, 0.001);

    if (now >= action.until || action.distance >= FLYWHEEL_DISTANCE - 0.5 || moved < 0.01 && step > 0.5) {
      actor.vx = 0;
      actor.vy = 0;
      actor.action = null;
    }
    return true;
  }

  function updateHunterAttackWindupAction(action, now) {
    hunter.status = "attacking";
    hunter.angle = action.angle;
    if (now < hunter.stunnedUntil || now < hunter.wipeUntil) {
      hunter.action = null;
      hunter.vx = 0;
      hunter.vy = 0;
      return true;
    }

    if (action.charging) {
      const dt = Math.max(0, (now - (action.lastUpdate || action.start)) / 1000);
      action.lastUpdate = now;
      const move = selectedRole === PLAYER_ROLE.hunter ? getMoveVector() : { x: 0, y: 0, length: 0 };
      const speed = getHunterMoveSpeed() * getHunterCarrySpeedMultiplier() * CHARGED_ATTACK_MOVE_MULTIPLIER;
      const beforeX = hunter.x;
      const beforeY = hunter.y;
      if (move.length > 0.1) hunter.angle = Math.atan2(move.y, move.x);
      action.angle = hunter.angle || action.angle;
      moveActor(hunter, move.x * speed * dt, move.y * speed * dt);
      hunter.vx = (hunter.x - beforeX) / Math.max(dt, 0.001);
      hunter.vy = (hunter.y - beforeY) / Math.max(dt, 0.001);
      if (now - action.start >= CHARGED_ATTACK_MAX_HOLD) {
        finishChargedHunterAttack(action, now, CHARGED_ATTACK_MAX_HOLD);
      }
      return true;
    }

    const motionStart = action.releaseStart || action.start;
    const duration = Math.max(1, action.until - motionStart);
    const dt = Math.max(0, (now - (action.lastUpdate || motionStart)) / 1000);
    action.lastUpdate = now;
    const lungeDistance = action.lungeDistance || 0;
    const remaining = Math.max(0, lungeDistance - (action.distance || 0));
    const step = Math.min((lungeDistance / (duration / 1000)) * dt, remaining);
    const beforeX = hunter.x;
    const beforeY = hunter.y;
    const moved = step > 0 ? moveActorSmart(hunter, Math.cos(action.angle) * step, Math.sin(action.angle) * step) : 0;
    action.distance = (action.distance || 0) + moved;
    hunter.vx = (hunter.x - beforeX) / Math.max(dt, 0.001);
    hunter.vy = (hunter.y - beforeY) / Math.max(dt, 0.001);

    if (now >= action.until) {
      commitHunterAttack(now);
      resolveHunterAttack(action, now);
    }
    return true;
  }

  function finishFencerLunge(actor, action, now) {
    actor.vx = 0;
    actor.vy = 0;
    actor.action = null;
    const obstacle = findFencerAutoVaultObstacle(actor, action.angle);
    if (obstacle) {
      startVault(actor, obstacle, getSurvivorVaultDuration(actor, obstacle.label === "window" ? 320 : 260), now, "vaulting");
    }
  }

  function findFencerAutoVaultObstacle(actor, angle) {
    const forward = { x: Math.cos(angle), y: Math.sin(angle) };
    let best = null;
    let bestScore = Infinity;
    windows.concat(pallets.filter((pallet) => pallet.label === "dropped")).forEach((obstacle) => {
      const dx = obstacle.x - actor.x;
      const dy = obstacle.y - actor.y;
      const distance = distanceToProp(actor, obstacle);
      if (distance > 118) return;
      const length = Math.hypot(dx, dy);
      if (length < 0.001) return;
      const alignment = (dx / length) * forward.x + (dy / length) * forward.y;
      if (alignment < 0.35) return;
      const score = distance - alignment * 24;
      if (score < bestScore) {
        best = obstacle;
        bestScore = score;
      }
    });
    return best;
  }

  function updateActorAction(actor, now) {
    if (!actor.action) return false;

    const action = actor.action;
    if (action.kind === "sawDash") {
      return updateSawDashAction(action, now);
    }

    if (action.kind === "attackWindup") {
      if (actor !== hunter) {
        actor.action = null;
        return true;
      }
      return updateHunterAttackWindupAction(action, now);
    }

    if (action.kind === "fencerLunge") {
      return updateFencerLungeAction(actor, action, now);
    }

    if (action.kind === "flywheelDash") {
      return updateFlywheelAction(actor, action, now);
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
      if (cancelHealingDuringCarry(actor)) return true;
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

    if (action.kind === "selfHealing") {
      if (cancelHealingDuringCarry(actor)) return true;
      actor.vx = 0;
      actor.vy = 0;
      if (actor.state !== "downed" || actor.escaped || isBeingPickedUp(actor)) {
        actor.action = null;
        return true;
      }
      const elapsed = Math.max(0, now - (action.lastUpdate || now));
      action.lastUpdate = now;
      const selfHealLimit = actor.selfHealUsed ? SELF_HEAL_CAP : 1;
      actor.healProgress = Math.min(selfHealLimit, (actor.healProgress || 0) + (elapsed * getSurvivorHealPower(actor)) / SELF_HEAL_DOWNED_DURATION);
      if (!actor.selfHealUsed && actor.healProgress >= 1) {
        actor.selfHealUsed = true;
        finishHealing(actor);
      } else if (actor.selfHealUsed && actor.healProgress >= SELF_HEAL_CAP) {
        actor.action = null;
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
      if (cancelHealingDuringCarry(actor)) return true;
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
      if (actor.kind === "ai" && !action.gate.opened && exitGates.some((gate) => gate.opened)) {
        cancelGateOpen(action);
        actor.action = null;
        actor.objectiveDecision = null;
        return true;
      }
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
        (isHatchEscape ? !isHatchOpen() : !areExitsPowered()) ||
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
    if (now >= action.until) {
      maybeTriggerKneeJerk(actor, action, now);
      actor.action = null;
    }
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
    if (selectedRole === PLAYER_ROLE.hunter && activePatroller) return activePatroller;
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
    drawPerfumeMists();
    drawObjectives();
    drawSoulLamps();
    drawHunterAssistObjects();
    drawTwinShadowZones();
    drawStitchPackDrops();
    drawTimeDevices();
    drawActorDecoys();
    drawRects(walls, "#141b16", "#293529");
    drawWindows();
    drawPallets();
    drawPackageAim();
    drawTwinAim();
    drawBlinkAim();
    drawShiftAim();
    drawTwinSwordProjectiles();
    drawPackageProjectiles();
    drawPerfumerSenseAuras();
    drawAssistListenDirectionArrows();
    drawWantedDirectionArrow();
    drawHunter();
    drawTeammates();
    drawPlayer();
    drawPerfumeMistOcclusion();
    drawHeartbeatIndicators();

    ctx.restore();
    drawPerfumeVisionOverlay();
    drawHunterTinnitusIndicator();
    drawMatchResult();
    drawLanternAlert();
    drawRepairCalibration();
    updateReadouts();
  }

  function drawGround() {
    const hospital = currentMapLayout && currentMapLayout.theme === "hospital";
    ctx.fillStyle = hospital ? "#1d2727" : "#202b23";
    ctx.fillRect(0, 0, world.width, world.height);

    ctx.strokeStyle = hospital ? "rgba(210, 230, 225, 0.052)" : "rgba(238, 243, 237, 0.035)";
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

    ctx.fillStyle = hospital ? "rgba(176, 206, 194, 0.055)" : "rgba(217, 183, 106, 0.06)";
    ctx.fillRect(54, 54, world.width - 108, world.height - 108);

    if (hospital) {
      ctx.fillStyle = "rgba(232, 245, 238, 0.035)";
      for (let x = 120; x < world.width - 120; x += 320) {
        ctx.fillRect(x, 54, 24, world.height - 108);
      }
      ctx.fillStyle = "rgba(185, 95, 82, 0.13)";
      [
        { x: 610, y: 720, r: 52 },
        { x: 1430, y: 1030, r: 42 },
        { x: 1960, y: 540, r: 34 },
        { x: 450, y: 1420, r: 30 }
      ].forEach((stain) => {
        ctx.beginPath();
        ctx.ellipse(stain.x, stain.y, stain.r, stain.r * 0.48, 0.4, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.strokeStyle = "rgba(95, 143, 130, 0.18)";
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(180, 880);
      ctx.lineTo(world.width - 180, 880);
      ctx.moveTo(1210, 160);
      ctx.lineTo(1210, world.height - 170);
      ctx.stroke();
    }
  }

  function drawPerfumeMists() {
    const now = performance.now();
    perfumeMists.forEach((mist) => {
      if (now >= mist.until) return;
      const progress = Math.max(0, Math.min(1, (mist.until - now) / (mist.kind === "ultimate" ? PERFUME_ULTIMATE_DURATION : PERFUME_MIST_DURATION)));
      const pulse = 1 + Math.sin(now / 260 + mist.id) * 0.035;
      ctx.save();
      ctx.translate(mist.x, mist.y);
      ctx.scale(pulse, pulse);
      const gradient = ctx.createRadialGradient(0, 0, mist.radius * 0.18, 0, 0, mist.radius);
      if (mist.kind === "ultimate") {
        gradient.addColorStop(0, `rgba(245, 252, 255, ${0.72 * progress})`);
        gradient.addColorStop(0.48, `rgba(226, 244, 255, ${0.58 * progress})`);
        gradient.addColorStop(0.88, `rgba(168, 220, 255, ${0.28 * progress})`);
        gradient.addColorStop(1, "rgba(168, 220, 255, 0)");
        ctx.strokeStyle = `rgba(156, 220, 255, ${0.55 * progress})`;
        ctx.lineWidth = 4;
      } else {
        gradient.addColorStop(0, `rgba(250, 253, 255, ${0.76 * progress})`);
        gradient.addColorStop(0.5, `rgba(238, 248, 255, ${0.62 * progress})`);
        gradient.addColorStop(0.88, `rgba(206, 235, 255, ${0.28 * progress})`);
        gradient.addColorStop(1, "rgba(206, 235, 255, 0)");
        ctx.strokeStyle = `rgba(240, 250, 255, ${0.7 * progress})`;
        ctx.lineWidth = 2.5;
      }
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(0, 0, mist.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.setLineDash(mist.kind === "ultimate" ? [18, 10] : [10, 8]);
      ctx.beginPath();
      ctx.arc(0, 0, mist.radius, 0, Math.PI * 2);
      ctx.stroke();
      for (let puff = 0; puff < 10; puff += 1) {
        const puffAngle = now / 900 + mist.id + puff * 2.17;
        const puffRadius = mist.radius * (0.18 + (puff % 5) * 0.14);
        const x = Math.cos(puffAngle) * puffRadius;
        const y = Math.sin(puffAngle * 0.8) * puffRadius;
        ctx.fillStyle = `rgba(255, 255, 255, ${(mist.kind === "ultimate" ? 0.18 : 0.22) * progress})`;
        ctx.beginPath();
        ctx.arc(x, y, mist.radius * (mist.kind === "ultimate" ? 0.18 : 0.16), 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    });
  }

  function drawPerfumerSenseAuras() {
    if (isInfiniteSawboneMode()) return;
    const now = performance.now();
    getSurvivors().forEach((survivor) => {
      if (!isPerfumer(survivor) || survivor.escaped || survivor.state === "eliminated") return;
      const distance = distanceBetween(survivor, hunter);
      if (distance > PERFUMER_SENSE_FAR_RANGE) return;
      const near = distance <= PERFUMER_SENSE_NEAR_RANGE;
      const pulse = 1 + Math.sin(now / 180) * 0.04;
      const radius = (near ? 34 : 30) * pulse;
      ctx.save();
      ctx.translate(survivor.x, survivor.y);
      ctx.strokeStyle = near ? "rgba(54, 128, 255, 0.9)" : "rgba(159, 222, 255, 0.76)";
      ctx.fillStyle = near ? "rgba(54, 128, 255, 0.14)" : "rgba(159, 222, 255, 0.1)";
      ctx.lineWidth = near ? 4 : 3;
      ctx.beginPath();
      ctx.arc(0, 0, radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    });
  }

  function drawPerfumeMistOcclusion() {
    const now = performance.now();
    perfumeMists.forEach((mist) => {
      if (now >= mist.until) return;
      const duration = mist.kind === "ultimate" ? PERFUME_ULTIMATE_DURATION : PERFUME_MIST_DURATION;
      const progress = Math.max(0, Math.min(1, (mist.until - now) / duration));
      const fadeIn = Math.min(1, (duration - (mist.until - now)) / 900);
      const alpha = progress * fadeIn;
      const pulse = 1 + Math.sin(now / 280 + mist.id) * 0.025;
      ctx.save();
      ctx.translate(mist.x, mist.y);
      ctx.scale(pulse, pulse);

      const gradient = ctx.createRadialGradient(0, 0, mist.radius * 0.06, 0, 0, mist.radius);
      gradient.addColorStop(0, `rgba(255, 255, 255, ${0.82 * alpha})`);
      gradient.addColorStop(0.42, `rgba(250, 253, 255, ${0.72 * alpha})`);
      gradient.addColorStop(0.74, `rgba(238, 248, 255, ${0.48 * alpha})`);
      gradient.addColorStop(1, "rgba(238, 248, 255, 0)");
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(0, 0, mist.radius, 0, Math.PI * 2);
      ctx.fill();

      for (let puff = 0; puff < 14; puff += 1) {
        const puffAngle = now / 760 + mist.id * 0.7 + puff * 1.73;
        const puffRadius = mist.radius * (0.12 + (puff % 7) * 0.11);
        const x = Math.cos(puffAngle) * puffRadius;
        const y = Math.sin(puffAngle * 0.86) * puffRadius;
        ctx.fillStyle = `rgba(255, 255, 255, ${0.36 * alpha})`;
        ctx.beginPath();
        ctx.arc(x, y, mist.radius * (mist.kind === "ultimate" ? 0.2 : 0.18), 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    });
  }

  function drawPerfumeVisionOverlay() {
    if (selectedRole !== PLAYER_ROLE.hunter || !isHunterInPerfumeMist(performance.now())) return;
    const inner = Math.min(width, height) * 0.2;
    const outer = Math.max(width, height) * 0.43;
    const gradient = ctx.createRadialGradient(width / 2, height / 2, inner, width / 2, height / 2, outer);
    gradient.addColorStop(0, "rgba(5, 9, 16, 0)");
    gradient.addColorStop(0.42, "rgba(0, 0, 0, 0)");
    gradient.addColorStop(0.58, "rgba(0, 0, 0, 0.96)");
    gradient.addColorStop(1, "rgba(0, 0, 0, 1)");
    ctx.save();
    ctx.fillStyle = "rgba(250, 253, 255, 0.82)";
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
    ctx.restore();
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
    const hasImage = drawDeviceImage("chair", 58, 88, item.destroyed ? 0.32 : survivor ? 1 : 0.88);
    if (hasImage) {
      if (item.destroyed) {
        ctx.strokeStyle = "rgba(185, 95, 82, 0.85)";
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(-24, -30);
        ctx.lineTo(24, 30);
        ctx.moveTo(24, -30);
        ctx.lineTo(-24, 30);
        ctx.stroke();
      }
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

    ctx.fillStyle = item.destroyed ? "rgba(70, 58, 52, 0.24)" : survivor ? "rgba(185, 95, 82, 0.28)" : "rgba(217, 183, 106, 0.14)";
    ctx.strokeStyle = item.destroyed ? "#5f5550" : survivor ? "#b95f52" : "#d9b76a";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(-18, -24, 36, 48, 6);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = survivor ? "#f2cbc5" : "#fff0bc";
    ctx.fillRect(-10, -18, 20, 7);
    ctx.fillRect(-10, 12, 20, 7);
    ctx.fillRect(-3, -10, 6, 24);

    if (item.destroyed) {
      ctx.strokeStyle = "rgba(185, 95, 82, 0.85)";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(-18, -24);
      ctx.lineTo(18, 24);
      ctx.moveTo(18, -24);
      ctx.lineTo(-18, 24);
      ctx.stroke();
    }

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

  function drawHunterAssistObjects() {
    const now = performance.now();
    assistPeeperWards.forEach((ward) => {
      if (now >= ward.until) return;
      ctx.save();
      ctx.translate(ward.x, ward.y);
      ctx.fillStyle = "rgba(93, 178, 255, 0.06)";
      ctx.strokeStyle = "rgba(93, 178, 255, 0.28)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, ASSIST_PEEPER_RANGE, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "#203245";
      ctx.strokeStyle = "#8dd0ff";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.roundRect(-15, -10, 30, 20, 6);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "#8dd0ff";
      ctx.beginPath();
      ctx.arc(0, 0, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });

    if (activeShiftPortals) {
      drawShiftPortal(activeShiftPortals.near, now, "近");
      drawShiftPortal(activeShiftPortals.far, now, "远");
    }

    if (!activePatroller) return;
    ctx.save();
    ctx.translate(activePatroller.x, activePatroller.y);
    ctx.rotate(activePatroller.angle);
    ctx.fillStyle = "#101611";
    ctx.strokeStyle = "#d9b76a";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(20, 0);
    ctx.lineTo(-14, -13);
    ctx.lineTo(-8, 0);
    ctx.lineTo(-14, 13);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  function drawAssistListenDirectionArrows() {
    if (selectedRole !== PLAYER_ROLE.hunter || !assistListenTargets.length) return;
    const now = performance.now();
    assistListenTargets = assistListenTargets.filter((item) => {
      return item &&
        item.survivor &&
        now < item.until &&
        !item.survivor.escaped &&
        item.survivor.state !== "eliminated";
    });
    assistListenTargets.forEach((item, index) => {
      const target = item.survivor;
      const angle = Math.atan2(target.y - hunter.y, target.x - hunter.x);
      const alpha = Math.max(0.25, Math.min(1, (item.until - now) / ASSIST_LISTEN_DURATION));
      const distance = 38 + index * 10;
      ctx.save();
      ctx.translate(hunter.x + Math.cos(angle) * distance, hunter.y + Math.sin(angle) * distance);
      ctx.rotate(angle);
      ctx.globalAlpha = alpha;
      ctx.fillStyle = "rgba(215, 239, 255, 0.94)";
      ctx.strokeStyle = "rgba(37, 113, 208, 0.95)";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(22, 0);
      ctx.lineTo(-10, -13);
      ctx.lineTo(-4, 0);
      ctx.lineTo(-10, 13);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    });
  }

  function drawWantedDirectionArrow() {
    if (selectedRole !== PLAYER_ROLE.hunter || !hunter.wantedTarget || performance.now() >= (hunter.wantedUntil || 0)) return;
    const target = hunter.wantedTarget;
    if (!target || target.escaped || target.state === "eliminated" || target.state === "seated" || target.state === "carried") return;
    const now = performance.now();
    const angle = Math.atan2(target.y - hunter.y, target.x - hunter.x);
    const alpha = Math.max(0.24, Math.min(1, (hunter.wantedUntil - now) / WANTED_REVEAL_DURATION));
    ctx.save();
    ctx.translate(hunter.x + Math.cos(angle) * 54, hunter.y + Math.sin(angle) * 54);
    ctx.rotate(angle);
    ctx.globalAlpha = alpha;
    ctx.fillStyle = "rgba(255, 226, 143, 0.95)";
    ctx.strokeStyle = "rgba(174, 58, 44, 0.95)";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(28, 0);
    ctx.lineTo(-12, -16);
    ctx.lineTo(-5, 0);
    ctx.lineTo(-12, 16);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  function drawBlinkAim() {
    if (selectedRole !== PLAYER_ROLE.hunter || hunter.assistSkill !== "blink" || activePatroller || isHunterDisplacementBlocked(performance.now()) || !canUseHunterAssist(performance.now())) return;
    const destination = getBlinkDestination();
    ctx.save();
    ctx.strokeStyle = "rgba(217, 183, 106, 0.72)";
    ctx.fillStyle = "rgba(217, 183, 106, 0.12)";
    ctx.lineWidth = 2;
    ctx.setLineDash([10, 8]);
    ctx.beginPath();
    ctx.moveTo(hunter.x, hunter.y);
    ctx.lineTo(destination.x, destination.y);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.arc(destination.x, destination.y, hunter.radius + 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  function drawShiftAim() {
    if (selectedRole !== PLAYER_ROLE.hunter || hunter.assistSkill !== "shift" || activePatroller || activeShiftPortals || isHunterDisplacementBlocked(performance.now()) || !canUseHunterAssist(performance.now())) return;
    const destination = getShiftDestination();
    ctx.save();
    ctx.strokeStyle = "rgba(185, 112, 255, 0.72)";
    ctx.fillStyle = "rgba(185, 112, 255, 0.1)";
    ctx.lineWidth = 2;
    ctx.setLineDash([12, 8]);
    ctx.beginPath();
    ctx.moveTo(hunter.x, hunter.y);
    ctx.lineTo(destination.x, destination.y);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.arc(destination.x, destination.y, ASSIST_SHIFT_RADIUS, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  function drawShiftPortal(portal, now, label) {
    const pulse = 0.88 + Math.sin(now / 150) * 0.12;
    ctx.save();
    ctx.translate(portal.x, portal.y);
    ctx.scale(pulse, pulse);
    ctx.fillStyle = "rgba(83, 51, 118, 0.38)";
    ctx.strokeStyle = "rgba(246, 232, 255, 0.86)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.ellipse(0, 0, ASSIST_SHIFT_RADIUS, ASSIST_SHIFT_RADIUS * 0.72, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.strokeStyle = "rgba(185, 112, 255, 0.86)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(0, 0, ASSIST_SHIFT_RADIUS * 0.62, ASSIST_SHIFT_RADIUS * 0.42, 0, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = "#f3e8ff";
    ctx.font = "700 12px system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(label, 0, 0);
    ctx.restore();
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

  function drawTwinShadowZones() {
    if (twinShadowZones.length === 0) return;
    const now = performance.now();
    twinShadowZones.forEach((zone) => {
      const life = Math.max(0, Math.min(1, (zone.until - now) / TWIN_SHADOW_LOCK_DURATION));
      ctx.save();
      ctx.translate(zone.x, zone.y);
      ctx.fillStyle = `rgba(116, 83, 168, ${0.08 + life * 0.08})`;
      ctx.strokeStyle = "rgba(188, 154, 255, 0.44)";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, 0, zone.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    });
  }

  function drawTwinAim() {
    if (!twinAim || !isTwinSword()) return;
    const range = twinAim.kind === "sword"
      ? 0
      : hunter.twinForm === TWIN_FORM_QINGTIAN
      ? twinAim.kind === "primary" ? 0 : (hunter.presenceTier >= 2 ? 780 : TWIN_SPACE_POWER_RANGE)
      : twinAim.kind === "primary" ? TWIN_SHADOW_LOCK_RANGE : TWIN_SHADOW_STRIKE_RANGE;
    const castRange = twinAim.kind === "sword"
      ? TWIN_FLYING_SWORD_RANGE
      : hunter.twinForm === TWIN_FORM_QINGTIAN
      ? (hunter.presenceTier >= 2 ? 780 : TWIN_SPACE_POWER_RANGE)
      : twinAim.kind === "primary" ? TWIN_SHADOW_LOCK_CAST_RANGE : TWIN_SHADOW_STRIKE_CAST_RANGE;
    const target = getClampedTwinAimPoint(twinAim, castRange);
    ctx.save();
    ctx.strokeStyle = twinAim.kind === "primary" ? "rgba(136, 216, 255, 0.7)" : "rgba(217, 183, 106, 0.72)";
    ctx.fillStyle = twinAim.kind === "primary" ? "rgba(136, 216, 255, 0.11)" : "rgba(217, 183, 106, 0.1)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(hunter.x, hunter.y);
    ctx.lineTo(target.x, target.y);
    ctx.stroke();
    if (range > 0) {
      ctx.beginPath();
      ctx.arc(target.x, target.y, range, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.arc(target.x, target.y, twinAim.kind === "sword" ? 18 : 52, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawTwinSwordProjectiles() {
    twinSwordProjectiles.forEach((item) => {
      ctx.save();
      ctx.translate(item.x, item.y);
      ctx.rotate(item.angle);
      drawQingtianFlyingSword();
      ctx.restore();
    });
  }

  function drawQingtianFlyingSword() {
    ctx.save();
    ctx.shadowColor = "rgba(90, 178, 255, 0.54)";
    ctx.shadowBlur = 12;

    const bladeGradient = ctx.createLinearGradient(-18, 0, 36, 0);
    bladeGradient.addColorStop(0, "#f7fbff");
    bladeGradient.addColorStop(0.45, "#9dd8ff");
    bladeGradient.addColorStop(1, "#2f78d6");

    ctx.fillStyle = "rgba(79, 165, 255, 0.18)";
    ctx.beginPath();
    ctx.moveTo(-32, 0);
    ctx.quadraticCurveTo(0, -15, 42, 0);
    ctx.quadraticCurveTo(0, 15, -32, 0);
    ctx.fill();

    ctx.fillStyle = bladeGradient;
    ctx.strokeStyle = "#eef8ff";
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(39, 0);
    ctx.lineTo(6, -6);
    ctx.lineTo(-18, -3);
    ctx.lineTo(-24, 0);
    ctx.lineTo(-18, 3);
    ctx.lineTo(6, 6);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.shadowBlur = 0;
    ctx.strokeStyle = "rgba(255, 255, 255, 0.72)";
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(-14, 0);
    ctx.lineTo(31, 0);
    ctx.stroke();

    ctx.strokeStyle = "#4f6f9f";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(-24, -9);
    ctx.lineTo(-10, 9);
    ctx.moveTo(-24, 9);
    ctx.lineTo(-10, -9);
    ctx.stroke();

    ctx.fillStyle = "#2d7ad9";
    ctx.strokeStyle = "#d7efff";
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.arc(-18, 0, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.strokeStyle = "#1b385f";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(-27, 0);
    ctx.lineTo(-43, 0);
    ctx.stroke();

    ctx.fillStyle = "#d7efff";
    ctx.beginPath();
    ctx.arc(-45, 0, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
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
      ctx.globalAlpha = selectedRole === PLAYER_ROLE.hunter ? 1 : 0.34 + fade * 0.34;
      drawHumanoidCharacter(decoy, {
        type: "survivor",
        scale: 0.95,
        decoy: true,
        now
      });
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

  function getActorSpeed(actor) {
    return Math.hypot(actor.vx || 0, actor.vy || 0);
  }

  function drawCharacterShadow(scale = 1, alpha = 0.28) {
    ctx.fillStyle = `rgba(0, 0, 0, ${alpha})`;
    ctx.beginPath();
    ctx.ellipse(2 * scale, 10 * scale, 24 * scale, 14 * scale, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  function canUseWalkCycle(actor, type) {
    if (!actor || actor.state === "downed" || actor.state === "seated" || actor.state === "carried") return false;
    if (type === "hunter") {
      return !["attacking", "wipe", "miss", "stunned", "breaking", "pickingUp", "placing", "vaulting"].includes(hunter.status);
    }
    return !actor.action || !["repairing", "openingGate", "escaping", "rescuing", "healing", "beingHealed", "dismantlingLamp", "vaulting", "palletVaulting", "droppingPallet"].includes(actor.action.kind);
  }

  function getCharacterImageKey(actor, type) {
    if (type === "hunter") {
      if (actor.characterId === TWIN_SWORD_ID) {
        return actor.twinForm === TWIN_FORM_CHIYIN ? "twinChiyin" : "twinQingtian";
      }
      return actor.characterId;
    }
    return actor.characterId || actor.owner && actor.owner.characterId;
  }

  function getCharacterSprite(actor, type) {
    const key = getCharacterImageKey(actor, type);
    const image = CHARACTER_IMAGES[key];
    if (!key || !image || !image.complete || !image.naturalWidth) return null;
    if (CHARACTER_SPRITE_CACHE[key]) return CHARACTER_SPRITE_CACHE[key];
    const sprite = buildCharacterSprite(image, key);
    CHARACTER_SPRITE_CACHE[key] = sprite;
    return sprite;
  }

  function buildCharacterSprite(image, key) {
    const targetHeight = 112;
    const scale = targetHeight / image.naturalHeight;
    const temp = document.createElement("canvas");
    temp.width = Math.max(1, Math.round(image.naturalWidth * scale));
    temp.height = targetHeight;
    const tempCtx = temp.getContext("2d", { willReadFrequently: true });
    tempCtx.drawImage(image, 0, 0, temp.width, temp.height);
    const imageData = tempCtx.getImageData(0, 0, temp.width, temp.height);
    const data = imageData.data;
    const bg = sampleSpriteBackground(data, temp.width, temp.height);
    floodSpriteBackground(data, temp.width, temp.height, bg);
    let minX = temp.width;
    let minY = temp.height;
    let maxX = 0;
    let maxY = 0;
    for (let y = 0; y < temp.height; y += 1) {
      for (let x = 0; x < temp.width; x += 1) {
        const index = (y * temp.width + x) * 4 + 3;
        if (data[index] > 12) {
          minX = Math.min(minX, x);
          minY = Math.min(minY, y);
          maxX = Math.max(maxX, x);
          maxY = Math.max(maxY, y);
        }
      }
    }
    tempCtx.putImageData(imageData, 0, 0);
    if (minX > maxX || minY > maxY) return null;
    const padding = 3;
    minX = Math.max(0, minX - padding);
    minY = Math.max(0, minY - padding);
    maxX = Math.min(temp.width - 1, maxX + padding);
    maxY = Math.min(temp.height - 1, maxY + padding);
    const bounds = {
      x: minX,
      y: minY,
      w: maxX - minX + 1,
      h: maxY - minY + 1
    };
    const sprite = document.createElement("canvas");
    sprite.width = bounds.w;
    sprite.height = bounds.h;
    const spriteCtx = sprite.getContext("2d");
    spriteCtx.imageSmoothingEnabled = false;
    spriteCtx.drawImage(temp, bounds.x, bounds.y, bounds.w, bounds.h, 0, 0, bounds.w, bounds.h);
    return {
      image: sprite,
      width: sprite.width,
      height: sprite.height
    };
  }

  function sampleSpriteBackground(data, width, height) {
    const points = [
      [2, 2],
      [width - 3, 2],
      [2, height - 3],
      [width - 3, height - 3],
      [Math.floor(width / 2), 2]
    ];
    const color = [0, 0, 0];
    points.forEach(([x, y]) => {
      const index = (Math.max(0, Math.min(height - 1, y)) * width + Math.max(0, Math.min(width - 1, x))) * 4;
      color[0] += data[index];
      color[1] += data[index + 1];
      color[2] += data[index + 2];
    });
    return color.map((value) => value / points.length);
  }

  function floodSpriteBackground(data, width, height, bg) {
    const visited = new Uint8Array(width * height);
    const queue = [];
    for (let x = 0; x < width; x += 1) {
      queue.push(x, (height - 1) * width + x);
    }
    for (let y = 1; y < height - 1; y += 1) {
      queue.push(y * width, y * width + width - 1);
    }
    let transparent = 0;
    while (queue.length) {
      const pixel = queue.pop();
      if (visited[pixel]) continue;
      visited[pixel] = 1;
      const index = pixel * 4;
      const diff = Math.abs(data[index] - bg[0]) + Math.abs(data[index + 1] - bg[1]) + Math.abs(data[index + 2] - bg[2]);
      if (diff > 108) continue;
      data[index + 3] = 0;
      transparent += 1;
      const x = pixel % width;
      const y = Math.floor(pixel / width);
      if (x > 0) queue.push(pixel - 1);
      if (x < width - 1) queue.push(pixel + 1);
      if (y > 0) queue.push(pixel - width);
      if (y < height - 1) queue.push(pixel + width);
    }
    return transparent;
  }

  function drawCharacterSprite(actor, type, scale, now, decoy = false) {
    const sprite = getCharacterSprite(actor, type);
    if (!sprite || !sprite.image || !sprite.width || !sprite.height) return false;
    const speed = getActorSpeed(actor);
    const moving = speed > 18 && canUseWalkCycle(actor, type);
    const phase = moving ? Math.sin(now / 90 + (actor.x + actor.y) * 0.018) : Math.sin(now / 520 + (actor.x || 0) * 0.01) * 0.16;
    const attackLift = type === "hunter" ? getHunterAttackWindupLift(actor, now) : 0;
    const targetHeight = (type === "hunter" ? 76 : 66) * scale;
    const drawHeight = actor.state === "downed" ? targetHeight * 0.82 : targetHeight;
    const drawWidth = drawHeight * sprite.width / sprite.height;
    const bob = actor.state === "downed" ? 0 : moving ? Math.abs(phase) * -2 : phase * 0.9;
    const flip = Math.cos(actor.angle || 0) < -0.08 ? -1 : 1;
    const lean = actor.state === "downed" ? Math.PI / 2 : moving ? phase * 0.035 : -attackLift * 0.16;
    ctx.save();
    ctx.translate(-attackLift * 5 * scale, bob - attackLift * 2 * scale);
    ctx.rotate(lean);
    ctx.scale(flip, 1);
    if (decoy) ctx.globalAlpha *= selectedRole === PLAYER_ROLE.hunter ? 1 : 0.72;
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(sprite.image, -drawWidth / 2, -drawHeight + 16 * scale, drawWidth, drawHeight);
    ctx.imageSmoothingEnabled = true;
    ctx.restore();
    return true;
  }

  function drawLimb(x1, y1, x2, y2, color, width) {
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }

  function drawHumanoidCharacter(actor, options = {}) {
    const now = options.now || performance.now();
    const type = options.type || "survivor";
    const scale = options.scale || 1;
    const fill = actor.state === "downed" ? "#879188" : actor.fill || options.fill || "#e9efe6";
    const core = actor.core || options.core || "#d9b76a";
    const outline = "#101611";
    const speed = getActorSpeed(actor);
    const moving = speed > 18 && canUseWalkCycle(actor, type);
    const phase = moving ? Math.sin(now / 90 + (actor.x + actor.y) * 0.018) : Math.sin(now / 520 + (actor.x || 0) * 0.01) * 0.16;
    const stride = moving ? phase : phase * 0.35;
    const bob = moving ? Math.abs(phase) * -1.6 : phase;
    const hunterScale = type === "hunter" ? 1.16 : 1;
    const finalScale = scale * hunterScale;
    const attackLift = type === "hunter" ? getHunterAttackWindupLift(actor, now) : 0;

    ctx.save();
    if (actor.state === "downed") {
      drawCharacterShadow(finalScale, 0.22);
      if (drawCharacterSprite(actor, type, finalScale, now, options.decoy)) {
        ctx.restore();
        return;
      }
      if (type === "survivor" && isMedic(actor)) {
        drawMedicCharacter(actor, finalScale, now, options.decoy, true);
        ctx.restore();
        return;
      }
      ctx.rotate((actor.angle || 0) + Math.PI / 2);
      drawCharacterShadow(finalScale, 0.24);
      ctx.translate(0, 5 * finalScale);
      drawLimb(-15 * finalScale, -8 * finalScale, 13 * finalScale, -8 * finalScale, outline, 8 * finalScale);
      drawLimb(-12 * finalScale, 8 * finalScale, 13 * finalScale, 8 * finalScale, outline, 8 * finalScale);
      ctx.fillStyle = fill;
      ctx.strokeStyle = outline;
      ctx.lineWidth = 3 * finalScale;
      ctx.beginPath();
      ctx.roundRect(-19 * finalScale, -12 * finalScale, 35 * finalScale, 24 * finalScale, 9 * finalScale);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = core;
      ctx.beginPath();
      ctx.arc(19 * finalScale, 0, 8 * finalScale, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      return;
    }

    if (actor.state === "carried") {
      drawCharacterShadow(finalScale, 0.16);
      ctx.strokeStyle = "rgba(238, 243, 237, 0.62)";
      ctx.lineWidth = 2 * finalScale;
      ctx.beginPath();
      ctx.moveTo(0, -36 * finalScale);
      ctx.lineTo(0, -10 * finalScale);
      ctx.stroke();
      ctx.fillStyle = "rgba(217, 183, 106, 0.22)";
      ctx.strokeStyle = "#d9b76a";
      ctx.lineWidth = 2 * finalScale;
      ctx.beginPath();
      ctx.ellipse(0, -42 * finalScale, 14 * finalScale, 19 * finalScale, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    } else {
      drawCharacterShadow(finalScale, type === "hunter" ? 0.34 : 0.25);
    }

    if (drawCharacterSprite(actor, type, finalScale, now, options.decoy)) {
      if (type === "hunter") drawHunterAttackWindupOverlay(actor, finalScale, now);
      ctx.restore();
      return;
    }

    if (type === "survivor" && isMedic(actor)) {
      drawMedicCharacter(actor, finalScale, now, options.decoy);
      ctx.restore();
      return;
    }

    ctx.rotate(actor.angle || 0);
    if (attackLift > 0) ctx.rotate(-attackLift * 0.12);
    ctx.translate(0, bob * finalScale);

    const armColor = type === "hunter" ? "#2a1412" : "#162019";
    const legColor = type === "hunter" ? "#2a1412" : "#172119";
    const handColor = type === "hunter" ? actor.core || "#ffd5cd" : core;
    const headX = 13 * finalScale;
    const bodyX = -2 * finalScale;
    const legBackX = -16 * finalScale;

    drawLimb(-1 * finalScale, -11 * finalScale, (-13 + attackLift * 14) * finalScale, (-19 - stride * 8 - attackLift * 16) * finalScale, armColor, 5 * finalScale);
    drawLimb(-1 * finalScale, 11 * finalScale, (-13 + attackLift * 18) * finalScale, (19 + stride * 8 - attackLift * 34) * finalScale, armColor, 5 * finalScale);
    drawLimb(legBackX, -7 * finalScale, (-25 - stride * 6) * finalScale, (-13 + stride * 5) * finalScale, legColor, 6 * finalScale);
    drawLimb(legBackX, 7 * finalScale, (-25 + stride * 6) * finalScale, (13 + stride * 5) * finalScale, legColor, 6 * finalScale);

    ctx.fillStyle = fill;
    ctx.strokeStyle = outline;
    ctx.lineWidth = 3.5 * finalScale;
    ctx.beginPath();
    ctx.roundRect(-18 * finalScale, -14 * finalScale, 34 * finalScale, 28 * finalScale, 10 * finalScale);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = core;
    ctx.strokeStyle = outline;
    ctx.lineWidth = 2.5 * finalScale;
    ctx.beginPath();
    ctx.arc(headX, 0, 10 * finalScale, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = outline;
    ctx.beginPath();
    ctx.arc((headX + 4 * finalScale), -3 * finalScale, 1.7 * finalScale, 0, Math.PI * 2);
    ctx.arc((headX + 4 * finalScale), 3 * finalScale, 1.7 * finalScale, 0, Math.PI * 2);
    ctx.fill();

    if (type === "hunter") {
      drawHunterHeldItem(actor, finalScale, attackLift);
    } else {
      drawSurvivorHeldItem(actor, finalScale, handColor, options.decoy);
    }
    ctx.restore();
  }

  function drawMedicCross(cx, cy, size, color, scale) {
    ctx.strokeStyle = color;
    ctx.lineWidth = 2.2 * scale;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(cx, cy - size);
    ctx.lineTo(cx, cy + size);
    ctx.moveTo(cx - size, cy);
    ctx.lineTo(cx + size, cy);
    ctx.stroke();
  }

  function drawMedicCharacter(actor, scale, now, decoy = false, downed = false) {
    const outline = "#101611";
    const coat = actor.state === "downed" ? "#b8c8bf" : "#f3fffb";
    const trim = decoy ? "#c7d4cf" : "#3d9f8b";
    const undershirt = "#b7d6c1";
    const skin = actor.core || "#5aa475";
    const pants = "#1f3430";
    const bag = "#d7b35f";
    const speed = getActorSpeed(actor);
    const moving = speed > 18 && canUseWalkCycle(actor, "survivor");
    const phase = moving ? Math.sin(now / 90 + (actor.x + actor.y) * 0.018) : Math.sin(now / 520 + (actor.x || 0) * 0.01) * 0.16;
    const stride = moving ? phase : phase * 0.35;
    const bob = moving ? Math.abs(phase) * -1.6 : phase;

    if (downed) {
      ctx.rotate((actor.angle || 0) + Math.PI / 2);
      ctx.translate(0, 5 * scale);
      drawLimb(-17 * scale, -10 * scale, 13 * scale, -10 * scale, outline, 8 * scale);
      drawLimb(-14 * scale, 10 * scale, 13 * scale, 10 * scale, outline, 8 * scale);
      ctx.fillStyle = pants;
      drawLimb(-18 * scale, -8 * scale, -28 * scale, -14 * scale, pants, 6 * scale);
      drawLimb(-18 * scale, 8 * scale, -28 * scale, 14 * scale, pants, 6 * scale);
      ctx.fillStyle = coat;
      ctx.strokeStyle = outline;
      ctx.lineWidth = 3 * scale;
      ctx.beginPath();
      ctx.roundRect(-20 * scale, -13 * scale, 36 * scale, 26 * scale, 8 * scale);
      ctx.fill();
      ctx.stroke();
      ctx.strokeStyle = trim;
      ctx.lineWidth = 2 * scale;
      ctx.beginPath();
      ctx.moveTo(-3 * scale, -11 * scale);
      ctx.lineTo(-3 * scale, 11 * scale);
      ctx.stroke();
      drawMedicCross(2 * scale, 0, 4 * scale, trim, scale);
      ctx.fillStyle = skin;
      ctx.strokeStyle = outline;
      ctx.lineWidth = 2.5 * scale;
      ctx.beginPath();
      ctx.arc(19 * scale, 0, 8.5 * scale, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "#f7fffb";
      ctx.strokeStyle = outline;
      ctx.lineWidth = 2 * scale;
      ctx.beginPath();
      ctx.roundRect(13 * scale, -8 * scale, 13 * scale, 6 * scale, 2 * scale);
      ctx.fill();
      ctx.stroke();
      drawMedicCross(19.5 * scale, -5 * scale, 2.5 * scale, trim, scale);
      return;
    }

    ctx.rotate(actor.angle || 0);
    ctx.translate(0, bob * scale);

    drawLimb(-2 * scale, -11 * scale, (-14 - stride * 3) * scale, (-20 - stride * 8) * scale, outline, 5.5 * scale);
    drawLimb(-2 * scale, 11 * scale, (-14 + stride * 3) * scale, (20 + stride * 8) * scale, outline, 5.5 * scale);
    drawLimb(-16 * scale, -7 * scale, (-26 - stride * 6) * scale, (-13 + stride * 5) * scale, pants, 6 * scale);
    drawLimb(-16 * scale, 7 * scale, (-26 + stride * 6) * scale, (13 + stride * 5) * scale, pants, 6 * scale);

    ctx.fillStyle = coat;
    ctx.strokeStyle = outline;
    ctx.lineWidth = 3.5 * scale;
    ctx.beginPath();
    ctx.roundRect(-19 * scale, -15 * scale, 36 * scale, 30 * scale, 9 * scale);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = undershirt;
    ctx.beginPath();
    ctx.roundRect(-9 * scale, -10 * scale, 13 * scale, 20 * scale, 4 * scale);
    ctx.fill();
    ctx.strokeStyle = trim;
    ctx.lineWidth = 2 * scale;
    ctx.beginPath();
    ctx.moveTo(-2 * scale, -13 * scale);
    ctx.lineTo(-2 * scale, 13 * scale);
    ctx.moveTo(7 * scale, -10 * scale);
    ctx.lineTo(12 * scale, -5 * scale);
    ctx.stroke();
    drawMedicCross(-12 * scale, -1 * scale, 4 * scale, trim, scale);

    ctx.fillStyle = bag;
    ctx.strokeStyle = outline;
    ctx.lineWidth = 2 * scale;
    ctx.beginPath();
    ctx.roundRect(-18 * scale, 12 * scale, 14 * scale, 10 * scale, 2.5 * scale);
    ctx.fill();
    ctx.stroke();
    drawMedicCross(-11 * scale, 17 * scale, 2.5 * scale, "#f7fffb", scale);

    ctx.fillStyle = skin;
    ctx.strokeStyle = outline;
    ctx.lineWidth = 2.5 * scale;
    ctx.beginPath();
    ctx.arc(14 * scale, 0, 10 * scale, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#f7fffb";
    ctx.strokeStyle = outline;
    ctx.lineWidth = 2 * scale;
    ctx.beginPath();
    ctx.roundRect(6 * scale, -11 * scale, 16 * scale, 8 * scale, 3 * scale);
    ctx.fill();
    ctx.stroke();
    drawMedicCross(14 * scale, -7 * scale, 3 * scale, trim, scale);

    ctx.fillStyle = outline;
    ctx.beginPath();
    ctx.arc(18 * scale, -3 * scale, 1.7 * scale, 0, Math.PI * 2);
    ctx.arc(18 * scale, 3 * scale, 1.7 * scale, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawSurvivorHeldItem(actor, scale, color, decoy = false) {
    const characterId = actor.characterId || actor.owner && actor.owner.characterId;
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = 2.5 * scale;
    if (decoy) {
      ctx.fillStyle = "#eef3ed";
      ctx.font = `900 ${10 * scale}px ui-sans-serif, system-ui`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("替", -2 * scale, 0);
      return;
    }
    if (characterId === MESSENGER_ID) {
      ctx.beginPath();
      ctx.roundRect(-12 * scale, -21 * scale, 13 * scale, 9 * scale, 2 * scale);
      ctx.fill();
      return;
    }
    if (characterId === APPRENTICE_ID) {
      ctx.beginPath();
      ctx.moveTo(-13 * scale, 19 * scale);
      ctx.lineTo(0, 15 * scale);
      ctx.lineTo(-9 * scale, 25 * scale);
      ctx.stroke();
      return;
    }
    if (characterId === MEDIC_ID) {
      ctx.fillStyle = "#f4fffb";
      ctx.beginPath();
      ctx.roundRect(-14 * scale, -22 * scale, 14 * scale, 12 * scale, 2 * scale);
      ctx.fill();
      ctx.strokeStyle = "#3d9f8b";
      ctx.lineWidth = 2 * scale;
      ctx.beginPath();
      ctx.moveTo(-7 * scale, -20 * scale);
      ctx.lineTo(-7 * scale, -12 * scale);
      ctx.moveTo(-11 * scale, -16 * scale);
      ctx.lineTo(-3 * scale, -16 * scale);
      ctx.stroke();
      return;
    }
    if (characterId === ACTOR_ID) {
      ctx.beginPath();
      ctx.arc(-12 * scale, -20 * scale, 6 * scale, 0, Math.PI * 2);
      ctx.stroke();
      return;
    }
    ctx.beginPath();
    ctx.arc(-10 * scale, 20 * scale, 4 * scale, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawHunterHeldItem(actor, scale, attackLift = 0) {
    const characterId = actor.characterId || hunter.characterId;
    if (characterId === SAWBONE_ID) {
      ctx.strokeStyle = "#d8d0bd";
      ctx.lineWidth = 4 * scale;
      ctx.beginPath();
      ctx.moveTo((4 + attackLift * 2) * scale, (18 - attackLift * 24) * scale);
      ctx.lineTo((31 - attackLift * 4) * scale, (25 - attackLift * 56) * scale);
      ctx.stroke();
      ctx.fillStyle = "#8f4f45";
      ctx.beginPath();
      ctx.arc((31 - attackLift * 4) * scale, (25 - attackLift * 56) * scale, 5 * scale, 0, Math.PI * 2);
      ctx.fill();
      return;
    }
    if (characterId === LANTERN_KEEPER_ID) {
      ctx.strokeStyle = "#9cc7ff";
      ctx.lineWidth = 2.5 * scale;
      ctx.beginPath();
      ctx.moveTo(0, (-15 - attackLift * 4) * scale);
      ctx.lineTo((22 - attackLift * 6) * scale, (-28 - attackLift * 24) * scale);
      ctx.stroke();
      ctx.fillStyle = "rgba(117, 179, 255, 0.72)";
      ctx.beginPath();
      ctx.roundRect((19 - attackLift * 6) * scale, (-35 - attackLift * 24) * scale, 10 * scale, 14 * scale, 3 * scale);
      ctx.fill();
      return;
    }
    if (characterId === TWIN_SWORD_ID) {
      ctx.strokeStyle = "#d7efff";
      ctx.lineWidth = 3 * scale;
      ctx.beginPath();
      ctx.moveTo(3 * scale, (17 - attackLift * 28) * scale);
      ctx.lineTo(33 * scale, (22 - attackLift * 52) * scale);
      ctx.stroke();
      ctx.strokeStyle = "#8f7dff";
      ctx.beginPath();
      ctx.moveTo(3 * scale, (-17 - attackLift * 8) * scale);
      ctx.lineTo(31 * scale, (-23 - attackLift * 20) * scale);
      ctx.stroke();
      return;
    }
    ctx.strokeStyle = actor.core || "#ffd5cd";
    ctx.lineWidth = 3 * scale;
    ctx.beginPath();
    ctx.moveTo((2 + attackLift * 4) * scale, (18 - attackLift * 26) * scale);
    ctx.lineTo((25 + attackLift * 2) * scale, (21 - attackLift * 54) * scale);
    ctx.stroke();
  }

  function drawPlayer() {
    if (player.escaped || player.state === "eliminated") return;
    const now = performance.now();
    if (shouldHideSurvivorFromHunterView(player, now)) return;
    ctx.save();
    ctx.translate(player.x, player.y);
    if (isSurvivorInvisible(player, now)) ctx.globalAlpha = 0.48;
    drawHumanoidCharacter(player, { type: "survivor", scale: 1.02, now });
    ctx.restore();
    drawSoulSiphonFlame(player, now);

    if (player.action && ["repairing", "openingGate", "escaping", "rescuing", "dismantlingLamp"].includes(player.action.kind)) {
      drawSurvivorLabel(player);
    } else if (player.state !== "healthy" || getDamageProgressPercent(player) > 0 || (player.shackleValue || 0) > 0 || now < (player.shackledUntil || 0) || getSoulMarks(player) > 0 || getBoneBleedStacks(player) > 0 || now < (player.kneeJerkBoostUntil || 0) || isSurvivorInvisible(player, now)) {
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
    if (isSurvivorInvisible(survivor, now)) ctx.globalAlpha = 0.48;
    drawHumanoidCharacter(survivor, { type: "survivor", scale: 0.98, now });
    ctx.restore();
    drawSoulSiphonFlame(survivor, now);

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

    if (hasMedicShield(survivor, now)) drawMedicShield(survivor, now);

    if (showName || survivor.state !== "healthy" || getDamageProgressPercent(survivor) > 0 || (survivor.shackleValue || 0) > 0 || now < (survivor.shackledUntil || 0) || getSoulMarks(survivor) > 0 || getBoneBleedStacks(survivor) > 0 || survivor.stitchPack || hasMedicShield(survivor, now) || isGeneralRiding(survivor, now) || now < (survivor.kneeJerkBoostUntil || 0) || now < (survivor.medicAdrenalineUntil || 0) || (survivor.medicAdrenalinePendingDamage || 0) > 0 || (survivor.medicRescueShockPendingDamage || 0) > 0 || isSurvivorInvisible(survivor, now) || survivor.action && survivor.action.kind === "dismantlingLamp" || now < survivor.boostUntil) {
      drawSurvivorLabel(survivor);
    }
  }

  function drawMedicShield(survivor, now) {
    const pulse = 0.82 + Math.sin(now / 110) * 0.08;
    ctx.save();
    ctx.translate(survivor.x, survivor.y);
    ctx.strokeStyle = `rgba(105, 210, 225, ${pulse})`;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, 0, survivor.radius + 12, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  function drawSoulSiphonFlame(survivor, now) {
    if (!isSoulBinder() || hunter.soulSiphonTarget !== survivor || now >= (hunter.soulSiphonUntil || 0)) return;
    const pulse = 0.9 + Math.sin(now / 115) * 0.1;
    const flicker = Math.sin(now / 72 + survivor.x * 0.02) * 3;
    ctx.save();
    ctx.translate(survivor.x, survivor.y - 62 + flicker);
    ctx.scale(pulse, pulse);

    const glow = ctx.createRadialGradient(0, 2, 2, 0, 2, 26);
    glow.addColorStop(0, "rgba(180, 228, 255, 0.72)");
    glow.addColorStop(1, "rgba(93, 178, 255, 0)");
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(0, 2, 26, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "rgba(93, 178, 255, 0.92)";
    ctx.strokeStyle = "rgba(215, 239, 255, 0.9)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, -24);
    ctx.bezierCurveTo(-18, -8, -11, 14, 0, 18);
    ctx.bezierCurveTo(12, 13, 20, -7, 0, -24);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "rgba(215, 239, 255, 0.86)";
    ctx.beginPath();
    ctx.moveTo(0, -12);
    ctx.bezierCurveTo(-7, -3, -4, 8, 0, 10);
    ctx.bezierCurveTo(5, 7, 8, -3, 0, -12);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  function drawSurvivorLabel(survivor) {
    const displayName = getSurvivorDisplayName(survivor);
    let label = displayName;
    if (survivor.action && survivor.action.kind === "healing") {
      label = "治疗中";
    } else if (survivor.action && survivor.action.kind === "selfHealing" && selectedRole !== PLAYER_ROLE.hunter) {
      label = `自愈 ${Math.round((survivor.healProgress || 0) * 100)}%`;
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
    } else if (survivor.stitchPack) label = `${displayName} 针线 ${getStitchSecondsLeft(survivor)}秒`;
    else if (performance.now() < (survivor.listenRevealUntil || 0)) label = `${displayName} 聆听`;
    else if (performance.now() < (survivor.assistRevealUntil || 0)) label = `${displayName} 爆点`;
    else if (performance.now() < (survivor.patrollerHoldUntil || 0)) label = `${displayName} 被咬`;
    else if (isSurvivorInvisible(survivor)) label = `${displayName} 隐身`;
    else if (performance.now() < (survivor.shackledUntil || 0)) label = `${displayName} 枷锁`;
    else if ((survivor.shackleValue || 0) > 0) label = `${displayName} 枷锁${Math.round(survivor.shackleValue)}`;
    else if (getSoulMarks(survivor) > 0) label = `${displayName} 魂印${getSoulMarks(survivor)}`;
    else if (getDamageProgressPercent(survivor) > 0) label = `${displayName} ${getDamageProgressLabel(survivor)}`;
    else if (getBoneBleedStacks(survivor) > 0) label = `${displayName} 流血x${getBoneBleedStacks(survivor)}`;
    else if (performance.now() < survivor.boostUntil) label = `${displayName} 加速`;
    else if (survivor.state === "injured") label = `${displayName} 受伤`;
    else if (survivor.state === "downed") label = `${displayName} 放血 ${getBleedOutSecondsLeft(survivor)}秒`;
    else if (survivor.state === "carried") label = `挣扎 ${Math.round((survivor.carryProgress || 0) * 100)}%`;
    else if (survivor.state === "seated") label = `上椅 ${Math.round(survivor.chairProgress * 100)}%`;

    ctx.save();
    ctx.translate(survivor.x, survivor.y - 38);
    ctx.fillStyle = survivor.action && ["beingHealed", "selfHealing", "repairing", "openingGate", "escaping", "rescuing", "dismantlingLamp"].includes(survivor.action.kind) || survivor.stitchPack || isSurvivorInvisible(survivor) || isAssistRevealed(survivor)
      ? "#b7d6c1"
      : getDamageProgressPercent(survivor) > 0 ? "#d9b76a" : getBoneBleedStacks(survivor) > 0 ? "#c78068" : survivor.state === "healthy" ? "rgba(16, 22, 18, 0.86)" : survivor.state === "injured" ? "#d9b76a" : "#b95f52";
    ctx.beginPath();
    ctx.roundRect(-40, -9, 80, 18, 6);
    ctx.fill();
    ctx.fillStyle = survivor.state === "healthy" && (survivor.damageProgress || 0) <= 0 && getBoneBleedStacks(survivor) <= 0 && !survivor.stitchPack && !isSurvivorInvisible(survivor) && !isAssistRevealed(survivor) && (!survivor.action || !["beingHealed", "selfHealing", "repairing", "openingGate", "escaping", "rescuing", "dismantlingLamp"].includes(survivor.action.kind)) ? "#eef3ed" : "#101611";
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

    const downedExit = areExitsPowered() ? findNearestExitGate(player, 96) : null;
    if (player.state === "downed" && downedExit && downedExit.opened) {
      drawFloatingPrompt(player.x, player.y + 42, "E 逃出");
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
    else if (canDropStitchPack) label = canReceiveStitchPack(player) ? "Q 用针线包" : "Q 放针线包";
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

  function getHunterAttackWindupLift(actor, now) {
    const action = actor && actor.action;
    if (!action || action.kind !== "attackWindup") return 0;
    return Math.sin(getActionProgress(action, now) * Math.PI / 2);
  }

  function drawHunterAttackWindupOverlay(actor, scale, now) {
    const lift = getHunterAttackWindupLift(actor, now);
    if (lift <= 0) return;
    ctx.save();
    ctx.rotate(actor.angle || 0);
    drawHunterHeldItem(actor, scale, lift);
    ctx.restore();
  }

  function drawHunter() {
    const now = performance.now();
    if (selectedRole === PLAYER_ROLE.survivor && isHunterInvisibleToSurvivors(now)) return;
    const character = getHunterCharacter();

    ctx.save();
    ctx.translate(hunter.x, hunter.y);

    if (isTwinSword() && (hunter.twinForm === TWIN_FORM_CHIYIN || now < (hunter.invisibleUntil || 0))) {
      ctx.globalAlpha = selectedRole === PLAYER_ROLE.hunter ? 0.62 : 0.28;
    }

    if (hunter.action && hunter.action.kind === "sawDash") {
      ctx.strokeStyle = hunter.action.short ? "rgba(238, 243, 237, 0.42)" : "rgba(217, 208, 189, 0.5)";
      ctx.lineWidth = hunter.action.short ? 12 : 18;
      ctx.beginPath();
      ctx.moveTo(-Math.cos(hunter.angle) * 42, -Math.sin(hunter.angle) * 42);
      ctx.lineTo(-Math.cos(hunter.angle) * 110, -Math.sin(hunter.angle) * 110);
      ctx.stroke();
    }

    drawHumanoidCharacter({
      ...hunter,
      fill: character.fill || "#b95f52",
      core: character.core || "#ffd5cd"
    }, {
      type: "hunter",
      scale: 1,
      now
    });

    ctx.restore();

    if (isTwinSword() && (hunter.twinFlyingSwords || 0) > 0) {
      ctx.save();
      ctx.translate(hunter.x, hunter.y);
      ctx.strokeStyle = "rgba(215, 239, 255, 0.86)";
      ctx.lineWidth = 3;
      const count = Math.min(8, hunter.twinFlyingSwords || 0);
      for (let index = 0; index < count; index += 1) {
        const angle = (Math.PI * 2 * index) / count + now / 900;
        const x = Math.cos(angle) * 43;
        const y = Math.sin(angle) * 43;
        ctx.beginPath();
        ctx.moveTo(x - Math.cos(angle) * 11, y - Math.sin(angle) * 11);
        ctx.lineTo(x + Math.cos(angle) * 11, y + Math.sin(angle) * 11);
        ctx.stroke();
      }
      ctx.fillStyle = "#d7efff";
      ctx.font = "900 13px ui-sans-serif, system-ui";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(String(hunter.twinFlyingSwords || 0), 0, -52);
      ctx.restore();
    }

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
    else if (canUseHunterAssist(now)) label = `L ${getHunterAssistName()}`;
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
    if (selectedRole === PLAYER_ROLE.survivor && isHunterInvisibleToSurvivors(now)) return;
    if (isTwinForm(TWIN_FORM_CHIYIN)) return;
    if (isTwinSword() && now < (hunter.invisibleUntil || 0)) return;
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

  function isSurvivorInHeartbeat(survivor) {
    if (selectedRole === PLAYER_ROLE.survivor && isHunterInvisibleToSurvivors()) return false;
    return Boolean(
      survivor &&
      !survivor.escaped &&
      survivor.state !== "eliminated" &&
      survivor.state !== "seated" &&
      survivor.state !== "carried" &&
      distanceBetween(survivor, hunter) <= HEARTBEAT_RANGE
    );
  }

  function drawHeartbeatIndicators() {
    if (isInfiniteSawboneMode()) return;
    if (selectedRole !== PLAYER_ROLE.survivor) return;
    const now = performance.now();
    getSurvivors().forEach((survivor) => {
      if (!isSurvivorInHeartbeat(survivor)) return;
      const pulse = 0.82 + Math.sin(now / 130) * 0.18;
      ctx.save();
      ctx.translate(survivor.x + 26, survivor.y - 50);
      ctx.scale(pulse, pulse);
      ctx.fillStyle = "rgba(185, 112, 255, 0.92)";
      ctx.strokeStyle = "rgba(246, 232, 255, 0.82)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, 12);
      ctx.bezierCurveTo(-28, -8, -14, -30, 0, -14);
      ctx.bezierCurveTo(14, -30, 28, -8, 0, 12);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    });
  }

  function hasHunterTinnitus() {
    if (selectedRole !== PLAYER_ROLE.hunter) return false;
    return getSurvivors().some(isSurvivorInHeartbeat);
  }

  function drawHunterTinnitusIndicator() {
    if (!hasHunterTinnitus()) return;
    const now = performance.now();
    const pulse = 0.9 + Math.sin(now / 120) * 0.1;
    ctx.save();
    ctx.translate(44, 112);
    ctx.scale(pulse, pulse);
    ctx.fillStyle = "rgba(83, 51, 118, 0.92)";
    ctx.strokeStyle = "rgba(246, 232, 255, 0.86)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, 0, 18, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.strokeStyle = "#f3e8ff";
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.arc(-3, 0, 8, -Math.PI * 0.55, Math.PI * 0.62);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(-2, 2, 4, -Math.PI * 0.45, Math.PI * 0.5);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(9, -7);
    ctx.lineTo(14, -12);
    ctx.moveTo(11, 0);
    ctx.lineTo(18, 0);
    ctx.moveTo(9, 7);
    ctx.lineTo(14, 12);
    ctx.stroke();
    ctx.restore();
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
    if (!(selectedRole === PLAYER_ROLE.survivor && isHunterInvisibleToSurvivors())) {
      miniCtx.fillStyle = getHunterCharacter().fill || "#b95f52";
      miniCtx.beginPath();
      miniCtx.arc(hunter.x, hunter.y, 38, 0, Math.PI * 2);
      miniCtx.fill();
    }
    {
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
    }
    miniCtx.restore();
  }

  function updateReadouts() {
    updateCipherStatusReadout();
    updateHunterPresenceBadge();
    updateSurvivorStatusGrid();
    updateCooldownPanel();
    updateTouchActions();
  }

  function updateHunterPresenceBadge() {
    if (!hunterPresenceBadge) return;
    const visible = selectedRole === PLAYER_ROLE.hunter && matchStarted;
    hunterPresenceBadge.classList.toggle("is-hidden", !visible);
    if (!visible) return;
    hunterPresenceBadge.textContent = `追捕阶数：${getHunterPresenceTierLabel()}`;
  }

  function getHunterPresenceTierLabel() {
    if (isInfiniteSawboneMode()) return "二阶";
    if ((hunter.presenceTier || 0) >= 2) return "二阶";
    if ((hunter.presenceTier || 0) >= 1) return "一阶";
    return "零阶";
  }

  function updateCipherStatusReadout() {
    if (!cipherStatusReadout) return;
    if (isInfiniteSawboneMode()) {
      cipherStatusReadout.textContent = "娱乐模式：无限车移动靶练习";
      return;
    }
    if (isSoulBinderPracticeMode()) {
      cipherStatusReadout.textContent = "娱乐模式：20魂印无限借魂移动靶";
      return;
    }
    const completed = Math.min(REPAIR_REQUIRED, getCompletedRepairCount());
    if (isKiteSimulatorMode()) {
      const bestProgress = getBestRepairProgress();
      cipherStatusReadout.textContent = `牵制模拟器：已修${completed}台 · 最高进度${Math.round(bestProgress * 100)}%`;
      return;
    }
    const remaining = Math.max(0, REPAIR_REQUIRED - completed);
    if (remaining === REPAIR_REQUIRED) {
      cipherStatusReadout.textContent = "五台密码机尚未破译";
    } else if (remaining > 0) {
      cipherStatusReadout.textContent = `还剩${getChineseCount(remaining)}台密码机尚未破译`;
    } else {
      cipherStatusReadout.textContent = "五台密码机已破译，出口可开启";
    }
  }

  function getBestRepairProgress() {
    if (!repairPoints.length) return 0;
    return repairPoints.reduce((best, point) => {
      const progress = point.completed ? 1 : (point.progress || 0);
      return Math.max(best, progress);
    }, 0);
  }

  function getChineseCount(value) {
    return ["零", "一", "二", "三", "四", "五"][value] || String(value);
  }

  function updateSurvivorStatusGrid() {
    if (!survivorStatusGrid) return;
    const survivors = getSurvivors().slice(0, 4);
    const nextHtml = survivors.map((survivor, index) => renderSurvivorStatusCard(survivor, index)).join("");
    if (nextHtml === survivorStatusHtml) return;
    survivorStatusHtml = nextHtml;
    survivorStatusGrid.innerHTML = nextHtml;
  }

  function renderSurvivorStatusCard(survivor, index) {
    const status = getSurvivorHudStatus(survivor);
    const effects = getSurvivorNegativeEffects(survivor);
    const selected = selectedRole === PLAYER_ROLE.hunter && isSoulBinder() && hunter.soulSelectionCandidate === survivor;
    const targeted = hunter.soulSiphonTarget === survivor && performance.now() < (hunter.soulSiphonUntil || 0);
    const effectHtml = effects.length
      ? effects.map((effect) => `<span>${escapeHtml(effect)}</span>`).join("")
      : "<em></em>";
    return `
      <div class="survivor-status-card state-${status.key}${selected ? " is-selected" : ""}${targeted ? " is-targeted" : ""}" data-survivor-index="${index}">
        <div class="survivor-figure" aria-hidden="true">
          <span class="figure-head"></span>
          <span class="figure-body"></span>
          <span class="figure-arm left"></span>
          <span class="figure-arm right"></span>
          <span class="figure-leg left"></span>
          <span class="figure-leg right"></span>
          <span class="figure-chair"></span>
        </div>
        <div class="survivor-meta">
          <strong>${escapeHtml(getSurvivorDisplayName(survivor))}</strong>
          <span>${escapeHtml(status.label)}</span>
        </div>
        <div class="negative-effects" aria-label="负面状态">${effectHtml}</div>
      </div>
    `;
  }

  function getSurvivorHudStatus(survivor) {
    if (survivor.escaped) return { key: "escaped", label: "已逃出" };
    if (survivor.state === "eliminated") return { key: "eliminated", label: "淘汰" };
    if (survivor.state === "seated") return { key: "seated", label: "挂椅" };
    if (survivor.state === "carried") return { key: "carried", label: "牵起" };
    if (survivor.state === "downed") return { key: "downed", label: "倒地" };
    if (survivor.state === "injured") return { key: "injured", label: "受伤" };
    return { key: "healthy", label: "健康" };
  }

  function getSurvivorNegativeEffects(survivor) {
    const now = performance.now();
    const effects = [];
    if (now < (survivor.shackledUntil || 0)) effects.push("枷锁");
    else if ((survivor.shackleValue || 0) > 0) effects.push(`枷锁${Math.round(survivor.shackleValue)}`);
    if (getDamageProgressPercent(survivor) > 0) effects.push(getDamageProgressLabel(survivor));
    if (getSoulMarks(survivor) > 0) effects.push(`魂印${getSoulMarks(survivor)}`);
    if (now < (survivor.soulReturnUntil || 0)) effects.push("归途");
    if (getBoneBleedStacks(survivor, now) > 0) effects.push(`流血x${getBoneBleedStacks(survivor, now)}`);
    if (now < (survivor.patrollerHoldUntil || 0)) effects.push("被咬");
    else if (now < (survivor.patrollerSlowUntil || 0)) effects.push("减速");
    if (now < (survivor.borrowedTimeUntil || 0)) {
      effects.push((survivor.borrowedTimePendingDamage || 0) > 0 ? `延伤${getBorrowedTimeSecondsLeft(survivor)}s` : `搏命${getBorrowedTimeSecondsLeft(survivor)}s`);
    }
    if (hasMedicShield(survivor, now)) effects.unshift(`护盾${getMedicShieldSecondsLeft(survivor)}s`);
    if (now < (survivor.medicAdrenalineUntil || 0)) {
      effects.push((survivor.medicAdrenalinePendingDamage || 0) > 0 ? `延伤${getMedicAdrenalineSecondsLeft(survivor)}s` : `肾上腺素${getMedicAdrenalineSecondsLeft(survivor)}s`);
    } else if ((survivor.medicRescueShockPendingDamage || 0) > 0) {
      effects.push("前线延伤");
    }
    if (survivor.action && survivor.action.kind === "flywheelDash") effects.unshift("飞轮");
    if (now < (survivor.kneeJerkBoostUntil || 0)) effects.unshift("膝跳");
    if (isGeneralRiding(survivor, now)) effects.unshift((survivor.generalRideWhips || 0) > 0 ? `骑马+${(survivor.generalRideWhips || 0) * 5}%` : "骑马");
    if (selectedRole !== PLAYER_ROLE.hunter && survivor.action && survivor.action.kind === "selfHealing") effects.push(`自愈${Math.round((survivor.healProgress || 0) * 100)}%`);
    if (survivor.stitchPack) effects.push(`针线${getStitchSecondsLeft(survivor)}s`);
    if (isKiteSimulatorMode() && survivor !== player && survivor.action && survivor.action.kind === "repairing") {
      effects.push(`修机${Math.round(survivor.action.point.progress * 100)}%`);
    }
    const fencerStrideMarks = getFencerStrideMarkCount(survivor, now);
    if (fencerStrideMarks > 0) effects.unshift(`健步${fencerStrideMarks}`);
    return effects.slice(0, 3);
  }

  function handleSurvivorStatusPick(event, forceConfirm = false) {
    if (selectedRole !== PLAYER_ROLE.hunter || !isSoulBinder() || !hunter.soulSelectionMode) return;
    const card = event.target.closest(".survivor-status-card");
    if (!card) return;
    event.preventDefault();
    event.stopPropagation();
    const index = Number(card.dataset.survivorIndex);
    const survivor = getSurvivors()[index];
    if (!survivor) return;
    const now = performance.now();
    const same = hunter.soulSelectionCandidate === survivor && now - (hunter.soulSelectionAt || 0) <= 900;
    hunter.soulSelectionCandidate = survivor;
    hunter.soulSelectionCount = forceConfirm ? 2 : same ? (hunter.soulSelectionCount || 1) + 1 : 1;
    hunter.soulSelectionAt = now;
    if (hunter.soulSelectionCount < 2) {
      showAssistAlert(`再点一次 ${survivor.name}`, now, 900);
      return;
    }
    if (hunter.soulSelectionMode === "siphon") {
      if (!startSoulSiphon(survivor, now)) showAssistAlert("目标没有魂印", now, 900);
      return;
    }
    if (hunter.soulSelectionMode === "return") {
      if (!applySoulReturn(survivor, now)) showAssistAlert("目标未上椅", now, 900);
    }
  }

  function updateCooldownPanel() {
    if (!cooldownPanel) return;
    const items = getCooldownItems(performance.now());
    cooldownPanel.innerHTML = items.map((item) => {
      return `
        <div class="cooldown-chip${item.ready ? " is-ready" : " is-cooling"}">
          <span>${escapeHtml(item.key)} · ${escapeHtml(item.name)}</span>
          <strong>${escapeHtml(item.value)}</strong>
        </div>
      `;
    }).join("");
  }

  function getCooldownItems(now) {
    if (!selectedRole) return [{ key: "操作", name: "准备", value: "选择角色", ready: true }];
    const items = [{ key: "操作", name: "按键", value: getControlsLabel(), ready: true }];
    if (selectedRole === PLAYER_ROLE.hunter) {
      const attackCooldown = Math.max(0, hunter.wipeUntil - now, hunter.lastAttackAt + hunter.attackCooldown * 1000 - now);
      items.push({ key: "J", name: "普攻", value: formatCooldown(attackCooldown), ready: attackCooldown <= 0 });
      if (hunterHasSkill()) items.push(getHunterMainSkillCooldown(now));
      if (isLanternKeeper() && hunter.presenceTier >= 1) {
        const cooldown = getShadowTeleportCooldownLeft(now);
        items.push({ key: "F", name: "灯影", value: formatCooldown(cooldown), ready: cooldown <= 0 && soulLamps.length > 0 });
      }
      if (isTwinSword()) {
        const primaryCooldown = hunter.twinForm === TWIN_FORM_CHIYIN ? Math.max(0, (hunter.nextTwinShadowLockAt || 0) - now) : 0;
        const secondaryCooldown = hunter.twinForm === TWIN_FORM_CHIYIN ? Math.max(0, (hunter.nextTwinShadowStrikeAt || 0) - now) : 0;
        const dualCooldown = Math.max(0, (hunter.nextTwinDualCastAt || 0) - now);
        items.push({ key: "E", name: getTwinPrimaryLabel(), value: formatCooldown(primaryCooldown), ready: primaryCooldown <= 0 });
        items.push({ key: "R", name: getTwinSecondaryLabel(), value: formatCooldown(secondaryCooldown), ready: secondaryCooldown <= 0 });
        items.push({ key: "F", name: "飞剑", value: String(hunter.twinFlyingSwords || 0), ready: (hunter.twinFlyingSwords || 0) > 0 });
        items.push({ key: "G", name: "双生", value: formatCooldown(dualCooldown), ready: dualCooldown <= 0 });
      }
      if (isSoulBinder()) {
        const borrowCooldown = Math.max(0, (hunter.nextBorrowSoulAt || 0) - now);
        const returnCooldown = Math.max(0, (hunter.nextSoulReturnAt || 0) - now);
        items.push({ key: "E", name: "借魂", value: hunter.presenceTier >= 1 ? getTotalSoulMarks() > 0 ? `${getTotalSoulMarks()}层` : borrowCooldown > 0 ? formatCooldown(borrowCooldown) : "无魂" : "一阶", ready: canBorrowSoul(now) });
        items.push({ key: "F", name: "归途", value: hunter.presenceTier >= 2 ? formatCooldown(returnCooldown) : "二阶", ready: canStartSoulReturnSelection(now) });
      }
      if (hasHunterAssist()) {
        const assistCooldown = getHunterAssistCooldownLeft(now);
        const shiftValue = activeShiftPortals ? `门${activeShiftPortals.usesLeft} · ${Math.ceil(Math.max(0, activeShiftPortals.until - now) / 1000)}s` : null;
        const excitementValue = hunter.assistSkill === "excitement" && now < (hunter.excitementGuardUntil || 0) ? "免控待发" : null;
        items.push({ key: "L", name: getHunterAssistName(), value: activePatroller ? "控制中" : shiftValue || excitementValue || formatCooldown(assistCooldown), ready: activePatroller || activeShiftPortals || excitementValue || assistCooldown <= 0 });
      }
      if (hasHunterBadge("trumpCard")) {
        items.push({ key: "M", name: "底牌", value: hunter.trumpCardSelecting ? "按1-6" : hunter.trumpCardUsed ? "已用" : "可切换", ready: hunter.trumpCardSelecting || !hunter.trumpCardUsed });
      }
      return items;
    }

    items.push({ key: "E", name: getSurvivorUseButtonLabel(), value: "交互", ready: true });
    if (hasSurvivorSkill(player)) items.push(getSurvivorMainSkillCooldown(now));
    if (hasSurvivorBadge(player, "flywheel")) {
      const cooldown = getFlywheelCooldownLeft(player, now);
      const active = player.action && player.action.kind === "flywheelDash";
      items.push({ key: "L", name: "飞轮", value: active ? "冲刺中" : formatCooldown(cooldown), ready: active || cooldown <= 0 });
    }
    if (isActor(player)) items.push({ key: "F", name: "魔术选项", value: player.magicShowMode === "hunter" ? "送监管" : "转椅", ready: true });
    return items;
  }

  function getHunterMainSkillCooldown(now) {
    if (isSawbone()) {
      const cooldown = getSawDashCooldownLeft(now);
      return { key: "Q", name: canUseShortSaw(now) ? "短锯" : "拉锯", value: formatCooldown(cooldown), ready: canStartSawDash(now) };
    }
    if (isLanternKeeper()) {
      const cooldown = getSoulLampCooldownLeft(now);
      return { key: "Q", name: canRecallSoulLamp(now) ? "收回灯" : "寄魂灯", value: formatCooldown(cooldown), ready: canPlaceSoulLamp(now) || canRecallSoulLamp(now) };
    }
    if (isSoulBinder()) {
      const cooldown = Math.max(0, (hunter.nextSoulSiphonAt || 0) - now);
      const active = hunter.soulSiphonTarget && now < (hunter.soulSiphonUntil || 0);
      const hasMarks = getSurvivors().some((survivor) => getSoulMarks(survivor) > 0 && !survivor.escaped && survivor.state !== "eliminated");
      return { key: "Q", name: "摄魂", value: active ? `${Math.ceil((hunter.soulSiphonUntil - now) / 1000)}s` : cooldown > 0 ? formatCooldown(cooldown) : hasMarks ? "可用" : "无魂", ready: active || canStartSoulSiphon(now) };
    }
    const cooldown = Math.max(0, (hunter.nextTwinFormAt || 0) - now);
    return { key: "Q", name: hunter.twinForm === TWIN_FORM_CHIYIN ? "切赵" : "切池", value: formatCooldown(cooldown), ready: cooldown <= 0 };
  }

  function getSurvivorMainSkillCooldown(now) {
    if (isActor(player)) {
      const cooldown = getMagicShowCooldownLeft(player, now);
      return { key: "Q", name: "魔术秀", value: formatCooldown(cooldown), ready: cooldown <= 0 };
    }
    if (isClockmaker(player)) {
      const cooldown = getTimeRewindCooldownLeft(player, now);
      return { key: "Q", name: canActivateTimeRewind(player, now) ? "回溯" : "时光装置", value: canActivateTimeRewind(player, now) ? "可用" : formatCooldown(cooldown), ready: canActivateTimeRewind(player, now) || cooldown <= 0 };
    }
    if (isMessenger(player)) {
      const cooldown = getPackageCooldownLeft(player, now);
      return { key: "Q", name: "邮包", value: formatCooldown(cooldown), ready: cooldown <= 0 };
    }
    if (isMedic(player)) {
      const cooldown = getMedicAdrenalineCooldownLeft(player, now);
      const active = now < (player.medicAdrenalineUntil || 0);
      return { key: "Q", name: "肾上腺素", value: active ? `${getMedicAdrenalineSecondsLeft(player)}s` : formatCooldown(cooldown), ready: active || cooldown <= 0 };
    }
    if (isGeneral(player)) {
      const riding = isGeneralRiding(player, now);
      const cooldown = riding ? getGeneralWhipCooldownLeft(player, now) : getGeneralRideCooldownLeft(player, now);
      const value = riding ? `${getGeneralRideSecondsLeft(player, now)}s · +${(player.generalRideWhips || 0) * 5}%` : formatCooldown(cooldown);
      return { key: "Q", name: riding ? "鞭策" : "骑马", value, ready: cooldown <= 0 };
    }
    if (isPerfumer(player)) {
      const cooldown = getPerfumeCooldownLeft(player, now);
      return { key: "Q", name: hasPerfumeUltimate(player) ? "幻香大阵" : "迷香", value: cooldown > 0 ? formatCooldown(cooldown) : hasPerfumeUltimate(player) ? "香炉" : `${player.perfumeUltimateCharges || 0}/${PERFUME_ULTIMATE_CHARGES}`, ready: cooldown <= 0 };
    }
    if (isFencer(player)) {
      const cooldown = getFencerLungeCooldownLeft(player, now);
      return { key: "Q", name: "突刺", value: player.fencerLungePreparing ? "松手释放" : player.action && player.action.kind === "fencerLunge" ? player.action.turned ? "突刺中" : "可变向" : formatCooldown(cooldown), ready: player.fencerLungePreparing || cooldown <= 0 || player.action && player.action.kind === "fencerLunge" };
    }
    const stitchCooldown = getStitchPackCooldownLeft(player, now);
    return { key: "Q", name: "针线包", value: stitchCooldown > 0 ? formatCooldown(stitchCooldown) : canPlaceStitchPack(player) ? "可用" : "不可用", ready: canPlaceStitchPack(player) };
  }

  function getControlsLabel() {
    if (selectedRole === PLAYER_ROLE.hunter) {
      return `${isTwinSword() ? "J/Q/E/R/F/T/G" : isSoulBinder() ? "J/Q/E/F/Space" : isLanternKeeper() ? "J/Q/F/Space" : isSawbone() ? "J/Q/Space" : "J/Space"}${hasHunterAssist() ? "/L" : ""}${hasHunterBadge("trumpCard") ? "/M" : ""}`;
    }
    const flywheelLabel = hasSurvivorBadge(player, "flywheel") ? "/L" : "";
    return `${isActor(player) ? "E/Q/F/Space" : hasSurvivorSkill(player) ? "E/Q/Space" : "E/Space"}${flywheelLabel}`;
  }

  function formatCooldown(ms) {
    if (ms <= 0) return "可用";
    return `${Math.ceil(ms / 1000)}s`;
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, (char) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      "\"": "&quot;",
      "'": "&#39;"
    })[char]);
  }

  function updateTouchActions() {
    if (!touchUseButton || !touchInteractButton || !touchAttackButton || !touchSkillButton || !touchShadowButton) return;
    const isHunter = selectedRole === PLAYER_ROLE.hunter;
    const isSurvivor = selectedRole === PLAYER_ROLE.survivor;
    touchUseButton.classList.toggle("is-hidden", !(isSurvivor || isHunter && (isTwinSword() || hasHunterAssist())));
    touchAttackButton.classList.toggle("is-hidden", !isHunter);
    touchSkillButton.classList.toggle("is-hidden", !(isHunter && hunterHasSkill() || isSurvivor && hasSurvivorSkill(player)));
    touchShadowButton.classList.toggle("is-hidden", !(isHunter && (isLanternKeeper() && hunter.presenceTier >= 1 || isTwinSword()) || isSurvivor && (isActor(player) || hasSurvivorBadge(player, "flywheel"))));
    touchInteractButton.classList.toggle("is-hidden", !selectedRole);

    if (isSurvivor) {
      touchUseButton.textContent = getSurvivorUseButtonLabel();
      touchSkillButton.textContent = getSurvivorSkillButtonLabel();
      touchShadowButton.textContent = hasSurvivorBadge(player, "flywheel") ? "飞轮" : isActor(player) ? "切换" : "灯影";
      touchInteractButton.textContent = "板窗";
    } else if (isHunter) {
      const sawLockout = isSawbone() ? getSawAttackLockoutLeft(performance.now()) : 0;
      touchAttackButton.textContent = sawLockout > 0 ? `锁刀${Math.ceil(sawLockout / 1000)}s` : "攻击";
      touchUseButton.textContent = isTwinSword() ? getTwinPrimaryLabel() : getHunterAssistButtonLabel();
      touchSkillButton.textContent = getHunterSkillButtonLabel();
      touchShadowButton.textContent = getHunterShadowButtonLabel();
      touchInteractButton.textContent = isTwinSword() ? getTwinSecondaryLabel() : "交互";
    } else {
      touchUseButton.textContent = "使用";
      touchAttackButton.textContent = "攻击";
      touchSkillButton.textContent = "技能";
      touchShadowButton.textContent = "灯影";
      touchInteractButton.textContent = "交互";
    }
  }

  function getHunterSkillButtonLabel() {
    if (isTwinSword()) {
      const cooldownLeft = Math.max(0, (hunter.nextTwinFormAt || 0) - performance.now());
      if (cooldownLeft > 0) return `${Math.ceil(cooldownLeft / 1000)}s`;
      return hunter.twinForm === TWIN_FORM_CHIYIN ? "切赵" : "切池";
    }
    if (isSawbone()) {
      const now = performance.now();
      if (hunter.action && hunter.action.kind === "sawDash") {
        if (Number.isFinite(hunter.action.durability)) return `耐久${Math.max(0, Math.ceil(hunter.action.durability))}%`;
        return isInfiniteSawboneMode() ? "无限车中" : hunter.action.short ? "短锯中" : "拉锯中";
      }
      if (isInfiniteSawboneMode()) return "无限车";
      if (canUseShortSaw(now)) return "短锯";
      const cooldownLeft = getSawDashCooldownLeft(now);
      if (canStartSawDash(now)) return "拉锯";
      if (cooldownLeft > 0) return `${Math.ceil(cooldownLeft / 1000)}s`;
      return "拉锯";
    }
    if (isSoulBinder()) {
      const now = performance.now();
      if (hunter.soulSiphonTarget && now < (hunter.soulSiphonUntil || 0)) return "摄魂中";
      const cooldownLeft = Math.max(0, (hunter.nextSoulSiphonAt || 0) - now);
      if (canStartSoulSiphon(now)) return "摄魂";
      if (cooldownLeft > 0) return `${Math.ceil(cooldownLeft / 1000)}s`;
      if (getTotalSoulMarks() <= 0) return "无魂";
      return "摄魂";
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

  function getHunterAssistButtonLabel() {
    const now = performance.now();
    if (!hasHunterAssist()) return "使用";
    if (activePatroller) return "收回";
    if (activeShiftPortals) return `门${activeShiftPortals.usesLeft}`;
    if (hunter.assistSkill === "excitement" && performance.now() < (hunter.excitementGuardUntil || 0)) return "免控";
    const cooldownLeft = getHunterAssistCooldownLeft(now);
    if (cooldownLeft > 0) return `${Math.ceil(cooldownLeft / 1000)}s`;
    return getHunterAssistName();
  }

  function getHunterShadowButtonLabel() {
    if (isTwinSword()) return `飞剑${hunter.twinFlyingSwords || 0}`;
    if (isSoulBinder()) {
      const now = performance.now();
      if (hunter.presenceTier < 2) return "二阶";
      const cooldownLeft = Math.max(0, (hunter.nextSoulReturnAt || 0) - now);
      if (canStartSoulReturnSelection(now)) return "归途";
      if (cooldownLeft > 0) return `${Math.ceil(cooldownLeft / 1000)}s`;
      return "归途";
    }
    if (!isLanternKeeper()) return "灯影";
    if (hunter.presenceTier < 1) return "未解锁";
    if (isHunterDisplacementBlocked(performance.now())) return "封锁";
    if (canShadowTeleport(performance.now())) return "灯影";
    if (soulLamps.length === 0) return "无灯";
    const cooldownLeft = getShadowTeleportCooldownLeft(performance.now());
    if (cooldownLeft > 0) return `${Math.ceil(cooldownLeft / 1000)}s`;
    return "灯影";
  }

  function getTwinPrimaryLabel() {
    if (!isTwinSword()) return "技能一";
    if (hunter.twinForm === TWIN_FORM_QINGTIAN) return hunter.twinTimeMode === "self" ? "时·自身" : "时·求生";
    const cooldownLeft = Math.max(0, (hunter.nextTwinShadowLockAt || 0) - performance.now());
    return cooldownLeft > 0 ? `${Math.ceil(cooldownLeft / 1000)}s` : "影锁";
  }

  function getTwinSecondaryLabel() {
    if (!isTwinSword()) return "技能二";
    if (hunter.twinForm === TWIN_FORM_QINGTIAN) return "空之力";
    const cooldownLeft = Math.max(0, (hunter.nextTwinShadowStrikeAt || 0) - performance.now());
    return cooldownLeft > 0 ? `${Math.ceil(cooldownLeft / 1000)}s` : "影袭";
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
    if (isMedic(player)) {
      if (performance.now() < (player.medicAdrenalineUntil || 0)) return "延伤中";
      const cooldownLeft = getMedicAdrenalineCooldownLeft(player, performance.now());
      if (cooldownLeft > 0) return `${Math.ceil(cooldownLeft / 1000)}s`;
      return "肾上腺素";
    }
    if (isGeneral(player)) {
      const now = performance.now();
      if (isGeneralRiding(player, now)) {
        const whipCooldown = getGeneralWhipCooldownLeft(player, now);
        return whipCooldown > 0 ? `${Math.ceil(whipCooldown / 1000)}s` : "鞭策";
      }
      const cooldownLeft = getGeneralRideCooldownLeft(player, now);
      if (cooldownLeft > 0) return `${Math.ceil(cooldownLeft / 1000)}s`;
      return "骑马";
    }
    if (isApprentice(player)) return "放针线包";
    if (isPerfumer(player)) {
      const cooldownLeft = getPerfumeCooldownLeft(player, performance.now());
      if (cooldownLeft > 0) return `${Math.ceil(cooldownLeft / 1000)}s`;
      return hasPerfumeUltimate(player) ? "香炉" : "迷香";
    }
    if (isFencer(player)) {
      if (player.fencerLungePreparing) return "松手";
      if (player.action && player.action.kind === "fencerLunge") return player.action.turned ? "突刺中" : "变向";
      const cooldownLeft = getFencerLungeCooldownLeft(player, performance.now());
      if (cooldownLeft > 0) return `${Math.ceil(cooldownLeft / 1000)}s`;
      return "突刺";
    }
    if (!isMessenger(player)) return "技能";
    const cooldownLeft = getPackageCooldownLeft(player, performance.now());
    if (cooldownLeft > 0) return `${Math.ceil(cooldownLeft / 1000)}s`;
    return "邮包";
  }

  function getSurvivorUseButtonLabel() {
    if (player.action && player.action.kind === "dismantlingLamp") return "停止";
    if (player.action && player.action.kind === "healing") return "停止";
    if (player.action && player.action.kind === "selfHealing") return "停止";
    if (player.action && player.action.kind === "repairing" && player.action.calibration) return "校准";
    if (player.action && player.action.kind === "repairing") return "停止";
    if (player.action && player.action.kind === "openingGate") return "停止";
    if (player.action && player.action.kind === "rescuing") return "停止";
    if (findNearestHatch(player, 96) && (player.state === "healthy" || player.state === "injured" || player.state === "downed")) return "地窖";
    if (player.state === "downed") return "自愈";
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
    const label = `${characterName} · ${getSurvivorRoleLabel(player)}${getBadgeReadout(PLAYER_ROLE.survivor, player.badges)}`;
    if (player.escaped) return `${label} · 已逃出`;
    if (isSurvivorInvisible(player)) return `${label} · 隐身`;
    if (player.action && player.action.kind === "flywheelDash") return `${label} · 飞轮`;
    if (isActor(player)) return `${label} · ${player.magicShowMode === "hunter" ? "送监管" : "转椅"}`;
    if (isPerfumer(player)) return `${label} · ${hasPerfumeUltimate(player) ? "香炉已点燃" : `迷香${player.perfumeUltimateCharges || 0}/${PERFUME_ULTIMATE_CHARGES}`}`;
    if (isFencer(player)) {
      const marks = getFencerStrideMarkCount(player, performance.now());
      if (player.fencerLungePreparing) return `${label} · 突刺准备`;
      if (player.action && player.action.kind === "fencerLunge") return `${label} · 突刺${player.action.turned ? "" : " 可变向"}`;
      if (marks > 0) return `${label} · 健步${marks}`;
    }
    if (isGeneralRiding(player)) return `${label} · 骑马 ${getGeneralRideSecondsLeft(player)}秒 · 鞭策+${(player.generalRideWhips || 0) * 5}%`;
    if (performance.now() < (player.kneeJerkBoostUntil || 0)) return `${label} · 膝跳反射`;
    if (isClockmaker(player) && player.timeDevice) return `${label} · 可回溯`;
    if (hasMedicShield(player)) return `${label} · 护盾`;
    if (performance.now() < (player.medicAdrenalineUntil || 0)) return `${label} · 肾上腺素 ${getMedicAdrenalineSecondsLeft(player)}秒`;
    if ((player.medicAdrenalinePendingDamage || 0) > 0 || (player.medicRescueShockPendingDamage || 0) > 0) return `${label} · 延伤`;
    if (player.action && player.action.kind === "repairing" && player.action.calibration) return `${label} · 校准`;
    if (player.action && player.action.kind === "repairing") return `${label} · 修理`;
    if (player.action && player.action.kind === "openingGate") return `${label} · 开门`;
    if (player.action && player.action.kind === "escaping") return `${label} · 逃出`;
    if (player.action && player.action.kind === "healing") return `${label} · 治疗`;
    if (player.action && player.action.kind === "selfHealing") return `${label} · 自愈 ${Math.round((player.healProgress || 0) * 100)}%`;
    if (player.action && player.action.kind === "dismantlingLamp") return `${label} · 拆灯`;
    if (performance.now() < (player.borrowedTimeUntil || 0)) {
      return `${label} · ${(player.borrowedTimePendingDamage || 0) > 0 ? "延伤" : "搏命"} ${getBorrowedTimeSecondsLeft(player)}秒`;
    }
    if (player.stitchPack) return `${label} · 针线 ${getStitchSecondsLeft(player)}秒`;
    if (performance.now() < (player.shackledUntil || 0)) return `${label} · 枷锁`;
    if ((player.shackleValue || 0) > 0) return `${label} · 枷锁${Math.round(player.shackleValue)}`;
    if (getDamageProgressPercent(player) > 0) return `${label} · ${getDamageProgressLabel(player)}`;
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
    updateSoulBinderSystems(now);
    updateSoulLampAlerts(now);
    updateHunterAssistSystems(dt, now);
    updatePackageProjectiles(dt, now);
    updateStitchPackPickups(now);
    updateStitchPacks(now);
    updateTimeDevices(now);
    updatePerfumeMists(now);
    updateActorDecoys(dt, now);
    updateBoneBleed(now);
    updateBorrowedTime(now);
    updateMedicEffects(now);
    updateGeneralEffects(now);
    updateRampageBadge(now);
    updateWantedBadge(now);
    updateSawbonePendingWipe(now);
    updateTwinSwordSystems(dt, now);
    updateSharedHealing(dt);
    updateSharedRepairs(dt);
    updateSharedGateOpening(dt);
    updateBleedOutProgress(now);
    updateChairProgress(dt, now);
    updateUnlockTaskRuntime(now, dt);
  }

  function updateRampageBadge(now) {
    if (!hasHunterBadge("rampage")) return;
    if ((hunter.rampagePresenceGained || 0) >= RAMPAGE_PRESENCE_MAX_HITS) return;
    if ((hunter.presenceHits || 0) >= PRESENCE_TIER_TWO_HITS) return;
    if (!hunter.nextRampageAt) hunter.nextRampageAt = now + RAMPAGE_PRESENCE_INTERVAL;
    if (now < hunter.nextRampageAt) return;
    hunter.rampagePresenceGained = (hunter.rampagePresenceGained || 0) + 1;
    addHunterPresenceHit(now);
    hunter.nextRampageAt = now + RAMPAGE_PRESENCE_INTERVAL;
    showAssistAlert("张狂 存在感+1", now, 1200);
  }

  function updateWantedBadge(now) {
    const target = hunter.wantedTarget;
    if (!target) return;
    if (
      !hasHunterBadge("wanted") ||
      now >= (hunter.wantedUntil || 0) ||
      target.escaped ||
      target.state === "eliminated" ||
      target.state === "seated" ||
      target.state === "carried"
    ) {
      hunter.wantedTarget = null;
      hunter.wantedUntil = 0;
    }
  }

  function updateSoulBinderSystems(now) {
    if (!isSoulBinder()) return;
    if (hunter.soulSiphonTarget && now >= (hunter.soulSiphonUntil || 0)) {
      hunter.soulSiphonTarget = null;
      hunter.soulSiphonUntil = 0;
      hunter.soulSiphonPenaltyUntil = now + SOUL_SIPHON_FAIL_DURATION;
      showAssistAlert("摄魂落空", now, 1000);
    }
    if (now >= (hunter.borrowSoulUntil || 0)) {
      hunter.borrowSoulSpeedBonus = 0;
      hunter.borrowSoulRecoveryBonus = 0;
    }
    getSurvivors().forEach((survivor) => {
      if (now >= (survivor.soulReturnUntil || 0)) survivor.soulReturnUntil = 0;
    });
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

  function updateHunterAssistSystems(dt, now) {
    updateAssistShiftPortals(now);

    for (let index = assistPeeperWards.length - 1; index >= 0; index -= 1) {
      const ward = assistPeeperWards[index];
      if (now >= ward.until) {
        assistPeeperWards.splice(index, 1);
        continue;
      }
      getSurvivors().forEach((survivor) => {
        if (survivor.escaped || survivor.state === "eliminated" || survivor.state === "seated") return;
        if (distanceBetween(survivor, ward) > ASSIST_PEEPER_RANGE) return;
        if (!ward.triggered[survivor.name]) {
          ward.triggered[survivor.name] = true;
          revealSurvivorByAssist(survivor, now, 3800);
          showAssistAlert(`插眼发现 ${survivor.name}`, now, 1100);
        }
      });
    }

    if (!activePatroller) return;
    if (now >= activePatroller.until) {
      activePatroller = null;
      return;
    }
    const target = getSurvivors().find((survivor) => {
      if (survivor.escaped || survivor.state === "eliminated" || survivor.state === "seated" || survivor.state === "carried") return false;
      return distanceBetween(survivor, activePatroller) <= ASSIST_PATROLLER_HIT_RANGE + survivor.radius;
    });
    if (!target) return;
    target.patrollerHoldUntil = now + ASSIST_PATROLLER_HOLD_DURATION;
    target.patrollerSlowUntil = target.patrollerHoldUntil + ASSIST_PATROLLER_SLOW_DURATION;
    revealSurvivorByAssist(target, now, ASSIST_PATROLLER_SLOW_DURATION);
    activePatroller = null;
    showAssistAlert(`巡视者咬中 ${target.name}`, now, 1400);
  }

  function updateAssistShiftPortals(now) {
    if (!activeShiftPortals) return;
    if (now >= activeShiftPortals.until) {
      showAssistAlert("移形门关闭", now, 1000);
      finishAssistShift(now);
      return;
    }

    const portals = [activeShiftPortals.near, activeShiftPortals.far];
    const triggerDistance = ASSIST_SHIFT_RADIUS + hunter.radius + ASSIST_SHIFT_TRIGGER_RANGE;
    const nearPortal = portals.find((portal) => distanceBetween(hunter, portal) <= triggerDistance);
    if (!activeShiftPortals.armed) {
      if (!nearPortal) activeShiftPortals.armed = true;
      return;
    }
    if (!nearPortal || now < activeShiftPortals.lockoutUntil) return;
    teleportHunterThroughShiftPortal(nearPortal, now);
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
      updateSmartDecoy(decoy, dt, now);
    }
  }

  function updateSmartDecoy(decoy, dt, now) {
    const hunterDistance = distanceBetween(decoy, hunter);
    if (decoy.action) {
      updateActorAction(decoy, now);
      return;
    }
    handleAIInteraction(decoy, now, hunterDistance);
    const destination = getKiteEscapeDestination(decoy, hunterDistance, now);
    const speed = (decoy.speed || ACTOR_DECOY_SPEED) * (hunterDistance < 310 ? 1.08 : 0.96);
    const moved = moveActorToPoint(decoy, destination.x, destination.y, speed, dt, now);
    if (moved < 0.5 && now > decoy.repathAt - 120) {
      decoy.path = [];
      decoy.kiteDecision = null;
      decoy.wanderTarget = pickWanderTarget();
    }
  }

  function updatePerfumeMists(now) {
    for (let index = perfumeMists.length - 1; index >= 0; index -= 1) {
      if (now >= perfumeMists[index].until) perfumeMists.splice(index, 1);
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

  function getBorrowedTimeSecondsLeft(survivor) {
    return Math.max(0, Math.ceil(((survivor && survivor.borrowedTimeUntil || 0) - performance.now()) / 1000));
  }

  function getMedicShieldSecondsLeft(survivor) {
    return Math.max(0, Math.ceil(((survivor && survivor.medicShieldUntil || 0) - performance.now()) / 1000));
  }

  function getMedicAdrenalineSecondsLeft(survivor) {
    return Math.max(0, Math.ceil(((survivor && survivor.medicAdrenalineUntil || 0) - performance.now()) / 1000));
  }

  function updateBleedOutProgress(now) {
    getSurvivors().forEach((survivor) => {
      if (survivor.state !== "downed") return;
      if (isKiteSimulatorMode() && survivor === player) return;
      if (!survivor.downedAt) survivor.downedAt = now;
      if (now - survivor.downedAt >= BLEED_OUT_DURATION) eliminateSurvivor(survivor);
    });
  }

  function updateChairProgress(dt, now = performance.now()) {
    chairs.forEach((item) => {
      const survivor = item.survivor;
      if (!survivor || survivor.state !== "seated") return;
      if (isBeingRescued(survivor) || now < (survivor.chairProgressPausedUntil || 0)) return;
      const soulReturnSpeed = isSoulBinder() && now < (survivor.soulReturnUntil || 0) ? SOUL_RETURN_CHAIR_SPEED : 1;
      survivor.chairProgress = Math.min(1, survivor.chairProgress + ((dt * 1000) / CHAIR_ELIMINATION_DURATION) * getHunterBadgeMultiplier("chairSpeed") * soulReturnSpeed);
      if (isKiteSimulatorMode() && survivor === player) {
        survivor.chairProgress = Math.min(survivor.chairProgress, 0.99);
        survivor.nextChairEliminates = false;
        return;
      }
      if (survivor.chairProgress >= 1) eliminateSurvivor(survivor);
    });
  }

  function updateStitchPackPickups(now) {
    for (let index = stitchPackDrops.length - 1; index >= 0; index -= 1) {
      const drop = stitchPackDrops[index];
      const target = getSurvivors()
        .filter((survivor) => canReceiveStitchPack(survivor))
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
      clearOneSoulMark(survivor);
      survivor.stitchPack = null;
      survivor.healDecision = null;
      chasePulseUntil = now + 360;
    });
  }

  function updateSharedHealing(dt) {
    getSurvivors().forEach((target) => {
      if (!target.action || target.action.kind !== "beingHealed" || !isHealableState(target)) return;
      if (hunter.carrying) {
        cancelHealing(target.action);
        target.action = null;
        target.healDecision = null;
        return;
      }
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
    const now = performance.now();
    repairPoints.forEach((point) => {
      if (point.completed) return;
      if (areExitsPowered()) {
        cancelRepairPointWorkers(point);
        return;
      }
      point.workers = getActiveRepairers(point);
      if (point.workers.length === 0) return;

      const progressGain = point.workers.reduce((total, worker) => {
        return total + ((dt * 1000) / worker.action.duration) * getRepairSpeedMultiplier(worker);
      }, 0);
      const nextProgress = point.progress + progressGain;
      const hasPlayerWorker = point.workers.some((worker) => worker.kind === "player");
      if (!hasPlayerWorker && isFinalCipherPoint(point) && nextProgress >= FINAL_CIPHER_PRIME_PROGRESS && !shouldPopPrimedFinalCipher(now)) {
        point.progress = FINAL_CIPHER_PRIME_PROGRESS;
        pauseAIRepairers(point);
        return;
      }
      point.progress = Math.min(1, nextProgress);
      if (point.progress >= 1) finishRepair(point);
    });
  }

  function updateSharedGateOpening(dt) {
    exitGates.forEach((gate) => {
      if (!areExitsPowered() || gate.opened) return;
      gate.workers = getActiveGateOpeners(gate);
      if (gate.workers.length === 0) return;

      const progressGain = gate.workers.reduce((total, worker) => {
        return total + ((dt * 1000) / worker.action.duration) * getSurvivorInteractionSpeedMultiplier(worker);
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
    if (isInfiniteSawboneMode() || isKiteSimulatorMode()) return;

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
    trackHunterFourKillUnlock(winner);
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
    if (isTwinSword()) {
      const form = hunter.twinForm === TWIN_FORM_CHIYIN ? "池音" : "赵青天";
      const intent = Math.round(hunter.twinIntent || 0);
      const swords = hunter.twinFlyingSwords || 0;
      const enlightened = performance.now() < (hunter.twinEnlightenedUntil || 0) ? " · 万剑" : "";
      const badgeText = getBadgeReadout(PLAYER_ROLE.hunter, hunter.badges);
      const detentionText = isDetentionActive() ? " · 一刀斩" : "";
      if ((hunter.presenceTier || 0) >= 2) return `双生剑仙${badgeText} · ${form} · 二阶 · 剑${intent} · 飞${swords}${enlightened}${detentionText}`;
      if ((hunter.presenceTier || 0) >= 1) return `双生剑仙${badgeText} · ${form} · 一阶 · 剑${intent} · 飞${swords}${enlightened}${detentionText}`;
      return `双生剑仙${badgeText} · ${form} · 剑${intent} · 飞${swords}${enlightened}${detentionText}`;
    }
    if (isInfiniteSawboneMode()) return "娱乐模式 · 锯骨 · 二阶无限车 · 移动靶";
    if (isSoulBinderPracticeMode()) return "娱乐模式 · 引魂师 · 20魂印无限借魂";
    const badgeText = getBadgeReadout(PLAYER_ROLE.hunter, hunter.badges);
    const detentionText = isDetentionActive() ? " · 一刀斩" : "";
    const hits = hunter.presenceHits || 0;
    if (isSoulBinder()) {
      const marks = getTotalSoulMarks();
      const siphon = hunter.soulSiphonTarget && performance.now() < (hunter.soulSiphonUntil || 0) ? ` · 摄${hunter.soulSiphonTarget.name}` : "";
      const borrow = performance.now() < (hunter.borrowSoulUntil || 0) ? ` · 借魂+${Math.round((hunter.borrowSoulSpeedBonus || 0) * 100)}%` : "";
      if ((hunter.presenceTier || 0) >= 2) return `引魂师${badgeText} · 二阶 · 魂${marks}${siphon}${borrow}${detentionText}`;
      if ((hunter.presenceTier || 0) >= 1) return `引魂师${badgeText} · 一阶 ${hits}/${PRESENCE_TIER_TWO_HITS} · 魂${marks}${siphon}${borrow}${detentionText}`;
      return `引魂师${badgeText} · 存在 ${hits}/${PRESENCE_TIER_ONE_HITS} · 魂${marks}${siphon}${borrow}${detentionText}`;
    }
    if ((hunter.presenceTier || 0) >= 2) return `${getHunterCharacter().name}${badgeText} · 二阶${detentionText}`;
    if ((hunter.presenceTier || 0) >= 1) return `${getHunterCharacter().name}${badgeText} · 一阶 ${hits}/${PRESENCE_TIER_TWO_HITS}${detentionText}`;
    return `${getHunterCharacter().name}${badgeText} · 存在 ${hits}/${PRESENCE_TIER_ONE_HITS}${detentionText}`;
  }

  function getHunterReadout() {
    const now = performance.now();
    if (lanternAlert && now < lanternAlert.until) return lanternAlert.text;
    if (hunter.carrying) return `挂椅 ${Math.round((hunter.carrying.carryProgress || 0) * 100)}%`;
    if (selectedRole === PLAYER_ROLE.hunter && isSawbone() && getSawAttackLockoutLeft(now) > 0) {
      return `${getHunterPresenceReadout()} · 锁刀${Math.ceil(getSawAttackLockoutLeft(now) / 1000)}s`;
    }
    if (selectedRole === PLAYER_ROLE.hunter && isTwinSword() && now < (hunter.twinDualCastUntil || 0)) {
      return `${getHunterPresenceReadout()} · 双生待发`;
    }
    if (selectedRole === PLAYER_ROLE.hunter && hunter.trumpCardSelecting) return `${getHunterPresenceReadout()} · 底牌按1-6`;
    if (selectedRole === PLAYER_ROLE.hunter && hunterHasSkill()) return `${getHunterPresenceReadout()} · ${getHunterSkillButtonLabel()}`;
    if (selectedRole === PLAYER_ROLE.hunter && hasHunterAssist()) return `${getHunterPresenceReadout()} · L ${getHunterAssistButtonLabel()}`;
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
    cancelFencerLungePreparation(player);
    if (touchKnob) touchKnob.style.transform = "translate(0, 0)";
  }

  function bindTouchActions() {
    bindTouchButton(touchUseButton, () => {
      const now = performance.now();
      if (selectedRole === PLAYER_ROLE.hunter && isTwinSword()) {
        if (hunter.twinForm === TWIN_FORM_QINGTIAN) {
          castTwinPrimaryInstant(now);
          return;
        }
        startTwinAim("primary", now, null, null, null, false);
        finishTwinAim(now);
        return;
      }
      if (selectedRole === PLAYER_ROLE.hunter && hasHunterAssist()) {
        handleHunterAssist(now);
        return;
      }
      handlePlayerUse(now);
    });
    bindTouchButton(touchInteractButton, () => {
      const now = performance.now();
      if (selectedRole === PLAYER_ROLE.hunter && isTwinSword()) {
        startTwinAim("secondary", now, null, null, null, false);
        finishTwinAim(now);
        return;
      }
      handlePlayerInteraction(now);
    });
    bindAttackButton();
    bindShadowButton();
    bindSkillButton();
  }

  function bindTouchButton(button, handler) {
    if (!button) return;
    button.addEventListener("pointerdown", (event) => {
      event.preventDefault();
      handler();
    });
  }

  function bindAttackButton() {
    if (!touchAttackButton) return;
    touchAttackButton.addEventListener("pointerdown", (event) => {
      event.preventDefault();
      touchAttackButton.setPointerCapture(event.pointerId);
      startHunterAttackPress(performance.now());
    });
    touchAttackButton.addEventListener("pointerup", (event) => {
      releaseHunterAttackPress(performance.now());
      if (touchAttackButton.hasPointerCapture(event.pointerId)) touchAttackButton.releasePointerCapture(event.pointerId);
    });
    touchAttackButton.addEventListener("pointercancel", (event) => {
      releaseHunterAttackPress(performance.now());
      if (touchAttackButton.hasPointerCapture(event.pointerId)) touchAttackButton.releasePointerCapture(event.pointerId);
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
      if (selectedRole === PLAYER_ROLE.survivor && isFencer(player)) {
        touchSkillButton.setPointerCapture(event.pointerId);
        prepareFencerLunge(player, performance.now());
        return;
      }
      handlePlayerSkill(performance.now());
    });
    touchSkillButton.addEventListener("pointermove", (event) => {
      updatePackageAim(event.clientX, event.clientY, event.pointerId);
    });
    touchSkillButton.addEventListener("pointerup", (event) => {
      if (selectedRole === PLAYER_ROLE.survivor && isFencer(player)) {
        releaseFencerLunge(player, performance.now());
        if (touchSkillButton.hasPointerCapture(event.pointerId)) touchSkillButton.releasePointerCapture(event.pointerId);
        return;
      }
      finishPackageAim(performance.now(), event.pointerId);
    });
    touchSkillButton.addEventListener("pointercancel", (event) => {
      if (selectedRole === PLAYER_ROLE.survivor && isFencer(player)) {
        cancelFencerLungePreparation(player);
        if (touchSkillButton.hasPointerCapture(event.pointerId)) touchSkillButton.releasePointerCapture(event.pointerId);
        return;
      }
      cancelPackageAim(event.pointerId);
    });
  }

  function bindShadowButton() {
    if (!touchShadowButton) return;
    touchShadowButton.addEventListener("pointerdown", (event) => {
      event.preventDefault();
      if (selectedRole === PLAYER_ROLE.hunter && isTwinSword()) {
        touchShadowButton.setPointerCapture(event.pointerId);
        startTwinAim("sword", performance.now(), event.clientX, event.clientY, event.pointerId, false);
        return;
      }
      if (selectedRole === PLAYER_ROLE.survivor && hasSurvivorBadge(player, "flywheel")) {
        touchShadowButton.setPointerCapture(event.pointerId);
        return;
      }
      handlePlayerShadowSkill(performance.now());
    });
    touchShadowButton.addEventListener("pointermove", (event) => {
      updateTwinAim(event.clientX, event.clientY, event.pointerId);
    });
    touchShadowButton.addEventListener("pointerup", (event) => {
      if (selectedRole === PLAYER_ROLE.survivor && hasSurvivorBadge(player, "flywheel")) {
        startFlywheel(player, performance.now());
        return;
      }
      finishTwinAim(performance.now(), event.pointerId);
    });
    touchShadowButton.addEventListener("pointercancel", (event) => {
      if (twinAim && twinAim.kind === "sword" && twinAim.pointerId === event.pointerId) twinAim = null;
    });
  }

  window.addEventListener("resize", resize);
  window.addEventListener("keydown", (event) => {
    if ([" ", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.key)) {
      event.preventDefault();
    }
    if (event.target && ["INPUT", "TEXTAREA"].includes(event.target.tagName)) return;
    const code = event.key.toLowerCase();
    if (event.repeat && [" ", "e", "r", "f", "q", "t", "g", "j", "l", "m"].includes(code)) return;
    handleHiddenCharacterUnlockKey(event.key);
    keyToInput(event.key, true);
  });
  window.addEventListener("keyup", (event) => keyToInput(event.key, false));
  window.addEventListener("pointermove", (event) => {
    rememberAimPointer(event.clientX, event.clientY);
    updatePackageAim(event.clientX, event.clientY, event.pointerId);
    updateTwinAim(event.clientX, event.clientY, event.pointerId);
  });
  window.addEventListener("blur", resetMovementInput);
  roleButtons.forEach((button) => {
    button.addEventListener("click", () => {
      pendingMode = null;
      showCharacterSelection(button.dataset.role);
    });
  });
  modeButtons.forEach((button) => {
    button.addEventListener("click", () => {
      if (button.dataset.mode === GAME_MODE.infiniteSawbone) startInfiniteSawboneMode();
      if (button.dataset.mode === GAME_MODE.soulBinderPractice) startSoulBinderPracticeMode();
      if (button.dataset.mode === GAME_MODE.kiteSimulator) startKiteSimulatorSetup();
    });
  });
  characterButtons.forEach((button) => {
    button.addEventListener("click", () => selectCharacterForSetup(button.dataset.characterRole, button.dataset.character));
  });
  badgeButtons.forEach((button) => {
    button.addEventListener("click", () => toggleBadgeSelection(button.dataset.badgeRole, button.dataset.badge));
  });
  assistButtons.forEach((button) => {
    button.addEventListener("click", () => selectHunterAssist(button.dataset.assist));
  });
  if (survivorStatusGrid) {
    survivorStatusGrid.addEventListener("pointerdown", handleSurvivorStatusPick);
    survivorStatusGrid.addEventListener("dblclick", (event) => handleSurvivorStatusPick(event, true));
  }
  if (characterBackButton) characterBackButton.addEventListener("click", backSetupStep);
  if (characterNextButton) characterNextButton.addEventListener("click", advanceSetupStep);
  if (hiddenUnlockForm) hiddenUnlockForm.addEventListener("submit", submitHiddenHunterCode);

  resize();
  bindTouchStick();
  bindTouchActions();
  resetMatch();
  setRoleOverlayVisible(true);
  requestAnimationFrame(frame);
})();
