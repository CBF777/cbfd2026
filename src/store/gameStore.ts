import { create } from 'zustand';
import {
  supabase,
  signUp,
  signIn,
  signOut,
  getSession,
  createPlayerProfile,
  getPlayerProfile,
  updatePlayerStats as updatePlayerStatsDb,
  createMatchRecord,
  getPlayerMatches,
  getGlobalRanking,
  getOnlinePlayersCount,
  type DbPlayer,
  type DbMatch,
} from '../lib/supabase';

export interface Player {
  id: string;
  email: string;
  name: string;
  nickname: string;
  position: string;
  level: number;
  xp: number;
  wins: number;
  losses: number;
  draws: number;
  goals: number;
  matches: number;
  mvpCount: number;
  createdAt: string;
}

export interface MatchRecord {
  id: string;
  player1Id: string;
  player2Id: string;
  player1Name: string;
  player2Name: string;
  score1: number;
  score2: number;
  mvpId: string;
  mvpName: string;
  timestamp: number;
}

export interface RoomPlayer {
  id: string;
  nickname: string;
  team: 'A' | 'B' | 'spectator';
  isHost: boolean;
}

export interface CustomRoom {
  id: string;
  name: string;
  password: string;
  hostId: string;
  hostName: string;
  players: RoomPlayer[];
  maxPlayers: number;
  spectators: RoomPlayer[];
  status: 'waiting' | 'playing' | 'finished';
  createdAt: number;
}

type Screen = 'splash' | 'login' | 'register' | 'home' | 'play' | 'profile' | 'ranking' | 'game' | 'matchResult' | 'customRooms' | 'roomLobby' | 'settings';

type GameMode = 'cpu' | 'online' | 'custom' | 'spectator';

interface GameState {
  currentPlayer: Player | null;
  rankingPlayers: Player[];
  matchHistory: MatchRecord[];
  isLoggedIn: boolean;
  isLoading: boolean;
  currentScreen: Screen;
  lastMatchResult: MatchRecord | null;
  onlineCount: number;
  authError: string;
  gameMode: GameMode;
  mercyRule: boolean;
  cameFromRoom: boolean;
  
  // Custom rooms
  customRooms: CustomRoom[];
  currentRoom: CustomRoom | null;
  
  // Settings
  hudPositions: { [key: string]: { x: number; y: number } };

  // Actions
  setScreen: (screen: Screen) => void;
  setAuthError: (error: string) => void;
  setGameMode: (mode: GameMode) => void;
  setMercyRule: (v: boolean) => void;
  setCameFromRoom: (v: boolean) => void;
  register: (email: string, password: string, name: string, nickname: string, position: string) => Promise<boolean>;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  checkSession: () => Promise<void>;
  updatePlayerStats: (goalsDelta: number, won: boolean, draw: boolean, isMvp: boolean) => Promise<void>;
  addMatchRecord: (record: Omit<MatchRecord, 'id' | 'timestamp'>) => Promise<void>;
  loadRanking: () => Promise<void>;
  loadMatchHistory: () => Promise<void>;
  loadOnlineCount: () => Promise<void>;
  refreshCurrentPlayer: () => Promise<void>;
  
  // Custom rooms
  createRoom: (name: string, password: string) => void;
  joinRoom: (roomId: string, asSpectator: boolean) => void;
  leaveRoom: () => void;
  kickPlayer: (playerId: string) => void;
  closeRoom: () => void;
  loadRooms: () => void;
  
  // Settings
  saveHudPositions: (positions: { [key: string]: { x: number; y: number } }) => void;
}

// ─── Converters ───
function dbPlayerToPlayer(db: DbPlayer): Player {
  return {
    id: db.id,
    email: db.email,
    name: db.name,
    nickname: db.nickname,
    position: db.position,
    level: db.level,
    xp: db.xp,
    wins: db.wins,
    losses: db.losses,
    draws: db.draws,
    goals: db.goals,
    matches: db.matches,
    mvpCount: db.mvp_count,
    createdAt: db.created_at,
  };
}

function dbMatchToRecord(db: DbMatch): MatchRecord {
  return {
    id: db.id,
    player1Id: db.player1_id,
    player2Id: db.player2_id,
    player1Name: db.player1_name,
    player2Name: db.player2_name,
    score1: db.score1,
    score2: db.score2,
    mvpId: db.mvp_id,
    mvpName: db.mvp_name,
    timestamp: new Date(db.created_at).getTime(),
  };
}

