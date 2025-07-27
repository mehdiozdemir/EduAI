import { useQuery } from '@tanstack/react-query';
import { subjectService } from '../../services/subjectService';
import { queryKeys } from '../../lib/queryClient';

// Get all subjects
export const useSubjects = () => {
  return useQuery({
    queryKey: queryKeys.subjects.all,
    queryFn: () => subjectService.getSubjects(),
    staleTime: 15 * 60 * 1000, // 15 minutes - subjects don't change often
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
};

// Get single subject
export const useSubject = (id: number, enabled = true) => {
  return useQuery({
    queryKey: queryKeys.subjects.detail(id),
    queryFn: () => subjectService.getSubject(id),
    enabled: enabled && !!id,
    staleTime: 15 * 60 * 1000, // 15 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
};

// Get topics for a subject
export const useTopics = (subjectId: number, enabled = true) => {
  return useQuery({
    queryKey: queryKeys.subjects.topics(subjectId),
    queryFn: () => subjectService.getTopics(subjectId),
    enabled: enabled && !!subjectId,
    staleTime: 15 * 60 * 1000, // 15 minutes - topics don't change often
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
};

// Get all topics (across all subjects)
export const useAllTopics = (enabled = true) => {
  return useQuery({
    queryKey: ['topics', 'all'],
    queryFn: () => subjectService.getAllTopics(),
    enabled,
    staleTime: 15 * 60 * 1000, // 15 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
};

// Get single topic
export const useTopic = (topicId: number, enabled = true) => {
  return useQuery({
    queryKey: ['topics', topicId],
    queryFn: () => subjectService.getTopic(topicId),
    enabled: enabled && !!topicId,
    staleTime: 15 * 60 * 1000, // 15 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
};

// Search subjects
export const useSearchSubjects = (query: string, enabled = false) => {
  return useQuery({
    queryKey: ['subjects', 'search', query],
    queryFn: () => subjectService.searchSubjects(query),
    enabled: enabled && !!query && query.length >= 2,
    staleTime: 5 * 60 * 1000, // 5 minutes - search results can be cached briefly
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Search topics
export const useSearchTopics = (
  query: string, 
  subjectId?: number, 
  enabled = false
) => {
  return useQuery({
    queryKey: ['topics', 'search', query, subjectId],
    queryFn: () => subjectService.searchTopics(query, subjectId),
    enabled: enabled && !!query && query.length >= 2,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};