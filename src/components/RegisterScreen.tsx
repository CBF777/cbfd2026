import { useState } from 'react';
import { useGameStore } from '../store/gameStore';

const POSITIONS = ['Goleiro', 'Zagueiro', 'Lateral', 'Volante', 'Meia', 'Atacante', 'Ponta'];

export default function RegisterScreen() {
  const { register, setScreen, isLoading, authError, setAuthError } = useGameStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [nickname, setNickname] = useState('');
  const [position, setPosition] = useState('Atacante');
  
  const handleRegister = async () => {
    if (!email || !password || !name || !nickname) {
      setAuthError('Preencha todos os campos');
      return;
    }
    if (password.length < 6) {
      setAuthError('Senha deve ter pelo menos 6 caracteres');
      return;
    }
    await register(email, password, name, nickname, position);
  };
  
  return (
    <div className="fixed inset-0 bg-gradient-to-b from-[#0d1f0a] via-[#0f2610] to-[#0a0f08] flex flex-col items-center justify-center p-6 overflow-y-auto">
      <div className="w-full max-w-sm py-8">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 relative flex items-center justify-center">
            <div className="absolute inset-0 rounded-2xl rotate-45 bg-gradient-to-br from-[#1a3a12] to-[#0d1f0a] border-2 border-emerald-500/40" />
            <div className="absolute inset-1 rounded-2xl rotate-45 bg-gradient-to-br from-[#234d18] to-[#152e0e]" />
            <div className="relative z-10 text-center">
              <div className="text-emerald-400 font-black text-base tracking-wider">CBFD</div>
              <div className="text-amber-400 font-black text-lg">26</div>
            </div>
          </div>
        </div>
        
        <h2 className="text-white text-2xl font-bold text-center mb-4">Criar Conta</h2>
        
        {authError && (
          <div className="bg-red-900/40 border border-red-500/50 text-red-300 text-sm px-4 py-2 rounded-xl mb-4 text-center">
            {authError}
          </div>
        )}
        
        <div className="space-y-3">
          <input
            type="text"
            placeholder="Nome do Atleta"
            value={name}
            onChange={e => { setName(e.target.value); setAuthError(''); }}
            className="w-full px-4 py-3 bg-[#1a2e15]/80 border border-emerald-900/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/60 text-base"
          />
          <input
            type="text"
            placeholder="Apelido"
            value={nickname}
            onChange={e => { setNickname(e.target.value); setAuthError(''); }}
            className="w-full px-4 py-3 bg-[#1a2e15]/80 border border-emerald-900/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/60 text-base"
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => { setEmail(e.target.value); setAuthError(''); }}
            className="w-full px-4 py-3 bg-[#1a2e15]/80 border border-emerald-900/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/60 text-base"
          />
          <input
            type="password"
            placeholder="Senha (mínimo 6 caracteres)"
            value={password}
            onChange={e => { setPassword(e.target.value); setAuthError(''); }}
            className="w-full px-4 py-3 bg-[#1a2e15]/80 border border-emerald-900/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/60 text-base"
          />
          
          <div>
            <label className="text-gray-400 text-sm mb-1 block">Posição</label>
            <div className="flex flex-wrap gap-2">
              {POSITIONS.map(pos => (
                <button
                  key={pos}
                  onClick={() => setPosition(pos)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    position === pos
                      ? 'bg-emerald-600 text-white border border-emerald-500'
                      : 'bg-[#1a2e15] text-gray-400 border border-emerald-900/40 hover:border-emerald-700/50'
                  }`}
                >
                  {pos}
                </button>
              ))}
            </div>
          </div>
          
          <button
            onClick={handleRegister}
            disabled={isLoading}
            className="w-full py-3.5 bg-gradient-to-r from-emerald-700 to-emerald-600 text-white font-bold rounded-xl hover:from-emerald-600 hover:to-emerald-500 active:scale-95 transition-all text-lg shadow-lg shadow-emerald-900/40 mt-2 disabled:opacity-50"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Criando conta...
              </span>
            ) : 'CADASTRAR'}
          </button>
        </div>
        
        <div className="mt-4 text-center">
          <button
            onClick={() => { setScreen('login'); setAuthError(''); }}
            className="text-emerald-400 hover:text-emerald-300 text-sm font-medium"
          >
            Já tem conta? <span className="underline">Entrar</span>
          </button>
        </div>
      </div>
    </div>
  );
}
