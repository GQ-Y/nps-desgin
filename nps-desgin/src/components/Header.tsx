import React from 'react';
import { ChevronRight, Bell, Globe2, LogOut } from 'lucide-react';
import { logout } from '../api/client';

interface HeaderProps {
  breadcrumbs: { label: string; view?: string }[];
  onNavigate: (view: string) => void;
  onLogout?: () => void;
  showTabs?: boolean;
}

export function Header({ breadcrumbs, onNavigate, onLogout, showTabs = false }: HeaderProps) {
  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      onLogout?.();
    }
  };

  return (
    <header className="fixed top-0 right-0 w-[calc(100%-16rem)] h-14 bg-surface-container-lowest/80 backdrop-blur-md flex justify-between items-center px-8 z-40">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-sm">
          {breadcrumbs.map((crumb, index) => (
            <React.Fragment key={index}>
              {index > 0 && <ChevronRight size={14} className="text-outline" />}
              <span
                className={`${index === breadcrumbs.length - 1 ? 'text-on-surface font-semibold' : 'text-on-surface-variant cursor-pointer hover:text-primary transition-colors'}`}
                onClick={() => crumb.view && onNavigate(crumb.view)}
              >
                {crumb.label}
              </span>
            </React.Fragment>
          ))}
          {breadcrumbs[0].label === '工作台' && (
            <span className="ml-4 px-2 py-0.5 rounded text-[10px] font-bold bg-primary-fixed text-primary uppercase tracking-tighter">
              生产环境
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-6">
        {showTabs && (
          <div className="flex items-center gap-6 border-r border-outline-variant/30 pr-6 h-14">
            <button
              onClick={() => onNavigate('dashboard')}
              className="text-on-surface-variant hover:text-primary text-sm font-medium transition-all"
            >
              工作台
            </button>
            <button className="text-primary font-medium text-sm border-b-2 border-primary h-full flex items-center transition-all">
              客户端列表
            </button>
          </div>
        )}

        <div className="flex items-center gap-4">
          {breadcrumbs[0].label === '工作台' && (
            <button className="text-outline hover:text-primary transition-colors relative">
              <Bell size={18} />
            </button>
          )}
          <button className="text-outline hover:text-primary transition-colors">
            <Globe2 size={18} />
          </button>

          <div className="flex items-center gap-2 cursor-pointer group">
            <div className="w-7 h-7 rounded-full bg-primary-fixed flex items-center justify-center text-primary overflow-hidden">
              <img
                src="https://api.dicebear.com/7.x/avataaars/svg?seed=Admin&backgroundColor=dbe1ff"
                alt="用户"
                className="w-full h-full object-cover"
              />
            </div>
            <span className="text-sm font-medium text-on-surface group-hover:text-primary transition-colors">管理员</span>
          </div>

          <button
            onClick={handleLogout}
            className="text-outline hover:text-error transition-colors ml-2"
            title="退出登录"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </header>
  );
}
