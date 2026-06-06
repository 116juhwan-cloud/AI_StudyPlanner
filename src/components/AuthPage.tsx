import React, { useState } from 'react';

interface AuthPageProps {
  onLoginSuccess: (email: string, name: string, avatarUrl: string) => void;
}

export default function AuthPage({ onLoginSuccess }: AuthPageProps) {
  const [email, setEmail] = useState('study_pro@example.com');
  const [password, setPassword] = useState('password123');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMessage('이메일과 비밀번호를 모두 입력해 주세요.');
      return;
    }
    setErrorMessage('');
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      // login successful
      onLoginSuccess(email, '김준수', 'https://lh3.googleusercontent.com/aida-public/AB6AXuASxydMcg-lxBqL7QebqWtSoESpJbZskOUVu5izcGymOSU6OPePV2Tl4LD4i404uU5bEVBwcSaLoNZUpK3iZqgGA8DeZXcN7eO_ta6Ksgwvsq8JV7uk_VB1a5T_EPpBI3GSVfvvN1TbIWGmqK7GKyzM9CzRddbLT5wR1a1m0JgFKjqAGKZ1_SVv5Z0vy78PfTKO01k88sc6GvZgScDzoqdtT-RlnhiTsklc2LgxHHstCq40ZA0SiJsXCddR_3j1dPoGF_JXBM1_WOc');
    }, 800);
  };

  const handleSocialLogin = (provider: string, defaultName: string) => {
    setIsLoading(true);
    setErrorMessage('');
    setTimeout(() => {
      setIsLoading(false);
      onLoginSuccess(
        `${provider.toLowerCase()}_user@studywise.com`, 
        defaultName, 
        'https://lh3.googleusercontent.com/aida-public/AB6AXuASxydMcg-lxBqL7QebqWtSoESpJbZskOUVu5izcGymOSU6OPePV2Tl4LD4i404uU5bEVBwcSaLoNZUpK3iZqgGA8DeZXcN7eO_ta6Ksgwvsq8JV7uk_VB1a5T_EPpBI3GSVfvvN1TbIWGmqK7GKyzM9CzRddbLT5wR1a1m0JgFKjqAGKZ1_SVv5Z0vy78PfTKO01k88sc6GvZgScDzoqdtT-RlnhiTsklc2LgxHHstCq40ZA0SiJsXCddR_3j1dPoGF_JXBM1_WOc'
      );
    }, 600);
  };

  return (
    <div className="min-h-screen bg-surface font-body-md text-on-surface flex flex-col items-center justify-center px-4 md:px-0 relative overflow-hidden">
      {/* Background blobs decor */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary-fixed opacity-20 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-secondary-fixed opacity-25 blur-[120px] rounded-full pointer-events-none"></div>

      <main className="w-full max-w-[440px] flex flex-col items-center z-10">
        {/* Header Section */}
        <header className="text-center mb-6 animate-fade-in">
          <h1 className="font-headline-lg text-4xl font-bold text-primary mb-1 tracking-tight">
            StudyWise
          </h1>
          <p className="font-body-lg text-lg text-on-surface-variant text-center">
            오늘도 집중할 준비 되셨나요?
          </p>
        </header>

        {/* Main Auth Card */}
        <section className="w-full bg-surface-container-lowest rounded-2xl p-8 flex flex-col gap-6 shadow-[0px_4px_20px_rgba(26,54,93,0.05)] border border-outline-variant">
          {errorMessage && (
            <div className="p-3 text-sm bg-error-container text-on-error-container rounded-lg border border-error/10">
              {errorMessage}
            </div>
          )}

          {/* Social Login Cluster */}
          <div className="flex flex-col gap-3">
            <button 
              onClick={() => handleSocialLogin('Kakao', '김준수')}
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-lg bg-[#FEE500] text-[#191919] font-button text-sm font-semibold flex items-center justify-center gap-2 transition-all hover:opacity-90 active:scale-[0.98] cursor-pointer"
            >
              <span className="material-symbols-text font-variation-fill text-lg">chat_bubble</span>
              카카오로 로그인
            </button>
            <button 
              onClick={() => handleSocialLogin('Google', '김준수')}
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-lg bg-surface-container-lowest border border-outline-variant text-on-surface font-button text-sm font-semibold flex items-center justify-center gap-2 transition-all hover:bg-surface-container-low active:scale-[0.98] cursor-pointer"
            >
              <img 
                alt="Google" 
                className="w-5 h-5 object-contain" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAsblzU_uDIkdWdB7vdZCYvm5uJa1vkA7Gk1TdDWql2IBOw0we_Ed3_FqjNf53DGodsw7ObQ1IzBcm-df_xPpxePChj_wb79LMuka0fuDe6GmARwPvaxHPO46DD2qd2biswJU5Xr79r0UZj0v-wARjN1mq6rwTVFIkoJYOkecwKFO1D8Mhf5w_wh4XVoJsizAYlnUTiwBy0Rv-Aqvp7DKystTyRXRo-mSRjfMro3E_fVqs_OYp9encuF0JjzexFXnyPqfeZcEjFLCM" 
              />
              Google로 로그인
            </button>
            <button 
              onClick={() => handleSocialLogin('Naver', '김준수')}
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-lg bg-[#03C75A] text-white font-button text-sm font-semibold flex items-center justify-center gap-2 transition-all hover:opacity-90 active:scale-[0.98] cursor-pointer"
            >
              <span className="material-symbols-text font-variation-fill text-lg">eco</span>
              네이버로 로그인
            </button>
          </div>

          {/* Divider */}
          <div className="relative flex items-center py-2">
            <div className="flex-grow border-t border-outline-variant"></div>
            <span className="flex-shrink mx-4 text-on-surface-variant font-mono text-[11px] font-semibold uppercase tracking-wider">
              또는 이메일로 로그인
            </span>
            <div className="flex-grow border-t border-outline-variant"></div>
          </div>

          {/* Email Form */}
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold font-mono text-on-surface-variant ml-1" htmlFor="email">이메일</label>
              <input 
                id="email"
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-outline-variant bg-surface-container-low text-on-surface text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all" 
                placeholder="example@studywise.com"
              />
            </div>
            
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold font-mono text-on-surface-variant ml-1" htmlFor="password">비밀번호</label>
              <input 
                id="password"
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-outline-variant bg-surface-container-low text-on-surface text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all" 
                placeholder="••••••••"
              />
            </div>

            {/* Action Button */}
            <button 
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-4 rounded-lg bg-primary text-on-primary font-button text-sm font-semibold shadow-md hover:opacity-95 active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <span className="material-symbols-text animate-spin text-lg">progress_activity</span>
                  로그인 중...
                </>
              ) : (
                '로그인'
              )}
            </button>
          </form>
        </section>

        {/* Footer Section */}
        <footer className="mt-8 flex flex-col items-center gap-3 w-full text-sm">
          <div className="flex items-center gap-4 text-on-surface-variant">
            <button className="hover:text-primary transition-colors hover:underline underline-offset-4 cursor-pointer">
              비밀번호 찾기
            </button>
            <span className="w-px h-3 bg-outline-variant"></span>
            <button className="hover:text-primary font-semibold transition-colors hover:underline underline-offset-4 cursor-pointer">
              이메일로 시작하기 (가입)
            </button>
          </div>
          <p className="font-mono text-[11px] text-on-tertiary-container uppercase tracking-wider mt-4">
            © {new Date().getFullYear()} STUDYWISE INC.
          </p>
        </footer>
      </main>
    </div>
  );
}
