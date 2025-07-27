import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Simple demo component to test React Query integration
const SimpleQueryDemo: React.FC = () => {
  const queryClient = useQueryClient();

  // Simple query
  const { data, isLoading, error } = useQuery({
    queryKey: ['demo-data'],
    queryFn: async () => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return { message: 'React Query is working!', timestamp: Date.now() };
    },
    staleTime: 5000,
  });

  // Simple mutation
  const mutation = useMutation({
    mutationFn: async (newData: string) => {
      await new Promise(resolve => setTimeout(resolve, 500));
      return { message: newData, timestamp: Date.now() };
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['demo-data'], data);
    },
  });

  const handleUpdate = () => {
    mutation.mutate('Data updated via mutation!');
  };

  const handleInvalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['demo-data'] });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Simple React Query Demo</h1>
      
      <div className="space-y-6">
        {/* Query Status */}
        <div className="p-6 border rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Query Status</h2>
          {isLoading && <div className="text-blue-600">Loading...</div>}
          {error && <div className="text-red-600">Error: {error.message}</div>}
          {data && (
            <div className="space-y-2">
              <div className="font-medium">{data.message}</div>
              <div className="text-sm text-gray-600">
                Timestamp: {new Date(data.timestamp).toLocaleTimeString()}
              </div>
            </div>
          )}
        </div>

        {/* Mutation Controls */}
        <div className="p-6 border rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Mutation Controls</h2>
          <div className="space-x-4">
            <button
              onClick={handleUpdate}
              disabled={mutation.isPending}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {mutation.isPending ? 'Updating...' : 'Update Data'}
            </button>
            
            <button
              onClick={handleInvalidate}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              Invalidate Query
            </button>
          </div>
          
          {mutation.error && (
            <div className="mt-2 text-red-600">
              Mutation Error: {mutation.error.message}
            </div>
          )}
        </div>

        {/* Cache Info */}
        <div className="p-6 border rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Cache Information</h2>
          <div className="text-sm text-gray-600">
            <div>Total Queries: {queryClient.getQueryCache().getAll().length}</div>
            <div>Active Queries: {queryClient.getQueryCache().getAll().filter(q => q.getObserversCount() > 0).length}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimpleQueryDemo;