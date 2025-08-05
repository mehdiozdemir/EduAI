import React from 'react';
import { ErrorBoundarySection } from './ErrorBoundaryProvider';
import { RetryHandler, RetryUI } from './RetryHandler';
import { EmptyStateFallback } from './ErrorFallbacks';
import { cn } from '../../utils';

// Enhanced error boundary specifically for topic selection components
export const TopicSelectionErrorBoundary: React.FC<{
  children: React.ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  className?: string;
}> = ({ children, onError, className }) => {
  const handleError = (error: Error, errorInfo: React.ErrorInfo) => {
    console.error('TopicSelectionErrorBoundary caught error:', error, errorInfo);
    if (onError) {
      onError(error, errorInfo);
    }
  };

  const fallback = ({ error, resetError }: { error: Error; resetError: () => void }) => (
    <div className={cn('p-6 text-center', className)}>
      <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
        <svg
          className="w-8 h-8 text-red-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
          />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        Konu Seçimi Hatası
      </h3>
      <p className="text-gray-600 mb-4">
        Konu seçimi sırasında bir hata oluştu. Lütfen sayfayı yenileyin veya tekrar deneyin.
      </p>
      <div className="space-y-2">
        <button
          onClick={resetError}
          className="w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
        >
          Tekrar Dene
        </button>
        <button
          onClick={() => window.location.reload()}
          className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
        >
          Sayfayı Yenile
        </button>
      </div>
    </div>
  );

  return (
    <ErrorBoundarySection
      fallback={fallback}
      onError={handleError}
      className={className}
    >
      {children}
    </ErrorBoundarySection>
  );
};

// Enhanced error boundary for quiz configuration components
export const QuizConfigurationErrorBoundary: React.FC<{
  children: React.ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  className?: string;
}> = ({ children, onError, className }) => {
  const handleError = (error: Error, errorInfo: React.ErrorInfo) => {
    console.error('QuizConfigurationErrorBoundary caught error:', error, errorInfo);
    if (onError) {
      onError(error, errorInfo);
    }
  };

  const fallback = ({ error, resetError }: { error: Error; resetError: () => void }) => (
    <div className={cn('p-6 text-center', className)}>
      <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
        <svg
          className="w-8 h-8 text-red-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        Quiz Ayarları Hatası
      </h3>
      <p className="text-gray-600 mb-4">
        Quiz ayarları sırasında bir hata oluştu. Lütfen konu seçimine geri dönün veya sayfayı yenileyin.
      </p>
      <div className="space-y-2">
        <button
          onClick={resetError}
          className="w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
        >
          Tekrar Dene
        </button>
        <button
          onClick={() => window.history.back()}
          className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
        >
          Geri Dön
        </button>
      </div>
    </div>
  );

  return (
    <ErrorBoundarySection
      fallback={fallback}
      onError={handleError}
      className={className}
    >
      {children}
    </ErrorBoundarySection>
  );
};

// Enhanced retry handler with better error categorization
export const EnhancedRetryHandler: React.FC<{
  children: (props: {
    retry: () => void;
    isRetrying: boolean;
    lastError: Error | null;
    canRetry: boolean;
    errorType: 'network' | 'server' | 'validation' | 'unknown';
  }) => React.ReactNode;
  operation: () => Promise<any>;
  onError?: (error: Error) => void;
  maxAttempts?: number;
  className?: string;
}> = ({ children, operation, onError, maxAttempts = 3, className }) => {
  const [isRetrying, setIsRetrying] = React.useState(false);
  const [lastError, setLastError] = React.useState<Error | null>(null);
  const [attemptCount, setAttemptCount] = React.useState(0);

  const categorizeError = (error: Error): 'network' | 'server' | 'validation' | 'unknown' => {
    const message = error.message.toLowerCase();
    
    if (message.includes('network') || message.includes('fetch') || message.includes('connection')) {
      return 'network';
    }
    if (message.includes('server') || message.includes('500') || message.includes('503')) {
      return 'server';
    }
    if (message.includes('validation') || message.includes('invalid') || message.includes('required')) {
      return 'validation';
    }
    return 'unknown';
  };

  const retry = async () => {
    if (attemptCount >= maxAttempts || isRetrying) return;

    setIsRetrying(true);
    setAttemptCount(prev => prev + 1);

    try {
      await operation();
      setLastError(null);
      setAttemptCount(0);
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      setLastError(err);
      if (onError) {
        onError(err);
      }
    } finally {
      setIsRetrying(false);
    }
  };

  const canRetry = attemptCount < maxAttempts && !isRetrying;
  const errorType = lastError ? categorizeError(lastError) : 'unknown';

  return (
    <div className={className}>
      {children({
        retry,
        isRetrying,
        lastError,
        canRetry,
        errorType
      })}
    </div>
  );
};

