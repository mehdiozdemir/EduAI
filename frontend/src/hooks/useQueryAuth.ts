import { useContext } from 'react';
import { QueryAuthContext, type QueryAuthContextType } from '../contexts/QueryAuthContext';

// Hook to use the Query Auth context
export const useQueryAuth = (): QueryAuthContextType => {
  const context = useContext(QueryAuthContext);
  
  if (context === undefined) {
    throw new Error('useQueryAuth must be used within a QueryAuthProvider');
  }
  
  return context;
};