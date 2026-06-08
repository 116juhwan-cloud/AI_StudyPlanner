import React, { useState, useEffect } from 'react';
import { Task } from '../types';
import { Search, Bell, ChevronLeft, ChevronRight, Calendar, Award, Trash2, Plus, Pencil, Play, Timer, X, CheckCircle2, Circle, Pause } from 'lucide-react';

interface TimelineViewProps {
  tasks: Task[];
  onDeleteTask: (id: string) => void;
  onEditTask: (task: Task) => void;
  onToggleTask: (id: string, isCompleted: boolean) => void;
  onNavigateToAddTask: () => void;
}

export default function TimelineView({ tasks, onDeleteTask, onEditTask, onToggleTask, onNavigateToAddTask }: TimelineViewProps) {
  const todayStr = new Date().toLocaleDateString('en-CA');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentDateString, setCurrentDateString] = useState(todayStr);
  const [showNotifications, setShowNotifications] = useState(false);

  // 일정 상태 관리
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [notificationTask, setNotificationTask] = useState<Task | null>(null);
  const [dismissedTaskIds, setDismissedTaskIds] = useState<Set<string>>(new Set());
  const [completedTaskIds, setCompletedTaskIds] = useState<Set<string>>(new Set());
  const [taskAccumulatedSeconds, setTaskAccumulatedSeconds] = useState<Record<string, number>>({});

  // 5초마다 시작 시간이 된 일정이 있는지 확인
  useEffect(() => {
    const checkTime = setInterval(() => {
      const now = new Date();
      const currentHHMM = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      const todayYMD = now.toLocaleDateString('en-CA');

      const startingTask = tasks.find(t =>
        t.startDate === todayYMD &&
        t.startTime === currentHHMM &&
        !dismissedTaskIds.has(t.id) &&
        activeTaskId !== t.id &&
        !completedTaskIds.has(t.id)
      );

      if (startingTask && (!notificationTask || notificationTask.id !== startingTask.id)) {
        setNotificationTask(startingTask);
      }
    }, 5000);
    return () => clearInterval(checkTime);
  }, [tasks, dismissedTaskIds, activeTaskId, notificationTask, completedTaskIds]);

  // 타이머 로직
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (activeTaskId) {
      timer = setInterval(() => {
        setElapsedSeconds(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [activeTaskId]);

  const formatStopwatch = (totalSecs: number) => {
    const h = Math.floor(totalSecs / 3600);
    const m = Math.floor((totalSecs % 3600) / 60);
    const s = totalSecs % 60;
    return `${h > 0 ? h + ':' : ''}${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const computeStats = () => {
    let totalMinutes = 0;
    let totalEstimatedMinutes = 0;
    let completedCount = 0;
    let remainingCount = 0;
    const subjectMinutes: Record<string, number> = {};

    tasks.forEach((t) => {
      if (t.startDate === currentDateString) {
        const [sh, sm] = t.startTime.split(':').map(Number);
        const [eh, em] = t.endTime.split(':').map(Number);

        let diffMins = (eh * 60 + em) - (sh * 60 + sm);
        if (diffMins < 0) diffMins += 24 * 60;

        totalMinutes += diffMins;
        subjectMinutes[t.subject] = (subjectMinutes[t.subject] || 0) + diffMins;

        if (t.estimatedTime && t.estimatedTime > 0) {
          totalEstimatedMinutes += t.estimatedTime;
        } else {
          totalEstimatedMinutes += diffMins;
        }

        if (t.isCompleted) {
          completedCount++;
        } else {
          remainingCount++;
        }
      }
    });

    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    const totalHoursString = `${String(hours).padStart(2, '0')}h ${String(minutes).padStart(2, '0')}m`;

    const estHours = Math.floor(totalEstimatedMinutes / 60);
    const estMinutes = totalEstimatedMinutes % 60;
    const totalEstimatedString = estHours > 0 || estMinutes > 0
      ? `${estHours > 0 ? `${estHours}시간 ` : ''}${estMinutes > 0 ? `${estMinutes}분` : ''}`
      : '0분';

    const goal = 480;
    const percentage = goal > 0 ? Math.round((totalMinutes / goal) * 100) : 0;

    return {
      totalHoursString,
      totalMinutes,
      totalEstimatedString,
      percentage,
      subjectMinutes,
      completedCount,
      remainingCount
    };
  };

  const { totalHoursString, totalEstimatedString, percentage, subjectMinutes, completedCount, remainingCount } = computeStats();

  // 실시간 알림 생성 로직
  const getNotifications = () => {
    const list: string[] = [];
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();

    // 오늘 날짜를 보고 있을 때만 실시간 알림 생성
    if (currentDateString === todayStr) {
      const todayTasks = tasks.filter(t => t.startDate === todayStr);

      todayTasks.forEach(t => {
        if (!t.isCompleted) {
          const [sh, sm] = t.startTime.split(':').map(Number);
          const [eh, em] = t.endTime.split(':').map(Number);
          const startMins = sh * 60 + sm;
          const endMins = eh * 60 + em;

          // 1. 지연 알림 (독촉)
          if (startMins <= currentTime && currentTime < endMins) {
            list.push(`🔥 지연 중: "${t.title}" 학습을 지금 바로 시작하세요!`);
          }
          // 2. 시작 임박 (30분 전)
          else if (startMins > currentTime && startMins <= currentTime + 30) {
            list.push(`⏳ 시작 예정: "${t.title}" 학습이 ${startMins - currentTime}분 후에 시작됩니다.`);
          }

          // 3. 마감 임박 (종료 15분 전)
          if (currentTime < endMins && endMins <= currentTime + 15) {
            list.push(`🚩 마감 임박: "${t.title}" 종료까지 15분 남았습니다. 마무리를 서두르세요!`);
          }
        }
      });

      if (completedCount > 0 && remainingCount === 0 && todayTasks.length > 0) {
        list.push("🎉 대단해요! 오늘의 모든 학습 목표를 완벽히 달성하셨습니다.");
      } else if (list.length === 0 && remainingCount > 0) {
        list.push(`📌 오늘 남은 항목이 ${remainingCount}개 있습니다. 하나씩 해치워볼까요?`);
      }
    } else {
      list.push(`${currentDateString}의 학습 데이터를 조회하고 있습니다.`);
    }
    return list;
  };

  const notifications = getNotifications();

  const filteredTasks = tasks
    .filter((task) => {
      const matchesDate = task.startDate === currentDateString;
      const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.notes.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.subject.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesDate && matchesSearch;
    })
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  const formatDuration = (minutes?: number) => {
    if (!minutes || minutes <= 0) return '';
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    if (h > 0 && m > 0) return `${h}시간 ${m}분`;
    if (h > 0) return `${h}시간`;
    return `${m}분`;
  };

  const formatDateHeader = (dateStr: string) => {
    const replaced = dateStr.replace(/-/g, '.');
    const dayNames = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
    const d = new Date(dateStr);
    const dayName = isNaN(d.getTime()) ? 'FRIDAY' : dayNames[d.getDay()];
    return {
      dateFormatted: replaced,
      dayOfWeek: dayName
    };
  };

  const dateDetails = formatDateHeader(currentDateString);

  const shiftDate = (days: number) => {
    const d = new Date(currentDateString);
    if (!isNaN(d.getTime())) {
      d.setDate(d.getDate() + days);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      setCurrentDateString(`${yyyy}-${mm}-${dd}`);
    }
  };

  const subjectDisplayNamesMap: Record<string, string> = {
    '수학': 'Mathematics',
    '과학': 'Computer Science',
    '영어': 'English Literature',
    '경제학': 'Physics & Humanities'
  };

  return (
    <div className="w-full">
      {/* 시작 알림 팝업 */}
      {notificationTask && (
        <div className="fixed top-6 right-6 z-50 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="bg-surface-container-high border-2 border-primary/20 rounded-2xl p-5 shadow-2xl flex items-start gap-4 max-w-sm backdrop-blur-md">
            <div className="bg-primary/10 p-2.5 rounded-xl text-primary">
              <Timer className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-bold text-primary mb-0.5">학습 시간 알림</p>
              <h5 className="text-sm font-bold text-on-surface mb-1">[{notificationTask.subject}] {notificationTask.title}</h5>
              <p className="text-[11px] text-on-surface-variant mb-4 leading-tight">계획하신 학습 시간이 되었습니다.</p>
              <div className="flex gap-2">
                <button 
                  onClick={() => {
                    if (activeTaskId) setTaskAccumulatedSeconds(prev => ({ ...prev, [activeTaskId]: elapsedSeconds }));
                    setElapsedSeconds(taskAccumulatedSeconds[notificationTask.id] || 0);
                    setActiveTaskId(notificationTask.id);
                    setNotificationTask(null);
                  }}
                  className="flex-1 bg-primary text-on-primary py-2 rounded-lg text-xs font-bold hover:bg-primary/90 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Play className="w-3 h-3 fill-current" /> 일정 시작
                </button>
                <button 
                  onClick={() => {
                    setDismissedTaskIds(prev => new Set(prev).add(notificationTask.id));
                    setNotificationTask(null);
                  }}
                  className="px-3 py-2 border border-outline-variant text-on-surface-variant rounded-lg text-xs font-semibold hover:bg-surface-container transition-all cursor-pointer"
                >
                  나중에
                </button>
              </div>
            </div>
            <button 
              onClick={() => setNotificationTask(null)}
              className="p-1 hover:bg-surface-container rounded-full text-on-surface-variant cursor-pointer transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Top Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-outline-variant/40 mb-6">
        <div className="flex items-center gap-4">
          <span className="text-xl font-bold text-primary">StudyWise</span>
          <div className="h-6 w-[1px] bg-outline-variant"></div>
          <h2 className="text-xl font-bold text-on-surface">학습 기록</h2>
        </div>

        <div className="flex items-center gap-4 self-end md:self-auto">
          <div className="relative">
            <span className="absolute inset-y-0 left-3 flex items-center text-on-surface-variant pointer-events-none">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              placeholder="Search records..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 bg-surface-container rounded-full border-none focus:outline-none focus:ring-1 focus:ring-primary w-60 text-sm"
            />
          </div>

          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className={`p-2 rounded-full hover:bg-surface-container transition-all relative cursor-pointer ${showNotifications ? 'bg-surface-container text-primary' : 'text-on-surface-variant'}`}
            >
              <Bell className="w-5 h-5" />
              {notifications.length > 0 && currentDateString === todayStr && (
                <span className="absolute top-[6px] right-[6px] w-2 h-2 bg-error rounded-full" />
              )}
            </button>

            {/* 알림 드롭다운 레이어 */}
            {showNotifications && (
              <div className="absolute right-0 mt-3 w-72 bg-surface-container-highest rounded-2xl shadow-xl border border-outline-variant z-50 animate-fade-in overflow-hidden">
                <div className="p-4 border-b border-outline-variant flex justify-between items-center bg-surface-container">
                  <span className="text-xs font-bold text-primary tracking-wider">알림 센터</span>
                  <button onClick={() => setShowNotifications(false)} className="text-on-surface-variant hover:text-primary transition-colors cursor-pointer">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {notifications.length > 0 ? (
                    notifications.map((note, idx) => (
                      <div key={idx} className="p-4 border-b border-outline-variant/30 last:border-0 hover:bg-surface-container-low transition-colors">
                        <p className="text-xs font-medium text-on-surface leading-relaxed">
                          {note}
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="p-8 text-center">
                      <p className="text-xs text-on-surface-variant font-medium">표시할 알림이 없습니다.</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="h-8 w-[1px] bg-outline-variant mx-1" />
          <button onClick={() => alert('학습 데이터가 서버에 안전하게 저장되어 있습니다.')} className="text-sm font-semibold text-primary hover:underline cursor-pointer">Save</button>
        </div>
      </div>

      {/* Date Navigation Bar */}
      <div className="flex items-center justify-between mb-6 bg-surface-container-lowest p-3 rounded-2xl shadow-sm border border-outline-variant/30">
        <div className="flex items-center gap-2">
          <button
            onClick={() => shiftDate(-1)}
            className="p-2 rounded-lg hover:bg-surface-container-high transition-colors text-primary flex items-center justify-center cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex flex-col items-center min-w-[120px]">
            <span className="text-lg font-bold text-primary">{dateDetails.dateFormatted}</span>
            <span className="text-[10px] font-bold font-mono text-on-surface-variant tracking-wider uppercase">
              {dateDetails.dayOfWeek}
            </span>
          </div>
          <button
            onClick={() => shiftDate(1)}
            className="p-2 rounded-lg hover:bg-surface-container-high transition-colors text-primary flex items-center justify-center cursor-pointer"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        <button
          onClick={() => setCurrentDateString(todayStr)}
          className="px-5 py-2 bg-surface-container text-primary font-semibold text-xs rounded-full flex items-center gap-1.5 hover:bg-primary hover:text-on-primary transition-all duration-300 cursor-pointer shadow-sm"
        >
          <Calendar className="w-3.5 h-3.5" />
          오늘로 돌아가기
        </button>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-4 space-y-6">
          <div className="bg-primary text-on-primary p-6 rounded-2xl shadow-md relative overflow-hidden">
            <div className="relative z-10">
              <p className="font-mono text-[10px] font-semibold text-on-primary-container tracking-wider uppercase opacity-80 mb-1">TOTAL STUDY TIME</p>
              <h3 className="text-4xl font-black mb-1">{totalHoursString}</h3>
              <p className="text-xs text-white/80 font-medium mb-3">⏱️ 총 예상 학습 시간: {totalEstimatedString}</p>
              <div className="flex items-center gap-1 text-secondary-fixed text-xs font-semibold">
                <Award className="w-3.5 h-3.5" />
                <span>15% more than yesterday</span>
              </div>
            </div>
            <div className="absolute -right-12 -bottom-12 w-32 h-32 bg-secondary-container/20 rounded-full blur-[40px] pointer-events-none" />
          </div>

          <div className="bg-surface-container-high p-5 rounded-2xl shadow-sm flex justify-around items-center border border-outline-variant/20">
            <div className="text-center">
              <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-tighter">Completed</p>
              <p className="text-2xl font-black text-primary">{completedCount}</p>
            </div>
            <div className="w-[1px] h-8 bg-outline-variant" />
            <div className="text-center">
              <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-tighter">Remaining</p>
              <p className="text-2xl font-black text-secondary">{remainingCount}</p>
            </div>
          </div>

          <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/30 shadow-sm">
            <h4 className="text-sm font-bold text-primary mb-5">과목별 학습 시간</h4>
            <div className="space-y-4">
              {['수학', '과학', '영어', '경제학'].map((subKey) => {
                const totalMins = subjectMinutes[subKey] || 0;
                const hh = Math.floor(totalMins / 60);
                const mm = totalMins % 60;
                const formattedDur = totalMins > 0 ? `${hh}h ${mm}m` : '0h 00m';
                const barWidth = Math.min(100, Math.round((totalMins / 240) * 100));
                const displayTitle = subjectDisplayNamesMap[subKey] || subKey;

                return (
                  <div key={subKey} className="group">
                    <div className="flex justify-between items-end mb-1">
                      <span className="text-xs font-bold text-on-surface">{displayTitle}</span>
                      <span className="font-mono text-xs font-bold text-primary">{formattedDur}</span>
                    </div>
                    <div className="h-2 w-full bg-surface-container rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${subKey === '수학' ? 'bg-primary' :
                          subKey === '과학' ? 'bg-secondary' :
                            subKey === '영어' ? 'bg-primary-container' : 'bg-tertiary-container'
                          }`}
                        style={{ width: `${barWidth}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-surface-container-low p-6 rounded-2xl border border-outline-variant/30">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-secondary-container rounded-full flex items-center justify-center text-on-secondary-container shadow-sm shrink-0">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-on-surface">Daily Goal: 8 Hours</p>
                <p className="font-mono text-[10px] font-semibold text-on-surface-variant tracking-wider uppercase">
                  Achieved {percentage}%
                </p>
              </div>
            </div>

            <div className="flex justify-center p-2">
              <div className="relative w-28 h-28 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="56"
                    cy="56"
                    r="44"
                    className="text-surface-container-high/30"
                    stroke="currentColor"
                    strokeWidth="10"
                    fill="transparent"
                  />
                  <circle
                    cx="56"
                    cy="56"
                    r="44"
                    className="text-primary transition-all duration-500 ease-out"
                    stroke="currentColor"
                    strokeWidth="10"
                    fill="transparent"
                    strokeDasharray="276.4"
                    strokeDashoffset={276.4 - (276.4 * Math.min(percentage, 110)) / 100}
                  />
                </svg>
                <span className="absolute text-sm font-bold text-primary font-mono">{percentage}%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="col-span-12 lg:col-span-8">
          <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/20 shadow-sm min-h-[500px] relative">
            <div className="flex justify-between items-center mb-6">
              <h4 className="text-sm font-bold text-primary">타임라인 학습 내역</h4>
              <div className="flex gap-4">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-primary" />
                  <span className="font-mono text-[9px] font-bold text-on-surface-variant tracking-wider">MAIN</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-secondary-container" />
                  <span className="font-mono text-[9px] font-bold text-on-surface-variant tracking-wider">FOCUS</span>
                </div>
              </div>
            </div>

            {filteredTasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-80 text-center text-on-surface-variant">
                <Calendar className="w-12 h-12 text-outline-variant mb-3 animate-pulse" />
                <p className="text-xs font-semibold">오늘 지정된 학습 일정이 없습니다.</p>
                <button
                  onClick={onNavigateToAddTask}
                  className="mt-4 px-4 py-2 bg-primary text-on-primary rounded-lg text-xs font-semibold hover:opacity-90 active:scale-[0.98] transition-all cursor-pointer shadow-sm flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  학습 계획 추가하기
                </button>
              </div>
            ) : (
              <div className="relative pl-12 border-l border-outline-variant/50 ml-4 space-y-6 py-2">
                {filteredTasks.map((t) => {
                  const isFocus = t.focusLevel === 'Focus';
                  const isActive = activeTaskId === t.id;
                  const isCompleted = completedTaskIds.has(t.id);

                  return (
                    <div key={t.id} className="relative group/node animate-fade-in">
                      <div className={`absolute -left-[53px] top-6 w-3 h-3 rounded-full border-2 bg-surface-container-lowest box-content z-10 transition-transform duration-150 group-hover/node:scale-125
                        ${isActive ? 'ring-4 ring-primary/20' : ''}
                        ${isCompleted ? 'border-green-500 bg-green-500' :
                          isFocus ? 'border-secondary-container bg-secondary' : 'border-primary bg-primary'}`}
                      />

                      <span className="absolute -left-[108px] top-5 text-[9px] font-bold font-mono text-on-surface-variant bg-surface px-1">
                        {t.startTime}
                      </span>

                      <div className={`p-4 rounded-xl shadow-sm border-l-4 transition-all hover:shadow-md relative
                        ${isActive ? 'bg-primary/5 border-l-primary ring-1 ring-primary/10 scale-[1.01]' :
                          isCompleted ? 'bg-green-500/5 border-l-green-500 opacity-90' :
                          isFocus ? 'bg-secondary/10 border-secondary-container text-on-surface-variant'
                                  : 'bg-primary-container/10 border-primary text-on-surface'}
                        ${t.isCompleted ? 'opacity-75' : ''}`}>

                        {/* 상태 배지 */}
                        {(isActive || (taskAccumulatedSeconds[t.id] > 0 && !isCompleted)) && (
                          <div className={`absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[10px] font-bold shadow-lg flex items-center gap-1.5 transition-all ${
                            isActive ? 'bg-primary text-on-primary animate-bounce' : 'bg-amber-100 text-amber-800 border border-amber-200'
                          }`}>
                            {isActive ? '진행 중' : '중단됨'}: {formatStopwatch(isActive ? elapsedSeconds : taskAccumulatedSeconds[t.id])}
                          </div>
                        )}

                        {isCompleted && !isActive && (
                          <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-green-600 text-white px-3 py-1 rounded-full text-[10px] font-bold shadow-lg flex items-center gap-1.5">
                            <CheckCircle2 className="w-3 h-3" /> 수행 완료 ({formatStopwatch(taskAccumulatedSeconds[t.id] || 0)})
                          </div>
                        )}

                        <div className="flex justify-between items-start mb-1">
                          <div className="flex-1 pr-4 flex items-center gap-3">
                            <button
                              onClick={() => onToggleTask(t.id, !t.isCompleted)}
                              className="text-primary hover:scale-110 transition-transform cursor-pointer"
                            >
                              {t.isCompleted ? <CheckCircle2 className="w-5 h-5 fill-primary text-on-primary" /> : <Circle className="w-5 h-5" />}
                            </button>
                            <h5 className={`font-bold text-sm ${t.isCompleted ? 'line-through text-on-surface-variant' : 'text-primary'}`}>
                              {t.title}
                            </h5>
                          </div>
                          <div className="flex items-center gap-3 shrink-0">
                            <span className={`font-mono text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${isFocus ? 'bg-secondary text-on-secondary' : 'bg-primary text-on-primary'
                              }`}>
                              {t.endTime} 종료
                            </span>
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => onEditTask(t)}
                                title="일정 수정"
                                className="p-1.5 rounded-lg bg-surface text-primary border border-primary/20 shadow-sm hover:bg-primary hover:text-white transition-all cursor-pointer flex items-center justify-center"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => onDeleteTask(t.id)}
                                title="일정 삭제"
                                className="p-1.5 rounded-lg bg-surface text-error border border-error/20 shadow-sm hover:bg-error hover:text-white transition-all cursor-pointer flex items-center justify-center"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>

                        <p className="text-xs text-on-surface-variant mt-2 leading-relaxed">
                          {t.notes || "기록된 메모가 없습니다."}
                        </p>

                        <div className="flex gap-1.5 flex-wrap items-center mt-3">
                          <span className="text-[10px] bg-surface-container-high/60 border border-outline-variant/30 text-on-surface px-2 py-0.5 rounded font-medium">
                            {t.subject}
                          </span>
                          {t.estimatedTime && t.estimatedTime > 0 && (
                            <span className="text-[10px] bg-primary/10 border border-primary/20 text-primary px-2 py-0.5 rounded font-bold">
                              ⏱️ 예상 소요: {formatDuration(t.estimatedTime)}
                            </span>
                          )}
                          {!t.isAllDay && (
                            <span className="text-[10px] text-on-surface-variant font-medium">
                              ⏱️ 계획 시간: {t.startTime} ~ {t.endTime}
                            </span>
                          )}
                          {(taskAccumulatedSeconds[t.id] > 0 || isActive) && (
                            <span className="text-[10px] text-primary font-bold bg-primary/5 px-1.5 py-0.5 rounded border border-primary/10">
                              🎯 수행 시간: {formatStopwatch(isActive ? elapsedSeconds : (taskAccumulatedSeconds[t.id] || 0))}
                            </span>
                          )}

                          {/* 액션 버튼 */}
                          <div className="ml-auto flex gap-1.5">
                            {!isActive && !isCompleted && (
                              <button 
                                onClick={() => {
                                  if (activeTaskId) setTaskAccumulatedSeconds(prev => ({ ...prev, [activeTaskId]: elapsedSeconds }));
                                  setElapsedSeconds(taskAccumulatedSeconds[t.id] || 0);
                                  setActiveTaskId(t.id);
                                }}
                                className="text-[10px] bg-primary text-on-primary px-2.5 py-1 rounded font-bold flex items-center gap-1 hover:opacity-90 cursor-pointer"
                              >
                                <Play className="w-2.5 h-2.5 fill-current" /> {taskAccumulatedSeconds[t.id] > 0 ? '이어하기' : '시작하기'}
                              </button>
                            )}
                            {isActive && (
                              <>
                                <button 
                                  onClick={() => {
                                    setTaskAccumulatedSeconds(prev => ({ ...prev, [t.id]: elapsedSeconds }));
                                    setActiveTaskId(null);
                                  }}
                                  className="text-[10px] bg-amber-500 text-white px-2.5 py-1 rounded font-bold flex items-center gap-1 hover:opacity-90 cursor-pointer"
                                >
                                  <Pause className="w-2.5 h-2.5 fill-current" /> 중단하기
                                </button>
                                <button
                                  onClick={() => {
                                    const requiredSeconds = (t.estimatedTime || 0) * 60;
                                    if (elapsedSeconds < requiredSeconds) {
                                      alert(`아직 목표 학습 시간(${t.estimatedTime}분)을 채우지 못했습니다.`);
                                      return;
                                    }
                                    setTaskAccumulatedSeconds(prev => ({ ...prev, [t.id]: elapsedSeconds }));
                                    setCompletedTaskIds((prev) => new Set(prev).add(t.id));
                                    setActiveTaskId(null);
                                  }}
                                  className={`text-[10px] px-2.5 py-1 rounded font-bold flex items-center gap-1 transition-all cursor-pointer ${
                                    elapsedSeconds >= (t.estimatedTime || 0) * 60
                                      ? 'bg-green-600 text-white hover:opacity-90'
                                      : 'bg-outline-variant text-on-surface-variant grayscale opacity-70'
                                  }`}
                                >
                                  <CheckCircle2 className="w-2.5 h-2.5" /> 완료하기
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}

                <div className="relative pt-6">
                  <div className="absolute -left-[50px] top-8 w-2 h-2 rounded-full bg-outline-variant" />
                  <span className="absolute -left-[108px] top-6 text-[9px] font-bold font-mono text-outline">
                    21:00
                  </span>
                  <p className="text-[10px] font-mono text-outline uppercase tracking-widest font-bold">
                    End of scheduled session
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
