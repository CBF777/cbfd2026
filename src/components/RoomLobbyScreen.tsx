import { useGameStore } from '../store/gameStore';

export default function RoomLobbyScreen() {
  const { currentRoom, currentPlayer, leaveRoom, kickPlayer, closeRoom, gameMode, setScreen, setGameMode, setCameFromRoom } = useGameStore();
  
  if (!currentRoom || !currentPlayer) return null;
  
  const isSpectator = gameMode === 'spectator';
  const isHost = currentRoom.hostId === currentPlayer.id;
  
  const teamA = currentRoom.players.filter(p => p.team === 'A');
  const teamB = currentRoom.players.filter(p => p.team === 'B');
  const spectators = currentRoom.spectators;
  const isFull = currentRoom.players.length >= currentRoom.maxPlayers;
  
  const handleStartGame = () => {
    setGameMode('custom');
    setCameFromRoom(true);
    setScreen('game');
  };
  
  return (
    <div className="fixed inset-0 bg-gradient-to-b from-[#0d1f0a] via-[#111e0d] to-[#0a0f08] flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#1a3a12] via-[#1e4516] to-[#1a3a12] px-4 py-3 shadow-lg border-b border-emerald-800/30 flex items-center justify-between">
        <button
          onClick={leaveRoom}
          className="text-gray-400 hover:text-white text-sm px-2 py-1 bg-[#0d1f0a] rounded-lg"
        >
          ← Voltar
        </button>
        <div className="flex items-center gap-2">
          {currentRoom.password && <span className="text-amber-400">🔒</span>}
          <h1 className="text-white text-lg font-bold">{currentRoom.name}</h1>
        </div>
        <div className={`px-2.5 py-1 rounded-full text-xs font-bold ${
          isSpectator ? 'bg-blue-900/40 text-blue-400' : 'bg-emerald-900/40 text-emerald-400'
        }`}>
          {isSpectator ? '👁️ Espectador' : '⚽ Jogador'}
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
        {/* ─── Teams Section ─── */}
        <div className="flex gap-3">
          {/* Team A */}
          <div className="flex-1 bg-[#1a2e15]/60 border border-emerald-700/30 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 rounded bg-emerald-600 flex items-center justify-center">
                <span className="text-white font-black text-xs">A</span>
              </div>
              <h3 className="text-emerald-400 text-sm font-bold uppercase tracking-wider">Time A</h3>
            </div>
            
            <div className="space-y-2">
              {teamA.map(p => (
                <div key={p.id} className="flex items-center gap-2 bg-[#0d1f0a]/60 rounded-xl p-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-700 flex items-center justify-center shrink-0">
                    <span className="text-white font-bold text-xs">
                      {p.nickname.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-white font-bold text-sm truncate">{p.nickname}</div>
                    {p.isHost && <div className="text-amber-400 text-[10px]">👑 Anfitrião</div>}
                  </div>
                  <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                  {isHost && !p.isHost && (
                    <button
                      onClick={() => kickPlayer(p.id)}
                      className="text-red-400 text-xs px-1.5 py-0.5 bg-red-900/20 rounded hover:bg-red-900/40 transition-colors shrink-0"
                      title="Expulsar"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
              {teamA.length === 0 && (
                <div className="text-center py-4 text-gray-600 text-sm border border-dashed border-emerald-800/20 rounded-xl">
                  Vazio
                </div>
              )}
            </div>
          </div>
          
          {/* VS Divider */}
          <div className="flex items-center">
            <div className="bg-amber-600/20 border border-amber-600/30 rounded-full w-10 h-10 flex items-center justify-center">
              <span className="text-amber-400 font-black text-sm">VS</span>
            </div>
          </div>
          
          {/* Team B */}
          <div className="flex-1 bg-[#1a2e15]/60 border border-blue-700/30 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 rounded bg-blue-600 flex items-center justify-center">
                <span className="text-white font-black text-xs">B</span>
              </div>
              <h3 className="text-blue-400 text-sm font-bold uppercase tracking-wider">Time B</h3>
            </div>
            
            <div className="space-y-2">
              {teamB.map(p => (
                <div key={p.id} className="flex items-center gap-2 bg-[#0d1f0a]/60 rounded-xl p-3">
                  <div className="w-8 h-8 rounded-full bg-blue-700 flex items-center justify-center shrink-0">
                    <span className="text-white font-bold text-xs">
                      {p.nickname.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-white font-bold text-sm truncate">{p.nickname}</div>
                  </div>
                  <div className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                  {isHost && (
                    <button
                      onClick={() => kickPlayer(p.id)}
                      className="text-red-400 text-xs px-1.5 py-0.5 bg-red-900/20 rounded hover:bg-red-900/40 transition-colors shrink-0"
                      title="Expulsar"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
              {teamB.length === 0 && (
                <div className="text-center py-4 border border-dashed border-blue-800/20 rounded-xl">
                  <div className="w-6 h-6 border-2 border-blue-700/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-2" />
                  <div className="text-gray-500 text-sm">Aguardando...</div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* ─── Spectators Section ─── */}
        <div className="bg-[#1a2e15]/30 border border-emerald-800/15 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg">👁️</span>
            <h3 className="text-gray-400 text-sm font-bold uppercase tracking-wider">Espectadores</h3>
            <span className="text-gray-600 text-xs">({spectators.length})</span>
          </div>
          
          {spectators.length === 0 ? (
            <p className="text-gray-600 text-xs text-center py-2">Nenhum espectador na sala</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {spectators.map(s => (
                <div key={s.id} className="flex items-center gap-1.5 bg-[#0d1f0a]/50 rounded-lg px-2.5 py-1.5">
                  <span className="text-gray-400 text-xs">👁️</span>
                  <span className="text-gray-300 text-xs font-medium">{s.nickname}</span>
                  {isHost && (
                    <button
                      onClick={() => kickPlayer(s.id)}
                      className="text-red-400/60 text-xs hover:text-red-400 ml-1"
                      title="Expulsar"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* ─── Room Info ─── */}
        <div className="bg-[#1a2e15]/20 border border-emerald-800/10 rounded-xl p-3">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>🏟️ Partida Personalizada</span>
            <span>{currentRoom.players.length}/{currentRoom.maxPlayers} jogadores</span>
          </div>
          {currentRoom.password && (
            <div className="flex items-center gap-1 mt-1 text-xs text-amber-500/60">
              <span>🔒</span>
              <span>Sala protegida com senha</span>
            </div>
          )}
        </div>
        
        {/* Spacer */}
        <div className="flex-1" />
        
        {/* ─── Actions ─── */}
        <div className="space-y-3 pb-2">
          {isHost && isFull && (
            <button
              onClick={handleStartGame}
              className="w-full py-4 bg-gradient-to-r from-emerald-700 to-emerald-500 text-white font-black text-lg rounded-2xl active:scale-95 transition-all shadow-xl shadow-emerald-900/40"
            >
              🏆 INICIAR PARTIDA
            </button>
          )}
          
          {isHost && !isFull && (
            <div className="w-full py-4 bg-[#1a2e15]/40 border border-emerald-800/20 text-gray-500 font-bold text-center text-sm rounded-2xl">
              ⏳ Aguardando jogador para iniciar...
            </div>
          )}
          
          {isHost && (
            <button
              onClick={closeRoom}
              className="w-full py-3 bg-red-900/20 border border-red-800/30 text-red-400 font-bold rounded-2xl active:scale-95 transition-all"
            >
              🗑️ FECHAR SALA
            </button>
          )}
          
          <button
            onClick={leaveRoom}
            className="w-full py-3 bg-[#1a2e15] border border-emerald-800/30 text-gray-300 font-bold rounded-2xl active:scale-95 transition-all"
          >
            SAIR DA SALA
          </button>
        </div>
      </div>
    </div>
  );
}
