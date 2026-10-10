/**
 * État global : carnet de joueurs, réglages, partie en cours, historique.
 * Tout est persisté localement et rechargé au démarrage — une partie commencée
 * au bar survit à la fermeture de l'app.
 */
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

import { MODES, matchTitle } from '../data/modes';
import { buildResult, Dart, Match, ModeId, Options, Player, runMatch } from '../engine';
import { PLAYER_COLORS } from '../theme/tokens';
import { setHapticsEnabled } from '../utils/feedback';
import { uid } from '../utils/id';
import { clearAll, KEYS, loadJSON, saveJSON } from '../utils/storage';

export type Settings = {
  haptics: boolean;
  keepAwake: boolean;
  /** Saisie préférée au lancement d'une partie. */
  inputMode: 'pad' | 'board' | 'total';
  /** Conseils de sortie au X01. */
  showCheckout: boolean;
  /** Demander confirmation avant d'abandonner une partie. */
  confirmQuit: boolean;
};

const DEFAULT_SETTINGS: Settings = {
  haptics: true,
  keepAwake: true,
  inputMode: 'pad',
  showCheckout: true,
  confirmQuit: true,
};

const HISTORY_MAX = 60;

type Ctx = {
  ready: boolean;
  players: Player[];
  settings: Settings;
  history: Match[];
  current: Match | null;
  lineup: string[];
  addPlayer: (name: string) => Player | null;
  renamePlayer: (id: string, name: string) => void;
  setPlayerColor: (id: string, color: string) => void;
  removePlayer: (id: string) => void;
  setLineup: (ids: string[]) => void;
  updateSettings: (patch: Partial<Settings>) => void;
  startMatch: (args: { modeId: ModeId; presetId: string; options: Options; playerIds: string[] }) => Match | null;
  pushDart: (d: Dart) => void;
  undoDart: () => void;
  /** Termine et archive la partie en cours. */
  finishMatch: () => void;
  abandonMatch: () => void;
  rematch: () => Match | null;
  clearHistory: () => void;
  resetEverything: () => void;
};

