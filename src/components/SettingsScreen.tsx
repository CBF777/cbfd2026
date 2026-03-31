import { useState, useRef, useCallback } from 'react';
import { useGameStore } from '../store/gameStore';
import { isMobileDevice } from '../utils/device';

interface DragItem {
  id: string;
  label: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

export default function SettingsScreen() {
  const { setScreen, hudPositions, saveHudPositions } = useGameStore();
  const [editingHud, setEditingHud] = useState(false);
  const isMobile = isMobileDevice();
  
  const defaultItems: DragItem[] = [
    { id: 'joystick', label: 'Direcional', x: hudPositions.joystick?.x ?? 20, y: hudPositions.joystick?.y ?? 60, w: 140, h: 140 },
    { id: 'kick', label: 'Chute', x: hudPositions.kick?.x ?? 80, y: hudPositions.kick?.y ?? 55, w: 64, h: 64 },
    { id: 'pass', label: 'Passe', x: hudPositions.pass?.x ?? 80, y: hudPositions.pass?.y ?? 75, w: 56, h: 56 },
  ];
  
  const [items, setItems] = useState(defaultItems);
  const draggingRef = useRef<{ id: string; offX: number; offY: number } | null>(null);
  
  const handleTouchStart = useCallback((id: string, e: React.TouchEvent) => {
    const touch = e.touches[0];
    const item = items.find(i => i.id === id);
    if (!item) return;
    
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    draggingRef.current = {
      id,
      offX: touch.clientX - rect.left,
      offY: touch.clientY - rect.top,
    };
  }, [items]);
  
  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!draggingRef.current) return;
    e.preventDefault();
    const touch = e.touches[0];
    const container = (e.currentTarget as HTMLElement).getBoundingClientRect();
    
    const x = ((touch.clientX - container.left - draggingRef.current.offX) / container.width) * 100;
    const y = ((touch.clientY - container.top - draggingRef.current.offY) / container.height) * 100;
    
    setItems(prev => prev.map(item => 
      item.id === draggingRef.current?.id 
        ? { ...item, x: Math.max(0, Math.min(90, x)), y: Math.max(0, Math.min(90, y)) }
        : item
    ));
  }, []);
  
  const handleTouchEnd = useCallback(() => {
    draggingRef.current = null;
  }, []);
  
  const handleSaveHud = () => {
    const positions: { [key: string]: { x: number; y: number } } = {};
    items.forEach(item => {
      positions[item.id] = { x: item.x, y: item.y };
    });
    saveHudPositions(positions);
    setEditingHud(false);
  };
  
  const handleResetHud = () => {
    setItems([
      { id: 'joystick', label: 'Direcional', x: 20, y: 60, w: 140, h: 140 },
      { id: 'kick', label: 'Chute', x: 80, y: 55, w: 64, h: 64 },
      { id: 'pass', label: 'Passe', x: 80, y: 75, w: 56, h: 56 },
    ]);
  };
  
  return (
    <div className="fixed inset-0 bg-gradient-to-b from-[#0d1f0a] via-[#111e0d] to-[#0a0f08] flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#1a3a12] via-[#1e4516] to-[#1a3a12] px-4 py-3 shadow-lg border-b border-emerald-800/30 flex items-center justify-between">
        <button
          onClick={() => setScreen('profile')}
          className="text-gray-400 hover:text-white text-sm px-2 py-1 bg-[#0d1f0a] rounded-lg"
        >
          ← Voltar
        </button>
        <h1 className="text-white text-lg font-bold">⚙️ Configurações</h1>
        <div className="w-16" />
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Controls Info */}
        <div className="bg-[#1a2e15]/60 border border-emerald-800/25 rounded-2xl p-5">
          <h3 className="text-white font-bold text-base mb-3">🎮 Controles</h3>
          
          <div className="space-y-3">
            <div className="bg-[#0d1f0a]/60 rounded-xl p-3">
              <div className="text-emerald-400 text-sm font-bold mb-1">PC / Desktop</div>
              <div className="text-gray-400 text-xs space-y-1">
                <div>• <strong className="text-gray-300">WASD</strong> ou <strong className="text-gray-300">Setas</strong> → Mover</div>
                <div>• <strong className="text-gray-300">Espaço</strong> → Chute</div>
                <div>• <strong className="text-gray-300">P</strong> → Passe</div>
              </div>
            </div>
            
            <div className="bg-[#0d1f0a]/60 rounded-xl p-3">
              <div className="text-emerald-400 text-sm font-bold mb-1">Mobile / Celular</div>
              <div className="text-gray-400 text-xs space-y-1">
                <div>• Joystick virtual (esquerda) → Mover</div>
                <div>• Botão CHUTE (direita, cima)</div>
                <div>• Botão PASSE (direita, baixo)</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* HUD Editor (mobile only) */}
        {isMobile && (
          <div className="bg-[#1a2e15]/60 border border-emerald-800/25 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-white font-bold text-base">📐 Editar HUD</h3>
              <button
                onClick={() => setEditingHud(!editingHud)}
                className="text-emerald-400 text-sm bg-emerald-900/40 px-3 py-1 rounded-lg font-bold"
              >
                {editingHud ? 'Fechar' : 'Editar'}
              </button>
            </div>
            
            <p className="text-gray-500 text-xs mb-3">
              Arraste os botões para reposicionar os controles na tela do jogo.
            </p>
            
            {editingHud && (
              <>
                <div 
                  className="relative w-full aspect-video bg-[#1a7a3a]/30 rounded-xl border-2 border-emerald-700/30 overflow-hidden"
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
                >
                  {/* Simulated field */}
                  <div className="absolute inset-0 opacity-20">
                    <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-white/30" />
                    <div className="absolute left-1/2 top-1/2 w-12 h-12 -ml-6 -mt-6 rounded-full border border-white/30" />
                  </div>
                  
                  {items.map(item => (
                    <div
                      key={item.id}
                      onTouchStart={(e) => handleTouchStart(item.id, e)}
                      className="absolute cursor-move touch-none"
                      style={{
                        left: `${item.x}%`,
                        top: `${item.y}%`,
                        width: item.w / 2,
                        height: item.h / 2,
                      }}
                    >
                      <div className="w-full h-full rounded-full bg-white/20 border-2 border-white/40 flex items-center justify-center">
                        <span className="text-white text-[8px] font-bold">{item.label}</span>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={handleSaveHud}
                    className="flex-1 py-2 bg-emerald-700 text-white font-bold rounded-xl text-sm active:scale-95"
                  >
                    Salvar
                  </button>
                  <button
                    onClick={handleResetHud}
                    className="flex-1 py-2 bg-[#0d1f0a] border border-emerald-800/30 text-gray-300 font-bold rounded-xl text-sm active:scale-95"
                  >
                    Resetar
                  </button>
                </div>
              </>
            )}
          </div>
        )}
        
        {/* Info */}
        <div className="bg-[#1a2e15]/20 border border-emerald-800/15 rounded-xl p-4">
          <div className="text-amber-500 text-xs font-bold uppercase mb-1">ℹ️ Detecção automática</div>
          <p className="text-gray-500 text-xs">
            O CBFD 26 detecta automaticamente se você está no PC ou Mobile. 
            No PC, os botões virtuais são ocultados. No Mobile, os controles de teclado ficam inativos.
          </p>
        </div>
      </div>
    </div>
  );
}
