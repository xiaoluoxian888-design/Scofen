import React, { useState, useRef, useEffect } from 'react';
import { User } from '../types/schema';
import { 
  Flame, 
  Disc, 
  Upload, 
  Receipt, 
  Headphones, 
  Music2, 
  Lock, 
  Unlock,
  Volume2,
  VolumeX,
  Radio,
  ChevronDown,
  LogOut,
  CreditCard
} from 'lucide-react';

export type ActiveTab = 'feed' | 'boards' | 'submit' | 'ledger' | 'profile' | 'integrations';

interface HeaderNavProps {
  currentUser: User;
  allUsers: User[];
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  onSwitchUser: (userId: string) => void;
  onOpenAuthModal: () => void;
  onToggleSubscription: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  onLogout: () => void;
}

export const HeaderNav: React.FC<HeaderNavProps> = ({
  currentUser,
  allUsers,
  activeTab,
  onTabChange,
  onSwitchUser,
  onOpenAuthModal,
  onToggleSubscription,
  isMuted,
  onToggleMute,
  onLogout,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const navItems: { id: ActiveTab; label: string; icon: React.ReactNode }[] = [
    { id: 'feed', label: 'Discover & Charts', icon: <Flame className="w-4 h-4" /> },
    { id: 'boards', label: 'Curator Boards', icon: <Disc className="w-4 h-4" /> },
    { id: 'submit', label: 'Submit Music', icon: <Upload className="w-4 h-4" /> },
    { id: 'ledger', label: 'Royalties', icon: <Receipt className="w-4 h-4" /> },
    { id: 'integrations', label: 'Stripe & Resend', icon: <CreditCard className="w-4 h-4" /> },
    { id: 'profile', label: 'My Studio', icon: <Headphones className="w-4 h-4" /> },
  ];

  return (
    <header className="border-b border-zinc-800/80 bg-zinc-950/95 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          {/* Brand Lockup with 25% bigger logo + Single Jade Green Musical Note Icon */}
          <div className="flex items-center space-x-3.5">
            <div 
              onClick={() => onTabChange('feed')}
              className="flex items-center space-x-2.5 cursor-pointer group"
              title="Scofen Music Discovery Platform"
            >
              {/* Scofen Logo Frame (25% bigger) */}
              <div className="h-[48px] px-2.5 py-1 rounded-xl bg-zinc-900 border border-zinc-800/80 flex items-center justify-center overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.5)] group-hover:border-emerald-500/40 transition-all">
                <img
                  src="/assets/aistudio/image_e3f3963a_63143619.jpg"
                  alt="Scofen"
                  className="h-[38px] w-auto object-contain rounded"
                />
              </div>

              {/* Single Jade Green Musical Note Icon Styling Element */}
              <div className="flex items-center space-x-1.5 pl-0.5">
                <span className="p-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                  <Music2 className="w-4 h-4 text-emerald-400 stroke-[2.5]" />
                </span>
                <span className="text-[11px] font-sans text-zinc-400 tracking-wide hidden lg:inline font-medium">
                  Discovery Network
                </span>
              </div>
            </div>
          </div>

          {/* Music Navigation Tabs */}
          <nav className="flex items-center space-x-1 sm:space-x-1.5">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-zinc-850 text-white font-semibold shadow-md shadow-black/40 border border-emerald-500/40'
                      : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900'
                  }`}
                >
                  <span className={isActive ? 'text-emerald-400' : 'text-zinc-500'}>{item.icon}</span>
                  <span className="hidden sm:inline">{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* User Controls & Global $5.99 Stream Pass */}
          <div className="flex items-center space-x-3">
            {/* $5.99 Pass Pill */}
            <button
              onClick={onToggleSubscription}
              title={
                currentUser.is_subscriber
                  ? 'Unlimited Full Streaming Active ($5.99/mo)'
                  : 'Subscribe for $5.99/mo to unlock full-length streaming on all songs'
              }
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all shadow-sm ${
                currentUser.is_subscriber
                  ? 'bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                  : 'bg-zinc-900 border border-zinc-800 text-zinc-300 hover:border-emerald-500/40 hover:text-white'
              }`}
            >
              {currentUser.is_subscriber ? (
                <>
                  <Unlock className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="font-semibold hidden md:inline">Full Stream Pass</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 font-bold">
                    UNLOCKED
                  </span>
                </>
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5 text-zinc-400" />
                  <span className="hidden md:inline">Unlock Full Audio</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-500 text-zinc-950 font-bold">
                    $5.99/mo
                  </span>
                </>
              )}
            </button>

            {/* Mute Button */}
            <button
              onClick={onToggleMute}
              className="p-2 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition-colors"
              title={isMuted ? 'Unmute Player' : 'Mute Player'}
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
            </button>

            {/* User Profile Quick Switcher */}
            <div 
              ref={dropdownRef}
              className="relative"
              onMouseEnter={() => setIsDropdownOpen(true)}
              onMouseLeave={() => setIsDropdownOpen(false)}
            >
              <button
                type="button"
                onClick={() => setIsDropdownOpen((prev) => !prev)}
                className="flex items-center space-x-2 bg-zinc-900 pl-2 pr-3 py-1.5 rounded-full border border-zinc-800 hover:border-zinc-700 cursor-pointer transition-colors focus:outline-none"
                aria-expanded={isDropdownOpen}
              >
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-emerald-400 to-teal-700 flex items-center justify-center text-[10px] font-bold text-zinc-950 shadow-sm">
                  {currentUser.first_name[0]}{currentUser.last_name[0]}
                </div>
                <span className="text-xs text-zinc-200 font-medium max-w-[90px] truncate hidden sm:inline">
                  {currentUser.first_name}
                </span>
                <ChevronDown className={`w-3 h-3 text-zinc-500 transition-transform ${isDropdownOpen ? 'rotate-180 text-emerald-400' : ''}`} />
              </button>

              {/* Identity Dropdown Menu (no dead gap between button and card) */}
              {isDropdownOpen && (
                <div className="absolute right-0 top-full pt-1.5 w-64 z-50 animate-in fade-in duration-100">
                  <div className="bg-zinc-950/98 border border-zinc-800 rounded-2xl shadow-2xl py-2 backdrop-blur-md">
                    <div className="px-3.5 py-1.5 text-[10px] font-sans uppercase tracking-wider text-zinc-500 font-bold border-b border-zinc-900">
                      Switch Active Artist / Curator
                    </div>
                    {allUsers.map((u) => (
                      <button
                        key={u.id}
                        type="button"
                        onClick={() => {
                          onSwitchUser(u.id);
                          setIsDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3.5 py-2 text-xs flex items-center justify-between hover:bg-zinc-900 transition-colors cursor-pointer ${
                          u.id === currentUser.id ? 'text-emerald-400 bg-zinc-900/50 font-semibold' : 'text-zinc-300'
                        }`}
                      >
                        <div className="flex items-center space-x-2 truncate">
                          <div className="w-5 h-5 rounded-full bg-zinc-800 flex items-center justify-center text-[9px] text-zinc-300">
                            {u.first_name[0]}
                          </div>
                          <span className="truncate">{u.first_name} {u.last_name}</span>
                        </div>
                        {u.is_subscriber && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 font-bold">
                            PASS
                          </span>
                        )}
                      </button>
                    ))}
                    <div className="border-t border-zinc-900 mt-1 pt-1.5 px-3 space-y-1">
                      <button
                        type="button"
                        onClick={() => {
                          onTabChange('integrations');
                          setIsDropdownOpen(false);
                        }}
                        className="w-full flex items-center space-x-2 py-1.5 px-2 rounded-lg text-xs text-zinc-300 hover:text-white hover:bg-zinc-900 transition-colors cursor-pointer"
                      >
                        <CreditCard className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Stripe & Resend Centre</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          onOpenAuthModal();
                          setIsDropdownOpen(false);
                        }}
                        className="w-full text-center py-1 text-xs text-emerald-400 hover:text-emerald-300 font-medium cursor-pointer"
                      >
                        + Join as New Artist or Curator
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          onLogout();
                          setIsDropdownOpen(false);
                        }}
                        className="w-full flex items-center justify-center space-x-1.5 py-1.5 px-2 rounded-lg text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-950/25 transition-colors font-medium border border-rose-900/40 cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Log Out</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
