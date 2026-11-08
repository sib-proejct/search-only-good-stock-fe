import { useState, type FormEvent } from 'react';
import { Link, Navigate, useSearchParams } from 'react-router-dom';
import { useAccount } from '../context/AccountContext';
import { useAppConfig } from '../context/ThemeLanguageContext';
import { accountRequest } from '../services/http';

export function safeNext(value: string | null): string {
  return value?.startsWith('/') && !value.startsWith('//') && !value.includes('\\') && ![...value].some(char => char.charCodeAt(0) < 32 || char.charCodeAt(0) === 127) && !value.startsWith('/login') ? value : '/';
}

export function LoginPage({ passwordChange = false }: { passwordChange?: boolean }) {
  const { user, loading, error: accountError, reload } = useAccount();
  const { language } = useAppConfig(); const ko = language === 'ko';
  const [params] = useSearchParams();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const next = safeNext(params.get('next'));
  if (loading) return <p role="status" className="text-center py-20">{ko ? '로그인 확인 중…' : 'Checking login…'}</p>;
  if (!passwordChange && user) return <Navigate to={next} replace />;
  if (passwordChange && !user) return <Navigate to="/login?next=%2Faccount%2Fpassword" replace />;
  const submit = async (event: FormEvent) => {
    event.preventDefault(); setError(''); setDone(false);
    if (passwordChange && newPassword !== confirm) { setError(ko ? '새 비밀번호가 일치하지 않습니다.' : 'New passwords do not match.'); return; }
    setBusy(true);
    try {
      await accountRequest(passwordChange ? '/auth/password' : '/auth/login', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(passwordChange ? { currentPassword: password, newPassword } : { username, password }),
      });
      setPassword(''); setNewPassword(''); setConfirm('');
      if (passwordChange) setDone(true); else await reload();
    } catch (err) {
      const message = err instanceof Error ? err.message : '';
      setError(message.includes('Too many') ? (ko ? '로그인 시도가 많습니다. 5분 후 다시 시도해 주세요.' : 'Too many attempts. Retry in five minutes.') : passwordChange ? (ko ? '비밀번호를 변경하지 못했습니다. 현재 비밀번호와 새 비밀번호를 확인해 주세요.' : 'Could not change password. Check your current and new passwords.') : (ko ? '로그인하지 못했습니다. 아이디·비밀번호와 서버 연결을 확인해 주세요.' : 'Could not log in. Check your credentials and connection.'));
    } finally { setBusy(false); }
  };
  const input = 'w-full rounded-xl bg-[#F5F5F7] dark:bg-[#2C2C2E] border border-black/10 dark:border-white/10 p-3 mt-1';
  return <div className="max-w-md mx-auto px-4 py-10 sm:py-16">
    <form onSubmit={submit} className="rounded-3xl p-6 sm:p-8 bg-white dark:bg-[#1C1C1E] border border-black/5 dark:border-white/10 space-y-5">
      <h1 className="text-2xl font-bold">{passwordChange ? (ko ? '비밀번호 변경' : 'Change password') : (ko ? '로그인' : 'Log in')}</h1>
      {!passwordChange && <p className="text-sm text-[#86868B]">{ko ? '로그인하고 관심 종목을 즐겨찾기에 저장하세요.' : 'Log in to save your favorite stocks.'}</p>}
      {!passwordChange && <label className="block text-sm">{ko ? '아이디' : 'Username'}<input className={input} autoComplete="username" value={username} onChange={e => setUsername(e.target.value)} required maxLength={64} /></label>}
      <label className="block text-sm">{passwordChange ? (ko ? '현재 비밀번호' : 'Current password') : (ko ? '비밀번호' : 'Password')}<input type="password" className={input} autoComplete="current-password" value={password} onChange={e => setPassword(e.target.value)} required maxLength={256} /></label>
      {passwordChange && <>
        <label className="block text-sm">{ko ? '새 비밀번호 (8자 이상)' : 'New password (8+ characters)'}<input type="password" className={input} autoComplete="new-password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required minLength={8} maxLength={256} /></label>
        <label className="block text-sm">{ko ? '새 비밀번호 확인' : 'Confirm password'}<input type="password" className={input} autoComplete="new-password" value={confirm} onChange={e => setConfirm(e.target.value)} required minLength={8} maxLength={256} /></label>
      </>}
      {(error || accountError) && <p role="alert" className="text-sm text-[#FF3B30]">{error || accountError}</p>}
      {done && <p role="status" className="text-sm text-[#248A3D]">{ko ? '비밀번호를 변경했습니다. 다른 기기의 로그인은 해제됩니다.' : 'Password changed. Other sessions are signed out.'}</p>}
      <button disabled={busy} className="w-full rounded-full bg-[#0071E3] text-white py-3 text-sm font-semibold disabled:opacity-40">{busy ? (ko ? '처리 중…' : 'Working…') : passwordChange ? (ko ? '변경하기' : 'Save password') : (ko ? '로그인' : 'Log in')}</button>
      <Link to="/" className="block text-center text-sm text-[#0071E3]">{ko ? '종목 목록으로' : 'Back to stocks'}</Link>
    </form>
  </div>;
}
