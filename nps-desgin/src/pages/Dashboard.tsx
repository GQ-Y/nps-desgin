import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Sidebar } from '../components/Sidebar';
import { Header } from '../components/Header';
import { Card, DashboardSkeleton } from '../components/Shared';
import {
  PlusCircle,
  Settings2,
  Globe,
  Activity,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  PieChart as PieChartIcon,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import { getDashboard, type DashboardData } from '../api/client';

function formatBytes(n: number): string {
  if (n >= 1024 * 1024 * 1024) return (n / 1024 / 1024 / 1024).toFixed(1) + ' GB';
  if (n >= 1024 * 1024) return (n / 1024 / 1024).toFixed(1) + ' MB';
  if (n >= 1024) return (n / 1024).toFixed(1) + ' KB';
  return n + ' B';
}

/** 隧道类型饼图配色（与设计 token 一致，环形分段） */
const TUNNEL_PIE_COLORS = [
  'var(--color-primary)',
  'var(--color-primary-container)',
  'var(--color-secondary)',
  'var(--color-secondary-container)',
  '#4d6ee8',
  '#8fa8f5',
  '#b8c9fa',
];

function TunnelTypeTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ name?: string; value?: number; payload?: { fill?: string } }>;
}) {
  if (!active || !payload?.length) return null;
  const p = payload[0];
  const name = p.name ?? '';
  const value = Number(p.value ?? 0);
  const fill = p.payload?.fill ?? 'var(--color-primary)';
  return (
    <div className="rounded-xl border border-outline-variant/25 bg-surface-container-lowest px-3 py-2.5 shadow-lg backdrop-blur-sm">
      <div className="flex items-center gap-2">
        <span className="h-2.5 w-2.5 shrink-0 rounded-full shadow-sm" style={{ backgroundColor: fill }} />
        <span className="text-xs font-semibold text-on-surface">{name}</span>
      </div>
      <p className="mt-1 pl-4 text-lg font-bold tabular-nums text-primary">{value}</p>
    </div>
  );
}

