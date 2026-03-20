import React from 'react';
import { Sidebar } from '../components/Sidebar';
import { Header } from '../components/Header';
import { Card, PageTransition } from '../components/Shared';
import { 
  Network, Router, Shield, Lock, TrainTrack, Radio, Globe, FolderOpen, 
  ChevronRight, Edit2, RefreshCw, ChevronDown
} from 'lucide-react';

export function AddClient({ onNavigate }: { onNavigate: (view: string) => void }) {
  return (
    <div className="min-h-screen bg-surface pb-24">
      <Sidebar currentView="add-client" onNavigate={onNavigate} />
      <Header 
        breadcrumbs={[
          { label: 'Clients', view: 'clients' }, 
          { label: 'Add New Client' }
        ]} 
        onNavigate={onNavigate}
        showTabs={true}
      />

      <main className="ml-64 pt-24 px-10 max-w-5xl mx-auto">
        <PageTransition>
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-on-surface tracking-tight">Client Configuration</h2>
            <p className="text-on-surface-variant text-sm mt-1">Configure your client's organizational data, protocols, and security constraints.</p>
          </div>

          <form className="space-y-8">
            {/* Section 1: Organization */}
            <Card>
              <SectionHeader title="Organization & Grouping" />
              <div className="space-y-4">
                <label className="block">
                  <span className="text-sm font-semibold text-on-surface mb-2 block">Assigned Group</span>
                  <div className="flex items-center gap-3 p-3.5 bg-surface-container-low rounded-xl border border-transparent hover:border-outline-variant/50 transition-all cursor-pointer group">
                    <Network className="text-primary w-5 h-5" />
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-on-surface-variant">Default Root</span>
                      <ChevronRight className="w-3.5 h-3.5 text-outline" />
                      <span className="text-on-surface-variant">Production Cluster</span>
                      <ChevronRight className="w-3.5 h-3.5 text-outline" />
                      <span className="text-on-surface font-bold">Frontend Nodes</span>
                    </div>
                    <Edit2 className="w-4 h-4 ml-auto text-outline group-hover:text-primary transition-colors" />
                  </div>
                  <p className="text-xs text-outline mt-2 italic">Hierarchy used for permission scoping and resource allocation.</p>
                </label>
              </div>
            </Card>

            {/* Section 2: Protocols */}
            <Card>
              <SectionHeader title="Protocol Capabilities" />
              <p className="text-sm text-on-surface-variant mb-6">Select the protocols this client is authorized to negotiate with the server.</p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <ProtocolCheckbox icon={Network} title="TCP" desc="Standard TCP stream" defaultChecked />
                <ProtocolCheckbox icon={Router} title="UDP" desc="Fast UDP datagram" defaultChecked />
                <ProtocolCheckbox icon={Shield} title="HTTP Proxy" desc="Web-based proxying" />
                <ProtocolCheckbox icon={Lock} title="SOCKS5" desc="Generic socks relaying" />
                <ProtocolCheckbox icon={TrainTrack} title="Secret Tunnel" desc="Encrypted private channel" defaultChecked />
                <ProtocolCheckbox icon={Radio} title="P2P" desc="Peer-to-peer data bridge" />
                <ProtocolCheckbox icon={Globe} title="Domain Mapping" desc="Host-header routing" defaultChecked />
                <ProtocolCheckbox icon={FolderOpen} title="File Service" desc="Remote filesystem access" />
              </div>
            </Card>

            {/* Section 3: Basic Config */}
            <Card>
              <SectionHeader title="Basic Configuration" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="col-span-2">
                  <label className="text-sm font-semibold mb-1.5 block text-on-surface">Remarks</label>
                  <input type="text" className="w-full bg-surface-container-low border-none rounded-xl focus:ring-2 focus:ring-primary/30 text-sm py-3 px-4 placeholder-outline" placeholder="e.g. Core-API-Server-HK" />
                </div>
                
                <div>
                  <label className="text-sm font-semibold mb-1.5 block text-on-surface">Basic Auth Username</label>
                  <input type="text" className="w-full bg-surface-container-low border-none rounded-xl focus:ring-2 focus:ring-primary/30 text-sm py-3 px-4" />
                </div>
                <div>
                  <label className="text-sm font-semibold mb-1.5 block text-on-surface">Basic Auth Password</label>
                  <input type="password" className="w-full bg-surface-container-low border-none rounded-xl focus:ring-2 focus:ring-primary/30 text-sm py-3 px-4" />
                </div>

                <div className="col-span-2">
                  <label className="text-sm font-semibold mb-1.5 block text-on-surface">Validation Key</label>
                  <div className="flex gap-3">
                    <input type="text" defaultValue="3f8a2c1e90b74d58" className="flex-1 tabular-nums font-mono bg-surface-container-low border-none rounded-xl focus:ring-2 focus:ring-primary/30 text-sm py-3 px-4" />
                    <button type="button" className="bg-primary-fixed text-on-primary-fixed px-5 rounded-xl text-sm font-bold hover:bg-primary-fixed-dim transition-colors flex items-center gap-2">
                      <RefreshCw size={16} />
                      Generate
                    </button>
                  </div>
                </div>

                <div className="col-span-2">
                  <label className="text-sm font-semibold mb-1.5 block text-on-surface">Only allow config connection</label>
                  <div className="relative">
                    <select className="w-full bg-surface-container-low border-none rounded-xl focus:ring-2 focus:ring-primary/30 text-sm py-3 px-4 appearance-none font-medium">
                      <option>Yes (Highly Secure)</option>
                      <option>No (Dynamic Mode)</option>
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-outline pointer-events-none" />
                  </div>
                </div>
              </div>
            </Card>

            {/* Section 4: Advanced */}
            <div className="bg-surface-container rounded-2xl border border-outline-variant/15 overflow-hidden">
              <button type="button" className="w-full flex items-center justify-between p-6 text-left group hover:bg-surface-container-high transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-6 bg-secondary rounded-full"></div>
                  <h3 className="text-lg font-bold text-secondary">Advanced Limits <span className="text-xs font-medium text-outline ml-2">(Optional)</span></h3>
                </div>
                <ChevronDown className="text-outline group-hover:text-secondary transition-colors" />
              </button>
              <div className="p-8 pt-2 grid grid-cols-1 md:grid-cols-3 gap-6">
                <AdvancedInput label="Flow Limit (M)" placeholder="0 = Unlimited" />
                <AdvancedInput label="Speed Limit (KB/s)" placeholder="0 = Unlimited" />
                <AdvancedInput label="Max Connections" placeholder="1000" />
              </div>
            </div>
          </form>
        </PageTransition>
      </main>

      {/* Fixed Footer Actions */}
      <div className="fixed bottom-0 right-0 w-[calc(100%-16rem)] bg-surface-container-lowest/90 backdrop-blur-md border-t border-outline-variant/15 px-10 py-4 flex justify-end gap-4 z-40">
        <button 
          onClick={() => onNavigate('dashboard')}
          className="px-6 py-2.5 rounded-xl text-sm font-bold text-on-surface-variant bg-surface-container-high hover:bg-surface-dim transition-all active:scale-95"
        >
          Cancel
        </button>
        <button className="px-8 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-primary to-primary-container shadow-ambient hover:shadow-lg hover:shadow-primary/20 transition-all active:scale-95">
          Save Client
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

function ProtocolCheckbox({ icon: Icon, title, desc, defaultChecked = false }: any) {
  return (
    <label className="relative flex flex-col p-4 bg-surface-container-low rounded-xl border-2 border-transparent has-[:checked]:border-primary has-[:checked]:bg-primary-fixed/30 cursor-pointer transition-all hover:bg-surface-container-high group">
      <input type="checkbox" defaultChecked={defaultChecked} className="absolute top-4 right-4 rounded border-outline-variant text-primary focus:ring-primary w-4 h-4 bg-surface-container-lowest" />
      <Icon className="text-primary mb-3 w-6 h-6" />
      <span className="text-sm font-bold text-on-surface block">{title}</span>
      <span className="text-[10px] text-on-surface-variant leading-tight mt-1 font-medium opacity-80 group-hover:opacity-100 transition-opacity">{desc}</span>
    </label>
  );
}

function AdvancedInput({ label, placeholder }: { label: string, placeholder: string }) {
  return (
    <div>
      <label className="text-xs font-bold text-on-surface-variant mb-2 block uppercase tracking-wider">{label}</label>
      <input type="number" placeholder={placeholder} className="w-full tabular-nums bg-surface-container-lowest border-none rounded-xl focus:ring-2 focus:ring-secondary/30 text-sm py-3 px-4 shadow-sm" />
    </div>
  );
}
