import { useRef, useEffect, useCallback } from "react";
import DemoSection from "../DemoSection";

/* ─── Tuning constants ─── */

const GRAVITY = 1800;
const JUMP_VELOCITY = -700;
const GROUND_Y_RATIO = 0.82;
const PLAYER_W = 20;
const PLAYER_H = 32;
const PLAYER_H_DUCK = 18;
const PLAYER_X_RATIO = 0.14;
const OBSTACLE_SPEED_BASE = 320;
const OBSTACLE_SPEED_ACCEL = 0.4; // px/s per second of play
const OBSTACLE_MIN_GAP_PX = 200;
const STAR_COUNT = 80;
const BUILDING_COUNT = 14;
const BUILDING_SCROLL_SPEED = 30; // px/s
const ANIM_STRIDE_S = 0.12; // seconds per leg-swap frame
const DRONE_TOP_OFFSET = 30; // px above groundY for flying obstacles
const HIGHSCORE_KEY = "runner404-hi";

/* ─── Palette (matches portfolio) ─── */

const COL_BG = "#020617"; // slate-950
const COL_BG_UPPER = "#0f172a"; // slate-900
const COL_CYAN = "#22d3ee"; // cyan-400
const COL_CYAN_DIM = "#06b6d4"; // cyan-500
const COL_TEXT = "#f1f5f9"; // slate-100
const COL_TEXT_DIM = "#94a3b8"; // slate-400
const COL_BUILDING = "#1e293b"; // slate-800
const COL_BUILDING_DARK = "#0f172a"; // slate-900

/* ─── Types ─── */

interface Star {
  x: number;
  y: number;
  size: number;
  phase: number;
}

interface BuildingWin {
  rx: number;
  ry: number;
}

interface Building {
  x: number;
  w: number;
  h: number;
  dark: boolean;
  windows: BuildingWin[];
}

type ObstacleKind = "dumbbell" | "bug" | "block404" | "drone";

interface Obstacle {
  x: number;
  kind: ObstacleKind;
  w: number;
  h: number;
  flying: boolean;
}

interface GameState {
  phase: "idle" | "running" | "dead";
  score: number;
  elapsed: number;
  playerY: number;
  playerVY: number;
  grounded: boolean;
  ducking: boolean;
  animTimer: number;
  animFrame: number;
  obstacles: Obstacle[];
  spawnTimer: number;
  groundOffset: number;
  stars: Star[];
  buildings: Building[];
  buildingOffset: number;
  highScore: number;
  newHighScore: boolean;
}

/* ─── Helpers ─── */

function loadHighScore(): number {
  try {
    return Number(localStorage.getItem(HIGHSCORE_KEY)) || 0;
  } catch {
    return 0;
  }
}

function saveHighScore(score: number): void {
  try {
    localStorage.setItem(HIGHSCORE_KEY, String(Math.floor(score)));
  } catch {
    /* noop — localStorage may be unavailable */
  }
}

function createStars(canvasW: number, canvasH: number): Star[] {
  const stars: Star[] = [];
  for (let i = 0; i < STAR_COUNT; i++) {
    stars.push({
      x: Math.random() * canvasW,
      y: Math.random() * canvasH * 0.65,
      size: Math.random() * 2 + 0.3,
      phase: Math.random() * Math.PI * 2,
    });
  }
  return stars;
}

function createBuildings(_canvasW: number, groundY: number): Building[] {
  const buildings: Building[] = [];
  let x = 0;
  for (let i = 0; i < BUILDING_COUNT; i++) {
    const w = 30 + Math.random() * 60;
    const h = 30 + Math.random() * (groundY * 0.35);

    // Generate lit-window grid
    const windows: BuildingWin[] = [];
    const winGap = 8;
    for (let wy = 6; wy < h - 6; wy += winGap) {
      for (let wx = 4; wx < w - 4; wx += winGap) {
        if (Math.random() > 0.35) {
          windows.push({ rx: wx, ry: wy });
        }
      }
    }

    buildings.push({ x, w, h, dark: Math.random() < 0.4, windows });
    x += w + Math.random() * 20;
  }
  return buildings;
}

