import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
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
          setLoadErr(t('client.loadFailed'));
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
        setError(res.msg || t('domain.editFailed'));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t('domain.editFailed'));
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
            {t('common.back')}
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
          { labelKey: 'sidebar.dashboard', view: 'dashboard' },
          { label: clientId ? t('client.clientDetail', { id: clientId }) : t('sidebar.domain') },
          { labelKey: 'domain.editHost' },
        ]}
        onNavigate={onNavigate}
        onLogout={onLogout}
      />

      <main className="ml-64 pt-20 px-10 pb-10 max-w-3xl mx-auto">
        <PageTransition>
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-on-surface">{t('domain.editHost')}</h2>
            <p className="text-on-surface-variant text-sm mt-1">{t('domain.editDesc')}</p>
          </div>

          <form id="edit-host-form" onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="px-4 py-3 bg-error/10 border border-error/30 rounded-xl text-sm text-error">
                {error}
              </div>
            )}

            <Card>
              <div className="space-y-4">
                <Input label={t('domain.clientId')} type="text" value={String(clientId)} readOnly inputClassName="opacity-80" />
                <Input label={t('tunnel.remark')} value={remark} onChange={(e) => setRemark(e.target.value)} placeholder={t('common.optional')} />
                <Input
                  label={t('domain.domain')}
                  value={host}
                  onChange={(e) => setHost(e.target.value)}
                  placeholder={t('domain.domainPlaceholder')}
                  required
                />
                <Select
                  label={t('domain.protocol')}
                  value={scheme}
                  onChange={(v) => setScheme(v)}
                  options={[
                    { value: 'all', label: t('domain.all') },
                    { value: 'http', label: 'HTTP' },
                    { value: 'https', label: 'HTTPS' },
                  ]}
                />
                {showCertFields && (
                  <>
                    <Input
                      label={t('domain.httpsCert')}
                      value={certFilePath}
                      onChange={(e) => setCertFilePath(e.target.value)}
                      placeholder={t('common.optional')}
                    />
                    <Input
                      label={t('domain.httpsKey')}
                      value={keyFilePath}
                      onChange={(e) => setKeyFilePath(e.target.value)}
                      placeholder={t('common.optional')}
                    />
                  </>
                )}
                <Input
                  label={t('domain.urlRoute')}
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder={t('common.optional')}
                />
                {config.allow_local_proxy && (
                  <Select
                    label={t('domain.localProxy')}
                    value={localProxy ? '1' : '0'}
                    onChange={(v) => setLocalProxy(v === '1')}
                    options={[
                      { value: '0', label: t('common.no') },
                      { value: '1', label: t('common.yes') },
                    ]}
                  />
                )}
                <Textarea
                  label={t('domain.target')}
                  value={target}
                  onChange={(e) => setTarget(e.target.value)}
                  rows={4}
                  placeholder={t('domain.targetPlaceholderShort')}
                />
                <Textarea
                  label={t('domain.requestHeader')}
                  value={header}
                  onChange={(e) => setHeader(e.target.value)}
                  rows={3}
                  placeholder={t('domain.requestHeaderPlaceholder')}
                />
                <Input
                  label={t('domain.requestHost')}
                  value={hostchange}
                  onChange={(e) => setHostchange(e.target.value)}
                  placeholder={t('common.optional')}
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
          {t('common.cancel')}
        </button>
        <button
          type="submit"
          form="edit-host-form"
          disabled={loading}
          className="px-8 py-2.5 rounded-xl text-sm font-bold text-white bg-primary shadow-ambient hover:shadow-lg disabled:opacity-70"
        >
          {loading ? t('common.saving') : t('common.save')}
        </button>
      </div>
    </div>
  );
}
