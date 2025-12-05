import { create } from "zustand";
import type { ChatMessage } from "@/types/ai";
import type { WorkoutPhase, WorkoutPlan, TaskInstance } from "@/types/workout";
import type { GenerateExerciseResponse, EvaluateAnswerResponse } from "@/types/exercise";
import { generateId } from "@/lib/utils";

interface WorkoutState {
  // 会话状态
  sessionId: string | null;
  phase: WorkoutPhase;
  plan: WorkoutPlan | null;
  
  // 对话
  messages: ChatMessage[];
  isLoading: boolean;
  
  // 训练数据
  tasks: TaskInstance[];
  currentTask: GenerateExerciseResponse | null;
  currentFeedback: EvaluateAnswerResponse | null;
  
  // 用户状态
  energyLevel: number | null;
  userGoal: string | null;
  
  // 统计
  completedTasks: number;
  totalScore: number;
  consecutiveCorrect: number;
  consecutiveWrong: number;
  
  // Actions
  startSession: () => void;
  endSession: () => void;
  setPhase: (phase: WorkoutPhase) => void;
  setPlan: (plan: WorkoutPlan) => void;
  
  addMessage: (
    message: Omit<ChatMessage, "id" | "timestamp"> & { id?: string }
  ) => string;
  appendMessageContent: (id: string, delta: string) => void;
  setLoading: (loading: boolean) => void;
  
  setCurrentTask: (task: GenerateExerciseResponse | null) => void;
  setCurrentFeedback: (feedback: EvaluateAnswerResponse | null) => void;
  completeTask: (task: TaskInstance) => void;
  
  setEnergyLevel: (level: number) => void;
  setUserGoal: (goal: string) => void;
  
  updatePerformance: (score: number) => void;
  reset: () => void;
}

const initialState = {
  sessionId: null,
  phase: "start" as WorkoutPhase,
  plan: null,
  messages: [],
  isLoading: false,
  tasks: [],
  currentTask: null,
  currentFeedback: null,
  energyLevel: null,
  userGoal: null,
  completedTasks: 0,
  totalScore: 0,
  consecutiveCorrect: 0,
  consecutiveWrong: 0,
};

export const useWorkoutStore = create<WorkoutState>((set, get) => ({
  ...initialState,

  startSession: () => {
    set({
      ...initialState,
      sessionId: generateId(),
      phase: "start",
    });
  },

  endSession: () => {
    set({ phase: "complete" });
  },

  setPhase: (phase) => set({ phase }),

  setPlan: (plan) => set({ plan }),

  addMessage: (message) => {
    const id = message.id || generateId();
    const newMessage: ChatMessage = {
      ...message,
      id,
      timestamp: new Date(),
    };
    set((state) => ({
      messages: [...state.messages, newMessage],
    }));
    return id;
  },

  appendMessageContent: (id, delta) => {
    set((state) => ({
      messages: state.messages.map((msg) =>
        msg.id === id ? { ...msg, content: msg.content + delta } : msg
      ),
    }));
  },

  setLoading: (isLoading) => set({ isLoading }),

  setCurrentTask: (currentTask) => set({ currentTask, currentFeedback: null }),

  setCurrentFeedback: (currentFeedback) => set({ currentFeedback }),

  completeTask: (task) => {
    set((state) => ({
      tasks: [...state.tasks, task],
      completedTasks: state.completedTasks + 1,
      currentTask: null,
    }));
  },

  setEnergyLevel: (energyLevel) => set({ energyLevel }),

  setUserGoal: (userGoal) => set({ userGoal }),

  updatePerformance: (score) => {
    set((state) => {
      const isCorrect = score >= 70;
      return {
        totalScore: state.totalScore + score,
        consecutiveCorrect: isCorrect ? state.consecutiveCorrect + 1 : 0,
        consecutiveWrong: isCorrect ? 0 : state.consecutiveWrong + 1,
      };
    });
  },

  reset: () => set(initialState),
}));

// 计算平均分
export const useAverageScore = () => {
  const { totalScore, completedTasks } = useWorkoutStore();
  return completedTasks > 0 ? Math.round(totalScore / completedTasks) : 0;
};

// 获取最近表现
export const useRecentPerformance = () => {
  const { totalScore, completedTasks, consecutiveCorrect, consecutiveWrong } = useWorkoutStore();
  return {
    averageScore: completedTasks > 0 ? Math.round(totalScore / completedTasks) : 50,
    consecutiveCorrect,
    consecutiveWrong,
  };
};

