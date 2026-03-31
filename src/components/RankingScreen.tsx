import { useEffect, useState } from 'react';
import { useGameStore, type Player } from '../store/gameStore';
import { BottomNav } from './HomeScreen';

export default function RankingScreen() {
  const { rankingPlayers, currentPlayer, loadRanking } = useGameStore();
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    setLoading(true);
    loadRanking().finally(() => setLoading(false));
  }, [loadRanking]);
  
  return (
    <div className="fixed inset-0 bg-gradient-to-b from-[#0d1f0a] via-[#111e0d] to-[#0a0f08] flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#1a3a12] via-[#1e4516] to-[#1a3a12] px-4 py-3 shadow-lg border-b border-emerald-800/30 flex items-center justify-between">
        <h1 className="text-white text-lg font-bold flex-1 text-center">🏆 Ranking Global</h1>
        <button
          onClick={() => { setLoading(true); loadRanking().finally(() => setLoading(false)); }}
          className="text-amber-400 text-xs bg-amber-900/20 px-2 py-1 rounded hover:bg-amber-900/40 transition-colors"
        >
          ↻ Atualizar
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4">
        {loading ? (
          <div className="text-center py-12">
            <div className="w-10 h-10 border-3 border-emerald-600/30 border-t-emerald-500 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-500">Carregando ranking...</p>
          </div>
        ) : rankingPlayers.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-3">🏆</div>
            <p className="text-gray-400">Nenhum jogador registrado ainda</p>
            <p className="text-gray-600 text-sm mt-1">Seja o primeiro a jogar!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {rankingPlayers.map((player: Player, index: number) => {
              const isMe = player.id === currentPlayer?.id;
              const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : null;
              
              return (
                <div
                  key={player.id}
                  className={`flex items-center gap-3 rounded-xl p-3 transition-all ${
                    isMe
                      ? 'bg-emerald-900/20 border border-emerald-700/30'
                      : 'bg-[#1a2e15]/40 border border-emerald-800/10'
                  }`}
                >
                  <div className="w-10 h-10 rounded-full flex items-center justify-center font-black text-sm shrink-0" style={{
                    background: index === 0 ? 'linear-gradient(135deg, #fbbf24, #f59e0b)' :
                               index === 1 ? 'linear-gradient(135deg, #94a3b8, #64748b)' :
                               index === 2 ? 'linear-gradient(135deg, #d97706, #b45309)' :
                               'rgba(26, 46, 21, 0.8)',
                    color: index < 3 ? '#000' : '#9ca3af',
                  }}>
                    {medal || `${index + 1}º`}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-white font-bold text-sm truncate">
                        {player.nickname}
                      </span>
                      {isMe && (
                        <span className="text-emerald-400 text-xs bg-emerald-900/30 px-1.5 py-0.5 rounded">VOCÊ</span>
                      )}
                    </div>
                    <div className="text-gray-500 text-xs">
                      Nv. {player.level} • {player.position}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 text-right shrink-0">
                    <div>
                      <div className="text-emerald-400 text-sm font-bold">{player.wins}V</div>
                      <div className="text-gray-500 text-xs">{player.matches}P</div>
                    </div>
                    <div>
                      <div className="text-amber-400 text-sm font-bold">{player.goals}</div>
                      <div className="text-gray-500 text-xs">gols</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      
      <BottomNav />
    </div>
  );
}
