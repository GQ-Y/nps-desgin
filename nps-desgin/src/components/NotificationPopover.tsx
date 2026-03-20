import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CheckCircle2, XCircle } from 'lucide-react';
import { getNotifications, type Notification } from '../api/client';

function useFormatTime() {
  const { t } = useTranslation();
  return (iso: string) => {
    try {
      const d = new Date(iso);
      const now = new Date();
      const diff = now.getTime() - d.getTime();
      if (diff < 60000) return t('notification.justNow');
      if (diff < 3600000) return t('notification.minutesAgo', { n: Math.floor(diff / 60000) });
      if (diff < 86400000) return t('notification.hoursAgo', { n: Math.floor(diff / 3600000) });
      return d.toLocaleDateString();
    } catch {
      return '';
    }
  };
}

interface NotificationPopoverProps {
  open: boolean;
  onClose: () => void;
  anchorRef: React.RefObject<HTMLButtonElement | null>;
}

export function NotificationPopover({ open, onClose, anchorRef }: NotificationPopoverProps) {
  const { t } = useTranslation();
  const formatTime = useFormatTime();
  const [list, setList] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      setLoading(true);
      getNotifications()
        .then(setList)
        .catch(() => setList([]))
        .finally(() => setLoading(false));
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      const anchor = anchorRef.current;
      const pop = popoverRef.current;
      if (
        pop &&
        anchor &&
        !pop.contains(e.target as Node) &&
        !anchor.contains(e.target as Node)
      ) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open, onClose, anchorRef]);

  if (!open) return null;

  return (
    <div
      ref={popoverRef}
      className="absolute right-0 top-full mt-2 w-80 rounded-xl border border-outline-variant/20 bg-surface-container-lowest shadow-lg z-50 overflow-hidden"
      style={{ minWidth: 280 }}
    >
      <div className="px-4 py-3 border-b border-outline-variant/15">
        <h3 className="text-sm font-semibold text-on-surface">{t('notification.title')}</h3>
      </div>
      <div className="max-h-72 overflow-y-auto">
        {loading ? (
          <div className="py-8 text-center text-on-surface-variant text-sm">{t('notification.loading')}</div>
        ) : list.length === 0 ? (
          <div className="py-8 text-center text-on-surface-variant text-sm">{t('notification.empty')}</div>
        ) : (
          <ul className="divide-y divide-outline-variant/10">
            {list.map((n) => (
              <li key={n.id} className="px-4 py-3 hover:bg-surface-container-low/50">
                <div className="flex items-start gap-3">
                  <span
                    className={`shrink-0 mt-0.5 ${n.type === 'online' ? 'text-success' : 'text-outline'}`}
                  >
                    {n.type === 'online' ? (
                      <CheckCircle2 size={16} />
                    ) : (
                      <XCircle size={16} />
                    )}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-on-surface">
                      {n.type === 'online' ? t('notification.online') : t('notification.offline')}：{n.remark || t('common.clientId', { id: n.client_id })}
                    </p>
                    {n.addr && (
                      <p className="text-xs text-on-surface-variant mt-0.5 truncate">{n.addr}</p>
                    )}
                    <p className="text-xs text-outline mt-1">{formatTime(n.created_at)}</p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
