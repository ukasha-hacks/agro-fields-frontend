'use client';
import { useEffect, type ReactNode } from 'react';
import { NuqsAdapter } from 'nuqs/adapters/next/app';
import { MotionConfig } from 'motion/react';
import { useAppearance } from '@/lib/appearance';
export function Providers({ children }: { children: ReactNode }) {
  const { theme, textSize } = useAppearance();
  useEffect(() => { void useAppearance.persist.rehydrate(); }, []);
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.dataset.textSize = textSize;
    document.documentElement.style.colorScheme = theme;
  }, [theme, textSize]);
  return <NuqsAdapter><MotionConfig reducedMotion="user">{children}</MotionConfig></NuqsAdapter>;
}
