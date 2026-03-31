import { useEffect } from 'react';
import { useGameStore } from '../store/gameStore';

export default function SplashScreen() {
  const checkSession = useGameStore(s => s.checkSession);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      checkSession();
    }, 2500);
    return () => clearTimeout(timer);
  }, [checkSession]);
  
  return (
    <div className="fixed inset-0 bg-gradient-to-b from-[#0d1f0a] via-[#1a3a12] to-[#0a0f08] flex flex-col items-center justify-center overflow-hidden">
      {/* Grass texture overlay */}
      <div className="absolute inset-0 opacity-10" style={{
        backgroundImage: `repeating-linear-gradient(90deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px)`,
      }} />
      
      {/* Subtle grass stripes */}
      <div className="absolute inset-0 opacity-5">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="h-[10%]" style={{
            background: i % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent',
          }} />
        ))}
      </div>
      
      {/* Logo */}
      <div className="relative z-10">
        <div className="relative">
          {/* Outer glow */}
          <div className="absolute -inset-6 rounded-full bg-emerald-500/10 blur-2xl animate-pulse" />
          
          {/* Shield shape */}
          <div className="w-36 h-36 md:w-44 md:h-44 relative flex items-center justify-center">
            {/* Shield background */}
            <div className="absolute inset-0 rounded-2xl rotate-45 bg-gradient-to-br from-[#1a3a12] to-[#0d1f0a] border-2 border-emerald-500/40 shadow-2xl" />
            <div className="absolute inset-1 rounded-2xl rotate-45 bg-gradient-to-br from-[#234d18] to-[#152e0e] border border-emerald-600/20" />
            
            {/* Content */}
            <div className="relative z-10 text-center">
              <div className="text-emerald-400 font-black text-2xl md:text-3xl tracking-[0.15em]" style={{ fontFamily: "'Segoe UI', system-ui" }}>CBFD</div>
              <div className="h-0.5 w-12 mx-auto my-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent" />
              <div className="text-amber-400 font-black text-4xl md:text-5xl tracking-wider" style={{ textShadow: '0 0 20px rgba(251,191,36,0.3)' }}>26</div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="relative z-10 mt-8 text-emerald-500/60 text-xs font-medium tracking-[0.25em] uppercase text-center px-4">
        Confederação Brasileira de Futebol Digital
      </div>
      
      {/* Loading bar */}
      <div className="relative z-10 mt-10 w-52 h-1 bg-emerald-950/50 rounded-full overflow-hidden">
        <div className="h-full bg-gradient-to-r from-emerald-500 to-amber-400 rounded-full animate-loading-bar" />
      </div>
      
      <style>{`
        @keyframes loading-bar {
          0% { width: 0%; }
          100% { width: 100%; }
        }
        .animate-loading-bar {
          animation: loading-bar 2.2s ease-in-out forwards;
        }
      `}</style>
    </div>
  );
}
