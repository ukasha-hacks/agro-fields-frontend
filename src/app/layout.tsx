import type { Metadata } from 'next';
import { Providers } from '@/components/providers';
import '@fontsource-variable/dm-sans';
import './globals.css';
export const metadata: Metadata = {
  title: 'Agro Field — see the seasons, plan the next',
  description:
    'Explore Uganda’s past rainfall, heat and soil wetness with locally stored NASA data. Clear evidence for your next farming conversation.',
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="light" data-text-size="medium" suppressHydrationWarning>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
