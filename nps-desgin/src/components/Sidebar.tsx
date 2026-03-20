import React from 'react';
import {
  LayoutDashboard,
  Users,
  Globe,
  Network,
  Router,
  Shield,
  Lock,
  TrainTrack,
  Radio,
  FolderOpen,
  HelpCircle,
  Terminal,
} from 'lucide-react';

interface SidebarProps {
  currentView: string;
  onNavigate: (view: string) => void;
}

export function Sidebar({ currentView, onNavigate }: SidebarProps) {
  const navItems = [
    { id: 'dashboard', label: '工作台', icon: LayoutDashboard },
    { id: 'clients', label: '客户端', icon: Users },
    { id: 'domain', label: '域名解析', icon: Globe },
  ];

  const protocolItems = [
    { id: 'tcp', label: 'TCP', icon: Network },
    { id: 'udp', label: 'UDP', icon: Router },
    { id: 'http', label: 'HTTP 代理', icon: Shield },
    { id: 'socks5', label: 'SOCKS5', icon: Lock },
  ];

  const advancedItems = [
    { id: 'tunnel', label: 'Secret 隧道', icon: TrainTrack },
    { id: 'p2p', label: 'P2P', icon: Radio },
    { id: 'file', label: '文件服务', icon: FolderOpen },
  ];

  const NavButton = ({ item, isActive }: { item: (typeof navItems)[0]; isActive: boolean }) => {
    const Icon = item.icon;
    return (
      <button
        onClick={() => onNavigate(item.id)}
        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 text-sm font-medium ${
          isActive
            ? 'bg-surface-container-lowest text-primary shadow-sm'
            : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
        }`}
      >
        <Icon size={18} className={isActive ? 'text-primary' : 'text-outline'} />
        {item.label}
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
        <button
          onClick={() => onNavigate('help')}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 text-sm font-medium ${
            currentView === 'help'
              ? 'bg-surface-container-lowest text-primary shadow-sm'
              : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
          }`}
        >
          <HelpCircle size={18} className={currentView === 'help' ? 'text-primary' : 'text-outline'} />
          帮助
        </button>
      </div>
    </aside>
  );
}
