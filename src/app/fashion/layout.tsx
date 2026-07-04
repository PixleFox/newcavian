import { Metadata } from 'next';
import { ThemeProvider } from '@/app/providers';

export const metadata: Metadata = {
  title: 'Cavian Fashion | Trendy T-Shirts & Apparel',
  description: 'Discover the latest trends in fashion with our exclusive collection of t-shirts and apparel',
};

export default function FashionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
