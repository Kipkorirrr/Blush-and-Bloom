"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { API_URL } from '../../lib/api';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    setSuccess(null);

    if (password !== confirmPassword) {
      setMessage('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage(data.message || 'Unable to reset password');
        setLoading(false);
        return;
      }
      setSuccess('Password updated successfully. Please sign in.');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
    } catch (err) {
      setMessage('Network error while resetting password.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-hero">
      <div className="auth-card">
        <h1>Reset password</h1>
        <p className="muted">Enter your account email and a new password.</p>
        <form className="auth-form" onSubmit={handleSubmit}>
          <label className="form-field">
            <span>Email</span>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </label>
          <label className="form-field">
            <span>New password</span>
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
          {message && <div className="form-error">{message}</div>}
          {success && <div className="form-success">{success}</div>}
          <div className="form-actions">
            <button className="button button-primary" type="submit" disabled={loading}>
              {loading ? 'Updating…' : 'Reset password'}
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
