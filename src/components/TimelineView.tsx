import React, { useState } from 'react';
import { Task } from '../types';
import { Search, Bell, ChevronLeft, ChevronRight, Calendar, Award, Trash2, Plus } from 'lucide-react';

interface TimelineViewProps {
  tasks: Task[];
  onDeleteTask: (id: string) => void;
  onNavigateToAddTask: () => void;
}

export default function TimelineView({ tasks, onDeleteTask, onNavigateToAddTask }: TimelineViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentDateString, setCurrentDateString] = useState('2023-11-24');

  const filteredTasks = tasks
    .filter((task) => {
      const matchesDate = task.startDate === currentDateString;
      const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            task.notes.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            task.subject.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesDate && matchesSearch;
    })
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  const computeStats = () => {
    let totalMinutes = 0;
    const subjectMinutes: Record<string, number> = {};

    tasks.forEach((t) => {
      if (t.startDate === currentDateString) {
        const [sh, sm] = t.startTime.split(':').map(Number);
        const [eh, em] = t.endTime.split(':').map(Number);
        
        let diffMins = (eh * 60 + em) - (sh * 60 + sm);
        if (diffMins < 0) diffMins += 24 * 60;
        
        totalMinutes += diffMins;
        subjectMinutes[t.subject] = (subjectMinutes[t.subject] || 0) + diffMins;
      }
    });

    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    const totalHoursString = `${String(hours).padStart(2, '0')}h ${String(minutes).padStart(2, '0')}m`;

    const goal = 480; 
    const percentage = goal > 0 ? Math.round((totalMinutes / goal) * 100) : 0;

    return {
      totalHoursString,
      totalMinutes,
      percentage,
      subjectMinutes
    };
  };

  const { totalHoursString, percentage, subjectMinutes } = computeStats();

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

          <button className="p-2 rounded-full hover:bg-surface-container transition-all text-on-surface-variant relative cursor-pointer">
            <Bell className="w-5 h-5" />
            <span className="absolute top-[6px] right-[6px] w-2 h-2 bg-error rounded-full" />
          </button>
          
          <div className="h-8 w-[1px] bg-outline-variant mx-1" />
          <button className="text-sm font-semibold text-primary hover:underline cursor-pointer">Save</button>
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
          onClick={() => setCurrentDateString('2023-11-24')}
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
              <h3 className="text-4xl font-black mb-3">{totalHoursString}</h3>
              <div className="flex items-center gap-1 text-secondary-fixed text-xs font-semibold">
                <Award className="w-3.5 h-3.5" />
                <span>15% more than yesterday</span>
              </div>
            </div>
            <div className="absolute -right-12 -bottom-12 w-32 h-32 bg-secondary-container/20 rounded-full blur-[40px] pointer-events-none" />
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
                        className={`h-full rounded-full transition-all duration-500 ${
                          subKey === '수학' ? 'bg-primary' : 
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
                  
                  return (
                    <div key={t.id} className="relative group/node animate-fade-in">
                      <div className={`absolute -left-[53px] top-6 w-3 h-3 rounded-full border-2 bg-surface-container-lowest box-content z-10 transition-transform duration-150 group-hover/node:scale-125 ${
                        isFocus ? 'border-secondary-container bg-secondary' : 'border-primary bg-primary'
                      }`} />

                      <span className="absolute -left-[108px] top-5 text-[9px] font-bold font-mono text-on-surface-variant bg-surface px-1">
                        {t.startTime}
                      </span>

                      <div className={`p-4 rounded-xl shadow-sm border-l-4 transition-all hover:shadow-md relative ${
                        isFocus 
                          ? 'bg-secondary/10 border-secondary-container text-on-surface-variant' 
                          : 'bg-primary-container/10 border-primary text-on-surface'
                      }`}>
                        
                        <button 
                          onClick={() => onDeleteTask(t.id)}
                          title="일정 삭제"
                          className="absolute top-3 right-3 p-1.5 rounded-lg hover:bg-surface-container-high hover:text-error text-on-surface-variant transition-colors cursor-pointer flex items-center justify-center"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>

                        <div className="flex justify-between items-start mb-1 pr-6">
                          <h5 className="font-bold text-sm text-primary">
                            {t.title}
                          </h5>
                          <span className={`font-mono text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider shrink-0 ${
                            isFocus ? 'bg-secondary text-on-secondary' : 'bg-primary text-on-primary'
                          }`}>
                            {t.endTime} 종료
                          </span>
                        </div>
                        
                        <p className="text-xs text-on-surface-variant mt-2 leading-relaxed">
                          {t.notes || "기록된 메모가 없습니다."}
                        </p>

                        <div className="flex gap-1.5 items-center mt-3">
                          <span className="text-[10px] bg-surface-container-high/60 border border-outline-variant/30 text-on-surface px-2 py-0.5 rounded font-medium">
                            {t.subject}
                          </span>
                          {!t.isAllDay && (
                            <span className="text-[10px] text-on-surface-variant font-medium">
                              ⏱️ {t.startTime} ~ {t.endTime}
                            </span>
                          )}
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
