import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { User } from 'lucide-react';
import { Sidebar } from '../components/Sidebar';
import { Header } from '../components/Header';
import { Card } from '../components/Shared';
import { changePassword, getDashboard } from '../api/client';

export function UserCenter({
  onNavigate,
  onLogout,
}: {
  onNavigate: (view: string) => void;
  onLogout?: () => void;
}) {
  const { t } = useTranslation();
  const [oldPw, setOldPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [accountHint, setAccountHint] = useState('');

  useEffect(() => {
    getDashboard()
      .then((d) => {
        const name = d.username ? String(d.username) : '';
        const admin = d.isAdmin === true;
        setAccountHint(admin ? `${t('userCenter.roleAdmin')}: ${name || '—'}` : `${t('userCenter.roleUser')}: ${name || '—'}`);
      })
      .catch(() => setAccountHint(''));
  }, [t]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    if (newPw.length < 6) {
      setError(t('userCenter.passwordTooShort'));
      return;
    }
    if (newPw !== confirmPw) {
      setError(t('userCenter.passwordMismatch'));
      return;
    }
    setSaving(true);
    try {
      await changePassword(oldPw, newPw);
      setSuccess(true);
      setOldPw('');
      setNewPw('');
      setConfirmPw('');
    } catch (err) {
      setError(err instanceof Error ? err.message : t('userCenter.changeFailed'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface">
      <Sidebar currentView="user-center" onNavigate={onNavigate} />
      <Header
        breadcrumbs={[
          { labelKey: 'sidebar.dashboard', view: 'dashboard' },
          { labelKey: 'userCenter.title' },
        ]}
        onNavigate={onNavigate}
        onLogout={onLogout}
      />

      <main className="ml-64 pt-20 px-10 pb-16">
        <div className="max-w-lg space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
              <User size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-on-surface">{t('userCenter.title')}</h1>
              <p className="text-sm text-on-surface-variant mt-0.5">{accountHint}</p>
            </div>
          </div>

          <Card>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-on-surface mb-1.5">{t('userCenter.oldPassword')}</label>
                <input
                  type="password"
                  autoComplete="current-password"
                  value={oldPw}
                  onChange={(e) => setOldPw(e.target.value)}
                  className="w-full rounded-lg border border-outline-variant/40 bg-surface px-3 py-2 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-on-surface mb-1.5">{t('userCenter.newPassword')}</label>
                <input
                  type="password"
                  autoComplete="new-password"
                  value={newPw}
                  onChange={(e) => setNewPw(e.target.value)}
                  className="w-full rounded-lg border border-outline-variant/40 bg-surface px-3 py-2 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30"
                  required
                  minLength={6}
                />
                <p className="text-xs text-on-surface-variant mt-1">{t('userCenter.passwordHint')}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-on-surface mb-1.5">{t('userCenter.confirmPassword')}</label>
                <input
                  type="password"
                  autoComplete="new-password"
                  value={confirmPw}
                  onChange={(e) => setConfirmPw(e.target.value)}
                  className="w-full rounded-lg border border-outline-variant/40 bg-surface px-3 py-2 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30"
                  required
                />
              </div>

              {error && (
                <div className="rounded-lg bg-error/10 border border-error/25 px-3 py-2 text-sm text-error">{error}</div>
              )}
              {success && (
                <div className="rounded-lg bg-primary/10 border border-primary/25 px-3 py-2 text-sm text-primary font-medium">
                  {t('userCenter.changeSuccess')}
                </div>
              )}

              <button
                type="submit"
                disabled={saving}
                className="w-full rounded-xl bg-primary text-white py-2.5 text-sm font-semibold hover:opacity-95 disabled:opacity-50 transition-opacity"
              >
                {saving ? t('userCenter.saving') : t('userCenter.submit')}
              </button>
            </form>
          </Card>
        </div>
      </main>
    </div>
  );
}
