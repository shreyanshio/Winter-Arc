import { create } from 'zustand';

interface UIState {
  isDrawerOpen: boolean;
  setDrawerOpen: (open: boolean) => void;
  activeStudySubjectId: string | null;
  studyStartedAt: number | null; // wall-clock ms timestamp
  isPomodoroActive: boolean;
  pomodoroMinutesLeft: number;
  activeSleepStartedAt: number | null; // wall-clock ms timestamp
  setActiveStudy: (subjectId: string | null, startedAt: number | null) => void;
  setActiveSleep: (startedAt: number | null) => void;
  setPomodoroState: (active: boolean, minutesLeft: number) => void;
}

export const useUIStore = create<UIState>((set) => ({
  isDrawerOpen: false,
  setDrawerOpen: (open) => set({ isDrawerOpen: open }),
  activeStudySubjectId: null,
  studyStartedAt: null,
  isPomodoroActive: false,
  pomodoroMinutesLeft: 25,
  activeSleepStartedAt: null,
  setActiveStudy: (subjectId, startedAt) => set({ activeStudySubjectId: subjectId, studyStartedAt: startedAt }),
  setActiveSleep: (startedAt) => set({ activeSleepStartedAt: startedAt }),
  setPomodoroState: (active, minutesLeft) => set({ isPomodoroActive: active, pomodoroMinutesLeft: minutesLeft }),
}));
