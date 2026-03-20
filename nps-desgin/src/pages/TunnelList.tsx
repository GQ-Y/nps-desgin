import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Sidebar } from '../components/Sidebar';
import { Header } from '../components/Header';
import { Card, TableSkeleton } from '../components/Shared';
import { Search, Play, Square, Trash2, Edit2, ChevronDown, ChevronRight } from 'lucide-react';
import {
  getTunnelList,
  startTunnel,
  stopTunnel,
  delTunnel,
  getDashboard,
  type TunnelListResult,
} from '../api/client';

function formatFlow(n: number): string {
  if (n >= 1024 * 1024 * 1024) return (n / 1024 / 1024 / 1024).toFixed(1) + ' GB';
  if (n >= 1024 * 1024) return (n / 1024 / 1024).toFixed(1) + ' MB';
  if (n >= 1024) return (n / 1024).toFixed(1) + ' KB';
  return n + ' B';
}

const TYPE_KEYS: Record<string, string> = {
  tcp: 'sidebar.tcp',
  udp: 'sidebar.udp',
  http: 'sidebar.httpProxy',
  socks5: 'sidebar.socks5',
  tunnel: 'sidebar.secretTunnel',
  secret: 'sidebar.secretTunnel',
  p2p: 'sidebar.p2p',
  file: 'sidebar.fileService',
  all: 'tunnel.allTunnels',
};

const TYPE_MAP: Record<string, string> = {
  tcp: 'tcp',
  udp: 'udp',
  http: 'httpProxy',
  socks5: 'socks5',
  tunnel: 'secret',
  secret: 'secret',
  p2p: 'p2p',
  file: 'file',
  all: '',
};

