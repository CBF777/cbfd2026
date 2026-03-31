import { useState } from 'react';
import { useGameStore } from '../store/gameStore';

export default function LoginScreen() {
  const { login, setScreen, isLoading, authError, setAuthError } = useGameStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const handleLogin = async () => {
    if (!email || !password) {
      setAuthError('Preencha todos os campos');
      return;
    }
    await login(email, password);
  };
  
  return (
    <div className="fixed inset-0 bg-gradient-to-b from-[#0d1f0a] via-[#0f2610] to-[#0a0f08] flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="w-24 h-24 relative flex items-center justify-center">
            <div className="absolute inset-0 rounded-2xl rotate-45 bg-gradient-to-br from-[#1a3a12] to-[#0d1f0a] border-2 border-emerald-500/40 shadow-xl" />
            <div className="absolute inset-1 rounded-2xl rotate-45 bg-gradient-to-br from-[#234d18] to-[#152e0e]" />
            <div className="relative z-10 text-center">
              <div className="text-emerald-400 font-black text-lg tracking-wider">CBFD</div>
              <div className="text-amber-400 font-black text-xl">26</div>
            </div>
          </div>
        </div>
        
        <h2 className="text-white text-2xl font-bold text-center mb-6">Entrar</h2>
        
        {authError && (
          <div className="bg-red-900/40 border border-red-500/50 text-red-300 text-sm px-4 py-2 rounded-xl mb-4 text-center">
            {authError}
          </div>
        )}
        
        <div className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => { setEmail(e.target.value); setAuthError(''); }}
            className="w-full px-4 py-3 bg-[#1a2e15]/80 border border-emerald-900/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/60 text-base"
          />
          <input
            type="password"
            placeholder="Senha"
            value={password}
            onChange={e => { setPassword(e.target.value); setAuthError(''); }}
            onKeyDown={e => { if (e.key === 'Enter') handleLogin(); }}
            className="w-full px-4 py-3 bg-[#1a2e15]/80 border border-emerald-900/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/60 text-base"
          />
          
          <button
            onClick={handleLogin}
            disabled={isLoading}
            className="w-full py-3.5 bg-gradient-to-r from-emerald-700 to-emerald-600 text-white font-bold rounded-xl hover:from-emerald-600 hover:to-emerald-500 active:scale-95 transition-all text-lg shadow-lg shadow-emerald-900/40 disabled:opacity-50"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Entrando...
              </span>
            ) : 'ENTRAR'}
          </button>
        </div>
        
        <div className="mt-6 text-center">
          <button
            onClick={() => { setScreen('register'); setAuthError(''); }}
            className="text-emerald-400 hover:text-emerald-300 text-sm font-medium"
          >
            Não tem conta? <span className="underline">Cadastre-se</span>
          </button>
        </div>
      </div>
    </div>
  );
}
