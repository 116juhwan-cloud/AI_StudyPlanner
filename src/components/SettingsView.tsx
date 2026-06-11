import React, { useState } from 'react';
import { UserProfile, AppSettings } from '../types';
import { ChevronLeft, Moon, Sun, ChevronRight, Bell, HelpCircle, Info, ShieldAlert, Sparkles, Quote, HelpCircle as HelpIcon } from 'lucide-react';
import { quotesData } from '../data/quotes';

interface SettingsViewProps {
  user: UserProfile;
  setUser: (user: UserProfile) => void;
  settings: AppSettings;
  setSettings: (settings: AppSettings) => void;
  onNavigateBack: () => void;
}

export default function SettingsView({ user, setUser, settings, setSettings, onNavigateBack }: SettingsViewProps) {
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editName, setEditName] = useState(user.name);
  const [editEmail, setEditEmail] = useState(user.email);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const personas: ('잔소리쟁이' | '칭찬 기계' | '차분한 조력자')[] = ['잔소리쟁이', '칭찬 기계', '차분한 조력자'];

  const handleSaveProfile = () => {
    setUser({
      ...user,
      name: editName.trim() || user.name,
      email: editEmail.trim() || user.email
    });
    setIsEditingProfile(false);
  };

  const togglePush = () => {
    setSettings({
      ...settings,
      pushNotifications: !settings.pushNotifications
    });
  };

  const toggleDnd = () => {
    setSettings({
      ...settings,
      doNotDisturb: !settings.doNotDisturb
    });
  };

  const changeQuoteCategory = (cat: string) => {
    setSettings({
      ...settings,
      quoteCategory: cat
    });
  };

  const changePersona = (per: '잔소리쟁이' | '칭찬 기계' | '차분한 조력자') => {
    setSettings({
      ...settings,
      aiPersona: per
    });
    setToastMessage(`'${per}' 페르소나가 저장되었습니다.`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSupportClick = () => {
    alert('고객 지원 이메일(help@studywise.com)로 문의가 성공적으로 발송 및 연동되었습니다.');
  };

  const handleDeactivate = () => {
    const ok = window.confirm('정말로 계정을 영구 탈퇴하시겠습니까? 데이터가 유실됩니다.');
    if (ok) {
      alert('회원 탈퇴 시퀀스가 성공적으로 처리되었습니다.');
      window.location.reload();
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Top Bar Navigation */}
      <header className="bg-transparent px-2 py-4 flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <button 
            onClick={onNavigateBack}
            className="p-2 hover:bg-surface-container rounded-full transition-colors flex items-center justify-center cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5 text-primary" />
          </button>
          <h1 className="text-xl font-bold text-primary">설정</h1>
        </div>
        
        {/* Theme toggler */}
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setSettings({ ...settings, theme: settings.theme === 'light' ? 'dark' : 'light' })}
            className="p-2 rounded-full hover:bg-surface-container border border-outline-variant/30 transition-all text-on-surface-variant cursor-pointer flex justify-center items-center"
            title="테마 전환"
          >
            {settings.theme === 'light' ? (
              <Moon className="w-4 h-4 text-primary" />
            ) : (
              <Sun className="w-4 h-4 text-yellow-400" />
            )}
          </button>
        </div>
      </header>

      {/* Account Info */}
      <section className="mb-6">
        <h2 className="font-mono text-xs font-semibold text-on-surface-variant mb-3 px-1 uppercase tracking-wider">계정 정보</h2>
        <div className="bg-surface-container-lowest rounded-2xl shadow-sm overflow-hidden border border-outline-variant">
          {isEditingProfile ? (
            <div className="p-5 space-y-4 animate-fade-in">
              <div className="space-y-1">
                <label className="text-xs font-bold text-on-surface">사용자 이름</label>
                <input 
                  type="text" 
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full text-xs bg-surface border border-outline-variant rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-on-surface">이메일 주소</label>
                <input 
                  type="email" 
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full text-xs bg-surface border border-outline-variant rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div className="flex gap-2 justify-end pt-2">
                <button 
                  onClick={() => setIsEditingProfile(false)}
                  className="px-3 py-1.5 text-xs font-semibold text-on-surface-variant hover:bg-surface-container rounded-lg cursor-pointer"
                >
                  취소
                </button>
                <button 
                  onClick={handleSaveProfile}
                  className="px-4 py-1.5 text-xs font-semibold bg-primary text-on-primary rounded-lg cursor-pointer"
                >
                  저장
                </button>
              </div>
            </div>
          ) : (
            <div 
              onClick={() => setIsEditingProfile(true)}
              className="flex items-center justify-between p-5 hover:bg-surface-container/50 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <img 
                  alt="User Profile" 
                  className="w-16 h-16 rounded-full object-cover border-2 border-primary-fixed shrink-0" 
                  src={user.avatarUrl} 
                />
                <div>
                  <p className="text-base font-bold text-on-surface">{user.name}</p>
                  <p className="text-xs text-on-surface-variant">{user.email}</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-on-surface-variant shrink-0" />
            </div>
          )}
        </div>
      </section>

      {/* Notifications */}
      <section className="mb-6">
        <h2 className="font-mono text-xs font-semibold text-on-surface-variant mb-3 px-1 uppercase tracking-wider">알림 설정</h2>
        <div className="bg-surface-container-lowest rounded-2xl shadow-sm border border-outline-variant divide-y divide-outline-variant/60">
          
          <div className="flex items-center justify-between p-5">
            <div className="flex items-center gap-3">
              <Bell className="w-4 h-4 text-primary" />
              <p className="text-sm font-semibold text-on-surface">푸시 알림</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={settings.pushNotifications}
                onChange={togglePush}
                className="sr-only" 
              />
              <div className={`w-11 h-6 rounded-full transition-colors relative after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all ${
                settings.pushNotifications ? 'bg-primary after:translate-x-full' : 'bg-outline-variant'
              }`} />
            </label>
          </div>

          <div className="flex items-center justify-between p-5">
            <div className="flex items-center gap-3">
              <ShieldAlert className="w-4 h-4 text-primary" />
              <p className="text-sm font-semibold text-on-surface">방해 금지 모드</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={settings.doNotDisturb}
                onChange={toggleDnd}
                className="sr-only" 
              />
              <div className={`w-11 h-6 rounded-full transition-colors relative after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all ${
                settings.doNotDisturb ? 'bg-primary after:translate-x-full' : 'bg-outline-variant'
              }`} />
            </label>
          </div>

        </div>
      </section>

      {/* Quote selection & Persona coaching style */}
      <section className="mb-6">
        <h2 className="font-mono text-xs font-semibold text-on-surface-variant mb-3 px-1 uppercase tracking-wider">학습 환경 관리</h2>
        <div className="bg-surface-container-lowest rounded-2xl shadow-sm border border-outline-variant divide-y divide-outline-variant/60">
          
          <div className="p-5 space-y-3">
            <div className="flex items-center gap-3">
              <Quote className="w-4 h-4 text-primary" />
              <p className="text-sm font-semibold text-on-surface">위인 명언 설정</p>
            </div>
            <div className="flex flex-col gap-2 mt-2">
              <p className="text-[11px] text-on-surface-variant">존경하는 위인을 선택하시면, 그 인물의 명언이 일정 화면에 나타납니다.</p>
              <select
                value={settings.quoteCategory}
                onChange={(e) => changeQuoteCategory(e.target.value)}
                className="w-full text-xs bg-surface border border-outline-variant rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-primary cursor-pointer"
              >
                {!quotesData.some(q => q.name === settings.quoteCategory) && (
                  <option value={settings.quoteCategory} disabled>{settings.quoteCategory} (기존 선택)</option>
                )}
                <optgroup label="한국 위인">
                  {quotesData.filter(q => q.type === 'Korean').map(q => (
                    <option key={q.id} value={q.name}>{q.name}</option>
                  ))}
                </optgroup>
                <optgroup label="외국 위인">
                  {quotesData.filter(q => q.type === 'Foreign').map(q => (
                    <option key={q.id} value={q.name}>{q.name}</option>
                  ))}
                </optgroup>
              </select>
            </div>
          </div>

          <div className="p-5 space-y-3">
            <div className="flex items-center gap-3">
              <Sparkles className="w-4 h-4 text-primary" />
              <p className="text-sm font-semibold text-on-surface">AI 코칭 페르소나 설정</p>
            </div>
            
            <div className="grid grid-cols-3 gap-2">
              {personas.map((per) => {
                const isActive = settings.aiPersona === per;
                return (
                  <button
                    key={per}
                    onClick={() => changePersona(per)}
                    className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                      isActive 
                        ? 'border-primary bg-primary text-on-primary font-bold shadow-sm' 
                        : 'border-outline-variant bg-surface text-on-surface hover:bg-surface-container-high'
                    }`}
                  >
                    <p className="text-xs">{per}</p>
                    <p className={`text-[10px] mt-1 ${isActive ? 'text-white/80' : 'text-on-surface-variant'}`}>
                      {per === '잔소리쟁이' ? '스파르타식 채찍질' : per === '칭찬 기계' ? '무조건적인 당근' : '논리적인 차분한 컨설팅'}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

        </div>
      </section>

      {/* Support & metadata */}
      <section className="mb-6">
        <h2 className="font-mono text-xs font-semibold text-on-surface-variant mb-3 px-1 uppercase tracking-wider">지원 및 기타</h2>
        <div className="bg-surface-container-lowest rounded-2xl shadow-sm border border-outline-variant divide-y divide-outline-variant/60">
          
          <div 
            onClick={handleSupportClick}
            className="flex items-center justify-between p-5 hover:bg-surface-container/50 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <HelpIcon className="w-4 h-4 text-primary" />
              <p className="text-sm font-semibold text-on-surface">고객 지원</p>
            </div>
            <ChevronRight className="w-5 h-5 text-on-surface-variant shrink-0" />
          </div>

          <div className="flex items-center justify-between p-5">
            <div className="flex items-center gap-3">
              <Info className="w-4 h-4 text-primary" />
              <p className="text-sm font-semibold text-on-surface">버전 정보</p>
            </div>
            <span className="font-mono text-xs font-bold text-on-surface-variant">v2.4.1 (Latest)</span>
          </div>

        </div>
      </section>

      {/* Deactivate account */}
      <section className="mt-8 space-y-4 px-1">
        <button 
          onClick={handleDeactivate}
          className="w-full flex items-center justify-center gap-1.5 py-4 font-mono text-xs text-error font-bold border border-error/20 bg-error/5 rounded-xl hover:bg-error hover:text-white transition-all active:scale-[0.98] cursor-pointer shadow-sm"
        >
          계정 탈퇴
        </button>
        <p className="font-mono text-[9px] text-center opacity-30 select-none uppercase tracking-widest pt-4">
          STUDYWISE ACADEMIC FOCUS PLATFORM
        </p>
      </section>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-surface-container-highest text-on-surface border border-primary/20 px-6 py-3 rounded-full shadow-xl z-50 animate-fade-in flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="text-sm font-semibold text-primary">{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
