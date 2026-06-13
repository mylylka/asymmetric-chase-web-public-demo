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

  const world = {
    width: 2200,
    height: 1560,
    tile: 80
  };

  const player = {
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
    boostUntil: 0,
    action: null
  };

  const hunter = {
    x: 960,
    y: 360,
    radius: 25,
    speed: 292,
    turnSpeed: Math.PI * 1.8,
    attackRange: 86,
    attackArc: Math.PI / 2,
    attackCooldown: 0.65,
    attackWindup: 0.16,
    lastAttackAt: -10000,
    wipeUntil: 0,
    stunnedUntil: 0,
    action: null,
    angle: Math.PI,
    status: "chasing"
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

  const landmarks = [
    { x: 585, y: 360, label: "R" },
    { x: 1130, y: 375, label: "R" },
    { x: 1800, y: 330, label: "R" },
    { x: 1040, y: 850, label: "R" },
    { x: 440, y: 1270, label: "R" },
    { x: 1540, y: 1270, label: "R" },
    { x: 1980, y: 1160, label: "R" },
    { x: 190, y: 720, label: "E" },
    { x: 2030, y: 760, label: "E" }
  ];

  let width = 0;
  let height = 0;
  let dpr = 1;
  let lastTime = performance.now();
  let chasePulseUntil = 0;

  function rect(x, y, w, h) {
    return { x, y, w, h };
  }

  function prop(x, y, w, h, angle, label) {
    return { x, y, w, h, angle, label };
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
    if (value && code === "r") resetMatch();
    if (value && key === " ") handlePlayerInteraction(performance.now());
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
      .map((pallet) => rect(pallet.x - pallet.w / 2, pallet.y - 10, pallet.w, 20));
    return walls.concat(droppedPallets);
  }

  function movePlayer(dt) {
    if (updateActorAction(player, performance.now())) return;

    if (player.state === "downed") {
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

  function moveActor(actor, dx, dy) {
    if (!collides(actor.x + dx, actor.y, actor.radius)) {
      actor.x += dx;
    }

    if (!collides(actor.x, actor.y + dy, actor.radius)) {
      actor.y += dy;
    }
  }

  function updateHunter(dt, now) {
    if (updateActorAction(hunter, now)) return;

    if (now < hunter.stunnedUntil) {
      hunter.status = "stunned";
      return;
    }

    if (now < hunter.wipeUntil) {
      hunter.status = "wipe";
      return;
    }

    const toPlayerX = player.x - hunter.x;
    const toPlayerY = player.y - hunter.y;
    const distance = Math.hypot(toPlayerX, toPlayerY);
    const canAttack = now - hunter.lastAttackAt >= hunter.attackCooldown * 1000;

    if (distance > 1) {
      hunter.angle = turnToward(
        hunter.angle,
        Math.atan2(toPlayerY, toPlayerX),
        hunter.turnSpeed * dt
      );
    }

    if (player.state === "downed") {
      hunter.status = "downed";
      return;
    }

    if (isPlayerInHunterAttackCone() && canAttack) {
      hunter.lastAttackAt = now;
      hunter.status = "attacking";
      applyHunterHit();
      hunter.wipeUntil = now + 3000;
      chasePulseUntil = now + 280;
      return;
    }

    if (now - hunter.lastAttackAt < hunter.attackCooldown * 1000) {
      hunter.status = "cooldown";
    } else {
      hunter.status = "chasing";
    }

    if (distance > hunter.attackRange * 0.72) {
      const dx = (toPlayerX / Math.max(distance, 1)) * hunter.speed * dt;
      const dy = (toPlayerY / Math.max(distance, 1)) * hunter.speed * dt;
      moveHunterToward(dx, dy, dt, now);
    }
  }

  function moveHunterToward(dx, dy, dt, now) {
    const nearDroppedPallet = findNearestPallet(hunter, "dropped", 88);
    if (nearDroppedPallet) {
      startBreakPallet(nearDroppedPallet, now);
      return;
    }

    const beforeX = hunter.x;
    const beforeY = hunter.y;
    moveActor(hunter, dx, dy);

    const moved = Math.hypot(hunter.x - beforeX, hunter.y - beforeY);
    if (moved > 0.4) return;

    const nearWindow = findNearestWindow(hunter, 92);
    if (nearWindow) {
      startVault(hunter, nearWindow, 1050, now, "vaulting");
      return;
    }

    const sideStep = Math.sign((player.x - hunter.x) * dy - (player.y - hunter.y) * dx) || 1;
    moveActor(hunter, -dy * 0.7 * sideStep, dx * 0.7 * sideStep);
    if (dt > 0) hunter.status = "chasing";
  }

  function applyHunterHit() {
    if (player.state === "healthy") {
      player.state = "injured";
      player.boostUntil = performance.now() + 1800;
      return;
    }

    if (player.state === "injured") {
      player.state = "downed";
    }
  }

  function resetMatch() {
    player.x = 340;
    player.y = 330;
    player.vx = 0;
    player.vy = 0;
    player.stamina = 100;
    player.angle = 0;
    player.state = "healthy";
    player.boostUntil = 0;
    player.action = null;

    hunter.x = 960;
    hunter.y = 360;
    hunter.angle = Math.PI;
    hunter.lastAttackAt = -10000;
    hunter.wipeUntil = 0;
    hunter.stunnedUntil = 0;
    hunter.action = null;
    hunter.status = "chasing";

    pallets.forEach((pallet) => {
      pallet.label = "standing";
    });
  }

  function handlePlayerInteraction(now) {
    if (player.state === "downed" || player.action) return;

    const standingPallet = findNearestPallet(player, "standing", 82);
    if (standingPallet) {
      dropPallet(standingPallet, now);
      return;
    }

    const droppedPallet = findNearestPallet(player, "dropped", 74);
    if (droppedPallet) {
      startVault(player, droppedPallet, 260, now, "vaulting");
      return;
    }

    const nearWindow = findNearestWindow(player, 76);
    if (nearWindow) {
      startVault(player, nearWindow, 320, now, "vaulting");
    }
  }

  function isPlayerInHunterAttackCone() {
    const dx = player.x - hunter.x;
    const dy = player.y - hunter.y;
    const distance = Math.hypot(dx, dy);
    if (distance > hunter.attackRange + player.radius * 0.5) return false;
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
    const travel = obstacle.label === "window" ? 86 : 76;

    actor.action = {
      kind,
      start: now,
      until: now + duration,
      fromX: actor.x,
      fromY: actor.y,
      toX: obstacle.x - normal.x * side * travel,
      toY: obstacle.y - normal.y * side * travel
    };
  }

  function updateActorAction(actor, now) {
    if (!actor.action) return false;

    const action = actor.action;
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
      const distance = distanceBetween(actor, pallet);
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
      const distance = distanceBetween(actor, item);
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

  function getObstacleNormal(item) {
    if (Math.abs(item.angle - Math.PI / 2) < 0.1) return { x: 1, y: 0 };
    if (item.w > item.h) return { x: 0, y: 1 };
    return { x: 1, y: 0 };
  }

  function updateCamera(dt) {
    const targetX = player.x - width / 2 / camera.zoom;
    const targetY = player.y - height / 2 / camera.zoom;
    const maxX = world.width - width / camera.zoom;
    const maxY = world.height - height / camera.zoom;
    const clampedX = Math.max(0, Math.min(targetX, Math.max(0, maxX)));
    const clampedY = Math.max(0, Math.min(targetY, Math.max(0, maxY)));
    const smoothing = 1 - Math.pow(0.001, dt);
    camera.x += (clampedX - camera.x) * smoothing;
    camera.y += (clampedY - camera.y) * smoothing;
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);
    ctx.save();
    ctx.scale(camera.zoom, camera.zoom);
    ctx.translate(-camera.x, -camera.y);

    drawGround();
    drawLandmarks();
    drawRects(walls, "#141b16", "#293529");
    drawWindows();
    drawPallets();
    drawHunter();
    drawPlayer();
    drawVignette();

    ctx.restore();
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

  function drawLandmarks() {
    landmarks.forEach((item) => {
      const isExit = item.label === "E";
      ctx.save();
      ctx.translate(item.x, item.y);
      ctx.fillStyle = isExit ? "rgba(185, 95, 82, 0.22)" : "rgba(217, 183, 106, 0.18)";
      ctx.strokeStyle = isExit ? "#b95f52" : "#d9b76a";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, 0, isExit ? 24 : 20, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = isExit ? "#f2cbc5" : "#fff0bc";
      ctx.font = "700 14px ui-sans-serif, system-ui";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(item.label, 0, 1);
      ctx.restore();
    });
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

    if (player.state !== "healthy") {
      ctx.save();
      ctx.translate(player.x, player.y - 38);
      ctx.fillStyle = player.state === "injured" ? "#d9b76a" : "#b95f52";
      ctx.beginPath();
      ctx.roundRect(-28, -9, 56, 18, 6);
      ctx.fill();
      ctx.fillStyle = "#101611";
      ctx.font = "700 12px ui-sans-serif, system-ui";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(player.state === "injured" ? "受伤" : "倒地", 0, 1);
      ctx.restore();
    }

    drawPlayerInteractionHint();
  }

  function drawPlayerInteractionHint() {
    if (player.state === "downed" || player.action) return;

    const standingPallet = findNearestPallet(player, "standing", 82);
    const droppedPallet = findNearestPallet(player, "dropped", 74);
    const nearWindow = findNearestWindow(player, 76);
    let label = "";
    if (standingPallet) label = "Space 下板";
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

    if (hunter.status === "stunned" || hunter.status === "wipe" || hunter.status === "breaking") {
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
    const gradient = ctx.createRadialGradient(
      player.x,
      player.y,
      120,
      player.x,
      player.y,
      560
    );
    gradient.addColorStop(0, "rgba(0, 0, 0, 0)");
    gradient.addColorStop(1, "rgba(0, 0, 0, 0.28)");
    ctx.fillStyle = gradient;
    ctx.fillRect(camera.x, camera.y, width / camera.zoom, height / camera.zoom);
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
    miniCtx.fillStyle = "#d9b76a";
    landmarks.forEach((item) => miniCtx.fillRect(item.x - 12, item.y - 12, 24, 24));
    miniCtx.fillStyle = "#b95f52";
    miniCtx.beginPath();
    miniCtx.arc(hunter.x, hunter.y, 38, 0, Math.PI * 2);
    miniCtx.fill();
    miniCtx.fillStyle = "#eef3ed";
    miniCtx.beginPath();
    miniCtx.arc(player.x, player.y, 34, 0, Math.PI * 2);
    miniCtx.fill();
    miniCtx.restore();
  }

  function updateReadouts() {
    speedReadout.textContent = getSurvivorReadout();
    staminaReadout.textContent = `${Math.round(player.stamina)}%`;
    collisionReadout.textContent = getHunterStatusLabel(hunter.status);
  }

  function getSurvivorReadout() {
    if (performance.now() < player.boostUntil) return "加速";
    return getStateLabel(player.state);
  }

  function getStateLabel(state) {
    if (state === "healthy") return "健康";
    if (state === "injured") return "受伤";
    return "倒地";
  }

  function getHunterStatusLabel(status) {
    if (status === "attacking") return "攻击";
    if (status === "cooldown") return "冷却";
    if (status === "downed") return "倒地";
    if (status === "wipe") return "擦刀";
    if (status === "stunned") return "眩晕";
    if (status === "breaking") return "踩板";
    if (status === "vaulting") return "翻越";
    return "追击";
  }

  function frame(now) {
    const dt = Math.min(0.033, (now - lastTime) / 1000);
    lastTime = now;
    movePlayer(dt);
    updateHunter(dt, now);
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

  window.addEventListener("resize", resize);
  window.addEventListener("keydown", (event) => {
    if ([" ", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.key)) {
      event.preventDefault();
    }
    keyToInput(event.key, true);
  });
  window.addEventListener("keyup", (event) => keyToInput(event.key, false));

  resize();
  bindTouchStick();
  requestAnimationFrame(frame);
})();
