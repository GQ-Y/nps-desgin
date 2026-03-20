import React from 'react';
import { Hub, Shield, Activity, User, Lock, Eye, QrCode, Fingerprint, ArrowRight, Globe2, HeadphonesIcon } from 'lucide-react';
import { motion } from 'motion/react';

interface LoginProps {
  onLogin: () => void;
}

export function Login({ onLogin }: LoginProps) {
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-surface overflow-hidden">
      {/* Top Right Language Switcher */}
      <div className="fixed top-6 right-8 z-50 flex items-center">
        <button className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-surface-container-lowest shadow-sm hover:bg-surface-container-high transition-all text-sm font-medium text-on-surface-variant border border-outline-variant/15">
          <Globe2 size={16} />
          <span>English</span>
        </button>
      </div>

      {/* Left Panel: Branding */}
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
            <div className="h-px w-12 bg-white/30"></div>
          </div>
          
          <h1 className="text-6xl font-extrabold text-white tracking-tight mb-4 leading-tight">
            NPS Manager
          </h1>
          <p className="text-xl text-blue-100 font-light tracking-wide mb-12 opacity-90">
            Enterprise Proxy Hub
          </p>

          <div className="grid grid-cols-2 gap-4">
            <div className="glass-panel p-6 rounded-2xl">
              <Shield className="text-white/80 mb-3 w-6 h-6" />
              <h3 className="text-white font-semibold mb-1">Secure Tunnel</h3>
              <p className="text-blue-100/60 text-xs leading-relaxed">Bank-grade encryption for all client nodes.</p>
            </div>
            <div className="glass-panel p-6 rounded-2xl">
              <Activity className="text-white/80 mb-3 w-6 h-6" />
              <h3 className="text-white font-semibold mb-1">Real-time Stats</h3>
              <p className="text-blue-100/60 text-xs leading-relaxed">Monitor bandwidth and active connections instantly.</p>
            </div>
          </div>
        </motion.div>

        <div className="absolute bottom-12 left-16 text-white/40 text-xs font-mono tracking-wider">
          SYSTEM_STATUS: STABLE // NODE_CLUSTER: ACTIVE
        </div>
      </section>

      {/* Right Panel: Login Form */}
      <section className="w-full md:w-1/2 lg:w-2/5 flex flex-col items-center justify-center p-8 md:p-16 lg:p-24 bg-surface-container-lowest relative z-10 shadow-[-20px_0_40px_rgba(0,0,0,0.05)]">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="md:hidden flex items-center gap-3 mb-8">
            <NetworkIcon className="text-primary w-8 h-8" />
            <span className="text-2xl font-bold text-on-surface">NPS Manager</span>
          </div>

          <div className="mb-10">
            <h2 className="text-3xl font-bold text-on-surface mb-2 tracking-tight">Sign In</h2>
            <p className="text-on-surface-variant text-sm">Welcome back, please login to your enterprise account.</p>
          </div>

          <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); onLogin(); }}>
            <div>
              <label className="block text-sm font-semibold text-on-surface mb-2" htmlFor="username">Username</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className="text-outline w-5 h-5" />
                </div>
                <input 
                  type="text" 
                  id="username" 
                  className="block w-full pl-11 pr-4 py-3 bg-surface-container-low border-none rounded-xl text-on-surface placeholder-outline focus:ring-2 focus:ring-primary/30 focus:bg-surface-container-lowest transition-all" 
                  placeholder="Enter your username" 
                  defaultValue="admin"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-semibold text-on-surface" htmlFor="password">Password</label>
                <a href="#" className="text-xs text-primary font-medium hover:underline">Forgot password?</a>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="text-outline w-5 h-5" />
                </div>
                <input 
                  type="password" 
                  id="password" 
                  className="block w-full pl-11 pr-12 py-3 bg-surface-container-low border-none rounded-xl text-on-surface placeholder-outline focus:ring-2 focus:ring-primary/30 focus:bg-surface-container-lowest transition-all" 
                  placeholder="Enter your password" 
                  defaultValue="password"
                />
                <button type="button" className="absolute inset-y-0 right-0 pr-4 flex items-center text-outline hover:text-on-surface-variant">
                  <Eye className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex items-center">
              <input 
                type="checkbox" 
                id="remember-me" 
                className="h-4 w-4 text-primary focus:ring-primary/30 border-outline-variant rounded bg-surface-container-lowest" 
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-on-surface-variant">
                Keep me signed in
              </label>
            </div>

            <button 
              type="submit" 
              className="w-full flex justify-center items-center gap-2 py-3.5 px-4 bg-gradient-to-r from-primary to-primary-container text-white text-sm font-bold rounded-xl shadow-ambient hover:shadow-lg hover:shadow-primary/20 active:scale-[0.98] transition-all"
            >
              <span>Sign In</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-10 pt-8 border-t border-outline-variant/20">
            <p className="text-center text-xs text-on-surface-variant mb-4 font-medium uppercase tracking-wider">Or continue with</p>
            <div className="flex justify-center gap-4">
              <button className="w-12 h-12 flex items-center justify-center rounded-full bg-surface-container-low hover:bg-surface-container-high transition-colors text-on-surface-variant hover:text-primary">
                <QrCode className="w-5 h-5" />
              </button>
              <button className="w-12 h-12 flex items-center justify-center rounded-full bg-surface-container-low hover:bg-surface-container-high transition-colors text-on-surface-variant hover:text-primary">
                <Fingerprint className="w-5 h-5" />
              </button>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="fixed bottom-0 right-0 w-full md:w-2/5 py-6 px-8 z-20 pointer-events-none">
        <div className="flex flex-col items-center gap-4 pointer-events-auto">
          <div className="flex items-center gap-6">
            <a href="#" className="text-xs text-outline hover:text-primary transition-colors flex items-center gap-1">
              <HeadphonesIcon className="w-3.5 h-3.5" />
              Support
            </a>
            <a href="#" className="text-xs text-outline hover:text-primary transition-colors">Privacy</a>
            <a href="#" className="text-xs text-outline hover:text-primary transition-colors">Terms</a>
            <div className="h-3 w-px bg-outline-variant/50"></div>
            <div className="text-[10px] text-outline px-2 py-0.5 rounded bg-surface-container-low uppercase tracking-tighter font-mono">v2.4.0-stable</div>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Custom icon to match the 'hub' look
function NetworkIcon(props: any) {
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