export function Dashboard({ onNavigate, onLogout }: { onNavigate: (view: string) => void; onLogout?: () => void }) {
  const { t } = useTranslation();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getDashboard()
      .then(setData)
      .catch((e) => {
        const msg = e instanceof Error ? e.message : '加载失败';
        setError(msg);
        if (msg === '未登录') onLogout?.();
      })
      .finally(() => setLoading(false));
  }, [onLogout]);

  const clientCount = data?.clientCount ?? 0;
  const clientOnline = data?.clientOnlineCount ?? 0;
  const offlineCount = Math.max(0, clientCount - clientOnline);
  const onlineRate = clientCount > 0 ? ((clientOnline / clientCount) * 100).toFixed(1) : '0';
  const tcpCount = data?.tcpCount ?? 0;
  const totalTunnels =
    (data?.tcpC ?? 0) +
    (data?.udpCount ?? 0) +
    (data?.socks5Count ?? 0) +
    (data?.httpProxyCount ?? 0) +
    (data?.secretCount ?? 0) +
    (data?.p2pCount ?? 0);
  const hostCount = data?.hostCount ?? 0;

  return (
    <div className="min-h-screen bg-surface">
      <Sidebar currentView="dashboard" onNavigate={onNavigate} />
      <Header
        breadcrumbs={[{ labelKey: 'sidebar.dashboard', view: 'dashboard' }, { labelKey: 'dashboard.systemOverview' }]}
        onNavigate={onNavigate}
        onLogout={onLogout}
      />

      <main className="ml-64 pt-20 px-8 pb-10 space-y-6">
        {error && (
          <div className="bg-error/10 border border-error/30 rounded-xl px-4 py-3 text-sm text-error flex items-center gap-2">
            <AlertTriangle size={16} />
            {error}
          </div>
        )}

        {offlineCount > 0 && (
          <div className="bg-alert-bg border border-warning/20 rounded-xl px-4 py-3 flex items-center justify-between mt-4">
            <div className="flex items-center gap-2 text-sm text-warning font-medium">
              <AlertTriangle size={16} />
              <span>{t('dashboard.offlineAlert', { count: offlineCount })}</span>
            </div>
            <button
              onClick={() => onNavigate('clients')}
              className="text-sm text-primary font-semibold hover:underline transition-colors"
            >
              {t('common.handle')}
            </button>
          </div>
        )}

        <section className="flex flex-wrap gap-3 pb-2">
          <QuickAction icon={PlusCircle} label={t('dashboard.addClient')} onClick={() => onNavigate('add-client')} />
          <QuickAction icon={Settings2} label={t('dashboard.clientManage')} onClick={() => onNavigate('clients')} />
          <QuickAction icon={Globe} label={t('dashboard.domainResolve')} onClick={() => onNavigate('domain')} />
        </section>

        {loading ? (
          <DashboardSkeleton />
        ) : (
          <>
            <section className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <KpiCard
                title={t('dashboard.bridgePort')}
                value={String(data?.p ?? '-')}
                subtitle={t('dashboard.bridgeSubtitle')}
                accent="border-l-primary"
              />
              <KpiCard
                title={t('dashboard.clientTotal')}
                value={String(clientCount)}
                subtitle={
                  <>
                    <CheckCircle2 size={12} className="inline mr-1" />
                    {t('dashboard.registered')}
                  </>
                }
                bgIcon={null}
              />
              <KpiCard
                title={t('dashboard.onlineClient')}
                value={String(clientOnline)}
                status="online"
                subtitle={t('dashboard.onlineRate', { rate: onlineRate })}
              />
              <KpiCard
                title={t('dashboard.tcpConn')}
                value={tcpCount.toLocaleString()}
                subtitle={
                  <span className="text-primary flex items-center gap-1">
                    <TrendingUp size={12} />
                    {t('dashboard.connecting')}
                  </span>
                }
                pattern={true}
              />
              <Card className="flex flex-col justify-between">
                <div>
                  <p className="text-xs font-medium text-on-surface-variant mb-1">{t('dashboard.tunnelTotal')}</p>
                  <h3 className="text-3xl font-bold tabular-nums text-on-surface leading-none">{(data?.tcpC ?? 0) + (data?.udpCount ?? 0) + (data?.socks5Count ?? 0) + (data?.httpProxyCount ?? 0) + (data?.secretCount ?? 0) + (data?.p2pCount ?? 0)}</h3>
                </div>
                <div className="w-full h-1.5 bg-surface-container-high rounded-full overflow-hidden mt-4">
                  <div className="h-full bg-primary" style={{ width: '75%' }}></div>
                </div>
              </Card>
              <KpiCard
                title={t('dashboard.offlineAlertTitle')}
                value={String(offlineCount)}
                valueColor="text-warning"
                subtitle={
                  <span className="text-warning flex items-center gap-1">
                    <AlertTriangle size={12} />
                    {t('dashboard.needAttention')}
                  </span>
                }
                accent="border-l-warning"
              />
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <Card className="lg:col-span-12" noPadding>
                <div className="px-6 py-4 border-b border-outline-variant/15 flex items-center justify-between bg-surface-container-lowest">
                  <h2 className="text-base font-bold text-on-surface">{t('dashboard.configInfo')}</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-outline-variant/15 bg-surface-container-lowest">
                  <ConfigGroup
                    items={[
                      { label: t('dashboard.bridgeMode'), value: String(data?.bridgeType ?? '-'), tabular: true },
                      { label: t('dashboard.httpPort'), value: String(data?.httpProxyPort ?? '-'), tabular: true },
                      { label: t('dashboard.httpsPort'), value: String(data?.httpsProxyPort ?? '-'), tabular: true },
                    ]}
                  />
                  <ConfigGroup
                    items={[
                      { label: t('dashboard.ipLimit'), value: String(data?.ipLimit ?? '-'), tabular: true },
                      { label: t('dashboard.flowStore'), value: String(data?.flowStoreInterval ?? '-'), tabular: true },
                      { label: t('dashboard.logLevel'), value: String(data?.logLevel ?? '-'), tabular: true },
                    ]}
                  />
                  <ConfigGroup
                    items={[
                      { label: t('dashboard.p2pPort'), value: String(data?.p2pPort ?? '-'), tabular: true },
                      { label: t('dashboard.serverIp'), value: String(data?.serverIp ?? '-'), tabular: true },
                      { label: t('dashboard.version'), value: String(data?.version ?? '-'), tabular: true },
                    ]}
                  />
                </div>
              </Card>

              <Card className="lg:col-span-6">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-base font-bold text-on-surface flex items-center gap-2">
                    <Activity size={18} className="text-primary" />
                    {t('dashboard.resourceMonitor')}
                  </h2>
                  <span className="text-xs text-on-surface-variant">{t('dashboard.autoRefresh')}</span>
                </div>
                <div className="space-y-8">
                  <ResourceBar
                    label={t('dashboard.cpuUsage')}
                    sub=""
                    value={`${data?.cpu ?? 0}%`}
                    color="bg-primary"
                  />
                  <ResourceBar
                    label={t('dashboard.memory')}
                    sub={t('dashboard.virtualMem', { p: data?.virtual_mem ?? 0 })}
                    value={`${data?.virtual_mem ?? 0}%`}
                    color="bg-primary"
                  />
                  <ResourceBar
                    label={t('dashboard.flow')}
                    sub={t('dashboard.flowInOut', { in: data?.inletFlowCount ?? 0, out: data?.exportFlowCount ?? 0 })}
                    value={`${data?.io_send ?? 0} / ${data?.io_recv ?? 0}`}
                    color="bg-secondary-container"
                    valueColor="text-on-surface"
                  />
                </div>
              </Card>

              <Card className="lg:col-span-6">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-base font-bold text-on-surface">{t('dashboard.flowStats')}</h2>
                </div>
                <div className="h-[200px]">
                  {(() => {
                    const flowData = [
                          { name: t('dashboard.inletFlow'), value: data?.inletFlowCount ?? 0 },
                          { name: t('dashboard.exportFlow'), value: data?.exportFlowCount ?? 0 },
                    ].filter((d) => d.value > 0);
                    return flowData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={flowData}
                            cx="50%"
                            cy="50%"
                            innerRadius={50}
                            outerRadius={80}
                            paddingAngle={2}
                            dataKey="value"
                            label={({ name, value }) => `${name}: ${formatBytes(value)}`}
                          >
                            {flowData.map((_, i) => (
                              <Cell key={i} fill={i === 0 ? 'var(--color-primary)' : 'var(--color-secondary-container)'} />
                            ))}
                          </Pie>
                        <Tooltip formatter={(v: number) => formatBytes(v)} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-on-surface-variant text-sm">
                      {t('dashboard.noFlowData')}
                    </div>
                  );
                  })()}
                </div>
              </Card>

              <Card className="lg:col-span-6 overflow-hidden">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="flex items-center gap-2 text-base font-bold text-on-surface">
                    <PieChartIcon size={18} className="shrink-0 text-primary" aria-hidden />
                    {t('dashboard.tunnelTypeDist')}
                  </h2>
                </div>
                <div className="relative -mx-1 rounded-2xl bg-gradient-to-b from-primary-fixed/30 via-transparent to-transparent px-1 pb-1">
                  {(() => {
                    const tunnelPieData = [
                      { name: t('sidebar.domain'), value: hostCount },
                      { name: t('sidebar.tcp'), value: data?.tcpC ?? 0 },
                      { name: t('sidebar.udp'), value: data?.udpCount ?? 0 },
                      { name: t('sidebar.httpProxy'), value: data?.httpProxyCount ?? 0 },
                      { name: t('sidebar.socks5'), value: data?.socks5Count ?? 0 },
                      { name: t('sidebar.secretTunnel'), value: data?.secretCount ?? 0 },
                      { name: t('sidebar.p2p'), value: data?.p2pCount ?? 0 },
                    ].filter((d) => d.value > 0);
                    const sliceTotal = tunnelPieData.reduce((s, d) => s + d.value, 0);
                    return tunnelPieData.length > 0 ? (
                      <div className="relative h-[220px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart margin={{ top: 4, right: 4, left: 4, bottom: 0 }}>
                            <Pie
                              data={tunnelPieData}
                              cx="50%"
                              cy="46%"
                              innerRadius={52}
                              outerRadius={82}
                              paddingAngle={3}
                              cornerRadius={5}
                              stroke="var(--color-surface-container-lowest)"
                              strokeWidth={2}
                              dataKey="value"
                              nameKey="name"
                            >
                              {tunnelPieData.map((_, i) => (
                                <Cell key={`tunnel-${tunnelPieData[i].name}-${i}`} fill={TUNNEL_PIE_COLORS[i % TUNNEL_PIE_COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip content={<TunnelTypeTooltip />} cursor={{ fill: 'transparent' }} />
                            <Legend
                              verticalAlign="bottom"
                              align="center"
                              layout="horizontal"
                              iconType="circle"
                              iconSize={7}
                              wrapperStyle={{
                                paddingTop: 4,
                                fontSize: 11,
                                lineHeight: 1.35,
                              }}
                              formatter={(value) => (
                                <span className="text-on-surface-variant" style={{ fontSize: 11 }}>
                                  {value}
                                </span>
                              )}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                        <div
                          className="pointer-events-none absolute inset-0 flex items-center justify-center pb-8"
                          aria-hidden
                        >
                          <div className="text-center">
                            <p className="text-[10px] font-semibold uppercase tracking-wide text-on-surface-variant">
                              {t('dashboard.tunnelTotal')}
                            </p>
                            <p className="text-2xl font-bold tabular-nums leading-tight text-on-surface">{sliceTotal}</p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex h-[220px] flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-outline-variant/40 bg-surface-container-low/40 px-4 text-center">
                        <PieChartIcon size={32} className="text-outline/50" aria-hidden />
                        <p className="text-sm text-on-surface-variant">{t('dashboard.noTunnelTypeData')}</p>
                      </div>
                    );
                  })()}
                </div>
              </Card>
            </div>

            {data?.system_info_display && (data?.sys1 || data?.sys2) && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                <Card>
                  <h3 className="text-base font-bold text-on-surface mb-4">{t('dashboard.load')}</h3>
                  <div className="h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => {
                        const s = data[`sys${i}`] as { time?: string; load1?: number } | undefined;
                        return { time: s?.time ?? '', load1: s?.load1 ?? 0 };
                      })}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-outline-variant)" />
                        <XAxis dataKey="time" tick={{ fontSize: 10 }} />
                        <YAxis tick={{ fontSize: 10 }} />
                        <Tooltip />
                        <Line type="monotone" dataKey="load1" stroke="var(--color-primary)" strokeWidth={2} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </Card>
                <Card>
                  <h3 className="text-base font-bold text-on-surface mb-4">CPU</h3>
                  <div className="h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => {
                        const s = data[`sys${i}`] as { time?: string; cpu?: number } | undefined;
                        return { time: s?.time ?? '', cpu: s?.cpu ?? 0 };
                      })}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-outline-variant)" />
                        <XAxis dataKey="time" tick={{ fontSize: 10 }} />
                        <YAxis tick={{ fontSize: 10 }} />
                        <Tooltip formatter={(v: number) => `${v}%`} />
                        <Line type="monotone" dataKey="cpu" stroke="var(--color-primary)" strokeWidth={2} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </Card>
                <Card>
                  <h3 className="text-base font-bold text-on-surface mb-4">{t('dashboard.memory')}</h3>
                  <div className="h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => {
                        const s = data[`sys${i}`] as { time?: string; virtual_mem?: number } | undefined;
                        return { time: s?.time ?? '', mem: s?.virtual_mem ?? 0 };
                      })}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-outline-variant)" />
                        <XAxis dataKey="time" tick={{ fontSize: 10 }} />
                        <YAxis tick={{ fontSize: 10 }} />
                        <Tooltip formatter={(v: number) => `${v}%`} />
                        <Line type="monotone" dataKey="mem" stroke="var(--color-primary)" strokeWidth={2} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </Card>
                <Card>
                  <h3 className="text-base font-bold text-on-surface mb-4">{t('dashboard.bandwidth')}</h3>
                  <div className="h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => {
                        const s = data[`sys${i}`] as { time?: string; io_send?: number; io_recv?: number } | undefined;
                        return { time: s?.time ?? '', in: s?.io_recv ?? 0, out: s?.io_send ?? 0 };
                      })}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-outline-variant)" />
                        <XAxis dataKey="time" tick={{ fontSize: 10 }} />
                        <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => formatBytes(v)} />
                        <Tooltip formatter={(v: number) => formatBytes(v)} />
                        <Line type="monotone" dataKey="in" name={t('dashboard.in')} stroke="var(--color-primary)" strokeWidth={2} dot={false} />
                        <Line type="monotone" dataKey="out" name={t('dashboard.out')} stroke="var(--color-secondary-container)" strokeWidth={2} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </Card>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

