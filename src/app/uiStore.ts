import { create } from 'zustand';
import type { Issue } from '../db/types';

export type CreateDefaults = Partial<Pick<Issue, 'type' | 'sprintId' | 'brand'>> & { parentId?: string };

interface UiState {
  openIssueId: string | null;
  openIssue: (id: string) => void;
  closeIssue: () => void;
  assistantOpen: boolean;
  toggleAssistant: () => void;
  createDefaults: CreateDefaults | null;
  openCreate: (d?: CreateDefaults) => void;
  closeCreate: () => void;
}

export const useUi = create<UiState>((set) => ({
  openIssueId: null,
  openIssue: (id) => set({ openIssueId: id }),
  closeIssue: () => set({ openIssueId: null }),
  assistantOpen: true,
  toggleAssistant: () => set((s) => ({ assistantOpen: !s.assistantOpen })),
  createDefaults: null,
  openCreate: (d = {}) => set({ createDefaults: d }),
  closeCreate: () => set({ createDefaults: null }),
}));
