import React, { useState, useEffect } from 'react';
import { Sidebar } from '../components/Sidebar';
import { Header } from '../components/Header';
import { Card, PageTransition, Skeleton } from '../components/Shared';
import { Input, Select, PasswordInput } from '../components/ui';
import { RefreshCw } from 'lucide-react';
import { getClient, editClient, getDashboard } from '../api/client';

type Config = {
  allow_flow_limit?: boolean;
  allow_rate_limit?: boolean;
  allow_connection_num_limit?: boolean;
  allow_tunnel_num_limit?: boolean;
  allow_user_login?: boolean;
  allow_user_change_username?: boolean;
  isAdmin?: boolean;
};

export function EditClient({
  clientId,
  onNavigate,
  onLogout,
}: {
  clientId: number;
  onNavigate: (view: string) => void;
  onLogout?: () => void;
}) {
  const [config, setConfig] = useState<Config>({});
  const [remark, setRemark] = useState('');
  const [vkey, setVkey] = useState('');
  const [u, setU] = useState('');
  const [p, setP] = useState('');
  const [webUsername, setWebUsername] = useState('');
  const [webPassword, setWebPassword] = useState('');
  const [configConnAllow, setConfigConnAllow] = useState(false);
  const [compress, setCompress] = useState(false);
  const [crypt, setCrypt] = useState(false);
  const [flowLimit, setFlowLimit] = useState(0);
  const [rateLimit, setRateLimit] = useState(0);
  const [maxConn, setMaxConn] = useState(0);
  const [maxTunnel, setMaxTunnel] = useState(0);
  const [loading, setLoading] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [saveError, setSaveError] = useState('');

  const hasAdvancedSection =
    (config.allow_flow_limit || config.allow_rate_limit || config.allow_connection_num_limit || config.allow_tunnel_num_limit) &&
    config.isAdmin;

  useEffect(() => {
    getDashboard().then((d) => setConfig(d as Config)).catch(() => {});
  }, []);

  useEffect(() => {
    setDataLoaded(false);
    getClient(clientId)
      .then((res) => {
        if (res.code !== 1 || !res.data) {
          setLoadError('加载失败');
          setDataLoaded(true);
          return;
        }
        const c = res.data as {
          Remark?: string;
          VerifyKey?: string;
          WebUserName?: string;
          WebPassword?: string;
          ConfigConnAllow?: boolean;
          Cnf?: { U?: string; P?: string; Crypt?: boolean; Compress?: boolean };
          Flow?: { FlowLimit?: number };
          RateLimit?: number;
          MaxConn?: number;
          MaxTunnelNum?: number;
        };
        setRemark(c.Remark ?? '');
        setVkey(c.VerifyKey ?? '');
        setU(c.Cnf?.U ?? '');
        setP(c.Cnf?.P ?? '');
        setWebUsername(c.WebUserName ?? '');
        setWebPassword(c.WebPassword ?? '');
        setConfigConnAllow(c.ConfigConnAllow ?? false);
        setCompress(c.Cnf?.Compress ?? false);
        setCrypt(c.Cnf?.Crypt ?? false);
        setFlowLimit(c.Flow?.FlowLimit ?? 0);
        setRateLimit(c.RateLimit ?? 0);
        setMaxConn(c.MaxConn ?? 0);
        setMaxTunnel(c.MaxTunnelNum ?? 0);
        setDataLoaded(true);
      })
      .catch((e) => {
        setLoadError((e as Error).message);
        setDataLoaded(true);
        if ((e as Error).message === '未登录') onLogout?.();
      });
  }, [clientId, onLogout]);

  const generateVkey = () => {
    const chars = '0123456789abcdef';
    let s = '';
    for (let i = 0; i < 16; i++) s += chars[Math.floor(Math.random() * 16)];
    setVkey(s);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveError('');
    setLoading(true);
    try {
      const isAdmin = config.isAdmin !== false;
      const res = await editClient({
        id: clientId,
        ...(isAdmin && { vkey: vkey || undefined }),
        remark: remark || undefined,
        u: u || undefined,
        p: p || undefined,
        ...((isAdmin || config.allow_user_change_username) && { web_username: webUsername || undefined }),
        web_password: webPassword || undefined,
        config_conn_allow: configConnAllow,
        compress: compress ? '1' : '0',
        crypt: crypt ? '1' : '0',
        ...(config.allow_flow_limit && isAdmin && { flow_limit: flowLimit }),
        ...(config.allow_rate_limit && isAdmin && { rate_limit: rateLimit }),
        ...(config.allow_connection_num_limit && isAdmin && { max_conn: maxConn }),
        ...(config.allow_tunnel_num_limit && isAdmin && { max_tunnel: maxTunnel }),
      });
      if (res.status === 1) {
        onNavigate('clients');
      } else {
        setSaveError(res.msg || '保存失败');
      }
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : '保存失败');
    } finally {
      setLoading(false);
    }
  };

  if (!dataLoaded && !loadError) {
    return (
      <div className="min-h-screen bg-surface">
        <Sidebar currentView="clients" onNavigate={onNavigate} />
        <Header
          breadcrumbs={[{ label: '客户端', view: 'clients' }, { label: '编辑客户端' }]}
          onNavigate={onNavigate}
          onLogout={onLogout}
        />
        <main className="ml-64 pt-20 px-10 pb-10 max-w-5xl mx-auto">
          <div className="mb-8">
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
          <div className="space-y-8">
            <Card>
              <Skeleton className="h-6 w-24 mb-6" />
              <div className="grid grid-cols-2 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i}>
                    <Skeleton className="h-4 w-20 mb-2" />
                    <Skeleton className="h-12 w-full rounded-xl" />
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="min-h-screen bg-surface">
        <Sidebar currentView="clients" onNavigate={onNavigate} />
        <Header
          breadcrumbs={[{ label: '客户端', view: 'clients' }, { label: '编辑客户端' }]}
          onNavigate={onNavigate}
          onLogout={onLogout}
        />
        <main className="ml-64 pt-20 p-10 pb-10">
          <div className="text-error">{loadError}</div>
          <button
            onClick={() => onNavigate('clients')}
            className="mt-4 px-4 py-2 bg-surface-container-high rounded-xl text-sm"
          >
            返回列表
          </button>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface pb-24">
      <Sidebar currentView="clients" onNavigate={onNavigate} />
      <Header
        breadcrumbs={[{ label: '客户端', view: 'clients' }, { label: '编辑客户端' }]}
        onNavigate={onNavigate}
        onLogout={onLogout}
        showTabs
      />

      <main className="ml-64 pt-20 px-10 pb-10 max-w-5xl mx-auto">
        <PageTransition>
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-on-surface tracking-tight">编辑客户端</h2>
            <p className="text-on-surface-variant text-sm mt-1">修改客户端配置。</p>
          </div>

          <form id="edit-client-form" onSubmit={handleSubmit} className="space-y-8">
            {saveError && (
              <div className="px-4 py-3 bg-error/10 border border-error/30 rounded-xl text-sm text-error">
                {saveError}
              </div>
            )}

            <Card>
              <SectionHeader title="基本配置" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="备注"
                  value={remark}
                  onChange={(e) => setRemark(e.target.value)}
                  placeholder="例如：生产环境-API 服务器"
                  containerClassName="col-span-2"
                />
                <Input
                  label="Basic 认证用户名"
                  value={u}
                  onChange={(e) => setU(e.target.value)}
                />
                <PasswordInput
                  label="Basic 认证密码"
                  value={p}
                  onChange={(e) => setP(e.target.value)}
                  placeholder="留空则不修改"
                />
                {config.allow_user_login && (
                  <>
                    <Input
                      label="Web 登录用户名"
                      value={webUsername}
                      onChange={(e) => setWebUsername(e.target.value)}
                      readOnly={!config.isAdmin && !config.allow_user_change_username}
                    />
                    <PasswordInput
                      label="Web 登录密码"
                      value={webPassword}
                      onChange={(e) => setWebPassword(e.target.value)}
                      placeholder="留空则不修改"
                    />
                  </>
                )}
                <div className="col-span-2">
                  <label className="text-sm font-semibold mb-1.5 block text-on-surface">验证密钥</label>
                  <div className="flex gap-3">
                    <Input
                      value={vkey}
                      onChange={(e) => setVkey(e.target.value)}
                      readOnly={!config.isAdmin}
                      containerClassName="flex-1 min-w-0"
                      inputClassName="tabular-nums font-mono"
                    />
                    {config.isAdmin && (
                      <button
                        type="button"
                        onClick={generateVkey}
                        className="bg-primary-fixed text-on-primary-fixed px-5 rounded-xl text-sm font-bold hover:bg-primary-fixed-dim transition-colors flex items-center gap-2 shrink-0"
                      >
                        <RefreshCw size={16} />
                        生成
                      </button>
                    )}
                  </div>
                </div>
                <div className="col-span-2">
                  <Select
                    label="仅允许配置连接"
                    value={configConnAllow ? '1' : '0'}
                    onChange={(v) => setConfigConnAllow(v === '1')}
                    options={[
                      { value: '0', label: '否（动态模式）' },
                      { value: '1', label: '是（高安全）' },
                    ]}
                  />
                  <p className="text-xs text-on-surface-variant mt-1">开启后客户端仅能通过配置文件连接，无法动态添加隧道</p>
                </div>
                <Select
                  label="压缩"
                  value={compress ? '1' : '0'}
                  onChange={(v) => setCompress(v === '1')}
                  options={[
                    { value: '0', label: '否' },
                    { value: '1', label: '是' },
                  ]}
                />
                <Select
                  label="加密"
                  value={crypt ? '1' : '0'}
                  onChange={(v) => setCrypt(v === '1')}
                  options={[
                    { value: '0', label: '否' },
                    { value: '1', label: '是' },
                  ]}
                />
              </div>
            </Card>

            {hasAdvancedSection && (
              <Card>
                <SectionHeader title="高级限制（可选）" />
                <p className="text-sm text-on-surface-variant mb-6">流量、速度、连接数等限制，0 表示不限制。</p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {config.allow_flow_limit && config.isAdmin && (
                    <Input
                      type="number"
                      label="流量限制 (MB)"
                      placeholder="0 = 不限"
                      value={flowLimit || ''}
                      onChange={(e) => setFlowLimit(parseInt(e.target.value, 10) || 0)}
                    />
                  )}
                  {config.allow_rate_limit && config.isAdmin && (
                    <Input
                      type="number"
                      label="速度限制 (KB/s)"
                      placeholder="0 = 不限"
                      value={rateLimit || ''}
                      onChange={(e) => setRateLimit(parseInt(e.target.value, 10) || 0)}
                    />
                  )}
                  {config.allow_connection_num_limit && config.isAdmin && (
                    <Input
                      type="number"
                      label="最大连接数"
                      placeholder="0 = 不限"
                      value={maxConn || ''}
                      onChange={(e) => setMaxConn(parseInt(e.target.value, 10) || 0)}
                    />
                  )}
                  {config.allow_tunnel_num_limit && config.isAdmin && (
                    <Input
                      type="number"
                      label="最大隧道数"
                      placeholder="0 = 不限"
                      value={maxTunnel || ''}
                      onChange={(e) => setMaxTunnel(parseInt(e.target.value, 10) || 0)}
                    />
                  )}
                </div>
              </Card>
            )}
          </form>
        </PageTransition>
      </main>

      <div className="fixed bottom-0 right-0 w-[calc(100%-16rem)] bg-surface-container-lowest/90 backdrop-blur-md border-t border-outline-variant/15 px-10 py-4 flex justify-end gap-4 z-40">
        <button
          type="button"
          onClick={() => onNavigate('clients')}
          className="px-6 py-2.5 rounded-xl text-sm font-bold text-on-surface-variant bg-surface-container-high hover:bg-surface-dim transition-all"
        >
          取消
        </button>
        <button
          type="submit"
          form="edit-client-form"
          disabled={loading}
          className="px-8 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-primary to-primary-container shadow-ambient hover:shadow-lg hover:shadow-primary/20 transition-all disabled:opacity-70"
        >
          {loading ? '保存中...' : '保存'}
        </button>
      </div>
    </div>
  );
}

function SectionHeader({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <div className="w-1.5 h-6 bg-primary rounded-full" />
      <h3 className="text-lg font-bold text-on-surface">{title}</h3>
    </div>
  );
}

