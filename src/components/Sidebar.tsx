import React from 'react';
import { UserProfile } from '../types';
import { Calendar, History, BarChart2, Settings, Plus, LogOut, CalendarDays } from 'lucide-react';

interface SidebarProps {
  activeTab: 'schedule' | 'timeline' | 'calendar' | 'statistics' | 'settings';
  setActiveTab: (tab: 'schedule' | 'timeline' | 'calendar' | 'statistics' | 'settings') => void;
  user: UserProfile;
  onLogout: () => void;
  isAiTrackerOpen: boolean;
  setIsAiTrackerOpen: (open: boolean) => void;
}

export default function Sidebar({ activeTab, setActiveTab, user, onLogout, isAiTrackerOpen, setIsAiTrackerOpen }: SidebarProps) {
  const navItems = [
    { key: 'schedule' as const, label: '스케줄', icon: Calendar },
    { key: 'timeline' as const, label: '타임라인', icon: History },
    { key: 'calendar' as const, label: '캘린더', icon: CalendarDays },
    { key: 'statistics' as const, label: '통계', icon: BarChart2 },
    { key: 'settings' as const, label: '설정', icon: Settings },
  ];

  return (
    <nav className="h-full w-64 fixed left-0 top-0 flex flex-col border-r border-outline-variant bg-surface-bright shadow-sm z-50">
      {/* Brand Header */}
      <div className="p-6">
        <h1 className="text-xl font-bold text-primary mb-1 tracking-tight">
          스터디 플래너
        </h1>
        <p className="font-mono text-[10px] text-on-surface-variant font-bold tracking-widest uppercase">
          Academic Focus
        </p>
      </div>

      {/* Navigation list */}
      <div className="px-3 flex-grow mt-2">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = activeTab === item.key;
            const Icon = item.icon;
            return (
              <li key={item.key}>
                <button
                  onClick={() => setActiveTab(item.key)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-150 cursor-pointer text-left ${isActive
                    ? 'bg-secondary-container text-on-secondary-container font-semibold shadow-sm'
                    : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
                    }`}
                >
                  <Icon className="w-5 h-5 shrink-0" />
                  <span className="text-sm font-medium">{item.label}</span>
                </button>
              </td>
            );
          })}
        </ul>
      </div>

      {/* Footer Content */}
      <div className="p-6 mt-auto border-t border-outline-variant/50">
        {/* AI Focus Coach Button */}
        <button
          onClick={() => setIsAiTrackerOpen(!isAiTrackerOpen)}
          className={`w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-[0.98] shadow-sm mb-3 border ${isAiTrackerOpen
            ? 'bg-rose-500 text-white border-rose-600 hover:bg-rose-600'
            : 'bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 text-white border-transparent hover:opacity-95 shadow-md shadow-cyan-500/20'
            }`}
        >
          <span className="relative flex h-2 w-2">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isAiTrackerOpen ? 'bg-white' : 'bg-cyan-300'}`}></span>
            <span className={`relative inline-flex rounded-full h-2 w-2 ${isAiTrackerOpen ? 'bg-white' : 'bg-cyan-450'}`}></span>
          </span>
          AI Focus Coach {isAiTrackerOpen ? '닫기' : '켜기'}
        </button>

        <button
          onClick={() => setActiveTab('schedule')}
          className="w-full bg-primary text-on-primary py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-all cursor-pointer active:scale-[0.98] shadow-sm mb-6"
        >
          <Plus className="w-4 h-4" />
          새로운 할 일 (New Task)
        </button>

        {/* User profile card */}
        <div className="flex items-center justify-between gap-3 pt-4 border-t border-outline-variant/30">
          <div className="flex items-center gap-3 min-w-0">
            <img
              alt="Profile"
              className="w-10 h-10 rounded-full object-cover border border-primary/10"
              src={user.avatarUrl}
            />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-on-surface truncate">
                {user.name}
              </p>
              <p className="font-mono text-[10px] text-on-surface-variant truncate uppercase tracking-widest">
                {user.membership}
              </p>
            </div>
          </div>

          <button
            onClick={onLogout}
            title="Logout"
            className="p-2 text-on-surface-variant hover:text-error transition-colors rounded-lg hover:bg-surface-container-high cursor-pointer flex justify-center items-center shrink-0"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </nav>
  );
}