import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Globe,
  Cable,
  Radio,
  Shield,
  Network,
  Github,
  ExternalLink,
  Sparkles,
  Info,
  Star,
  GitFork,
  Activity,
} from 'lucide-react';
import { Sidebar } from '../components/Sidebar';
import { Header } from '../components/Header';
import { getDashboard } from '../api/client';
import {
  GITHUB_REPO_URL,
  GITHUB_STARGAZERS_URL,
  GITHUB_FORK_URL,
  GITHUB_PULSE_URL,
} from '../config/githubRepo';

function listFromI18n(
  t: (key: string, opts?: Record<string, unknown>) => unknown,
  key: string,
  vars: Record<string, string | number>
): string[] {
  const raw = t(key, { ...vars, returnObjects: true });
  return Array.isArray(raw) ? (raw as string[]) : [];
}

function CodeInline({ children }: { children: React.ReactNode }) {
  return (
    <code className="rounded-md border border-outline-variant/25 bg-surface-container-high/80 px-2 py-0.5 font-mono text-[0.8rem] text-primary">
      {children}
    </code>
  );
}

function renderStepLine(line: string, cmd: string): React.ReactNode {
  if (!line.includes('__CMD__')) return line;
  const [before, after = ''] = line.split('__CMD__');
  return (
    <>
      {before}
      <CodeInline>{cmd}</CodeInline>
      {after}
    </>
  );
}

