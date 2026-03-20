import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
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
          setLoadErr(t('client.loadFailed'));
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
        setError(res.msg || t('tunnel.editFailed'));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t('tunnel.editFailed'));
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
            {t('common.back')}
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
          { labelKey: 'sidebar.dashboard', view: 'dashboard' },
          { label: clientId ? t('common.clientId', { id: clientId }) + ' ' + t('client.tunnel') : t('client.tunnel') },
          { labelKey: 'tunnel.editTunnel' },
        ]}
        onNavigate={onNavigate}
        onLogout={onLogout}
      />

      <main className="ml-64 pt-20 px-10 pb-10 max-w-3xl mx-auto">
        <PageTransition>
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-on-surface">{t('tunnel.editTunnel')}</h2>
            <p className="text-on-surface-variant text-sm mt-1">{t('tunnel.editDesc')}</p>
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
                  <label className="text-sm font-semibold mb-1.5 block text-on-surface">{t('tunnel.type')}</label>
                  <input
                    type="text"
                    value={type}
                    readOnly
                    className="w-full bg-surface-container-low border-none rounded-xl text-sm py-3 px-4 opacity-80"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold mb-1.5 block text-on-surface">{t('domain.clientId')}</label>
                  <input
                    type="number"
                    value={clientId}
                    readOnly
                    className="w-full bg-surface-container-low border-none rounded-xl text-sm py-3 px-4 opacity-80"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold mb-1.5 block text-on-surface">{t('tunnel.remark')}</label>
                  <input
                    type="text"
                    value={remark}
                    onChange={(e) => setRemark(e.target.value)}
                    className="w-full bg-surface-container-low border-none rounded-xl focus:ring-2 focus:ring-primary/30 text-sm py-3 px-4"
                    placeholder={t('common.optional')}
                  />
                </div>
                {fields.includes('server_ip') && config.allow_multi_ip && (
                  <div>
                    <label className="text-sm font-semibold mb-1.5 block text-on-surface">{t('dashboard.serverIp')}</label>
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
                    <label className="text-sm font-semibold mb-1.5 block text-on-surface">{t('tunnel.port')}</label>
                    <input
                      type="number"
                      value={port}
                      onChange={(e) => setPort(e.target.value)}
                      className="w-full bg-surface-container-low border-none rounded-xl focus:ring-2 focus:ring-primary/30 text-sm py-3 px-4"
                      placeholder={t('tunnel.portPlaceholder')}
                    />
                  </div>
                )}
                {fields.includes('target') && (
                  <div>
                    <label className="text-sm font-semibold mb-1.5 block text-on-surface">{t('tunnel.target')}</label>
                    <textarea
                      value={target}
                      onChange={(e) => setTarget(e.target.value)}
                      rows={3}
                      className="w-full bg-surface-container-low border-none rounded-xl focus:ring-2 focus:ring-primary/30 text-sm py-3 px-4"
                      placeholder={t('domain.targetPlaceholderShort')}
                    />
                  </div>
                )}
                {fields.includes('password') && (
                  <div>
                    <label className="text-sm font-semibold mb-1.5 block text-on-surface">{t('tunnel.secretKeyLabel')}</label>
                    <input
                      type="text"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-surface-container-low border-none rounded-xl focus:ring-2 focus:ring-primary/30 text-sm py-3 px-4"
                      placeholder={t('tunnel.secretKey')}
                    />
                  </div>
                )}
                {fields.includes('local_proxy') && config.allow_local_proxy && (
                  <div>
                    <label className="text-sm font-semibold mb-1.5 block text-on-surface">{t('domain.localProxy')}</label>
                    <select
                      value={localProxy ? '1' : '0'}
                      onChange={(e) => setLocalProxy(e.target.value === '1')}
                      className="w-full bg-surface-container-low border-none rounded-xl focus:ring-2 focus:ring-primary/30 text-sm py-3 px-4"
                    >
                      <option value="0">{t('common.no')}</option>
                      <option value="1">{t('common.yes')}</option>
                    </select>
                  </div>
                )}
                {fields.includes('local_path') && (
                  <div>
                    <label className="text-sm font-semibold mb-1.5 block text-on-surface">{t('tunnel.localPath')}</label>
                    <input
                      type="text"
                      value={localPath}
                      onChange={(e) => setLocalPath(e.target.value)}
                      className="w-full bg-surface-container-low border-none rounded-xl focus:ring-2 focus:ring-primary/30 text-sm py-3 px-4"
                      placeholder={t('tunnel.localPathPlaceholder')}
                    />
                  </div>
                )}
                {fields.includes('strip_pre') && (
                  <div>
                    <label className="text-sm font-semibold mb-1.5 block text-on-surface">{t('tunnel.stripPrefix')}</label>
                    <input
                      type="text"
                      value={stripPre}
                      onChange={(e) => setStripPre(e.target.value)}
                      className="w-full bg-surface-container-low border-none rounded-xl focus:ring-2 focus:ring-primary/30 text-sm py-3 px-4"
                      placeholder={t('common.optional')}
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
          {t('common.cancel')}
        </button>
        <button
          type="submit"
          form="edit-tunnel-form"
          disabled={loading}
          className="px-8 py-2.5 rounded-xl text-sm font-bold text-white bg-primary shadow-ambient hover:shadow-lg disabled:opacity-70"
        >
          {loading ? t('common.saving') : t('common.save')}
        </button>
      </div>
    </div>
  );
}
