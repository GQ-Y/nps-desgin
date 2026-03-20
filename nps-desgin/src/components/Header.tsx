import React, { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronRight, Bell, Globe2, LogOut } from 'lucide-react';
import { logout } from '../api/client';
import { NotificationPopover } from './NotificationPopover';
import i18n from '../i18n';

interface Breadcrumb {
  label?: string;
  labelKey?: string;
  view?: string;
}

interface HeaderProps {
  breadcrumbs: Breadcrumb[];
  onNavigate: (view: string) => void;
  onLogout?: () => void;
}

export function Header({ breadcrumbs, onNavigate, onLogout }: HeaderProps) {
  const { t } = useTranslation();
  const [notifOpen, setNotifOpen] = useState(false);
  const bellRef = useRef<HTMLButtonElement>(null);
  const isDashboard = breadcrumbs[0]?.view === 'dashboard';

  const getLabel = (crumb: Breadcrumb) => (crumb.labelKey ? t(crumb.labelKey) : crumb.label ?? '');

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
                {getLabel(crumb)}
              </span>
            </React.Fragment>
          ))}
          {isDashboard && (
            <span className="ml-4 px-2 py-0.5 rounded text-[10px] font-bold bg-primary-fixed text-primary uppercase tracking-tighter">
              {t('header.production')}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-4">
          {isDashboard && (
            <div className="relative flex h-9 w-9 items-center justify-center">
              <button
                ref={bellRef}
                type="button"
                onClick={() => setNotifOpen((o) => !o)}
                className="inline-flex h-9 w-9 items-center justify-center text-outline hover:text-primary transition-colors"
                title={t('header.notifications')}
              >
                <Bell size={18} />
              </button>
              <NotificationPopover
                open={notifOpen}
                onClose={() => setNotifOpen(false)}
                anchorRef={bellRef}
              />
            </div>
          )}
          <button
            type="button"
            onClick={() => i18n.changeLanguage(i18n.language === 'zh-CN' ? 'en' : 'zh-CN')}
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center text-outline hover:text-primary transition-colors"
            title={i18n.language === 'zh-CN' ? 'English' : '中文'}
          >
            <Globe2 size={18} />
          </button>

          <div className="flex items-center gap-2 cursor-pointer group">
            <div className="w-7 h-7 rounded-full bg-primary-fixed flex items-center justify-center text-primary overflow-hidden">
              <img
                src="https://api.dicebear.com/7.x/avataaars/svg?seed=Admin&backgroundColor=dbe1ff"
                alt={t('header.user')}
                className="w-full h-full object-cover"
              />
            </div>
            <span className="text-sm font-medium text-on-surface group-hover:text-primary transition-colors">{t('header.admin')}</span>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center text-outline hover:text-error transition-colors ml-2"
            title={t('header.logout')}
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </header>
  );
}
