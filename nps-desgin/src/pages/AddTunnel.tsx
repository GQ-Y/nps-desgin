import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Sidebar } from '../components/Sidebar';
import { Header } from '../components/Header';
import { Card, PageTransition } from '../components/Shared';
import { ChevronDown } from 'lucide-react';
import { addTunnel, getDashboard, getClientList } from '../api/client';

const TYPE_OPTIONS = [
  { value: 'tcp', labelKey: 'sidebar.tcp' },
  { value: 'udp', labelKey: 'sidebar.udp' },
  { value: 'httpProxy', labelKey: 'sidebar.httpProxy' },
  { value: 'socks5', labelKey: 'sidebar.socks5' },
  { value: 'secret', labelKey: 'sidebar.secretTunnel' },
  { value: 'p2p', labelKey: 'sidebar.p2p' },
  { value: 'file', labelKey: 'sidebar.fileService' },
];

const FIELDS_BY_TYPE: Record<string, string[]> = {
  tcp: ['port', 'target', 'local_proxy', 'client_id', 'server_ip'],
  udp: ['port', 'target', 'local_proxy', 'client_id', 'server_ip'],
  httpProxy: ['port', 'client_id', 'server_ip'],
  socks5: ['port', 'client_id', 'server_ip'],
  secret: ['target', 'password', 'client_id', 'server_ip'],
  p2p: ['target', 'password', 'client_id', 'server_ip'],
  file: ['port', 'local_path', 'strip_pre', 'client_id', 'server_ip'],
};

export function AddTunnel({
  tunnelType,
  clientId: initialClientId,
  onNavigate,
  onLogout,
}: {
  tunnelType: string;
  clientId: number;
  onNavigate: (view: string) => void;
  onLogout?: () => void;
}) {
  const { t } = useTranslation();
  const [clientId, setClientId] = useState(initialClientId);
  const [clients, setClients] = useState<{ Id: number; Remark?: string }[]>([]);
  const [config, setConfig] = useState<{ allow_multi_ip?: boolean; allow_local_proxy?: boolean }>({});
  const [type, setType] = useState(tunnelType === 'tunnel' ? 'secret' : tunnelType === 'http' ? 'httpProxy' : tunnelType);
  const [remark, setRemark] = useState('');
  const [port, setPort] = useState('');
  const [target, setTarget] = useState('');
  const [password, setPassword] = useState('');
  const [localPath, setLocalPath] = useState('');
  const [stripPre, setStripPre] = useState('');
  const [serverIp, setServerIp] = useState('0.0.0.0');
  const [localProxy, setLocalProxy] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    getDashboard().then((d) => setConfig(d as typeof config)).catch(() => {});
  }, []);
  useEffect(() => {
    if (initialClientId) {
      setClientId(initialClientId);
    } else {
      getClientList({ limit: 500 }).then((r) => setClients(r.rows ?? [])).catch(() => {});
    }
  }, [initialClientId]);

  const fields = FIELDS_BY_TYPE[type] ?? FIELDS_BY_TYPE.tcp;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const params: Record<string, string | number | boolean | undefined> = {
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
      const res = await addTunnel(params);
      if (res.status === 1) {
        onNavigate(clientId ? `tunnel-all-${clientId}` : type);
      } else {
        setError(res.msg || t('client.addFailed'));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t('client.addFailed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface pb-24">
      <Sidebar currentView={type} onNavigate={onNavigate} />
      <Header
        breadcrumbs={[
          { labelKey: 'sidebar.dashboard', view: 'dashboard' },
          { label: clientId ? t('common.clientId', { id: clientId }) + ' ' + t('client.tunnel') : t('client.tunnel') },
          { labelKey: 'tunnel.addTunnel' },
        ]}
        onNavigate={onNavigate}
        onLogout={onLogout}
      />

      <main className="ml-64 pt-20 px-10 pb-10 max-w-3xl mx-auto">
        <PageTransition>
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-on-surface">{t('tunnel.addTunnel')}</h2>
            <p className="text-on-surface-variant text-sm mt-1">{t('tunnel.addTunnelDesc')}</p>
          </div>

          <form id="add-tunnel-form" onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="px-4 py-3 bg-error/10 border border-error/30 rounded-xl text-sm text-error">
                {error}
              </div>
            )}

            <Card>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-semibold mb-1.5 block text-on-surface">{t('tunnel.type')}</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full bg-surface-container-low border-none rounded-xl focus:ring-2 focus:ring-primary/30 text-sm py-3 px-4"
                  >
                    {TYPE_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {t(o.labelKey)}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-semibold mb-1.5 block text-on-surface">{t('domain.client')}</label>
                  {initialClientId ? (
                    <input
                      type="number"
                      value={clientId}
                      readOnly
                      className="w-full bg-surface-container-low border-none rounded-xl text-sm py-3 px-4 opacity-80"
                    />
                  ) : (
                    <select
                      value={clientId}
                      onChange={(e) => setClientId(parseInt(e.target.value, 10))}
                      className="w-full bg-surface-container-low border-none rounded-xl focus:ring-2 focus:ring-primary/30 text-sm py-3 px-4"
                      required
                    >
                      <option value={0}>{t('tunnel.selectClient')}</option>
                      {clients.map((c) => (
                        <option key={c.Id} value={c.Id}>
                          {c.Id} - {c.Remark || t('tunnel.unnamed')}
                        </option>
                      ))}
                    </select>
                  )}
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
                      placeholder={t('tunnel.targetPlaceholder')}
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
          form="add-tunnel-form"
          disabled={loading}
          className="px-8 py-2.5 rounded-xl text-sm font-bold text-white bg-primary shadow-ambient hover:shadow-lg disabled:opacity-70"
        >
          {loading ? t('common.adding') : t('common.add')}
        </button>
      </div>
    </div>
  );
}
