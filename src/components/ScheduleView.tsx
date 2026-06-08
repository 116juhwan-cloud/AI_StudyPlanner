import React, { useState } from 'react';
import { Task, AppSettings } from '../types';
import { ArrowLeft, Calendar, CheckSquare, Plus, Check, X } from 'lucide-react';
import { quotesData } from '../data/quotes';

interface ScheduleViewProps {
  onAddTask: (task: Omit<Task, 'id'>) => void;
  onNavigateBack: () => void;
  settings: AppSettings;
}

export default function ScheduleView({ onAddTask, onNavigateBack, settings }: ScheduleViewProps) {
  const [title, setTitle] = useState('');
  const [isAllDay, setIsAllDay] = useState(false);
  
  const [dueDate, setDueDate] = useState('2023-11-24');
  const [startTime, setStartTime] = useState('09:00');
  const [estimatedHours, setEstimatedHours] = useState(1);
  const [estimatedMinutes, setEstimatedMinutes] = useState(30);

  const [subjects, setSubjects] = useState<string[]>(['수학', '과학', '영어', '경제학']);
  const [selectedSubject, setSelectedSubject] = useState('수학');
  const [notes, setNotes] = useState('');

  const [newSubjectInput, setNewSubjectInput] = useState('');
  const [isAddingSubject, setIsAddingSubject] = useState(false);

  const calculateEndTime = (startStr: string, durationMinutes: number): string => {
    if (!startStr) return '00:00';
    const [h, m] = startStr.split(':').map(Number);
    const date = new Date();
    date.setHours(h, m, 0, 0);
    date.setMinutes(date.getMinutes() + durationMinutes);
    const endH = String(date.getHours()).padStart(2, '0');
    const endM = String(date.getMinutes()).padStart(2, '0');
    return `${endH}:${endM}`;
  };

  const handleAddSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (newSubjectInput.trim()) {
      if (!subjects.includes(newSubjectInput.trim())) {
        setSubjects([...subjects, newSubjectInput.trim()]);
      }
      setSelectedSubject(newSubjectInput.trim());
      setNewSubjectInput('');
      setIsAddingSubject(false);
    }
  };

  const handleSave = () => {
    if (!title.trim()) {
      alert('공부할 내용을 입력해 주세요.');
      return;
    }

    const durationMinutes = estimatedHours * 60 + estimatedMinutes;
    const calculatedEndTime = isAllDay ? '23:59' : calculateEndTime(startTime, durationMinutes);

    onAddTask({
      title: title.trim(),
      isAllDay,
      startDate: dueDate,
      startTime: isAllDay ? '00:00' : startTime,
      endDate: dueDate,
      endTime: calculatedEndTime,
      subject: selectedSubject,
      notes: notes.trim(),
      focusLevel: Math.random() > 0.4 ? 'Main' : 'Focus',
      estimatedTime: durationMinutes
    });

    setTitle('');
    setNotes('');
  };

  const templates = [
    {
      title: '미적분 II: 삼각함수의 극한 연습문제',
      subject: '수학',
      startTime: '09:00',
      endTime: '11:30',
      notes: '적분 기법 풀이 및 무한 급수 수렴성 판단 교재 53-62페이지 오답노트 작성'
    },
    {
      title: 'CS: 동적 계획법 알고리즘 최적화',
      subject: '과학',
      startTime: '13:00',
      endTime: '16:15',
      notes: '백준 골드 등급 DP 및 그래프 탐색 핵심 3선 집중 세션. 정오 오답 코드 확인'
    },
    {
      title: '영문학: 모던 포에트리 분석 에세이',
      subject: '영어',
      startTime: '17:00',
      endTime: '18:45',
      notes: 'T.S. 엘리엇의 황무지 파트 1 분석 및 조별 토론용 요약본 정리'
    },
    {
      title: '물리학: 전자기학 맥스웰 방정식',
      subject: '경제학',
      startTime: '19:30',
      endTime: '20:45',
      notes: '맥스웰의 4대 방정식 복습 및 주간 과제물 디버깅 종료.'
    }
  ];

  const handleLoadTemplate = (template: typeof templates[0]) => {
    setTitle(template.title);
    setSelectedSubject(template.subject);
    setStartTime(template.startTime);
    
    // Parse duration to set estimated hours and minutes
    const [sh, sm] = template.startTime.split(':').map(Number);
    const [eh, em] = template.endTime.split(':').map(Number);
    let diffMins = (eh * 60 + em) - (sh * 60 + sm);
    if (diffMins < 0) diffMins += 24 * 60;
    
    setEstimatedHours(Math.floor(diffMins / 60));
    setEstimatedMinutes(diffMins % 60);
    setNotes(template.notes);
  };

  return (
    <div className="w-full max-w-xl mx-auto bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm flex flex-col border border-outline-variant">
      {/* Header */}
      <header className="flex justify-between items-center w-full px-6 py-4 bg-surface-bright border-b border-outline-variant">
        <button 
          onClick={onNavigateBack}
          aria-label="Go back" 
          className="text-on-surface-variant hover:text-primary transition-colors flex items-center justify-center p-2 rounded-full hover:bg-surface-container-high cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-bold text-primary">일정 추가</h1>
        <button 
          onClick={handleSave}
          className="px-4 py-2 bg-primary text-on-primary font-semibold text-xs rounded-lg hover:opacity-85 active:scale-[0.98] transition-all cursor-pointer shadow-sm"
        >
          저장
        </button>
      </header>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
        {/* 공부할 내용 Input */}
        <div className="space-y-1">
          <label className="font-mono text-xs font-semibold text-on-surface-variant uppercase tracking-wider">공부할 내용 (Study Content)</label>
          <input 
            type="text" 
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-surface border border-outline-variant rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder-on-surface-variant/40" 
            placeholder="어떤 공부를 계획 중인가요? (예: 영어 단어 50개 암기)"
          />
        </div>

        {/* 마감일 & 예상소요 시간 & 시간 설정 */}
        <div className="space-y-4 bg-surface-container-low p-4 rounded-xl border border-outline-variant">
          {/* 마감일 Input */}
          <div className="space-y-1">
            <label className="font-mono text-[11px] font-bold text-on-surface-variant uppercase tracking-wider block">마감일 (Due Date)</label>
            <input 
              type="date" 
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full bg-surface border border-outline-variant rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-primary focus:ring-1"
            />
          </div>

          {/* 예상소요 시간 */}
          <div className="space-y-2">
            <label className="font-mono text-[11px] font-bold text-on-surface-variant uppercase tracking-wider block">예상소요 시간 (Estimated Time)</label>
            <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
              <div className="flex items-center gap-1.5 shrink-0">
                <select
                  value={estimatedHours}
                  onChange={(e) => setEstimatedHours(Number(e.target.value))}
                  className="bg-surface border border-outline-variant rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-primary focus:ring-1"
                >
                  {Array.from({ length: 13 }, (_, i) => (
                    <option key={i} value={i}>{i}시간</option>
                  ))}
                </select>
                <select
                  value={estimatedMinutes}
                  onChange={(e) => setEstimatedMinutes(Number(e.target.value))}
                  className="bg-surface border border-outline-variant rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-primary focus:ring-1"
                >
                  {Array.from({ length: 12 }, (_, i) => i * 5).map((min) => (
                    <option key={min} value={min}>{min}분</option>
                  ))}
                </select>
              </div>

              {/* Presets */}
              <div className="flex flex-wrap gap-1">
                {[
                  { label: '30분', h: 0, m: 30 },
                  { label: '1시간', h: 1, m: 0 },
                  { label: '1.5시간', h: 1, m: 30 },
                  { label: '2시간', h: 2, m: 0 },
                  { label: '3시간', h: 3, m: 0 },
                ].map((preset) => {
                  const isActive = estimatedHours === preset.h && estimatedMinutes === preset.m;
                  return (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => {
                        setEstimatedHours(preset.h);
                        setEstimatedMinutes(preset.m);
                      }}
                      className={`px-2.5 py-1.5 text-[10px] font-bold rounded-lg border transition-all cursor-pointer ${
                        isActive
                          ? 'bg-primary border-primary text-on-primary shadow-sm'
                          : 'bg-surface border-outline-variant text-on-surface-variant hover:bg-surface-container-high'
                      }`}
                    >
                      {preset.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* All Day Toggle */}
          <div className="flex justify-between items-center pt-2 border-t border-outline-variant/60">
            <span className="text-xs font-semibold text-on-surface">하루 종일 (All Day)</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={isAllDay}
                onChange={(e) => setIsAllDay(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-outline-variant peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>

          {/* Time Picker */}
          {!isAllDay && (
            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-outline-variant/60">
              <div className="space-y-1">
                <label className="font-mono text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">시작 시간 (Start Time)</label>
                <input 
                  type="time" 
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full bg-surface border border-outline-variant rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-primary focus:ring-1"
                />
              </div>

              <div className="space-y-1 flex flex-col justify-end">
                <label className="font-mono text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">종료 예정 시간 (End Time)</label>
                <div className="w-full bg-surface-container border border-outline-variant/60 rounded-lg px-3 py-2 text-xs font-bold text-primary flex items-center gap-1.5 h-[34px]">
                  <span>⏱️</span>
                  <span>{calculateEndTime(startTime, estimatedHours * 60 + estimatedMinutes)} 종료</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Subject Selection */}
        <div className="space-y-2">
          <label className="font-mono text-xs font-semibold text-on-surface-variant uppercase tracking-wider block">과목명 (Subject)</label>
          <div className="flex flex-wrap gap-2 items-center">
            {subjects.map((sub) => {
              const isSelected = selectedSubject === sub;
              return (
                <button
                  key={sub}
                  onClick={() => setSelectedSubject(sub)}
                  className={`px-4 py-2 rounded-full border text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                    isSelected
                      ? 'border-primary bg-primary-container text-on-primary-container'
                      : 'border-outline-variant bg-surface text-on-surface-variant hover:bg-surface-container-high'
                  }`}
                >
                  {isSelected && (
                    <CheckSquare className="w-3.5 h-3.5" />
                  )}
                  {sub}
                </button>
              );
            })}

            {isAddingSubject ? (
              <form onSubmit={handleAddSubject} className="flex gap-1 items-center bg-surface border border-outline-variant rounded-full px-2 py-1">
                <input
                  type="text"
                  autoFocus
                  required
                  placeholder="과목 추가"
                  value={newSubjectInput}
                  onChange={(e) => setNewSubjectInput(e.target.value)}
                  className="px-2 py-0.5 text-xs bg-transparent border-none outline-none focus:ring-0 max-w-[80px]"
                />
                <button type="submit" className="text-primary hover:text-secondary p-0.5 flex items-center justify-center">
                  <Check className="w-3.5 h-3.5" />
                </button>
                <button type="button" onClick={() => setIsAddingSubject(false)} className="text-on-surface-variant hover:text-error p-0.5 flex items-center justify-center">
                  <X className="w-3.5 h-3.5" />
                </button>
              </form>
            ) : (
              <button 
                onClick={() => setIsAddingSubject(true)}
                className="px-3 py-2 rounded-full border border-outline-variant bg-surface text-on-surface-variant hover:bg-surface-container-high cursor-pointer flex items-center justify-center"
              >
                <Plus className="w-3.5 h-3.5 font-bold" />
              </button>
            )}
          </div>
        </div>

        {/* Notes (Post-it style) */}
        <div className="space-y-1 pt-2">
          <label className="font-mono text-xs font-semibold text-on-surface-variant uppercase tracking-wider block">Notes</label>
          <div className="relative group overflow-hidden rounded-lg">
            <textarea 
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full h-32 bg-[#FEF9C3] p-5 text-xs post-it-shadow border-none rounded-sm resize-none text-on-tertiary-fixed-variant focus:ring-0 placeholder-on-tertiary-fixed-variant/40" 
              placeholder="학습 목표나 기억해야 할 점을 적어주세요."
              style={{ clipPath: "polygon(0 0, 100% 0, 100% 90%, 90% 100%, 0 100%)" }}
            />
            <div className="absolute bottom-0 right-0 w-8 h-8 bg-[#FDE68A] pointer-events-none" style={{ clipPath: "polygon(0 0, 0 100%, 100% 100%)" }} />
          </div>
        </div>

        {/* Templates selector */}
        <div className="space-y-2 pt-2">
          <label className="font-mono text-xs font-semibold text-on-surface-variant uppercase tracking-wider block">자주 쓰는 템플릿 불러오기</label>
          <div className="grid grid-cols-2 gap-2">
            {templates.map((template, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleLoadTemplate(template)}
                className="p-3 bg-surface border border-outline-variant rounded-xl text-left hover:bg-surface-container transition-all active:scale-[0.99] cursor-pointer"
              >
                <p className="text-xs font-bold text-primary truncate">{template.title}</p>
                <p className="text-[10px] text-on-surface-variant mt-1">과목: {template.subject} | 시간: {template.startTime}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Visual Asset (Desktop Desk & Quote) */}
        <div className="pt-2">
          <div className="relative h-24 rounded-2xl overflow-hidden border border-outline-variant shadow-sm bg-surface-container">
            <img 
              alt="Study desk" 
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover grayscale opacity-20" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuA_IrzeM-qZTrSLbdwuBUJNbNWot67H0ew0bVihm5c0zUXTfQrmcgzttgYttUOIVHHnn6N9VmG3vSLsznM19j_hAkPEh86I6FI4XiuL6HwBeI12obHlJy6-WC1gGl5yW8dsYgCc1Jz5Wb2dX5HjfvUf3CPZSgmR1StWTd9hjZEgmwiUxK0y9qAdU8acmww3CJtJ5w4A5UhdYxk7zKT1QowQa6DyAkIyGvH49YZU1F1YIZkbGJXjD8-KwxnfHvyR5ovVfrpNDwayyTQ" 
            />
            <div className="absolute inset-0 bg-gradient-to-r from-primary-container/10 to-transparent flex items-center px-6">
              <div className="flex flex-col">
                <p className="text-primary text-sm md:text-base font-bold italic opacity-80">
                  "{quotesData.find(q => q.name === settings.quoteCategory)?.quote || '오늘도 화이팅입니다.'}"
                </p>
                <p className="text-primary text-xs font-semibold opacity-70 mt-1">
                  - {quotesData.find(q => q.name === settings.quoteCategory)?.name || settings.quoteCategory}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
