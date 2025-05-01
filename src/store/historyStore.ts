
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { HealthData, AnalysisSection } from '@/store/healthStore';

export interface HistoryEntry {
  id: string;
  date: string;
  healthData: HealthData;
  analysis?: AnalysisSection[];
}

interface HistoryStore {
  historyEntries: HistoryEntry[];
  loading: boolean;
  addHistoryEntry: (healthData: HealthData, analysis?: AnalysisSection[]) => void;
  clearHistory: () => void;
}

export const useHistoryStore = create<HistoryStore>()(
  persist(
    (set, get) => ({
      historyEntries: [],
      loading: false,

      addHistoryEntry: (healthData, analysis) => {
        // Create a new entry with the current timestamp
        const newEntry: HistoryEntry = {
          id: crypto.randomUUID(),
          date: new Date().toISOString(), // Generate timestamp here, not in the healthData
          healthData: { ...healthData },
          analysis: analysis ? [...analysis] : undefined
        };

        set((state) => ({
          historyEntries: [newEntry, ...state.historyEntries]
        }));
      },

      clearHistory: () => {
        set({ historyEntries: [] });
      }
    }),
    {
      name: 'health-history-storage',
    }
  )
);
