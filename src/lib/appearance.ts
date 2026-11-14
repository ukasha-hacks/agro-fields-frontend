'use client';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
type Appearance = {
  theme: 'light' | 'dark';
  textSize: 'small' | 'medium' | 'large';
  setTheme: (theme: Appearance['theme']) => void;
  setTextSize: (size: Appearance['textSize']) => void;
};
// Only appearance is kept here. Exploration and form answers live in the URL.
export const useAppearance = create<Appearance>()(
  persist(
    (set) => ({
      theme: 'light',
      textSize: 'medium',
      setTheme: (theme) => set({ theme }),
      setTextSize: (textSize) => set({ textSize }),
    }),
    { name: 'agro-field-appearance', skipHydration: true },
  ),
);