function spawnObstacle(canvasW: number, elapsed: number): Obstacle {
  // Drones start appearing after 12 seconds of play
  const kinds: ObstacleKind[] =
    elapsed > 12
      ? ["dumbbell", "bug", "block404", "drone"]
      : ["dumbbell", "bug", "block404"];
  const kind = kinds[Math.floor(Math.random() * kinds.length)];
  const dims: Record<ObstacleKind, { w: number; h: number; flying: boolean }> =
    {
      dumbbell: { w: 32, h: 26, flying: false },
      bug: { w: 36, h: 24, flying: false },
      block404: { w: 38, h: 28, flying: false },
      drone: { w: 40, h: 12, flying: true },
    };
  return { x: canvasW + 20, kind, ...dims[kind] };
}

function createInitialState(canvasW: number, canvasH: number): GameState {
  const groundY = canvasH * GROUND_Y_RATIO;
  return {
    phase: "idle",
    score: 0,
    elapsed: 0,
    playerY: groundY - PLAYER_H,
    playerVY: 0,
    grounded: true,
    ducking: false,
    animTimer: 0,
    animFrame: 0,
    obstacles: [],
    spawnTimer: 0,
    groundOffset: 0,
    stars: createStars(canvasW, canvasH),
    buildings: createBuildings(canvasW * 2, groundY),
    buildingOffset: 0,
    highScore: loadHighScore(),
    newHighScore: false,
  };
}

/* ─── Drawing ─── */

function drawMoon(ctx: CanvasRenderingContext2D, w: number) {
  const mx = w * 0.85;
  const my = 48;
  const r = 18;

  // Outer glow
  ctx.globalAlpha = 0.06;
  ctx.fillStyle = COL_TEXT;
  ctx.beginPath();
  ctx.arc(mx, my, r * 3, 0, Math.PI * 2);
  ctx.fill();

  // Inner glow
  ctx.globalAlpha = 0.1;
  ctx.beginPath();
  ctx.arc(mx, my, r * 1.6, 0, Math.PI * 2);
  ctx.fill();

  // Moon disc
  ctx.globalAlpha = 0.18;
  ctx.beginPath();
  ctx.arc(mx, my, r, 0, Math.PI * 2);
  ctx.fill();

  ctx.globalAlpha = 1;
}

