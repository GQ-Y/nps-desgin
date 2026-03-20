import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Input } from './ui';
import type { ClientGroup } from '../api/client';

function buildTree(groups: ClientGroup[]): (ClientGroup & { children: ClientGroup[]; depth: number })[] {
  const map = new Map<number, ClientGroup & { children: ClientGroup[]; depth: number }>();
  groups.forEach((g) => map.set(g.id, { ...g, children: [], depth: 0 }));
  const roots: (ClientGroup & { children: ClientGroup[]; depth: number })[] = [];
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
  const setDepth = (nodes: (ClientGroup & { children: ClientGroup[]; depth: number })[], d: number) => {
    nodes.forEach((n) => {
      n.depth = d;
      setDepth(n.children as (ClientGroup & { children: ClientGroup[]; depth: number })[], d + 1);
    });
  };
  setDepth(roots, 0);
  roots.sort((a, b) => a.sort_order - b.sort_order);
  roots.forEach((r) => r.children.sort((a, b) => a.sort_order - b.sort_order));
  return roots;
}

function flattenWithDepth(
  nodes: (ClientGroup & { children: ClientGroup[]; depth: number })[],
  maxDepth: number
): { id: number; name: string; depth: number }[] {
  const result: { id: number; name: string; depth: number }[] = [];
  nodes.forEach((n) => {
    if (n.depth < maxDepth) {
      result.push({ id: n.id, name: n.name, depth: n.depth });
      result.push(...flattenWithDepth(n.children as (ClientGroup & { children: ClientGroup[]; depth: number })[], maxDepth));
    }
  });
  return result;
}

interface GroupModalProps {
  open: boolean;
  mode: 'add' | 'edit';
  groups?: ClientGroup[];
  defaultParentId?: number;
  parentName?: string;
  initialName?: string;
  onClose: () => void;
  onConfirm: (name: string, parentId?: number) => void;
}

export function GroupModal({
  open,
  mode,
  groups = [],
  defaultParentId = 0,
  parentName,
  initialName = '',
  onClose,
  onConfirm,
}: GroupModalProps) {
  const { t } = useTranslation();
  const [name, setName] = useState(initialName);
  const [parentId, setParentId] = useState(defaultParentId);

  useEffect(() => {
    if (open) {
      setName(initialName);
      setParentId(defaultParentId);
    }
  }, [open, initialName, defaultParentId]);

  if (!open) return null;

  const tree = buildTree(groups);
  const parentOptions = [
    { id: 0, name: t('client.groupRoot'), depth: 0 },
    ...flattenWithDepth(tree, 5),
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    if (mode === 'add') {
      onConfirm(trimmed, parentId);
    } else {
      onConfirm(trimmed);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} aria-hidden />
      <div className="relative bg-surface-container-lowest rounded-2xl shadow-xl border border-outline-variant/20 p-6 w-full max-w-md mx-4">
        <h3 className="text-lg font-bold text-on-surface mb-4">
          {mode === 'add'
            ? parentName
              ? t('client.addGroup') + ` (${parentName})`
              : t('client.addGroup')
            : t('client.editGroup')}
        </h3>
        <form onSubmit={handleSubmit}>
          {mode === 'add' && (
            <div className="mb-4">
              <label className="text-sm font-semibold mb-1.5 block text-on-surface">{t('client.groupParent')}</label>
              <select
                value={parentId}
                onChange={(e) => setParentId(Number(e.target.value))}
                className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-4 py-2.5 text-sm text-on-surface outline-none focus:ring-2 focus:ring-primary/30"
              >
                {parentOptions.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {'—'.repeat(opt.depth) + (opt.depth ? ' ' : '') + opt.name}
                  </option>
                ))}
              </select>
            </div>
          )}
          <Input
            label={t('client.groupName')}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t('client.groupName')}
            containerClassName="mb-6"
            required
          />
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-sm font-medium text-on-surface-variant bg-surface-container-high hover:bg-surface-container"
            >
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl text-sm font-bold text-white bg-primary hover:bg-primary/90"
            >
              {t('common.save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
