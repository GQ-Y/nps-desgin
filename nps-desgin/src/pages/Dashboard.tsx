import React from 'react';
import { Sidebar } from '../components/Sidebar';
import { Header } from '../components/Header';
import { Card, PageTransition } from '../components/Shared';
import { 
  PlusCircle, 
  Settings2, 
  Globe, 
  History, 
  Activity, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';

export function Dashboard({ onNavigate }: { onNavigate: (view: string) => void }) {
  return (
    <div className="min-h-screen bg-surface">
      <Sidebar currentView="dashboard" onNavigate={onNavigate} />
      <Header 
        breadcrumbs={[{ label: 'Dashboard' }, { label: 'System Overview' }]} 
        onNavigate={onNavigate} 
      />

      <main className="ml-64 pt-14 p-8 space-y-6">
        {/* Global Alert */}
        <div className="bg-alert-bg border border-warning/20 rounded-xl px-4 py-3 flex items-center justify-between mt-4">
          <div className="flex items-center gap-2 text-sm text-warning font-medium">
            <AlertTriangle size={16} />
            <span>System detected 2 offline clients. Please check network connection status.</span>
          </div>
          <button className="text-sm text-primary font-semibold hover:underline">Resolve</button>
        </div>

        {/* Quick Actions */}
        <section className="flex flex-wrap gap-3 pb-2">
          <QuickAction icon={PlusCircle} label="New Client" onClick={() => onNavigate('add-client')} />
          <QuickAction icon={Settings2} label="Manage Clients" onClick={() => onNavigate('clients')} />
          <QuickAction icon={Globe} label="Domain Resolution" />
          <QuickAction icon={History} label="Operation Logs" />
        </section>

        {/* KPIs */}
        <section className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <KpiCard 
            title="Bridge Ports" 
            value="8024" 
            subtitle="Active bridge port" 
            accent="border-l-primary"
          />
          <KpiCard 
            title="Total Clients" 
            value="156" 
            subtitle={<><CheckCircle2 size={12} className="inline mr-1"/> All Registered</>}
            bgIcon={<UsersIcon className="absolute -right-4 -bottom-4 w-24 h-24 text-surface-container-high opacity-50" />}
          />
          <KpiCard 
            title="Online Clients" 
            value="142" 
            status="online"
            subtitle="91.02% Online Rate" 
          />
          <KpiCard 
            title="TCP Connections" 
            value="3,892" 
            subtitle={<span className="text-primary flex items-center gap-1"><TrendingUp size={12}/> 5.4%</span>}
            pattern={true}
          />
          <Card className="flex flex-col justify-between">
            <div>
              <p className="text-xs font-medium text-on-surface-variant mb-1">Total Tunnels</p>
              <h3 className="text-3xl font-bold tabular-nums text-on-surface leading-none">84</h3>
            </div>
            <div className="w-full h-1.5 bg-surface-container-high rounded-full overflow-hidden mt-4">
              <div className="h-full bg-primary" style={{ width: '75%' }}></div>
            </div>
          </Card>
          <KpiCard 
            title="Offline / Alerts" 
            value="14" 
            valueColor="text-warning"
            subtitle={<span className="text-warning flex items-center gap-1"><AlertTriangle size={12}/> Needs Attention</span>}
            accent="border-l-warning"
          />
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Configuration Summary */}
          <Card className="lg:col-span-12" noPadding>
            <div className="px-6 py-4 border-b border-outline-variant/15 flex items-center justify-between bg-surface-container-lowest">
              <h2 className="text-base font-bold text-on-surface">Configuration Info</h2>
              <button className="text-xs text-primary font-medium hover:underline">Edit Global Config</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-outline-variant/15 bg-surface-container-lowest">
              <ConfigGroup items={[
                { label: 'Bridge Mode', value: 'TCP / TLS Mixed' },
                { label: 'HTTP Port', value: '80, 8080', tabular: true }
              ]} />
              <ConfigGroup items={[
                { label: 'HTTPS Port', value: '443, 8443', tabular: true },
                { label: 'Server IP', value: '192.168.1.104', tabular: true }
              ]} />
              <ConfigGroup items={[
                { label: 'Version', value: 'v0.26.10', tabular: true },
                { label: 'Uptime', value: '14d 08h 22m', tabular: true }
              ]} />
            </div>
          </Card>

          {/* Resource Monitoring */}
          <Card className="lg:col-span-6">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-base font-bold text-on-surface flex items-center gap-2">
                <Activity size={18} className="text-primary" />
                Resource Monitoring
              </h2>
              <span className="text-xs text-on-surface-variant">Auto-refresh 5s</span>
            </div>
            <div className="space-y-8">
              <ResourceBar label="CPU Usage" sub="8 Cores Platinum" value="24%" color="bg-primary" />
              <ResourceBar label="Memory" sub="9.9 GB / 16.0 GB" value="62%" color="bg-primary" />
              <ResourceBar label="Bandwidth" sub="↑ 4.2 MB/s ↓ 8.3 MB/s" value="12.5 MB/s" color="bg-secondary-container" valueColor="text-on-surface" />
            </div>
          </Card>

          {/* Traffic Trend */}
          <Card className="lg:col-span-6">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-base font-bold text-on-surface">Traffic Trend</h2>
              <div className="bg-surface-container-low rounded-lg p-1 flex">
                <button className="px-3 py-1 text-xs font-semibold bg-surface-container-lowest rounded shadow-sm text-on-surface">24h</button>
                <button className="px-3 py-1 text-xs font-medium text-on-surface-variant hover:text-on-surface transition-colors">7d</button>
                <button className="px-3 py-1 text-xs font-medium text-on-surface-variant hover:text-on-surface transition-colors">30d</button>
              </div>
            </div>
            <div className="relative h-[180px] w-full mt-4 flex items-end">
              <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
                <defs>
                  <linearGradient id="line-grad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.15" />
                    <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path d="M0,80 C10,70 20,90 30,50 C40,10 50,40 60,30 C70,20 80,60 90,40 L100,50 L100,100 L0,100 Z" fill="url(#line-grad)" />
                <path d="M0,80 C10,70 20,90 30,50 C40,10 50,40 60,30 C70,20 80,60 90,40 L100,50" fill="none" stroke="var(--color-primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="30" cy="50" r="3.5" fill="var(--color-surface-container-lowest)" stroke="var(--color-primary)" strokeWidth="2.5" />
              </svg>
              <div className="absolute bottom-[-24px] w-full flex justify-between text-[10px] text-outline tabular-nums font-medium">
                <span>00:00</span><span>06:00</span><span>12:00</span><span>18:00</span><span>23:59</span>
              </div>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}

// Subcomponents

function QuickAction({ icon: Icon, label, onClick }: { icon: any, label: string, onClick?: () => void }) {
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

function KpiCard({ title, value, subtitle, accent, status, bgIcon, valueColor = 'text-on-surface', pattern }: any) {
  return (
    <Card className={`relative overflow-hidden ${accent ? `border-l-4 ${accent}` : ''}`}>
      {pattern && (
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, var(--color-primary) 1.5px, transparent 1.5px)', backgroundSize: '12px 12px' }}></div>
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

function ConfigGroup({ items }: { items: {label: string, value: string, tabular?: boolean}[] }) {
  return (
    <div className="p-6 space-y-5">
      {items.map((item, i) => (
        <div key={i} className="flex justify-between items-center">
          <span className="text-sm text-on-surface-variant">{item.label}</span>
          <span className={`text-sm font-semibold text-on-surface ${item.tabular ? 'tabular-nums' : ''}`}>{item.value}</span>
        </div>
      ))}
    </div>
  );
}

function ResourceBar({ label, sub, value, color, valueColor = 'text-primary' }: any) {
  return (
    <div className="space-y-3">
      <div className="flex justify-between items-end">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-on-surface">{label}</span>
          <span className="text-[11px] text-outline font-medium">{sub}</span>
        </div>
        <span className={`text-sm font-bold tabular-nums ${valueColor}`}>{value}</span>
      </div>
      <div className="h-2 w-full bg-surface-container-low rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full`} style={{ width: value }}></div>
      </div>
    </div>
  );
}

function UsersIcon(props: any) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
    </svg>
  );
}
