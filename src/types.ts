export interface Task {
  id: string;
  title: string;
  isAllDay: boolean;
  startDate: string; // "YYYY-MM-DD"
  startTime: string; // "HH:MM"
  endDate: string; // "YYYY-MM-DD"
  endTime: string; // "HH:MM"
  subject: string; // e.g. "수학", "과학", "영어", "경제학", etc.
  notes: string;
  focusLevel?: 'Main' | 'Focus'; // Main: ordinary task, Focus: intense deep work
  estimatedTime?: number; // Estimated duration in minutes
  isCompleted: boolean;
}

export interface UserProfile {
  name: string;
  email: string;
  avatarUrl: string;
  membership: string;
}

export interface AppSettings {
  pushNotifications: boolean;
  doNotDisturb: boolean;
  quoteCategory: string; // "동기부여" | "열정" | "계획성" | "지혜"
  aiPersona: '잔소리쟁이' | '칭찬 기계' | '차분한 조력자';
  theme: 'light' | 'dark';
}
