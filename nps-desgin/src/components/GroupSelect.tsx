import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { ChevronDown, Folder, FolderOpen, Layers } from 'lucide-react';
import type { ClientGroup } from '../api/client';

function buildTree(groups: ClientGroup[]): (ClientGroup & { children: (ClientGroup & { children: ClientGroup[] })[] })[] {
  const map = new Map<number, ClientGroup & { children: (ClientGroup & { children: ClientGroup[] })[] }>();
  groups.forEach((g) => map.set(g.id, { ...g, children: [] }));
  const roots: (ClientGroup & { children: (ClientGroup & { children: ClientGroup[] })[] })[] = [];
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
  nodes: (ClientGroup & { children: (ClientGroup & { children: ClientGroup[] })[] })[],
  depth: number,
  maxDepth: number
): { group: ClientGroup; depth: number; hasChildren: boolean }[] {
  const result: { group: ClientGroup; depth: number; hasChildren: boolean }[] = [];
  nodes.forEach((n) => {
    const hasChildren = n.children.length > 0;
    if (depth < maxDepth) result.push({ group: n, depth, hasChildren });
    result.push(...flattenWithDepth(n.children, depth + 1, maxDepth));
  });
  return result;
}

interface GroupSelectProps {
  groups: ClientGroup[];
  value: number;
  onChange: (id: number) => void;
  label?: string;
  className?: string;
  /** form 模式：0=未分组，>0=分组；filter 模式：0=全部，-1=未分组，>0=分组 */
  mode?: 'form' | 'filter';
  /** 最大层级，form 模式默认 5 */
  maxDepth?: number;
}

export function GroupSelect({ groups, value, onChange, label, className = '', mode = 'form', maxDepth = 5 }: GroupSelectProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0, width: 0 });
  const ref = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const t = e.target as Node;
      if (ref.current?.contains(t)) return;
      // 下拉通过 portal 挂在 body 上，不在 ref 内，需单独判断否则会先关闭再无法触发选项 onClick
      if ((t as Element).closest?.('[data-group-select-dropdown]')) return;
      setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    if (open && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setPosition({ top: rect.bottom + 4, left: rect.left, width: rect.width });
    }
  }, [open]);

  const tree = buildTree(groups);
  const depthLimit = mode === 'form' ? maxDepth : 99;
  const flat = flattenWithDepth(tree, 0, depthLimit);

  const display =
    mode === 'filter'
      ? value === 0
        ? t('client.allGroups')
        : value === -1
          ? t('client.noGroup')
          : groups.find((g) => g.id === value)?.name ?? t('client.noGroup')
      : value === 0
        ? t('client.noGroup')
        : groups.find((g) => g.id === value)?.name ?? t('client.noGroup');

  type OptRow =
    | { id: number; label: string; depth: 0; row: 'all' }
    | { id: number; label: string; depth: 0; row: 'noGroup' }
    | { id: number; label: string; depth: number; row: 'group'; hasChildren: boolean };

  const options: OptRow[] =
    mode === 'filter'
      ? [
          { id: 0, label: t('client.allGroups'), depth: 0, row: 'all' },
          { id: -1, label: t('client.noGroup'), depth: 0, row: 'noGroup' },
          ...flat.map(({ group, depth, hasChildren }) => ({
            id: group.id,
            label: group.name,
            depth,
            row: 'group' as const,
            hasChildren,
          })),
        ]
      : [
          { id: 0, label: t('client.noGroup'), depth: 0, row: 'noGroup' },
          ...flat.map(({ group, depth, hasChildren }) => ({
            id: group.id,
            label: group.name,
            depth,
            row: 'group' as const,
            hasChildren,
          })),
        ];

  const iconForRow = (opt: OptRow, selected: boolean) => {
    const ic = selected ? 'text-primary' : 'text-on-surface-variant';
    if (opt.row === 'all') {
      return <Layers size={14} className={`shrink-0 opacity-90 ${ic}`} />;
    }
    if (opt.row === 'noGroup') {
      return <Folder size={14} className={`shrink-0 opacity-90 ${ic}`} />;
    }
    return opt.hasChildren ? (
      <FolderOpen size={14} className={`shrink-0 ${ic}`} />
    ) : (
      <Folder size={14} className={`shrink-0 ${ic}`} />
    );
  };

  const triggerIcon = () => {
    const ic = 'text-on-surface-variant';
    if (mode === 'filter') {
      if (value === 0) return <Layers size={14} className={`shrink-0 opacity-90 ${ic}`} />;
      if (value === -1) return <Folder size={14} className={`shrink-0 opacity-90 ${ic}`} />;
    } else if (value === 0) {
      return <Folder size={14} className={`shrink-0 opacity-90 ${ic}`} />;
    }
    const g = groups.find((x) => x.id === value);
    if (!g) return <Folder size={14} className={`shrink-0 opacity-90 ${ic}`} />;
    const hasChildren = groups.some((x) => x.parent_id === g.id);
    return hasChildren ? (
      <FolderOpen size={14} className={`shrink-0 ${ic}`} />
    ) : (
      <Folder size={14} className={`shrink-0 ${ic}`} />
    );
  };

  const dropdown = open && (
    <div
      data-group-select-dropdown
      onMouseDown={(e) => e.stopPropagation()}
      className="fixed z-[9999] max-h-60 overflow-y-auto rounded-xl border border-outline-variant/20 bg-surface-container-lowest py-1 shadow-lg"
      style={{ top: position.top, left: position.left, width: Math.max(position.width, 160), minWidth: 120 }}
    >
      {options.map((opt) => {
        const selected = opt.id === value;
        return (
          <button
            key={`${opt.row}-${opt.id}`}
            type="button"
            onClick={() => {
              onChange(opt.id);
              setOpen(false);
            }}
            className={`flex w-full items-center gap-2 py-2.5 pr-4 text-left text-sm transition-colors ${
              selected ? 'bg-primary/10 font-medium text-primary' : 'text-on-surface hover:bg-surface-container-low'
            }`}
            style={{ paddingLeft: `${12 + opt.depth * 12}px` }}
          >
            {iconForRow(opt, selected)}
            <span className="min-w-0 truncate">{opt.label}</span>
          </button>
        );
      })}
    </div>
  );

  return (
    <div className={className} ref={ref}>
      {label && (
        <label className="text-sm font-semibold mb-1.5 block text-on-surface">{label}</label>
      )}
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full cursor-pointer items-center justify-between gap-2 rounded-xl border-none bg-surface-container-low py-3 pl-4 pr-4 text-left text-sm text-on-surface outline-none hover:bg-surface-container-high focus:ring-2 focus:ring-primary/30"
      >
        <span className="flex min-w-0 flex-1 items-center gap-2">
          {triggerIcon()}
          <span className={`min-w-0 truncate ${value !== undefined ? 'text-on-surface' : 'text-outline'}`}>{display}</span>
        </span>
        <ChevronDown size={16} className={`shrink-0 text-outline transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {typeof document !== 'undefined' && dropdown && createPortal(dropdown, document.body)}
    </div>
  );
}
