import { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { BottomNav } from './HomeScreen';

export default function CustomRoomsScreen() {
  const { customRooms, currentPlayer, createRoom, joinRoom } = useGameStore();
  const [showCreate, setShowCreate] = useState(false);
  const [roomName, setRoomName] = useState('');
  const [roomPassword, setRoomPassword] = useState('');
  
  // Password prompt state
  const [passwordPrompt, setPasswordPrompt] = useState<string | null>(null);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [joinAsSpectator, setJoinAsSpectator] = useState(false);
  
  if (!currentPlayer) return null;
  
  const handleCreate = () => {
    if (!roomName.trim()) return;
    createRoom(roomName.trim(), roomPassword.trim());
    setRoomName('');
    setRoomPassword('');
    setShowCreate(false);
  };
  
  const tryJoin = (roomId: string, asSpectator: boolean) => {
    const room = customRooms.find(r => r.id === roomId);
    if (!room) return;
    
    if (room.password) {
      setPasswordPrompt(roomId);
      setJoinAsSpectator(asSpectator);
      setPasswordInput('');
      setPasswordError('');
    } else {
      joinRoom(roomId, asSpectator);
    }
  };
  
  const handlePasswordSubmit = () => {
    if (!passwordPrompt) return;
    const room = customRooms.find(r => r.id === passwordPrompt);
    if (!room) return;
    
    if (passwordInput === room.password) {
      joinRoom(passwordPrompt, joinAsSpectator);
      setPasswordPrompt(null);
      setPasswordInput('');
    } else {
      setPasswordError('Senha incorreta');
    }
  };
  
  return (
    <div className="fixed inset-0 bg-gradient-to-b from-[#0d1f0a] via-[#111e0d] to-[#0a0f08] flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#1a3a12] via-[#1e4516] to-[#1a3a12] px-4 py-3 shadow-lg border-b border-emerald-800/30 flex items-center justify-between">
        <h1 className="text-white text-lg font-bold">🏟️ Partidas Personalizadas</h1>
        <button
          onClick={() => setShowCreate(true)}
          className="text-emerald-400 text-sm bg-emerald-900/40 px-3 py-1.5 rounded-lg hover:bg-emerald-900/60 transition-colors font-bold"
        >
          + Criar Sala
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4">
        {/* ─── Create Room Modal ─── */}
        {showCreate && (
          <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-6" onClick={() => setShowCreate(false)}>
            <div className="bg-gradient-to-b from-[#1a3a12] to-[#0d1f0a] border border-emerald-700/40 rounded-2xl p-6 w-full max-w-sm shadow-2xl" onClick={e => e.stopPropagation()}>
              <h3 className="text-white text-lg font-bold mb-4">Criar Nova Sala</h3>
              
              <input
                type="text"
                placeholder="Nome da sala"
                value={roomName}
                onChange={e => setRoomName(e.target.value)}
                maxLength={30}
                className="w-full px-4 py-3 bg-[#0d1f0a]/80 border border-emerald-800/40 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/60 text-base mb-3"
              />
              
              <div className="relative mb-4">
                <input
                  type="text"
                  placeholder="Senha (opcional)"
                  value={roomPassword}
                  onChange={e => setRoomPassword(e.target.value)}
                  maxLength={20}
                  className="w-full px-4 py-3 bg-[#0d1f0a]/80 border border-emerald-800/40 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/60 text-base pr-10"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                  {roomPassword ? '🔒' : '🔓'}
                </span>
              </div>
              
              {roomPassword && (
                <div className="bg-amber-900/20 border border-amber-700/20 rounded-lg px-3 py-2 mb-4">
                  <p className="text-amber-400 text-xs">🔒 Sala protegida — jogadores precisarão digitar a senha para entrar.</p>
                </div>
              )}
              
              <div className="flex gap-3">
                <button
                  onClick={handleCreate}
                  disabled={!roomName.trim()}
                  className="flex-1 py-3 bg-gradient-to-r from-emerald-700 to-emerald-600 text-white font-bold rounded-xl active:scale-95 transition-all disabled:opacity-40"
                >
                  CRIAR
                </button>
                <button
                  onClick={() => { setShowCreate(false); setRoomPassword(''); }}
                  className="flex-1 py-3 bg-[#1a2e15] border border-emerald-800/30 text-gray-300 font-bold rounded-xl active:scale-95 transition-all"
                >
                  CANCELAR
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* ─── Password Prompt Modal ─── */}
        {passwordPrompt && (
          <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-6" onClick={() => setPasswordPrompt(null)}>
            <div className="bg-gradient-to-b from-[#1a3a12] to-[#0d1f0a] border border-emerald-700/40 rounded-2xl p-6 w-full max-w-sm shadow-2xl" onClick={e => e.stopPropagation()}>
              <div className="text-center mb-4">
                <div className="text-4xl mb-2">🔒</div>
                <h3 className="text-white text-lg font-bold">Sala Protegida</h3>
                <p className="text-gray-400 text-sm mt-1">Digite a senha para entrar</p>
              </div>
              
              <input
                type="password"
                placeholder="Senha da sala"
                value={passwordInput}
                onChange={e => { setPasswordInput(e.target.value); setPasswordError(''); }}
                className="w-full px-4 py-3 bg-[#0d1f0a]/80 border border-emerald-800/40 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/60 text-base mb-2 text-center tracking-widest"
                autoFocus
              />
              
              {passwordError && (
                <p className="text-red-400 text-xs text-center mb-2">{passwordError}</p>
              )}
              
              <div className="flex gap-3 mt-3">
                <button
                  onClick={handlePasswordSubmit}
                  disabled={!passwordInput}
                  className="flex-1 py-3 bg-gradient-to-r from-emerald-700 to-emerald-600 text-white font-bold rounded-xl active:scale-95 transition-all disabled:opacity-40"
                >
                  ENTRAR
                </button>
                <button
                  onClick={() => setPasswordPrompt(null)}
                  className="flex-1 py-3 bg-[#1a2e15] border border-emerald-800/30 text-gray-300 font-bold rounded-xl active:scale-95 transition-all"
                >
                  CANCELAR
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* ─── Rooms List ─── */}
        {customRooms.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">🏟️</div>
            <h3 className="text-white text-lg font-bold mb-2">Nenhuma sala ativa</h3>
            <p className="text-gray-500 text-sm mb-6">Crie uma sala e convide amigos para jogar!</p>
            <button
              onClick={() => setShowCreate(true)}
              className="px-6 py-3 bg-gradient-to-r from-emerald-700 to-emerald-600 text-white font-bold rounded-xl active:scale-95 transition-all"
            >
              + CRIAR SALA
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {customRooms.map(room => (
              <div key={room.id} className="bg-[#1a2e15]/60 border border-emerald-800/25 rounded-2xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {room.password && (
                      <span className="text-amber-400 text-lg" title="Sala com senha">🔒</span>
                    )}
                    <div>
                      <h3 className="text-white font-bold text-base">{room.name}</h3>
                      <p className="text-gray-500 text-xs">Criada por {room.hostName}</p>
                    </div>
                  </div>
                  <div className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                    room.status === 'waiting' ? 'bg-amber-900/40 text-amber-400' :
                    room.status === 'playing' ? 'bg-emerald-900/40 text-emerald-400' :
                    'bg-gray-800 text-gray-400'
                  }`}>
                    {room.status === 'waiting' ? 'Aguardando' :
                     room.status === 'playing' ? 'Em jogo' : 'Finalizada'}
                  </div>
                </div>
                
                <div className="flex items-center gap-4 mb-3 text-xs text-gray-500">
                  <span>👤 {room.players.length}/{room.maxPlayers} jogadores</span>
                  <span>👁️ {room.spectators.length} espectadores</span>
                </div>
                
                <div className="flex gap-2">
                  {room.players.length < room.maxPlayers && room.status === 'waiting' && (
                    <button
                      onClick={() => tryJoin(room.id, false)}
                      className="flex-1 py-2.5 bg-gradient-to-r from-emerald-700 to-emerald-600 text-white font-bold text-sm rounded-xl active:scale-95 transition-all"
                    >
                      ⚽ Entrar como Jogador
                    </button>
                  )}
                  <button
                    onClick={() => tryJoin(room.id, true)}
                    className="flex-1 py-2.5 bg-[#0d1f0a] border border-emerald-800/30 text-gray-300 font-bold text-sm rounded-xl active:scale-95 transition-all"
                  >
                    👁️ Assistir
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Info */}
        <div className="mt-6 bg-[#1a2e15]/20 border border-emerald-800/15 rounded-xl p-4">
          <div className="text-amber-500 text-xs font-bold uppercase mb-1">💡 Sobre Salas</div>
          <p className="text-gray-500 text-xs">
            Crie salas personalizadas para desafiar amigos ou assistir partidas como espectador. 
            Adicione uma senha para tornar a sala privada. Ideal para campeonatos e torneios da CBFD.
          </p>
        </div>
      </div>
      
      <BottomNav />
    </div>
  );
}
