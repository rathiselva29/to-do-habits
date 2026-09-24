import React from 'react';
import { 
  LayoutDashboard, 
  CheckSquare, 
  Bot, 
  Smile, 
  Activity, 
  BarChart3, 
  Calendar, 
  User, 
  Plus, 
  Flame
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { Logo } from './Logo';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenNewHabit: () => void;
  onOpenProfileSwitcher?: () => void;
  onOpenAddProfile?: () => void;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

interface NavGroup {
  category: string;
  items: NavItem[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    category: 'DAILY MANAGEMENT',
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { id: 'habits', label: 'Habits', icon: CheckSquare },
    ],
  },
  {
    category: 'PERSONAL COACHING',
    items: [
      { id: 'coach', label: 'AI Coach', icon: Bot, badge: 'AI' },
    ],
  },
  {
    category: 'WELLNESS TRACKING',
    items: [
      { id: 'mood', label: 'Mood Tracker', icon: Smile },
      { id: 'health', label: 'Health Metrics', icon: Activity },
    ],
  },
  {
    category: 'PROGRESS & HISTORY',
    items: [
      { id: 'analytics', label: 'Analytics', icon: BarChart3 },
      { id: 'calendar', label: 'Calendar', icon: Calendar },
    ],
  },
  {
    category: 'ACCOUNT',
    items: [
      { id: 'profile', label: 'Profile', icon: User },
    ],
  },
];

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  onOpenNewHabit,
  onOpenProfileSwitcher,
  onOpenAddProfile,
  isOpenMobile,
  onCloseMobile,
}) => {
  const { habits, completions } = useApp();
  const { user, profiles } = useAuth();
  const todayStr = new Date().toISOString().split('T')[0];
  const activeCount = habits.filter(h => !h.isArchived && !h.isPaused).length;
  const doneToday = completions.filter(c => c.date === todayStr).length;

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm md:hidden"
        />
      )}

      <aside
        className={`fixed md:sticky top-0 left-0 z-40 h-screen w-64 glass-panel border-r border-white/50 dark:border-white/10 flex flex-col justify-between p-4 transition-transform duration-300 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="space-y-4 flex-1 overflow-y-auto no-scrollbar pr-0.5">
          {/* Brand Logo in Sidebar */}
          <div 
            onClick={() => {
              setActiveTab('dashboard');
              if (onCloseMobile) onCloseMobile();
            }}
            className="flex items-center px-3 py-1 cursor-pointer"
          >
            <Logo size={32} showText={true} />
          </div>

          {/* Quick Create CTA */}
          <button
            onClick={() => {
              onOpenNewHabit();
              if (onCloseMobile) onCloseMobile();
            }}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-2xl ai-gradient text-white font-semibold text-xs shadow-lg shadow-indigo-500/25 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Habit</span>
          </button>

          {/* Navigation Links Grouped Logically */}
          <nav className="space-y-3 pt-1">
            {NAV_GROUPS.map((group) => (
              <div key={group.category} className="space-y-1">
                <div className="px-3.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 select-none">
                  {group.category}
                </div>
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id);
                        if (onCloseMobile) onCloseMobile();
                      }}
                      className={`w-full flex items-center justify-between px-3.5 py-2 rounded-2xl text-xs font-semibold transition-all duration-200 cursor-pointer ${
                        isActive
                          ? 'sidebar-active text-indigo-600 dark:text-indigo-400 shadow-xs'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-white/40 dark:hover:bg-slate-800/40 hover:text-slate-900 dark:hover:text-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500'}`} />
                        <span>{item.label}</span>
                      </div>

                      {item.badge && (
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md ${
                            isActive
                              ? 'bg-indigo-600 text-white shadow-xs'
                              : 'bg-indigo-100/80 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                      {item.id === 'habits' && (
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                            isActive ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400' : 'text-slate-400'
                          }`}
                        >
                          {doneToday}/{activeCount}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
          </nav>
        </div>

        {/* Sidebar Bottom: Active Profile Badge + Focus Bar */}
        <div className="space-y-2 pt-2 border-t border-white/40 dark:border-white/10">
          {/* Active Profile Info & Switcher Button */}
          {user && (
            <div 
              onClick={() => {
                if (onOpenProfileSwitcher) {
                  onOpenProfileSwitcher();
                  if (onCloseMobile) onCloseMobile();
                }
              }}
              className="p-2.5 rounded-2xl glass-subcard border border-white/50 dark:border-white/10 flex items-center justify-between cursor-pointer hover:bg-white/70 dark:hover:bg-slate-800/70 transition-all shadow-xs"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                {user.avatarUrl ? (
                  <img src={user.avatarUrl} alt={user.name} className="w-7 h-7 rounded-xl object-cover" />
                ) : (
                  <div className="w-7 h-7 rounded-xl ai-gradient text-white flex items-center justify-center text-[10px] font-bold">
                    {user.name[0]}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{user.name}</p>
                  <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">Tracking {activeCount} habits</p>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-300">
                {profiles.length}
              </span>
            </div>
          )}

          {/* Sidebar Footer Habit Summary Card */}
          <div className="p-2.5 rounded-2xl glass-subcard">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-900 dark:text-white mb-1.5">
              <span className="flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                Daily Focus
              </span>
              <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold">
                {activeCount > 0 ? Math.round((doneToday / activeCount) * 100) : 0}%
              </span>
            </div>
            <div className="w-full h-1.5 bg-slate-200/60 dark:bg-slate-700/60 rounded-full overflow-hidden">
              <div
                className="h-full ai-gradient rounded-full transition-all duration-500"
                style={{ width: `${activeCount > 0 ? Math.min(100, (doneToday / activeCount) * 100) : 0}%` }}
              />
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1.5">
              {doneToday >= activeCount && activeCount > 0
                ? '✨ All habits complete today!'
                : `${activeCount - doneToday} remaining for today`}
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};
