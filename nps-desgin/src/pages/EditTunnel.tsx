import React, { useState, useEffect } from 'react';
import { Sidebar } from '../components/Sidebar';
import { Header } from '../components/Header';
import { Card, PageTransition } from '../components/Shared';
import { getOneTunnel, editTunnel, getDashboard } from '../api/client';

const FIELDS_BY_TYPE: Record<string, string[]> = {
  tcp: ['port', 'target', 'local_proxy', 'client_id', 'server_ip'],
  udp: ['port', 'target', 'local_proxy', 'client_id', 'server_ip'],
  httpProxy: ['port', 'client_id', 'server_ip'],
  socks5: ['port', 'client_id', 'server_ip'],
  secret: ['target', 'password', 'client_id', 'server_ip'],
  p2p: ['target', 'password', 'client_id', 'server_ip'],
  file: ['port', 'local_path', 'strip_pre', 'client_id', 'server_ip'],
};

type TunnelData = {
  Id?: number;
  Port?: number;
  Mode?: string;
  Remark?: string;
  Password?: string;
  ServerIp?: string;
  LocalPath?: string;
  StripPre?: string;
  Client?: { Id?: number };
  Target?: { TargetStr?: string; LocalProxy?: boolean };
};

export function EditTunnel({
  tunnelId,
  onNavigate,
  onLogout,
}: {
  tunnelId: number;
  onNavigate: (view: string) => void;
  onLogout?: () => void;
}) {
  const [config, setConfig] = useState<{ allow_multi_ip?: boolean; allow_local_proxy?: boolean }>({});
  const [remark, setRemark] = useState('');
  const [port, setPort] = useState('');
  const [target, setTarget] = useState('');
  const [password, setPassword] = useState('');
  const [localPath, setLocalPath] = useState('');
  const [stripPre, setStripPre] = useState('');
  const [serverIp, setServerIp] = useState('0.0.0.0');
  const [localProxy, setLocalProxy] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadErr, setLoadErr] = useState('');
  const [error, setError] = useState('');
  const [clientId, setClientId] = useState(0);
  const [type, setType] = useState('tcp');

  useEffect(() => {
    getDashboard().then((d) => setConfig(d as typeof config)).catch(() => {});
  }, []);

  useEffect(() => {
    setLoadErr('');
    getOneTunnel(tunnelId)
      .then((res) => {
        if (res.code !== 1 || !res.data) {
          setLoadErr('加载失败');
          return;
        }
        const t = res.data as TunnelData;
        setType(t.Mode ?? 'tcp');
        setClientId(t.Client?.Id ?? 0);
        setRemark(t.Remark ?? '');
        setPort(String(t.Port ?? ''));
        setTarget(t.Target?.TargetStr ?? '');
        setPassword(t.Password ?? '');
        setLocalPath(t.LocalPath ?? '');
        setStripPre(t.StripPre ?? '');
        setServerIp(t.ServerIp ?? '0.0.0.0');
        setLocalProxy(!!t.Target?.LocalProxy);
      })
      .catch((e) => setLoadErr((e as Error).message));
  }, [tunnelId]);

  const fields = FIELDS_BY_TYPE[type] ?? FIELDS_BY_TYPE.tcp;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const params: Record<string, string | number | boolean | undefined> = {
        id: tunnelId,
        type,
        client_id: clientId,
        remark: remark || undefined,
      };
      if (config.allow_multi_ip) params.server_ip = serverIp;
      if (config.allow_local_proxy) params.local_proxy = localProxy;
      if (fields.includes('port')) params.port = parseInt(port, 10) || 0;
      if (fields.includes('target')) params.target = target;
      if (fields.includes('password')) params.password = password;
      if (fields.includes('local_path')) params.local_path = localPath;
      if (fields.includes('strip_pre')) params.strip_pre = stripPre;
      const res = await editTunnel(params);
      if (res.status === 1) {
        onNavigate(clientId ? `tunnel-all-${clientId}` : type);
      } else {
        setError(res.msg || '修改失败');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '修改失败');
    } finally {
      setLoading(false);
    }
  };

  if (loadErr) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="text-center">
          <p className="text-error mb-4">{loadErr}</p>
          <button
            onClick={() => onNavigate(clientId ? `tunnel-all-${clientId}` : 'tcp')}
            className="px-4 py-2 bg-surface-container-high rounded-xl text-sm"
          >
            返回
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface pb-24">
      <Sidebar currentView={type} onNavigate={onNavigate} />
      <Header
        breadcrumbs={[
          { label: '工作台', view: 'dashboard' },
          { label: clientId ? `客户端 ${clientId} 隧道` : '隧道' },
          { label: '编辑隧道' },
        ]}
        onNavigate={onNavigate}
        onLogout={onLogout}
      />

      <main className="ml-64 pt-20 px-10 pb-10 max-w-3xl mx-auto">
        <PageTransition>
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-on-surface">编辑隧道</h2>
            <p className="text-on-surface-variant text-sm mt-1">修改隧道配置。</p>
          </div>

          <form id="edit-tunnel-form" onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="px-4 py-3 bg-error/10 border border-error/30 rounded-xl text-sm text-error">
                {error}
              </div>
            )}

            <Card>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-semibold mb-1.5 block text-on-surface">类型</label>
                  <input
                    type="text"
                    value={type}
                    readOnly
                    className="w-full bg-surface-container-low border-none rounded-xl text-sm py-3 px-4 opacity-80"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold mb-1.5 block text-on-surface">客户端 ID</label>
                  <input
                    type="number"
                    value={clientId}
                    readOnly
                    className="w-full bg-surface-container-low border-none rounded-xl text-sm py-3 px-4 opacity-80"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold mb-1.5 block text-on-surface">备注</label>
                  <input
                    type="text"
                    value={remark}
                    onChange={(e) => setRemark(e.target.value)}
                    className="w-full bg-surface-container-low border-none rounded-xl focus:ring-2 focus:ring-primary/30 text-sm py-3 px-4"
                    placeholder="可选"
                  />
                </div>
                {fields.includes('server_ip') && config.allow_multi_ip && (
                  <div>
                    <label className="text-sm font-semibold mb-1.5 block text-on-surface">服务端 IP</label>
                    <input
                      type="text"
                      value={serverIp}
                      onChange={(e) => setServerIp(e.target.value)}
                      className="w-full bg-surface-container-low border-none rounded-xl focus:ring-2 focus:ring-primary/30 text-sm py-3 px-4"
                      placeholder="0.0.0.0"
                    />
                  </div>
                )}
                {fields.includes('port') && (
                  <div>
                    <label className="text-sm font-semibold mb-1.5 block text-on-surface">服务端端口</label>
                    <input
                      type="number"
                      value={port}
                      onChange={(e) => setPort(e.target.value)}
                      className="w-full bg-surface-container-low border-none rounded-xl focus:ring-2 focus:ring-primary/30 text-sm py-3 px-4"
                      placeholder="例如 8080"
                    />
                  </div>
                )}
                {fields.includes('target') && (
                  <div>
                    <label className="text-sm font-semibold mb-1.5 block text-on-surface">目标地址</label>
                    <textarea
                      value={target}
                      onChange={(e) => setTarget(e.target.value)}
                      rows={3}
                      className="w-full bg-surface-container-low border-none rounded-xl focus:ring-2 focus:ring-primary/30 text-sm py-3 px-4"
                      placeholder="例如 127.0.0.1:8080"
                    />
                  </div>
                )}
                {fields.includes('password') && (
                  <div>
                    <label className="text-sm font-semibold mb-1.5 block text-on-surface">识别密钥</label>
                    <input
                      type="text"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-surface-container-low border-none rounded-xl focus:ring-2 focus:ring-primary/30 text-sm py-3 px-4"
                      placeholder="Secret/P2P 连接密钥"
                    />
                  </div>
                )}
                {fields.includes('local_proxy') && config.allow_local_proxy && (
                  <div>
                    <label className="text-sm font-semibold mb-1.5 block text-on-surface">代理到本地</label>
                    <select
                      value={localProxy ? '1' : '0'}
                      onChange={(e) => setLocalProxy(e.target.value === '1')}
                      className="w-full bg-surface-container-low border-none rounded-xl focus:ring-2 focus:ring-primary/30 text-sm py-3 px-4"
                    >
                      <option value="0">否</option>
                      <option value="1">是</option>
                    </select>
                  </div>
                )}
                {fields.includes('local_path') && (
                  <div>
                    <label className="text-sm font-semibold mb-1.5 block text-on-surface">本地路径</label>
                    <input
                      type="text"
                      value={localPath}
                      onChange={(e) => setLocalPath(e.target.value)}
                      className="w-full bg-surface-container-low border-none rounded-xl focus:ring-2 focus:ring-primary/30 text-sm py-3 px-4"
                      placeholder="/path/to/files"
                    />
                  </div>
                )}
                {fields.includes('strip_pre') && (
                  <div>
                    <label className="text-sm font-semibold mb-1.5 block text-on-surface">去除路径前缀</label>
                    <input
                      type="text"
                      value={stripPre}
                      onChange={(e) => setStripPre(e.target.value)}
                      className="w-full bg-surface-container-low border-none rounded-xl focus:ring-2 focus:ring-primary/30 text-sm py-3 px-4"
                      placeholder="可选"
                    />
                  </div>
                )}
              </div>
            </Card>
          </form>
        </PageTransition>
      </main>

      <div className="fixed bottom-0 right-0 w-[calc(100%-16rem)] bg-surface-container-lowest/90 backdrop-blur-md border-t border-outline-variant/15 px-10 py-4 flex justify-end gap-4 z-40">
        <button
          type="button"
          onClick={() => onNavigate(clientId ? `tunnel-all-${clientId}` : type)}
          className="px-6 py-2.5 rounded-xl text-sm font-bold text-on-surface-variant bg-surface-container-high hover:bg-surface-dim transition-all"
        >
          取消
        </button>
        <button
          type="submit"
          form="edit-tunnel-form"
          disabled={loading}
          className="px-8 py-2.5 rounded-xl text-sm font-bold text-white bg-primary shadow-ambient hover:shadow-lg disabled:opacity-70"
        >
          {loading ? '保存中...' : '保存'}
        </button>
      </div>
    </div>
  );
}
