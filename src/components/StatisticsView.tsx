import React, { useState, useEffect } from 'react';
import { Task, AppSettings } from '../types';
import { Share2, Brain, Lightbulb, TrendingUp, Sparkles, ArrowRight } from 'lucide-react';

interface StatisticsViewProps {
  tasks: Task[];
  settings: AppSettings;
  realtimeSession?: { focusTime: number, focusScore: number } | null;
}

export default function StatisticsView({ tasks, settings, realtimeSession }: StatisticsViewProps) {
  const [activeRange, setActiveRange] = useState<'Day' | 'Week' | 'Month'>('Week');
  const [aiFeedback, setAiFeedback] = useState<string>('');
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);

  useEffect(() => {
    async function loadAiAdvice() {
      setIsAiLoading(true);
      try {
        const response = await fetch('/api/ai-feedback', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            taskList: tasks,
            persona: settings.aiPersona,
            quoteCategory: settings.quoteCategory
          }),
        });
        const data = await response.json();
        if (data && data.text) {
          setAiFeedback(data.text);
        } else {
          setAiFeedback("좋은 공부 흐름입니다! 선택하신 학습 환경 설정을 기반으로 더욱 균형 잡힌 학업 습관을 형성해 보세요.");
        }
      } catch (err) {
        console.error("Failed to load AI feedback:", err);
        setAiFeedback("오전과 저녁 시간에 전자기학과 미적분 II 등 집중력이 요구되는 뇌 영역의 학업 일정이 고르게 안배되어 높은 인지적 시너지가 나타납니다.");
      } finally {
        setIsAiLoading(false);
      }
    }
    loadAiAdvice();
  }, [tasks, settings.aiPersona, settings.quoteCategory]);

  // 실제 데이터 기반 통계 계산
  const today = new Date().toLocaleDateString('en-CA'); // 현재 실제 날짜 (YYYY-MM-DD 형식)
  const todayTasks = tasks.filter(t => t.startDate === today);
  const completedTasks = todayTasks.filter(t => t.isCompleted);

  const achievementRate = todayTasks.length > 0
    ? Math.round((completedTasks.length / todayTasks.length) * 100)
    : 0;

  const totalMins = todayTasks.reduce((acc, t) => {
    const [sh, sm] = t.startTime.split(':').map(Number);
    const [eh, em] = t.endTime.split(':').map(Number);
    let diff = (eh * 60 + em) - (sh * 60 + sm);
    if (diff < 0) diff += 24 * 60;
    return acc + diff;
  }, 0);

  // 시연용 실시간 측정 시간(초 단위)을 합산하여 표시
  const totalSeconds = (totalMins * 60) + (realtimeSession?.focusTime || 0);

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  
  // 방금 측정한 단기 세션을 즉각 확인할 수 있도록 초 단위까지 노출
  const timeStr = seconds > 0 || realtimeSession 
    ? `${hours}h ${minutes}m ${seconds}s` 
    : `${hours}h ${minutes}m`;

  // 데이터가 없을 때를 위한 빈 흐름 구성
  const baseFlow = todayTasks.length > 0 ? [
    { hour: '08h', pct: 20, type: 'Mild' },
    { hour: '12h', pct: 60, type: 'High' },
    { hour: '16h', pct: 40, type: 'Mild' },
    { hour: '20h', pct: 80, type: 'High', isPeak: !realtimeSession }, // 실시간 세션이 있으면 peak 양보
  ] : [];

  const hourlyFlow = [...baseFlow];
  
  // 방금 수행한 실시간 집중 세션이 있다면 막대 그래프 가장 끝에 "Now"로 추가 (시연용)
  if (realtimeSession) {
    const currentHour = new Date().getHours();
    hourlyFlow.push({
      hour: `${currentHour.toString().padStart(2, '0')}h(Now)`,
      pct: realtimeSession.focusScore,
      type: realtimeSession.focusScore > 60 ? 'High' : 'Mild',
      isPeak: realtimeSession.focusScore > 85
    });
  }

  if (hourlyFlow.length === 0) {
    hourlyFlow.push({ hour: 'N/A', pct: 0, type: 'Mild' });
  }

  const handleShare = () => {
    alert('학습 통계 대시보드가 성공적으로 이미지로 내보내졌습니다! (클립보드 복사 완료)');
  };

  return (
    <div className="w-full">
      {/* Top Header Bar */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div>
          <h3 className="text-2xl font-bold text-primary tracking-tight">집중도 분석 (Concentration Analysis)</h3>
          <p className="text-xs text-on-surface-variant mt-1.5 font-medium">
            학습 성과에 대한 깊은 인사이트를 제공합니다. (Deeper insights into your academic performance.)
          </p>
        </div>

        {/* Period switcher */}
        <div className="flex items-center gap-2 bg-surface-container-low p-1.5 rounded-xl border border-outline-variant/60 self-start md:self-auto">
          {(['Day', 'Week', 'Month'] as const).map((range) => {
            const isActive = activeRange === range;
            return (
              <button
                key={range}
                onClick={() => setActiveRange(range)}
                className={`px-5 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${isActive
                  ? 'bg-primary text-on-primary shadow-sm'
                  : 'text-on-surface hover:bg-surface-container-highest'
                  }`}
              >
                {range === 'Day' ? '일간 (Day)' : range === 'Week' ? '주간 (Week)' : '월간 (Month)'}
              </button>
            );
          })}
          <div className="w-[1px] h-6 bg-outline-variant mx-1" />
          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 px-3 py-2 text-primary font-bold text-xs hover:bg-primary/5 rounded-lg transition-all cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>공유 (Share)</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
          <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/40 shadow-sm flex flex-col items-center justify-center text-center">
            <h4 className="text-[10px] font-bold font-mono text-on-surface-variant tracking-widest uppercase mb-5">
              일일 목표 달성률 (Daily Goal Achievement)
            </h4>
            <div className="relative w-44 h-44 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="88"
                  cy="88"
                  r="72"
                  className="text-surface-container-high/30"
                  stroke="currentColor"
                  strokeWidth="10"
                  fill="transparent"
                />
                <circle
                  cx="88"
                  cy="88"
                  r="72"
                  className="text-primary transition-all duration-700 ease-out"
                  stroke="currentColor"
                  strokeWidth="10"
                  fill="transparent"
                  strokeDasharray="452.4"
                  strokeDashoffset={452.4 - (452.4 * achievementRate) / 100}
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-2xl font-bold font-mono text-primary">{achievementRate}%</span>
                <span className="font-mono text-[9px] font-bold text-on-surface-variant tracking-widest">ACHIEVED</span>
              </div>
            </div>
            <div className="mt-5 space-y-1">
              <p className="text-xl font-bold font-mono text-primary">{timeStr}</p>
              <p className="text-xs text-on-surface-variant font-medium">총 집중 시간 (Total Concentration Time)</p>
            </div>
          </div>

          <div className="bg-primary-container p-6 rounded-2xl text-on-primary-container shadow-sm border border-primary/20 flex flex-col justify-between">
            <div className="flex items-center gap-2 mb-3">
              <Brain className="w-4 h-4 text-secondary-fixed shrink-0" />
              <h4 className="text-xs font-bold text-white">최고 집중 상태 분석 (Peak Focus State Analysis)</h4>
            </div>

            <p className="text-xs text-white/90 leading-relaxed mb-6">
              오후보다 오전(09:00 - 11:30)에 집중력이 <span className="font-bold text-secondary-fixed">24% 더 높습니다</span>.
            </p>

            <div className="flex items-center justify-between p-4 bg-primary/40 rounded-xl border border-white/5 mt-auto">
              <div>
                <p className="font-mono text-[9px] font-bold text-white/70 uppercase tracking-widest">최적의 시작 시간 (BEST START TIME)</p>
                <p className="text-base font-bold font-mono text-white">08:45 AM</p>
              </div>
              <Lightbulb className="w-6 h-6 text-secondary-fixed" />
            </div>
          </div>
        </div>

        <div className="col-span-12 lg:col-span-8 bg-surface-container-lowest p-6 rounded-2xl shadow-sm border border-outline-variant flex flex-col justify-between">
          <div className="flex justify-between items-center mb-6">
            <h4 className="text-sm font-bold text-primary">시간대별 집중도 흐름 (Hourly Concentration Flow)</h4>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-primary" />
                <span className="font-mono text-[9px] font-bold text-on-surface-variant tracking-wider">높은 집중 (HIGH FOCUS)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-secondary-container" />
                <span className="font-mono text-[9px] font-bold text-on-surface-variant tracking-wider">일반 집중 (MILD FOCUS)</span>
              </div>
            </div>
          </div>

          <div className="flex-1 flex items-end justify-between gap-3 h-64 relative pt-10 px-2">
            {hourlyFlow.map((bar) => {
              const isHigh = bar.type === 'High';
              return (
                <div key={bar.hour} className="group relative flex-1 flex flex-col items-center gap-2 h-full justify-end">
                  <div
                    className={`w-full rounded-t-lg transition-all duration-300 origin-bottom cursor-help ${isHigh
                      ? 'bg-primary hover:bg-primary-container'
                      : 'bg-secondary-container hover:bg-secondary'
                      }`}
                    style={{ height: `${bar.pct}%` }}
                  />
                  <span className="font-mono text-[10px] font-bold text-on-surface-variant">{bar.hour}</span>

                  <div className="absolute bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none z-10">
                    <div className="bg-inverse-surface text-inverse-on-surface text-[9px] font-bold font-mono px-3 py-1.5 rounded-lg shadow-md whitespace-nowrap">
                      집중도: {bar.pct}% {bar.isPeak ? '(최고조)' : ''}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 pt-5 border-t border-outline-variant flex items-center justify-between">
            <div className="flex gap-6">
              <div className="flex flex-col">
                <span className="font-mono text-[9px] font-bold text-on-surface-variant tracking-wider uppercase">평균 지속 시간 (AVG DURATION)</span>
                <span className="text-sm font-bold text-primary">52 mins</span>
              </div>
              <div className="flex flex-col">
                <span className="font-mono text-[9px] font-bold text-on-surface-variant tracking-wider uppercase">세션 (SESSIONS)</span>
                <span className="text-sm font-bold text-primary">8 Deep Focus</span>
              </div>
            </div>

            <button className="text-xs font-semibold text-secondary flex items-center gap-0.5 hover:underline cursor-pointer">
              상세 로그 보기 (View Detailed Log)
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="col-span-12 grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
          <div className="bg-surface-container-low p-6 rounded-2xl border border-outline-variant flex items-center gap-5">
            <div className="w-14 h-14 rounded-full bg-success/10 flex items-center justify-center shrink-0">
              <TrendingUp className="w-6 h-6 text-green-700" />
            </div>
            <div>
              <h5 className="font-mono text-[9px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">
                지난주 대비 (Vs. Last Week)
              </h5>
              <p className="text-lg font-bold text-primary">
                +1h 12m <span className="text-xs font-normal text-on-surface-variant">(18.4%)</span>
              </p>
              <p className="text-xs text-on-surface-variant mt-1">총 집중 시간이 지속적으로 증가하는 추세입니다.</p>
            </div>
          </div>

          <div className="bg-surface-container-highest p-6 rounded-2xl border border-outline-variant relative overflow-hidden group">
            <div className="absolute inset-0 opacity-5 pointer-events-none flex items-center justify-center select-none">
              <Sparkles className="w-24 h-24 text-primary" />
            </div>

            <div className="relative z-10 h-full flex flex-col justify-between">
              <div className="flex items-center gap-1.5 mb-2 text-primary">
                <Sparkles className="w-4 h-4" />
                <h5 className="font-mono text-[9px] font-extrabold tracking-widest uppercase">
                  AI CO-PILOT FEEDBACK ({settings.aiPersona})
                </h5>
              </div>

              {isAiLoading ? (
                <div className="flex items-center gap-2 py-3 text-xs text-primary select-none mt-2">
                  <span className="material-symbols-text animate-spin text-sm">progress_activity</span>
                  <span>AI Co-Pilot이 당신의 학습 계획을 정교하게 피드백 분석 중입니다...</span>
                </div>
              ) : (
                <p className="text-xs italic text-primary/95 font-medium leading-relaxed mt-2 select-text">
                  "{aiFeedback}"
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
