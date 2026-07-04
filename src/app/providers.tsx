'use client';

import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { type ThemeProviderProps } from 'next-themes/dist/types';
import { Toaster } from 'react-hot-toast';

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="dark"
      themes={['dark', 'light']}
      enableSystem={false}
      disableTransitionOnChange={false}
      {...props}
    >
      {children}
      <Toaster
        position="top-center"
        gutter={8}
        toastOptions={{
          duration: 3500,
          style: {
            background: '#111827',
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '14px',
            fontSize: '14px',
            fontFamily: 'inherit',
            direction: 'rtl',
            padding: '12px 16px',
            boxShadow: '0 10px 40px -10px rgba(0,0,0,0.6)',
            maxWidth: '90vw',
          },
          success: {
            iconTheme: { primary: '#22ff88', secondary: '#0d0d0d' },
            style: { border: '1px solid rgba(34,255,136,0.3)' },
          },
          error: {
            iconTheme: { primary: '#ff4d6d', secondary: '#0d0d0d' },
            style: { border: '1px solid rgba(255,77,109,0.3)' },
          },
        }}
      />
    </NextThemesProvider>
  );
}
