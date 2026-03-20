import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronRight, Bell, Globe2, LogOut } from 'lucide-react';
import { getDashboard, logout } from '../api/client';
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
  const { t, i18n } = useTranslation();
  const [notifOpen, setNotifOpen] = useState(false);
  const [userLabel, setUserLabel] = useState<string>(() => t('header.admin'));
  const bellRef = useRef<HTMLButtonElement>(null);
  const isDashboard = breadcrumbs[0]?.view === 'dashboard';

  useEffect(() => {
    getDashboard()
      .then((d) => {
        if (d.isAdmin === true) {
          setUserLabel(t('header.admin'));
        } else {
          setUserLabel(d.username ? String(d.username) : t('header.user'));
        }
      })
      .catch(() => {
        setUserLabel(t('header.admin'));
      });
  }, [t, i18n.language]);

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

          <button
            type="button"
            onClick={() => onNavigate('user-center')}
            className="flex items-center gap-2 cursor-pointer group rounded-lg px-1 -mx-1 py-0.5 hover:bg-surface-container-high/80 transition-colors"
            title={t('userCenter.title')}
            aria-label={t('userCenter.title')}
          >
            <div className="w-7 h-7 rounded-full bg-primary-fixed flex items-center justify-center text-primary shrink-0">
              {/* 默认系统用户头像：简洁单色剪影，无外链 */}
              <svg
                viewBox="0 0 24 24"
                className="w-[18px] h-[18px]"
                fill="currentColor"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden
              >
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
              </svg>
            </div>
            <span className="text-sm font-medium text-on-surface group-hover:text-primary transition-colors">{userLabel}</span>
          </button>

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
