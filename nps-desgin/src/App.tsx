import React, { useState, useEffect } from 'react';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { AddClient } from './pages/AddClient';
import { ClientList } from './pages/ClientList';
import { EditClient } from './pages/EditClient';
import { TunnelList } from './pages/TunnelList';
import { DomainList } from './pages/DomainList';
import { AddTunnel } from './pages/AddTunnel';
import { EditTunnel } from './pages/EditTunnel';
import { AddHost } from './pages/AddHost';
import { EditHost } from './pages/EditHost';
import { Help } from './pages/Help';
import { UserCenter } from './pages/UserCenter';
import { getDashboard } from './api/client';
import { AppLoadSkeleton } from './components/Shared';

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
    return <AppLoadSkeleton />;
  }

  return (
    <div className="antialiased text-on-surface bg-surface min-h-screen">
      {currentView === 'login' && (
        <Login
          onLogin={() => navigate('dashboard')}
          onNavigateRegister={() => navigate('register')}
        />
      )}
      {currentView === 'register' && (
        <Register onSuccess={() => navigate('login')} onBack={() => navigate('login')} />
      )}
      {currentView === 'dashboard' && <Dashboard onNavigate={navigate} onLogout={goLogin} />}
      {currentView === 'add-client' && <AddClient onNavigate={navigate} onLogout={goLogin} />}
      {currentView === 'clients' && <ClientList onNavigate={navigate} onLogout={goLogin} />}
      {currentView.startsWith('edit-client-') && (
        <EditClient
          clientId={parseInt(currentView.replace('edit-client-', ''), 10)}
          onNavigate={navigate}
          onLogout={goLogin}
        />
      )}
      {(currentView === 'domain' || currentView.startsWith('domain-')) && (
        <DomainList
          onNavigate={navigate}
          onLogout={goLogin}
          clientId={currentView.startsWith('domain-') ? parseInt(currentView.replace('domain-', ''), 10) : undefined}
        />
      )}
      {currentView.startsWith('add-tunnel-') && (() => {
        const parts = currentView.replace('add-tunnel-', '').split('-');
        const t = parts[0];
        const cid = parseInt(parts[1], 10) || 0;
        return (
          <AddTunnel
            tunnelType={t}
            clientId={cid}
            onNavigate={navigate}
            onLogout={goLogin}
          />
        );
      })()}
      {currentView.startsWith('edit-tunnel-') && (
        <EditTunnel
          tunnelId={parseInt(currentView.replace('edit-tunnel-', ''), 10)}
          onNavigate={navigate}
          onLogout={goLogin}
        />
      )}
      {currentView.startsWith('add-host-') && (
        <AddHost
          clientId={parseInt(currentView.replace('add-host-', ''), 10) || 0}
          onNavigate={navigate}
          onLogout={goLogin}
        />
      )}
      {currentView.startsWith('edit-host-') && (
        <EditHost
          hostId={parseInt(currentView.replace('edit-host-', ''), 10)}
          onNavigate={navigate}
          onLogout={goLogin}
        />
      )}
      {currentView === 'help' && <Help onNavigate={navigate} onLogout={goLogin} />}
      {currentView === 'user-center' && <UserCenter onNavigate={navigate} onLogout={goLogin} />}
      {currentView.startsWith('tunnel-all-') && (
        <TunnelList
          tunnelType="all"
          onNavigate={navigate}
          onLogout={goLogin}
          clientId={parseInt(currentView.replace('tunnel-all-', ''), 10) || undefined}
        />
      )}
      {['tcp', 'udp', 'http', 'socks5', 'tunnel', 'p2p', 'file'].includes(currentView) && (
        <TunnelList
          tunnelType={currentView}
          onNavigate={navigate}
          onLogout={goLogin}
        />
      )}
    </div>
  );
}
