import React, { useState, useEffect } from 'react';
import { Sidebar } from '../components/Sidebar';
import { Header } from '../components/Header';
import { Card, PageTransition } from '../components/Shared';
import { getHost, editHost, getDashboard } from '../api/client';

type HostData = {
  Id?: number;
  Host?: string;
  Scheme?: string;
  Remark?: string;
  CertFilePath?: string;
  KeyFilePath?: string;
  Location?: string;
  HeaderChange?: string;
  HostChange?: string;
  Client?: { Id?: number };
  Target?: { TargetStr?: string; LocalProxy?: boolean };
};

export function EditHost({
  hostId,
  onNavigate,
  onLogout,
}: {
  hostId: number;
  onNavigate: (view: string) => void;
  onLogout?: () => void;
}) {
  const [config, setConfig] = useState<{
    https_just_proxy?: boolean;
    allow_local_proxy?: boolean;
  }>({});
  const [remark, setRemark] = useState('');
  const [host, setHost] = useState('');
  const [scheme, setScheme] = useState<'all' | 'http' | 'https'>('all');
  const [certFilePath, setCertFilePath] = useState('');
  const [keyFilePath, setKeyFilePath] = useState('');
  const [location, setLocation] = useState('');
  const [localProxy, setLocalProxy] = useState(false);
  const [target, setTarget] = useState('');
  const [header, setHeader] = useState('');
  const [hostchange, setHostchange] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadErr, setLoadErr] = useState('');
  const [error, setError] = useState('');
  const [clientId, setClientId] = useState(0);

  useEffect(() => {
    getDashboard().then((d) => setConfig(d as typeof config)).catch(() => {});
  }, []);

  useEffect(() => {
    setLoadErr('');
    getHost(hostId)
      .then((res) => {
        if (res.code !== 1 || !res.data) {
          setLoadErr('加载失败');
          return;
        }
        const h = res.data as HostData;
        setClientId(h.Client?.Id ?? 0);
        setRemark(h.Remark ?? '');
        setHost(h.Host ?? '');
        setScheme((h.Scheme as 'all' | 'http' | 'https') ?? 'all');
        setCertFilePath(h.CertFilePath ?? '');
        setKeyFilePath(h.KeyFilePath ?? '');
        setLocation(h.Location ?? '');
        setLocalProxy(!!h.Target?.LocalProxy);
        setTarget(h.Target?.TargetStr ?? '');
        setHeader(h.HeaderChange ?? '');
        setHostchange(h.HostChange ?? '');
      })
      .catch((e) => setLoadErr((e as Error).message));
  }, [hostId]);

  const showCertFields = !config.https_just_proxy && (scheme === 'all' || scheme === 'https');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const params: Record<string, string | number | boolean | undefined> = {
        id: hostId,
        client_id: clientId,
        remark: remark || undefined,
        host,
        scheme,
        location: location || undefined,
        target: target || undefined,
        header: header || undefined,
        hostchange: hostchange || undefined,
      };
      if (config.allow_local_proxy) params.local_proxy = localProxy;
      if (showCertFields) {
        params.cert_file_path = certFilePath || undefined;
        params.key_file_path = keyFilePath || undefined;
      }
      const res = await editHost(params);
      if (res.status === 1) {
        onNavigate(clientId ? `domain-${clientId}` : 'domain');
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
            onClick={() => onNavigate(clientId ? `domain-${clientId}` : 'domain')}
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
      <Sidebar currentView="domain" onNavigate={onNavigate} />
      <Header
        breadcrumbs={[
          { label: '工作台', view: 'dashboard' },
          { label: clientId ? `客户端 ${clientId} - 域名解析` : '域名解析' },
          { label: '编辑域名' },
        ]}
        onNavigate={onNavigate}
        onLogout={onLogout}
      />

      <main className="ml-64 pt-20 px-10 pb-10 max-w-3xl mx-auto">
        <PageTransition>
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-on-surface">编辑域名解析</h2>
            <p className="text-on-surface-variant text-sm mt-1">修改域名与内网目标映射。</p>
          </div>

          <form id="edit-host-form" onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="px-4 py-3 bg-error/10 border border-error/30 rounded-xl text-sm text-error">
                {error}
              </div>
            )}

            <Card>
              <div className="space-y-4">
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
                <div>
                  <label className="text-sm font-semibold mb-1.5 block text-on-surface">域名</label>
                  <input
                    type="text"
                    value={host}
                    onChange={(e) => setHost(e.target.value)}
                    className="w-full bg-surface-container-low border-none rounded-xl focus:ring-2 focus:ring-primary/30 text-sm py-3 px-4"
                    placeholder="例如 a.proxy.com"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold mb-1.5 block text-on-surface">协议</label>
                  <select
                    value={scheme}
                    onChange={(e) => setScheme(e.target.value as 'all' | 'http' | 'https')}
                    className="w-full bg-surface-container-low border-none rounded-xl focus:ring-2 focus:ring-primary/30 text-sm py-3 px-4"
                  >
                    <option value="all">全部</option>
                    <option value="http">HTTP</option>
                    <option value="https">HTTPS</option>
                  </select>
                </div>
                {showCertFields && (
                  <>
                    <div>
                      <label className="text-sm font-semibold mb-1.5 block text-on-surface">HTTPS 证书路径</label>
                      <input
                        type="text"
                        value={certFilePath}
                        onChange={(e) => setCertFilePath(e.target.value)}
                        className="w-full bg-surface-container-low border-none rounded-xl focus:ring-2 focus:ring-primary/30 text-sm py-3 px-4"
                        placeholder="可选"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-semibold mb-1.5 block text-on-surface">HTTPS 密钥路径</label>
                      <input
                        type="text"
                        value={keyFilePath}
                        onChange={(e) => setKeyFilePath(e.target.value)}
                        className="w-full bg-surface-container-low border-none rounded-xl focus:ring-2 focus:ring-primary/30 text-sm py-3 px-4"
                        placeholder="可选"
                      />
                    </div>
                  </>
                )}
                <div>
                  <label className="text-sm font-semibold mb-1.5 block text-on-surface">URL 路由</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full bg-surface-container-low border-none rounded-xl focus:ring-2 focus:ring-primary/30 text-sm py-3 px-4"
                    placeholder="可选"
                  />
                </div>
                {config.allow_local_proxy && (
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
                <div>
                  <label className="text-sm font-semibold mb-1.5 block text-on-surface">内网目标</label>
                  <textarea
                    value={target}
                    onChange={(e) => setTarget(e.target.value)}
                    rows={4}
                    className="w-full bg-surface-container-low border-none rounded-xl focus:ring-2 focus:ring-primary/30 text-sm py-3 px-4"
                    placeholder="例如 127.0.0.1:81"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold mb-1.5 block text-on-surface">请求头</label>
                  <textarea
                    value={header}
                    onChange={(e) => setHeader(e.target.value)}
                    rows={3}
                    className="w-full bg-surface-container-low border-none rounded-xl focus:ring-2 focus:ring-primary/30 text-sm py-3 px-4"
                    placeholder="例如 Cache-Control: no-cache"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold mb-1.5 block text-on-surface">请求 Host</label>
                  <input
                    type="text"
                    value={hostchange}
                    onChange={(e) => setHostchange(e.target.value)}
                    className="w-full bg-surface-container-low border-none rounded-xl focus:ring-2 focus:ring-primary/30 text-sm py-3 px-4"
                    placeholder="可选"
                  />
                </div>
              </div>
            </Card>
          </form>
        </PageTransition>
      </main>

      <div className="fixed bottom-0 right-0 w-[calc(100%-16rem)] bg-surface-container-lowest/90 backdrop-blur-md border-t border-outline-variant/15 px-10 py-4 flex justify-end gap-4 z-40">
        <button
          type="button"
          onClick={() => onNavigate(clientId ? `domain-${clientId}` : 'domain')}
          className="px-6 py-2.5 rounded-xl text-sm font-bold text-on-surface-variant bg-surface-container-high hover:bg-surface-dim transition-all"
        >
          取消
        </button>
        <button
          type="submit"
          form="edit-host-form"
          disabled={loading}
          className="px-8 py-2.5 rounded-xl text-sm font-bold text-white bg-primary shadow-ambient hover:shadow-lg disabled:opacity-70"
        >
          {loading ? '保存中...' : '保存'}
        </button>
      </div>
    </div>
  );
}
