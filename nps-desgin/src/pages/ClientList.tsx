import React, { useState, useEffect } from 'react';
import { Sidebar } from '../components/Sidebar';
import { Header } from '../components/Header';
import { Card, TableSkeleton } from '../components/Shared';
import { PlusCircle, Search, Edit2, Trash2, Power, PowerOff, ChevronDown, ChevronRight, Network, Globe, Copy, Check } from 'lucide-react';
import {
  getClientList,
  changeClientStatus,
  delClient,
  getDashboard,
  type ClientListResult,
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
  const [data, setData] = useState<ClientListResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [isAdmin, setIsAdmin] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [ip, setIp] = useState('');
  const [bridgePort, setBridgePort] = useState(0);
  const [bridgeType, setBridgeType] = useState('tcp');
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

  const fetchList = (overrides?: { offset?: number; search?: string }) => {
    setLoading(true);
    const off = overrides?.offset ?? page * limit;
    const srch = overrides?.search ?? search;
    getClientList({ offset: off, limit, search: srch })
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
  }, [page]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(0);
    fetchList({ offset: 0, search });
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
    if (!confirm('确定要删除该客户端吗？')) return;
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
        breadcrumbs={[{ label: '工作台', view: 'dashboard' }, { label: '客户端列表' }]}
        onNavigate={onNavigate}
        onLogout={onLogout}
        showTabs
      />

      <main className="ml-64 pt-20 px-10 pb-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-on-surface">客户端列表</h2>
          {isAdmin && (
            <button
              onClick={() => onNavigate('add-client')}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary/90 transition-colors"
            >
              <PlusCircle size={18} />
              新增客户端
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
                placeholder="搜索备注、验证密钥..."
                className="w-full pl-10 pr-4 py-2.5 bg-surface-container-low rounded-xl text-sm border-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2.5 bg-surface-container-high rounded-xl text-sm font-medium text-on-surface hover:bg-surface-container transition-colors"
            >
              搜索
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
                      <th className="text-left py-3 px-4 font-semibold text-on-surface-variant">ID</th>
                      <th className="text-left py-3 px-4 font-semibold text-on-surface-variant">备注</th>
                      <th className="text-left py-3 px-4 font-semibold text-on-surface-variant">版本</th>
                      <th className="text-left py-3 px-4 font-semibold text-on-surface-variant">验证密钥</th>
                      <th className="text-left py-3 px-4 font-semibold text-on-surface-variant">地址</th>
                      <th className="text-left py-3 px-4 font-semibold text-on-surface-variant">入站流量</th>
                      <th className="text-left py-3 px-4 font-semibold text-on-surface-variant">出站流量</th>
                      <th className="text-left py-3 px-4 font-semibold text-on-surface-variant">速度</th>
                      <th className="text-left py-3 px-4 font-semibold text-on-surface-variant">状态</th>
                      <th className="text-left py-3 px-4 font-semibold text-on-surface-variant">连接数</th>
                      <th className="text-left py-3 px-4 font-semibold text-on-surface-variant">操作</th>
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
                            {r.NoStore ? '公钥' : (r.VerifyKey || '-')}
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
                              {r.IsConnect ? '在线' : '离线'}
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
                                隧道
                              </button>
                              <button
                                onClick={() => onNavigate(`domain-${r.Id}`)}
                                className="flex items-center gap-1 px-2 py-1 rounded-lg bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20"
                              >
                                <Globe size={12} />
                                域名
                              </button>
                              {isAdmin && (
                                <>
                                  <button
                                    onClick={() => handleStatus(r.Id, !r.Status)}
                                    className="p-1.5 rounded-lg hover:bg-surface-container-high text-outline hover:text-primary transition-colors"
                                    title={r.Status ? '禁用' : '启用'}
                                  >
                                    {r.Status ? <PowerOff size={16} /> : <Power size={16} />}
                                  </button>
                                  <button
                                    onClick={() => onNavigate(`edit-client-${r.Id}`)}
                                    className="p-1.5 rounded-lg hover:bg-surface-container-high text-outline hover:text-primary transition-colors"
                                    title="编辑"
                                  >
                                    <Edit2 size={16} />
                                  </button>
                                  <button
                                    onClick={() => handleDel(r.Id)}
                                    className="p-1.5 rounded-lg hover:bg-surface-container-high text-outline hover:text-error transition-colors"
                                    title="删除"
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
                <div className="py-12 text-center text-on-surface-variant text-sm">暂无数据</div>
              )}

              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6 pt-4 border-t border-outline-variant/15">
                  <span className="text-sm text-on-surface-variant">共 {total} 条</span>
                  <div className="flex gap-2">
                    <button
                      disabled={page === 0}
                      onClick={() => setPage((p) => p - 1)}
                      className="px-3 py-1.5 rounded-lg text-sm font-medium bg-surface-container-low hover:bg-surface-container disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      上一页
                    </button>
                    <button
                      disabled={page >= totalPages - 1}
                      onClick={() => setPage((p) => p + 1)}
                      className="px-3 py-1.5 rounded-lg text-sm font-medium bg-surface-container-low hover:bg-surface-container disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      下一页
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

function ClientDetail({ row, ip, p, bridgeType }: { row: ClientRow; ip: string; p: number; bridgeType: string }) {
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
      <DetailSection title="连接与限制">
        <DetailItem label="最大连接" value={`${row.NowConn ?? 0} / ${row.MaxConn ?? 0}`} />
        <DetailItem label="流量限制" value={flowLimitMb != null ? `${flowLimitMb} MB` : '不限'} />
        <DetailItem label="速率限制" value={(row.RateLimit ?? 0) > 0 ? `${row.RateLimit} KB/s` : '不限'} />
        <DetailItem label="最大隧道数" value={String(row.MaxTunnelNum ?? 0)} />
      </DetailSection>
      <DetailSection title="认证信息">
        <DetailItem label="Web 用户名" value={row.WebUserName || '-'} />
        <DetailItem label="Web 密码" value={row.WebPassword ? '****' : '-'} />
        <DetailItem label="Basic 用户名" value={row.Cnf?.U || '-'} />
        <DetailItem label="Basic 密码" value={row.Cnf?.P ? '****' : '-'} />
      </DetailSection>
      <DetailSection title="安全选项">
        <DetailItem label="加密" value={row.Cnf?.Crypt ? '是' : '否'} />
        <DetailItem label="压缩" value={row.Cnf?.Compress ? '是' : '否'} />
        <DetailItem label="仅配置连接" value={row.ConfigConnAllow ? '是' : '否'} />
      </DetailSection>
      <div className="md:col-span-3 pt-2 border-t border-outline-variant/15">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-semibold text-on-surface-variant shrink-0">客户端连接命令</span>
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
                {copied ? '已复制' : '复制'}
              </button>
            </>
          ) : (
            <span className="text-xs text-on-surface-variant">公钥模式，请在编辑页查看连接方式</span>
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
