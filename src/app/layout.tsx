import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from './providers';

export const metadata: Metadata = {
  title: {
    default: 'Cavian Fashion | Trendy T-Shirts & Apparel',
    template: '%s | Cavian Fashion',
  },
  description: 'Discover the latest trends in fashion with our exclusive collection of t-shirts and apparel',
  keywords: ['fashion', 't-shirts', 'apparel', 'clothing', 'style', 'trendy'],
  authors: [{ name: 'Cavian Fashion' }],
  creator: 'Cavian Fashion',
  publisher: 'Cavian Fashion',
  icons: {
    icon: '/bluelogo.png',
    shortcut: '/bluelogo.png',
    apple: '/bluelogo.png',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://fashion.cavian.com',
    title: 'Cavian Fashion | Trendy T-Shirts & Apparel',
    description: 'Discover the latest trends in fashion with our exclusive collection of t-shirts and apparel',
    siteName: 'Cavian Fashion',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Cavian Fashion | Trendy T-Shirts & Apparel',
    description: 'کاویان، ارائه دهنده راهکارهای نوآورانه در زمینه فناوری اطلاعات و ارتباطات',
    creator: '@cavian_ir',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl" className="scroll-smooth" suppressHydrationWarning>
      <head>
        {/* Preload local fonts */}
        <link rel="preload" href="/fonts/Pinar-DS1-FD-Medium.ttf" as="font" type="font/ttf" crossOrigin="anonymous" />
        <link rel="preload" href="/fonts/Pinar-DS1-FD-ExtraBold.ttf" as="font" type="font/ttf" crossOrigin="anonymous" />
      </head>
      <body className="font-sans antialiased bg-bg text-fg">
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
