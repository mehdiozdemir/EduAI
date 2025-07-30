import React, { useEffect, useState } from 'react';

interface StylesLoadedProviderProps {
  children: React.ReactNode;
}

export const StylesLoadedProvider: React.FC<StylesLoadedProviderProps> = ({ children }) => {
  const [stylesLoaded, setStylesLoaded] = useState(false);

  useEffect(() => {
    // Check if CSS is loaded by looking for Tailwind classes
    const checkStylesLoaded = () => {
      const testElement = document.createElement('div');
      testElement.className = 'absolute opacity-0 pointer-events-none';
      testElement.style.position = 'absolute';
      testElement.style.top = '-9999px';
      document.body.appendChild(testElement);

      // Add Tailwind classes
      testElement.className = 'bg-primary-600 text-white p-4 rounded-lg';
      
      // Get computed styles
      const styles = window.getComputedStyle(testElement);
      const hasStyles = styles.backgroundColor !== 'rgba(0, 0, 0, 0)' && 
                       styles.backgroundColor !== 'transparent' &&
                       styles.padding !== '0px';

      document.body.removeChild(testElement);
      return hasStyles;
    };

    // Check immediately
    if (checkStylesLoaded()) {
      setStylesLoaded(true);
      return;
    }

    // If not loaded, check periodically
    const interval = setInterval(() => {
      if (checkStylesLoaded()) {
        setStylesLoaded(true);
        clearInterval(interval);
      }
    }, 50);

    // Fallback timeout - show content after 1 second regardless
    const timeout = setTimeout(() => {
      setStylesLoaded(true);
      clearInterval(interval);
    }, 1000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, []);

  if (!stylesLoaded) {
    return (
      <div 
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          backgroundColor: '#f9fafb',
          fontFamily: 'system-ui, -apple-system, sans-serif'
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div 
            style={{
              width: '40px',
              height: '40px',
              border: '4px solid #e5e7eb',
              borderTop: '4px solid #3b82f6',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 16px'
            }}
          />
          <p style={{ color: '#6b7280', fontSize: '14px' }}>Loading styles...</p>
        </div>
        <style>
          {`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}
        </style>
      </div>
    );
  }

  return <>{children}</>;
};
