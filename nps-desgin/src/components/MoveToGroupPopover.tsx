import React, { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { Search } from 'lucide-react';
import type { ClientGroup } from '../api/client';

function buildTree(groups: ClientGroup[]): (ClientGroup & { children: ClientGroup[] })[] {
  const map = new Map<number, ClientGroup & { children: ClientGroup[] }>();
  groups.forEach((g) => map.set(g.id, { ...g, children: [] }));
  const roots: (ClientGroup & { children: ClientGroup[] })[] = [];
  groups.forEach((g) => {
    const node = map.get(g.id)!;
    if (g.parent_id === 0) {
      roots.push(node);
    } else {
      const parent = map.get(g.parent_id);
      if (parent) parent.children.push(node);
      else roots.push(node);
    }
  });
  roots.sort((a, b) => a.sort_order - b.sort_order);
  roots.forEach((r) => r.children.sort((a, b) => a.sort_order - b.sort_order));
  return roots;
}

function flattenWithDepth(
  nodes: (ClientGroup & { children: ClientGroup[] })[],
  depth: number,
  maxDepth: number
): { group: ClientGroup; depth: number }[] {
  const result: { group: ClientGroup; depth: number }[] = [];
  nodes.forEach((n) => {
    if (depth < maxDepth) result.push({ group: n, depth });
    result.push(...flattenWithDepth(n.children, depth + 1, maxDepth));
  });
  return result;
}

interface MoveClientToGroupModalProps {
  groups: ClientGroup[];
  clientId: number;
  onSelect: (groupId: number) => void;
  onClose: () => void;
}

export function MoveClientToGroupModal({ groups, clientId, onSelect, onClose }: MoveClientToGroupModalProps) {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');

  const options = useMemo(() => {
    const tree = buildTree(groups);
    const flat = flattenWithDepth(tree, 0, 5);
    return [
      { id: 0, label: t('client.noGroup'), depth: 0 },
      ...flat.map(({ group, depth }) => ({ id: group.id, label: group.name, depth })),
    ];
  }, [groups, t]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((o) => o.label.toLowerCase().includes(q));
  }, [options, query]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} aria-hidden />
      <div
        data-move-client-modal
        className="relative flex w-full max-w-md flex-col rounded-2xl border border-outline-variant/20 bg-surface-container-lowest shadow-xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="move-client-group-title"
      >
        <div className="shrink-0 border-b border-outline-variant/15 px-5 py-4">
          <h2 id="move-client-group-title" className="text-lg font-bold text-on-surface">
            {t('client.moveToGroup')}
          </h2>
          <p className="mt-1 text-xs text-on-surface-variant">
            {t('client.moveToGroupClientHint', { id: clientId })}
          </p>
        </div>
        <div className="shrink-0 px-5 pt-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-outline" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t('client.moveToGroupSearch')}
              className="w-full rounded-xl border border-outline-variant/30 bg-surface-container-low py-2.5 pl-9 pr-3 text-sm text-on-surface outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
        </div>
        <div className="max-h-[min(50vh,360px)] min-h-[140px] overflow-y-auto px-2 py-2">
          {filtered.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-on-surface-variant">{t('common.noData')}</div>
          ) : (
            filtered.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => onSelect(opt.id)}
                className="w-full rounded-lg px-4 py-2.5 text-left text-sm text-on-surface transition-colors hover:bg-surface-container-low"
                style={{ paddingLeft: `${12 + opt.depth * 12}px` }}
              >
                {opt.label}
              </button>
            ))
          )}
        </div>
        <div className="flex shrink-0 justify-end gap-3 border-t border-outline-variant/15 px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl px-4 py-2 text-sm font-medium text-on-surface-variant bg-surface-container-high hover:bg-surface-container"
          >
            {t('common.cancel')}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

/** @deprecated 使用 MoveClientToGroupModal */
export const MoveToGroupPopover = MoveClientToGroupModal;