export function TunnelList({
  tunnelType,
  onNavigate,
  onLogout,
  clientId,
}: {
  tunnelType: string;
  onNavigate: (view: string) => void;
  onLogout?: () => void;
  clientId?: number;
}) {
  const { t } = useTranslation();
  const [data, setData] = useState<TunnelListResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [connInfo, setConnInfo] = useState<{ ip?: string; p?: number; bridgeType?: string }>({});
  const limit = 10;

  useEffect(() => {
    getDashboard()
      .then((d) =>
        setConnInfo({
          ip: (d as { ip?: string }).ip,
          p: (d as { p?: number }).p,
          bridgeType: (d as { bridgeType?: string }).bridgeType ?? 'tcp',
        })
      )
      .catch(() => {});
  }, []);
  const typeParam = TYPE_MAP[tunnelType] ?? tunnelType;
  const typeLabel = t(TYPE_KEYS[tunnelType] ?? tunnelType);
  const title = clientId ? t('common.clientId', { id: clientId }) + ' - ' + typeLabel : typeLabel;

  const fetchList = () => {
    setLoading(true);
    getTunnelList({
      offset: page * limit,
      limit,
      type: typeParam,
      client_id: clientId ?? 0,
      search,
    })
      .then(setData)
      .catch((e) => {
        if ((e as Error).message === '未登录') onLogout?.();
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchList();
  }, [page, typeParam, clientId]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(0);
    fetchList();
  };

  const handleStart = async (id: number) => {
    try {
      await startTunnel(id);
      fetchList();
    } catch (e) {
      alert((e as Error).message);
    }
  };

  const handleStop = async (id: number) => {
    try {
      await stopTunnel(id);
      fetchList();
    } catch (e) {
      alert((e as Error).message);
    }
  };

  const handleDel = async (id: number) => {
    if (!confirm(t('tunnel.confirmDelete'))) return;
    try {
      await delTunnel(id);
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
      <Sidebar currentView={tunnelType} onNavigate={onNavigate} />
      <Header
        breadcrumbs={[{ labelKey: 'sidebar.dashboard', view: 'dashboard' }, { label: title }]}
        onNavigate={onNavigate}
        onLogout={onLogout}
      />

      <main className="ml-64 pt-20 px-10 pb-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-on-surface">{t('tunnel.list')} - {typeLabel}</h2>
          <button
            onClick={() => onNavigate(`add-tunnel-${tunnelType === 'all' ? 'tcp' : tunnelType}-${clientId ?? 0}`)}
            title={!clientId ? t('client.selectClientFirst') : ''}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary/90 transition-colors"
          >
            {t('tunnel.addTunnel')}
          </button>
        </div>

        <Card>
          <form onSubmit={handleSearch} className="flex gap-3 mb-6">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-outline" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t('tunnel.searchPlaceholder')}
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
            <TableSkeleton rows={6} cols={5} />
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-outline-variant/30">
                      <th className="w-8 py-3 px-2"></th>
                      <th className="text-left py-3 px-4 font-semibold text-on-surface-variant">{t('client.id')}</th>
                      <th className="text-left py-3 px-4 font-semibold text-on-surface-variant">{t('tunnel.port')}</th>
                      <th className="text-left py-3 px-4 font-semibold text-on-surface-variant">{t('tunnel.remark')}</th>
                      <th className="text-left py-3 px-4 font-semibold text-on-surface-variant">{t('tunnel.target')}</th>
                      <th className="text-left py-3 px-4 font-semibold text-on-surface-variant">{t('tunnel.status')}</th>
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
                        <td className="py-3 px-4 tabular-nums">{r.Port ?? '-'}</td>
                        <td className="py-3 px-4">{r.Remark || '-'}</td>
                        <td className="py-3 px-4 text-xs font-mono">{r.Target?.TargetStr || '-'}</td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${
                              r.RunStatus ? 'bg-success/20 text-success' : 'bg-outline/20 text-on-surface-variant'
                            }`}
                          >
                            {r.RunStatus ? t('client.running') : t('client.stopped')}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            {r.RunStatus ? (
                              <button
                                onClick={() => handleStop(r.Id)}
                                className="p-1.5 rounded-lg hover:bg-surface-container-high text-outline hover:text-warning transition-colors"
                                title={t('tunnel.stop')}
                              >
                                <Square size={16} />
                              </button>
                            ) : (
                              <button
                                onClick={() => handleStart(r.Id)}
                                className="p-1.5 rounded-lg hover:bg-surface-container-high text-outline hover:text-success transition-colors"
                                title={t('tunnel.start')}
                              >
                                <Play size={16} />
                              </button>
                            )}
                            <button
                              onClick={() => onNavigate(`edit-tunnel-${r.Id}`)}
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
                          </div>
                        </td>
                        </tr>
                        {expandedId === r.Id && (
                          <tr className="bg-surface-container-low/50">
                            <td colSpan={7} className="py-4 px-6">
                              <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-xs text-on-surface-variant">
                                <div>{t('tunnel.inletFlowLabel')}: {formatFlow(r.Flow?.InletFlow ?? 0)}</div>
                                <div>{t('tunnel.exportFlowLabel')}: {formatFlow(r.Flow?.ExportFlow ?? 0)}</div>
                                <div>{t('client.encrypt')}: {r.Client?.Cnf?.Crypt ? t('common.yes') : t('common.no')}</div>
                                <div>{t('client.compress')}: {r.Client?.Cnf?.Compress ? t('common.yes') : t('common.no')}</div>
                                {(r.Client?.Cnf?.U || r.Client?.Cnf?.P) && (
                                  <div className="col-span-2">{t('tunnel.basicAuth')}: {r.Client?.Cnf?.U || '-'} / ***</div>
                                )}
                                {(r.Mode === 'secret' || r.Mode === 'p2p') && connInfo.ip && connInfo.p && (
                                  <div className="col-span-2 mt-2">
                                    <span className="font-medium text-on-surface">{t('tunnel.connCommand')}:</span>
                                    <code className="block mt-1 p-2 bg-surface-container rounded font-mono text-[11px] break-all">
                                      ./npc -server={connInfo.ip}:{connInfo.p} -vkey={r.Client?.VerifyKey ?? ''}
                                      {r.Mode === 'secret' && r.Password ? ` -type=secret -password=${r.Password}` : ''}
                                      {r.Mode === 'p2p' && r.Password ? ` -type=p2p -password=${r.Password}` : ''}
                                    </code>
                                  </div>
                                )}
                              </div>
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
      </main>
    </div>
  );
}
