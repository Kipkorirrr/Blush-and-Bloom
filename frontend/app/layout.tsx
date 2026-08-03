import type { Metadata } from 'next';
import './globals.css';
import NavBar from '../components/NavBar';

export const metadata: Metadata = {
  title: 'Pink Orange Baby Blue Shop',
  description: 'A modern full-stack e-commerce storefront and admin dashboard',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="app-shell">
          <NavBar />
          <main>{children}</main>
        </div>
      </body>
    </html>
  );
}
