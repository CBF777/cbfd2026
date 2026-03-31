import { useState, useEffect } from 'react';
import { useGameStore } from '../store/gameStore';
import { BottomNav } from './HomeScreen';

type PlayMode = 'menu' | 'searching';

export default function PlayScreen() {
  const { setScreen, setGameMode, setCameFromRoom, currentPlayer, onlineCount, loadOnlineCount } = useGameStore();
  const [mode, setMode] = useState<PlayMode>('menu');
  const [searchTime, setSearchTime] = useState(0);
  
  useEffect(() => {
    loadOnlineCount();
  }, [loadOnlineCount]);
  
  useEffect(() => {
    let interval: number | undefined;
    if (mode === 'searching') {
      interval = window.setInterval(() => {
        setSearchTime(t => t + 1);
      }, 1000);
    }
    return () => { if (interval) clearInterval(interval); };
  }, [mode]);
  
  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  const handlePlayCPU = () => {
    setGameMode('cpu');
    setCameFromRoom(false);
    setScreen('game');
  };
  
  const handleSearchOnline = () => {
    setMode('searching');
    setSearchTime(0);
  };
  
  const handleCancelSearch = () => {
    setMode('menu');
    setSearchTime(0);
  };
  
  if (!currentPlayer) return null;
  
  // ─── Online Lobby ───
  if (mode === 'searching') {
    return (
      <div className="fixed inset-0 bg-gradient-to-b from-[#0d1f0a] via-[#111e0d] to-[#0a0f08] flex flex-col">
        <div className="bg-gradient-to-r from-[#1a3a12] via-[#1e4516] to-[#1a3a12] px-4 py-3 shadow-lg border-b border-emerald-800/30">
          <h1 className="text-white text-lg font-bold text-center">Multijogador Online</h1>
        </div>
        
        <div className="flex-1 flex flex-col items-center justify-center p-6 gap-6">
          <div className="relative">
            <div className="w-28 h-28 rounded-full border-4 border-emerald-600/30 border-t-emerald-500 animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-4xl">⚽</span>
            </div>
          </div>
          
          <div className="text-center">
            <h2 className="text-white text-2xl font-black mb-2">Buscando adversário real...</h2>
            <p className="text-gray-500 text-sm">Aguardando outro jogador entrar na fila</p>
            <div className="text-amber-400 text-3xl font-mono mt-4">{formatTime(searchTime)}</div>
          </div>
          
          <div className="bg-[#1a2e15]/60 border border-emerald-800/30 rounded-xl px-5 py-3 flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-emerald-400 font-medium text-sm">{onlineCount} jogadores registrados</span>
          </div>
          
          <div className="bg-amber-900/15 border border-amber-700/20 rounded-xl p-4 w-full max-w-sm">
            <div className="text-amber-500 text-xs font-bold uppercase mb-1">ℹ️ Modo Online</div>
            <p className="text-amber-600/60 text-xs">
              O matchmaking conectará você a um adversário real assim que outro jogador entrar na fila.
            </p>
          </div>
          
          <button
            onClick={handleCancelSearch}
            className="w-full max-w-sm py-4 bg-[#1a2e15] border border-emerald-800/30 text-gray-300 font-bold text-lg rounded-2xl hover:bg-[#1e3a18] active:scale-95 transition-all"
          >
            ✕ CANCELAR BUSCA
          </button>
        </div>
      </div>
    );
  }
  
  // ─── Mode Selection ───
  return (
    <div className="fixed inset-0 bg-gradient-to-b from-[#0d1f0a] via-[#111e0d] to-[#0a0f08] flex flex-col">
      <div className="bg-gradient-to-r from-[#1a3a12] via-[#1e4516] to-[#1a3a12] px-4 py-3 shadow-lg border-b border-emerald-800/30">
        <h1 className="text-white text-lg font-bold text-center">Escolha o Modo</h1>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-5 items-center justify-center">
        <div className="text-center mb-2">
          <div className="text-4xl mb-2">⚽</div>
          <h2 className="text-white text-xl font-black">Partida Rápida 1v1</h2>
          <p className="text-gray-500 text-sm mt-1">3 minutos • Campo reduzido • ⚡ Mercy: 3 gols</p>
        </div>
        
        <div className="grid grid-cols-2 gap-4 w-full max-w-md">
          {/* CPU */}
          <button
            onClick={handlePlayCPU}
            className="relative bg-gradient-to-br from-[#1a2e15] to-[#0d1f0a] border-2 border-emerald-700/40 rounded-2xl p-5 flex flex-col items-center gap-3 hover:border-emerald-600/60 active:scale-95 transition-all group"
          >
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gray-600 to-gray-800 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
              🤖
            </div>
            <div>
              <div className="text-white font-black text-sm text-center">CONTRA CPU</div>
              <div className="text-gray-500 text-xs text-center mt-1">(Treino)</div>
            </div>
            <div className="absolute top-2 right-2 bg-[#0d1f0a] rounded-full px-2 py-0.5">
              <span className="text-gray-500 text-[10px] font-bold">OFFLINE</span>
            </div>
          </button>
          
          {/* Online */}
          <button
            onClick={handleSearchOnline}
            className="relative bg-gradient-to-br from-emerald-900/60 to-[#0d1f0a] border-2 border-emerald-600/50 rounded-2xl p-5 flex flex-col items-center gap-3 hover:border-emerald-500/70 active:scale-95 transition-all group"
          >
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-600 to-emerald-900 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
              🌐
            </div>
            <div>
              <div className="text-white font-black text-sm text-center">MULTIJOGADOR</div>
              <div className="text-emerald-400 text-xs text-center mt-1">(1v1 Real)</div>
            </div>
            <div className="absolute top-2 right-2 bg-emerald-900/60 rounded-full px-2 py-0.5 flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-emerald-400 text-[10px] font-bold">ONLINE</span>
            </div>
          </button>
        </div>
        
        <div className="bg-[#1a2e15]/40 border border-emerald-800/20 rounded-xl px-5 py-3 flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-emerald-400 font-medium text-sm">{onlineCount} jogadores registrados</span>
        </div>
        
        <div className="bg-[#1a2e15]/30 border border-emerald-800/15 rounded-xl p-4 w-full max-w-md">
          <div className="text-amber-500 text-xs font-bold uppercase mb-1">💡 Controles</div>
          <p className="text-gray-500 text-xs">
            <strong className="text-gray-400">PC:</strong> WASD ou Setas para mover • Espaço = Chute • P = Passe
            {' '}
            <strong className="text-gray-400">Mobile:</strong> Joystick + Botões na tela
          </p>
        </div>
      </div>
      
      <BottomNav />
    </div>
  );
}
