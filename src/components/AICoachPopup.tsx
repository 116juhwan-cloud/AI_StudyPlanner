import React from 'react';
import { Settings, Flame, Heart, Coffee, X } from 'lucide-react';

interface AiCoachPopupProps {
    persona: '잔소리쟁이' | '칭찬기계' | '차분한 조력자';
    onClose: () => void;
}

export default function AiCoachPopup({ persona, onClose }: AiCoachPopupProps) {
    // 페르소나별 멘트와 디자인 설정
    const personaData = {
        '잔소리쟁이': {
            icon: <Flame className="w-16 h-16 text-rose-500 animate-bounce" />,
            title: '🚨 정신 차려 🚨',
            message: '너 얼마나 뒤쳐질려고 그러니? 지금 안 하면 합격이 아니라 *실패*에 투자하는 거야.',
            bgClass: 'bg-rose-100 border-rose-500',
            textClass: 'text-rose-800'
        },
        '칭찬기계': {
            icon: <Heart className="w-16 h-16 text-pink-500 animate-pulse" />,
            title: '✨ 너무 잘하고 있어요!',
            message: '오늘도 책상 앞에 앉은 것만으로도 상위 1%입니다! 준수님은 무조건 할 수 있어요. 우리 조금만 더 힘내서 목표 달성해 봐요!',
            bgClass: 'bg-pink-100 border-pink-400',
            textClass: 'text-pink-800'
        },
        '차분한 조력자': {
            icon: <Coffee className="w-16 h-16 text-indigo-500" />,
            title: '☕ 집중할 시간입니다.',
            message: '계획하신 학습 시간이 되었습니다. 깊은 심호흡을 한 번 하고, 오늘 목표한 분량에 온전히 몰입해 봅시다. 당신의 페이스를 유지하세요.',
            bgClass: 'bg-indigo-50 border-indigo-400',
            textClass: 'text-indigo-900'
        }
    };

    const current = personaData[persona] || personaData['차분한 조력자'];

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className={`relative w-full max-w-lg p-10 rounded-3xl border-4 shadow-2xl flex flex-col items-center text-center transform transition-all scale-100 ${current.bgClass}`}>

                <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full hover:bg-black/10 transition-colors">
                    <X className={`w-6 h-6 ${current.textClass}`} />
                </button>

                <div className="mb-6 p-4 bg-white/50 rounded-full shadow-inner">
                    {current.icon}
                </div>

                <h2 className={`text-3xl font-extrabold mb-4 tracking-tight ${current.textClass}`}>
                    {current.title}
                </h2>

                <p className={`text-lg font-bold leading-relaxed whitespace-pre-wrap ${current.textClass} opacity-90`}>
                    {current.message}
                </p>

                <button
                    onClick={onClose}
                    className={`mt-10 px-10 py-4 rounded-xl text-white font-bold text-lg shadow-lg hover:opacity-90 active:scale-95 transition-all ${persona === '잔소리쟁이' ? 'bg-rose-600' : persona === '칭찬기계' ? 'bg-pink-500' : 'bg-indigo-600'
                        }`}
                >
                    지금 시작 하기
                </button>
            </div>
        </div>
    );
}