import { create } from 'zustand';
import type { ReadingMode, SessionHistoryEntry } from '../types';

interface ReadingState {
  currentPageIndex: number;
  mode: ReadingMode;
  activeHotspot: string | null;
  sessionHistory: SessionHistoryEntry[];
  isAtEnd: boolean;

  setCurrentPage: (index: number) => void;
  nextPage: (totalPages: number) => void;
  prevPage: () => void;
  setMode: (mode: ReadingMode) => void;
  setActiveHotspot: (id: string | null) => void;
  addHistoryEntry: (entry: SessionHistoryEntry) => void;
  resetHistory: () => void;
  reset: () => void;
}

export const useReadingStore = create<ReadingState>((set) => ({
  currentPageIndex: 0,
  mode: 'listen',
  activeHotspot: null,
  sessionHistory: [],
  isAtEnd: false,

  setCurrentPage: (index) => set({ currentPageIndex: index, isAtEnd: false }),
  nextPage: (totalPages) =>
    set((state) => {
      const next = state.currentPageIndex + 1;
      if (next >= totalPages) return { isAtEnd: true };
      return { currentPageIndex: next, isAtEnd: false };
    }),
  prevPage: () =>
    set((state) => ({
      currentPageIndex: Math.max(0, state.currentPageIndex - 1),
      isAtEnd: false,
    })),
  setMode: (mode) => set({ mode }),
  setActiveHotspot: (id) => set({ activeHotspot: id }),
  addHistoryEntry: (entry) =>
    set((state) => ({ sessionHistory: [...state.sessionHistory, entry] })),
  resetHistory: () => set({ sessionHistory: [] }),
  reset: () =>
    set({
      currentPageIndex: 0,
      mode: 'listen',
      activeHotspot: null,
      sessionHistory: [],
      isAtEnd: false,
    }),
}));
