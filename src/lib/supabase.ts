import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://fqsmlrqywlaebgdmlmfl.supabase.co';
const supabaseAnonKey = 'sb_publishable_cQct1XNgEjLradrsPkc44g__IQlQ7xb';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ─── Database types ───
export interface DbPlayer {
  id: string;           // UUID from auth.users
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
  mvp_count: number;
  created_at: string;
}

export interface DbMatch {
  id: string;
  player1_id: string;
  player2_id: string;
  player1_name: string;
  player2_name: string;
  score1: number;
  score2: number;
  mvp_id: string;
  mvp_name: string;
  created_at: string;
}

// ─── Auth functions ───
export async function signUp(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;
  return data;
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getSession() {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return data.session;
}

// ─── Player profile functions ───
export async function createPlayerProfile(
  userId: string,
  email: string,
  name: string,
  nickname: string,
  position: string
): Promise<DbPlayer> {
  const profile: Omit<DbPlayer, 'created_at'> = {
    id: userId,
    email,
    name,
    nickname,
    position,
    level: 1,
    xp: 0,
    wins: 0,
    losses: 0,
    draws: 0,
    goals: 0,
    matches: 0,
    mvp_count: 0,
  };

  const { data, error } = await supabase
    .from('players')
    .insert(profile)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getPlayerProfile(userId: string): Promise<DbPlayer | null> {
  const { data, error } = await supabase
    .from('players')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null; // Not found
    throw error;
  }
  return data;
}

export async function updatePlayerStats(
  userId: string,
  goalsDelta: number,
  won: boolean,
  draw: boolean,
  isMvp: boolean,
  currentStats: DbPlayer
): Promise<DbPlayer> {
  // Calculate XP gain
  let xpGain = goalsDelta * 25;
  if (won) xpGain += 50;
  else if (draw) xpGain += 15;
  else xpGain += 5;
  if (isMvp) xpGain += 30;

  let newXp = currentStats.xp + xpGain;
  let newLevel = currentStats.level;

  const xpForLevel = (lvl: number) => lvl * 100;
  while (newXp >= xpForLevel(newLevel)) {
    newXp -= xpForLevel(newLevel);
    newLevel++;
  }

  const updates = {
    goals: currentStats.goals + goalsDelta,
    wins: currentStats.wins + (won ? 1 : 0),
    losses: currentStats.losses + (!won && !draw ? 1 : 0),
    draws: currentStats.draws + (draw ? 1 : 0),
    matches: currentStats.matches + 1,
    mvp_count: currentStats.mvp_count + (isMvp ? 1 : 0),
    xp: newXp,
    level: newLevel,
  };

  const { data, error } = await supabase
    .from('players')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ─── Match records ───
export async function createMatchRecord(match: Omit<DbMatch, 'id' | 'created_at'>): Promise<DbMatch> {
  const { data, error } = await supabase
    .from('matches')
    .insert(match)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getPlayerMatches(userId: string): Promise<DbMatch[]> {
  const { data, error } = await supabase
    .from('matches')
    .select('*')
    .or(`player1_id.eq.${userId},player2_id.eq.${userId}`)
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) throw error;
  return data || [];
}

// ─── Ranking ───
export async function getGlobalRanking(): Promise<DbPlayer[]> {
  const { data, error } = await supabase
    .from('players')
    .select('*')
    .order('wins', { ascending: false })
    .order('level', { ascending: false })
    .order('goals', { ascending: false })
    .limit(100);

  if (error) throw error;
  return data || [];
}

// ─── Online players count ───
export async function getOnlinePlayersCount(): Promise<number> {
  // We track "online" as players who have been active in the last 5 minutes
  // For now, just count total registered players as a simple metric
  const { count, error } = await supabase
    .from('players')
    .select('*', { count: 'exact', head: true });

  if (error) return 0;
  return count || 0;
}

// ─── Database initialization helper ───
// This creates the tables if they don't exist. 
// Run this SQL in your Supabase SQL Editor:
export const SETUP_SQL = `
-- Players table
CREATE TABLE IF NOT EXISTS players (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  nickname TEXT NOT NULL,
  position TEXT NOT NULL DEFAULT 'Atacante',
  level INTEGER NOT NULL DEFAULT 1,
  xp INTEGER NOT NULL DEFAULT 0,
  wins INTEGER NOT NULL DEFAULT 0,
  losses INTEGER NOT NULL DEFAULT 0,
  draws INTEGER NOT NULL DEFAULT 0,
  goals INTEGER NOT NULL DEFAULT 0,
  matches INTEGER NOT NULL DEFAULT 0,
  mvp_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Matches table
CREATE TABLE IF NOT EXISTS matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player1_id UUID REFERENCES players(id) ON DELETE SET NULL,
  player2_id TEXT NOT NULL,
  player1_name TEXT NOT NULL,
  player2_name TEXT NOT NULL,
  score1 INTEGER NOT NULL DEFAULT 0,
  score2 INTEGER NOT NULL DEFAULT 0,
  mvp_id TEXT NOT NULL,
  mvp_name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;

-- Players policies: anyone can read, only owner can update
CREATE POLICY "Players are viewable by everyone" ON players
  FOR SELECT USING (true);

CREATE POLICY "Players can insert their own profile" ON players
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Players can update their own profile" ON players
  FOR UPDATE USING (auth.uid() = id);

-- Matches policies: anyone can read, authenticated users can insert
CREATE POLICY "Matches are viewable by everyone" ON matches
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert matches" ON matches
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Index for faster ranking queries
CREATE INDEX IF NOT EXISTS idx_players_ranking ON players (wins DESC, level DESC, goals DESC);
CREATE INDEX IF NOT EXISTS idx_matches_player1 ON matches (player1_id);
CREATE INDEX IF NOT EXISTS idx_matches_player2 ON matches (player2_id);
CREATE INDEX IF NOT EXISTS idx_matches_created ON matches (created_at DESC);
`;
