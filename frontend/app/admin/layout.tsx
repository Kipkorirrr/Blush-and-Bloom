import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Admin Dashboard - ShopWave',
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="admin-shell">
      <aside className="sidebar">
        <h2>Admin</h2>
        <nav>
          <Link href="/admin">Overview</Link>
          <Link href="#">Inventory</Link>
          <Link href="#">Orders</Link>
          <Link href="#">Users</Link>
        </nav>
      </aside>
      <div className="admin-content">{children}</div>
    </div>
  );
}
