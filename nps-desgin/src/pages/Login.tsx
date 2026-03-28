import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { User, Lock, ArrowRight } from 'lucide-react';
import { Input, PasswordInput } from '../components/ui';
import { motion } from 'motion/react';
import { login, getPublicConfig } from '../api/client';
import { translateLoginApiMessage } from '../i18n/apiMessageMap';

interface LoginProps {
  onLogin: () => void;
  onNavigateRegister?: () => void;
}

export function Login({ onLogin, onNavigateRegister }: LoginProps) {
  const { t } = useTranslation();
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [allowRegister, setAllowRegister] = useState(false);

  useEffect(() => {
    getPublicConfig().then((c) => setAllowRegister(!!c.allow_user_register)).catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await login(username, password);
      if (res.status === 1) {
        onLogin();
      } else {
        setError(translateLoginApiMessage(res.msg, t));
      }
    } catch (err) {
      const raw = err instanceof Error ? err.message : '';
      setError(raw ? translateLoginApiMessage(raw, t) : t('login.loginFailed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-surface overflow-hidden">
      {/* 左侧品牌区 */}
      <section className="hidden md:flex md:w-1/2 lg:w-3/5 geometric-pattern relative overflow-hidden items-center justify-center p-16">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-400/20 blur-[100px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-primary-container/20 blur-[120px]"></div>
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="relative z-10 max-w-lg"
        >
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-ambient">
              <NetworkIcon className="text-primary w-7 h-7" />
            </div>
          </div>
          <h1 className="text-6xl font-extrabold text-white tracking-tight mb-4 leading-tight">
            {t('login.title')}
          </h1>
          <p className="text-xl text-blue-100 font-light tracking-wide mb-12 opacity-90">
            {t('login.subtitle')}
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div className="glass-panel p-6 rounded-2xl">
              <h3 className="text-white font-semibold mb-1">{t('login.secureTunnel')}</h3>
              <p className="text-blue-100/60 text-xs leading-relaxed">{t('login.secureTunnelDesc')}</p>
            </div>
            <div className="glass-panel p-6 rounded-2xl">
              <h3 className="text-white font-semibold mb-1">{t('login.realtimeMonitor')}</h3>
              <p className="text-blue-100/60 text-xs leading-relaxed">{t('login.realtimeMonitorDesc')}</p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* 右侧登录表单 */}
      <section className="w-full md:w-1/2 lg:w-2/5 flex flex-col items-center justify-center p-8 md:p-16 lg:p-24 bg-surface-container-lowest relative z-10 shadow-[-20px_0_40px_rgba(0,0,0,0.05)]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="md:hidden flex items-center gap-3 mb-8">
            <NetworkIcon className="text-primary w-8 h-8" />
            <span className="text-2xl font-bold text-on-surface">{t('login.title')}</span>
          </div>

          <div className="mb-10">
            <h2 className="text-3xl font-bold text-on-surface mb-2 tracking-tight">{t('login.formTitle')}</h2>
            <p className="text-on-surface-variant text-sm">{t('login.formDesc')}</p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="px-4 py-3 bg-error/10 border border-error/30 rounded-xl text-sm text-error">
                {error}
              </div>
            )}
            <Input
              label={t('login.username')}
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              leftIcon={<User size={20} />}
              placeholder={t('login.usernamePlaceholder')}
            />
            <PasswordInput
              label={t('login.password')}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              leftIcon={<Lock size={20} />}
              placeholder={t('login.passwordPlaceholder')}
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center gap-2 py-3.5 px-4 bg-gradient-to-r from-primary to-primary-container text-white text-sm font-bold rounded-xl shadow-ambient hover:shadow-lg hover:shadow-primary/20 active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed"
            >
              <span>{loading ? t('login.submitting') : t('login.submit')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {allowRegister && onNavigateRegister && (
              <p className="text-center text-sm text-on-surface-variant">
                {t('login.noAccount')}{' '}
                <button type="button" onClick={onNavigateRegister} className="text-primary font-medium hover:underline">
                  {t('login.registerNow')}
                </button>
              </p>
            )}
          </form>
        </motion.div>
      </section>
    </div>
  );
}

function NetworkIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="16" y="16" width="6" height="6" rx="1" />
      <rect x="2" y="16" width="6" height="6" rx="1" />
      <rect x="9" y="2" width="6" height="6" rx="1" />
      <path d="M5 16v-3a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3" />
      <path d="M12 12V8" />
    </svg>
  );
}
