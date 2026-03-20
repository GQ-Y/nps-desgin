import React from 'react';
import { Terminal } from 'lucide-react';
import { motion } from 'motion/react';
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

type NavItem = { id: string; label: string; Icon: React.ComponentType<{ active?: boolean }> };

export function Sidebar({ currentView, onNavigate }: SidebarProps) {
  const navItems: NavItem[] = [
    { id: 'dashboard', label: '工作台', Icon: IconDashboard },
    { id: 'clients', label: '客户端', Icon: IconClients },
    { id: 'domain', label: '域名解析', Icon: IconDomain },
  ];

  const protocolItems: NavItem[] = [
    { id: 'tcp', label: 'TCP', Icon: IconTcp },
    { id: 'udp', label: 'UDP', Icon: IconUdp },
    { id: 'http', label: 'HTTP 代理', Icon: IconHttp },
    { id: 'socks5', label: 'SOCKS5', Icon: IconSocks5 },
  ];

  const advancedItems: NavItem[] = [
    { id: 'tunnel', label: 'Secret 隧道', Icon: IconSecret },
    { id: 'p2p', label: 'P2P', Icon: IconP2p },
    { id: 'file', label: '文件服务', Icon: IconFile },
  ];

  const NavButton = ({ item, isActive }: { item: NavItem; isActive: boolean }) => {
    const { Icon } = item;
    return (
      <motion.button
        onClick={() => onNavigate(item.id)}
        className={`relative w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 text-sm font-medium ${
          isActive
            ? 'bg-primary/10 text-primary'
            : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
        }`}
        whileHover={{ x: 2 }}
        whileTap={{ scale: 0.98 }}
      >
        {isActive && (
          <motion.div
            layoutId="sidebar-active"
            className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-primary rounded-r-full"
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          />
        )}
        <span className={`shrink-0 transition-colors duration-200 ${isActive ? 'text-primary' : 'text-outline'}`}>
          <Icon active={isActive} />
        </span>
        <span className={isActive ? 'font-semibold' : ''}>{item.label}</span>
      </motion.button>
    );
  };

  return (
    <aside className="h-screen w-64 fixed left-0 top-0 bg-surface-container-low flex flex-col p-4 z-50 overflow-y-auto">
      <div className="flex items-center gap-3 px-2 mb-8">
        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white shadow-ambient">
          <Terminal size={18} />
        </div>
        <div>
          <h1 className="text-base font-bold text-on-surface leading-tight">NPS 管理端</h1>
          <p className="text-[10px] text-outline font-bold uppercase tracking-widest mt-0.5">内网穿透</p>
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
          <p className="text-[10px] font-bold text-outline uppercase tracking-widest">协议类型</p>
        </div>
        {protocolItems.map((item) => (
          <NavButton key={item.id} item={item} isActive={currentView === item.id} />
        ))}

        <div className="pt-6 pb-2 px-3">
          <p className="text-[10px] font-bold text-outline uppercase tracking-widest">高级</p>
        </div>
        {advancedItems.map((item) => (
          <NavButton key={item.id} item={item} isActive={currentView === item.id} />
        ))}
      </nav>

      <div className="mt-auto pt-4 border-t border-outline-variant/20">
        <NavButton
          item={{ id: 'help', label: '帮助', Icon: IconHelp }}
          isActive={currentView === 'help'}
        />
      </div>
    </aside>
  );
}
