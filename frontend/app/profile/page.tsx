"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { API_URL } from '../../lib/api';
import { clearSession, getSessionUser, isSessionActive } from '../../lib/session';

type OrderSummary = {
  _id: string;
  total: number;
  status: string;
  paymentStatus: string;
};

export default function ProfilePage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [orderCount, setOrderCount] = useState(0);
  const [status, setStatus] = useState<'loading' | 'ready'>('loading');
  const [message, setMessage] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (!isSessionActive()) {
      clearSession();
      router.push('/login');
      return;
    }

    const session = getSessionUser();
    if (!session?.token || !session.userId) {
      clearSession();
      router.push('/login');
      return;
    }

    setToken(session.token);
    setUserId(session.userId);
  }, [router]);

  useEffect(() => {
    async function loadProfile() {
      if (!token || !userId) return;

      try {
        const userRes = await fetch(`${API_URL}/users/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!userRes.ok) {
          router.push('/login');
          return;
        }

        const userData = await userRes.json();
        setName(userData.name || '');
        setEmail(userData.email || '');

        const ordersRes = await fetch(`${API_URL}/orders/user/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (ordersRes.ok) {
          const orders: OrderSummary[] = await ordersRes.json();
          setOrderCount(orders.length);
        }

        setStatus('ready');
      } catch (err) {
        console.error(err);
        setMessage('Unable to load profile information.');
      }
    }

    loadProfile();
  }, [token, userId, router]);

  async function saveProfile() {
    if (!token || !userId) {
      router.push('/login');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name }),
      });

      if (!response.ok) {
        const error = await response.json();
        setMessage(error.message || 'Unable to update profile.');
        return;
      }

      window.localStorage.setItem('user_name', name);
      setMessage('Profile updated successfully.');
    } catch (err) {
      console.error(err);
      setMessage('Network error while updating profile.');
    }
  }

  if (status === 'loading') {
    return (
      <main className="auth-hero">
        <div className="auth-card">
          <h1>Loading profile…</h1>
          <p className="muted">Please wait while we load your account details.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="profile-page">
      <section className="hero-page">
        <div className="hero-copy home-hero-copy">
          <span className="eyebrow">My Account</span>
          <h1>Manage your profile</h1>
          <p>Update your account details and track your orders from one place.</p>
          <div className="hero-actions">
            <button className="button button-primary" onClick={() => router.push('/checkout')}>
              View cart
            </button>
            <button className="button button-secondary" onClick={() => router.push('/')}>
              Browse products
            </button>
          </div>
        </div>
      </section>

      <section className="storefront-section">
        <div className="section-header">
          <h2>Profile details</h2>
          <p>Keep your account information up to date.</p>
        </div>
        <div className="profile-card">
          <label className="form-field">
            <span>Name</span>
            <input value={name} onChange={(e) => setName(e.target.value)} />
          </label>
          <label className="form-field">
            <span>Email</span>
            <input value={email} readOnly />
          </label>
          <div className="order-summary-row">
            <strong>Orders placed</strong>
            <span>{orderCount}</span>
          </div>
          {message && <div className="form-error">{message}</div>}
          <div className="form-actions">
            <button className="button button-primary" type="button" onClick={saveProfile}>
              Save changes
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
