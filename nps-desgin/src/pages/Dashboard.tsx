import React, { useState, useEffect } from 'react';
import { Sidebar } from '../components/Sidebar';
import { Header } from '../components/Header';
import { Card, DashboardSkeleton } from '../components/Shared';
import {
  PlusCircle,
  Settings2,
  Globe,
  History,
  Activity,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts';
import { getDashboard, type DashboardData } from '../api/client';

function formatBytes(n: number): string {
  if (n >= 1024 * 1024 * 1024) return (n / 1024 / 1024 / 1024).toFixed(1) + ' GB';
  if (n >= 1024 * 1024) return (n / 1024 / 1024).toFixed(1) + ' MB';
  if (n >= 1024) return (n / 1024).toFixed(1) + ' KB';
  return n + ' B';
}

export function Dashboard({ onNavigate, onLogout }: { onNavigate: (view: string) => void; onLogout?: () => void }) {
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
        breadcrumbs={[{ label: '工作台' }, { label: '系统概览' }]}
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
              <span>检测到 {offlineCount} 个离线客户端，请检查网络连接状态。</span>
            </div>
            <button className="text-sm text-primary font-semibold hover:underline">处理</button>
          </div>
        )}

        <section className="flex flex-wrap gap-3 pb-2">
          <QuickAction icon={PlusCircle} label="新增客户端" onClick={() => onNavigate('add-client')} />
          <QuickAction icon={Settings2} label="客户端管理" onClick={() => onNavigate('clients')} />
          <QuickAction icon={Globe} label="域名解析" onClick={() => onNavigate('domain')} />
          <QuickAction icon={History} label="操作日志" />
        </section>

        {loading ? (
          <DashboardSkeleton />
        ) : (
          <>
            <section className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <KpiCard
                title="连接端口"
                value={String(data?.p ?? '-')}
                subtitle="桥接通信端口"
                accent="border-l-primary"
              />
              <KpiCard
                title="客户端总数"
                value={String(clientCount)}
                subtitle={
                  <>
                    <CheckCircle2 size={12} className="inline mr-1" />
                    已注册
                  </>
                }
                bgIcon={null}
              />
              <KpiCard
                title="在线客户端"
                value={String(clientOnline)}
                status="online"
                subtitle={`${onlineRate}% 在线率`}
              />
              <KpiCard
                title="TCP 连接数"
                value={tcpCount.toLocaleString()}
                subtitle={
                  <span className="text-primary flex items-center gap-1">
                    <TrendingUp size={12} />
                    连接中
                  </span>
                }
                pattern={true}
              />
              <Card className="flex flex-col justify-between">
                <div>
                  <p className="text-xs font-medium text-on-surface-variant mb-1">隧道总数</p>
                  <h3 className="text-3xl font-bold tabular-nums text-on-surface leading-none">{(data?.tcpC ?? 0) + (data?.udpCount ?? 0) + (data?.socks5Count ?? 0) + (data?.httpProxyCount ?? 0) + (data?.secretCount ?? 0) + (data?.p2pCount ?? 0)}</h3>
                </div>
                <div className="w-full h-1.5 bg-surface-container-high rounded-full overflow-hidden mt-4">
                  <div className="h-full bg-primary" style={{ width: '75%' }}></div>
                </div>
              </Card>
              <KpiCard
                title="离线 / 告警"
                value={String(offlineCount)}
                valueColor="text-warning"
                subtitle={
                  <span className="text-warning flex items-center gap-1">
                    <AlertTriangle size={12} />
                    需关注
                  </span>
                }
                accent="border-l-warning"
              />
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <Card className="lg:col-span-12" noPadding>
                <div className="px-6 py-4 border-b border-outline-variant/15 flex items-center justify-between bg-surface-container-lowest">
                  <h2 className="text-base font-bold text-on-surface">配置信息</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-outline-variant/15 bg-surface-container-lowest">
                  <ConfigGroup
                    items={[
                      { label: '桥接模式', value: String(data?.bridgeType ?? '-'), tabular: true },
                      { label: 'HTTP 端口', value: String(data?.httpProxyPort ?? '-'), tabular: true },
                      { label: 'HTTPS 端口', value: String(data?.httpsProxyPort ?? '-'), tabular: true },
                    ]}
                  />
                  <ConfigGroup
                    items={[
                      { label: 'IP 限制', value: String(data?.ipLimit ?? '-'), tabular: true },
                      { label: '流量持久化', value: String(data?.flowStoreInterval ?? '-'), tabular: true },
                      { label: '日志级别', value: String(data?.logLevel ?? '-'), tabular: true },
                    ]}
                  />
                  <ConfigGroup
                    items={[
                      { label: 'P2P 端口', value: String(data?.p2pPort ?? '-'), tabular: true },
                      { label: '服务端 IP', value: String(data?.serverIp ?? '-'), tabular: true },
                      { label: '版本', value: String(data?.version ?? '-'), tabular: true },
                    ]}
                  />
                </div>
              </Card>

              <Card className="lg:col-span-6">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-base font-bold text-on-surface flex items-center gap-2">
                    <Activity size={18} className="text-primary" />
                    资源监控
                  </h2>
                  <span className="text-xs text-on-surface-variant">自动刷新 5s</span>
                </div>
                <div className="space-y-8">
                  <ResourceBar
                    label="CPU 使用率"
                    sub=""
                    value={`${data?.cpu ?? 0}%`}
                    color="bg-primary"
                  />
                  <ResourceBar
                    label="内存"
                    sub={`虚拟内存 ${data?.virtual_mem ?? 0}%`}
                    value={`${data?.virtual_mem ?? 0}%`}
                    color="bg-primary"
                  />
                  <ResourceBar
                    label="流量"
                    sub={`入 ${data?.inletFlowCount ?? 0} / 出 ${data?.exportFlowCount ?? 0} 字节`}
                    value={`${data?.io_send ?? 0} / ${data?.io_recv ?? 0}`}
                    color="bg-secondary-container"
                    valueColor="text-on-surface"
                  />
                </div>
              </Card>

              <Card className="lg:col-span-6">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-base font-bold text-on-surface">流量统计</h2>
                </div>
                <div className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: '入站流量', value: data?.inletFlowCount ?? 0 },
                          { name: '出站流量', value: data?.exportFlowCount ?? 0 },
                        ]}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={2}
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${formatBytes(value)}`}
                      >
                        <Cell fill="var(--color-primary)" />
                        <Cell fill="var(--color-secondary-container)" />
                      </Pie>
                      <Tooltip formatter={(v: number) => formatBytes(v)} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              <Card className="lg:col-span-6">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-base font-bold text-on-surface">隧道类型分布</h2>
                </div>
                <div className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: '域名解析', value: hostCount },
                          { name: 'TCP', value: data?.tcpC ?? 0 },
                          { name: 'UDP', value: data?.udpCount ?? 0 },
                          { name: 'HTTP 代理', value: data?.httpProxyCount ?? 0 },
                          { name: 'SOCKS5', value: data?.socks5Count ?? 0 },
                          { name: 'Secret', value: data?.secretCount ?? 0 },
                          { name: 'P2P', value: data?.p2pCount ?? 0 },
                        ].filter((d) => d.value > 0)}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {['#3370FF', '#4E83FD', '#85A9FF', '#BEDAFF', '#475c99', '#a5b9fd', '#8F959E'].map((c, i) => (
                          <Cell key={i} fill={c} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </div>

            {data?.system_info_display && (data?.sys1 || data?.sys2) && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                <Card>
                  <h3 className="text-base font-bold text-on-surface mb-4">负载</h3>
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
                  <h3 className="text-base font-bold text-on-surface mb-4">内存</h3>
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
                  <h3 className="text-base font-bold text-on-surface mb-4">带宽</h3>
                  <div className="h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => {
                        const s = data[`sys${i}`] as { time?: string; io_send?: number; io_recv?: number } | undefined;
                        return { time: s?.time ?? '', 入: s?.io_recv ?? 0, 出: s?.io_send ?? 0 };
                      })}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-outline-variant)" />
                        <XAxis dataKey="time" tick={{ fontSize: 10 }} />
                        <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => formatBytes(v)} />
                        <Tooltip formatter={(v: number) => formatBytes(v)} />
                        <Line type="monotone" dataKey="入" stroke="var(--color-primary)" strokeWidth={2} dot={false} />
                        <Line type="monotone" dataKey="出" stroke="var(--color-secondary-container)" strokeWidth={2} dot={false} />
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
