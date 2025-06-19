import { create } from 'zustand';
import { Session } from 'next-auth';

interface SessionState {
  session: Session | null;
  setSession: (session: Session | null) => void;
  // You can add other global state here, for example:
  credits: number;
  setCredits: (credits: number) => void;
  deductCredits: (amount: number) => void;
}

export const useSessionStore = create<SessionState>((set) => ({
  session: null,
  setSession: (session) => set({ session }),
  credits: 0,
  setCredits: (credits) => set({ credits }),
  deductCredits: (amount) => set((state) => ({ credits: Math.max(0, state.credits - amount) })),
})); 