function drawBackground(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  stars: Star[],
  time: number,
) {
  // Sky gradient
  const grad = ctx.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, COL_BG_UPPER);
  grad.addColorStop(1, COL_BG);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  drawMoon(ctx, w);

  // Stars
  for (const s of stars) {
    const alpha = 0.3 + 0.5 * Math.sin(time * 1.5 + s.phase);
    ctx.globalAlpha = alpha;
    ctx.fillStyle = COL_TEXT;
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

function drawBuildings(
  ctx: CanvasRenderingContext2D,
  buildings: Building[],
  offset: number,
  groundY: number,
  totalWidth: number,
) {
  for (const b of buildings) {
    const bx =
      (((b.x - offset) % totalWidth) + totalWidth) % totalWidth - 40;
    ctx.fillStyle = b.dark ? COL_BUILDING_DARK : COL_BUILDING;
    ctx.fillRect(bx, groundY - b.h, b.w, b.h);

    // Lit windows
    ctx.fillStyle = COL_CYAN;
    ctx.globalAlpha = 0.12;
    for (const win of b.windows) {
      ctx.fillRect(bx + win.rx, groundY - b.h + win.ry, 3, 3);
    }
    ctx.globalAlpha = 1;
  }
}

function drawGround(
  ctx: CanvasRenderingContext2D,
  w: number,
  groundY: number,
  offset: number,
) {
  // Main ground line
  ctx.strokeStyle = COL_CYAN;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(0, groundY);
  ctx.lineTo(w, groundY);
  ctx.stroke();

  // Dash marks
  ctx.strokeStyle = COL_CYAN_DIM;
  ctx.lineWidth = 0.5;
  const dashSpacing = 28;
  for (let x = -offset % dashSpacing; x < w; x += dashSpacing) {
    ctx.beginPath();
    ctx.moveTo(x, groundY);
    ctx.lineTo(x, groundY + 5);
    ctx.stroke();
  }
}

function drawPlayerStanding(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  frame: number,
  inAir: boolean,
) {
  ctx.fillStyle = COL_CYAN;

  // Head
  ctx.fillRect(x + 5, y, 10, 8);
  // Eye
  ctx.fillStyle = COL_BG;
  ctx.fillRect(x + 13, y + 2, 2, 3);
  ctx.fillStyle = COL_CYAN;

  // Torso
  ctx.fillRect(x + 3, y + 8, 14, 14);

  // Arms
  if (inAir) {
    ctx.fillRect(x, y + 6, 4, 10);
    ctx.fillRect(x + 16, y + 6, 4, 10);
  } else {
    ctx.fillRect(x, y + 10, 4, 8);
    ctx.fillRect(x + 16, y + 10, 4, 8);
  }

  // Legs
  if (inAir) {
    ctx.fillRect(x + 4, y + 22, 5, 8);
    ctx.fillRect(x + 11, y + 22, 5, 8);
  } else if (frame === 0) {
    ctx.fillRect(x + 2, y + 22, 6, 10);
    ctx.fillRect(x + 12, y + 22, 6, 7);
  } else {
    ctx.fillRect(x + 2, y + 22, 6, 7);
    ctx.fillRect(x + 12, y + 22, 6, 10);
  }
}

function drawPlayerDucking(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
) {
  ctx.fillStyle = COL_CYAN;
  // Squished body
  ctx.fillRect(x, y, PLAYER_W, 12);
  // Eye
  ctx.fillStyle = COL_BG;
  ctx.fillRect(x + PLAYER_W - 4, y + 3, 2, 3);
  ctx.fillStyle = COL_CYAN;
  // Short legs
  ctx.fillRect(x + 2, y + 12, 6, 6);
  ctx.fillRect(x + 12, y + 12, 6, 6);
}

function drawPlayer(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  ducking: boolean,
  animFrame: number,
  inAir: boolean,
) {
  if (ducking && !inAir) {
    drawPlayerDucking(ctx, x, y);
  } else {
    drawPlayerStanding(ctx, x, y, animFrame, inAir);
  }
}

function drawObstacle(
  ctx: CanvasRenderingContext2D,
  obs: Obstacle,
  groundY: number,
) {
  const y = obs.flying ? groundY - DRONE_TOP_OFFSET : groundY - obs.h;

  switch (obs.kind) {
    case "dumbbell": {
      ctx.fillStyle = COL_TEXT_DIM;
      ctx.fillRect(obs.x, y + 2, 7, obs.h - 4);
      ctx.fillRect(obs.x + obs.w - 7, y + 2, 7, obs.h - 4);
      ctx.fillRect(obs.x + 7, y + obs.h / 2 - 2, obs.w - 14, 4);
      break;
    }
    case "bug": {
      ctx.font = "bold 16px monospace";
      ctx.fillStyle = COL_TEXT_DIM;
      ctx.fillText("<bug/>", obs.x, groundY - 6);
      break;
    }
    case "block404": {
      ctx.fillStyle = COL_CYAN_DIM;
      ctx.globalAlpha = 0.6;
      ctx.fillRect(obs.x, y, obs.w, obs.h);
      ctx.globalAlpha = 1;
      ctx.font = "bold 14px monospace";
      ctx.fillStyle = COL_TEXT;
      ctx.fillText("404", obs.x + 6, y + 18);
      break;
    }
    case "drone": {
      ctx.fillStyle = COL_TEXT_DIM;
      ctx.globalAlpha = 0.8;
      // Body
      ctx.fillRect(obs.x + 8, y + 2, obs.w - 16, obs.h - 4);
      // Propeller bar
      ctx.fillRect(obs.x, y, obs.w, 3);
      ctx.globalAlpha = 1;
      // Label
      ctx.font = "bold 9px monospace";
      ctx.fillStyle = COL_BG;
      ctx.fillText("@", obs.x + obs.w / 2 - 4, y + obs.h - 3);
      break;
    }
  }
}

function drawScore(
  ctx: CanvasRenderingContext2D,
  score: number,
  highScore: number,
  w: number,
) {
  ctx.textAlign = "right";

  // High score (dimmed, above current)
  if (highScore > 0) {
    ctx.font = "12px monospace";
    ctx.fillStyle = COL_TEXT_DIM;
    ctx.fillText(`HI ${Math.floor(highScore)}`, w - 16, 22);
  }

  // Current score
  ctx.font = "bold 16px monospace";
  ctx.fillStyle = COL_TEXT;
  ctx.fillText(`${Math.floor(score)}`, w - 16, 40);

  ctx.textAlign = "left";
}

function drawOverlay(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  phase: "idle" | "dead",
  score: number,
  highScore: number,
  newHighScore: boolean,
) {
  ctx.fillStyle = "rgba(2, 6, 23, 0.7)";
  ctx.fillRect(0, 0, w, h);

  ctx.textAlign = "center";
  if (phase === "idle") {
    ctx.font = "bold 20px monospace";
    ctx.fillStyle = COL_CYAN;
    ctx.fillText("PRESS SPACE TO RUN", w / 2, h / 2 - 16);
    ctx.font = "14px monospace";
    ctx.fillStyle = COL_TEXT_DIM;
    ctx.fillText("\u2193 to duck \u00b7 tap on mobile", w / 2, h / 2 + 10);
    if (highScore > 0) {
      ctx.font = "12px monospace";
      ctx.fillStyle = COL_TEXT_DIM;
      ctx.fillText(`Best: ${Math.floor(highScore)}`, w / 2, h / 2 + 32);
    }
  } else {
    ctx.font = "bold 24px monospace";
    ctx.fillStyle = COL_CYAN;
    ctx.fillText("GAME OVER", w / 2, h / 2 - 28);

    ctx.font = "bold 18px monospace";
    ctx.fillStyle = COL_TEXT;
    ctx.fillText(`Score: ${Math.floor(score)}`, w / 2, h / 2 + 4);

    if (newHighScore) {
      ctx.font = "bold 14px monospace";
      ctx.fillStyle = COL_CYAN;
      ctx.fillText("\u2605 NEW BEST! \u2605", w / 2, h / 2 + 26);
    } else if (highScore > 0) {
      ctx.font = "12px monospace";
      ctx.fillStyle = COL_TEXT_DIM;
      ctx.fillText(`Best: ${Math.floor(highScore)}`, w / 2, h / 2 + 26);
    }

    ctx.font = "14px monospace";
    ctx.fillStyle = COL_TEXT_DIM;
    ctx.fillText("Space to restart", w / 2, h / 2 + 50);
  }
  ctx.textAlign = "left";
}

/* ─── Component ─── */

export default function RunnerDemo() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameRef = useRef<GameState | null>(null);
  const rafRef = useRef(0);
  const lastTimeRef = useRef(0);
  const jumpPressedRef = useRef(false);
  const duckHeldRef = useRef(false);

  const getCanvasSize = useCallback(() => {
    const el = containerRef.current;
    if (!el) return { w: 800, h: 400 };
    return { w: el.clientWidth, h: el.clientHeight };
  }, []);

  // Input handling
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space" || e.code === "ArrowUp") {
        e.preventDefault();
        jumpPressedRef.current = true;
      }
      if (e.code === "ArrowDown" || e.code === "KeyS") {
        e.preventDefault();
        duckHeldRef.current = true;
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code === "ArrowDown" || e.code === "KeyS") {
        duckHeldRef.current = false;
      }
    };
    const onTouch = () => {
      jumpPressedRef.current = true;
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("touchstart", onTouch);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("touchstart", onTouch);
    };
  }, []);

  // Game loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const { w, h } = getCanvasSize();
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    ctx.scale(dpr, dpr);

    gameRef.current = createInitialState(w, h);
    lastTimeRef.current = 0;

    const groundY = h * GROUND_Y_RATIO;
    const playerX = w * PLAYER_X_RATIO;
    const totalBuildingWidth =
      gameRef.current.buildings.reduce(
        (s, b) => Math.max(s, b.x + b.w),
        0,
      ) + 60;

    const tick = (timestamp: number) => {
      const game = gameRef.current;
      if (!game) return;

      if (lastTimeRef.current === 0) lastTimeRef.current = timestamp;
      const dt = Math.min((timestamp - lastTimeRef.current) / 1000, 0.05);
      lastTimeRef.current = timestamp;

      const jump = jumpPressedRef.current;
      jumpPressedRef.current = false;
      const duckInput = duckHeldRef.current;

      // ── State transitions ──
      if ((game.phase === "idle" || game.phase === "dead") && jump) {
        game.phase = "running";
        game.score = 0;
        game.elapsed = 0;
        game.obstacles = [];
        game.spawnTimer = 1.5;
        game.playerY = groundY - PLAYER_H;
        game.playerVY = 0;
        game.grounded = true;
        game.ducking = false;
        game.animTimer = 0;
        game.animFrame = 0;
        game.newHighScore = false;
      }

      if (game.phase === "running") {
        game.elapsed += dt;
        game.score += dt * 10;
        const speed =
          OBSTACLE_SPEED_BASE + game.elapsed * OBSTACLE_SPEED_ACCEL;

        // Duck state (snap position on transition)
        const wasDucking = game.ducking;
        game.ducking = duckInput && game.grounded;
        if (game.ducking && !wasDucking && game.grounded) {
          game.playerY = groundY - PLAYER_H_DUCK;
        }
        if (!game.ducking && wasDucking && game.grounded) {
          game.playerY = groundY - PLAYER_H;
        }

        const currentH = game.ducking ? PLAYER_H_DUCK : PLAYER_H;

        // Jump (can't jump while ducking)
        if (jump && game.grounded && !game.ducking) {
          game.playerVY = JUMP_VELOCITY;
          game.grounded = false;
        }

        // Player physics
        game.playerVY += GRAVITY * dt;
        game.playerY += game.playerVY * dt;
        if (game.playerY >= groundY - currentH) {
          game.playerY = groundY - currentH;
          game.playerVY = 0;
          game.grounded = true;
        }

        // Running animation (only when grounded + not ducking)
        if (game.grounded && !game.ducking) {
          game.animTimer += dt;
          if (game.animTimer >= ANIM_STRIDE_S) {
            game.animTimer -= ANIM_STRIDE_S;
            game.animFrame = game.animFrame === 0 ? 1 : 0;
          }
        }

        // Ground scroll
        game.groundOffset += speed * dt;

        // Building scroll
        game.buildingOffset += BUILDING_SCROLL_SPEED * dt;

        // Spawn obstacles
        game.spawnTimer -= dt;
        if (game.spawnTimer <= 0) {
          game.obstacles.push(spawnObstacle(w, game.elapsed));
          const gap = OBSTACLE_MIN_GAP_PX + Math.random() * 120;
          game.spawnTimer = gap / speed;
        }

        // Move obstacles + collision
        for (let i = game.obstacles.length - 1; i >= 0; i--) {
          const obs = game.obstacles[i];
          obs.x -= speed * dt;

          // Remove off-screen
          if (obs.x + obs.w < -20) {
            game.obstacles.splice(i, 1);
            continue;
          }

          // AABB collision
          const obsY = obs.flying
            ? groundY - DRONE_TOP_OFFSET
            : groundY - obs.h;
          const playerTop = game.playerY;
          const playerBottom = game.playerY + currentH;
          const obsBottom = obsY + obs.h;

          if (
            playerX + PLAYER_W > obs.x + 4 &&
            playerX < obs.x + obs.w - 4 &&
            playerBottom > obsY + 3 &&
            playerTop < obsBottom - 3
          ) {
            game.phase = "dead";
            // Check high score
            if (game.score > game.highScore) {
              game.highScore = Math.floor(game.score);
              game.newHighScore = true;
              saveHighScore(game.score);
            }
          }
        }
      }

      // ── Draw ──
      drawBackground(ctx, w, h, game.stars, game.elapsed || 0);
      drawBuildings(
        ctx,
        game.buildings,
        game.buildingOffset,
        groundY,
        totalBuildingWidth,
      );
      drawGround(ctx, w, groundY, game.groundOffset);

      // Obstacles
      for (const obs of game.obstacles) {
        drawObstacle(ctx, obs, groundY);
      }

      // Player
      drawPlayer(
        ctx,
        playerX,
        game.playerY,
        game.ducking,
        game.animFrame,
        !game.grounded,
      );

      // Score
      if (game.phase === "running") {
        drawScore(ctx, game.score, game.highScore, w);
      }

      // Overlays
      if (game.phase === "idle") {
        drawOverlay(ctx, w, h, "idle", 0, game.highScore, false);
      } else if (game.phase === "dead") {
        drawOverlay(
          ctx,
          w,
          h,
          "dead",
          game.score,
          game.highScore,
          game.newHighScore,
        );
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [getCanvasSize]);

  return (
    <DemoSection
      number={9}
      title="Runner Pixel — 404 Game"
      description="Infinite runner arcade. Space pour sauter, \u2193 pour esquiver les drones. High score sauvegard\u00e9. La vitesse monte... bonne chance."
    >
      <div
        ref={containerRef}
        className="h-[400px] overflow-hidden rounded-2xl border border-slate-800 bg-slate-950"
      >
        <canvas ref={canvasRef} className="block h-full w-full" />
      </div>
    </DemoSection>
  );
}
