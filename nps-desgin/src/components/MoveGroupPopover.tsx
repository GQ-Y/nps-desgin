import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
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
  excludeId: number,
  maxDepth: number
): { group: ClientGroup; depth: number }[] {
  const result: { group: ClientGroup; depth: number }[] = [];
  nodes.forEach((n) => {
    if (n.id === excludeId) return;
    if (depth < maxDepth) {
      result.push({ group: n, depth });
      result.push(...flattenWithDepth(n.children, depth + 1, excludeId, maxDepth));
    }
  });
  return result;
}

interface MoveGroupPopoverProps {
  groups: ClientGroup[];
  groupId: number;
  x: number;
  y: number;
  onSelect: (parentId: number) => void;
  onClose: () => void;
}

export function MoveGroupPopover({ groups, groupId, x, y, onSelect, onClose }: MoveGroupPopoverProps) {
  const { t } = useTranslation();
  const tree = buildTree(groups);
  const flat = flattenWithDepth(tree, 0, groupId, 5);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('[data-move-group-popover]')) onClose();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  const options = [
    { id: 0, label: t('client.groupRoot'), depth: 0 },
    ...flat.map(({ group, depth }) => ({ id: group.id, label: group.name, depth })),
  ];

  return createPortal(
    <div
      data-move-group-popover
      className="fixed z-[9999] bg-surface-container-lowest rounded-xl border border-outline-variant/20 shadow-lg py-1 max-h-60 overflow-auto min-w-40"
      style={{ left: x, top: y }}
    >
      <div className="px-3 py-2 text-xs font-semibold text-on-surface-variant border-b border-outline-variant/15">
        {t('client.moveGroup')}
      </div>
      {options.map((opt) => (
        <button
          key={opt.id}
          type="button"
          onClick={() => onSelect(opt.id)}
          className="w-full px-4 py-2.5 text-left text-sm hover:bg-surface-container-low transition-colors"
          style={{ paddingLeft: `${12 + opt.depth * 12}px` }}
        >
          {opt.label}
        </button>
      ))}
    </div>,
    document.body
  );
}
