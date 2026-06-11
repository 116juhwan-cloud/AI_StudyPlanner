import React, { useState, useEffect } from 'react';
import { Task, UserProfile, AppSettings } from './types';
import AuthPage from './components/AuthPage';
import Sidebar from './components/Sidebar';
import ScheduleView from './components/ScheduleView';
import TimelineView from './components/TimelineView';
import StatisticsView from './components/StatisticsView';
import SettingsView from './components/SettingsView';
import { FaceMeshTracker } from './components/FaceMeshTracker';
import CalendarView from './components/CalendarView';
import AiCoachPopup from './components/AiCoachPopup';

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
  const [activeTab, setActiveTab] = useState<'schedule' | 'timeline' | 'calendar' | 'statistics' | 'settings'>('timeline');

  // AI Focus Tracker state
  const [isAiTrackerOpen, setIsAiTrackerOpen] = useState<boolean>(false);

  // 초대형 AI 독촉 팝업을 껐다 켤 스위치
  const [showAiPopup, setShowAiPopup] = useState<boolean>(false);

  // 실시간 단기 집중 세션 결과 (시연용)
  const [realtimeSession, setRealtimeSession] = useState<{ focusTime: number, focusScore: number } | null>(null);

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
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [preselectedDate, setPreselectedDate] = useState<string | null>(null);
  const [preselectedStartTime, setPreselectedStartTime] = useState<string | null>(null);
  const [preselectedDuration, setPreselectedDuration] = useState<number | null>(null);
  const [fromTab, setFromTab] = useState<'timeline' | 'calendar'>('timeline');

  // Apply dark mode theme dynamically
  useEffect(() => {
    const root = window.document.documentElement;
    if (settings.theme === 'dark') {
      root.classList.add('dark');
      root.style.backgroundColor = '#15232a';
    } else {
      root.classList.remove('dark');
      root.style.backgroundColor = '#f7f9fb';
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

  // Handler to add or update a study plan
  const handleSaveTask = async (taskData: Omit<Task, 'id'>) => {
    if (editingTask) {
      const updatedTask: Task = { ...taskData, id: editingTask.id };
      setTasks((prev) => prev.map(t => t.id === editingTask.id ? updatedTask : t));
      setEditingTask(null);
      setPreselectedDate(null);
      setPreselectedStartTime(null);
      setPreselectedDuration(null);
      setActiveTab(fromTab);

      try {
        const response = await fetch(`/api/tasks/${updatedTask.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedTask),
        });
        if (!response.ok) {
          console.error("Backend error updating schedule task");
        }
      } catch (err) {
        console.error("Network error updating task:", err);
      }
    } else {
      const tempId = Math.random().toString(36).substring(2, 9);
      const newTask: Task = { ...taskData, id: tempId };

      setTasks((prev) => [...prev, newTask]);

      setActiveTab(fromTab);
      setPreselectedDate(null);
      setPreselectedStartTime(null);
      setPreselectedDuration(null);

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
    }
  };

  // 완료 상태 토글 핸들러
  const handleToggleTask = async (id: string, isCompleted: boolean) => {
    setTasks((prev) => prev.map(t => t.id === id ? { ...t, isCompleted } : t));

    try {
      const response = await fetch(`/api/tasks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...tasks.find(t => t.id === id), isCompleted }),
      });
      if (!response.ok) {
        console.error("Backend error toggling task status");
      }
    } catch (err) {
      console.error("Network error toggling task:", err);
    }
  };

  // 📌 [매운맛 장치] 알림에서 '나중에 하기' 누르면 강제로 잔소리 모드로 전환하고 큰 팝업 띄우기
  const handlePostponeStudy = () => {
    setSettings(prev => ({
      ...prev,
      aiPersona: '잔소리쟁이'
    }));
    setShowAiPopup(true);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setActiveTab('schedule');
  };

  const handleDeleteTask = async (id: string) => {
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
    setUser({ name, email, avatarUrl, membership: 'Premium Member' });
    setIsLoggedIn(true);
    setActiveTab('timeline');
  };

  const handleLogout = () => { setIsLoggedIn(false); };

  if (!isLoggedIn) { return <AuthPage onLoginSuccess={handleLoginSuccess} />; }

  return (
    <div className={`min-h-screen ${settings.theme === 'dark' ? 'bg-[#15232a] text-white' : 'bg-background text-on-surface'}`}>
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={user}
        onLogout={handleLogout}
        isAiTrackerOpen={isAiTrackerOpen}
        setIsAiTrackerOpen={setIsAiTrackerOpen}
      />

      {isAiTrackerOpen && (
        <FaceMeshTracker onClose={(stats) => {
          setIsAiTrackerOpen(false);
          if (stats && stats.focusTime > 0) {
            setRealtimeSession(prev => ({
              focusTime: (prev?.focusTime || 0) + stats.focusTime,
              focusScore: prev ? Math.round((prev.focusScore + stats.focusScore) / 2) : stats.focusScore
            }));
          }
        }} />
      )}

      {/* 초대형 AI 코치 팝업 구역 */}
      {showAiPopup && (
        <AiCoachPopup
          persona={settings.aiPersona as any}
          onClose={() => setShowAiPopup(false)}
        />
      )}

      <div className="ml-64 min-h-screen relative p-10 flex flex-col">
        {isLoading && tasks.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center animate-pulse py-12">
            <span className="material-symbols-text animate-spin text-4xl text-primary mb-3">progress_activity</span>
            <p className="text-sm text-on-surface-variant font-semibold">데이터를 유기적으로 가져오고 있습니다...</p>
          </div>
        ) : (
          <div className={`flex-1 w-full mx-auto animate-fade-in ${(activeTab === 'calendar' || activeTab === 'schedule') ? 'max-w-[95%]' : 'max-w-5xl'}`}>

            {activeTab === 'schedule' && (
              <div className="mb-4 flex justify-end">
                <button
                  onClick={() => setShowAiPopup(true)}
                  className="px-4 py-2 bg-purple-600 text-white font-bold text-xs rounded-xl shadow-md hover:bg-purple-700 transition-all"
                >
                  🤖 [{settings.aiPersona} 모드] 알림 타격감 테스트 버튼
                </button>
              </div>
            )}

            {activeTab === 'schedule' && (
              <ScheduleView
                onSaveTask={handleSaveTask}
                onNavigateBack={() => {
                  setEditingTask(null);
                  setPreselectedDate(null);
                  setPreselectedStartTime(null);
                  setPreselectedDuration(null);
                  setActiveTab(fromTab);
                }}
                settings={settings}
                editingTask={editingTask}
                preselectedDate={preselectedDate}
                preselectedStartTime={preselectedStartTime}
                preselectedDuration={preselectedDuration}
                tasks={tasks}
                onPostponeStudy={handlePostponeStudy} // 📌 배달완료!
              />
            )}

            {activeTab === 'timeline' && (
              <TimelineView
                tasks={tasks}
                onDeleteTask={handleDeleteTask}
                onEditTask={(task) => {
                  setFromTab('timeline');
                  handleEditTask(task);
                }}
                onToggleTask={handleToggleTask}
                onNavigateToAddTask={() => {
                  setEditingTask(null);
                  setPreselectedDate(null);
                  setPreselectedStartTime(null);
                  setPreselectedDuration(null);
                  setFromTab('timeline');
                  setActiveTab('schedule');
                }}
              />
            )}

            {activeTab === 'calendar' && (
              <CalendarView
                tasks={tasks}
                onDeleteTask={handleDeleteTask}
                onEditTask={(task) => {
                  setFromTab('calendar');
                  setEditingTask(task);
                  setActiveTab('schedule');
                }}
                onToggleTask={handleToggleTask}
                onNavigateToAddTask={(date, startTime, duration) => {
                  setEditingTask(null);
                  setPreselectedDate(date);
                  setPreselectedStartTime(startTime || null);
                  setPreselectedDuration(duration || null);
                  setFromTab('calendar');
                  setActiveTab('schedule');
                }}
              />
            )}

            {activeTab === 'statistics' && (
              <StatisticsView tasks={tasks} settings={settings} realtimeSession={realtimeSession} />
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