// Enhanced empty state for no topics scenario
export const NoTopicsEmptyState: React.FC<{
  courseName?: string;
  onBackToCourses: () => void;
  onRetry?: () => void;
  className?: string;
}> = ({ courseName, onBackToCourses, onRetry, className }) => (
  <div className={cn('text-center py-12', className)}>
    <div className="mx-auto w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-6">
      <svg
        className="w-10 h-10 text-blue-600"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      </svg>
    </div>
    <h3 className="text-xl font-semibold text-gray-900 mb-3">
      Bu Ders İçin Konu Bulunmuyor
    </h3>
    <p className="text-gray-600 mb-6 max-w-md mx-auto">
      {courseName ? `${courseName} dersi` : 'Bu ders'} için henüz konu eklenmemiş. 
      Lütfen başka bir ders seçin veya daha sonra tekrar deneyin.
    </p>
    <div className="space-y-3">
      <button
        onClick={onBackToCourses}
        className="w-full sm:w-auto px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
      >
        Derslere Dön
      </button>
      {onRetry && (
        <button
          onClick={onRetry}
          className="w-full sm:w-auto px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 ml-0 sm:ml-3"
        >
          Tekrar Dene
        </button>
      )}
    </div>
  </div>
);

// Enhanced form validation error display
export const FormValidationError: React.FC<{
  errors: Record<string, string>;
  className?: string;
}> = ({ errors, className }) => {
  const errorEntries = Object.entries(errors).filter(([_, message]) => message);
  
  if (errorEntries.length === 0) return null;

  return (
    <div className={cn('p-4 bg-red-50 border border-red-200 rounded-lg', className)}>
      <div className="flex items-start">
        <svg className="h-5 w-5 text-red-400 mt-0.5 mr-3 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
        </svg>
        <div className="flex-1">
          <h3 className="text-sm font-medium text-red-800 mb-2">
            Lütfen aşağıdaki hataları düzeltin:
          </h3>
          <ul className="text-sm text-red-700 space-y-1">
            {errorEntries.map(([field, message]) => (
              <li key={field} className="flex items-start">
                <span className="inline-block w-1 h-1 bg-red-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                {message}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

// API Error handler with specific error types
export const APIErrorHandler: React.FC<{
  error: Error | null;
  onRetry: () => void;
  onReset?: () => void;
  isRetrying?: boolean;
  className?: string;
}> = ({ error, onRetry, onReset, isRetrying = false, className }) => {
  if (!error) return null;

  const getErrorInfo = (error: Error) => {
    const message = error.message.toLowerCase();
    
    if (message.includes('network') || message.includes('fetch')) {
      return {
        title: 'Bağlantı Hatası',
        description: 'İnternet bağlantınızı kontrol edin ve tekrar deneyin.',
        icon: (
          <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
          </svg>
        ),
        bgColor: 'bg-orange-100'
      };
    }
    
    if (message.includes('404') || message.includes('not found')) {
      return {
        title: 'İçerik Bulunamadı',
        description: 'Aradığınız içerik mevcut değil veya kaldırılmış.',
        icon: (
          <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 20c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8a7.962 7.962 0 01-2 5.291z" />
          </svg>
        ),
        bgColor: 'bg-blue-100'
      };
    }
    
    if (message.includes('500') || message.includes('server')) {
      return {
        title: 'Sunucu Hatası',
        description: 'Sunucularımızda bir sorun var. Lütfen daha sonra tekrar deneyin.',
        icon: (
          <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ),
        bgColor: 'bg-red-100'
      };
    }
    
    return {
      title: 'Beklenmeyen Hata',
      description: 'Bir hata oluştu. Lütfen tekrar deneyin.',
      icon: (
        <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      ),
      bgColor: 'bg-gray-100'
    };
  };

  const errorInfo = getErrorInfo(error);

  return (
    <div className={cn('p-6 text-center max-w-md mx-auto', className)}>
      <div className={cn('mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4', errorInfo.bgColor)}>
        {errorInfo.icon}
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        {errorInfo.title}
      </h3>
      <p className="text-gray-600 mb-6">
        {errorInfo.description}
      </p>
      <div className="space-y-2">
        <button
          onClick={onRetry}
          disabled={isRetrying}
          className={cn(
            'w-full px-4 py-2 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2',
            isRetrying
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500'
          )}
        >
          {isRetrying ? (
            <div className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Deneniyor...
            </div>
          ) : (
            'Tekrar Dene'
          )}
        </button>
        {onReset && (
          <button
            onClick={onReset}
            className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          >
            Sıfırla
          </button>
        )}
      </div>
    </div>
  );
};