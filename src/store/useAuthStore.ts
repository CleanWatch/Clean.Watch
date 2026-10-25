import { create } from 'zustand';

interface AuthState {
  isLoggedIn: boolean;
  uid: string | null;
  // 첫 진입 시 Firebase 인증 상태를 기다리는 동안 true
  isAuthLoading: boolean;

  setAuth: (uid: string | null) => void;
  setAuthLoading: (isLoading: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isLoggedIn: false,
  uid: null,
  isAuthLoading: true,

  setAuth: (uid) =>
    set({
      uid,
      isLoggedIn: !!uid,
      isAuthLoading: false,
    }),

  setAuthLoading: (isLoading) => set({ isAuthLoading: isLoading }),

  logout: () =>
    set({
      uid: null,
      isLoggedIn: false,
    }),
}));
