import React, { useState } from 'react';
import { POSTGRES_SCHEMA, REDIS_STRUCTURES, PYTHON_SCORING_SCRIPT } from '../data/blueprints';
import { Terminal, Copy, Check, Database, Cpu, Layers, ExternalLink } from 'lucide-react';

export const UniversalBlueprint: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'postgres' | 'redis' | 'python' | 'domains'>('postgres');
  const [copied, setCopied] = useState<string | null>(null);
  const [selectedDomain, setSelectedDomain] = useState<'music' | 'ecommerce' | 'hardware'>('music');

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2500);
  };

  const domainSpecs = {
    music: {
      name: 'Decentralized Music Discovery (Scofen Core)',
      description: 'Surfaces top 1% commercially viable independent tracking assets through host financial friction and asymmetric authority.',
      criteria: [
        { code: 'VP', label: 'Vocal Precision', desc: 'Formant tracking, intonation, autotune artifact suppression' },
        { code: 'PQ', label: 'Production Quality', desc: 'Stereo width, LUFS dynamic balance, sub-bass phase mono-compatibility' },
        { code: 'PH', label: 'Performance / Hook', desc: 'Melodic payoff, vocal cadence retention, replay stickiness' },
        { code: 'SA', label: 'Sonic Arrangement', desc: 'Dynamic transients, bridge transitions, frequency space carving' },
      ],
      gatekeeper: 'Verified Mixing Engineers / Sync Supervisors (Weight: 100.0x)',
      friction: 'Musician Upfront Submission Fee ($15 - $250)',
      monetization: '70% Musician Residual / 20% Host-Rater / 10% Platform',
    },
    ecommerce: {
      name: 'Physical E-Commerce & Precision Goods Verification',
      description: 'Eliminates drop-shipping noise and fake 5-star incentivized Amazon reviews via certified lab friction and asymmetric weights.',
      criteria: [
        { code: 'TG', label: 'Tolerance & Grade', desc: 'Micron-level dimension variance and structural seam alignment' },
        { code: 'MG', label: 'Material Grade', desc: 'Raw material chemical purity, tensile strength, and finish resilience' },
        { code: 'DQ', label: 'Durability Quotient', desc: 'Accelerated thermal & mechanical cycle stress tests to failure' },
        { code: 'PP', label: 'Price-to-Performance', desc: 'BOM cost vs market retail markup ratio' },
      ],
      gatekeeper: 'ISO-Certified Materials Labs / Destructive Testers (Weight: 100.0x)',
      friction: 'Merchant Sample Verification Bond ($500 - $5,000)',
      monetization: 'Verified Product Certification Badge + Residual Referral Cut',
    },
    hardware: {
      name: 'High-Ticket Enterprise Hardware Reviews',
      description: 'Surgical evaluation of enterprise servers, high-end GPU workstations, and boutique audio converter gear.',
      criteria: [
        { code: 'TI', label: 'Thermal Index', desc: 'Junction-to-ambient dissipation delta under sustained 100% TDP load' },
        { code: 'BI', label: 'Build Integrity', desc: 'PCB trace routing, capacitor ripple tolerance, CNC enclosure rigidity' },
        { code: 'SB', label: 'Synthetic Benchmarks', desc: 'Standardized deterministic compute & throughput stress metrics' },
        { code: 'AN', label: 'Acoustic Noise Floor', desc: 'dBA SPL emissions under stepped fan curve states' },
      ],
      gatekeeper: 'Certified Systems Architects / Electrical Engineers (Weight: 100.0x)',
      friction: 'Manufacturer Benchmarking Slot Deposit',
      monetization: 'B2B Enterprise Procurement Subscription Access ($499/mo)',
    },
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Banner */}
      <div className="bg-zinc-900/80 border border-zinc-800 rounded-lg p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                Operational Directives 1, 2 & 3 • Systems Blueprint
              </span>
              <span className="text-xs font-mono text-zinc-500">Universal Multi-Criteria Evaluation Engine</span>
            </div>
            <h1 className="text-xl font-mono font-bold text-zinc-100 mt-1">
              Production Architecture: PostgreSQL, Redis & Python Engine
            </h1>
            <p className="text-xs text-zinc-400 mt-1 max-w-3xl">
              Zero conversational fluff. Production DDL schemas, in-memory atomic sorted sets, and lean mathematical
              scoring algorithms ready for immediate backend deployment across arbitrary evaluation domains.
            </p>
          </div>
        </div>
      </div>

      {/* Code Navigation Tabs */}
      <div className="flex items-center space-x-2 border-b border-zinc-800 pb-2">
        <button
          onClick={() => setActiveTab('postgres')}
          className={`flex items-center space-x-2 px-3 py-1.5 rounded text-xs font-mono transition-colors border ${
            activeTab === 'postgres'
              ? 'bg-zinc-800 text-emerald-400 border-emerald-500/40'
              : 'text-zinc-400 hover:text-zinc-200 border-transparent hover:bg-zinc-900'
          }`}
        >
          <Database className="w-3.5 h-3.5" />
          <span>PostgreSQL Schema (DDL)</span>
        </button>

        <button
          onClick={() => setActiveTab('redis')}
          className={`flex items-center space-x-2 px-3 py-1.5 rounded text-xs font-mono transition-colors border ${
            activeTab === 'redis'
              ? 'bg-zinc-800 text-cyan-400 border-cyan-500/40'
              : 'text-zinc-400 hover:text-zinc-200 border-transparent hover:bg-zinc-900'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Redis Sorted Sets & Ratelimits</span>
        </button>

        <button
          onClick={() => setActiveTab('python')}
          className={`flex items-center space-x-2 px-3 py-1.5 rounded text-xs font-mono transition-colors border ${
            activeTab === 'python'
              ? 'bg-zinc-800 text-amber-400 border-amber-500/40'
              : 'text-zinc-400 hover:text-zinc-200 border-transparent hover:bg-zinc-900'
          }`}
        >
          <Cpu className="w-3.5 h-3.5" />
          <span>Python 3.12 Engine Script</span>
        </button>

        <button
          onClick={() => setActiveTab('domains')}
          className={`flex items-center space-x-2 px-3 py-1.5 rounded text-xs font-mono transition-colors border ${
            activeTab === 'domains'
              ? 'bg-zinc-800 text-purple-400 border-purple-500/40'
              : 'text-zinc-400 hover:text-zinc-200 border-transparent hover:bg-zinc-900'
          }`}
        >
          <ExternalLink className="w-3.5 h-3.5" />
          <span>Universal Domain Generalizer</span>
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === 'postgres' && (
        <div className="bg-zinc-950 border border-zinc-800 rounded-lg overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2 bg-zinc-900/90 border-b border-zinc-800">
            <span className="text-xs font-mono text-zinc-400">schema.sql — PostgreSQL 16+ DDL</span>
            <button
              onClick={() => copyToClipboard(POSTGRES_SCHEMA, 'sql')}
              className="flex items-center space-x-1 text-xs font-mono px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200"
            >
              {copied === 'sql' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied === 'sql' ? 'Copied' : 'Copy DDL'}</span>
            </button>
          </div>
          <pre className="p-4 text-xs font-mono text-zinc-300 overflow-x-auto leading-relaxed max-h-[550px] scrollbar-thin">
            {POSTGRES_SCHEMA}
          </pre>
        </div>
      )}

      {activeTab === 'redis' && (
        <div className="bg-zinc-950 border border-zinc-800 rounded-lg overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2 bg-zinc-900/90 border-b border-zinc-800">
            <span className="text-xs font-mono text-zinc-400">redis_structures.txt — Redis 7.2+ Atomic Commands</span>
            <button
              onClick={() => copyToClipboard(REDIS_STRUCTURES, 'redis')}
              className="flex items-center space-x-1 text-xs font-mono px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200"
            >
              {copied === 'redis' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied === 'redis' ? 'Copied' : 'Copy Redis'}</span>
            </button>
          </div>
          <pre className="p-4 text-xs font-mono text-zinc-300 overflow-x-auto leading-relaxed max-h-[550px] scrollbar-thin">
            {REDIS_STRUCTURES}
          </pre>
        </div>
      )}

      {activeTab === 'python' && (
        <div className="bg-zinc-950 border border-zinc-800 rounded-lg overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2 bg-zinc-900/90 border-b border-zinc-800">
            <span className="text-xs font-mono text-zinc-400">engine.py — Python 3.12 Reference Script</span>
            <button
              onClick={() => copyToClipboard(PYTHON_SCORING_SCRIPT, 'python')}
              className="flex items-center space-x-1 text-xs font-mono px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200"
            >
              {copied === 'python' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied === 'python' ? 'Copied' : 'Copy Python'}</span>
            </button>
          </div>
          <pre className="p-4 text-xs font-mono text-zinc-300 overflow-x-auto leading-relaxed max-h-[550px] scrollbar-thin">
            {PYTHON_SCORING_SCRIPT}
          </pre>
        </div>
      )}

      {activeTab === 'domains' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {(['music', 'ecommerce', 'hardware'] as const).map((dom) => (
              <button
                key={dom}
                onClick={() => setSelectedDomain(dom)}
                className={`p-3 rounded text-left border transition-all ${
                  selectedDomain === dom
                    ? 'bg-purple-950/20 border-purple-500/50 text-zinc-100 shadow-[0_0_15px_rgba(168,85,247,0.15)]'
                    : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                }`}
              >
                <div className="text-xs font-mono font-bold">{domainSpecs[dom].name}</div>
                <div className="text-[10px] text-zinc-500 mt-1 line-clamp-2">{domainSpecs[dom].description}</div>
              </button>
            ))}
          </div>

          <div className="bg-zinc-900/60 border border-zinc-800 rounded-lg p-5 space-y-4">
            <div className="border-b border-zinc-800 pb-3">
              <h3 className="text-base font-mono font-bold text-zinc-100">{domainSpecs[selectedDomain].name}</h3>
              <p className="text-xs text-zinc-400 mt-1">{domainSpecs[selectedDomain].description}</p>
            </div>

            <div>
              <div className="text-xs font-mono text-zinc-300 mb-2 font-semibold">
                Normalized 4-Criteria Vector Dimensions (Sum = 100%):
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {domainSpecs[selectedDomain].criteria.map((c) => (
                  <div key={c.code} className="bg-zinc-950 p-3 rounded border border-zinc-800">
                    <div className="flex items-center space-x-2 text-xs font-mono font-bold text-purple-400">
                      <span className="px-1.5 py-0.5 rounded bg-purple-500/20 border border-purple-500/30 text-[10px]">
                        {c.code}
                      </span>
                      <span>{c.label}</span>
                    </div>
                    <div className="text-[11px] text-zinc-400 mt-1">{c.desc}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 border-t border-zinc-800">
              <div className="bg-zinc-950 p-3 rounded border border-zinc-800">
                <div className="text-[10px] font-mono text-zinc-500 uppercase">Gatekeeper Authority</div>
                <div className="text-xs font-mono text-zinc-200 mt-0.5">{domainSpecs[selectedDomain].gatekeeper}</div>
              </div>
              <div className="bg-zinc-950 p-3 rounded border border-zinc-800">
                <div className="text-[10px] font-mono text-zinc-500 uppercase">Financial Friction Filter</div>
                <div className="text-xs font-mono text-zinc-200 mt-0.5">{domainSpecs[selectedDomain].friction}</div>
              </div>
              <div className="bg-zinc-950 p-3 rounded border border-zinc-800">
                <div className="text-[10px] font-mono text-zinc-500 uppercase">Economic Residual Model</div>
                <div className="text-xs font-mono text-zinc-200 mt-0.5">{domainSpecs[selectedDomain].monetization}</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
