export const SESSION_TIMEOUT_MS = 1000 * 60 * 60; // 1 hour

export function setSessionExpiry() {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem('session_expires_at', String(Date.now() + SESSION_TIMEOUT_MS));
}

export function isSessionActive() {
  if (typeof window === 'undefined') return false;
  const expiresAt = window.localStorage.getItem('session_expires_at');
  if (!expiresAt) return false;
  return Date.now() < Number(expiresAt);
}

export function clearSession() {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem('access_token');
  window.localStorage.removeItem('user_role');
  window.localStorage.removeItem('user_email');
  window.localStorage.removeItem('user_name');
  window.localStorage.removeItem('user_id');
  window.localStorage.removeItem('session_expires_at');
}

export function getSessionUser() {
  if (typeof window === 'undefined' || !isSessionActive()) return null;
  return {
    token: window.localStorage.getItem('access_token'),
    role: window.localStorage.getItem('user_role'),
    userId: window.localStorage.getItem('user_id'),
    userName: window.localStorage.getItem('user_name'),
  };
}
