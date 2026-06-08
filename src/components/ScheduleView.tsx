import React, { useState } from 'react';
import { Task, AppSettings, ImportanceLevel } from '../types';
import { ArrowLeft, Plus, ChevronLeft, ChevronRight, AlertCircle, Clock, Star } from 'lucide-react';

interface ScheduleViewProps {
  onSaveTask: (task: Omit<Task, 'id'>) => void;
  onNavigateBack: () => void;
  settings: AppSettings;
  editingTask?: Task | null;
  preselectedDate?: string | null;
  preselectedStartTime?: string | null;
  preselectedDuration?: number | null;
  tasks?: Task[];
  onPostponeStudy?: () => void;
  onStartStudy?: () => void;
}

export default function ScheduleView({
  onSaveTask,
  onNavigateBack,
  settings,
  editingTask,
  preselectedDate,
  preselectedStartTime,
  preselectedDuration,
  tasks,
  onPostponeStudy,
  onStartStudy
}: ScheduleViewProps) {
  const [viewMode, setViewMode] = useState<'calendar' | 'form'>(editingTask || preselectedDate ? 'form' : 'calendar');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showAlertBanner, setShowAlertBanner] = useState<boolean>(true);

  // 폼 입력 상태 필드
  const [title, setTitle] = useState(editingTask?.title || '');
  const [isAllDay, setIsAllDay] = useState(editingTask?.isAllDay || false);
  const [importance, setImportance] = useState<ImportanceLevel>(editingTask?.importance || 'Low');
  const [dueDate, setDueDate] = useState(editingTask?.startDate || preselectedDate || new Date().toLocaleDateString('en-CA'));
  const [startTime, setStartTime] = useState(editingTask?.startTime || preselectedStartTime || '09:00');

  const initHours = editingTask?.estimatedTime ? Math.floor(editingTask.estimatedTime / 60) : preselectedDuration ? Math.floor(preselectedDuration / 60) : 1;
  const initMins = editingTask?.estimatedTime ? editingTask.estimatedTime % 60 : preselectedDuration ? preselectedDuration % 60 : 30;

  const [estimatedHours, setEstimatedHours] = useState(initHours);
  const [estimatedMinutes, setEstimatedMinutes] = useState(initMins);

  // 📌 학습 카테고리 상태 관리 (새 과목 추가 가능)
  const initialSubjects = ['수학', '과학', '영어', '프로젝트'];
  if (editingTask && !initialSubjects.includes(editingTask.subject)) {
    initialSubjects.push(editingTask.subject);
  }
  const [subjects, setSubjects] = useState<string[]>(initialSubjects);
  const [selectedSubject, setSelectedSubject] = useState(editingTask?.subject || '수학');
  const [newSubjectInput, setNewSubjectInput] = useState(''); // 👈 사용자가 새로 입력하는 텍스트 상태

  const [notes, setNotes] = useState(editingTask?.notes || '');

  // 📌 새로운 카테고리를 리스트에 추가하는 함수
  const handleAddSubject = () => {
    const trimmed = newSubjectInput.trim();
    if (!trimmed) return;

    // 이미 존재하는 카테고리라면 새로 추가하지 않고 선택만 변경
    if (subjects.includes(trimmed)) {
      setSelectedSubject(trimmed);
    } else {
      setSubjects([...subjects, trimmed]);
      setSelectedSubject(trimmed); // 추가하자마자 바로 선택되도록 설정
    }
    setNewSubjectInput(''); // 입력창 초기화
  };

  const calculateEndTime = (startStr: string, durationMinutes: number): string => {
    if (!startStr) return '00:00';
    const [h, m] = startStr.split(':').map(Number);
    const date = new Date();
    date.setHours(h, m, 0, 0);
    date.setMinutes(date.getMinutes() + durationMinutes);
    return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  };

  const handleSave = () => {
    if (!title.trim()) {
      alert('공부할 내용을 입력해 주세요.');
      return;
    }
    const durationMinutes = estimatedHours * 60 + estimatedMinutes;
    const calculatedEndTime = isAllDay ? '23:59' : calculateEndTime(startTime, durationMinutes);

    onSaveTask({
      title: title.trim(),
      isAllDay,
      startDate: dueDate,
      startTime: isAllDay ? '00:00' : startTime,
      endDate: dueDate,
      endTime: calculatedEndTime,
      subject: selectedSubject,
      notes: notes.trim(),
      focusLevel: Math.random() > 0.4 ? 'Main' : 'Focus',
      estimatedTime: durationMinutes,
      isCompleted: editingTask ? editingTask.isCompleted : false,
      importance
    });

    setTitle('');
    setNotes('');
  };

  const templates = [
    { title: '미적분 II: 삼각함수의 극한 연습문제', subject: '수학', startTime: '09:00', endTime: '11:30', notes: '적분 기법 풀이 및 무한 급수 수렴성 판단 교재 53-62페이지 오답노트 작성' },
    { title: 'CS: 동적 계획법 알고리즘 최적화', subject: '전공', startTime: '13:00', endTime: '16:15', notes: '백준 등급 DP 및 그래프 탐색 핵심 3선 집중 세션. 정오 오답 코드 확인' },
    { title: 'OSS: git 실습', subject: '전공', startTime: '17:00', endTime: '18:45', notes: 'T.S. git 명령어 실습' },
    { title: 'Toeic: Part5 오답 정리', subject: '영어', startTime: '19:30', endTime: '20:45', notes: 'part5 오답 정리 후 복습.' }
  ];

  const handleLoadTemplate = (template: typeof templates[0]) => {
    setTitle(template.title);
    if (!subjects.includes(template.subject)) {
      setSubjects([...subjects, template.subject]);
    }
    setSelectedSubject(template.subject);
    setStartTime(template.startTime);
    const [sh, sm] = template.startTime.split(':').map(Number);
    const [eh, em] = template.endTime.split(':').map(Number);
    let diffMins = (eh * 60 + em) - (sh * 60 + sm);
    if (diffMins < 0) diffMins += 24 * 60;
    setEstimatedHours(Math.floor(diffMins / 60));
    setEstimatedMinutes(diffMins % 60);
    setNotes(template.notes);
  };

  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const handlePrevMonth = () => { setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)); };
  const handleNextMonth = () => { setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)); };

  const handleDateClick = (day: number) => {
    const d = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    setDueDate(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`);
    setViewMode('form');
  };

  const handleBackClick = () => {
    if (viewMode === 'form' && !editingTask && !preselectedDate) { setViewMode('calendar'); }
    else { onNavigateBack(); }
  };

  const renderCalendar = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    const blanks = Array.from({ length: firstDay }, (_, i) => i);
    const monthNames = ["1월", "2월", "3월", "4월", "5월", "6월", "7월", "8월", "9월", "10월", "11월", "12월"];
    const weekDays = ["일", "월", "화", "수", "목", "금", "토"];
    const today = new Date();
    const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;

    return (
      <div className="w-full h-full bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm flex flex-col border border-outline-variant min-h-[calc(100vh-100px)]">
        {showAlertBanner && (
          <div className="bg-amber-50 border-b border-amber-200 px-6 py-3 flex items-center justify-between animate-fade-in">
            <div className="flex items-center gap-2 text-amber-900 font-semibold text-sm">
              <AlertCircle className="w-4 h-4 text-amber-600" />
              <span>⏰ 계획하신 학습 시간이 되었습니다. 지금 시작하시겠습니까?</span>
            </div>
            <div className="flex gap-2">
              <button onClick={() => { if (onStartStudy) onStartStudy(); }} className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer">
                지금 시작
              </button>
              <button onClick={() => { setShowAlertBanner(false); if (onPostponeStudy) onPostponeStudy(); }} className="px-3 py-1 bg-white border border-amber-300 text-amber-700 font-bold text-xs rounded-lg hover:bg-amber-100 transition-colors cursor-pointer">
                나중에 하기
              </button>
            </div>
          </div>
        )}

        <div className="p-6 flex-1 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-on-surface">{year}년 {monthNames[month]}</h2>
            <div className="flex gap-2">
              <button onClick={handlePrevMonth} className="p-2 rounded-lg hover:bg-surface-container cursor-pointer"><ChevronLeft className="w-5 h-5" /></button>
              <button onClick={handleNextMonth} className="p-2 rounded-lg hover:bg-surface-container cursor-pointer"><ChevronRight className="w-5 h-5" /></button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-2 mb-2">
            {weekDays.map(day => <div key={day} className="text-center text-xs font-bold text-on-surface-variant py-2">{day}</div>)}
          </div>

          <div className="grid grid-cols-7 gap-2 flex-1 auto-rows-fr">
            {blanks.map(blank => <div key={`blank-${blank}`} className="p-2" />)}
            {days.map(day => {
              const isToday = isCurrentMonth && today.getDate() === day;
              const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const dayTasks = tasks?.filter(t => t.startDate === dateStr) || [];

              return (
                <button
                  key={day}
                  onClick={() => handleDateClick(day)}
                  className={`flex flex-col items-start justify-start p-2 rounded-xl border transition-all cursor-pointer min-h-[80px] ${isToday ? 'bg-primary/5 border-primary shadow-sm' : 'bg-surface border-outline-variant/50 hover:bg-primary-container'}`}
                >
                  <span className={`text-sm mb-1 ${isToday ? 'font-bold text-primary' : 'font-medium text-on-surface'}`}>{day}</span>
                  <div className="flex flex-col gap-1 w-full mt-auto">
                    {dayTasks.slice(0, 3).map((t, idx) => (
                      <div key={idx} className="w-full text-[9px] bg-primary/10 text-primary truncate px-1.5 py-0.5 rounded font-semibold text-left">
                        {t.title}
                      </div>
                    ))}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  if (viewMode === 'calendar') { return renderCalendar(); }

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col lg:flex-row gap-6 items-start">
      <div className="flex-1 bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm flex flex-col border border-outline-variant w-full">
        <header className="flex justify-between items-center w-full px-6 py-4 bg-surface-bright border-b border-outline-variant">
          <button onClick={handleBackClick} className="text-on-surface-variant hover:text-primary p-2 rounded-full hover:bg-surface-container-high cursor-pointer"><ArrowLeft className="w-5 h-5" /></button>
          <h1 className="text-base font-bold text-primary">{editingTask ? '일정 수정 정보' : '새로운 학습 일정 등록'}</h1>
          <button onClick={handleSave} className="px-4 py-2 bg-primary text-on-primary font-bold text-xs rounded-lg hover:opacity-85 active:scale-[0.98] transition-all cursor-pointer shadow-sm">저장</button>
        </header>

        <div className="px-6 py-6 space-y-5">
          <div className="space-y-1">
            <label className="font-mono text-xs font-semibold text-on-surface-variant uppercase tracking-wider">공부할 핵심 내용</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full bg-surface border border-outline-variant rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary transition-all" placeholder="예: OS 세마포어와 뮤텍스 개념 정리" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-surface-container-low p-4 rounded-xl border border-outline-variant">
            <div className="space-y-1">
              <label className="font-mono text-[11px] font-bold text-on-surface-variant uppercase tracking-wider block">목표 실행일</label>
              <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="w-full bg-surface border border-outline-variant rounded-lg px-3 py-2 text-xs focus:outline-none" />
            </div>

            {!isAllDay && (
              <div className="space-y-1">
                <label className="font-mono text-[11px] font-bold text-on-surface-variant uppercase tracking-wider block flex items-center gap-1"><Clock className="w-3 h-3 text-primary" /> 시작 시간</label>
                <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="w-full bg-surface border border-outline-variant rounded-lg px-3 py-2 text-xs focus:outline-none" />
              </div>
            )}

            <div className="space-y-1 md:col-span-2">
              <label className="font-mono text-[11px] font-bold text-on-surface-variant uppercase tracking-wider block">예상 소요 시간</label>
              <div className="flex items-center gap-2">
                <select value={estimatedHours} onChange={(e) => setEstimatedHours(Number(e.target.value))} className="bg-surface border border-outline-variant rounded-lg px-3 py-2 text-xs focus:outline-none">
                  {[0, 1, 2, 3, 4, 5, 6].map(h => <option key={h} value={h}>{h}시간</option>)}
                </select>
                <select value={estimatedMinutes} onChange={(e) => setEstimatedMinutes(Number(e.target.value))} className="bg-surface border border-outline-variant rounded-lg px-3 py-2 text-xs focus:outline-none">
                  {[0, 10, 20, 30, 40, 50].map(m => <option key={m} value={m}>{m}분</option>)}
                </select>
              </div>
            </div>

            <div className="md:col-span-2 flex flex-col sm:flex-row sm:items-center justify-between pt-2 border-t border-outline-variant/60 gap-4">
              <div className="flex items-center gap-4">
                <span className="text-xs font-semibold text-on-surface">종일 일정 여부</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" checked={isAllDay} onChange={(e) => setIsAllDay(e.target.checked)} className="sr-only peer" />
                  <div className="w-9 h-5 bg-outline-variant rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-on-surface">중요도:</span>
                <div className="flex gap-1">
                  {(['High', 'Medium', 'Low'] as const).map(lvl => (
                    <button key={lvl} type="button" onClick={() => setImportance(lvl)} className={`px-2.5 py-1 text-[10px] font-bold rounded-md border transition-all ${importance === lvl ? 'bg-primary border-primary text-on-primary' : 'bg-surface text-on-surface-variant'}`}>
                      {lvl === 'High' ? '🔴 높음' : lvl === 'Medium' ? '🟡 보통' : '🔵 낮음'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 📌 수정된 학습 카테고리 영역 (기존 버튼 + 직접 입력 인터페이스) */}
          <div className="space-y-2">
            <label className="font-mono text-xs font-semibold text-on-surface-variant uppercase tracking-wider block">학습 카테고리 (과목)</label>

            {/* 1. 카테고리 버튼 선택 리스트 */}
            <div className="flex flex-wrap gap-1.5 items-center">
              {subjects.map((sub) => (
                <button
                  key={sub}
                  type="button"
                  onClick={() => setSelectedSubject(sub)}
                  className={`px-3 py-1.5 rounded-full border text-xs font-semibold transition-all ${selectedSubject === sub ? 'border-primary bg-primary-container text-on-primary-container' : 'border-outline-variant bg-surface text-on-surface-variant'}`}
                >
                  {sub}
                </button>
              ))}
            </div>

            {/* 2. 새 카테고리 텍스트 직접 입력창 */}
            <div className="flex items-center gap-2 max-w-sm mt-2">
              <input
                type="text"
                value={newSubjectInput}
                onChange={(e) => setNewSubjectInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault(); // 폼 제출 방지
                    handleAddSubject();
                  }
                }}
                className="flex-1 bg-surface border border-outline-variant rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-primary transition-all"
                placeholder="직접 입력"
              />
              <button
                type="button"
                onClick={handleAddSubject}
                className="px-3 py-1.5 bg-secondary text-on-secondary font-bold text-xs rounded-lg hover:opacity-90 transition-all flex items-center gap-1 shrink-0 cursor-pointer"
              >
                <Plus className="w-3 h-3" /> 추가
              </button>
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-mono text-xs font-semibold text-on-surface-variant uppercase tracking-wider block">세부 학습 목표 (Notes)</label>
            <div className="relative group overflow-hidden rounded-lg">
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="w-full h-28 bg-[#FEF9C3] p-4 text-xs post-it-shadow border-none rounded-sm resize-none text-on-tertiary-fixed-variant focus:ring-0" placeholder="기억할 핵심 키워드나 할 일을 적으세요." style={{ clipPath: "polygon(0 0, 100% 0, 100% 88%, 88% 100%, 0 100%)" }} />
              <div className="absolute bottom-0 right-0 w-7 h-7 bg-[#FDE68A] pointer-events-none" style={{ clipPath: "polygon(0 0, 0 100%, 100% 100%)" }} />
            </div>
          </div>
        </div>
      </div>

      <div className="w-full lg:w-80 bg-surface-container-low rounded-xl p-5 border border-outline-variant space-y-4">
        <div className="flex items-center gap-2 text-primary font-bold text-sm border-b border-outline-variant/60 pb-2">
          <Star className="w-4 h-4 fill-primary" />
          <span>추천 간편 원클릭 템플릿</span>
        </div>
        <div className="space-y-2.5">
          {templates.map((tpl, i) => (
            <button key={i} type="button" onClick={() => handleLoadTemplate(tpl)} className="w-full text-left p-3 rounded-xl bg-surface border border-outline-variant/60 hover:border-primary hover:bg-primary/5 transition-all flex flex-col gap-1 cursor-pointer group">
              <div className="flex items-center justify-between w-full">
                <span className="text-[10px] bg-secondary-container text-on-secondary-container px-1.5 py-0.5 rounded font-bold">{tpl.subject}</span>
                <span className="text-[9px] text-on-surface-variant font-mono">{tpl.startTime}</span>
              </div>
              <h4 className="text-xs font-bold text-on-surface group-hover:text-primary truncate w-full mt-1">{tpl.title}</h4>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}