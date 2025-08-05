// Common utility types used across the application
import type { ReactNode } from 'react';

export type { ReactNode };

export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export interface LoadingStatus {
  state: LoadingState;
  error?: string;
}

export type DifficultyLevel = 'easy' | 'medium' | 'hard';
export type DifficultyLevelTurkish = 'kolay' | 'orta' | 'zor';
export type EducationLevel = 'middle' | 'high' | 'university';
export type ResourceType = 'youtube' | 'book' | 'website' | 'article';

export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

export interface PaginationParams {
  page: number;
  per_page: number;
}

export interface SortParams {
  sort_by: string;
  sort_order: 'asc' | 'desc';
}