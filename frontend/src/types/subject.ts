// Subject and Topic related types

export interface Subject {
  id: number;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface Topic {
  id: number;
  subject_id: number;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
}