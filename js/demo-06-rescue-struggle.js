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
  const roleOverlay = document.getElementById("roleOverlay");
  const roleButtons = document.querySelectorAll("[data-role]");

  const PLAYER_ROLE = {
    survivor: "survivor",
    hunter: "hunter"
  };

  const ATTACK_KEY = "j";
  const HUNTER_HIT_RECOVERY = 3000;
  const HUNTER_MISS_RECOVERY = 760;
  const HEAL_INJURED_DURATION = 9000;
  const HEAL_DOWNED_DURATION = 11000;
  const SURVIVOR_PALLET_PROMPT_RANGE = 112;
  const SURVIVOR_WINDOW_PROMPT_RANGE = 108;
  const HUNTER_PALLET_PROMPT_RANGE = 126;
  const HUNTER_WINDOW_PROMPT_RANGE = 142;
  const REPAIR_REQUIRED = 5;
  const PLAYER_REPAIR_DURATION = 60000;
  const AI_REPAIR_DURATION = 60000;
  const GATE_OPEN_DURATION = 25000;
  const ESCAPE_DURATION = 1200;
  const CHAIR_ELIMINATION_DURATION = 60000;
  const RESCUE_DURATION = 2000;
  const CARRY_STRUGGLE_DURATION = 10500;
  const CARRY_ESCAPE_STUN = 1400;
  const RESCUE_SPEED_BOOST_DURATION = 1800;
  const CHAIR_PRESSURE_RANGE = 420;

  const world = {
    width: 2200,
    height: 1560,
    tile: 80
  };

  const nav = {
    cell: 80,
    cols: Math.ceil(2200 / 80),
    rows: Math.ceil(1560 / 80)
  };

  const player = {
    name: "你",
    kind: "player",
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
    chairProgress: 0,
    nextChairEliminates: false,
    carryProgress: 0,
    chair: null,
    boostUntil: 0,
    action: null,
    fill: "#e9efe6",
    core: "#d9b76a",
    nextInteractAt: 0,
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
    x: 960,
    y: 360,
    radius: 25,
    speed: 292,
    vx: 0,
    vy: 0,
    turnSpeed: Math.PI * 1.8,
    attackRange: 86,
    attackArc: Math.PI / 2,
    attackCooldown: 0.65,
    attackWindup: 0.16,
    lastAttackAt: -10000,
    wipeUntil: 0,
    lastAttackHit: false,
    stunnedUntil: 0,
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
    rect(1020, 1120, 420, 86),
    rect(1600, 1020, 400, 80),
    rect(610, 190, 40, 70),
    rect(720, 190, 40, 70),
    rect(1000, 620, 50, 80),
    rect(1140, 620, 70, 80),
    rect(590, 1030, 40, 80),
    rect(720, 1030, 40, 80),
    rect(1440, 1120, 40, 86),
    rect(1560, 1120, 40, 86)
  ];

  const pallets = [
    prop(685, 225, 82, 10, 0, "standing"),
    prop(1095, 660, 92, 10, 0, "standing"),
    prop(675, 1070, 92, 10, 0, "standing"),
    prop(1520, 1163, 84, 10, 0, "standing")
  ];

  const windows = [
    prop(390, 225, 118, 44, 0, "window"),
    prop(806, 350, 44, 118, 0, "window"),
    prop(1220, 208, 118, 44, 0, "window"),
    prop(1696, 320, 44, 118, 0, "window"),
    prop(375, 685, 44, 118, 0, "window"),
    prop(750, 660, 118, 44, 0, "window"),
    prop(1255, 700, 44, 118, 0, "window"),
    prop(1635, 679, 118, 44, 0, "window"),
    prop(1940, 675, 44, 118, 0, "window"),
    prop(360, 1070, 118, 44, 0, "window"),
    prop(805, 1140, 44, 118, 0, "window"),
    prop(1210, 1163, 118, 44, 0, "window"),
    prop(1780, 1060, 118, 44, 0, "window")
  ];

  const repairPoints = [
    objective(585, 360),
    objective(1130, 375),
    objective(1800, 330),
    objective(1040, 850),
    objective(440, 1270),
    objective(1540, 1270),
    objective(1980, 1160)
  ];

  const exitGates = [
    exitGate(190, 720),
    exitGate(2030, 760)
  ];

  const chairs = [
    chair(190, 320), chair(520, 320), chair(910, 330), chair(1450, 320), chair(1970, 330),
    chair(220, 560), chair(700, 520), chair(1120, 520), chair(1530, 520), chair(2020, 560),
    chair(260, 860), chair(650, 830), chair(1110, 900), chair(1540, 850), chair(2000, 900),
    chair(360, 1320), chair(1180, 1320), chair(1840, 1320)
  ];

  let width = 0;
  let height = 0;
  let dpr = 1;
  let lastTime = performance.now();
  let chasePulseUntil = 0;
  let selectedRole = null;
  let matchStarted = false;
  let matchResult = null;

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
      chairProgress: 0,
      nextChairEliminates: false,
      carryProgress: 0,
      chair: null,
      boostUntil: 0,
      action: null,
      fill,
      core,
      nextInteractAt: 0,
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

    if (updateActorAction(player, performance.now())) return;

    if (player.state !== "healthy" && player.state !== "injured") {
      player.vx = 0;
      player.vy = 0;
      return;
    }

    const move = getMoveVector();
    const wantsSprint = input.sprint && player.stamina > 2 && move.length > 0.1;
    const now = performance.now();
    const injuredPenalty = player.state === "injured" ? 0.88 : 1;
    const hitBoost = now < player.boostUntil ? 1.45 : 1;
    const speed = (wantsSprint ? player.sprintSpeed : player.speed) * injuredPenalty * hitBoost;
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
    const speed = hunter.speed * getHunterCarrySpeedMultiplier();
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
    maybeInterruptAIObjectiveForRescue(survivor, now);
    if (updateActorAction(survivor, now)) return;

    if (survivor.state === "downed") {
      survivor.vx = 0;
      survivor.vy = 0;
      return;
    }

    const hunterDistance = distanceBetween(survivor, hunter);
    if (updateAIChairRescue(survivor, dt, now, hunterDistance)) return;
    if (updateAIHealing(survivor, dt, now, hunterDistance)) return;

    if (hunter.target !== survivor && updateAIObjective(survivor, dt, now, hunterDistance)) return;

    if (hunterDistance < 500) {
      handleAIInteraction(survivor, now, hunterDistance);
      moveAISurvivorAway(survivor, dt, now, hunterDistance);
      return;
    }

    if (updateAIObjective(survivor, dt, now, hunterDistance)) return;

    moveAISurvivorWander(survivor, dt, now);
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

    const target = findBestAIHealTarget(survivor);
    if (!target) return;

    cancelAIObjectiveAction(survivor);
    survivor.healDecision = {
      target,
      until: now + 1800
    };
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
    if (hunterDistance < 180) return false;
    if (hunter.status === "attacking" || hunter.status === "cooldown") return false;
    return true;
  }

  function updateAIObjective(survivor, dt, now, hunterDistance) {
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
    return hunterDistance >= 260;
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

  function getAIRepairTarget(survivor, now) {
    if (shouldKeepObjectiveDecision(survivor, now, "repair")) return survivor.objectiveDecision.target;

    let best = null;
    let bestScore = Infinity;
    repairPoints.forEach((point) => {
      if (point.completed || isRepairingPoint(survivor, point)) return;
      const distance = distanceBetween(survivor, point);
      const progressBonus = point.progress * 260;
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
      until: now + 1600
    };
    return target;
  }

  function shouldKeepHealDecision(survivor, now) {
    const decision = survivor.healDecision;
    if (!decision || now >= decision.until) return false;
    return canAIHealTarget(decision.target);
  }

  function findBestAIHealTarget(healer) {
    let best = null;
    let bestScore = Infinity;
    getSurvivors().forEach((target) => {
      if (target === healer || !canAIHealTarget(target)) return;
      const distance = distanceBetween(healer, target);
      if (distance > 980) return;
      const hunterDistance = distanceBetween(hunter, target);
      const score = distance - hunterDistance * 0.12 - (target.healProgress || 0) * 220;
      if (score < bestScore) {
        best = target;
        bestScore = score;
      }
    });
    return best;
  }

  function canAIHealTarget(target) {
    return canBeHealed(target) && target.state === "downed";
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
      startVault(survivor, routeWindow, 320, now, "vaulting");
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
      startVault(survivor, droppedPallet, 260, now, "vaulting");
      survivor.nextInteractAt = now + 850;
      return;
    }

    const nearWindow = findNearestWindow(survivor, 78);
    if (nearWindow && hunterDistance < 330) {
      startVault(survivor, nearWindow, 320, now, "vaulting");
      survivor.nextInteractAt = now + 850;
    }
  }

  function moveAISurvivorAway(survivor, dt, now, hunterDistance) {
    const destination = getKiteEscapeDestination(survivor, hunterDistance, now);
    const routeWindow = findUsefulWindowForRoute(survivor, destination, 118);
    if (routeWindow && hunterDistance < 430 && !survivor.action && now >= survivor.nextInteractAt) {
      startVault(survivor, routeWindow, 320, now, "vaulting");
      survivor.nextInteractAt = now + 900;
      return;
    }

    const injuredPenalty = survivor.state === "injured" ? 0.88 : 1;
    const hitBoost = now < survivor.boostUntil ? 1.45 : 1;
    const panicBoost = hunterDistance < 310 ? 1.12 : 1;
    const speed = survivor.speed * injuredPenalty * hitBoost * panicBoost;
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
      until: now + (mode === "rotate" ? 1350 : 1050)
    };
    decision.destination = getKiteDecisionDestination(survivor, decision, away);
    return decision;
  }

  function refreshKiteDecisionDestination(survivor, now) {
    const away = normalizeVector(survivor.x - hunter.x, survivor.y - hunter.y);
    survivor.kiteDecision.destination = getKiteDecisionDestination(survivor, survivor.kiteDecision, away);
    survivor.kiteDecision.until = now + (survivor.kiteDecision.mode === "rotate" ? 900 : 700);
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
      if (survivorDistance < 120 || survivorDistance > 760) return;
      if (hunterDistance < 360) return;

      const safetyGain = hunterDistance - currentHunterDistance;
      const raceAdvantage = hunterDistance - survivorDistance;
      if (safetyGain < 140 && raceAdvantage < 90) return;

      const routePenalty = hasWalkableLine(survivor.x, survivor.y, item.x, item.y, survivor.radius) ? 0 : 90;
      const score = hunterDistance * 1.05 + raceAdvantage * 0.75 - survivorDistance * 0.45 - routePenalty;
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

  function canHunterAttack(now) {
    return !hunter.action &&
      !hunter.carrying &&
      now >= hunter.stunnedUntil &&
      now >= hunter.wipeUntil &&
      now - hunter.lastAttackAt >= hunter.attackCooldown * 1000;
  }

  function performHunterAttack(now) {
    const target = findHunterAttackTarget();
    hunter.lastAttackAt = now;
    hunter.status = "attacking";
    hunter.lastAttackHit = Boolean(target);
    chasePulseUntil = now + 280;

    if (target) {
      applyHunterHit(target);
      hunter.wipeUntil = now + HUNTER_HIT_RECOVERY;
      return;
    }

    hunter.wipeUntil = now + HUNTER_MISS_RECOVERY;
  }

  function findHunterAttackTarget() {
    let best = null;
    let bestDistance = Infinity;
    getSurvivors().forEach((survivor) => {
      if (survivor.escaped) return;
      if (survivor.state === "downed" || survivor.state === "seated" || survivor.state === "carried" || survivor.state === "eliminated") return;
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
    let best = null;
    let bestHealthPriority = Infinity;
    let bestDistance = Infinity;
    getSurvivors().forEach((survivor) => {
      if (survivor.escaped) return;
      if (survivor.state === "downed" || survivor.state === "seated" || survivor.state === "carried" || survivor.state === "eliminated") return;
      const distance = distanceBetween(hunter, survivor);
      const healthPriority = getTargetHealthPriority(survivor);
      const distanceWithStickiness = survivor === hunter.target ? distance - 35 : distance;
      if (
        healthPriority < bestHealthPriority ||
        (healthPriority === bestHealthPriority && distanceWithStickiness < bestDistance)
      ) {
        best = survivor;
        bestHealthPriority = healthPriority;
        bestDistance = distanceWithStickiness;
      }
    });
    return best;
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
      startVault(hunter, routeWindow, 1050, now, "vaulting");
      return;
    }

    const moved = moveActorToPoint(hunter, target.x, target.y, hunter.speed, dt, now);
    if (moved > 0.4) return;

    const nearWindow = findNearestWindow(hunter, 108);
    if (nearWindow && !hasWalkableLine(hunter.x, hunter.y, target.x, target.y, hunter.radius)) {
      startVault(hunter, nearWindow, 1050, now, "vaulting");
      return;
    }

    hunter.path = [];
    if (dt > 0) hunter.status = "chasing";
  }

  function updateAIHunterChairing(dt, now) {
    if (hunter.carrying) {
      const chairTarget = findNearestEmptyChair(hunter, Infinity);
      if (!chairTarget) return false;
      if (distanceBetween(hunter, chairTarget) < 88) {
        startChairSurvivor(hunter.carrying, chairTarget, now);
        return true;
      }
      hunter.status = "carrying";
      moveActorToPoint(hunter, chairTarget.x, chairTarget.y, hunter.speed * getHunterCarrySpeedMultiplier(), dt, now);
      updateCarriedSurvivorPosition();
      return true;
    }

    const downed = findNearestDownedSurvivor(hunter, 118);
    if (downed) {
      pickupSurvivor(downed);
      return true;
    }

    const target = findNearestDownedSurvivor(hunter, 520);
    if (!target) return false;
    hunter.status = "toChair";
    moveActorToPoint(hunter, target.x, target.y, hunter.speed * 0.86, dt, now);
    return true;
  }

  function applyHunterHit(survivor) {
    if (survivor.escaped || survivor.state === "seated" || survivor.state === "carried" || survivor.state === "eliminated") return;
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

    if (survivor.state === "healthy") {
      survivor.state = "injured";
      survivor.healProgress = 0;
      survivor.boostUntil = performance.now() + 1800;
      return;
    }

    if (survivor.state === "injured") {
      survivor.state = "downed";
      survivor.healProgress = 0;
      survivor.chair = null;
      survivor.carryProgress = 0;
    }
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
    hunter.action = null;
    hunter.carrying = null;
    hunter.status = "chasing";
    hunter.target = null;
    hunter.path = [];
    hunter.pathGoal = null;
    hunter.repathAt = 0;
  }

  function startMatch(role) {
    selectedRole = role;
    resetMatch();
    matchStarted = true;
    setRoleOverlayVisible(false);
  }

  function restartCurrentMatch() {
    if (!selectedRole) return;
    resetMatch();
    matchStarted = true;
    setRoleOverlayVisible(false);
  }

  function setRoleOverlayVisible(visible) {
    if (!roleOverlay) return;
    roleOverlay.classList.toggle("is-hidden", !visible);
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
    survivor.chairProgress = 0;
    survivor.nextChairEliminates = false;
    survivor.carryProgress = 0;
    survivor.chair = null;
    survivor.escaped = false;
    survivor.boostUntil = 0;
    survivor.action = null;
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
      startVault(player, droppedPallet, 260, now, "vaulting");
      return;
    }

    const nearWindow = findNearestWindow(player, SURVIVOR_WINDOW_PROMPT_RANGE);
    if (nearWindow) {
      startVault(player, nearWindow, 320, now, "vaulting");
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
      return;
    }

    const downedSurvivor = findNearestDownedSurvivor(hunter, 112);
    if (downedSurvivor) {
      pickupSurvivor(downedSurvivor);
      return;
    }

    const droppedPallet = findNearestPallet(hunter, "dropped", HUNTER_PALLET_PROMPT_RANGE);
    if (droppedPallet) {
      startBreakPallet(droppedPallet, now);
      return;
    }

    const nearWindow = findNearestWindow(hunter, HUNTER_WINDOW_PROMPT_RANGE);
    if (nearWindow) {
      startVault(hunter, nearWindow, 1050, now, "vaulting");
    }
  }

  function handlePlayerUse(now) {
    if (!matchStarted || selectedRole !== PLAYER_ROLE.survivor) return;
    if (player.action && player.action.kind === "healing") {
      cancelHealing(player.action);
      player.action = null;
      return;
    }
    if (player.action && player.action.kind === "repairing") {
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
    if (player.state !== "healthy" && player.state !== "injured" || player.action || player.escaped) return;

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

  function getCompletedRepairCount() {
    return repairPoints.filter((point) => point.completed).length;
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

  function startHealing(healer, target, now) {
    if (healer.action || healer.state !== "healthy" && healer.state !== "injured" || !canBeHealed(target) || healer === target) return;
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
    const duration = actor === player && selectedRole === PLAYER_ROLE.survivor
      ? PLAYER_REPAIR_DURATION
      : AI_REPAIR_DURATION;
    actor.action = {
      kind: "repairing",
      start: now,
      point,
      actor,
      duration
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

  function pickupSurvivor(survivor) {
    if (!survivor || hunter.carrying || survivor.state !== "downed") return;
    cancelSurvivorAction(survivor);
    survivor.state = "carried";
    survivor.chair = null;
    survivor.carryProgress = 0;
    survivor.vx = 0;
    survivor.vy = 0;
    survivor.path = [];
    survivor.pathGoal = null;
    hunter.carrying = survivor;
    hunter.status = "carrying";
    updateCarriedSurvivorPosition();
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
    survivor.carryProgress = 0;
    survivor.chair = null;
    survivor.action = null;
    survivor.boostUntil = now + RESCUE_SPEED_BOOST_DURATION;
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
      until: now + RESCUE_DURATION,
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
    target.action = null;
    target.chair = null;
    target.carryProgress = 0;
    target.boostUntil = performance.now() + RESCUE_SPEED_BOOST_DURATION;
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

  function finishHealing(target) {
    getActiveHealers(target).forEach((healer) => {
      healer.action = null;
    });
    if (target.state === "downed") {
      target.state = "injured";
      target.boostUntil = performance.now() + 900;
      target.carryProgress = 0;
    } else if (target.state === "injured") {
      target.state = "healthy";
      target.boostUntil = 0;
    }
    target.healProgress = 0;
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
      hunter.stunnedUntil = now + 3000;
      hunter.wipeUntil = 0;
      hunter.status = "stunned";
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
    if (action.kind === "healing") {
      actor.vx = 0;
      actor.vy = 0;
      actor.angle = Math.atan2(action.target.y - actor.y, action.target.x - actor.x);
      if (!isHealableState(action.target) || action.target.escaped || distanceBetween(actor, action.target) > 112) {
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
      actor.vx = 0;
      actor.vy = 0;
      actor.angle = Math.atan2(action.gate.y - actor.y, action.gate.x - actor.x);
      if (!areExitsPowered() || actor.state === "downed" || distanceBetween(actor, action.gate) > 120) {
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
    drawRects(walls, "#141b16", "#293529");
    drawWindows();
    drawPallets();
    drawHunter();
    drawTeammates();
    drawPlayer();
    drawVignette();

    ctx.restore();
    drawMatchResult();
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
  }

  function drawChair(item) {
    const survivor = item.survivor;
    ctx.save();
    ctx.translate(item.x, item.y);
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
    ctx.save();
    ctx.translate(player.x, player.y);
    ctx.rotate(player.angle);

    ctx.fillStyle = "rgba(0, 0, 0, 0.28)";
    ctx.beginPath();
    ctx.ellipse(2, 8, 26, 17, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = player.state === "downed" ? "#9ba99d" : "#e9efe6";
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

    ctx.fillStyle = "#d9b76a";
    ctx.beginPath();
    ctx.arc(-5, 0, 7, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();

    if (player.action && ["repairing", "openingGate", "escaping", "rescuing"].includes(player.action.kind)) {
      drawSurvivorLabel(player);
    } else if (player.state !== "healthy") {
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
      if (!survivor.escaped && survivor.state !== "eliminated") drawSurvivor(survivor, false);
    });
  }

  function drawSurvivor(survivor, showName) {
    ctx.save();
    ctx.translate(survivor.x, survivor.y);
    ctx.rotate(survivor.angle);

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

    if (showName || survivor.state !== "healthy" || performance.now() < survivor.boostUntil) {
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
    } else if (performance.now() < survivor.boostUntil) label = `${survivor.name} 加速`;
    else if (survivor.state === "injured") label = `${survivor.name} 受伤`;
    else if (survivor.state === "downed") label = `${survivor.name} 倒地`;
    else if (survivor.state === "carried") label = `挣扎 ${Math.round((survivor.carryProgress || 0) * 100)}%`;
    else if (survivor.state === "seated") label = `上椅 ${Math.round(survivor.chairProgress * 100)}%`;

    ctx.save();
    ctx.translate(survivor.x, survivor.y - 38);
    ctx.fillStyle = survivor.action && ["beingHealed", "repairing", "openingGate", "escaping", "rescuing"].includes(survivor.action.kind)
      ? "#b7d6c1"
      : survivor.state === "healthy" ? "rgba(16, 22, 18, 0.86)" : survivor.state === "injured" ? "#d9b76a" : "#b95f52";
    ctx.beginPath();
    ctx.roundRect(-40, -9, 80, 18, 6);
    ctx.fill();
    ctx.fillStyle = survivor.state === "healthy" && (!survivor.action || !["beingHealed", "repairing", "openingGate", "escaping", "rescuing"].includes(survivor.action.kind)) ? "#eef3ed" : "#101611";
    ctx.font = "700 11px ui-sans-serif, system-ui";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(label, 0, 1);
    ctx.restore();
  }

  function drawPlayerInteractionHint() {
    if (selectedRole !== PLAYER_ROLE.survivor) return;
    if (player.state !== "healthy" && player.state !== "injured" || player.action || player.escaped) return;

    const seatedTarget = findNearestSeatedTeammate(player, 96);
    const healTarget = findNearestHealableTeammate(player, 92);
    const nearExit = areExitsPowered() ? findNearestExitGate(player, 96) : null;
    const repairPoint = findNearestRepairPoint(player, 110);
    const standingPallet = findNearestPallet(player, "standing", SURVIVOR_PALLET_PROMPT_RANGE);
    const droppedPallet = findNearestPallet(player, "dropped", SURVIVOR_PALLET_PROMPT_RANGE);
    const nearWindow = findNearestWindow(player, SURVIVOR_WINDOW_PROMPT_RANGE);
    let label = "";
    if (seatedTarget) label = `E 救${seatedTarget.name}`;
    else if (healTarget) label = `E 治疗${healTarget.name}`;
    else if (nearExit) label = nearExit.opened ? "E 逃出" : "E 开门";
    else if (repairPoint) label = "E 修理";
    else if (standingPallet) label = "Space 下板";
    else if (droppedPallet) label = "Space 翻板";
    else if (nearWindow) label = "Space 翻窗";
    if (!label) return;

    ctx.save();
    ctx.translate(player.x, player.y + 42);
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

    ctx.save();
    ctx.translate(hunter.x, hunter.y);

    drawHunterAttackCone(now);

    ctx.rotate(hunter.angle);
    ctx.fillStyle = "rgba(0, 0, 0, 0.32)";
    ctx.beginPath();
    ctx.ellipse(2, 10, 30, 18, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#b95f52";
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

    ctx.fillStyle = "#ffd5cd";
    ctx.beginPath();
    ctx.arc(-4, 0, 7, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();

    if (hunter.status === "stunned" || hunter.status === "wipe" || hunter.status === "miss" || hunter.status === "breaking") {
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
    miniCtx.fillStyle = "#b95f52";
    miniCtx.beginPath();
    miniCtx.arc(hunter.x, hunter.y, 38, 0, Math.PI * 2);
    miniCtx.fill();
    teammates.forEach((survivor) => {
      if (survivor.escaped || survivor.state === "eliminated") return;
      miniCtx.fillStyle = survivor.core;
      miniCtx.beginPath();
      miniCtx.arc(survivor.x, survivor.y, 30, 0, Math.PI * 2);
      miniCtx.fill();
    });
    if (!player.escaped && player.state !== "eliminated") {
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
    if (controlsReadout) controlsReadout.textContent = selectedRole === PLAYER_ROLE.hunter ? "J / Space" : "E / Space";
    updateTouchActions();
  }

  function updateTouchActions() {
    if (!touchUseButton || !touchInteractButton || !touchAttackButton) return;
    const isHunter = selectedRole === PLAYER_ROLE.hunter;
    const isSurvivor = selectedRole === PLAYER_ROLE.survivor;
    touchUseButton.classList.toggle("is-hidden", !isSurvivor);
    touchAttackButton.classList.toggle("is-hidden", !isHunter);
    touchInteractButton.classList.toggle("is-hidden", !selectedRole);

    if (isSurvivor) {
      touchUseButton.textContent = getSurvivorUseButtonLabel();
      touchInteractButton.textContent = "板窗";
    } else if (isHunter) {
      touchAttackButton.textContent = "攻击";
      touchInteractButton.textContent = "交互";
    } else {
      touchUseButton.textContent = "使用";
      touchAttackButton.textContent = "攻击";
      touchInteractButton.textContent = "交互";
    }
  }

  function getSurvivorUseButtonLabel() {
    if (player.action && player.action.kind === "healing") return "停止";
    if (player.action && player.action.kind === "repairing") return "停止";
    if (player.action && player.action.kind === "openingGate") return "停止";
    if (player.action && player.action.kind === "rescuing") return "停止";
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
    if (selectedRole === PLAYER_ROLE.hunter) return "追捕者";
    if (player.escaped) return "已逃出";
    if (player.action && player.action.kind === "repairing") return "修理";
    if (player.action && player.action.kind === "openingGate") return "开门";
    if (player.action && player.action.kind === "escaping") return "逃出";
    if (player.action && player.action.kind === "healing") return "治疗";
    if (performance.now() < player.boostUntil) return "加速";
    return getStateLabel(player.state);
  }

  function getExitReadout() {
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
    updateCarryStruggle(dt, performance.now());
    updateSharedHealing(dt);
    updateSharedRepairs(dt);
    updateSharedGateOpening(dt);
    updateChairProgress(dt);
  }

  function updateChairProgress(dt) {
    chairs.forEach((item) => {
      const survivor = item.survivor;
      if (!survivor || survivor.state !== "seated") return;
      survivor.chairProgress = Math.min(1, survivor.chairProgress + (dt * 1000) / CHAIR_ELIMINATION_DURATION);
      if (survivor.chairProgress >= 1) eliminateSurvivor(survivor);
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
      target.healProgress = Math.min(1, (target.healProgress || 0) + (dt * 1000 * healers.length) / duration);
      if (target.healProgress >= 1) finishHealing(target);
    });
  }

  function updateSharedRepairs(dt) {
    repairPoints.forEach((point) => {
      if (point.completed) return;
      point.workers = getActiveRepairers(point);
      if (point.workers.length === 0) return;

      const progressGain = point.workers.reduce((total, worker) => {
        return total + (dt * 1000) / worker.action.duration;
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

    if (eliminatedCount >= 3) {
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
    if (status === "carrying") return "牵起";
    if (status === "toChair") return "找椅";
    if (status === "allDowned") return "全倒地";
    if (status === "controlled") return "手动";
    return "追击";
  }

  function getHunterReadout() {
    if (hunter.carrying) return `挂椅 ${Math.round((hunter.carrying.carryProgress || 0) * 100)}%`;
    if (selectedRole === PLAYER_ROLE.hunter && canHunterAttack(performance.now())) return "J 攻击";
    if (["wipe", "miss", "stunned", "breaking", "vaulting", "allDowned"].includes(hunter.status)) {
      return getHunterStatusLabel(hunter.status);
    }
    if (hunter.target) return `追${hunter.target.name}`;
    return getHunterStatusLabel(hunter.status);
  }

  function frame(now) {
    const dt = Math.min(0.033, (now - lastTime) / 1000);
    lastTime = now;
    if (matchStarted) {
      movePlayer(dt);
      updateTeammates(dt, now);
      if (selectedRole !== PLAYER_ROLE.hunter) updateHunter(dt, now);
      updateSharedInteractions(dt);
      checkMatchResult();
    }
    updateCamera(dt);
    draw();
    requestAnimationFrame(frame);
  }

  function bindTouchStick() {
    let activePointer = null;
    const max = 30;

    function setStick(clientX, clientY) {
      const box = touchStick.getBoundingClientRect();
      const centerX = box.left + box.width / 2;
      const centerY = box.top + box.height / 2;
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

  function bindTouchActions() {
    bindTouchButton(touchUseButton, () => handlePlayerUse(performance.now()));
    bindTouchButton(touchInteractButton, () => handlePlayerInteraction(performance.now()));
    bindTouchButton(touchAttackButton, () => handlePlayerAttack(performance.now()));
  }

  function bindTouchButton(button, handler) {
    if (!button) return;
    button.addEventListener("pointerdown", (event) => {
      event.preventDefault();
      handler();
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
  roleButtons.forEach((button) => {
    button.addEventListener("click", () => startMatch(button.dataset.role));
  });

  resize();
  bindTouchStick();
  bindTouchActions();
  resetMatch();
  setRoleOverlayVisible(true);
  requestAnimationFrame(frame);
})();
