import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Sidebar } from '../components/Sidebar';
import { Header } from '../components/Header';
import { Card, TableSkeleton } from '../components/Shared';
import { ClientGroupTree } from '../components/ClientGroupTree';
import { MoveClientToGroupModal } from '../components/MoveToGroupPopover';
import { PlusCircle, Search, Edit2, Trash2, Power, PowerOff, ChevronDown, ChevronRight, Network, Globe, Copy, Check, Move } from 'lucide-react';
import {
  getClientList,
  changeClientStatus,
  delClient,
  getDashboard,
  getGroups,
  addGroup,
  editGroup,
  delGroup,
  moveGroup,
  moveClientToGroup,
  type ClientListResult,
  type ClientGroup,
} from '../api/client';

type ClientRow = ClientListResult['rows'][0];

function formatFlow(n: number): string {
  if (n >= 1024 * 1024 * 1024) return (n / 1024 / 1024 / 1024).toFixed(1) + ' GB';
  if (n >= 1024 * 1024) return (n / 1024 / 1024).toFixed(1) + ' MB';
  if (n >= 1024) return (n / 1024).toFixed(1) + ' KB';
  return n + ' B';
}

export function ClientList({
  onNavigate,
  onLogout,
}: {
  onNavigate: (view: string) => void;
  onLogout?: () => void;
}) {
  const { t } = useTranslation();
  const [data, setData] = useState<ClientListResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [isAdmin, setIsAdmin] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [ip, setIp] = useState('');
  const [bridgePort, setBridgePort] = useState(0);
  const [bridgeType, setBridgeType] = useState('tcp');
  const [groups, setGroups] = useState<ClientGroup[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState(0);
  const [moveTarget, setMoveTarget] = useState<{ clientId: number } | null>(null);
  const limit = 10;

  useEffect(() => {
    getDashboard()
      .then((d) => {
        setIsAdmin(!!(d as { isAdmin?: boolean }).isAdmin);
        setIp(String((d as { ip?: string }).ip ?? ''));
        setBridgePort(Number((d as { p?: number }).p ?? 0));
        setBridgeType(String((d as { bridgeType?: string }).bridgeType ?? 'tcp'));
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    getGroups()
      .then(setGroups)
      .catch(() => {});
  }, []);

  const fetchList = (overrides?: { offset?: number; search?: string; group_id?: number }) => {
    setLoading(true);
    const off = overrides?.offset ?? page * limit;
    const srch = overrides?.search ?? search;
    const gid = overrides?.group_id ?? selectedGroupId;
    getClientList({ offset: off, limit, search: srch, group_id: gid })
      .then((res) => {
        setData(res);
        if (res.ip) setIp(res.ip);
        if (res.bridgePort != null) setBridgePort(res.bridgePort);
        if (res.bridgeType) setBridgeType(res.bridgeType);
      })
      .catch((e) => {
        if ((e as Error).message === '未登录') onLogout?.();
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchList();
  }, [page, selectedGroupId]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(0);
    fetchList({ offset: 0, search });
  };

  const handleSelectGroup = (id: number) => {
    setSelectedGroupId(id);
    setPage(0);
  };

  const handleAddGroup = async (parentId: number, name: string) => {
    try {
      const res = await addGroup({ parent_id: parentId, name });
      if (res.status === 1) {
        const list = await getGroups();
        setGroups(list);
      } else {
        alert(res.msg);
      }
    } catch (e) {
      alert((e as Error).message);
    }
  };

  const handleEditGroup = async (g: ClientGroup, name: string) => {
    try {
      const res = await editGroup({ id: g.id, name });
      if (res.status === 1) {
        const list = await getGroups();
        setGroups(list);
      } else {
        alert(res.msg);
      }
    } catch (e) {
      alert((e as Error).message);
    }
  };

  const handleMoveGroup = async (g: ClientGroup, newParentId: number) => {
    try {
      const res = await moveGroup(g.id, newParentId);
      if (res.status === 1) {
        const list = await getGroups();
        setGroups(list);
      } else {
        alert(res.msg);
      }
    } catch (e) {
      alert((e as Error).message);
    }
  };

  const handleDelGroup = async (g: ClientGroup) => {
    if (!confirm(t('client.confirmDeleteGroup'))) return;
    try {
      const res = await delGroup(g.id);
      if (res.status === 1) {
        const list = await getGroups();
        setGroups(list);
        if (selectedGroupId === g.id) setSelectedGroupId(0);
        fetchList();
      } else {
        alert(res.msg);
      }
    } catch (e) {
      alert((e as Error).message);
    }
  };

  const handleMoveClient = async (clientId: number, groupId: number) => {
    try {
      await moveClientToGroup(clientId, groupId);
      setMoveTarget(null);
      fetchList();
    } catch (e) {
      alert((e as Error).message);
    }
  };

  const handleStatus = async (id: number, status: boolean) => {
    try {
      await changeClientStatus(id, status);
      fetchList();
    } catch (e) {
      alert((e as Error).message);
    }
  };

  const handleDel = async (id: number) => {
    if (!confirm(t('client.confirmDelete'))) return;
    try {
      await delClient(id);
      fetchList();
    } catch (e) {
      alert((e as Error).message);
    }
  };

  const rows = data?.rows ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / limit) || 1;

  return (
    <div className="min-h-screen bg-surface">
      <Sidebar currentView="clients" onNavigate={onNavigate} />
      <Header
        breadcrumbs={[{ labelKey: 'sidebar.dashboard', view: 'dashboard' }, { labelKey: 'client.list' }]}
        onNavigate={onNavigate}
        onLogout={onLogout}
      />

      <main className="ml-64 flex min-h-screen flex-col pt-20 px-10 pb-10">
        <div className="flex min-h-0 flex-1 gap-6">
          <ClientGroupTree
            groups={groups}
            selectedId={selectedGroupId}
            onSelect={handleSelectGroup}
            onAddGroup={isAdmin ? handleAddGroup : undefined}
            onEditGroup={isAdmin ? handleEditGroup : undefined}
            onDelGroup={isAdmin ? handleDelGroup : undefined}
            onMoveGroup={isAdmin ? handleMoveGroup : undefined}
            isAdmin={isAdmin}
          />
          <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-on-surface">{t('client.list')}</h2>
          {isAdmin && (
            <button
              onClick={() => onNavigate('add-client')}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary/90 transition-colors"
            >
              <PlusCircle size={18} />
              {t('client.addClient')}
            </button>
          )}
        </div>

        <Card>
          <form onSubmit={handleSearch} className="flex gap-3 mb-6">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-outline" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t('client.searchPlaceholder')}
                className="w-full pl-10 pr-4 py-2.5 bg-surface-container-low rounded-xl text-sm border-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2.5 bg-surface-container-high rounded-xl text-sm font-medium text-on-surface hover:bg-surface-container transition-colors"
            >
              {t('common.search')}
            </button>
          </form>

          {loading ? (
            <TableSkeleton rows={8} cols={10} />
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-outline-variant/30">
                      <th className="w-8 py-3 px-2"></th>
                      <th className="text-left py-3 px-4 font-semibold text-on-surface-variant">{t('client.id')}</th>
                      <th className="text-left py-3 px-4 font-semibold text-on-surface-variant">{t('client.remark')}</th>
                      <th className="text-left py-3 px-4 font-semibold text-on-surface-variant">{t('client.version')}</th>
                      <th className="text-left py-3 px-4 font-semibold text-on-surface-variant">{t('client.verifyKey')}</th>
                      <th className="text-left py-3 px-4 font-semibold text-on-surface-variant">{t('client.addr')}</th>
                      <th className="text-left py-3 px-4 font-semibold text-on-surface-variant">{t('client.inletFlow')}</th>
                      <th className="text-left py-3 px-4 font-semibold text-on-surface-variant">{t('client.exportFlow')}</th>
                      <th className="text-left py-3 px-4 font-semibold text-on-surface-variant">{t('client.speed')}</th>
                      <th className="text-left py-3 px-4 font-semibold text-on-surface-variant">{t('client.status')}</th>
                      <th className="text-left py-3 px-4 font-semibold text-on-surface-variant">{t('client.connCount')}</th>
                      <th className="text-left py-3 px-4 font-semibold text-on-surface-variant">{t('client.actions')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((r) => (
                      <React.Fragment key={r.Id}>
                        <tr className="border-b border-outline-variant/15 hover:bg-surface-container-low/50">
                          <td className="py-2 px-2">
                            <button
                              onClick={() => setExpandedId(expandedId === r.Id ? null : r.Id)}
                              className="p-1 rounded hover:bg-surface-container-high text-outline"
                            >
                              {expandedId === r.Id ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                            </button>
                          </td>
                          <td className="py-3 px-4 tabular-nums">{r.Id}</td>
                          <td className="py-3 px-4">{r.Remark || '-'}</td>
                          <td className="py-3 px-4 tabular-nums">{r.Version || '-'}</td>
                          <td className="py-3 px-4 font-mono text-xs">
                            {r.NoStore ? t('client.publicKey') : (r.VerifyKey || '-')}
                          </td>
                          <td className="py-3 px-4 text-xs">{r.Addr || '-'}</td>
                          <td className="py-3 px-4 tabular-nums text-xs">{formatFlow(r.Flow?.InletFlow ?? 0)}</td>
                          <td className="py-3 px-4 tabular-nums text-xs">{formatFlow(r.Flow?.ExportFlow ?? 0)}</td>
                          <td className="py-3 px-4 tabular-nums text-xs">{formatFlow(r.Rate?.NowRate ?? 0)}/s</td>
                          <td className="py-3 px-4">
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${
                                r.IsConnect ? 'bg-success/20 text-success' : 'bg-outline/20 text-on-surface-variant'
                              }`}
                            >
                              {r.IsConnect ? t('client.online') : t('client.offline')}
                            </span>
                          </td>
                          <td className="py-3 px-4 tabular-nums">
                            {r.NowConn ?? 0} / {r.MaxConn ?? 0}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2 flex-wrap">
                              <button
                                onClick={() => onNavigate(`tunnel-all-${r.Id}`)}
                                className="flex items-center gap-1 px-2 py-1 rounded-lg bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20"
                              >
                                <Network size={12} />
                                {t('client.tunnel')}
                              </button>
                              <button
                                onClick={() => onNavigate(`domain-${r.Id}`)}
                                className="flex items-center gap-1 px-2 py-1 rounded-lg bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20"
                              >
                                <Globe size={12} />
                                {t('client.domain')}
                              </button>
                              {isAdmin && groups.length > 0 && (
                                <button
                                  type="button"
                                  onClick={() => setMoveTarget({ clientId: r.Id })}
                                  className="p-1.5 rounded-lg hover:bg-surface-container-high text-outline hover:text-primary transition-colors"
                                  title={t('client.moveToGroup')}
                                >
                                  <Move size={16} />
                                </button>
                              )}
                              {isAdmin && (
                                <>
                                  <button
                                    onClick={() => handleStatus(r.Id, !r.Status)}
                                    className="p-1.5 rounded-lg hover:bg-surface-container-high text-outline hover:text-primary transition-colors"
                                    title={r.Status ? t('client.disable') : t('client.enable')}
                                  >
                                    {r.Status ? <PowerOff size={16} /> : <Power size={16} />}
                                  </button>
                                  <button
                                    onClick={() => onNavigate(`edit-client-${r.Id}`)}
                                    className="p-1.5 rounded-lg hover:bg-surface-container-high text-outline hover:text-primary transition-colors"
                                    title={t('common.edit')}
                                  >
                                    <Edit2 size={16} />
                                  </button>
                                  <button
                                    onClick={() => handleDel(r.Id)}
                                    className="p-1.5 rounded-lg hover:bg-surface-container-high text-outline hover:text-error transition-colors"
                                    title={t('common.delete')}
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </>
                              )}
                              {!isAdmin && (
                                <button
                                  onClick={() => onNavigate(`edit-client-${r.Id}`)}
                                  className="p-1.5 rounded-lg hover:bg-surface-container-high text-outline hover:text-primary transition-colors"
                                  title="编辑"
                                >
                                  <Edit2 size={16} />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                        {expandedId === r.Id && (
                          <tr className="bg-surface-container-low/50">
                            <td colSpan={12} className="py-4 px-6 text-xs">
                              <ClientDetail row={r} ip={ip} p={bridgePort} bridgeType={bridgeType} />
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>

              {rows.length === 0 && (
                <div className="py-12 text-center text-on-surface-variant text-sm">{t('common.noData')}</div>
              )}

              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6 pt-4 border-t border-outline-variant/15">
                  <span className="text-sm text-on-surface-variant">{t('common.totalCount', { count: total })}</span>
                  <div className="flex gap-2">
                    <button
                      disabled={page === 0}
                      onClick={() => setPage((p) => p - 1)}
                      className="px-3 py-1.5 rounded-lg text-sm font-medium bg-surface-container-low hover:bg-surface-container disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {t('common.prevPage')}
                    </button>
                    <button
                      disabled={page >= totalPages - 1}
                      onClick={() => setPage((p) => p + 1)}
                      className="px-3 py-1.5 rounded-lg text-sm font-medium bg-surface-container-low hover:bg-surface-container disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {t('common.nextPage')}
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </Card>
          </div>
        </div>
        {moveTarget && (
          <MoveClientToGroupModal
            groups={groups}
            clientId={moveTarget.clientId}
            onSelect={(groupId) => handleMoveClient(moveTarget.clientId, groupId)}
            onClose={() => setMoveTarget(null)}
          />
        )}
      </main>
    </div>
  );
}

function ClientDetail({ row, ip, p, bridgeType }: { row: ClientRow; ip: string; p: number; bridgeType: string }) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);
  const win = typeof navigator !== 'undefined' && /Win/i.test(navigator.userAgent) ? '.exe' : '';
  const cmd = row.NoStore
    ? null
    : `./npc${win} -server=${ip}:${p} -vkey=${row.VerifyKey ?? ''} -type=${bridgeType}`;

  const copyCmd = () => {
    if (!cmd) return;
    navigator.clipboard.writeText(cmd).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  const flowLimitMb = (row.Flow?.FlowLimit ?? 0) > 0 ? row.Flow!.FlowLimit! : null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <DetailSection title={t('client.connectionLimit')}>
        <DetailItem label={t('client.maxConn')} value={`${row.NowConn ?? 0} / ${row.MaxConn ?? 0}`} />
        <DetailItem label={t('client.flowLimit')} value={flowLimitMb != null ? `${flowLimitMb} MB` : t('client.unlimited')} />
        <DetailItem label={t('client.rateLimit')} value={(row.RateLimit ?? 0) > 0 ? `${row.RateLimit} KB/s` : t('client.unlimited')} />
        <DetailItem label={t('client.maxTunnelNum')} value={String(row.MaxTunnelNum ?? 0)} />
      </DetailSection>
      <DetailSection title={t('client.authInfo')}>
        <DetailItem label={t('client.webUsername')} value={row.WebUserName || '-'} />
        <DetailItem label={t('client.webPassword')} value={row.WebPassword ? '****' : '-'} />
        <DetailItem label={t('client.basicUsername')} value={row.Cnf?.U || '-'} />
        <DetailItem label={t('client.basicPassword')} value={row.Cnf?.P ? '****' : '-'} />
      </DetailSection>
      <DetailSection title={t('client.securityOptions')}>
        <DetailItem label={t('client.encrypt')} value={row.Cnf?.Crypt ? t('common.yes') : t('common.no')} />
        <DetailItem label={t('client.compress')} value={row.Cnf?.Compress ? t('common.yes') : t('common.no')} />
        <DetailItem label={t('client.configConnOnly')} value={row.ConfigConnAllow ? t('common.yes') : t('common.no')} />
      </DetailSection>
      <div className="md:col-span-3 pt-2 border-t border-outline-variant/15">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-semibold text-on-surface-variant shrink-0">{t('client.connCommand')}</span>
          {cmd ? (
            <>
              <code className="flex-1 min-w-0 bg-surface-container-high px-3 py-2 rounded-lg text-xs font-mono break-all">
                {cmd}
              </code>
              <button
                type="button"
                onClick={copyCmd}
                className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20 transition-colors"
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
                {copied ? t('client.copied') : t('client.copy')}
              </button>
            </>
          ) : (
            <span className="text-xs text-on-surface-variant">{t('client.publicKeyMode')}</span>
          )}
        </div>
      </div>
    </div>
  );
}

function DetailSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <h4 className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-3">{title}</h4>
      {children}
    </div>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 text-xs">
      <span className="text-on-surface-variant shrink-0">{label}</span>
      <span className="text-on-surface font-medium tabular-nums truncate">{value}</span>
    </div>
  );
}
