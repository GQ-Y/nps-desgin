import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Sidebar } from '../components/Sidebar';
import { Header } from '../components/Header';
import { Card, TableSkeleton } from '../components/Shared';
import { Search, Trash2, Edit2, ChevronDown, ChevronRight } from 'lucide-react';
import {
  getHostList,
  delHost,
  type HostListResult,
} from '../api/client';

function formatFlow(n: number): string {
  if (n >= 1024 * 1024 * 1024) return (n / 1024 / 1024 / 1024).toFixed(1) + ' GB';
  if (n >= 1024 * 1024) return (n / 1024 / 1024).toFixed(1) + ' MB';
  if (n >= 1024) return (n / 1024).toFixed(1) + ' KB';
  return n + ' B';
}

export function DomainList({
  onNavigate,
  onLogout,
  clientId,
}: {
  onNavigate: (view: string) => void;
  onLogout?: () => void;
  clientId?: number;
}) {
  const { t } = useTranslation();
  const [data, setData] = useState<HostListResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const limit = 10;

  const fetchList = (overrides?: { offset?: number; search?: string }) => {
    setLoading(true);
    const off = overrides?.offset ?? page * limit;
    const srch = overrides?.search ?? search;
    getHostList({ offset: off, limit, search: srch, client_id: clientId })
      .then(setData)
      .catch((e) => {
        if ((e as Error).message === '未登录') onLogout?.();
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchList();
  }, [page, clientId]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(0);
    fetchList({ offset: 0, search });
  };

  const handleDel = async (id: number) => {
    if (!confirm(t('domain.confirmDelete'))) return;
    try {
      await delHost(id);
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
      <Sidebar currentView="domain" onNavigate={onNavigate} />
      <Header
        breadcrumbs={[{ labelKey: 'sidebar.dashboard', view: 'dashboard' }, { labelKey: 'sidebar.domain' }]}
        onNavigate={onNavigate}
        onLogout={onLogout}
      />

      <main className="ml-64 pt-20 px-10 pb-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-on-surface">
            {clientId ? t('client.clientDetail', { id: clientId }) : t('domain.listTitle')}
          </h2>
          <button
            onClick={() => onNavigate(`add-host-${clientId ?? 0}`)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary/90 transition-colors"
          >
            {t('domain.addDomain')}
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
                placeholder={t('domain.searchPlaceholder')}
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
                      <th className="text-left py-3 px-4 font-semibold text-on-surface-variant">{t('domain.domain')}</th>
                      <th className="text-left py-3 px-4 font-semibold text-on-surface-variant">{t('domain.protocol')}</th>
                      <th className="text-left py-3 px-4 font-semibold text-on-surface-variant">{t('domain.target')}</th>
                      <th className="text-left py-3 px-4 font-semibold text-on-surface-variant">{t('tunnel.remark')}</th>
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
                          <td className="py-3 px-4 font-mono">{r.Host || '-'}</td>
                          <td className="py-3 px-4">{r.Scheme || 'http'}</td>
                          <td className="py-3 px-4 text-xs font-mono">{r.Target?.TargetStr || '-'}</td>
                          <td className="py-3 px-4">{r.Remark || '-'}</td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => onNavigate(`edit-host-${r.Id}`)}
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
                            <td colSpan={6} className="py-4 px-6">
                              <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-xs text-on-surface-variant">
                                <div>{t('tunnel.inletFlowLabel')}: {formatFlow(r.Flow?.InletFlow ?? 0)}</div>
                                <div>{t('tunnel.exportFlowLabel')}: {formatFlow(r.Flow?.ExportFlow ?? 0)}</div>
                                {r.CertFilePath && <div className="col-span-2">{t('domain.certPath')}: {r.CertFilePath}</div>}
                                {r.KeyFilePath && <div className="col-span-2">{t('domain.keyPath')}: {r.KeyFilePath}</div>}
                                {r.HeaderChange && <div className="col-span-2">{t('domain.requestHeader')}: {r.HeaderChange}</div>}
                                {r.HostChange && <div className="col-span-2">{t('domain.requestHost')}: {r.HostChange}</div>}
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
