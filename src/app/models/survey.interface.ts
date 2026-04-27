export interface Answer {
  id: number;
  question_id: number;
  text: string;
  vote_count: number;
}

export interface Question {
  id: number;
  survey_id: number;
  text: string;
  allow_multiple: boolean;
  answers: Answer[];
}

export interface Survey {
  id: number;
  title: string;
  description: string | null;
  category: string | null;
  end_date: string | null;
  status: 'published' | 'draft' | 'past';
  created_at: string;
  questions: Question[];
}

export interface SurveyPayload {
  title: string;
  description: string;
  end_date: string;
  category: string;
  questions: { text: string; allow_multiple: boolean; answers: string[] }[];
}
