"use client";

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { clearSession, isSessionActive } from '../lib/session';

export default function NavBar() {
  const [auth, setAuth] = useState({ loggedIn: false, isAdmin: false });
  const [cartCount, setCartCount] = useState(0);
  const router = useRouter();
  const pathname = usePathname();

  function clearSession() {
    if (typeof window === 'undefined') return;
    window.localStorage.removeItem('access_token');
    window.localStorage.removeItem('user_role');
    window.localStorage.removeItem('user_email');
    window.localStorage.removeItem('user_name');
    window.localStorage.removeItem('user_id');
    window.localStorage.removeItem('session_expires_at');
  }

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!isSessionActive()) {
      clearSession();
      setAuth({ loggedIn: false, isAdmin: false });
      setCartCount(0);
      return;
    }

    const token = window.localStorage.getItem('access_token');
    const role = window.localStorage.getItem('user_role');
    setAuth({ loggedIn: !!token, isAdmin: role === 'admin' });
    // update cart count from localStorage
    try {
      const stored = window.localStorage.getItem('bb_cart');
      const items = stored ? JSON.parse(stored) : [];
      const count = items.reduce((sum: any, it: any) => sum + (it.quantity || 0), 0);
      setCartCount(count);
    } catch (e) {
      setCartCount(0);
    }
  }, [pathname]);

  useEffect(() => {
    function onStorage(e: StorageEvent) {
      if (e.key === 'bb_cart') {
        try {
          const items = e.newValue ? JSON.parse(e.newValue) : [];
          const count = items.reduce((sum: any, it: any) => sum + (it.quantity || 0), 0);
          setCartCount(count);
        } catch (err) {
          setCartCount(0);
        }
      }
    }
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  function handleLogout() {
    clearSession();
    setAuth({ loggedIn: false, isAdmin: false });
    setCartCount(0);
    router.push('/login');
  }

  return (
    <header className="site-nav">
      <Link href="/" className="logo logo-brand">
        <span>Blush</span>
        <span>and Bloom</span>
      </Link>
      <div className="nav-actions">
        {!['/admin', '/login', '/register', '/forgot-password'].includes(pathname) && (
          <Link href="/checkout" className="button button-secondary">
            Cart ({cartCount})
          </Link>
        )}
        {auth.loggedIn && !['/admin', '/login', '/register', '/forgot-password'].includes(pathname) && (
          <Link href="/profile" className="button button-secondary">
            Profile
          </Link>
        )}
        {auth.isAdmin && !['/admin', '/login', '/register', '/forgot-password'].includes(pathname) && (
          <Link href="/admin" className="button button-secondary">
            Admin
          </Link>
        )}
        {!auth.loggedIn ? (
          <Link href="/login" className="button button-login">
            Log In
          </Link>
        ) : (
          <button type="button" className="button button-secondary" onClick={handleLogout}>
            Logout
          </button>
        )}
      </div>
    </header>
  );
}
