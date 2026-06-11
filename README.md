# 📚 StudyWise (AI Study Planner)



## 🌟 프로젝트 소개 (Why this project?)

기존의 단순한 스터디 플래너의 한계를 넘어, **AI 기술과 실시간 트래킹을 결합한 완벽한 학습 파트너**를 만들기 위해 시작된 프로젝트입니다. 
단순히 일정을 기록하는 것을 넘어서, 사용자의 집중도를 실시간으로 파악하고, Google Gemini AI를 활용해 때로는 따뜻한 위로를, 때로는 뼈 때리는 '매운맛 잔소리'를 제공하여 목표 달성을 끝까지 돕습니다. 

나태해질 틈을 주지 않는 진정한 스마트 스터디 플래너를 경험해보세요!

---

## ✨ 주요 기능 (Features)

- 🤖 **AI 코치 및 잔소리 시스템**: 다정함부터 '매운맛 잔소리'까지! 설정한 페르소나에 맞춰 Gemini AI가 맞춤형 동기부여와 피드백을 제공합니다.
- 👁️ **실시간 안면 인식 집중도 트래커 (Face Mesh Tracker)**: 웹캠을 통해 사용자의 집중도를 실시간으로 분석하고, 딴짓을 감지하면 AI 코치가 즉시 개입합니다.
- 📅 **직관적인 스마트 스케줄링**: 타임라인 뷰와 캘린더 뷰를 오가며 드래그 앤 드롭 수준의 편리한 학습 일정 관리가 가능합니다.
- 📊 **통계 및 학습 분석 시각화**: 누적 학습 시간, 목표 달성률 등을 시각적인 차트로 제공하여 성취감을 극대화합니다.
- 🎨 **개인화된 테마 및 설정**: 다크 모드/라이트 모드 지원 및 알림, AI 페르소나 등을 자유롭게 커스텀할 수 있습니다.

---

## 📂 디렉토리 구조 (Directory Structure)

```text
Rebuild_Study_Planner/
├── api-router.ts        # Express API 라우터 (백엔드 로직 및 AI 연동)
├── server.ts            # Express 서버 진입점 (Vite 미들웨어 및 정적 파일 제공)
├── package.json         # 프로젝트 의존성 및 스크립트 관리
├── .env.example         # 환경 변수 템플릿
└── src/                 # React 프론트엔드 소스 코드
    ├── App.tsx          # 메인 애플리케이션 컴포넌트 및 라우팅 상태 관리
    ├── main.tsx         # React 앱 진입점
    ├── types.ts         # TypeScript 타입 정의 (Task, UserProfile 등)
    ├── index.css        # Tailwind CSS 글로벌 스타일시트
    ├── components/      # UI 컴포넌트 폴더
    │   ├── AiCoachPopup.tsx    # AI 코치 및 잔소리 팝업
    │   ├── CalendarView.tsx    # 달력 기반 스케줄 뷰
    │   ├── FaceMeshTracker.tsx # 안면 인식 집중도 분석기
    │   ├── ScheduleView.tsx    # 개별 일정 추가/수정 뷰
    │   ├── SettingsView.tsx    # 환경 설정 (다크모드, 페르소나 설정 등)
    │   ├── Sidebar.tsx         # 내비게이션 사이드바
    │   ├── StatisticsView.tsx  # 학습 통계 차트
    │   └── TimelineView.tsx    # 타임라인 기반 스케줄 뷰
    └── data/            # 초기 더미 데이터 및 Mock 업
```

---

## 🛠 기술 스택 (Tech Stack)

**Frontend:**
- React 19
- TypeScript
- Tailwind CSS 4 & Motion (애니메이션)
- Recharts (통계 시각화)
- Vite (빌드툴)

**Backend & AI:**
- Node.js & Express (API 서버)
- `@google/genai` (Google Gemini AI 모델 연동)
- Face Mesh Tracking (집중도 분석)

---

## 🚀 실행 방법 (How to Run)

### 필수 조건 (Prerequisites)
- [Node.js](https://nodejs.org/) (v18 이상 권장)
- [Google Gemini API Key](https://aistudio.google.com/app/apikey)

### 1. 패키지 설치
```bash
npm install
```

### 2. 환경변수 설정
프로젝트 루트 디렉토리에 `.env` 파일을 생성하고 발급받은 Gemini API 키를 입력합니다.
(`.env.example` 파일을 참고하세요.)
```env
GEMINI_API_KEY="본인의_GEMINI_API_KEY_입력"
```

### 3. 로컬 개발 서버 실행
```bash
npm run dev
```
명령어 실행 후, 브라우저에서 `http://localhost:3000` (또는 터미널에 표시된 포트)로 접속하여 앱을 확인할 수 있습니다.

### 4. 프로덕션 빌드 및 실행 (선택)
```bash
npm run build   # 프론트엔드 및 백엔드 빌드
npm run start   # 빌드된 프로덕션 서버 실행
```
