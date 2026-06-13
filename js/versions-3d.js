(function () {
  "use strict";

  const canvas = document.getElementById("view3d");
  const ctx = canvas.getContext("2d");
  const miniCanvas = document.getElementById("miniMap");
  const mini = miniCanvas.getContext("2d");
  const overlay = document.getElementById("modeOverlay");
  const start3dButton = document.getElementById("start3dButton");
  const changeModeButton = document.getElementById("changeModeButton");
  const roleReadout = document.getElementById("roleReadout");
  const repairReadout = document.getElementById("repairReadout");
  const actionReadout = document.getElementById("actionReadout");
  const actionPrompt = document.getElementById("actionPrompt");
  const roleButtons = Array.from(document.querySelectorAll(".role-chip"));
  const movePad = document.getElementById("movePad");
  const moveKnob = document.getElementById("moveKnob");
  const lookPad = document.getElementById("lookPad");
  const actionUseButton = document.getElementById("actionUseButton");
  const actionInteractButton = document.getElementById("actionInteractButton");
  const actionAttackButton = document.getElementById("actionAttackButton");

  const MAP_SCALE = 1.22;
  const REPAIR_REQUIRED = 5;
  const REPAIR_DURATION = 60000;
  const GATE_OPEN_DURATION = 25000;
  const ATTACK_RANGE = 128;
  const ATTACK_ARC = Math.PI;
  const ATTACK_HIT_RECOVERY = 3000;
  const ATTACK_MISS_RECOVERY = 760;
  const AI_FLEE_RANGE = scaled(420);
  const AI_ABORT_OBJECTIVE_RANGE = scaled(400);
  const AI_INTERACT_RANGE = scaled(118);
  const INTERACT_RANGE = scaled(172);
  const VAULT_DISTANCE = scaled(126);
  const PLAYER_ACCEL = 10.5;
  const AI_ACCEL = 7.5;
  const CAMERA_SMOOTHING = 11;
  const baseWorld = {
    width: 2400,
    height: 1760,
    tile: 80
  };
  const world = {
    width: scaled(baseWorld.width),
    height: scaled(baseWorld.height),
    tile: scaled(baseWorld.tile)
  };

  const keys = new Set();
  const player = {
    role: "survivor",
    x: scaled(340),
    y: scaled(330),
    radius: 22,
    angle: 0,
    pitch: 0,
    vx: 0,
    vy: 0,
    action: null,
    health: 2,
    state: "healthy",
    moveX: 0,
    moveY: 0
  };

  const teammates = [
    actor("survivor", 1120, 380, "#5aa475", "队友1"),
    actor("survivor", 460, 1260, "#6d8fd4", "队友2"),
    actor("survivor", 1720, 1180, "#c87f55", "队友3")
  ];
  const hunter = actor("hunter", 960, 360, "#d77b6e", "追捕者");

  const walls = [
    wall(0, 0, baseWorld.width, 54, "high"),
    wall(0, baseWorld.height - 54, baseWorld.width, 54, "high"),
    wall(0, 0, 54, baseWorld.height, "high"),
    wall(baseWorld.width - 54, 0, 54, baseWorld.height, "high"),
    wall(250, 190, 360, 70, "high"),
    wall(760, 170, 92, 390, "high"),
    wall(1010, 170, 430, 76, "high"),
    wall(1650, 160, 92, 360, "high"),
    wall(330, 470, 90, 420, "high"),
    wall(540, 620, 460, 80, "high"),
    wall(1210, 460, 90, 520, "high"),
    wall(1450, 640, 410, 78, "high"),
    wall(1900, 480, 80, 430, "high"),
    wall(170, 1030, 420, 80, "high"),
    wall(760, 930, 88, 420, "high"),
    wall(1020, 1120, 360, 86, "high"),
    wall(610, 190, 40, 70, "low"),
    wall(720, 190, 40, 70, "low"),
    wall(1000, 620, 50, 80, "low"),
    wall(1140, 620, 70, 80, "low"),
    wall(590, 1030, 40, 80, "low"),
    wall(720, 1030, 40, 80, "low"),
    wall(1440, 1120, 40, 86, "low"),
    wall(1560, 1120, 40, 86, "low"),
    wall(1890, 1124, 44, 72, "low"),
    wall(2006, 1124, 44, 72, "low"),
    wall(1760, 1464, 44, 72, "low"),
    wall(1876, 1464, 44, 72, "low"),
    wall(2050, 1204, 44, 72, "low"),
    wall(2166, 1204, 44, 72, "low"),
    wall(2070, 1564, 44, 72, "low"),
    wall(2186, 1564, 44, 72, "low")
  ];

  const pallets = [
    prop(685, 225, 82, 10, 0, "pallet"),
    prop(1095, 660, 92, 10, 0, "pallet"),
    prop(675, 1070, 92, 10, 0, "pallet"),
    prop(1520, 1163, 84, 10, 0, "pallet"),
    prop(1970, 1160, 68, 10, 0, "pallet"),
    prop(1840, 1500, 68, 10, 0, "pallet"),
    prop(2130, 1240, 68, 10, 0, "pallet"),
    prop(2150, 1600, 68, 10, 0, "pallet")
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
    point(585, 360),
    point(1130, 375),
    point(1800, 330),
    point(1040, 850),
    point(440, 1270),
    point(1620, 1320),
    point(1980, 1120),
    point(2120, 1500),
    point(2250, 820)
  ];

  const chairs = [
    point(190, 320), point(520, 320), point(910, 330), point(1450, 320), point(1970, 330),
    point(220, 560), point(700, 520), point(1120, 520), point(1530, 520), point(2190, 650),
    point(260, 860), point(650, 830), point(1110, 900), point(1540, 850), point(2040, 1060),
    point(360, 1320), point(1180, 1320), point(1730, 1440), point(2220, 1300), point(2260, 1600)
  ];

  const exitGates = [
    point(190, 720),
    point(2240, 1460)
  ];

  const hatch = point(1510, 1510);

  repairPoints.forEach((item) => {
    item.progress = 0;
    item.completed = false;
    item.worker = null;
  });
  exitGates.forEach((item) => {
    item.progress = 0;
    item.opened = false;
    item.worker = null;
  });
  pallets.forEach((item) => {
    item.label = "standing";
  });
  teammates.forEach((item) => {
    item.health = 2;
    item.state = "healthy";
    item.action = null;
    item.vx = 0;
    item.vy = 0;
    item.aiTarget = null;
  });
  Object.assign(hunter, {
    health: 999,
    state: "healthy",
    vx: 0,
    vy: 0,
    nextAttackAt: 0,
    wipeUntil: 0,
    stunnedUntil: 0,
    aiTarget: null
  });

  const camera = {
    x: 0,
    y: 0,
    targetX: 0,
    targetY: 0,
    targetHorizon: 0,
    height: 220,
    back: 430,
    focal: 720,
    horizon: 0
  };

  let width = 0;
  let height = 0;
  let dpr = 1;
  let running = false;
  let lastTime = performance.now();

  function scaled(value) {
    return value * MAP_SCALE;
  }

  function wall(x, y, w, h, level) {
    return { x: scaled(x), y: scaled(y), w: scaled(w), h: scaled(h), level };
  }

  function prop(x, y, w, h, angle, label) {
    return { x: scaled(x), y: scaled(y), w: scaled(w), h: scaled(h), angle, label };
  }

  function point(x, y) {
    return { x: scaled(x), y: scaled(y) };
  }

  function actor(type, x, y, color, name) {
    return { type, x: scaled(x), y: scaled(y), color, name, radius: type === "hunter" ? 25 : 22, angle: 0 };
  }

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = Math.max(1, Math.floor(window.innerWidth));
    height = Math.max(1, Math.floor(window.innerHeight));
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function normalizeAngle(angle) {
    while (angle < -Math.PI) angle += Math.PI * 2;
    while (angle > Math.PI) angle -= Math.PI * 2;
    return angle;
  }

  function intersectsRectCircle(rect, x, y, radius) {
    const nearestX = clamp(x, rect.x, rect.x + rect.w);
    const nearestY = clamp(y, rect.y, rect.y + rect.h);
    return Math.hypot(x - nearestX, y - nearestY) < radius;
  }

  function canStandAt(x, y, radius) {
    if (x < radius || y < radius || x > world.width - radius || y > world.height - radius) return false;
    return !walls.some((item) => intersectsRectCircle(item, x, y, radius));
  }

  function update(dt) {
    const now = performance.now();
    if (keys.has("ArrowLeft")) player.angle -= 1.5 * dt;
    if (keys.has("ArrowRight")) player.angle += 1.5 * dt;
    if (keys.has("ArrowUp")) player.pitch = clamp(player.pitch - 0.72 * dt, -0.42, 0.28);
    if (keys.has("ArrowDown")) player.pitch = clamp(player.pitch + 0.72 * dt, -0.42, 0.28);
    player.angle = normalizeAngle(player.angle);

    updatePlayerMovement(dt);
    updateAI(dt, now);
    updateActions(dt);
    updateCamera(dt);
    updateHud();
  }

  function updatePlayerMovement(dt) {
    if (player.action) {
      moveActorWithVelocity(player, 0, 0, dt, PLAYER_ACCEL);
      return;
    }

    const forward = (keys.has("KeyW") ? 1 : 0) - (keys.has("KeyS") ? 1 : 0);
    const strafe = (keys.has("KeyD") ? 1 : 0) - (keys.has("KeyA") ? 1 : 0);
    const inputX = strafe + player.moveX;
    const inputY = forward + player.moveY;
    const length = Math.hypot(inputX, inputY);
    let targetVx = 0;
    let targetVy = 0;

    if (length > 0.02) {
      const nx = inputX / length;
      const ny = inputY / length;
      const speed = player.role === "hunter" ? 286 : 250;
      targetVx = (Math.cos(player.angle) * ny + Math.cos(player.angle + Math.PI / 2) * nx) * speed;
      targetVy = (Math.sin(player.angle) * ny + Math.sin(player.angle + Math.PI / 2) * nx) * speed;
    }

    moveActorWithVelocity(player, targetVx, targetVy, dt, PLAYER_ACCEL);
  }

  function moveActorWithVelocity(actorItem, targetVx, targetVy, dt, accel) {
    const blend = 1 - Math.exp(-accel * dt);
    actorItem.vx = (actorItem.vx || 0) + (targetVx - (actorItem.vx || 0)) * blend;
    actorItem.vy = (actorItem.vy || 0) + (targetVy - (actorItem.vy || 0)) * blend;
    const dx = actorItem.vx * dt;
    const dy = actorItem.vy * dt;
    if (canStandAt(actorItem.x + dx, actorItem.y, actorItem.radius)) {
      actorItem.x += dx;
    } else {
      actorItem.vx *= -0.18;
    }
    if (canStandAt(actorItem.x, actorItem.y + dy, actorItem.radius)) {
      actorItem.y += dy;
    } else {
      actorItem.vy *= -0.18;
    }

    if (actorItem !== player && Math.hypot(actorItem.vx, actorItem.vy) > 8) {
      actorItem.angle = Math.atan2(actorItem.vy, actorItem.vx);
    }
  }

  function updateCamera(dt = 1) {
    const back = player.role === "hunter" ? 470 : 430;
    camera.height = player.role === "hunter" ? 250 : 220;
    camera.back = resolveCameraBackDistance(back);
    camera.targetX = player.x - Math.cos(player.angle) * camera.back;
    camera.targetY = player.y - Math.sin(player.angle) * camera.back;
    camera.targetHorizon = height * 0.44 + player.pitch * height * 0.42;
    camera.focal = Math.min(width * 0.86, height * 1.08);

    if (!canStandAt(camera.targetX, camera.targetY, 8)) {
      for (let i = 0; i < 8; i += 1) {
        const testBack = camera.back - i * 48;
        const x = player.x - Math.cos(player.angle) * testBack;
        const y = player.y - Math.sin(player.angle) * testBack;
        if (canStandAt(x, y, 8)) {
          camera.targetX = x;
          camera.targetY = y;
          break;
        }
      }
    }

    const blend = 1 - Math.exp(-CAMERA_SMOOTHING * dt);
    camera.x += (camera.targetX - camera.x) * blend;
    camera.y += (camera.targetY - camera.y) * blend;
    camera.horizon += (camera.targetHorizon - camera.horizon) * blend;
  }

  function resolveCameraBackDistance(preferredBack) {
    const minBack = player.role === "hunter" ? 150 : 132;
    for (let distance = minBack; distance <= preferredBack; distance += 18) {
      const x = player.x - Math.cos(player.angle) * distance;
      const y = player.y - Math.sin(player.angle) * distance;
      if (!canStandAt(x, y, 10)) {
        return Math.max(minBack, distance - 36);
      }
    }
    return preferredBack;
  }

  function updateAI(dt, now) {
    const threat = player.role === "hunter" ? player : hunter;

    teammates.forEach((survivor) => {
      if (survivor.state === "downed" || survivor.escaped) {
        moveActorWithVelocity(survivor, 0, 0, dt, AI_ACCEL);
        return;
      }
      const threatDistance = distanceBetween(survivor, threat);
      if (survivor.action && threatDistance < AI_ABORT_OBJECTIVE_RANGE) stopAction(survivor);

      if (threatDistance < AI_FLEE_RANGE) {
        const target = findFleeTarget(survivor, threat);
        moveAIToPoint(survivor, target.x, target.y, survivor.type === "hunter" ? 286 : 250, dt);
        return;
      }

      const repair = findNearestRepairPoint(survivor, Infinity, true);
      if (!repair) {
        moveActorWithVelocity(survivor, 0, 0, dt, AI_ACCEL);
        return;
      }
      if (distanceBetween(survivor, repair) <= AI_INTERACT_RANGE) {
        if (!survivor.action) startRepair(survivor, repair);
        moveActorWithVelocity(survivor, 0, 0, dt, AI_ACCEL);
      } else {
        stopAction(survivor);
        moveAIToPoint(survivor, repair.x, repair.y, 250, dt);
      }
    });

    if (player.role !== "hunter") {
      updateAIHunter(dt, now);
    } else {
      moveActorWithVelocity(hunter, 0, 0, dt, AI_ACCEL);
    }
  }

  function updateAIHunter(dt, now) {
    if (now < hunter.stunnedUntil || now < hunter.wipeUntil) {
      moveActorWithVelocity(hunter, 0, 0, dt, AI_ACCEL);
      return;
    }
    const candidates = [player, ...teammates].filter((survivor) => survivor.state !== "downed" && !survivor.escaped);
    const target = candidates
      .map((survivor) => ({ survivor, score: distanceBetween(hunter, survivor) + (survivor.health || 2) * 120 }))
      .sort((a, b) => a.score - b.score)[0]?.survivor;
    if (!target) return;

    const dist = distanceBetween(hunter, target);
    const angleToTarget = Math.atan2(target.y - hunter.y, target.x - hunter.x);
    hunter.angle = turnToward(hunter.angle || 0, angleToTarget, Math.PI * 1.65 * dt);
    if (dist <= ATTACK_RANGE && now >= hunter.nextAttackAt) {
      performAttack(hunter, now, target);
      moveActorWithVelocity(hunter, 0, 0, dt, AI_ACCEL);
      return;
    }
    moveAIToPoint(hunter, target.x, target.y, 286, dt);
  }

  function updateActions(dt) {
    [player, ...teammates].forEach((actorItem) => {
      if (!actorItem.action) return;
      if (actorItem.action.kind === "repairing") {
        const pointItem = actorItem.action.target;
        if (distanceBetween(actorItem, pointItem) > INTERACT_RANGE || pointItem.completed) {
          stopAction(actorItem);
          return;
        }
        pointItem.progress = Math.min(1, pointItem.progress + (dt * 1000) / REPAIR_DURATION);
        if (pointItem.progress >= 1) {
          pointItem.completed = true;
          stopAction(actorItem);
        }
      }
      if (actorItem.action && actorItem.action.kind === "openingGate") {
        const gate = actorItem.action.target;
        if (distanceBetween(actorItem, gate) > INTERACT_RANGE || gate.opened || !areExitsPowered()) {
          stopAction(actorItem);
          return;
        }
        gate.progress = Math.min(1, gate.progress + (dt * 1000) / GATE_OPEN_DURATION);
        if (gate.progress >= 1) {
          gate.opened = true;
          stopAction(actorItem);
        }
      }
    });
  }

  function moveAIToPoint(actorItem, targetX, targetY, speed, dt) {
    const dx = targetX - actorItem.x;
    const dy = targetY - actorItem.y;
    const len = Math.hypot(dx, dy);
    if (len < 10) {
      moveActorWithVelocity(actorItem, 0, 0, dt, AI_ACCEL);
      return;
    }
    const avoid = getWallAvoidance(actorItem);
    const targetVx = (dx / len) * speed + avoid.x * speed * 0.52;
    const targetVy = (dy / len) * speed + avoid.y * speed * 0.52;
    moveActorWithVelocity(actorItem, targetVx, targetVy, dt, AI_ACCEL);
  }

  function getWallAvoidance(actorItem) {
    let ax = 0;
    let ay = 0;
    walls.forEach((item) => {
      const nearestX = clamp(actorItem.x, item.x, item.x + item.w);
      const nearestY = clamp(actorItem.y, item.y, item.y + item.h);
      const dx = actorItem.x - nearestX;
      const dy = actorItem.y - nearestY;
      const dist = Math.hypot(dx, dy);
      if (dist > 0 && dist < scaled(86)) {
        const force = (scaled(86) - dist) / scaled(86);
        ax += (dx / dist) * force;
        ay += (dy / dist) * force;
      }
    });
    return { x: ax, y: ay };
  }

  function findFleeTarget(actorItem, threat) {
    const props = windows.concat(pallets.filter((item) => item.label !== "broken"));
    const bestProp = props
      .map((item) => {
        const away = distanceBetween(item, threat);
        const self = distanceBetween(actorItem, item);
        return { item, score: away - self * 0.8 };
      })
      .sort((a, b) => b.score - a.score)[0]?.item;
    if (bestProp) return bestProp;

    const angle = Math.atan2(actorItem.y - threat.y, actorItem.x - threat.x);
    return {
      x: clamp(actorItem.x + Math.cos(angle) * scaled(340), scaled(80), world.width - scaled(80)),
      y: clamp(actorItem.y + Math.sin(angle) * scaled(340), scaled(80), world.height - scaled(80))
    };
  }

  function startRepair(actorItem, target) {
    if (actorItem.role === "hunter" || actorItem.type === "hunter" || target.completed) return;
    actorItem.action = { kind: "repairing", target };
    target.worker = actorItem;
  }

  function startOpenGate(actorItem, target) {
    if (!areExitsPowered() || target.opened) return;
    actorItem.action = { kind: "openingGate", target };
    target.worker = actorItem;
  }

  function stopAction(actorItem) {
    if (!actorItem || !actorItem.action) return;
    const target = actorItem.action.target;
    if (target && target.worker === actorItem) target.worker = null;
    actorItem.action = null;
  }

  function handleInteract() {
    const actorItem = player;
    if (actorItem.role === "hunter") return;
    if (actorItem.action) {
      stopAction(actorItem);
      return;
    }
    const gate = findNearestExitGate(actorItem, INTERACT_RANGE);
    if (gate && areExitsPowered()) {
      if (gate.opened) {
        actorItem.escaped = true;
        stopAction(actorItem);
      } else {
        startOpenGate(actorItem, gate);
      }
      return;
    }
    const repair = findNearestRepairPoint(actorItem, INTERACT_RANGE, true);
    if (repair) startRepair(actorItem, repair);
  }

  function handleUse() {
    const actorItem = player;
    const windowItem = findNearestProp(actorItem, windows, INTERACT_RANGE);
    if (windowItem) {
      vaultAcross(actorItem, windowItem);
      return;
    }
    const pallet = findNearestProp(actorItem, pallets.filter((item) => item.label !== "broken"), INTERACT_RANGE);
    if (!pallet) return;
    if (actorItem.role === "hunter") {
      if (pallet.label === "dropped") pallet.label = "broken";
      return;
    }
    if (pallet.label === "standing") {
      pallet.label = "dropped";
      if (distanceBetween(pallet, hunter) < scaled(96)) {
        hunter.stunnedUntil = performance.now() + 3000;
      }
    } else {
      vaultAcross(actorItem, pallet);
    }
  }

  function handleAttack() {
    if (player.role !== "hunter") return;
    performAttack(player, performance.now());
  }

  function performAttack(attacker, now, forcedTarget = null) {
    if (now < (attacker.nextAttackAt || 0) || now < (attacker.stunnedUntil || 0) || now < (attacker.wipeUntil || 0)) return;
    const targets = forcedTarget ? [forcedTarget] : [player, ...teammates].filter((item) => item !== attacker);
    const hitTarget = targets.find((target) => canAttackHit(attacker, target));
    if (hitTarget && hitTarget.type !== "hunter" && hitTarget.role !== "hunter") {
      damageSurvivor(hitTarget);
      attacker.wipeUntil = now + ATTACK_HIT_RECOVERY;
      attacker.nextAttackAt = attacker.wipeUntil;
    } else {
      attacker.wipeUntil = now + ATTACK_MISS_RECOVERY;
      attacker.nextAttackAt = attacker.wipeUntil;
    }
  }

  function canAttackHit(attacker, target) {
    if (!target || target.state === "downed" || target.escaped) return false;
    const dist = distanceBetween(attacker, target);
    if (dist > ATTACK_RANGE) return false;
    const angle = attacker.role === "hunter" ? player.angle : attacker.angle || 0;
    const diff = Math.abs(normalizeAngle(Math.atan2(target.y - attacker.y, target.x - attacker.x) - angle));
    return diff <= ATTACK_ARC / 2;
  }

  function damageSurvivor(survivor) {
    stopAction(survivor);
    survivor.health = Math.max(0, (survivor.health || 2) - 1);
    survivor.state = survivor.health <= 0 ? "downed" : "injured";
  }

  function vaultAcross(actorItem, propItem) {
    stopAction(actorItem);
    const horizontal = propItem.w >= propItem.h;
    const direction = horizontal
      ? Math.sign(actorItem.y - propItem.y) || 1
      : Math.sign(actorItem.x - propItem.x) || 1;
    const nextX = horizontal ? propItem.x : propItem.x + direction * VAULT_DISTANCE;
    const nextY = horizontal ? propItem.y + direction * VAULT_DISTANCE : propItem.y;
    moveToNearestFree(actorItem, nextX, nextY);
  }

  function moveToNearestFree(actorItem, x, y) {
    const candidates = [{ x, y }];
    for (let radius = scaled(28); radius <= scaled(132); radius += scaled(22)) {
      for (let i = 0; i < 12; i += 1) {
        const angle = (Math.PI * 2 * i) / 12;
        candidates.push({
          x: x + Math.cos(angle) * radius,
          y: y + Math.sin(angle) * radius
        });
      }
    }
    const target = candidates.find((item) => canStandAt(item.x, item.y, actorItem.radius));
    if (target) {
      actorItem.x = target.x;
      actorItem.y = target.y;
      actorItem.vx = 0;
      actorItem.vy = 0;
    }
  }

  function areExitsPowered() {
    return repairPoints.filter((item) => item.completed).length >= REPAIR_REQUIRED;
  }

  function findNearestRepairPoint(actorItem, range, unfinishedOnly = false) {
    return findNearest(actorItem, repairPoints.filter((item) => !unfinishedOnly || !item.completed), range, scaled(52));
  }

  function findNearestExitGate(actorItem, range) {
    return findNearest(actorItem, exitGates, range, scaled(64));
  }

  function findNearestProp(actorItem, props, range) {
    return findNearest(actorItem, props, range, scaled(58));
  }

  function findNearest(actorItem, items, range, bonus = 0) {
    let best = null;
    let bestDist = range + bonus;
    items.forEach((item) => {
      const dist = getInteractDistance(actorItem, item);
      if (dist < bestDist) {
        best = item;
        bestDist = dist;
      }
    });
    return best;
  }

  function getInteractDistance(actorItem, item) {
    if (Number.isFinite(item.w) && Number.isFinite(item.h)) {
      const rect = {
        x: item.x - item.w / 2,
        y: item.y - item.h / 2,
        w: item.w,
        h: item.h
      };
      const nearestX = clamp(actorItem.x, rect.x, rect.x + rect.w);
      const nearestY = clamp(actorItem.y, rect.y, rect.y + rect.h);
      return Math.hypot(actorItem.x - nearestX, actorItem.y - nearestY);
    }
    return distanceBetween(actorItem, item);
  }

  function distanceBetween(a, b) {
    return Math.hypot(a.x - b.x, a.y - b.y);
  }

  function turnToward(angle, target, maxStep) {
    const diff = normalizeAngle(target - angle);
    return normalizeAngle(angle + clamp(diff, -maxStep, maxStep));
  }

  function updateHud() {
    if (repairReadout) {
      repairReadout.textContent = `${repairPoints.filter((item) => item.completed).length}/${REPAIR_REQUIRED}`;
    }
    const prompt = getActionPrompt();
    if (actionReadout) actionReadout.textContent = prompt || "-";
    if (actionPrompt) {
      actionPrompt.textContent = prompt || "";
      actionPrompt.classList.toggle("is-hidden", !prompt);
    }
    if (actionUseButton) actionUseButton.classList.toggle("is-active", prompt.includes("Space"));
    if (actionInteractButton) actionInteractButton.classList.toggle("is-active", prompt.includes("E"));
    if (actionAttackButton) actionAttackButton.classList.toggle("is-active", player.role === "hunter");
  }

  function getActionPrompt() {
    if (player.action && player.action.kind === "repairing") {
      return `E 停止 · 修理 ${Math.round(player.action.target.progress * 100)}%`;
    }
    if (player.action && player.action.kind === "openingGate") {
      return `E 停止 · 开门 ${Math.round(player.action.target.progress * 100)}%`;
    }
    if (player.role === "hunter") {
      const pallet = findNearestProp(player, pallets.filter((item) => item.label === "dropped"), INTERACT_RANGE);
      if (pallet) return "Space 踩板";
      const windowItem = findNearestProp(player, windows, INTERACT_RANGE);
      if (windowItem) return "Space 翻窗";
      return "J 攻击";
    }
    const gate = findNearestExitGate(player, INTERACT_RANGE);
    if (gate && areExitsPowered()) return gate.opened ? "E 逃出" : "E 开门";
    const repair = findNearestRepairPoint(player, INTERACT_RANGE, true);
    if (repair) return "E 修理";
    const pallet = findNearestProp(player, pallets.filter((item) => item.label !== "broken"), INTERACT_RANGE);
    if (pallet) return pallet.label === "standing" ? "Space 下板" : "Space 翻板";
    const windowItem = findNearestProp(player, windows, INTERACT_RANGE);
    if (windowItem) return "Space 翻窗";
    return "";
  }

  function project(x, y, z) {
    const dx = x - camera.x;
    const dy = y - camera.y;
    const side = -Math.sin(player.angle) * dx + Math.cos(player.angle) * dy;
    const depth = Math.cos(player.angle) * dx + Math.sin(player.angle) * dy;
    if (depth < 24) return null;
    return {
      x: width / 2 + side / depth * camera.focal,
      y: camera.horizon - (z - camera.height) / depth * camera.focal,
      depth
    };
  }

  function rectCorners(item) {
    return [
      { x: item.x, y: item.y },
      { x: item.x + item.w, y: item.y },
      { x: item.x + item.w, y: item.y + item.h },
      { x: item.x, y: item.y + item.h }
    ];
  }

  function avgDepthOfRect(item) {
    const corners = rectCorners(item);
    let total = 0;
    let count = 0;
    corners.forEach((corner) => {
      const p = project(corner.x, corner.y, 0);
      if (p) {
        total += p.depth;
        count += 1;
      }
    });
    return count ? total / count : -Infinity;
  }

  function avgDepthOfPoint(item) {
    const p = project(item.x, item.y, 0);
    return p ? p.depth : -Infinity;
  }

  function polygon(points, fill, stroke) {
    const visible = points.every(Boolean);
    if (!visible) return;
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i += 1) ctx.lineTo(points[i].x, points[i].y);
    ctx.closePath();
    ctx.fillStyle = fill;
    ctx.fill();
    if (stroke) {
      ctx.strokeStyle = stroke;
      ctx.lineWidth = 1.4;
      ctx.stroke();
    }
  }

  function addFace(drawables, points, fill, stroke, depthBias = 0) {
    if (!points.every(Boolean)) return;
    const depth = points.reduce((total, point) => total + point.depth, 0) / points.length + depthBias;
    drawables.push({
      depth,
      draw: () => polygon(points, fill, stroke)
    });
  }

  function addPrismFaces(drawables, item, blockHeight, sideFill, topFill, stroke) {
    const corners = rectCorners(item);
    const bottom = corners.map((corner) => project(corner.x, corner.y, 0));
    const top = corners.map((corner) => project(corner.x, corner.y, blockHeight));

    for (let i = 0; i < 4; i += 1) {
      const next = (i + 1) % 4;
      addFace(drawables, [bottom[i], bottom[next], top[next], top[i]], sideFill, stroke);
    }
    addFace(drawables, top, topFill, stroke, 0.25);
  }

  function drawPrism(item, blockHeight, sideFill, topFill, stroke) {
    const corners = rectCorners(item);
    const bottom = corners.map((corner) => project(corner.x, corner.y, 0));
    const top = corners.map((corner) => project(corner.x, corner.y, blockHeight));
    polygon(top, topFill, stroke);
    for (let i = 0; i < 4; i += 1) {
      const next = (i + 1) % 4;
      polygon([bottom[i], bottom[next], top[next], top[i]], sideFill, stroke);
    }
  }

  function drawGround() {
    const sky = ctx.createLinearGradient(0, 0, 0, height);
    sky.addColorStop(0, "#08120d");
    sky.addColorStop(0.48, "#132018");
    sky.addColorStop(1, "#202b23");
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, width, height);

    const wallInset = scaled(54);
    const floor = [
      project(wallInset, wallInset, 0),
      project(world.width - wallInset, wallInset, 0),
      project(world.width - wallInset, world.height - wallInset, 0),
      project(wallInset, world.height - wallInset, 0)
    ];
    polygon(floor, "#202b23", "rgba(238, 243, 237, 0.08)");

    ctx.strokeStyle = "rgba(238, 243, 237, 0.055)";
    ctx.lineWidth = 1;
    for (let x = 0; x <= world.width; x += world.tile) {
      line3d(x, 0, x, world.height);
    }
    for (let y = 0; y <= world.height; y += world.tile) {
      line3d(0, y, world.width, y);
    }
  }

  function line3d(x1, y1, x2, y2) {
    const a = project(x1, y1, 1);
    const b = project(x2, y2, 1);
    if (!a || !b) return;
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();
  }

  function drawPallet(item) {
    if (item.label === "broken") return;
    drawPrism(getPalletBase(item), item.label === "standing" ? 112 : 46, "#7a4c39", "#c57f58", "rgba(23, 13, 9, 0.45)");
  }

  function getPalletBase(item) {
    if (item.label === "dropped") {
      return {
        x: item.x - item.w / 2,
        y: item.y - scaled(9),
        w: item.w,
        h: scaled(18)
      };
    }
    return {
      x: item.x - item.w / 2 - scaled(13),
      y: item.y - scaled(23),
      w: scaled(10),
      h: scaled(46)
    };
  }

  function drawWindow(item) {
    const base = { x: item.x - item.w / 2, y: item.y - item.h / 2, w: item.w, h: item.h };
    drawPrism(base, 74, "rgba(91, 121, 103, 0.55)", "rgba(198, 226, 208, 0.62)", "rgba(226, 242, 231, 0.38)");
  }

  function drawRepairPoint(item) {
    drawPrism({ x: item.x - scaled(18), y: item.y - scaled(18), w: scaled(36), h: scaled(36) }, 58, "#7f6b35", "#e0bf67", "rgba(255, 239, 188, 0.38)");
  }

  function drawChair(item) {
    drawPrism({ x: item.x - scaled(17), y: item.y - scaled(22), w: scaled(34), h: scaled(44) }, 78, "#5e4c2f", "#dfbf67", "rgba(255, 239, 188, 0.35)");
  }

  function drawExitGate(item) {
    drawPrism({ x: item.x - scaled(28), y: item.y - scaled(24), w: scaled(56), h: scaled(48) }, 116, "#7c3d35", "#d77b6e", "rgba(255, 225, 220, 0.35)");
  }

  function drawHatch(item) {
    drawPrism({ x: item.x - scaled(30), y: item.y - scaled(20), w: scaled(60), h: scaled(40) }, 18, "#1b1f19", "#5d745f", "rgba(223, 191, 103, 0.45)");
  }

  function drawActor(item, isPlayer) {
    if (item.escaped) return;
    const ground = project(item.x, item.y, 0);
    const standingHeight = item.type === "hunter" || item.role === "hunter" ? 142 : 108;
    const actorHeight = item.state === "downed" ? 34 : standingHeight;
    const top = project(item.x, item.y, actorHeight);
    if (!ground || !top) return;
    const heightOnScreen = Math.abs(ground.y - top.y);
    const widthOnScreen = clamp(heightOnScreen * (item.type === "hunter" ? 0.46 : 0.42), 12, 72);
    const x = ground.x - widthOnScreen / 2;
    const y = top.y;

    ctx.fillStyle = "rgba(0, 0, 0, 0.32)";
    ctx.beginPath();
    ctx.ellipse(ground.x, ground.y, widthOnScreen * 0.72, Math.max(4, heightOnScreen * 0.08), 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = item.color;
    ctx.beginPath();
    ctx.roundRect(x, y, widthOnScreen, heightOnScreen, 8);
    ctx.fill();
    ctx.strokeStyle = isPlayer ? "#fff0bc" : "rgba(10, 14, 11, 0.8)";
    ctx.lineWidth = isPlayer ? 3 : 2;
    ctx.stroke();

    const face = project(item.x + Math.cos(player.angle) * 10, item.y + Math.sin(player.angle) * 10, item.type === "hunter" ? 104 : 82);
    if (face) {
      ctx.fillStyle = "#101611";
      ctx.beginPath();
      ctx.arc(face.x, face.y, Math.max(2, widthOnScreen * 0.09), 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function drawScene() {
    ctx.clearRect(0, 0, width, height);
    drawGround();

    const drawables = [];
    walls.forEach((item) => {
      addPrismFaces(
        drawables,
        item,
        item.level === "high" ? 238 : 92,
        item.level === "high" ? "#15221a" : "#485747",
        item.level === "high" ? "#2c3b30" : "#6a7b66",
        "rgba(222, 238, 226, 0.12)"
      );
    });
    pallets.forEach((item) => {
      if (item.label === "broken") return;
      addPrismFaces(drawables, getPalletBase(item), item.label === "standing" ? 112 : 46, "#7a4c39", "#c57f58", "rgba(23, 13, 9, 0.45)");
    });
    windows.forEach((item) => addPrismFaces(drawables, { x: item.x - item.w / 2, y: item.y - item.h / 2, w: item.w, h: item.h }, 74, "rgba(91, 121, 103, 0.88)", "rgba(198, 226, 208, 0.86)", "rgba(226, 242, 231, 0.38)"));
    repairPoints.forEach((item) => addPrismFaces(drawables, { x: item.x - scaled(18), y: item.y - scaled(18), w: scaled(36), h: scaled(36) }, 58, "#7f6b35", "#e0bf67", "rgba(255, 239, 188, 0.38)"));
    chairs.forEach((item) => addPrismFaces(drawables, { x: item.x - scaled(17), y: item.y - scaled(22), w: scaled(34), h: scaled(44) }, 78, "#5e4c2f", "#dfbf67", "rgba(255, 239, 188, 0.35)"));
    exitGates.forEach((item) => addPrismFaces(drawables, { x: item.x - scaled(28), y: item.y - scaled(24), w: scaled(56), h: scaled(48) }, 116, "#7c3d35", "#d77b6e", "rgba(255, 225, 220, 0.35)"));
    addPrismFaces(drawables, { x: hatch.x - scaled(30), y: hatch.y - scaled(20), w: scaled(60), h: scaled(40) }, 18, "#1b1f19", "#5d745f", "rgba(223, 191, 103, 0.45)");
    teammates.forEach((item) => drawables.push({ depth: avgDepthOfPoint(item), draw: () => drawActor(item, false) }));
    if (player.role !== "hunter") drawables.push({ depth: avgDepthOfPoint(hunter), draw: () => drawActor(hunter, false) });

    drawables
      .filter((item) => item.depth > 0)
      .sort((a, b) => b.depth - a.depth)
      .forEach((item) => item.draw());

    drawActor({
      type: player.role,
      x: player.x,
      y: player.y,
      color: player.role === "hunter" ? "#d77b6e" : "#dfbf67"
    }, true);
    drawMiniMap();
  }

  function drawMiniMap() {
    const scale = Math.min(miniCanvas.width / world.width, miniCanvas.height / world.height);
    mini.clearRect(0, 0, miniCanvas.width, miniCanvas.height);
    mini.fillStyle = "rgba(9, 20, 14, 0.88)";
    mini.fillRect(0, 0, miniCanvas.width, miniCanvas.height);
    mini.fillStyle = "#15221a";
    walls.forEach((item) => mini.fillRect(item.x * scale, item.y * scale, item.w * scale, item.h * scale));
    mini.fillStyle = "#c57f58";
    pallets.forEach((item) => {
      if (item.label === "broken") return;
      const base = getPalletBase(item);
      mini.fillRect(base.x * scale, base.y * scale, base.w * scale, base.h * scale);
    });
    mini.fillStyle = "#c6e2d0";
    windows.forEach((item) => mini.fillRect((item.x - item.w / 2) * scale, (item.y - item.h / 2) * scale, item.w * scale, item.h * scale));
    mini.fillStyle = "#dfbf67";
    repairPoints.forEach((item) => dot(mini, item.x * scale, item.y * scale, 2.5));
    chairs.forEach((item) => dot(mini, item.x * scale, item.y * scale, 2.1));
    mini.fillStyle = "#d77b6e";
    exitGates.forEach((item) => mini.fillRect((item.x - scaled(11)) * scale, (item.y - scaled(11)) * scale, scaled(22) * scale, scaled(22) * scale));
    mini.fillStyle = hunter.color;
    dot(mini, hunter.x * scale, hunter.y * scale, 3.8);
    teammates.forEach((item) => {
      mini.fillStyle = item.color;
      dot(mini, item.x * scale, item.y * scale, 3.2);
    });
    mini.fillStyle = player.role === "hunter" ? "#d77b6e" : "#dfbf67";
    const px = player.x * scale;
    const py = player.y * scale;
    dot(mini, px, py, 4.5);
    mini.strokeStyle = "rgba(255, 240, 188, 0.72)";
    mini.lineWidth = 2;
    mini.beginPath();
    mini.moveTo(px, py);
    mini.lineTo(px + Math.cos(player.angle) * 28, py + Math.sin(player.angle) * 28);
    mini.stroke();
  }

  function dot(context, x, y, r) {
    context.beginPath();
    context.arc(x, y, r, 0, Math.PI * 2);
    context.fill();
  }

  function frame(now) {
    const dt = Math.min(0.033, (now - lastTime) / 1000);
    lastTime = now;
    update(dt);
    drawScene();
    if (running) requestAnimationFrame(frame);
  }

  function setRole(role) {
    player.role = role;
    roleReadout.textContent = role === "hunter" ? "追捕者" : "逃生者";
    player.radius = role === "hunter" ? 25 : 22;
    roleButtons.forEach((button) => {
      button.classList.toggle("is-active", button.dataset.role === role);
    });
  }

  function start3d() {
    overlay.classList.add("is-hidden");
    running = true;
    lastTime = performance.now();
    requestAnimationFrame(frame);
  }

  window.addEventListener("resize", () => {
    resize();
    updateCamera();
    drawScene();
  });
  window.addEventListener("keydown", (event) => {
    keys.add(event.code);
    if (!event.repeat) {
      if (event.code === "KeyE") handleInteract();
      if (event.code === "Space") handleUse();
      if (event.code === "KeyJ") handleAttack();
    }
    if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "KeyW", "KeyA", "KeyS", "KeyD", "KeyE", "Space", "KeyJ"].includes(event.code)) {
      event.preventDefault();
    }
  });
  window.addEventListener("keyup", (event) => keys.delete(event.code));

  roleButtons.forEach((button) => {
    button.addEventListener("click", () => setRole(button.dataset.role));
  });
  start3dButton.addEventListener("click", start3d);
  changeModeButton.addEventListener("click", () => {
    running = false;
    overlay.classList.remove("is-hidden");
  });
  if (actionUseButton) actionUseButton.addEventListener("pointerdown", (event) => {
    event.preventDefault();
    event.stopPropagation();
    handleUse();
  });
  if (actionInteractButton) actionInteractButton.addEventListener("pointerdown", (event) => {
    event.preventDefault();
    event.stopPropagation();
    handleInteract();
  });
  if (actionAttackButton) actionAttackButton.addEventListener("pointerdown", (event) => {
    event.preventDefault();
    event.stopPropagation();
    handleAttack();
  });

  let movePointerId = null;
  movePad.addEventListener("pointerdown", (event) => {
    movePointerId = event.pointerId;
    movePad.setPointerCapture(movePointerId);
    updateMoveStick(event);
  });
  movePad.addEventListener("pointermove", (event) => {
    if (event.pointerId === movePointerId) updateMoveStick(event);
  });
  movePad.addEventListener("pointerup", clearMoveStick);
  movePad.addEventListener("pointercancel", clearMoveStick);

  function updateMoveStick(event) {
    const rect = movePad.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const max = rect.width * 0.34;
    const rawX = clamp(event.clientX - cx, -max, max);
    const rawY = clamp(event.clientY - cy, -max, max);
    const len = Math.min(1, Math.hypot(rawX, rawY) / max);
    const angle = Math.atan2(rawY, rawX);
    player.moveX = Math.cos(angle) * len;
    player.moveY = -Math.sin(angle) * len;
    moveKnob.style.transform = `translate(calc(-50% + ${Math.cos(angle) * len * max}px), calc(-50% + ${Math.sin(angle) * len * max}px))`;
  }

  function clearMoveStick(event) {
    if (event.pointerId !== movePointerId) return;
    movePointerId = null;
    player.moveX = 0;
    player.moveY = 0;
    moveKnob.style.transform = "translate(-50%, -50%)";
  }

  let lookPointerId = null;
  let lookLastX = 0;
  let lookLastY = 0;
  lookPad.addEventListener("pointerdown", (event) => {
    lookPointerId = event.pointerId;
    lookLastX = event.clientX;
    lookLastY = event.clientY;
    lookPad.setPointerCapture(lookPointerId);
  });
  lookPad.addEventListener("pointermove", (event) => {
    if (event.pointerId !== lookPointerId) return;
    const dx = event.clientX - lookLastX;
    const dy = event.clientY - lookLastY;
    lookLastX = event.clientX;
    lookLastY = event.clientY;
    player.angle = normalizeAngle(player.angle + dx * 0.0034);
    player.pitch = clamp(player.pitch + dy * 0.0021, -0.42, 0.28);
  });
  lookPad.addEventListener("pointerup", () => {
    lookPointerId = null;
  });
  lookPad.addEventListener("pointercancel", () => {
    lookPointerId = null;
  });

  resize();
  setRole("survivor");
  updateCamera();
  drawScene();
})();
