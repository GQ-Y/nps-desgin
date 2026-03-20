import React, { useState, useEffect } from 'react';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { AddClient } from './pages/AddClient';
import { ClientList } from './pages/ClientList';
import { getDashboard } from './api/client';

export default function App() {
  const [currentView, setCurrentView] = useState<string>('login');
  const [authChecked, setAuthChecked] = useState(false);

  const navigate = (view: string) => {
    setCurrentView(view);
    window.scrollTo(0, 0);
  };

  const goLogin = () => {
    setCurrentView('login');
  };

  useEffect(() => {
    getDashboard()
      .then(() => {
        setCurrentView((v) => (v === 'login' ? 'dashboard' : v));
      })
      .catch(() => {
        setCurrentView('login');
      })
      .finally(() => setAuthChecked(true));
  }, []);

  if (!authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="text-on-surface-variant text-sm">加载中...</div>
      </div>
    );
  }

  return (
    <div className="antialiased text-on-surface bg-surface min-h-screen">
      {currentView === 'login' && <Login onLogin={() => navigate('dashboard')} />}
      {currentView === 'dashboard' && <Dashboard onNavigate={navigate} onLogout={goLogin} />}
      {currentView === 'add-client' && <AddClient onNavigate={navigate} onLogout={goLogin} />}
      {currentView === 'clients' && <ClientList onNavigate={navigate} onLogout={goLogin} />}
      {['domain', 'tcp', 'udp', 'http', 'socks5', 'tunnel', 'p2p', 'file'].includes(currentView) && (
        <Dashboard onNavigate={navigate} onLogout={goLogin} />
      )}
    </div>
  );
}
