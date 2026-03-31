import { useEffect } from 'react';
import { useGameStore } from '../store/gameStore';

export default function HomeScreen() {
  const { currentPlayer, setScreen, onlineCount, loadOnlineCount } = useGameStore();
  
  useEffect(() => {
    loadOnlineCount();
    const interval = setInterval(loadOnlineCount, 30000);
    return () => clearInterval(interval);
  }, [loadOnlineCount]);
  
  if (!currentPlayer) return null;
  
  const xpForNext = currentPlayer.level * 100;
  const xpPercent = Math.min((currentPlayer.xp / xpForNext) * 100, 100);
  
  return (
    <div className="fixed inset-0 bg-gradient-to-b from-[#0d1f0a] via-[#111e0d] to-[#0a0f08] flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#1a3a12] via-[#1e4516] to-[#1a3a12] px-4 py-3 flex items-center justify-between shadow-lg border-b border-emerald-800/30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-800 border border-emerald-500/40 flex items-center justify-center shadow-md">
            <span className="text-amber-400 font-black text-xs">C26</span>
          </div>
          <div>
            <div className="text-white font-bold text-sm">{currentPlayer.nickname}</div>
            <div className="text-emerald-400 text-xs">Nível {currentPlayer.level}</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-24 h-2 bg-[#0d1f0a] rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full transition-all"
              style={{ width: `${xpPercent}%` }}
            />
          </div>
          <span className="text-amber-400 text-xs font-medium">{currentPlayer.xp}/{xpForNext}</span>
        </div>
      </div>
      
      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
        {/* Welcome */}
        <div className="bg-gradient-to-br from-[#1a3a12]/60 to-[#0d1f0a]/80 border border-emerald-800/30 rounded-2xl p-5">
          <h1 className="text-white text-xl font-bold mb-1">Bem-vindo, {currentPlayer.name}!</h1>
          <p className="text-emerald-500/60 text-sm">Pronto para a próxima partida?</p>
        </div>
        
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-[#1a2e15]/60 border border-emerald-800/20 rounded-xl p-3 text-center">
            <div className="text-emerald-400 text-xl font-black">{currentPlayer.wins}</div>
            <div className="text-gray-500 text-xs">Vitórias</div>
          </div>
          <div className="bg-[#1a2e15]/60 border border-emerald-800/20 rounded-xl p-3 text-center">
            <div className="text-amber-400 text-xl font-black">{currentPlayer.goals}</div>
            <div className="text-gray-500 text-xs">Gols</div>
          </div>
          <div className="bg-[#1a2e15]/60 border border-emerald-800/20 rounded-xl p-3 text-center">
            <div className="text-blue-400 text-xl font-black">{currentPlayer.matches}</div>
            <div className="text-gray-500 text-xs">Partidas</div>
          </div>
        </div>
        
        {/* Main Action Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setScreen('play')}
            className="py-5 bg-gradient-to-r from-emerald-700 to-emerald-600 text-white font-black text-base rounded-2xl active:scale-95 transition-all shadow-xl shadow-emerald-900/40 flex flex-col items-center gap-1"
          >
            <span className="text-2xl">⚽</span>
            <span>JOGAR</span>
          </button>
          <button
            onClick={() => setScreen('customRooms')}
            className="py-5 bg-gradient-to-r from-[#2a4a1e] to-[#1e3a14] text-white font-black text-base rounded-2xl active:scale-95 transition-all shadow-xl border border-emerald-700/30 flex flex-col items-center gap-1"
          >
            <span className="text-2xl">🏟️</span>
            <span>SALAS</span>
          </button>
        </div>
        
        {/* Community */}
        <div className="bg-[#1a2e15]/40 border border-emerald-800/20 rounded-xl p-4">
          <div className="text-emerald-600/60 text-xs uppercase tracking-wider mb-2">Comunidade</div>
          <div className="flex justify-between items-center">
            <div>
              <span className="text-white font-bold">{onlineCount}</span>
              <span className="text-gray-500 text-sm ml-1">jogadores registrados</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-emerald-400 text-xs font-medium">Online</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Bottom Nav */}
      <BottomNav />
    </div>
  );
}

export function BottomNav() {
  const { currentScreen, setScreen } = useGameStore();
  
  const tabs = [
    { id: 'home' as const, label: 'Início', icon: '🏠' },
    { id: 'play' as const, label: 'Jogar', icon: '⚽' },
    { id: 'customRooms' as const, label: 'Salas', icon: '🏟️' },
    { id: 'ranking' as const, label: 'Ranking', icon: '🏆' },
    { id: 'profile' as const, label: 'Perfil', icon: '👤' },
  ];
  
  return (
    <div className="bg-[#0a1508] border-t border-emerald-900/30 px-1 py-2 flex justify-around safe-area-bottom">
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => setScreen(tab.id)}
          className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all ${
            currentScreen === tab.id
              ? 'text-emerald-400 bg-emerald-500/10'
              : 'text-gray-600 hover:text-gray-400'
          }`}
        >
          <span className="text-lg">{tab.icon}</span>
          <span className="text-[10px] font-medium">{tab.label}</span>
        </button>
      ))}
    </div>
  );
}
