import React, { useState, useEffect } from 'react';
import { Sidebar } from '../components/Sidebar';
import { Header } from '../components/Header';
import { Card, PageTransition } from '../components/Shared';
import { Input, Select, PasswordInput } from '../components/ui';
import { RefreshCw } from 'lucide-react';
import { getDashboard } from '../api/client';

type Config = {
  allow_flow_limit?: boolean;
  allow_rate_limit?: boolean;
  allow_connection_num_limit?: boolean;
  allow_tunnel_num_limit?: boolean;
  allow_user_login?: boolean;
};

export function AddClient({ onNavigate, onLogout }: { onNavigate: (view: string) => void; onLogout?: () => void }) {
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
  const [error, setError] = useState('');

  useEffect(() => {
    getDashboard().then((d) => setConfig(d as Config)).catch(() => {});
  }, []);

  const generateVkey = () => {
    const chars = '0123456789abcdef';
    let s = '';
    for (let i = 0; i < 16; i++) s += chars[Math.floor(Math.random() * 16)];
    setVkey(s);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    let key = vkey;
    if (!key) {
      const chars = '0123456789abcdef';
      let s = '';
      for (let i = 0; i < 16; i++) s += chars[Math.floor(Math.random() * 16)];
      key = s;
      setVkey(s);
    }
    setLoading(true);
    try {
      const { addClient } = await import('../api/client');
      const res = await addClient({
        vkey: key,
        remark: remark || undefined,
        u: u || undefined,
        p: p || undefined,
        web_username: webUsername || undefined,
        web_password: webPassword || undefined,
        config_conn_allow: configConnAllow,
        compress: compress ? '1' : '0',
        crypt: crypt ? '1' : '0',
        flow_limit: config.allow_flow_limit ? flowLimit : undefined,
        rate_limit: config.allow_rate_limit ? rateLimit : undefined,
        max_conn: config.allow_connection_num_limit ? maxConn : undefined,
        max_tunnel: config.allow_tunnel_num_limit ? maxTunnel : undefined,
      });
      if (res.status === 1) {
        onNavigate('clients');
      } else {
        setError(res.msg || '添加失败');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '添加失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface pb-24">
      <Sidebar currentView="add-client" onNavigate={onNavigate} />
      <Header
        breadcrumbs={[{ label: '客户端', view: 'clients' }, { label: '新增客户端' }]}
        onNavigate={onNavigate}
        onLogout={onLogout}
        showTabs={true}
      />

      <main className="ml-64 pt-20 px-10 pb-10 max-w-5xl mx-auto">
        <PageTransition>
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-on-surface tracking-tight">客户端配置</h2>
            <p className="text-on-surface-variant text-sm mt-1">配置客户端的备注、验证密钥及安全约束。</p>
          </div>

          <form id="add-client-form" onSubmit={handleSubmit} className="space-y-8">
            {error && (
              <div className="px-4 py-3 bg-error/10 border border-error/30 rounded-xl text-sm text-error">
                {error}
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
                  placeholder="仅代理时使用"
                />
                <PasswordInput
                  label="Basic 认证密码"
                  value={p}
                  onChange={(e) => setP(e.target.value)}
                  placeholder="仅代理时使用"
                />
                {config.allow_user_login && (
                  <>
                    <Input
                      label="Web 登录用户名"
                      value={webUsername}
                      onChange={(e) => setWebUsername(e.target.value)}
                      placeholder="可选"
                    />
                    <PasswordInput
                      label="Web 登录密码"
                      value={webPassword}
                      onChange={(e) => setWebPassword(e.target.value)}
                      placeholder="可选"
                    />
                  </>
                )}
                <div className="col-span-2">
                  <label className="text-sm font-semibold mb-1.5 block text-on-surface">验证密钥</label>
                  <div className="flex gap-3">
                    <Input
                      value={vkey}
                      onChange={(e) => setVkey(e.target.value)}
                      placeholder="留空则自动生成"
                      containerClassName="flex-1 min-w-0"
                      inputClassName="tabular-nums font-mono"
                    />
                    <button
                      type="button"
                      onClick={generateVkey}
                      className="bg-primary-fixed text-on-primary-fixed px-5 rounded-xl text-sm font-bold hover:bg-primary-fixed-dim transition-colors flex items-center gap-2 shrink-0"
                    >
                      <RefreshCw size={16} />
                      生成
                    </button>
                  </div>
                </div>
                <Select
                  label="仅允许配置连接"
                  value={configConnAllow ? '1' : '0'}
                  onChange={(v) => setConfigConnAllow(v === '1')}
                  options={[
                    { value: '0', label: '否（动态模式）' },
                    { value: '1', label: '是（高安全）' },
                  ]}
                  className="col-span-2"
                />
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

            <div className="bg-surface-container rounded-2xl border border-outline-variant/15 overflow-hidden">
              <div className="p-6">
                <h3 className="text-lg font-bold text-secondary mb-4">高级限制（可选）</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {config.allow_flow_limit && (
                    <Input
                      type="number"
                      label="流量限制 (MB)"
                      placeholder="0 = 不限"
                      value={flowLimit || ''}
                      onChange={(e) => setFlowLimit(parseInt(e.target.value, 10) || 0)}
                    />
                  )}
                  {config.allow_rate_limit && (
                    <Input
                      type="number"
                      label="速度限制 (KB/s)"
                      placeholder="0 = 不限"
                      value={rateLimit || ''}
                      onChange={(e) => setRateLimit(parseInt(e.target.value, 10) || 0)}
                    />
                  )}
                  {config.allow_connection_num_limit && (
                    <Input
                      type="number"
                      label="最大连接数"
                      placeholder="1000"
                      value={maxConn || ''}
                      onChange={(e) => setMaxConn(parseInt(e.target.value, 10) || 0)}
                    />
                  )}
                  {config.allow_tunnel_num_limit && (
                    <Input
                      type="number"
                      label="最大隧道数"
                      placeholder="0 = 不限"
                      value={maxTunnel || ''}
                      onChange={(e) => setMaxTunnel(parseInt(e.target.value, 10) || 0)}
                    />
                  )}
                </div>
              </div>
            </div>
          </form>
        </PageTransition>
      </main>

      <div className="fixed bottom-0 right-0 w-[calc(100%-16rem)] bg-surface-container-lowest/90 backdrop-blur-md border-t border-outline-variant/15 px-10 py-4 flex justify-end gap-4 z-40">
        <button
          type="button"
          onClick={() => onNavigate('clients')}
          className="px-6 py-2.5 rounded-xl text-sm font-bold text-on-surface-variant bg-surface-container-high hover:bg-surface-dim transition-all active:scale-95"
        >
          取消
        </button>
        <button
          type="submit"
          form="add-client-form"
          disabled={loading}
          className="px-8 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-primary to-primary-container shadow-ambient hover:shadow-lg hover:shadow-primary/20 transition-all active:scale-95 disabled:opacity-70"
        >
          {loading ? '保存中...' : '保存客户端'}
        </button>
      </div>
    </div>
  );
}

// Subcomponents

function SectionHeader({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <div className="w-1.5 h-6 bg-primary rounded-full"></div>
      <h3 className="text-lg font-bold text-on-surface">{title}</h3>
    </div>
  );
}