function QuickAction({
  icon: Icon,
  label,
  onClick,
}: {
  icon: React.ComponentType<{ size?: number }>;
  label: string;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 px-4 py-2 bg-surface-container-lowest border border-outline-variant/20 rounded-full text-sm font-medium text-on-surface hover:bg-surface-container-low hover:border-outline-variant/40 transition-all shadow-sm"
    >
      <Icon size={16} className="text-primary" />
      {label}
    </button>
  );
}

function KpiCard({
  title,
  value,
  subtitle,
  accent,
  status,
  bgIcon,
  valueColor = 'text-on-surface',
  pattern,
}: {
  title: string;
  value: string;
  subtitle: React.ReactNode;
  accent?: string;
  status?: string;
  bgIcon?: React.ReactNode;
  valueColor?: string;
  pattern?: boolean;
}) {
  return (
    <Card className={`relative overflow-hidden ${accent ? `border-l-4 ${accent}` : ''}`}>
      {pattern && (
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(circle, var(--color-primary) 1.5px, transparent 1.5px)',
            backgroundSize: '12px 12px',
          }}
        />
      )}
      {bgIcon}
      <div className="relative z-10">
        <p className="text-xs font-medium text-on-surface-variant mb-1">{title}</p>
        <div className="flex items-baseline gap-2">
          <h3 className={`text-3xl font-bold tabular-nums leading-none ${valueColor}`}>{value}</h3>
          {status === 'online' && <span className="w-2 h-2 rounded-full bg-success"></span>}
        </div>
        <div className="text-[11px] text-outline mt-2 font-medium">{subtitle}</div>
      </div>
    </Card>
  );
}

