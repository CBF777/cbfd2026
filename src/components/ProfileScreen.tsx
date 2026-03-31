import { useEffect } from 'react';
import { useGameStore } from '../store/gameStore';
import { BottomNav } from './HomeScreen';

export default function ProfileScreen() {
  const { currentPlayer, logout, matchHistory, loadMatchHistory, refreshCurrentPlayer, setScreen } = useGameStore();
  
  useEffect(() => {
    refreshCurrentPlayer();
    loadMatchHistory();
  }, [refreshCurrentPlayer, loadMatchHistory]);
  
  if (!currentPlayer) return null;
  
  const xpForNext = currentPlayer.level * 100;
  const xpPercent = Math.min((currentPlayer.xp / xpForNext) * 100, 100);
  const winRate = currentPlayer.matches > 0 
    ? Math.round((currentPlayer.wins / currentPlayer.matches) * 100) 
    : 0;
  
  const recentMatches = matchHistory
    .filter(m => m.player1Id === currentPlayer.id || m.player2Id === currentPlayer.id)
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, 5);
  
  return (
    <div className="fixed inset-0 bg-gradient-to-b from-[#0d1f0a] via-[#111e0d] to-[#0a0f08] flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#1a3a12] via-[#1e4516] to-[#1a3a12] px-4 py-3 shadow-lg border-b border-emerald-800/30 flex items-center justify-between">
        <h1 className="text-white text-lg font-bold">Meu Perfil</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setScreen('settings')}
            className="text-gray-400 text-sm hover:text-white transition-colors px-2 py-1 bg-[#0d1f0a] rounded-lg"
          >
            ⚙️
          </button>
          <button
            onClick={logout}
            className="text-red-400 text-sm hover:text-red-300 transition-colors"
          >
            Sair
          </button>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Profile Card */}
        <div className="bg-gradient-to-br from-[#1a3a12]/50 to-[#0d1f0a]/80 border border-emerald-800/25 rounded-2xl p-5">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-600 to-emerald-800 border-2 border-amber-500/50 flex items-center justify-center">
              <span className="text-2xl">⚽</span>
            </div>
            <div>
              <h2 className="text-white text-xl font-bold">{currentPlayer.name}</h2>
              <div className="text-amber-400 text-sm font-medium">"{currentPlayer.nickname}"</div>
              <div className="text-gray-500 text-xs mt-0.5">{currentPlayer.position}</div>
            </div>
          </div>
          
          {/* Level & XP */}
          <div className="bg-[#0d1f0a]/60 rounded-xl p-3">
            <div className="flex justify-between items-center mb-1">
              <span className="text-amber-400 font-bold text-sm">Nível {currentPlayer.level}</span>
              <span className="text-gray-500 text-xs">{currentPlayer.xp}/{xpForNext} XP</span>
            </div>
            <div className="w-full h-2.5 bg-[#0a1508] rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full transition-all"
                style={{ width: `${xpPercent}%` }}
              />
            </div>
          </div>
        </div>
        
        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <StatCard label="Partidas" value={currentPlayer.matches} color="text-blue-400" />
          <StatCard label="Vitórias" value={currentPlayer.wins} color="text-emerald-400" />
          <StatCard label="Derrotas" value={currentPlayer.losses} color="text-red-400" />
          <StatCard label="Empates" value={currentPlayer.draws} color="text-gray-400" />
          <StatCard label="Gols" value={currentPlayer.goals} color="text-amber-400" />
          <StatCard label="Win Rate" value={`${winRate}%`} color="text-purple-400" />
          <StatCard label="MVPs" value={currentPlayer.mvpCount} color="text-orange-400" />
          <StatCard label="Nível" value={currentPlayer.level} color="text-cyan-400" />
        </div>
        
        {/* Recent Matches */}
        {recentMatches.length > 0 && (
          <div className="bg-[#1a2e15]/40 border border-emerald-800/20 rounded-xl p-4">
            <h3 className="text-white font-bold text-sm mb-3">Partidas Recentes</h3>
            <div className="space-y-2">
              {recentMatches.map(match => {
                const isP1 = match.player1Id === currentPlayer.id;
                const myScore = isP1 ? match.score1 : match.score2;
                const opScore = isP1 ? match.score2 : match.score1;
                const opName = isP1 ? match.player2Name : match.player1Name;
                const won = myScore > opScore;
                const draw = myScore === opScore;
                
                return (
                  <div key={match.id} className="flex items-center justify-between bg-[#0d1f0a]/60 rounded-lg px-3 py-2">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                        won ? 'bg-emerald-900/50 text-emerald-400' : 
                        draw ? 'bg-amber-900/50 text-amber-400' : 
                        'bg-red-900/50 text-red-400'
                      }`}>
                        {won ? 'V' : draw ? 'E' : 'D'}
                      </span>
                      <span className="text-gray-300 text-sm">vs {opName}</span>
                    </div>
                    <span className="text-white font-bold text-sm">{myScore} - {opScore}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
      
      <BottomNav />
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: string | number; color: string }) {
  return (
    <div className="bg-[#1a2e15]/50 border border-emerald-800/15 rounded-xl p-3 text-center">
      <div className={`${color} text-xl font-black`}>{value}</div>
      <div className="text-gray-500 text-xs">{label}</div>
    </div>
  );
}
