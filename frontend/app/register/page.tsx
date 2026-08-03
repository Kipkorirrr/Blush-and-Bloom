"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { API_URL } from '../../lib/api';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || 'Registration failed');
        setLoading(false);
        return;
      }
      router.push('/login');
    } catch (err) {
      setError('Network error');
      setLoading(false);
    }
  }

  return (
    <div className="auth-hero">
      <div className="auth-card">
        <h1>Create your account</h1>
        <p className="muted">Register to save your cart and checkout securely.</p>
        <form className="auth-form" onSubmit={handleSubmit}>
          <label className="form-field">
            <span>Name</span>
            <input value={name} onChange={(e) => setName(e.target.value)} required />
          </label>
          <label className="form-field">
            <span>Email</span>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </label>
          <label className="form-field">
            <span>Password</span>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </label>
          <label className="form-field">
            <span>Confirm password</span>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </label>
          {error && <div className="form-error">{error}</div>}
          <div className="form-actions">
            <button className="button button-primary" type="submit" disabled={loading}>
              {loading ? 'Creating account…' : 'Register'}
            </button>
            <button type="button" className="button button-secondary" onClick={() => router.push('/login')}>
              Back to login
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