export const useGameStore = create<GameState>((set, get) => ({
  currentPlayer: null,
  rankingPlayers: [],
  matchHistory: [],
  isLoggedIn: false,
  isLoading: false,
  currentScreen: 'splash',
  lastMatchResult: null,
  onlineCount: 0,
  authError: '',
  gameMode: 'cpu',
  mercyRule: false,
  cameFromRoom: false,
  customRooms: [],
  currentRoom: null,
  hudPositions: {},

  setScreen: (screen) => set({ currentScreen: screen }),
  setAuthError: (error) => set({ authError: error }),
  setGameMode: (mode) => set({ gameMode: mode }),
  setMercyRule: (v) => set({ mercyRule: v }),
  setCameFromRoom: (v) => set({ cameFromRoom: v }),

  register: async (email, password, name, nickname, position) => {
    set({ isLoading: true, authError: '' });
    try {
      const data = await signUp(email, password);
      
      if (!data.user) {
        set({ authError: 'Erro ao criar conta. Tente novamente.', isLoading: false });
        return false;
      }

      const profile = await createPlayerProfile(data.user.id, email, name, nickname, position);
      const player = dbPlayerToPlayer(profile);

      set({
        currentPlayer: player,
        isLoggedIn: true,
        isLoading: false,
        currentScreen: 'home',
      });
      return true;
    } catch (err: any) {
      let errorMsg = 'Erro ao criar conta.';
      if (err?.message?.includes('already registered') || err?.message?.includes('already exists')) {
        errorMsg = 'Este email já está cadastrado.';
      } else if (err?.message?.includes('valid email')) {
        errorMsg = 'Email inválido.';
      } else if (err?.message?.includes('at least')) {
        errorMsg = 'Senha deve ter pelo menos 6 caracteres.';
      } else if (err?.message) {
        errorMsg = err.message;
      }
      set({ authError: errorMsg, isLoading: false });
      return false;
    }
  },

  login: async (email, password) => {
    set({ isLoading: true, authError: '' });
    try {
      const data = await signIn(email, password);
      
      if (!data.user) {
        set({ authError: 'Email ou senha incorretos.', isLoading: false });
        return false;
      }

      const profile = await getPlayerProfile(data.user.id);
      if (!profile) {
        set({ authError: 'Perfil não encontrado. Tente cadastrar novamente.', isLoading: false });
        return false;
      }

      const player = dbPlayerToPlayer(profile);

      set({
        currentPlayer: player,
        isLoggedIn: true,
        isLoading: false,
        currentScreen: 'home',
      });
      return true;
    } catch (err: any) {
      let errorMsg = 'Email ou senha incorretos.';
      if (err?.message?.includes('Invalid login')) {
        errorMsg = 'Email ou senha incorretos.';
      } else if (err?.message) {
        errorMsg = err.message;
      }
      set({ authError: errorMsg, isLoading: false });
      return false;
    }
  },

  logout: async () => {
    try {
      await signOut();
    } catch {}
    set({
      currentPlayer: null,
      isLoggedIn: false,
      currentScreen: 'login',
      matchHistory: [],
      lastMatchResult: null,
    });
  },

  checkSession: async () => {
    try {
      const session = await getSession();
      if (session?.user) {
        const profile = await getPlayerProfile(session.user.id);
        if (profile) {
          set({
            currentPlayer: dbPlayerToPlayer(profile),
            isLoggedIn: true,
            currentScreen: 'home',
          });
          return;
        }
      }
    } catch {}
    set({ currentScreen: 'login' });
  },

  refreshCurrentPlayer: async () => {
    const { currentPlayer } = get();
    if (!currentPlayer) return;
    try {
      const profile = await getPlayerProfile(currentPlayer.id);
      if (profile) {
        set({ currentPlayer: dbPlayerToPlayer(profile) });
      }
    } catch {}
  },

  updatePlayerStats: async (goalsDelta, won, draw, isMvp) => {
    const { currentPlayer } = get();
    if (!currentPlayer) return;

    try {
      const currentProfile = await getPlayerProfile(currentPlayer.id);
      if (!currentProfile) return;

      const updated = await updatePlayerStatsDb(
        currentPlayer.id,
        goalsDelta,
        won,
        draw,
        isMvp,
        currentProfile
      );
      set({ currentPlayer: dbPlayerToPlayer(updated) });
    } catch (err) {
      console.error('Error updating stats:', err);
    }
  },

  addMatchRecord: async (record) => {
    const { currentPlayer, matchHistory } = get();
    if (!currentPlayer) return;

    try {
      const dbRecord = await createMatchRecord({
        player1_id: record.player1Id,
        player2_id: record.player2Id,
        player1_name: record.player1Name,
        player2_name: record.player2Name,
        score1: record.score1,
        score2: record.score2,
        mvp_id: record.mvpId,
        mvp_name: record.mvpName,
      });

      const newRecord = dbMatchToRecord(dbRecord);
      set({
        matchHistory: [newRecord, ...matchHistory],
        lastMatchResult: newRecord,
      });
    } catch (err) {
      console.error('Error saving match:', err);
      const fallbackRecord: MatchRecord = {
        id: crypto.randomUUID(),
        ...record,
        timestamp: Date.now(),
      };
      set({
        lastMatchResult: fallbackRecord,
        matchHistory: [fallbackRecord, ...matchHistory],
      });
    }
  },

  loadRanking: async () => {
    try {
      const ranking = await getGlobalRanking();
      set({ rankingPlayers: ranking.map(dbPlayerToPlayer) });
    } catch (err) {
      console.error('Error loading ranking:', err);
    }
  },

  loadMatchHistory: async () => {
    const { currentPlayer } = get();
    if (!currentPlayer) return;
    try {
      const matches = await getPlayerMatches(currentPlayer.id);
      set({ matchHistory: matches.map(dbMatchToRecord) });
    } catch (err) {
      console.error('Error loading match history:', err);
    }
  },

  loadOnlineCount: async () => {
    try {
      const count = await getOnlinePlayersCount();
      set({ onlineCount: count });
    } catch {}
  },
  
  // Custom Rooms
  createRoom: (name: string, password: string) => {
    const { currentPlayer } = get();
    if (!currentPlayer) return;
    
    const hostPlayer: RoomPlayer = {
      id: currentPlayer.id,
      nickname: currentPlayer.nickname,
      team: 'A',
      isHost: true,
    };
    
    const room: CustomRoom = {
      id: crypto.randomUUID(),
      name,
      password,
      hostId: currentPlayer.id,
      hostName: currentPlayer.nickname,
      players: [hostPlayer],
      maxPlayers: 2,
      spectators: [],
      status: 'waiting',
      createdAt: Date.now(),
    };
    
    set(state => ({ 
      customRooms: [room, ...state.customRooms],
      currentRoom: room,
      currentScreen: 'roomLobby',
    }));
  },
  
  joinRoom: (roomId: string, asSpectator: boolean) => {
    const { customRooms, currentPlayer } = get();
    if (!currentPlayer) return;
    const room = customRooms.find(r => r.id === roomId);
    if (!room) return;
    
    const updatedRoom = { ...room };
    
    if (asSpectator) {
      const specPlayer: RoomPlayer = {
        id: currentPlayer.id,
        nickname: currentPlayer.nickname,
        team: 'spectator',
        isHost: false,
      };
      updatedRoom.spectators = [...updatedRoom.spectators, specPlayer];
    } else {
      const teamBPlayer: RoomPlayer = {
        id: currentPlayer.id,
        nickname: currentPlayer.nickname,
        team: 'B',
        isHost: false,
      };
      updatedRoom.players = [...updatedRoom.players, teamBPlayer];
    }
    
    const updatedRooms = customRooms.map(r => r.id === roomId ? updatedRoom : r);
    
    set({ 
      customRooms: updatedRooms,
      currentRoom: updatedRoom, 
      currentScreen: 'roomLobby',
      gameMode: asSpectator ? 'spectator' : 'custom',
    });
  },
  
  leaveRoom: () => {
    const { currentRoom, currentPlayer, customRooms } = get();
    if (!currentRoom || !currentPlayer) {
      set({ currentRoom: null, currentScreen: 'customRooms' });
      return;
    }
    
    const updatedRoom = { ...currentRoom };
    updatedRoom.players = updatedRoom.players.filter(p => p.id !== currentPlayer.id);
    updatedRoom.spectators = updatedRoom.spectators.filter(p => p.id !== currentPlayer.id);
    
    // If host left, remove the room
    if (currentRoom.hostId === currentPlayer.id) {
      set({ 
        customRooms: customRooms.filter(r => r.id !== currentRoom.id),
        currentRoom: null, 
        currentScreen: 'customRooms' 
      });
    } else {
      const updatedRooms = customRooms.map(r => r.id === currentRoom.id ? updatedRoom : r);
      set({ 
        customRooms: updatedRooms,
        currentRoom: null, 
        currentScreen: 'customRooms' 
      });
    }
  },
  
  kickPlayer: (playerId: string) => {
    const { currentRoom, customRooms } = get();
    if (!currentRoom) return;
    
    const updatedRoom = { ...currentRoom };
    updatedRoom.players = updatedRoom.players.filter(p => p.id !== playerId);
    updatedRoom.spectators = updatedRoom.spectators.filter(p => p.id !== playerId);
    
    const updatedRooms = customRooms.map(r => r.id === currentRoom.id ? updatedRoom : r);
    set({ customRooms: updatedRooms, currentRoom: updatedRoom });
  },
  
  closeRoom: () => {
    const { currentRoom, customRooms } = get();
    if (!currentRoom) return;
    
    set({
      customRooms: customRooms.filter(r => r.id !== currentRoom.id),
      currentRoom: null,
      currentScreen: 'customRooms',
    });
  },
  
  loadRooms: () => {
    // Rooms are local for now — in production, load from Supabase
  },
  
  saveHudPositions: (positions) => {
    set({ hudPositions: positions });
    try {
      localStorage.setItem('cbfd26_hud', JSON.stringify(positions));
    } catch {}
  },
}));

// Listen for auth state changes
supabase.auth.onAuthStateChange(async (event, _session) => {
  if (event === 'SIGNED_OUT') {
    useGameStore.setState({
      currentPlayer: null,
      isLoggedIn: false,
    });
  }
});

// Load saved HUD positions
try {
  const saved = localStorage.getItem('cbfd26_hud');
  if (saved) {
    useGameStore.setState({ hudPositions: JSON.parse(saved) });
  }
} catch {}
