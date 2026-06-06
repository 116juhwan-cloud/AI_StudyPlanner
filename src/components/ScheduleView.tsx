import React, { useState } from 'react';
import { Task } from '../types';
import { ArrowLeft, Calendar, CheckSquare, Plus, Check, X } from 'lucide-react';

interface ScheduleViewProps {
  onAddTask: (task: Omit<Task, 'id'>) => void;
  onNavigateBack: () => void;
}

export default function ScheduleView({ onAddTask, onNavigateBack }: ScheduleViewProps) {
  const [title, setTitle] = useState('');
  const [isAllDay, setIsAllDay] = useState(false);
  
  const [startDate, setStartDate] = useState('2023-11-24');
  const [startTime, setStartTime] = useState('09:00');
  const [endDate, setEndDate] = useState('2023-11-24');
  const [endTime, setEndTime] = useState('11:00');

  const [subjects, setSubjects] = useState<string[]>(['수학', '과학', '영어', '경제학']);
  const [selectedSubject, setSelectedSubject] = useState('수학');
  const [notes, setNotes] = useState('');

  const [newSubjectInput, setNewSubjectInput] = useState('');
  const [isAddingSubject, setIsAddingSubject] = useState(false);

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
      alert('일정 제목을 입력해 주세요.');
      return;
    }

    onAddTask({
      title: title.trim(),
      isAllDay,
      startDate,
      startTime: isAllDay ? '00:00' : startTime,
      endDate,
      endTime: isAllDay ? '23:59' : endTime,
      subject: selectedSubject,
      notes: notes.trim(),
      focusLevel: Math.random() > 0.4 ? 'Main' : 'Focus'
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
    setEndTime(template.endTime);
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
        {/* Title Input */}
        <div className="space-y-1">
          <label className="font-mono text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Title</label>
          <input 
            type="text" 
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-surface border border-outline-variant rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder-on-surface-variant/40" 
            placeholder="어떤 공부를 계획 중인가요?"
          />
        </div>

        {/* All Day Toggle */}
        <div className="flex justify-between items-center bg-surface-container-low p-4 rounded-xl border border-outline-variant">
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-primary" />
            <span className="text-sm font-semibold text-on-surface">하루 종일</span>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              checked={isAllDay}
              onChange={(e) => setIsAllDay(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-outline-variant peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
          </label>
        </div>

        {/* Date & Time Picker */}
        <div className={`space-y-4 transition-opacity duration-200 ${isAllDay ? 'opacity-40 pointer-events-none' : 'opacity-100'}`}>
          <div className="grid grid-cols-2 gap-4">
            {/* Start Field */}
            <div className="space-y-1">
              <label className="font-mono text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Start</label>
              <div className="flex flex-col gap-2">
                <input 
                  type="date" 
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full bg-surface border border-outline-variant rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-primary focus:ring-1"
                />
                <input 
                  type="time" 
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full bg-surface border border-outline-variant rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-primary focus:ring-1"
                />
              </div>
            </div>

            {/* End Field */}
            <div className="space-y-1">
              <label className="font-mono text-xs font-semibold text-on-surface-variant uppercase tracking-wider">End</label>
              <div className="flex flex-col gap-2">
                <input 
                  type="date" 
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full bg-surface border border-outline-variant rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-primary focus:ring-1"
                />
                <input 
                  type="time" 
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full bg-surface border border-outline-variant rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-primary focus:ring-1"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Subject Selection */}
        <div className="space-y-2">
          <label className="font-mono text-xs font-semibold text-on-surface-variant uppercase tracking-wider block">Subject</label>
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
              <p className="text-primary text-base md:text-lg font-bold italic opacity-80 select-none">
                "Focus on the process, not just the result."
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