function SectionBlock({
  icon: Icon,
  label,
  children,
  variant = 'default',
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  children: React.ReactNode;
  variant?: 'default' | 'note';
}) {
  const isNote = variant === 'note';
  return (
    <div
      className={`rounded-xl border p-4 ${
        isNote
          ? 'border-primary/20 bg-primary-fixed/10'
          : 'border-outline-variant/20 bg-surface-container-low/40'
      }`}
    >
      <div className="mb-2 flex items-center gap-2">
        <span
          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${
            isNote ? 'bg-primary/15 text-primary' : 'bg-surface-container-high text-on-surface-variant'
          }`}
        >
          <Icon size={14} strokeWidth={2.25} />
        </span>
        <span className="text-xs font-bold uppercase tracking-wider text-primary">{label}</span>
      </div>
      <div className="text-sm leading-relaxed text-on-surface-variant [&_strong]:font-semibold [&_strong]:text-on-surface">
        {children}
      </div>
    </div>
  );
}

function GuideCard({
  title,
  icon: Icon,
  accentClass,
  children,
}: {
  title: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  accentClass: string;
  children: React.ReactNode;
}) {
  return (
    <div className="group overflow-hidden rounded-2xl border border-outline-variant/15 bg-surface-container-lowest shadow-card transition-shadow duration-300 hover:shadow-lg hover:border-outline-variant/25">
      <div
        className={`relative flex items-center gap-3 border-b border-outline-variant/10 px-5 py-4 ${accentClass}`}
      >
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/15 text-white shadow-sm backdrop-blur-sm">
          <Icon size={22} strokeWidth={2} />
        </div>
        <h3 className="text-lg font-bold tracking-tight text-white drop-shadow-sm">{title}</h3>
      </div>
      <div className="space-y-4 p-5 md:p-6">{children}</div>
    </div>
  );
}

export function Help({
  onNavigate,
  onLogout,
}: {
  onNavigate: (view: string) => void;
  onLogout?: () => void;
}) {
  const { t } = useTranslation();
  const [ip, setIp] = useState(t('help.serverIpPlaceholder'));
  const [p, setP] = useState(t('help.portPlaceholder'));

  useEffect(() => {
    getDashboard()
      .then((d) => {
        const d2 = d as { ip?: string; p?: number };
        setIp(String(d2.ip ?? t('help.serverIpPlaceholder')));
        setP(String(d2.p ?? t('help.portPlaceholder')));
      })
      .catch(() => {});
  }, []);

  const cmd = `./npc -server=${ip}:${p} -vkey=${t('help.clientKeyPlaceholder')}`;
  const iv = { ip };

  return (
    <div className="min-h-screen bg-surface">
      <Sidebar currentView="help" onNavigate={onNavigate} />
      <Header
        breadcrumbs={[{ labelKey: 'sidebar.dashboard', view: 'dashboard' }, { labelKey: 'help.title' }]}
        onNavigate={onNavigate}
        onLogout={onLogout}
      />

      <main className="ml-64 pt-20 px-6 pb-20 md:px-10">
        <div className="mx-auto max-w-4xl space-y-8">
          {/* GitHub */}
          <div className="relative overflow-hidden rounded-2xl border border-outline-variant/15 bg-gradient-to-br from-surface-container-lowest via-surface-container-low to-primary-fixed/15 p-6 shadow-card">
            <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-primary/10 blur-3xl" />
            <div className="relative flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
              <div className="flex gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-on-surface/[0.06] text-on-surface">
                  <Github size={28} strokeWidth={2} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-on-surface">{t('help.githubBannerTitle')}</h2>
                  <p className="mt-1 max-w-xl text-sm leading-relaxed text-on-surface-variant">
                    {t('help.githubBannerDesc')}
                  </p>
                  <a
                    href={GITHUB_REPO_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
                  >
                    {t('help.openRepo')}
                    <ExternalLink size={14} />
                  </a>
                </div>
              </div>
              <div className="flex w-full flex-col gap-3 md:w-auto md:max-w-md md:shrink-0 md:items-stretch">
                <p className="text-center text-[11px] font-bold uppercase tracking-[0.12em] text-on-surface-variant/70 md:text-right">
                  {t('help.githubQuickLinks')}
                </p>
                <div className="rounded-2xl border border-outline-variant/25 bg-surface-container-lowest/60 p-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-md">
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                    <a
                      href={GITHUB_STARGAZERS_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group relative flex min-h-[44px] items-center justify-center gap-2 overflow-hidden rounded-xl border border-outline-variant/20 bg-gradient-to-b from-surface-container-high/90 to-surface-container-low/80 px-3 py-2.5 text-sm font-semibold text-on-surface shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-amber-500/40 hover:from-amber-500/10 hover:to-amber-600/5 hover:text-amber-900 hover:shadow-md"
                    >
                      <Star
                        size={17}
                        className="shrink-0 text-amber-500 transition-transform duration-200 group-hover:scale-110 group-hover:fill-amber-400/30"
                        strokeWidth={2.25}
                        aria-hidden
                      />
                      {t('help.ghStar')}
                    </a>
                    <a
                      href={GITHUB_FORK_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group relative flex min-h-[44px] items-center justify-center gap-2 overflow-hidden rounded-xl border border-outline-variant/20 bg-gradient-to-b from-surface-container-high/90 to-surface-container-low/80 px-3 py-2.5 text-sm font-semibold text-on-surface shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-secondary/45 hover:from-secondary/12 hover:to-secondary/5 hover:text-secondary hover:shadow-md"
                    >
                      <GitFork
                        size={17}
                        className="shrink-0 text-secondary transition-transform duration-200 group-hover:scale-110"
                        strokeWidth={2.25}
                        aria-hidden
                      />
                      {t('help.ghFork')}
                    </a>
                    <a
                      href={GITHUB_PULSE_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group relative flex min-h-[44px] items-center justify-center gap-2 overflow-hidden rounded-xl border border-outline-variant/20 bg-gradient-to-b from-surface-container-high/90 to-surface-container-low/80 px-3 py-2.5 text-sm font-semibold text-on-surface shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:from-primary/12 hover:to-primary/5 hover:text-primary hover:shadow-md"
                    >
                      <Activity
                        size={17}
                        className="shrink-0 text-primary transition-transform duration-200 group-hover:scale-110"
                        strokeWidth={2.25}
                        aria-hidden
                      />
                      {t('help.ghWatch')}
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Domain — full width */}
          <GuideCard
            title={t('help.domainExample')}
            icon={Globe}
            accentClass="bg-gradient-to-r from-sky-600 to-blue-700"
          >
            <SectionBlock icon={Sparkles} label={t('help.labelScope')}>
              <p>{t('help.domainScope')}</p>
            </SectionBlock>
            <SectionBlock icon={Network} label={t('help.labelScenario')}>
              <ul className="list-none space-y-2 pl-0">
                {listFromI18n(t, 'help.domainScenarioItems', iv).map((line, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
            </SectionBlock>
            <SectionBlock icon={Cable} label={t('help.labelSteps')}>
              <ul className="list-none space-y-3 pl-0">
                {listFromI18n(t, 'help.domainStepItems', iv).map((line, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/12 text-[11px] font-bold text-primary">
                      {i + 1}
                    </span>
                    <span>{renderStepLine(line, cmd)}</span>
                  </li>
                ))}
              </ul>
            </SectionBlock>
            <SectionBlock icon={Info} label={t('help.labelNote')} variant="note">
              <p>{t('help.domainNote', { ip })}</p>
            </SectionBlock>
          </GuideCard>

          <div className="grid gap-6 md:grid-cols-2">
            <GuideCard title={t('help.tcpExample')} icon={Cable} accentClass="bg-gradient-to-r from-emerald-600 to-teal-700">
              <SectionBlock icon={Sparkles} label={t('help.labelScope')}>
                <p>{t('help.tcpScope')}</p>
              </SectionBlock>
              <SectionBlock icon={Network} label={t('help.labelScenario')}>
                <p>{t('help.tcpScenario', { ip })}</p>
              </SectionBlock>
              <SectionBlock icon={Cable} label={t('help.labelSteps')}>
                <ul className="list-none space-y-3 pl-0">
                  {listFromI18n(t, 'help.tcpStepItems', iv).map((line, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/12 text-[11px] font-bold text-primary">
                        {i + 1}
                      </span>
                      <span className="break-words">{renderStepLine(line, cmd)}</span>
                    </li>
                  ))}
                </ul>
              </SectionBlock>
              <SectionBlock icon={Info} label={t('help.labelNote')} variant="note">
                <p>{t('help.tcpNote', { ip })}</p>
              </SectionBlock>
            </GuideCard>

            <GuideCard title={t('help.udpExample')} icon={Radio} accentClass="bg-gradient-to-r from-violet-600 to-purple-700">
              <SectionBlock icon={Sparkles} label={t('help.labelScope')}>
                <p>{t('help.udpScope')}</p>
              </SectionBlock>
              <SectionBlock icon={Network} label={t('help.labelScenario')}>
                <p>{t('help.udpScenario', { ip })}</p>
              </SectionBlock>
              <SectionBlock icon={Cable} label={t('help.labelSteps')}>
                <ul className="list-none space-y-3 pl-0">
                  {listFromI18n(t, 'help.udpStepItems', iv).map((line, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/12 text-[11px] font-bold text-primary">
                        {i + 1}
                      </span>
                      <span>{renderStepLine(line, cmd)}</span>
                    </li>
                  ))}
                </ul>
              </SectionBlock>
              <SectionBlock icon={Info} label={t('help.labelNote')} variant="note">
                <p>{t('help.udpNote', { ip })}</p>
              </SectionBlock>
            </GuideCard>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <GuideCard title={t('help.socks5Example')} icon={Shield} accentClass="bg-gradient-to-r from-amber-600 to-orange-700">
              <SectionBlock icon={Sparkles} label={t('help.labelScope')}>
                <p>{t('help.socks5Scope')}</p>
              </SectionBlock>
              <SectionBlock icon={Network} label={t('help.labelScenario')}>
                <p>{t('help.socks5Scenario', { ip })}</p>
              </SectionBlock>
              <SectionBlock icon={Cable} label={t('help.labelSteps')}>
                <ul className="list-none space-y-3 pl-0">
                  {listFromI18n(t, 'help.socks5StepItems', iv).map((line, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/12 text-[11px] font-bold text-primary">
                        {i + 1}
                      </span>
                      <span>{renderStepLine(line, cmd)}</span>
                    </li>
                  ))}
                </ul>
              </SectionBlock>
              <SectionBlock icon={Info} label={t('help.labelNote')} variant="note">
                <p>{t('help.socks5Note', { ip })}</p>
              </SectionBlock>
            </GuideCard>

            <GuideCard title={t('help.httpExample')} icon={Network} accentClass="bg-gradient-to-r from-rose-600 to-pink-700">
              <SectionBlock icon={Sparkles} label={t('help.labelScope')}>
                <p>{t('help.httpScope')}</p>
              </SectionBlock>
              <SectionBlock icon={Network} label={t('help.labelScenario')}>
                <p>{t('help.httpScenario', { ip })}</p>
              </SectionBlock>
              <SectionBlock icon={Cable} label={t('help.labelSteps')}>
                <ul className="list-none space-y-3 pl-0">
                  {listFromI18n(t, 'help.httpStepItems', iv).map((line, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/12 text-[11px] font-bold text-primary">
                        {i + 1}
                      </span>
                      <span>{renderStepLine(line, cmd)}</span>
                    </li>
                  ))}
                </ul>
              </SectionBlock>
              <SectionBlock icon={Info} label={t('help.labelNote')} variant="note">
                <p>{t('help.httpNote', { ip })}</p>
              </SectionBlock>
            </GuideCard>
          </div>

          <div className="flex items-start gap-4 rounded-2xl border border-secondary/25 bg-secondary-container/15 px-6 py-5 shadow-sm">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-secondary/20 text-secondary">
              <Info size={20} />
            </div>
            <p className="text-sm font-medium leading-relaxed text-on-surface">{t('help.multiTunnelNote')}</p>
          </div>
        </div>
      </main>
    </div>
  );
}
