/**
 * LangChain Agent 统一导出
 */

// Coach Agent
export {
  runCoachAgent,
  streamCoachAgent,
  generateSessionStart,
  handleUserChoice,
  generateExercisePresentation,
  generateFeedbackPresentation,
  type CoachResponse,
} from "./coach";

// Generator Agent
export {
  generateExercise,
  generateExerciseBatch,
  generateAdaptiveExercise,
  generateThemedExercise,
  generateWarmupExercise,
  generateChallengeExercise,
  generateFocusedExercise,
  type GeneratorOptions,
} from "./generator";

// Judge Agent
export {
  evaluateAnswer,
  quickEvaluate,
  comparativeEvaluate,
  multidimensionalEvaluate,
  generateFeedbackReport,
  type JudgeOptions,
} from "./judge";

// SRL Agent
export {
  generateReflection,
  guideReflectionDialogue,
  generateLearningPlan,
  generateSelfAssessmentQuestions,
  analyzeMetacognition,
  generateMotivation,
  type SRLOptions,
} from "./srl";

