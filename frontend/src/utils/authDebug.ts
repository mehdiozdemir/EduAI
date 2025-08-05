// Debug utilities for authentication issues

export const clearAllAuthData = (): void => {
  console.log('🔧 Clearing all authentication data...');
  
  // Clear specific tokens
  localStorage.removeItem('eduai_access_token');
  localStorage.removeItem('eduai_refresh_token');
  
  // Clear all localStorage (nuclear option)
  localStorage.clear();
  
  // Clear sessionStorage too
  sessionStorage.clear();
  
  console.log('✅ All authentication data cleared');
};

export const debugAuthState = (): void => {
  console.log('🔍 Current authentication state:');
  console.log('Access Token:', localStorage.getItem('eduai_access_token'));
  console.log('Refresh Token:', localStorage.getItem('eduai_refresh_token'));
  console.log('All localStorage keys:', Object.keys(localStorage));
  console.log('All sessionStorage keys:', Object.keys(sessionStorage));
};

export const forceLogoutAndReload = (): void => {
  console.log('🚪 Force logout and reload...');
  clearAllAuthData();
  window.location.href = '/login';
  window.location.reload();
};

// Add to window for console access
if (typeof window !== 'undefined') {
  (window as any).authDebug = {
    clear: clearAllAuthData,
    debug: debugAuthState,
    forceLogout: forceLogoutAndReload,
  };
  
  console.log('🔧 Auth debug tools available at window.authDebug');
}