import { useEffect, useRef, useCallback, useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { isMobileDevice } from '../utils/device';

// ─── Constants ───
const GAME_DURATION = 180;
const MERCY_GOAL_LIMIT = 3;

const FIELD_W = 800;
const FIELD_H = 500;
const GOAL_W = 12;
const GOAL_H = 120;
const BALL_R = 8;
const PLAYER_R = 16;

// Speed reduced ~20% from original (3.5 → 2.8, 2.8 → 2.24)
const PLAYER_SPEED = 2.8;
const AI_SPEED = 2.24;

const KICK_POWER = 8;
const PASS_POWER = 6;
const BALL_FRICTION = 0.985;
const BALL_BOUNCE = 0.7;

interface Vec2 { x: number; y: number; }

interface GamePlayer {
  x: number; y: number;
  vx: number; vy: number;
  color: string;
  isAI: boolean;
  goals: number;
  lastDir: Vec2;
}

interface Ball {
  x: number; y: number;
  vx: number; vy: number;
}

export default function GameScreen() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { currentPlayer, setScreen, updatePlayerStats, addMatchRecord, setMercyRule, gameMode } = useGameStore();
  const mobile = isMobileDevice();
  
  const gameRef = useRef({
    player: { x: FIELD_W * 0.25, y: FIELD_H / 2, vx: 0, vy: 0, color: '#22c55e', isAI: false, goals: 0, lastDir: { x: 1, y: 0 } } as GamePlayer,
    opponent: { x: FIELD_W * 0.75, y: FIELD_H / 2, vx: 0, vy: 0, color: '#3b82f6', isAI: true, goals: 0, lastDir: { x: -1, y: 0 } } as GamePlayer,
    ball: { x: FIELD_W / 2, y: FIELD_H / 2, vx: 0, vy: 0 } as Ball,
    timeLeft: GAME_DURATION,
    running: true,
    goalScored: false,
    goalTimer: 0,
    scale: 1,
    offsetX: 0,
    offsetY: 0,
    mercyTriggered: false,
  });
  
  const inputRef = useRef({
    dx: 0, dy: 0,
    kick: false, pass: false,
    touchId: -1,
    touchStartX: 0, touchStartY: 0,
    joyActive: false,
    keys: new Set<string>(),
  });
  
  const [timeDisplay, setTimeDisplay] = useState(GAME_DURATION);
  const [scoreDisplay, setScoreDisplay] = useState([0, 0]);
  const [goalMessage, setGoalMessage] = useState('');
  const [joyPos, setJoyPos] = useState({ x: 0, y: 0 });
  const [mercyMessage, setMercyMessage] = useState('');
  
  const animFrameRef = useRef<number>(0);
  const timerRef = useRef<number>(0);
  
  const modeLabel = gameMode === 'custom' ? 'Sala Personalizada' : 'Treino CPU';
  
  // ─── Scale canvas ───
  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    
    const cw = container.clientWidth;
    const ch = container.clientHeight;
    const scale = Math.min(cw / FIELD_W, ch / FIELD_H);
    
    canvas.width = FIELD_W;
    canvas.height = FIELD_H;
    canvas.style.width = `${FIELD_W * scale}px`;
    canvas.style.height = `${FIELD_H * scale}px`;
    
    gameRef.current.scale = scale;
    gameRef.current.offsetX = (cw - FIELD_W * scale) / 2;
    gameRef.current.offsetY = (ch - FIELD_H * scale) / 2;
  }, []);
  
  // ─── Keyboard Input (WASD/Arrows + Space + P) ───
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      inputRef.current.keys.add(key);
      if (e.key === ' ') { inputRef.current.kick = true; e.preventDefault(); }
      if (key === 'p') { inputRef.current.pass = true; e.preventDefault(); }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      inputRef.current.keys.delete(e.key.toLowerCase());
    };
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);
  
  // ─── Reset ───
  const resetPositions = useCallback(() => {
    const g = gameRef.current;
    g.player.x = FIELD_W * 0.25;
    g.player.y = FIELD_H / 2;
    g.player.vx = 0; g.player.vy = 0;
    g.opponent.x = FIELD_W * 0.75;
    g.opponent.y = FIELD_H / 2;
    g.opponent.vx = 0; g.opponent.vy = 0;
    g.ball.x = FIELD_W / 2;
    g.ball.y = FIELD_H / 2;
    g.ball.vx = 0; g.ball.vy = 0;
  }, []);
  
  // ─── End Game ───
  const endGame = useCallback(async (wasMercy: boolean = false) => {
    const g = gameRef.current;
    g.running = false;
    if (!currentPlayer) return;
    
    const myGoals = g.player.goals;
    const opGoals = g.opponent.goals;
    const won = myGoals > opGoals;
    const draw = myGoals === opGoals;
    const isMvp = myGoals >= opGoals;
    const opName = 'Bot CPU';
    
    if (wasMercy) {
      setMercyRule(true);
    } else {
      setMercyRule(false);
    }
    
    await updatePlayerStats(myGoals, won, draw, isMvp);
    await addMatchRecord({
      player1Id: currentPlayer.id,
      player2Id: 'cpu',
      player1Name: currentPlayer.nickname,
      player2Name: opName,
      score1: myGoals,
      score2: opGoals,
      mvpId: isMvp ? currentPlayer.id : 'cpu',
      mvpName: isMvp ? currentPlayer.nickname : opName,
    });
    
    setTimeout(() => setScreen('matchResult'), wasMercy ? 2500 : 1500);
  }, [currentPlayer, updatePlayerStats, addMatchRecord, setScreen, setMercyRule]);
  
  // ─── Check Mercy Rule ───
  const checkMercyRule = useCallback(() => {
    const g = gameRef.current;
    if (g.mercyTriggered) return;
    
    if (g.player.goals >= MERCY_GOAL_LIMIT) {
      g.mercyTriggered = true;
      setMercyMessage(`⚡ MERCY RULE! ${MERCY_GOAL_LIMIT} gols — Vitória antecipada!`);
      // Wait for goal animation to finish, then end game
      setTimeout(() => endGame(true), 1500);
    } else if (g.opponent.goals >= MERCY_GOAL_LIMIT) {
      g.mercyTriggered = true;
      setMercyMessage(`⚡ MERCY RULE! Adversário atingiu ${MERCY_GOAL_LIMIT} gols`);
      setTimeout(() => endGame(true), 1500);
    }
  }, [endGame]);
  
  // ─── AI ───
  const aiCooldownRef = useRef(0);
  const updateAI = useCallback(() => {
    const g = gameRef.current;
    const ai = g.opponent;
    const ball = g.ball;
    if (aiCooldownRef.current > 0) aiCooldownRef.current--;
    
    const ballOnAiSide = ball.x > FIELD_W / 2;
    const speed = ballOnAiSide ? AI_SPEED : AI_SPEED * 0.8;
    
    let targetX = ball.x;
    let targetY = ball.y;
    
    if (ball.vx < -2) {
      targetX = FIELD_W * 0.7;
      targetY = FIELD_H / 2;
    }
    
    const toBallX = targetX - ai.x;
    const toBallY = targetY - ai.y;
    const dist = Math.sqrt(toBallX * toBallX + toBallY * toBallY);
    
    if (dist > 3) {
      const nx = toBallX / dist;
      const ny = toBallY / dist;
      ai.x += nx * speed;
      ai.y += ny * speed;
      ai.lastDir = { x: nx, y: ny };
    }
    
    const ballDist = Math.sqrt((ball.x - ai.x) ** 2 + (ball.y - ai.y) ** 2);
    if (ballDist < PLAYER_R + BALL_R + 5 && aiCooldownRef.current <= 0) {
      const toGoalX = 0 - ball.x;
      const toGoalY = (FIELD_H / 2 + (Math.random() - 0.5) * GOAL_H * 0.6) - ball.y;
      const gDist = Math.sqrt(toGoalX * toGoalX + toGoalY * toGoalY);
      if (gDist > 1) {
        const accuracy = 0.6 + Math.random() * 0.4;
        const power = KICK_POWER * (0.7 + Math.random() * 0.3);
        ball.vx = (toGoalX / gDist) * power * accuracy;
        ball.vy = (toGoalY / gDist) * power * 0.4 + (Math.random() - 0.5) * 2;
        aiCooldownRef.current = 30 + Math.floor(Math.random() * 30);
      }
    }
    
    ai.x = Math.max(PLAYER_R, Math.min(FIELD_W - PLAYER_R, ai.x));
    ai.y = Math.max(PLAYER_R, Math.min(FIELD_H - PLAYER_R, ai.y));
  }, []);
  
  // ─── Game Loop ───
  const gameLoop = useCallback(() => {
    const g = gameRef.current;
    const input = inputRef.current;
    const canvas = canvasRef.current;
    
    if (!g.running || !canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Process keyboard
    let kx = 0, ky = 0;
    if (input.keys.has('w') || input.keys.has('arrowup')) ky -= 1;
    if (input.keys.has('s') || input.keys.has('arrowdown')) ky += 1;
    if (input.keys.has('a') || input.keys.has('arrowleft')) kx -= 1;
    if (input.keys.has('d') || input.keys.has('arrowright')) kx += 1;
    
    let mx = input.dx + kx;
    let my = input.dy + ky;
    const mag = Math.sqrt(mx * mx + my * my);
    if (mag > 1) { mx /= mag; my /= mag; }
    
    // Update player
    if (mag > 0.1) {
      g.player.x += mx * PLAYER_SPEED;
      g.player.y += my * PLAYER_SPEED;
      g.player.lastDir = { x: mx, y: my };
    }
    
    g.player.x = Math.max(PLAYER_R, Math.min(FIELD_W - PLAYER_R, g.player.x));
    g.player.y = Math.max(PLAYER_R, Math.min(FIELD_H - PLAYER_R, g.player.y));
    
    // Kick / Pass
    const ballDistP = Math.sqrt(
      (g.ball.x - g.player.x) ** 2 + (g.ball.y - g.player.y) ** 2
    );
    
    if (input.kick && ballDistP < PLAYER_R + BALL_R + 8) {
      const dir = g.player.lastDir;
      g.ball.vx = dir.x * KICK_POWER;
      g.ball.vy = dir.y * KICK_POWER;
      input.kick = false;
    }
    if (input.pass && ballDistP < PLAYER_R + BALL_R + 8) {
      const dir = g.player.lastDir;
      g.ball.vx = dir.x * PASS_POWER;
      g.ball.vy = dir.y * PASS_POWER;
      input.pass = false;
    }
    input.kick = false;
    input.pass = false;
    
    // AI
    if (!g.goalScored) updateAI();
    
    // Ball physics
    g.ball.x += g.ball.vx;
    g.ball.y += g.ball.vy;
    g.ball.vx *= BALL_FRICTION;
    g.ball.vy *= BALL_FRICTION;
    
    if (g.ball.y - BALL_R < 0) { g.ball.y = BALL_R; g.ball.vy *= -BALL_BOUNCE; }
    if (g.ball.y + BALL_R > FIELD_H) { g.ball.y = FIELD_H - BALL_R; g.ball.vy *= -BALL_BOUNCE; }
    
    // Ball-player collision
    const pushBall = (p: GamePlayer) => {
      const dx = g.ball.x - p.x;
      const dy = g.ball.y - p.y;
      const d = Math.sqrt(dx * dx + dy * dy);
      if (d < PLAYER_R + BALL_R) {
        const overlap = PLAYER_R + BALL_R - d;
        const nx = dx / d;
        const ny = dy / d;
        g.ball.x += nx * overlap;
        g.ball.y += ny * overlap;
        g.ball.vx += nx * 1.5;
        g.ball.vy += ny * 1.5;
      }
    };
    pushBall(g.player);
    pushBall(g.opponent);
    
    // Goal detection
    if (!g.goalScored && !g.mercyTriggered) {
      const goalTop = (FIELD_H - GOAL_H) / 2;
      const goalBottom = (FIELD_H + GOAL_H) / 2;
      
      if (g.ball.x - BALL_R <= GOAL_W && g.ball.y > goalTop && g.ball.y < goalBottom) {
        g.opponent.goals++;
        g.goalScored = true;
        g.goalTimer = 90;
        setGoalMessage('GOL DO ADVERSÁRIO! ⚽');
        setScoreDisplay([g.player.goals, g.opponent.goals]);
        // Check mercy after goal
        setTimeout(() => checkMercyRule(), 100);
      }
      if (g.ball.x + BALL_R >= FIELD_W - GOAL_W && g.ball.y > goalTop && g.ball.y < goalBottom) {
        g.player.goals++;
        g.goalScored = true;
        g.goalTimer = 90;
        setGoalMessage('GOOOL! ⚽🎉');
        setScoreDisplay([g.player.goals, g.opponent.goals]);
        // Check mercy after goal
        setTimeout(() => checkMercyRule(), 100);
      }
    }
    
    if (g.goalScored && !g.mercyTriggered) {
      g.goalTimer--;
      if (g.goalTimer <= 0) {
        g.goalScored = false;
        setGoalMessage('');
        resetPositions();
      }
    }
    
    // Ball bounds
    const goalTop = (FIELD_H - GOAL_H) / 2;
    const goalBottom = (FIELD_H + GOAL_H) / 2;
    
    if (g.ball.x - BALL_R < 0) {
      if (g.ball.y < goalTop || g.ball.y > goalBottom) {
        g.ball.x = BALL_R;
        g.ball.vx *= -BALL_BOUNCE;
      }
    }
    if (g.ball.x + BALL_R > FIELD_W) {
      if (g.ball.y < goalTop || g.ball.y > goalBottom) {
        g.ball.x = FIELD_W - BALL_R;
        g.ball.vx *= -BALL_BOUNCE;
      }
    }
    
    // ─── RENDER ───
    // Field
    ctx.fillStyle = '#1a7a3a';
    ctx.fillRect(0, 0, FIELD_W, FIELD_H);
    
    // Grass stripes
    ctx.fillStyle = 'rgba(0,0,0,0.03)';
    for (let i = 0; i < FIELD_W; i += 80) {
      if ((i / 80) % 2 === 0) ctx.fillRect(i, 0, 80, FIELD_H);
    }
    
    // Field lines
    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.lineWidth = 2;
    ctx.strokeRect(10, 10, FIELD_W - 20, FIELD_H - 20);
    
    ctx.beginPath();
    ctx.moveTo(FIELD_W / 2, 10);
    ctx.lineTo(FIELD_W / 2, FIELD_H - 10);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.arc(FIELD_W / 2, FIELD_H / 2, 60, 0, Math.PI * 2);
    ctx.stroke();
    
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.beginPath();
    ctx.arc(FIELD_W / 2, FIELD_H / 2, 4, 0, Math.PI * 2);
    ctx.fill();
    
    // Penalty areas
    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.strokeRect(10, FIELD_H / 2 - 100, 80, 200);
    ctx.strokeRect(FIELD_W - 90, FIELD_H / 2 - 100, 80, 200);
    ctx.strokeRect(10, FIELD_H / 2 - 50, 35, 100);
    ctx.strokeRect(FIELD_W - 45, FIELD_H / 2 - 50, 35, 100);
    
    // Goals
    const gt = (FIELD_H - GOAL_H) / 2;
    // Left goal
    ctx.fillStyle = 'rgba(255,255,255,0.08)';
    ctx.fillRect(0, gt, GOAL_W, GOAL_H);
    ctx.strokeStyle = 'rgba(255,255,255,0.5)';
    ctx.lineWidth = 3;
    ctx.strokeRect(0, gt, GOAL_W, GOAL_H);
    // Goal net lines
    for (let ny = gt; ny < gt + GOAL_H; ny += 12) {
      ctx.strokeStyle = 'rgba(255,255,255,0.1)';
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.moveTo(0, ny);
      ctx.lineTo(GOAL_W, ny);
      ctx.stroke();
    }
    
    // Right goal  
    ctx.fillStyle = 'rgba(255,255,255,0.08)';
    ctx.fillRect(FIELD_W - GOAL_W, gt, GOAL_W, GOAL_H);
    ctx.strokeStyle = 'rgba(255,255,255,0.5)';
    ctx.lineWidth = 3;
    ctx.strokeRect(FIELD_W - GOAL_W, gt, GOAL_W, GOAL_H);
    for (let ny = gt; ny < gt + GOAL_H; ny += 12) {
      ctx.strokeStyle = 'rgba(255,255,255,0.1)';
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.moveTo(FIELD_W - GOAL_W, ny);
      ctx.lineTo(FIELD_W, ny);
      ctx.stroke();
    }
    
    // Draw player function
    const drawPlayer = (p: GamePlayer, label: string) => {
      // Shadow
      ctx.fillStyle = 'rgba(0,0,0,0.2)';
      ctx.beginPath();
      ctx.ellipse(p.x, p.y + PLAYER_R - 2, PLAYER_R * 0.8, 4, 0, 0, Math.PI * 2);
      ctx.fill();
      
      // Body
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, PLAYER_R, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.5)';
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // Direction indicator
      const dir = p.lastDir;
      ctx.strokeStyle = 'rgba(255,255,255,0.7)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(p.x + dir.x * PLAYER_R * 1.3, p.y + dir.y * PLAYER_R * 1.3);
      ctx.stroke();
      
      // Label
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(label, p.x, p.y - PLAYER_R - 5);
    };
    
    drawPlayer(g.player, currentPlayer?.nickname || 'P1');
    drawPlayer(g.opponent, 'CPU');
    
    // Ball
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.beginPath();
    ctx.ellipse(g.ball.x, g.ball.y + BALL_R, BALL_R * 0.8, 3, 0, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(g.ball.x, g.ball.y, BALL_R, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1;
    ctx.stroke();
    
    ctx.fillStyle = '#333';
    ctx.beginPath();
    ctx.arc(g.ball.x - 2, g.ball.y - 2, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(g.ball.x + 3, g.ball.y + 1, 2.5, 0, Math.PI * 2);
    ctx.fill();
    
    // Goal flash
    if (g.goalScored && g.goalTimer > 60) {
      ctx.fillStyle = `rgba(255,255,255,${(g.goalTimer - 60) / 30 * 0.3})`;
      ctx.fillRect(0, 0, FIELD_W, FIELD_H);
    }
    
    // Mercy rule overlay
    if (g.mercyTriggered) {
      ctx.fillStyle = 'rgba(0,0,0,0.4)';
      ctx.fillRect(0, 0, FIELD_W, FIELD_H);
    }
    
    animFrameRef.current = requestAnimationFrame(gameLoop);
  }, [currentPlayer, updateAI, resetPositions, checkMercyRule]);
  
  // ─── Timer ───
  useEffect(() => {
    timerRef.current = window.setInterval(() => {
      const g = gameRef.current;
      if (!g.running || g.goalScored || g.mercyTriggered) return;
      g.timeLeft--;
      setTimeDisplay(g.timeLeft);
      if (g.timeLeft <= 0) {
        g.running = false;
        endGame(false);
      }
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [endGame]);
  
  // ─── Init ───
  useEffect(() => {
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    animFrameRef.current = requestAnimationFrame(gameLoop);
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animFrameRef.current);
    };
  }, [resizeCanvas, gameLoop]);
  
  // ─── Touch handlers ───
  const handleJoyStart = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    const touch = e.changedTouches[0];
    inputRef.current.touchId = touch.identifier;
    inputRef.current.touchStartX = touch.clientX;
    inputRef.current.touchStartY = touch.clientY;
    inputRef.current.joyActive = true;
  }, []);
  
  const handleJoyMove = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      if (touch.identifier === inputRef.current.touchId) {
        const dx = touch.clientX - inputRef.current.touchStartX;
        const dy = touch.clientY - inputRef.current.touchStartY;
        const maxDist = 50;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist > 5) {
          const clampDist = Math.min(dist, maxDist);
          inputRef.current.dx = (dx / dist) * (clampDist / maxDist);
          inputRef.current.dy = (dy / dist) * (clampDist / maxDist);
          setJoyPos({ x: (dx / dist) * clampDist, y: (dy / dist) * clampDist });
        } else {
          inputRef.current.dx = 0;
          inputRef.current.dy = 0;
          setJoyPos({ x: 0, y: 0 });
        }
      }
    }
  }, []);
  
  const handleJoyEnd = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    for (let i = 0; i < e.changedTouches.length; i++) {
      if (e.changedTouches[i].identifier === inputRef.current.touchId) {
        inputRef.current.dx = 0;
        inputRef.current.dy = 0;
        inputRef.current.joyActive = false;
        inputRef.current.touchId = -1;
        setJoyPos({ x: 0, y: 0 });
      }
    }
  }, []);
  
  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  const handleQuit = useCallback(() => {
    gameRef.current.running = false;
    cancelAnimationFrame(animFrameRef.current);
    clearInterval(timerRef.current);
    setScreen('home');
  }, [setScreen]);
  
  return (
    <div className="fixed inset-0 bg-black flex flex-col select-none" style={{ touchAction: 'none' }}>
      {/* HUD */}
      <div className="bg-gradient-to-r from-[#0d1f0a] via-[#1a3a12] to-[#0d1f0a] px-3 py-1.5 flex items-center justify-between z-10 shrink-0 border-b border-emerald-800/30">
        <button
          onClick={handleQuit}
          className="text-gray-400 hover:text-white text-xs px-2 py-1 bg-[#0d1f0a] rounded border border-emerald-800/20"
        >
          ✕ Sair
        </button>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-emerald-500" />
            <span className="text-white font-bold text-sm">{scoreDisplay[0]}</span>
          </div>
          <div className={`px-3 py-0.5 rounded font-mono font-bold text-sm ${
            timeDisplay <= 30 ? 'bg-red-900/60 text-red-300 animate-pulse' : 'bg-[#0d1f0a] text-white'
          }`}>
            {formatTime(timeDisplay)}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-white font-bold text-sm">{scoreDisplay[1]}</span>
            <div className="w-3 h-3 rounded-full bg-blue-500" />
          </div>
        </div>
        
        {/* Mercy rule indicator */}
        <div className="flex items-center gap-1.5">
          <div className="text-amber-500/50 text-[10px]">⚡{MERCY_GOAL_LIMIT}G</div>
          <div className="text-emerald-600/50 text-xs">{modeLabel}</div>
        </div>
      </div>
      
      {/* Goal message */}
      {goalMessage && (
        <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
          <div className="bg-black/70 px-8 py-4 rounded-2xl border border-emerald-500/30">
            <div className="text-amber-400 text-3xl font-black text-center animate-bounce">
              {goalMessage}
            </div>
          </div>
        </div>
      )}
      
      {/* Mercy rule message */}
      {mercyMessage && (
        <div className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none">
          <div className="bg-black/80 px-10 py-6 rounded-2xl border-2 border-amber-500/50 shadow-2xl">
            <div className="text-amber-400 text-2xl font-black text-center mb-2">
              {mercyMessage}
            </div>
            <div className="text-gray-400 text-sm text-center">
              Partida encerrada antecipadamente
            </div>
          </div>
        </div>
      )}
      
      {/* Canvas */}
      <div ref={containerRef} className="flex-1 relative flex items-center justify-center overflow-hidden bg-green-900">
        <canvas ref={canvasRef} className="block" />
      </div>
      
      {/* Mobile Controls — ONLY on mobile devices */}
      {mobile && (
        <div className="absolute bottom-0 left-0 right-0 flex justify-between items-end p-3 z-10 pointer-events-none">
          {/* Joystick */}
          <div
            className="pointer-events-auto w-36 h-36 relative"
            onTouchStart={handleJoyStart}
            onTouchMove={handleJoyMove}
            onTouchEnd={handleJoyEnd}
            onTouchCancel={handleJoyEnd}
          >
            <div className="absolute inset-0 rounded-full bg-white/8 border-2 border-white/15" />
            <div 
              className="absolute w-14 h-14 rounded-full bg-white/20 border-2 border-white/30"
              style={{
                left: '50%', top: '50%',
                transform: `translate(-50%, -50%) translate(${joyPos.x}px, ${joyPos.y}px)`,
              }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="absolute top-3 text-white/15 text-lg">▲</div>
              <div className="absolute bottom-3 text-white/15 text-lg">▼</div>
              <div className="absolute left-3 text-white/15 text-lg">◀</div>
              <div className="absolute right-3 text-white/15 text-lg">▶</div>
            </div>
          </div>
          
          {/* Action buttons */}
          <div className="pointer-events-auto flex flex-col gap-3 items-center">
            <button
              onTouchStart={(e) => { e.preventDefault(); inputRef.current.kick = true; }}
              className="w-16 h-16 rounded-full bg-emerald-600/60 border-3 border-emerald-400/40 text-white font-black text-xs flex items-center justify-center active:scale-90 active:bg-emerald-500 transition-all shadow-lg"
            >
              CHUTE
            </button>
            <button
              onTouchStart={(e) => { e.preventDefault(); inputRef.current.pass = true; }}
              className="w-14 h-14 rounded-full bg-blue-600/60 border-3 border-blue-400/40 text-white font-black text-xs flex items-center justify-center active:scale-90 active:bg-blue-500 transition-all shadow-lg"
            >
              PASSE
            </button>
          </div>
        </div>
      )}
      
      {/* Desktop controls hint */}
      {!mobile && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
          <div className="bg-black/40 backdrop-blur-sm px-4 py-1.5 rounded-full text-gray-400 text-xs">
            WASD/Setas: Mover • Espaço: Chute • P: Passe • ⚡ Mercy: {MERCY_GOAL_LIMIT} gols
          </div>
        </div>
      )}
    </div>
  );
}
