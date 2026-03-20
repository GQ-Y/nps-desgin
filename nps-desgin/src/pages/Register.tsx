import React, { useState } from 'react';
import { User, Lock, ArrowRight } from 'lucide-react';
import { Input, PasswordInput } from '../components/ui';
import { motion } from 'motion/react';
import { register } from '../api/client';

interface RegisterProps {
  onSuccess: () => void;
  onBack: () => void;
}

export function Register({ onSuccess, onBack }: RegisterProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!username.trim() || !password.trim()) {
      setError('请输入用户名和密码');
      return;
    }
    setLoading(true);
    try {
      const res = await register(username.trim(), password.trim());
      if (res.status === 1) {
        onSuccess();
      } else {
        setError(res.msg || '注册失败');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '注册失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-surface overflow-hidden">
      <section className="hidden md:flex md:w-1/2 lg:w-3/5 geometric-pattern relative overflow-hidden items-center justify-center p-16">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-400/20 blur-[100px]"></div>
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-10 max-w-lg"
        >
          <h1 className="text-5xl font-extrabold text-white tracking-tight mb-4">注册账号</h1>
          <p className="text-xl text-blue-100 font-light opacity-90">创建新的 Web 管理账号</p>
        </motion.div>
      </section>

      <section className="w-full md:w-1/2 lg:w-2/5 flex flex-col items-center justify-center p-8 md:p-16 bg-surface-container-lowest relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="mb-10">
            <h2 className="text-3xl font-bold text-on-surface mb-2 tracking-tight">注册</h2>
            <p className="text-on-surface-variant text-sm">请输入用户名和密码创建账号。</p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="px-4 py-3 bg-error/10 border border-error/30 rounded-xl text-sm text-error">
                {error}
              </div>
            )}
            <Input
              label="用户名"
              id="reg-username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              leftIcon={<User size={20} />}
              placeholder="请输入用户名"
            />
            <PasswordInput
              label="密码"
              id="reg-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              leftIcon={<Lock size={20} />}
              placeholder="请输入密码"
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center gap-2 py-3.5 px-4 bg-gradient-to-r from-primary to-primary-container text-white text-sm font-bold rounded-xl shadow-ambient hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
            >
              <span>{loading ? '注册中...' : '注册'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={onBack}
              className="w-full py-2.5 text-sm font-medium text-on-surface-variant hover:text-primary transition-colors"
            >
              返回登录
            </button>
          </form>
        </motion.div>
      </section>
    </div>
  );
}
