import { create } from 'zustand';
import type { VoiceStatus } from '../types';

interface VoiceState {
  status: VoiceStatus;
  lastRecognizedText: string;

  setStatus: (status: VoiceStatus) => void;
  setRecognizedText: (text: string) => void;
  reset: () => void;
}

export const useVoiceStore = create<VoiceState>((set) => ({
  status: 'idle',
  lastRecognizedText: '',

  setStatus: (status) => set({ status }),
  setRecognizedText: (text) => set({ lastRecognizedText: text }),
  reset: () => set({ status: 'idle', lastRecognizedText: '' }),
}));
