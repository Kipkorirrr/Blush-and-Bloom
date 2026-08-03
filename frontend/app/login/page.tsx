"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { API_URL } from '../../lib/api';
import { setSessionExpiry, clearSession } from '../../lib/session';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || 'Login failed');
        setLoading(false);
        return;
      }

      clearSession();
      if (data.access_token) {
        localStorage.setItem('access_token', data.access_token);
        localStorage.setItem('user_role', data.role || 'customer');
        localStorage.setItem('user_id', data.userId);
        localStorage.setItem('user_email', email);
        if (data.name) {
          localStorage.setItem('user_name', data.name);
        }
        setSessionExpiry();
      }

      setLoading(false);
      router.push(data.role === 'admin' ? '/admin' : '/');
    } catch (err) {
      setError('Network error');
      setLoading(false);
    }
  }

  return (
    <div className="auth-hero">
      <div className="auth-card">
        <h1>Welcome back</h1>
        <p className="muted">Log in to access your account and complete checkout.</p>
        <form className="auth-form" onSubmit={handleSubmit}>
          <label className="form-field">
            <span>Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>
          <label className="form-field">
            <span>Password</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>
          {error && <div className="form-error">{error}</div>}
          <div className="form-actions">
            <button className="button button-primary" type="submit" disabled={loading}>
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
            <button
              type="button"
              className="button button-secondary"
              onClick={() => router.push('/register')}
            >
              Register
            </button>
          </div>
          <button
            type="button"
            className="button button-secondary"
            onClick={() => router.push('/forgot-password')}
          >
            Forgot password?
          </button>
        </form>
      </div>
    </div>
  );
}
