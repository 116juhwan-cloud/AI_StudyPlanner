import React, { useState } from 'react';
import { Task, ImportanceLevel } from '../types';
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Trash2, 
  Edit3, 
  Star, 
  CheckSquare, 
  Square, 
  Calendar,
  AlertCircle,
  Flame,
  Clock
} from 'lucide-react';

interface CalendarViewProps {
  tasks: Task[];
  onDeleteTask: (id: string) => void;
  onEditTask: (task: Task) => void;
  onToggleTask: (id: string, isCompleted: boolean) => void;
  onNavigateToAddTask: (date: string, startTime?: string, duration?: number) => void;
}

export default function CalendarView({ 
  tasks, 
  onDeleteTask, 
  onEditTask, 
  onToggleTask, 
  onNavigateToAddTask 
}: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month');
  
  // Drag-to-Create States
  const [dragStart, setDragStart] = useState<{ dayIndex: number; hour: number; dateKey: string } | null>(null);
  const [dragEnd, setDragEnd] = useState<{ hour: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth(); // 0-indexed

  // D-Day calculation helper (returns diff in days)
  const getDDayDays = (dateStr: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Parse target date YYYY-MM-DD
    const target = new Date(dateStr);
    target.setHours(0, 0, 0, 0);
    
    const diffTime = target.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // D-Day string formatting
  const formatDDay = (diffDays: number) => {
    if (diffDays === 0) return 'D-Day';
    if (diffDays > 0) return `D-${diffDays}`;
    return `D+${Math.abs(diffDays)}`;
  };

  // Convert importance level to sorting numeric priority (High=3, Medium=2, Low=1)
  const getImportancePriority = (level?: ImportanceLevel) => {
    switch (level) {
      case 'High': return 3;
      case 'Medium': return 2;
      case 'Low': return 1;
      default: return 1;
    }
  };

  // Sort and filter tasks for priority list
  const priorityTasks = [...tasks].sort((a, b) => {
    // 1. Uncompleted tasks first
    if (a.isCompleted !== b.isCompleted) {
      return a.isCompleted ? 1 : -1;
    }
    // 2. Sort by D-Day days remaining ascending (closest or overdue first)
    const ddayA = getDDayDays(a.startDate);
    const ddayB = getDDayDays(b.startDate);
    if (ddayA !== ddayB) {
      return ddayA - ddayB;
    }
    // 3. Sort by Importance Priority descending (High -> Medium -> Low)
    const priorityA = getImportancePriority(a.importance);
    const priorityB = getImportancePriority(b.importance);
    if (priorityA !== priorityB) {
      return priorityB - priorityA;
    }
    // 4. Start time comparison
    return a.startTime.localeCompare(b.startTime);
  });

  // Monthly Calendar Math
  const getDaysInMonth = (year: number, month: number) => {
    const date = new Date(year, month, 1);
    const days = [];
    
    const startDayOfWeek = date.getDay(); // 0 = Sun, 6 = Sat
    const numDays = new Date(year, month + 1, 0).getDate();
    const prevMonthNumDays = new Date(year, month, 0).getDate();
    
    // Padding from previous month
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const dayDate = new Date(year, month - 1, prevMonthNumDays - i);
      days.push({
        date: dayDate,
        isCurrentMonth: false,
        dayNum: prevMonthNumDays - i,
        dateKey: dayDate.toLocaleDateString('en-CA')
      });
    }
    
    // Current month days
    for (let i = 1; i <= numDays; i++) {
      const dayDate = new Date(year, month, i);
      days.push({
        date: dayDate,
        isCurrentMonth: true,
        dayNum: i,
        dateKey: dayDate.toLocaleDateString('en-CA')
      });
    }
    
    // Padding from next month to fill grid rows (multiple of 7)
    const totalCells = days.length > 35 ? 42 : 35;
    const nextMonthPadding = totalCells - days.length;
    for (let i = 1; i <= nextMonthPadding; i++) {
      const dayDate = new Date(year, month + 1, i);
      days.push({
        date: dayDate,
        isCurrentMonth: false,
        dayNum: i,
        dateKey: dayDate.toLocaleDateString('en-CA')
      });
    }
    
    return days;
  };

  // Weekly Calendar Math (Sunday to Saturday)
  const getWeekDates = (date: Date) => {
    const currentDay = date.getDay(); // 0 = Sun
    const startOfWeek = new Date(date);
    startOfWeek.setDate(date.getDate() - currentDay);
    
    const week = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      week.push(day);
    }
    return week;
  };

  const calendarDays = getDaysInMonth(currentYear, currentMonth);
  const weekDates = getWeekDates(currentDate);

  // Navigation handlers
  const handlePrev = () => {
    if (viewMode === 'month') {
      setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
    } else {
      const nextDate = new Date(currentDate);
      nextDate.setDate(currentDate.getDate() - 7);
      setCurrentDate(nextDate);
    }
  };

  const handleNext = () => {
    if (viewMode === 'month') {
      setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
    } else {
      const nextDate = new Date(currentDate);
      nextDate.setDate(currentDate.getDate() + 7);
      setCurrentDate(nextDate);
    }
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  // Convert time HH:MM to decimal hour (e.g. "09:30" -> 9.5)
  const getDecimalHour = (timeStr: string) => {
    if (!timeStr) return 0;
    const [h, m] = timeStr.split(':').map(Number);
    return h + m / 60;
  };

  // Get color styles for subject badge
  const getSubjectColor = (subject: string) => {
    switch (subject) {
      case '수학': return 'bg-rose-500/10 text-rose-600 border-rose-500/20';
      case '과학': return 'bg-cyan-500/10 text-cyan-600 border-cyan-500/20';
      case '영어': return 'bg-violet-500/10 text-violet-600 border-violet-500/20';
      case '경제학': return 'bg-amber-500/10 text-amber-600 border-amber-500/20';
      default: return 'bg-slate-500/10 text-slate-600 border-slate-500/20';
    }
  };

  // Importance level styles & icons mapping
  const getImportanceBadge = (level?: ImportanceLevel) => {
    switch (level) {
      case 'High':
        return (
          <span className="flex items-center gap-0.5 text-rose-600 bg-rose-500/10 border border-rose-500/20 px-1.5 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider">
            <Flame className="w-3 h-3 text-rose-500 animate-pulse fill-rose-500" />
            긴급
          </span>
        );
      case 'Medium':
        return (
          <span className="flex items-center gap-0.5 text-amber-600 bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider">
            <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
            중요
          </span>
        );
      case 'Low':
        return (
          <span className="flex items-center gap-0.5 text-slate-500 bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider">
            보통
          </span>
        );
      default:
        return null;
    }
  };

  // Drag-to-Create mouse event callbacks for Weekly view slots
  const handleSlotMouseDown = (dayIndex: number, hour: number, dateKey: string) => {
    setIsDragging(true);
    setDragStart({ dayIndex, hour, dateKey });
    setDragEnd({ hour });
  };

  const handleSlotMouseEnter = (dayIndex: number, hour: number) => {
    if (isDragging && dragStart && dragStart.dayIndex === dayIndex) {
      setDragEnd({ hour });
    }
  };

  const handleGlobalMouseUp = () => {
    if (isDragging && dragStart && dragEnd) {
      const startH = Math.min(dragStart.hour, dragEnd.hour);
      const endH = Math.max(dragStart.hour, dragEnd.hour) + 1; // span at least 1 slot
      const startTimeStr = String(startH).padStart(2, '0') + ':00';
      const durationMinutes = (endH - startH) * 60;
      
      onNavigateToAddTask(dragStart.dateKey, startTimeStr, durationMinutes);
    }
    setIsDragging(false);
    setDragStart(null);
    setDragEnd(null);
  };

  // Weekly Date Range String
  const formatWeekRange = (dates: Date[]) => {
    if (dates.length < 7) return '';
    const start = dates[0];
    const end = dates[6];
    
    const startYear = start.getFullYear();
    const startMonth = start.getMonth() + 1;
    const startDate = start.getDate();
    
    const endYear = end.getFullYear();
    const endMonth = end.getMonth() + 1;
    const endDate = end.getDate();

    if (startYear === endYear) {
      if (startMonth === endMonth) {
        return `${startYear}년 ${startMonth}월 ${startDate}일 ~ ${endDate}일`;
      }
      return `${startYear}년 ${startMonth}월 ${startDate}일 ~ ${endMonth}월 ${endDate}일`;
    }
    return `${startYear}년 ${startMonth}월 ${startDate}일 ~ ${endYear}년 ${endMonth}월 ${endDate}일`;
  };

  // Hour slots for Weekly View (06:00 to 24:00)
  const hourSlots = Array.from({ length: 18 }, (_, i) => i + 6); // 6 AM to 23 PM

  return (
    <div 
      className="grid grid-cols-1 lg:grid-cols-10 gap-6 w-full h-full min-h-[600px] select-none"
      onMouseUp={handleGlobalMouseUp}
      onMouseLeave={() => {
        if (isDragging) handleGlobalMouseUp();
      }}
    >
      
      {/* 1. Left Section (30% - Priority List based on D-Day & Importance) */}
      <div className="lg:col-span-3 flex flex-col bg-surface-container-lowest rounded-2xl border border-outline-variant p-6 shadow-md max-h-[850px]">
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-outline-variant/30">
          <AlertCircle className="w-5 h-5 text-primary" />
          <h2 className="text-xs font-bold text-on-surface uppercase tracking-wider">우선순위 대기열 (D-Day)</h2>
        </div>
        
        {/* Task list container */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-3.5">
          {priorityTasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center text-on-surface-variant/50">
              <Calendar className="w-12 h-12 mb-3 opacity-30" />
              <p className="text-xs font-semibold">등록된 일정이 없습니다.</p>
              <p className="text-[10px] opacity-75 mt-1">캘린더나 상단 메뉴에서 새 일정을 등록해보세요.</p>
            </div>
          ) : (
            priorityTasks.map((task) => {
              const diffDays = getDDayDays(task.startDate);
              const isOverdue = diffDays < 0 && !task.isCompleted;
              const isToday = diffDays === 0 && !task.isCompleted;
              
              // D-Day style mapping
              let ddayBadgeStyle = 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400';
              if (isOverdue) {
                ddayBadgeStyle = 'bg-rose-500 text-white animate-pulse font-extrabold';
              } else if (isToday) {
                ddayBadgeStyle = 'bg-amber-500 text-white font-extrabold';
              } else if (diffDays > 0 && diffDays <= 3 && !task.isCompleted) {
                ddayBadgeStyle = 'bg-primary text-on-primary font-bold';
              }

              return (
                <div 
                  key={task.id}
                  className={`relative p-4 rounded-xl border transition-all duration-150 flex flex-col gap-2.5 ${
                    task.isCompleted 
                      ? 'bg-surface-container-low/60 border-outline-variant/40 opacity-60' 
                      : task.importance === 'High'
                        ? 'bg-rose-500/5 border-rose-500/40 shadow-sm shadow-rose-500/5 ring-1 ring-rose-500/10'
                        : task.importance === 'Medium'
                          ? 'bg-amber-500/5 border-amber-500/40 shadow-sm'
                          : 'bg-surface border-outline-variant/60 hover:border-outline'
                  }`}
                >
                  {/* Top line: D-Day Badge + Subject + Importance */}
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className={`text-[9px] px-2 py-0.5 rounded-md ${ddayBadgeStyle}`}>
                        {formatDDay(diffDays)}
                      </span>
                      <span className={`text-[9px] font-semibold px-2 py-0.5 rounded-full border ${getSubjectColor(task.subject)}`}>
                        {task.subject}
                      </span>
                    </div>

                    {getImportanceBadge(task.importance)}
                  </div>

                  {/* Task details */}
                  <div className="flex gap-2.5 items-start">
                    <button 
                      onClick={() => onToggleTask(task.id, !task.isCompleted)}
                      className="mt-0.5 shrink-0 text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
                    >
                      {task.isCompleted ? (
                        <CheckSquare className="w-4.5 h-4.5 text-emerald-500" />
                      ) : (
                        <Square className="w-4.5 h-4.5" />
                      )}
                    </button>
                    
                    <div className="min-w-0 flex-1">
                      <h3 className={`text-xs font-bold text-on-surface leading-tight ${task.isCompleted ? 'line-through text-on-surface-variant' : ''}`}>
                        {task.title}
                      </h3>
                      <p className="text-[10px] text-on-surface-variant font-mono mt-1 flex items-center gap-1">
                        🗓️ {task.startDate} • {task.startTime}~{task.endTime}
                      </p>
                      {task.notes && (
                        <p className="text-[10px] text-on-surface-variant/80 italic mt-1.5 line-clamp-2 border-l-2 border-outline-variant/50 pl-2">
                          {task.notes}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex justify-end items-center gap-2 border-t border-outline-variant/20 pt-2.5 mt-0.5">
                    <button
                      onClick={() => onEditTask(task)}
                      className="p-1.5 hover:bg-surface-container-high rounded text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
                      title="수정"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDeleteTask(task.id)}
                      className="p-1.5 hover:bg-surface-container-high rounded text-on-surface-variant hover:text-error transition-colors cursor-pointer"
                      title="삭제"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* 2. Right Section (70% - Calendar Container) */}
      <div className="lg:col-span-7 flex flex-col bg-surface-container-lowest rounded-2xl border border-outline-variant p-6 shadow-md h-full min-h-[650px]">
        
        {/* Calendar Switcher Header */}
        <header className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6 pb-3 border-b border-outline-variant/30">
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-primary" />
            <h2 className="text-base font-bold text-on-surface">
              {viewMode === 'month' ? `${currentYear}년 ${currentMonth + 1}월` : formatWeekRange(weekDates)}
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            {/* View Toggle */}
            <div className="flex bg-surface-container border border-outline-variant/60 rounded-xl p-1 shrink-0">
              <button
                onClick={() => setViewMode('month')}
                className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  viewMode === 'month' ? 'bg-primary text-on-primary shadow-sm' : 'text-on-surface-variant hover:bg-surface-container-high'
                }`}
              >
                월간 (Month)
              </button>
              <button
                onClick={() => setViewMode('week')}
                className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  viewMode === 'week' ? 'bg-primary text-on-primary shadow-sm' : 'text-on-surface-variant hover:bg-surface-container-high'
                }`}
              >
                주간 (Week)
              </button>
            </div>

            {/* Navigation controls */}
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={handlePrev}
                className="p-2 border border-outline-variant rounded-lg hover:bg-surface-container-high active:scale-95 transition-all cursor-pointer text-on-surface-variant"
                title={viewMode === 'month' ? "이전 달" : "이전 주"}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleToday}
                className="px-3 py-1.5 border border-outline-variant rounded-lg hover:bg-surface-container-high text-xs font-semibold active:scale-95 transition-all cursor-pointer text-on-surface-variant"
              >
                오늘
              </button>
              <button
                onClick={handleNext}
                className="p-2 border border-outline-variant rounded-lg hover:bg-surface-container-high active:scale-95 transition-all cursor-pointer text-on-surface-variant"
                title={viewMode === 'month' ? "다음 달" : "다음 주"}
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </header>

        {/* -------------------- 2-A. MONTH VIEW -------------------- */}
        {viewMode === 'month' && (
          <div className="flex flex-col flex-1">
            {/* Days of Week Headers */}
            <div className="grid grid-cols-7 gap-1.5 text-center mb-2">
              {['일', '월', '화', '수', '목', '금', '토'].map((day, idx) => (
                <div 
                  key={day} 
                  className={`text-[11px] font-extrabold py-1.5 uppercase ${
                    idx === 0 
                      ? 'text-rose-500' 
                      : idx === 6 
                        ? 'text-cyan-500' 
                        : 'text-on-surface-variant'
                  }`}
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Monthly Calendar Grid (Expanded cell height for enhanced layout) */}
            <div className="grid grid-cols-7 gap-1.5 flex-1 min-h-[500px] bg-outline-variant/10 rounded-xl overflow-hidden border border-outline-variant/20 p-1">
              {calendarDays.map((cell, idx) => {
                const dayTasks = tasks.filter(t => t.startDate === cell.dateKey);
                const isToday = cell.dateKey === new Date().toLocaleDateString('en-CA');
                const dayOfWeek = cell.date.getDay();

                return (
                  <div
                    key={idx}
                    className={`min-h-[110px] bg-surface p-2 flex flex-col justify-between group/cell transition-colors rounded-lg border border-outline-variant/10 relative ${
                      !cell.isCurrentMonth ? 'opacity-35 bg-surface-container-low' : ''
                    } ${isToday ? 'bg-primary-container/15 ring-2 ring-inset ring-primary/20 shadow-sm' : ''}`}
                  >
                    {/* Header: Date number + Quick Add */}
                    <div className="flex justify-between items-center mb-1">
                      <span className={`text-[10px] font-black ${
                        isToday 
                          ? 'bg-primary text-on-primary w-5 h-5 rounded-full flex items-center justify-center shadow-md' 
                          : dayOfWeek === 0 
                            ? 'text-rose-500' 
                            : dayOfWeek === 6 
                              ? 'text-cyan-500' 
                              : 'text-on-surface'
                      }`}>
                        {cell.dayNum}
                      </span>
                      
                      <button
                        onClick={() => onNavigateToAddTask(cell.dateKey)}
                        className="p-1 opacity-0 group-hover/cell:opacity-100 hover:bg-surface-container-high rounded text-on-surface-variant hover:text-primary transition-all duration-150 cursor-pointer"
                        title="이 날짜에 일정 등록"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Tasks container in Month view cell */}
                    <div className="flex-1 overflow-y-auto space-y-1.5 max-h-[85px] pr-0.5 scrollbar-thin">
                      {dayTasks.map(task => {
                        let importanceColor = 'bg-primary/5 text-primary border-primary/20';
                        if (task.isCompleted) {
                          importanceColor = 'bg-slate-100 dark:bg-slate-800/40 text-slate-400 line-through border-outline-variant/20';
                        } else if (task.importance === 'High') {
                          importanceColor = 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/30 font-bold';
                        } else if (task.importance === 'Medium') {
                          importanceColor = 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30 font-bold';
                        }

                        return (
                          <div
                            key={task.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              onEditTask(task);
                            }}
                            className={`text-[9px] px-1.5 py-1 rounded border leading-tight truncate flex items-center gap-1 cursor-pointer hover:shadow-sm transition-all ${importanceColor}`}
                            title={task.title}
                          >
                            {task.importance === 'High' && !task.isCompleted && (
                              <Flame className="w-2.5 h-2.5 text-rose-500 shrink-0 fill-rose-500 animate-pulse" />
                            )}
                            {task.importance === 'Medium' && !task.isCompleted && (
                              <Star className="w-2.5 h-2.5 text-amber-500 shrink-0 fill-amber-500" />
                            )}
                            <span className="truncate">{task.title}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* -------------------- 2-B. WEEK VIEW (Google Calendar Style) -------------------- */}
        {viewMode === 'week' && (
          <div className="flex flex-col flex-1 overflow-hidden">
            {/* Week View Columns Header (8 Columns: 1 Time Label + 7 Days) */}
            <div className="grid grid-cols-8 gap-0 border-b border-outline-variant/40 pb-2">
              {/* Time label spacer column */}
              <div className="text-center text-[10px] text-on-surface-variant font-bold flex items-center justify-center">
                시간
              </div>
              
              {weekDates.map((dayDate, dayIdx) => {
                const isToday = dayDate.toLocaleDateString('en-CA') === new Date().toLocaleDateString('en-CA');
                const isSunday = dayIdx === 0;
                const isSaturday = dayIdx === 6;

                return (
                  <div key={dayIdx} className="text-center flex flex-col items-center justify-center p-1">
                    <span className="text-[10px] font-bold text-on-surface-variant font-mono uppercase">
                      {['일', '월', '화', '수', '목', '금', '토'][dayIdx]}
                    </span>
                    <span className={`text-xs font-black w-6 h-6 flex items-center justify-center rounded-full mt-0.5 ${
                      isToday 
                        ? 'bg-primary text-on-primary shadow-sm' 
                        : isSunday 
                          ? 'text-rose-500' 
                          : isSaturday 
                            ? 'text-cyan-500' 
                            : 'text-on-surface'
                    }`}>
                      {dayDate.getDate()}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Weekly Hours Grid Container (Scrollable) */}
            <div className="flex-1 overflow-y-auto max-h-[600px] border border-outline-variant/30 rounded-xl mt-3 relative bg-surface-container-low/20">
              
              {/* Vertical Columns Container */}
              <div className="grid grid-cols-8 gap-0 relative h-[792px]"> {/* 18 slots * 44px = 792px */}
                
                {/* Time labels column */}
                <div className="border-r border-outline-variant/30 flex flex-col bg-surface-container-lowest/80 backdrop-blur-sm sticky left-0 z-10">
                  {hourSlots.map((hour) => (
                    <div 
                      key={hour} 
                      className="h-11 border-b border-outline-variant/10 text-[9px] font-mono font-bold text-on-surface-variant/70 text-right pr-2 pt-1.5"
                    >
                      {String(hour).padStart(2, '0')}:00
                    </div>
                  ))}
                </div>

                {/* 7 Day Columns */}
                {weekDates.map((dayDate, dayIdx) => {
                  const dateKey = dayDate.toLocaleDateString('en-CA');
                  const dayTasks = tasks.filter(t => t.startDate === dateKey && !t.isAllDay);
                  const allDayTasks = tasks.filter(t => t.startDate === dateKey && t.isAllDay);
                  
                  return (
                    <div 
                      key={dayIdx} 
                      className="relative border-r border-outline-variant/20 last:border-r-0 h-[792px] group/weekcol"
                    >
                      {/* Hour slot background grid lines */}
                      {hourSlots.map((hour) => (
                        <div
                          key={hour}
                          onMouseDown={() => handleSlotMouseDown(dayIdx, hour, dateKey)}
                          onMouseEnter={() => handleSlotMouseEnter(dayIdx, hour)}
                          className="h-11 border-b border-outline-variant/10 cursor-cell hover:bg-primary/5 transition-colors"
                        />
                      ))}

                      {/* Absolute drag preview placeholder overlay */}
                      {isDragging && dragStart && dragStart.dayIndex === dayIdx && dragEnd && (
                        (() => {
                          const startH = Math.min(dragStart.hour, dragEnd.hour);
                          const endH = Math.max(dragStart.hour, dragEnd.hour) + 1;
                          const top = (startH - 6) * 44;
                          const height = (endH - startH) * 44;
                          
                          return (
                            <div 
                              className="absolute left-1 right-1 bg-primary/20 border-2 border-dashed border-primary rounded-xl flex flex-col items-center justify-center text-primary font-bold text-[9px] pointer-events-none z-20 animate-pulse"
                              style={{ top: `${top}px`, height: `${height}px` }}
                            >
                              <Plus className="w-4 h-4 mb-0.5" />
                              <span>{endH - startH}시간 일정 등록</span>
                            </div>
                          );
                        })()
                      )}

                      {/* Render scheduled hourly tasks absolutely in the day column */}
                      {dayTasks.map((task) => {
                        const startH = getDecimalHour(task.startTime);
                        const endH = getDecimalHour(task.endTime);
                        
                        // Clamp slots to our visible scale (6 AM to 24 PM)
                        const clampedStart = Math.max(6, Math.min(24, startH));
                        const clampedEnd = Math.max(6, Math.min(24, endH));
                        const duration = clampedEnd - clampedStart;
                        
                        if (duration <= 0) return null;

                        const top = (clampedStart - 6) * 44;
                        const height = duration * 44;

                        // Subject & Importance styling
                        let cardColor = 'bg-primary/10 text-primary border-primary/20 hover:border-primary';
                        if (task.isCompleted) {
                          cardColor = 'bg-slate-100 text-slate-400 border-outline-variant/30 line-through';
                        } else if (task.importance === 'High') {
                          cardColor = 'bg-rose-500/10 text-rose-800 border-rose-500/30 hover:border-rose-500 ring-1 ring-rose-500/5';
                        } else if (task.importance === 'Medium') {
                          cardColor = 'bg-amber-500/10 text-amber-800 border-amber-500/30 hover:border-amber-500';
                        }

                        return (
                          <div
                            key={task.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              onEditTask(task);
                            }}
                            className={`absolute left-1 right-1 p-2 rounded-lg border leading-snug cursor-pointer transition-all hover:shadow-md z-10 flex flex-col justify-between overflow-hidden ${cardColor}`}
                            style={{ top: `${top + 2}px`, height: `${height - 4}px` }}
                          >
                            <div className="min-w-0">
                              {/* Subject + Importance Icon tag line */}
                              <div className="flex justify-between items-center gap-1 mb-0.5">
                                <span className="text-[8px] font-black uppercase tracking-wider truncate">
                                  {task.subject}
                                </span>
                                {task.importance === 'High' && !task.isCompleted && (
                                  <Flame className="w-2.5 h-2.5 text-rose-500 fill-rose-500 animate-pulse shrink-0" />
                                )}
                                {task.importance === 'Medium' && !task.isCompleted && (
                                  <Star className="w-2.5 h-2.5 text-amber-500 fill-amber-500 shrink-0" />
                                )}
                              </div>
                              <h4 className="text-[9px] font-bold truncate leading-tight">
                                {task.title}
                              </h4>
                            </div>
                            <span className="text-[7.5px] font-mono opacity-80 mt-1 flex items-center gap-0.5">
                              <Clock className="w-2 h-2 shrink-0" />
                              {task.startTime}~{task.endTime}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
      
    </div>
  );
}
