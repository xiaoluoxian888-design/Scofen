import React from 'react';
import { UserRole, UserAccountState } from '../types/scofen';
import { 
  Sliders, 
  Disc3, 
  Award, 
  Radio, 
  Receipt, 
  Terminal, 
  ShieldCheck, 
  Zap,
  Volume2,
  VolumeX
} from 'lucide-react';

interface NavbarProps {
  userState: UserAccountState;
  onContextChange: (role: UserRole) => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  userState,
  onContextChange,
  isMuted,
  onToggleMute,
}) => {
  const navTabs: { id: UserRole; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: 'host', label: 'Host Matrix', icon: <Sliders className="w-4 h-4" /> },
    { id: 'musician', label: 'Musician Portal', icon: <Disc3 className="w-4 h-4" /> },
    { id: 'rater', label: 'Rater Grading', icon: <Award className="w-4 h-4" /> },
    { id: 'subscriber', label: 'Billboard Stream', icon: <Radio className="w-4 h-4" />, badge: '$5.99' },
    { id: 'architect', label: 'Ledger & Blueprints', icon: <Receipt className="w-4 h-4" /> },
  ];

  return (
    <header className="border-b border-zinc-800 bg-zinc-950/90 backdrop-blur sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Protocol Title */}
          <div 
            className="flex items-center space-x-3 cursor-pointer select-none"
            onClick={() => onContextChange('host')}
            title="Scofen Music Discovery Platform"
          >
            <div className="h-[50px] px-2.5 py-1 rounded bg-zinc-900/90 border border-zinc-800 flex items-center justify-center overflow-hidden shadow-[0_0_15px_rgba(16,185,129,0.15)] hover:border-emerald-500/40 transition-colors">
              <img
                src="/assets/aistudio/image_e3f3963a_63143619.jpg"
                alt="Scofen"
                className="h-[40px] w-auto object-contain rounded"
              />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-mono font-bold tracking-tight text-zinc-100 text-sm uppercase hidden sm:inline">
                  Scofen
                </span>
                <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  v2.4 Core
                </span>
              </div>
              <div className="text-[11px] font-mono text-zinc-500 hidden sm:block">
                Decentralized Multi-Criteria Sorting & Trust Protocol
              </div>
            </div>
          </div>

          {/* Navigation Context Switcher */}
          <nav className="flex items-center space-x-1 sm:space-x-2">
            {navTabs.map((tab) => {
              const isActive = userState.activeContext === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => onContextChange(tab.id)}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded text-xs font-mono font-medium transition-colors border ${
                    isActive
                      ? 'bg-zinc-800 text-emerald-400 border-emerald-500/40 shadow-sm'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 border-transparent'
                  }`}
                >
                  {tab.icon}
                  <span className="hidden md:inline">{tab.label}</span>
                  {tab.badge && (
                    <span className="text-[10px] px-1 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Context Account Pill & Global Metrics */}
          <div className="flex items-center space-x-3">
            <button
              onClick={onToggleMute}
              title={isMuted ? 'Unmute Audio Engine' : 'Mute Audio Engine'}
              className="p-2 rounded bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors"
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
            </button>

            <div className="hidden lg:flex items-center space-x-3 border-l border-zinc-800 pl-3">
              <div className="text-right">
                <div className="flex items-center space-x-1.5 justify-end">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span className="text-xs font-mono text-zinc-200 font-semibold">{userState.name}</span>
                </div>
                <div className="text-[10px] font-mono text-zinc-500">
                  Host Authority: <span className="text-emerald-400">100.0x</span>
                </div>
              </div>
              <div className="w-8 h-8 rounded bg-zinc-800 border border-zinc-700 flex items-center justify-center text-xs font-mono text-zinc-300 font-bold">
                KV
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