function ConfigGroup({
  items,
}: {
  items: { label: string; value: string; tabular?: boolean }[];
}) {
  return (
    <div className="p-6 space-y-5">
      {items.map((item, i) => (
        <div key={i} className="flex justify-between items-center">
          <span className="text-sm text-on-surface-variant">{item.label}</span>
          <span className={`text-sm font-semibold text-on-surface ${item.tabular ? 'tabular-nums' : ''}`}>
            {item.value}
          </span>
        </div>
      ))}
    </div>
  );
}

function ResourceBar({
  label,
  sub,
  value,
  color,
  valueColor = 'text-primary',
}: {
  label: string;
  sub: string;
  value: string;
  color: string;
  valueColor?: string;
}) {
  const pct = value.includes('%') ? parseFloat(value) : 0;
  return (
    <div className="space-y-3">
      <div className="flex justify-between items-end">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-on-surface">{label}</span>
          {sub && <span className="text-[11px] text-outline font-medium">{sub}</span>}
        </div>
        <span className={`text-sm font-bold tabular-nums ${valueColor}`}>{value}</span>
      </div>
      {pct > 0 && pct <= 100 && (
        <div className="h-2 w-full bg-surface-container-low rounded-full overflow-hidden">
          <div className={`h-full ${color} rounded-full`} style={{ width: `${pct}%` }}></div>
        </div>
      )}
    </div>
  );
}
