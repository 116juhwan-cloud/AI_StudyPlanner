import React, { useState, useEffect } from 'react';
import { Task, UserProfile, AppSettings } from './types';
import AuthPage from './components/AuthPage';
import Sidebar from './components/Sidebar';
import ScheduleView from './components/ScheduleView';
import TimelineView from './components/TimelineView';
import StatisticsView from './components/StatisticsView';
import SettingsView from './components/SettingsView';
import { FaceMeshTracker } from './components/FaceMeshTracker';

export default function App() {
  // Authentication states
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(true);
  const [user, setUser] = useState<UserProfile>({
    name: '김준수',
    email: 'study_pro@example.com',
    avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuASxydMcg-lxBqL7QebqWtSoESpJbZskOUVu5izcGymOSU6OPePV2Tl4LD4i404uU5bEVBwcSaLoNZUpK3iZqgGA8DeZXcN7eO_ta6Ksgwvsq8JV7uk_VB1a5T_EPpBI3GSVfvvN1TbIWGmqK7GKyzM9CzRddbLT5wR1a1m0JgFKjqAGKZ1_SVv5Z0vy78PfTKO01k88sc6GvZgScDzoqdtT-RlnhiTsklc2LgxHHstCq40ZA0SiJsXCddR_3j1dPoGF_JXBM1_WOc',
    membership: 'Premium Member'
  });

  // Navigation tab states
  const [activeTab, setActiveTab] = useState<'schedule' | 'timeline' | 'statistics' | 'settings'>('timeline');

  // AI Focus Tracker state
  const [isAiTrackerOpen, setIsAiTrackerOpen] = useState<boolean>(false);

  // Application configurations
  const [settings, setSettings] = useState<AppSettings>({
    pushNotifications: true,
    doNotDisturb: false,
    quoteCategory: '동기부여',
    aiPersona: '잔소리쟁이',
    theme: 'light'
  });

  // State storage for study tasks
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Apply dark mode theme dynamically
  useEffect(() => {
    const root = window.document.documentElement;
    if (settings.theme === 'dark') {
      root.classList.add('dark');
      root.style.backgroundColor = '#15232a'; // matches tertiary color
    } else {
      root.classList.remove('dark');
      root.style.backgroundColor = '#f7f9fb'; // matches bright bg
    }
  }, [settings.theme]);

  // Load tasks on mount from Node Express backend API
  useEffect(() => {
    async function fetchTasks() {
      setIsLoading(true);
      try {
        const response = await fetch('/api/tasks');
        if (response.ok) {
          const data = await response.json();
          setTasks(data);
        }
      } catch (err) {
        console.error("Failed to load tasks from Express server API:", err);
      } finally {
        setIsLoading(false);
      }
    }
    if (isLoggedIn) {
      fetchTasks();
    }
  }, [isLoggedIn]);

  // Handler to add a new study plan
  const handleAddTask = async (newTaskData: Omit<Task, 'id'>) => {
    const tempId = Math.random().toString(36).substring(2, 9);
    const newTask: Task = { ...newTaskData, id: tempId };

    // Update state instantly for hyper-fast response
    setTasks((prev) => [...prev, newTask]);
    
    // Switch view to timeline so user sees their new task
    setActiveTab('timeline');

    // Post to express backend API
    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTask),
      });
      if (!response.ok) {
        console.error("Backend error persisting schedule task");
      }
    } catch (err) {
      console.error("Network error posting task:", err);
    }
  };

  // Handler to remove task
  const handleDeleteTask = async (id: string) => {
    // Delete state instantly
    setTasks((prev) => prev.filter((t) => t.id !== id));

    try {
      const response = await fetch(`/api/tasks/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        console.error("Backend error deleting schedule task");
      }
    } catch (err) {
      console.error("Network error deleting task:", err);
    }
  };

  const handleLoginSuccess = (email: string, name: string, avatarUrl: string) => {
    setUser({
      name,
      email,
      avatarUrl,
      membership: 'Premium Member'
    });
    setIsLoggedIn(true);
    setActiveTab('timeline');
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
  };

  if (!isLoggedIn) {
    return <AuthPage onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className={`min-h-screen ${settings.theme === 'dark' ? 'bg-[#15232a] text-white' : 'bg-background text-on-surface'}`}>
      {/* Sidebar layouts on desktop */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        user={user} 
        onLogout={handleLogout} 
        isAiTrackerOpen={isAiTrackerOpen}
        setIsAiTrackerOpen={setIsAiTrackerOpen}
      />

      {/* AI Focus Tracker Overlay */}
      {isAiTrackerOpen && (
        <FaceMeshTracker onClose={() => setIsAiTrackerOpen(false)} />
      )}

      {/* Main workspace container canvas */}
      <div className="ml-64 min-h-screen relative p-10 flex flex-col">
        {isLoading && tasks.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center animate-pulse py-12">
            <span className="material-symbols-text animate-spin text-4xl text-primary mb-3">progress_activity</span>
            <p className="text-sm text-on-surface-variant font-semibold">데이터를 유기적으로 가져오고 있습니다...</p>
          </div>
        ) : (
          <div className="flex-1 max-w-5xl w-full mx-auto animate-fade-in">
            {activeTab === 'schedule' && (
              <ScheduleView 
                onAddTask={handleAddTask} 
                onNavigateBack={() => setActiveTab('timeline')} 
                settings={settings}
              />
            )}

            {activeTab === 'timeline' && (
              <TimelineView 
                tasks={tasks}
                onDeleteTask={handleDeleteTask}
                onNavigateToAddTask={() => setActiveTab('schedule')}
              />
            )}

            {activeTab === 'statistics' && (
              <StatisticsView 
                tasks={tasks}
                settings={settings}
              />
            )}

            {activeTab === 'settings' && (
              <SettingsView 
                user={user}
                setUser={setUser}
                settings={settings}
                setSettings={setSettings}
                onNavigateBack={() => setActiveTab('timeline')}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
