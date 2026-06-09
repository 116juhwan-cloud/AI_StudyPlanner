import { Router } from "express";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";

dotenv.config();

export const apiRouter = Router();

const TASKS_FILE = path.join(process.cwd(), "tasks.json");

interface Task {
  id: string;
  title: string;
  isAllDay: boolean;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  subject: string;
  notes: string;
  focusLevel?: 'Main' | 'Focus';
  estimatedTime?: number; // Estimated duration in minutes
  isCompleted: boolean;
}

// 파일에서 데이터 불러오기
let tasks: Task[] = [];
try {
  if (fs.existsSync(TASKS_FILE)) {
    const data = fs.readFileSync(TASKS_FILE, "utf-8");
    tasks = JSON.parse(data);
  }
} catch (error) {
  console.error("Failed to load tasks from file:", error);
}

const saveTasksToFile = () => {
  fs.writeFileSync(TASKS_FILE, JSON.stringify(tasks, null, 2));
};

let aiClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI | null {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (key && key !== "MY_GEMINI_API_KEY") {
      aiClient = new GoogleGenAI({
        apiKey: key,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });
    }
  }
  return aiClient;
}

apiRouter.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

apiRouter.get("/tasks", (req, res) => {
  res.json(tasks);
});

apiRouter.post("/tasks", (req, res) => {
  const newTask = req.body as Task;
  if (!newTask.id) {
    newTask.id = Math.random().toString(36).substring(2, 9);
  }
  tasks.push(newTask);
  saveTasksToFile();
  res.status(201).json(newTask);
});

apiRouter.delete("/tasks/:id", (req, res) => {
  const id = req.params.id;
  tasks = tasks.filter(t => t.id !== id);
  saveTasksToFile();
  res.json({ success: true });
});

apiRouter.put("/tasks/:id", (req, res) => {
  const id = req.params.id;
  const updatedTask = req.body as Task;
  tasks = tasks.map(t => t.id === id ? { ...t, ...updatedTask, id } : t);
  saveTasksToFile();
  res.json({ success: true });
});

apiRouter.post("/ai-feedback", async (req, res) => {
  try {
    const { taskList, persona, quoteCategory } = req.body;
    const aiInstance = getGenAI();

    if (!aiInstance) {
      let advice = "";
      if (persona === "잔소리쟁이") {
        advice = "아이구! 학습 플랜 상태가 이게 뭐에요? 시간 관리를 더 타이트하게 안 하시면 나중에 후회합니다! 지금 바로 다음 공부 일정 조율해서 집중하세요! ⏰";
      } else if (persona === "칭찬 기계") {
        advice = "정말 완벽한 플래닝이에요! 🌟 당신의 학구열과 끈기는 다른 사람들의 귀감이 될 수준입니다. 오늘의 소중한 1분 1초가 눈부신 미래를 만들고 있어요! 힘내세요!";
      } else {
        advice = "등록된 학업 일정들이 오전과 오후에 걸쳐 균형 있게 구성되어 있습니다. 특히 집중도가 높은 황금 시간대를 잘 활용하셔서 학습 스트레스를 최소화해 보세요.";
      }
      return res.json({ text: advice, source: "fallback" });
    }

    const tasksSummary = taskList && taskList.length > 0
      ? taskList.map((t: any) => `- ${t.title} (${t.subject}, 시간: ${t.startTime}~${t.endTime}, 노트: ${t.notes})`).join("\n")
      : "등록된 학습 일정이 없습니다.";

    let personaInstruction = "";
    if (persona === "잔소리쟁이") {
      personaInstruction = "You are a direct, witty, and nagging Korean study coach. Point out problems in the study plan, scold them slightly in a friendly and funny nagging tone, and suggest they study harder. Use emojis.";
    } else if (persona === "칭찬 기계") {
      personaInstruction = "You are an extremely enthusiastic, highly encouraging Korean study supporter. Praise the student unconditionally for their efforts, use dramatic expressions of affirmation, and elevate their confidence. Use emojis.";
    } else {
      personaInstruction = "You are a calm, highly logical, professional Korean advisor. Analyze their plan structure, discuss focus optimization, suggest breaks, and write in polite, academic, and supportive Korean.";
    }

    const prompt = `학습 일정 목록:\n${tasksSummary}\n\n존경하는 위인 (이 위인의 어조나 명언 스타일을 반영하여 피드백): ${quoteCategory || "이순신"}\n현재 시간: ${new Date().toISOString()}\n\n위의 일정을 분석하고 한국어로 2-3문장의 맞춤형 피드백 조언을 작성해 주세요. \n단락 구분 없이 하나의 가볍고 읽기 편한 문장 그룹(마크다운 형식 불가)으로 작성 부탁드립니다.`;

    const response = await aiInstance.models.generateContent({
      model: "gemini-1.5-flash",
      contents: prompt,
      config: {
        systemInstruction: personaInstruction,
        temperature: 0.8,
      }
    });

    res.json({ text: response.text?.trim() || "오늘도 최고의 집중을 응원합니다.", source: "gemini" });
  } catch (error: any) {
    console.error("Gemini API error:", error);
    res.status(500).json({ error: error.message || "Failed to generate AI feedback" });
  }
});
