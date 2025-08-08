// Question generation and evaluation related types

export interface QuestionParams {
  subject: string;
  topic: string;
  difficulty: 'easy' | 'medium' | 'hard';
  count: number;
  education_level?: string; // backend uses Turkish levels like 'lise'
}

export interface GeneratedQuestion {
  id: string;
  content: string;
  options?: string[];
  correct_answer: string;
  explanation?: string;
}

export interface QuestionGenerationResponse {
  questions: GeneratedQuestion[];
  metadata: {
    subject: string;
    topic: string;
    difficulty: string;
    count: number;
  };
}

export interface EvaluateRequest {
  question_id?: string | number;
  user_answer: string;
  correct_answer: string;
  question_content?: string;
}

export interface AnswerEvaluation {
  is_correct: boolean;
  score: number;
  feedback: string;
  explanation?: string;
}

// Backend stored question shape
export interface StoredQuestion {
  id: number;
  topic_id: number;
  content: string;
  difficulty: 'kolay' | 'orta' | 'zor';
  created_at: string;
  updated_at?: string;
}

export interface QuizResults {
  totalQuestions: number;
  correctAnswers: number;
  accuracy: number;
  timeSpent: number;
  answers: {
    questionId: string;
    userAnswer: string;
    isCorrect: boolean;
    evaluation: AnswerEvaluation;
  }[];
}