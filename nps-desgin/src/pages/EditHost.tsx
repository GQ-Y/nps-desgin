import React, { useState, useEffect } from 'react';
import { Sidebar } from '../components/Sidebar';
import { Header } from '../components/Header';
import { Card, PageTransition } from '../components/Shared';
import { Input, Select, Textarea } from '../components/ui';
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
                <Input label="客户端 ID" type="text" value={String(clientId)} readOnly inputClassName="opacity-80" />
                <Input label="备注" value={remark} onChange={(e) => setRemark(e.target.value)} placeholder="可选" />
                <Input
                  label="域名"
                  value={host}
                  onChange={(e) => setHost(e.target.value)}
                  placeholder="例如 a.proxy.com"
                  required
                />
                <Select
                  label="协议"
                  value={scheme}
                  onChange={(v) => setScheme(v)}
                  options={[
                    { value: 'all', label: '全部' },
                    { value: 'http', label: 'HTTP' },
                    { value: 'https', label: 'HTTPS' },
                  ]}
                />
                {showCertFields && (
                  <>
                    <Input
                      label="HTTPS 证书路径"
                      value={certFilePath}
                      onChange={(e) => setCertFilePath(e.target.value)}
                      placeholder="可选"
                    />
                    <Input
                      label="HTTPS 密钥路径"
                      value={keyFilePath}
                      onChange={(e) => setKeyFilePath(e.target.value)}
                      placeholder="可选"
                    />
                  </>
                )}
                <Input
                  label="URL 路由"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="可选"
                />
                {config.allow_local_proxy && (
                  <Select
                    label="代理到本地"
                    value={localProxy ? '1' : '0'}
                    onChange={(v) => setLocalProxy(v === '1')}
                    options={[
                      { value: '0', label: '否' },
                      { value: '1', label: '是' },
                    ]}
                  />
                )}
                <Textarea
                  label="内网目标"
                  value={target}
                  onChange={(e) => setTarget(e.target.value)}
                  rows={4}
                  placeholder="例如 127.0.0.1:81"
                />
                <Textarea
                  label="请求头"
                  value={header}
                  onChange={(e) => setHeader(e.target.value)}
                  rows={3}
                  placeholder="例如 Cache-Control: no-cache"
                />
                <Input
                  label="请求 Host"
                  value={hostchange}
                  onChange={(e) => setHostchange(e.target.value)}
                  placeholder="可选"
                />
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