const AppCtx = createContext<Ctx | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [players, setPlayers] = useState<Player[]>([]);
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [history, setHistory] = useState<Match[]>([]);
  const [current, setCurrent] = useState<Match | null>(null);
  const [lineup, setLineupState] = useState<string[]>([]);
  const hydrated = useRef(false);

  // Chargement initial.
  useEffect(() => {
    let alive = true;
    (async () => {
      const [p, s, h, c, l] = await Promise.all([
        loadJSON<Player[]>(KEYS.players, []),
        loadJSON<Settings>(KEYS.settings, DEFAULT_SETTINGS),
        loadJSON<Match[]>(KEYS.history, []),
        loadJSON<Match | null>(KEYS.current, null),
        loadJSON<string[]>(KEYS.lineup, []),
      ]);
      if (!alive) return;
      setPlayers(Array.isArray(p) ? p : []);
      const merged = { ...DEFAULT_SETTINGS, ...(s ?? {}) };
      setSettings(merged);
      setHapticsEnabled(merged.haptics);
      setHistory(Array.isArray(h) ? h : []);
      setCurrent(c && typeof c === 'object' && Array.isArray(c.darts) ? c : null);
      setLineupState(Array.isArray(l) ? l : []);
      hydrated.current = true;
      setReady(true);
    })();
    return () => {
      alive = false;
    };
  }, []);

  // Sauvegardes ciblées : seulement après hydratation, pour ne rien écraser.
  useEffect(() => {
    if (hydrated.current) void saveJSON(KEYS.players, players);
  }, [players]);
  useEffect(() => {
    if (hydrated.current) void saveJSON(KEYS.settings, settings);
    setHapticsEnabled(settings.haptics);
  }, [settings]);
  useEffect(() => {
    if (hydrated.current) void saveJSON(KEYS.history, history);
  }, [history]);
  useEffect(() => {
    if (hydrated.current) void saveJSON(KEYS.current, current);
  }, [current]);
  useEffect(() => {
    if (hydrated.current) void saveJSON(KEYS.lineup, lineup);
  }, [lineup]);

  const addPlayer = useCallback(
    (rawName: string): Player | null => {
      const name = rawName.trim().slice(0, 18);
      if (!name) return null;
      if (players.some((p) => p.name.toLowerCase() === name.toLowerCase())) return null;
      const created: Player = {
        id: uid('p'),
        name,
        color: PLAYER_COLORS[players.length % PLAYER_COLORS.length],
        createdAt: Date.now(),
      };
      setPlayers((prev) => (prev.some((p) => p.id === created.id) ? prev : [...prev, created]));
      return created;
    },
    [players]
  );

  const renamePlayer = useCallback((id: string, name: string) => {
    const clean = name.trim().slice(0, 18);
    if (!clean) return;
    setPlayers((prev) => prev.map((p) => (p.id === id ? { ...p, name: clean } : p)));
  }, []);

  const setPlayerColor = useCallback((id: string, color: string) => {
    setPlayers((prev) => prev.map((p) => (p.id === id ? { ...p, color } : p)));
  }, []);

  const removePlayer = useCallback((id: string) => {
    setPlayers((prev) => prev.filter((p) => p.id !== id));
    setLineupState((prev) => prev.filter((x) => x !== id));
  }, []);

  const setLineup = useCallback((ids: string[]) => setLineupState(ids), []);

  const updateSettings = useCallback((patch: Partial<Settings>) => {
    setSettings((prev) => ({ ...prev, ...patch }));
  }, []);

  const startMatch = useCallback<Ctx['startMatch']>(
    ({ modeId, presetId, options, playerIds }) => {
      const mode = MODES[modeId];
      const chosen = playerIds
        .map((id) => players.find((p) => p.id === id))
        .filter((p): p is Player => Boolean(p));
      if (chosen.length < mode.minPlayers) return null;
      const match: Match = {
        id: uid('m'),
        modeId,
        presetId,
        title: matchTitle(modeId, options),
        players: chosen.map((p) => ({ id: p.id, name: p.name, color: p.color })),
        options,
        darts: [],
        startedAt: Date.now(),
      };
      setCurrent(match);
      setLineupState(playerIds);
      return match;
    },
    [players]
  );

  const pushDart = useCallback((d: Dart) => {
    setCurrent((prev) => {
      if (!prev || prev.finishedAt) return prev;
      const state = runMatch(prev);
      if (state.finished) return prev;
      return { ...prev, darts: [...prev.darts, d] };
    });
  }, []);

  const undoDart = useCallback(() => {
    setCurrent((prev) => {
      if (!prev || prev.darts.length === 0) return prev;
      return { ...prev, darts: prev.darts.slice(0, -1), finishedAt: undefined, result: undefined };
    });
  }, []);

  const finishMatch = useCallback(() => {
    setCurrent((prev) => {
      if (!prev) return prev;
      const state = runMatch(prev);
      if (!state.finished) return prev;
      const done: Match = {
        ...prev,
        finishedAt: Date.now(),
        result: buildResult(prev, state),
      };
      setHistory((h) => [done, ...h.filter((m) => m.id !== done.id)].slice(0, HISTORY_MAX));
      return done;
    });
  }, []);

  const abandonMatch = useCallback(() => setCurrent(null), []);

  const rematch = useCallback((): Match | null => {
    const base = current ?? history[0];
    if (!base) return null;
    const next: Match = {
      ...base,
      id: uid('m'),
      darts: [],
      startedAt: Date.now(),
      finishedAt: undefined,
      result: undefined,
      // On tourne l'ordre de lancer : le deuxième commence la revanche.
      players: base.players.length > 1 ? [...base.players.slice(1), base.players[0]] : base.players,
    };
    setCurrent(next);
    return next;
  }, [current, history]);

  const clearHistory = useCallback(() => setHistory([]), []);

  const resetEverything = useCallback(() => {
    setPlayers([]);
    setHistory([]);
    setCurrent(null);
    setLineupState([]);
    setSettings(DEFAULT_SETTINGS);
    void clearAll();
  }, []);

  const value = useMemo<Ctx>(
    () => ({
      ready,
      players,
      settings,
      history,
      current,
      lineup,
      addPlayer,
      renamePlayer,
      setPlayerColor,
      removePlayer,
      setLineup,
      updateSettings,
      startMatch,
      pushDart,
      undoDart,
      finishMatch,
      abandonMatch,
      rematch,
      clearHistory,
      resetEverything,
    }),
    [
      ready,
      players,
      settings,
      history,
      current,
      lineup,
      addPlayer,
      renamePlayer,
      setPlayerColor,
      removePlayer,
      setLineup,
      updateSettings,
      startMatch,
      pushDart,
      undoDart,
      finishMatch,
      abandonMatch,
      rematch,
      clearHistory,
      resetEverything,
    ]
  );

  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>;
}

export function useApp(): Ctx {
  const ctx = useContext(AppCtx);
  if (!ctx) throw new Error('useApp doit être utilisé dans AppProvider');
  return ctx;
}
