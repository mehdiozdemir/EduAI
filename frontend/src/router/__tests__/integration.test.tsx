import { router } from '../index';

// Simple integration test to verify router configuration
describe('Router Integration', () => {
  it('should have all required routes configured', () => {
    const routes = router.routes;

    // Check that we have the expected number of top-level routes
    expect(routes).toHaveLength(4); // login, register, protected routes, 404

    // Check login route
    const loginRoute = routes.find(route => route.path === '/login');
    expect(loginRoute).toBeDefined();

    // Check register route
    const registerRoute = routes.find(route => route.path === '/register');
    expect(registerRoute).toBeDefined();

    // Check protected routes
    const protectedRoute = routes.find(route => route.path === '/');
    expect(protectedRoute).toBeDefined();
    expect(protectedRoute?.children).toBeDefined();
    expect(protectedRoute?.children?.length).toBeGreaterThan(0);

    // Check 404 route
    const notFoundRoute = routes.find(route => route.path === '*');
    expect(notFoundRoute).toBeDefined();
  });

  it('should have all expected protected child routes', () => {
    const protectedRoute = router.routes.find(route => route.path === '/');
    const childRoutes = protectedRoute?.children || [];

    // Check for expected child routes
    const expectedPaths = [
      'dashboard',
      'subjects',
      'subjects/:subjectId',
      'subjects/:subjectId/topics/:topicId/questions',
      'performance',
      'recommendations',
    ];

    expectedPaths.forEach(path => {
      const route = childRoutes.find(child => child.path === path);
      expect(route).toBeDefined();
    });

    // Check for index route redirect
    const indexRoute = childRoutes.find(child => child.index === true);
    expect(indexRoute).toBeDefined();
  });

  it('should support nested routing structure', () => {
    const protectedRoute = router.routes.find(route => route.path === '/');
    const childRoutes = protectedRoute?.children || [];

    // Check for nested question route
    const questionRoute = childRoutes.find(
      child => child.path === 'subjects/:subjectId/topics/:topicId/questions'
    );
    expect(questionRoute).toBeDefined();
  });

  it('should have proper route configuration structure', () => {
    // Verify router is properly configured
    expect(router).toBeDefined();
    expect(router.routes).toBeDefined();
    expect(Array.isArray(router.routes)).toBe(true);

    // Verify each route has required properties
    router.routes.forEach(route => {
      expect(route).toHaveProperty('path');
      expect(route).toHaveProperty('element');
    });
  });
});
