import React from 'react';
import { useTranslation } from 'react-i18next';
import { Terminal } from 'lucide-react';
import {
  IconDashboard,
  IconClients,
  IconDomain,
  IconTcp,
  IconUdp,
  IconHttp,
  IconSocks5,
  IconSecret,
  IconP2p,
  IconFile,
  IconHelp,
} from './SidebarIcons';

interface SidebarProps {
  currentView: string;
  onNavigate: (view: string) => void;
}

type NavItem = { id: string; labelKey: string; Icon: React.ComponentType<{ active?: boolean }> };

export function Sidebar({ currentView, onNavigate }: SidebarProps) {
  const { t } = useTranslation();
  const navItems: NavItem[] = [
    { id: 'dashboard', labelKey: 'sidebar.dashboard', Icon: IconDashboard },
    { id: 'clients', labelKey: 'sidebar.clients', Icon: IconClients },
    { id: 'domain', labelKey: 'sidebar.domain', Icon: IconDomain },
  ];

  const protocolItems: NavItem[] = [
    { id: 'tcp', labelKey: 'sidebar.tcp', Icon: IconTcp },
    { id: 'udp', labelKey: 'sidebar.udp', Icon: IconUdp },
    { id: 'http', labelKey: 'sidebar.httpProxy', Icon: IconHttp },
    { id: 'socks5', labelKey: 'sidebar.socks5', Icon: IconSocks5 },
  ];

  const advancedItems: NavItem[] = [
    { id: 'tunnel', labelKey: 'sidebar.secretTunnel', Icon: IconSecret },
    { id: 'p2p', labelKey: 'sidebar.p2p', Icon: IconP2p },
    { id: 'file', labelKey: 'sidebar.fileService', Icon: IconFile },
  ];

  const NavButton = ({ item, isActive }: { item: NavItem; isActive: boolean }) => {
    const { Icon } = item;
    return (
      <button
        onClick={() => onNavigate(item.id)}
        className={`relative w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors duration-150 text-sm font-medium ${
          isActive
            ? 'bg-primary/10 text-primary'
            : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
        }`}
      >
        {isActive && (
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-primary rounded-r-full" />
        )}
        <span className={`shrink-0 transition-colors duration-150 ${isActive ? 'text-primary' : 'text-outline'}`}>
          <Icon active={isActive} />
        </span>
        <span className={isActive ? 'font-semibold' : ''}>{t(item.labelKey)}</span>
      </button>
    );
  };

  return (
    <aside className="h-screen w-64 fixed left-0 top-0 bg-surface-container-low flex flex-col p-4 z-50 overflow-y-auto">
      <div className="flex items-center gap-3 px-2 mb-8">
        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white shadow-ambient">
          <Terminal size={18} />
        </div>
        <div>
          <h1 className="text-base font-bold text-on-surface leading-tight">{t('sidebar.npsAdmin')}</h1>
          <p className="text-[10px] text-outline font-bold uppercase tracking-widest mt-0.5">{t('sidebar.intranetPenetration')}</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1">
        {navItems.map((item) => (
          <NavButton
            key={item.id}
            item={item}
            isActive={
              currentView === item.id ||
              (currentView === 'add-client' && item.id === 'clients') ||
              ((currentView.startsWith('add-host-') || currentView.startsWith('edit-host-')) && item.id === 'domain')
            }
          />
        ))}

        <div className="pt-6 pb-2 px-3">
          <p className="text-[10px] font-bold text-outline uppercase tracking-widest">{t('sidebar.protocolType')}</p>
        </div>
        {protocolItems.map((item) => (
          <NavButton key={item.id} item={item} isActive={currentView === item.id} />
        ))}

        <div className="pt-6 pb-2 px-3">
          <p className="text-[10px] font-bold text-outline uppercase tracking-widest">{t('sidebar.advanced')}</p>
        </div>
        {advancedItems.map((item) => (
          <NavButton key={item.id} item={item} isActive={currentView === item.id} />
        ))}
      </nav>

      <div className="mt-auto pt-4 border-t border-outline-variant/20">
        <NavButton
          item={{ id: 'help', labelKey: 'sidebar.help', Icon: IconHelp }}
          isActive={currentView === 'help'}
        />
      </div>
    </aside>
  );
}
