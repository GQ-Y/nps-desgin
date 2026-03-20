import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { ChevronRight, ChevronDown, Folder, FolderOpen, Layers, Plus, MoreVertical, Move } from 'lucide-react';
import { GroupModal } from './GroupModal';
import { MoveGroupPopover } from './MoveGroupPopover';
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

interface ClientGroupTreeProps {
  groups: ClientGroup[];
  selectedId: number;
  onSelect: (id: number) => void;
  onAddGroup?: (parentId: number, name: string) => void | Promise<void>;
  onEditGroup?: (g: ClientGroup, name: string) => void | Promise<void>;
  onDelGroup?: (g: ClientGroup) => void | Promise<void>;
  onMoveGroup?: (g: ClientGroup, newParentId: number) => void | Promise<void>;
  isAdmin?: boolean;
}

const LONG_PRESS_MS = 500;

export function ClientGroupTree({
  groups,
  selectedId,
  onSelect,
  onAddGroup,
  onEditGroup,
  onDelGroup,
  onMoveGroup,
  isAdmin,
}: ClientGroupTreeProps) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState<Set<number>>(new Set());
  const [menuPopup, setMenuPopup] = useState<{
    id: number;
    top: number;
    right: number;
    node: ClientGroup;
  } | null>(null);
  const [moveTarget, setMoveTarget] = useState<{ group: ClientGroup; x: number; y: number } | null>(null);
  const longPressRef = React.useRef<{ timer: ReturnType<typeof setTimeout>; node: ClientGroup & { children: (ClientGroup & { children: ClientGroup[] })[] }; el: HTMLElement } | null>(null);
  const longPressFiredRef = React.useRef(false);
  const [modal, setModal] = useState<{
    mode: 'add' | 'edit';
    parentId?: number;
    parentName?: string;
    group?: ClientGroup;
  } | null>(null);

  const tree = buildTree(groups);

  const toggleExpand = (id: number) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const renderNode = (
    node: ClientGroup & { children: (ClientGroup & { children: ClientGroup[] })[] },
    depth: number
  ) => {
    const hasChildren = node.children.length > 0;
    const isExpanded = expanded.has(node.id);
    const isSelected = selectedId === node.id;

    return (
      <div key={node.id} className="select-none">
        <div
          className={`flex items-center gap-1 py-1.5 px-2 rounded-lg cursor-pointer group ${
            isSelected ? 'bg-primary/15 text-primary' : 'hover:bg-surface-container-low text-on-surface'
          }`}
          style={{ paddingLeft: `${depth * 12 + 8}px` }}
          onTouchStart={
            isAdmin && onMoveGroup
              ? (e) => {
                  const el = e.currentTarget as HTMLElement;
                  longPressRef.current = {
                    timer: setTimeout(() => {
                      const rect = el.getBoundingClientRect();
                      longPressFiredRef.current = true;
                      setMoveTarget({
                        group: {
                          id: node.id,
                          parent_id: node.parent_id,
                          name: node.name,
                          sort_order: node.sort_order,
                        },
                        x: rect.left,
                        y: rect.bottom + 4,
                      });
                      longPressRef.current = null;
                      setTimeout(() => { longPressFiredRef.current = false; }, 100);
                    }, LONG_PRESS_MS),
                    node,
                    el,
                  };
                }
              : undefined
          }
          onTouchEnd={
            isAdmin && onMoveGroup
              ? () => {
                  if (longPressRef.current?.node.id === node.id) {
                    clearTimeout(longPressRef.current.timer);
                    longPressRef.current = null;
                  }
                }
              : undefined
          }
          onTouchMove={
            isAdmin && onMoveGroup
              ? () => {
                  if (longPressRef.current?.node.id === node.id) {
                    clearTimeout(longPressRef.current.timer);
                    longPressRef.current = null;
                  }
                }
              : undefined
          }
          onMouseDown={
            isAdmin && onMoveGroup
              ? (e) => {
                  const el = e.currentTarget as HTMLElement;
                  longPressRef.current = {
                    timer: setTimeout(() => {
                      const rect = el.getBoundingClientRect();
                      longPressFiredRef.current = true;
                      setMoveTarget({
                        group: {
                          id: node.id,
                          parent_id: node.parent_id,
                          name: node.name,
                          sort_order: node.sort_order,
                        },
                        x: rect.left,
                        y: rect.bottom + 4,
                      });
                      longPressRef.current = null;
                      setTimeout(() => { longPressFiredRef.current = false; }, 100);
                    }, LONG_PRESS_MS),
                    node,
                    el,
                  };
                }
              : undefined
          }
          onMouseUp={
            isAdmin && onMoveGroup
              ? () => {
                  if (longPressRef.current?.node.id === node.id) {
                    clearTimeout(longPressRef.current.timer);
                    longPressRef.current = null;
                  }
                }
              : undefined
          }
          onMouseLeave={
            isAdmin && onMoveGroup
              ? () => {
                  if (longPressRef.current?.node.id === node.id) {
                    clearTimeout(longPressRef.current.timer);
                    longPressRef.current = null;
                  }
                }
              : undefined
          }
        >
          {hasChildren ? (
            <button
              type="button"
              onClick={() => toggleExpand(node.id)}
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded p-0.5 -ml-0.5 hover:bg-surface-container-high"
            >
              {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </button>
          ) : (
            <span className="flex h-7 w-7 shrink-0 items-center justify-center p-0.5 -ml-0.5" aria-hidden>
              <Folder size={14} className="shrink-0 text-on-surface-variant" />
            </span>
          )}
          <button
            type="button"
            onClick={() => {
              if (longPressFiredRef.current) return;
              onSelect(node.id);
            }}
            className="flex min-w-0 flex-1 items-center gap-1.5 text-left"
          >
            {hasChildren ? (
              isExpanded ? (
                <FolderOpen size={14} className="shrink-0 text-on-surface-variant" />
              ) : (
                <Folder size={14} className="shrink-0 text-on-surface-variant" />
              )
            ) : null}
            <span className="truncate text-sm">{node.name}</span>
          </button>
          {isAdmin && (onEditGroup || onDelGroup || onAddGroup) && (
            <div className="relative shrink-0">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  const rect = e.currentTarget.getBoundingClientRect();
                  const g: ClientGroup = {
                    id: node.id,
                    parent_id: node.parent_id,
                    name: node.name,
                    sort_order: node.sort_order,
                  };
                  if (menuPopup?.id === node.id) {
                    setMenuPopup(null);
                  } else {
                    setMenuPopup({
                      id: node.id,
                      top: rect.bottom + 4,
                      right: window.innerWidth - rect.right,
                      node: g,
                    });
                  }
                }}
                className="p-1.5 rounded hover:bg-surface-container-high text-outline hover:text-on-surface"
              >
                <MoreVertical size={14} />
              </button>
            </div>
          )}
        </div>
        {hasChildren && isExpanded && (
          <div>
            {node.children.map((child) => renderNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  const menuPortal =
    menuPopup &&
    typeof document !== 'undefined' &&
    createPortal(
      <>
        <div className="fixed inset-0 z-[9997]" onClick={() => setMenuPopup(null)} aria-hidden />
        <div
          className="fixed z-[9998] min-w-36 rounded-lg border border-outline-variant/20 bg-surface-container-lowest py-1 shadow-lg"
          style={{ top: menuPopup.top, right: menuPopup.right }}
        >
          {onAddGroup && (
            <button
              type="button"
              onClick={() => {
                const n = menuPopup.node;
                setMenuPopup(null);
                setModal({ mode: 'add', parentId: n.id, parentName: n.name });
              }}
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-surface-container-low"
            >
              <Plus size={14} />
              {t('client.addSubGroup')}
            </button>
          )}
          {onMoveGroup && (
            <button
              type="button"
              onClick={(e) => {
                const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                const n = menuPopup.node;
                setMenuPopup(null);
                setMoveTarget({ group: n, x: rect.left, y: rect.bottom + 4 });
              }}
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-surface-container-low"
            >
              <Move size={14} />
              {t('client.moveGroup')}
            </button>
          )}
          {onEditGroup && (
            <button
              type="button"
              onClick={() => {
                setMenuPopup(null);
                setModal({ mode: 'edit', group: menuPopup.node });
              }}
              className="w-full px-3 py-2 text-left text-sm hover:bg-surface-container-low"
            >
              {t('client.editGroup')}
            </button>
          )}
          {onDelGroup && (
            <button
              type="button"
              onClick={() => {
                onDelGroup(menuPopup.node);
                setMenuPopup(null);
              }}
              className="w-full px-3 py-2 text-left text-sm text-error hover:bg-surface-container-low"
            >
              {t('client.deleteGroup')}
            </button>
          )}
        </div>
      </>,
      document.body
    );

  return (
    <div className="flex h-full min-h-0 w-56 shrink-0 flex-col self-stretch rounded-xl border border-outline-variant/15 bg-surface-container-low p-2">
      <div className="flex items-center justify-between mb-2 px-2">
        <span className="text-xs font-semibold text-on-surface-variant uppercase">{t('client.group')}</span>
        {isAdmin && onAddGroup && (
          <button
            type="button"
            onClick={() =>
              setModal({
                mode: 'add',
                parentId: selectedId > 0 ? selectedId : 0,
                parentName: selectedId > 0 ? groups.find((g) => g.id === selectedId)?.name : undefined,
              })
            }
            className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-medium bg-primary/15 text-primary hover:bg-primary/25"
          >
            <Plus size={14} />
            {t('client.addGroup')}
          </button>
        )}
      </div>
      <button
        type="button"
        onClick={() => onSelect(0)}
        className={`flex w-full items-center gap-2 py-1.5 px-2 rounded-lg text-left text-sm ${
          selectedId === 0 ? 'bg-primary/15 text-primary' : 'text-on-surface hover:bg-surface-container-low'
        }`}
      >
        <Layers size={14} className="shrink-0 opacity-90" />
        <span className="truncate">{t('client.allGroups')}</span>
      </button>
      <button
        type="button"
        onClick={() => onSelect(-1)}
        className={`flex w-full items-center gap-2 py-1.5 px-2 rounded-lg text-left text-sm ${
          selectedId === -1 ? 'bg-primary/15 text-primary' : 'hover:bg-surface-container-low text-on-surface'
        }`}
      >
        <Folder size={14} className="shrink-0 opacity-90" />
        <span className="truncate">{t('client.noGroup')}</span>
      </button>
      <div className="mt-1 min-h-0 flex-1 overflow-y-auto">
        {tree.map((node) => renderNode(node, 0))}
      </div>
      {menuPortal}
      {modal && (
        <GroupModal
          open
          mode={modal.mode}
          groups={groups}
          defaultParentId={modal.mode === 'add' ? (modal.parentId ?? 0) : 0}
          parentName={modal.mode === 'add' && modal.parentId !== 0 ? modal.parentName : undefined}
          initialName={modal.group?.name ?? ''}
          onClose={() => setModal(null)}
          onConfirm={(name, parentId) => {
            if (modal.mode === 'add' && onAddGroup) {
              onAddGroup(parentId ?? modal.parentId ?? 0, name);
            } else if (modal.mode === 'edit' && modal.group && onEditGroup) {
              onEditGroup(modal.group, name);
            }
            setModal(null);
          }}
        />
      )}
      {moveTarget && (
        <MoveGroupPopover
          groups={groups}
          groupId={moveTarget.group.id}
          x={moveTarget.x}
          y={moveTarget.y}
          onSelect={(parentId) => {
            onMoveGroup?.(moveTarget.group, parentId);
            setMoveTarget(null);
          }}
          onClose={() => setMoveTarget(null)}
        />
      )}
    </div>
  );
}
