import { useGameStore } from '../store/gameStore';

export default function MatchResultScreen() {
  const { lastMatchResult, currentPlayer, setScreen, mercyRule, cameFromRoom, setCameFromRoom } = useGameStore();
  
  if (!lastMatchResult || !currentPlayer) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <button onClick={() => setScreen('home')} className="text-white">Voltar</button>
      </div>
    );
  }
  
  const isP1 = lastMatchResult.player1Id === currentPlayer.id;
  const myScore = isP1 ? lastMatchResult.score1 : lastMatchResult.score2;
  const opScore = isP1 ? lastMatchResult.score2 : lastMatchResult.score1;
  const opName = isP1 ? lastMatchResult.player2Name : lastMatchResult.player1Name;
  const won = myScore > opScore;
  const draw = myScore === opScore;
  const isMvp = lastMatchResult.mvpId === currentPlayer.id;
  
  const handleBackToRoom = () => {
    setCameFromRoom(false);
    setScreen('roomLobby');
  };
  
  const handleBackToMenu = () => {
    setCameFromRoom(false);
    setScreen('home');
  };
  
  const handlePlayAgain = () => {
    setCameFromRoom(false);
    setScreen('play');
  };
  
  return (
    <div className="fixed inset-0 bg-gradient-to-b from-[#0d1f0a] via-[#111e0d] to-[#0a0f08] flex flex-col items-center justify-center p-6">
      {/* Result Badge */}
      <div className={`text-5xl mb-4 ${won ? 'animate-bounce' : ''}`}>
        {won ? '🏆' : draw ? '🤝' : '😤'}
      </div>
      
      <h1 className={`text-3xl font-black mb-1 ${
        won ? 'text-emerald-400' : draw ? 'text-amber-400' : 'text-red-400'
      }`}>
        {won ? 'VITÓRIA!' : draw ? 'EMPATE!' : 'DERROTA!'}
      </h1>
      
      {/* Mercy Rule Badge */}
      {mercyRule && (
        <div className="bg-amber-900/30 border border-amber-600/30 rounded-full px-4 py-1 mb-3">
          <span className="text-amber-400 text-xs font-bold">⚡ MERCY RULE — Encerramento antecipado</span>
        </div>
      )}
      
      {/* Score */}
      <div className="bg-[#1a2e15]/60 border border-emerald-800/25 rounded-2xl p-6 w-full max-w-sm mb-6">
        <div className="flex items-center justify-center gap-6">
          <div className="text-center">
            <div className="text-white font-bold text-sm mb-1 truncate max-w-[100px]">
              {currentPlayer.nickname}
            </div>
            <div className="text-white text-4xl font-black">{myScore}</div>
          </div>
          <div className="text-gray-600 text-2xl font-bold">×</div>
          <div className="text-center">
            <div className="text-gray-400 font-bold text-sm mb-1 truncate max-w-[100px]">
              {opName}
            </div>
            <div className="text-gray-400 text-4xl font-black">{opScore}</div>
          </div>
        </div>
      </div>
      
      {/* Súmula */}
      <div className="bg-[#1a2e15]/30 border border-emerald-800/15 rounded-xl p-4 w-full max-w-sm mb-6">
        <h3 className="text-amber-500 font-bold text-xs uppercase tracking-wider mb-3">📋 Súmula Digital</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Placar Final</span>
            <span className="text-white font-bold">{lastMatchResult.score1} - {lastMatchResult.score2}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">MVP da Partida</span>
            <span className="text-amber-400 font-bold">⭐ {lastMatchResult.mvpName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Resultado</span>
            <span className={`font-bold ${won ? 'text-emerald-400' : draw ? 'text-amber-400' : 'text-red-400'}`}>
              {won ? 'Vitória' : draw ? 'Empate' : 'Derrota'}
            </span>
          </div>
          {mercyRule && (
            <div className="flex justify-between">
              <span className="text-gray-500">Encerramento</span>
              <span className="text-amber-400 font-bold">⚡ Mercy Rule (3 gols)</span>
            </div>
          )}
          {isMvp && (
            <div className="text-center mt-2 py-2 bg-amber-900/15 border border-amber-700/20 rounded-lg">
              <span className="text-amber-400 text-sm font-bold">⭐ Você foi o MVP! ⭐</span>
            </div>
          )}
        </div>
      </div>
      
      {/* XP */}
      <div className="bg-[#1a2e15]/30 rounded-lg px-4 py-2 mb-6">
        <span className="text-amber-400 text-sm font-bold">
          +{myScore * 25 + (won ? 50 : draw ? 15 : 5) + (isMvp ? 30 : 0)} XP ganho
        </span>
      </div>
      
      {/* Actions */}
      <div className="w-full max-w-sm space-y-3">
        {/* Top row: Main actions */}
        <div className="flex gap-3">
          <button
            onClick={handlePlayAgain}
            className="flex-1 py-3 bg-gradient-to-r from-emerald-700 to-emerald-600 text-white font-bold rounded-xl active:scale-95 transition-all"
          >
            🔄 JOGAR NOVAMENTE
          </button>
          {cameFromRoom && (
            <button
              onClick={handleBackToRoom}
              className="flex-1 py-3 bg-gradient-to-r from-blue-700 to-blue-600 text-white font-bold rounded-xl active:scale-95 transition-all"
            >
              🏟️ VOLTAR À SALA
            </button>
          )}
        </div>
        
        {/* Back to menu */}
        <button
          onClick={handleBackToMenu}
          className="w-full py-3 bg-[#1a2e15] border border-emerald-800/30 text-gray-300 font-bold rounded-xl active:scale-95 transition-all"
        >
          🏠 SAIR PARA O MENU
        </button>
      </div>
    </div>
  );
}
