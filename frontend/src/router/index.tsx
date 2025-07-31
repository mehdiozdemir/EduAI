import React, { Suspense } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { ProtectedRoute, PublicRoute } from '../components/auth/ProtectedRoute';
import { Loading } from '../components/ui/Loading';

// Lazy load pages for better performance with preload hints
const LoginPage = React.lazy(
  () => import(/* webpackChunkName: "auth" */ '../pages/LoginPage')
);
const RegisterPage = React.lazy(
  () => import(/* webpackChunkName: "auth" */ '../pages/RegisterPage')
);
const Dashboard = React.lazy(
  () => import(/* webpackChunkName: "dashboard" */ '../pages/Dashboard')
);
const SubjectListPage = React.lazy(() =>
  import(/* webpackChunkName: "subjects" */ '../pages/SubjectListPage').then(
    module => ({ default: module.SubjectListPage })
  )
);
const SubjectDetailPage = React.lazy(() =>
  import(/* webpackChunkName: "subjects" */ '../pages/SubjectDetailPage').then(
    module => ({ default: module.SubjectDetailPage })
  )
);
const QuestionPage = React.lazy(() =>
  import(/* webpackChunkName: "questions" */ '../pages/QuestionPage').then(
    module => ({ default: module.QuestionPage })
  )
);
const PerformanceAnalysisPage = React.lazy(() =>
  import(
    /* webpackChunkName: "performance" */ '../pages/PerformanceAnalysis'
  ).then(module => ({ default: module.PerformanceAnalysisPage }))
);
const RecommendationsDemo = React.lazy(
  () => import(/* webpackChunkName: "demo" */ '../pages/RecommendationsDemo')
);
const ResponsiveDemo = React.lazy(
  () => import(/* webpackChunkName: "demo" */ '../pages/ResponsiveDemo')
);
const QuizSetupPage = React.lazy(() =>
  import(/* webpackChunkName: "quiz" */ '../pages/QuizSetupPage.tsx').then(module => ({ default: module.default }))
);
const LandingPage = React.lazy(() =>
  import(/* webpackChunkName: "landing" */ '../pages/LandingPage').then(module => ({ default: module.default }))
);
const ProfilePage = React.lazy(() =>
  import(/* webpackChunkName: "profile" */ '../pages/ProfilePage').then(module => ({ default: module.default }))
);
const SettingsPage = React.lazy(() =>
  import(/* webpackChunkName: "settings" */ '../pages/SettingsPage').then(module => ({ default: module.default }))
);
const NotFoundPage = React.lazy(() =>
  import(/* webpackChunkName: "error" */ '../pages/NotFoundPage').then(
    module => ({ default: module.NotFoundPage })
  )
);

// Wrapper component for lazy loaded routes
const LazyWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Suspense fallback={<Loading />}>{children}</Suspense>
);

export const router = createBrowserRouter([
  // Landing page route (root - accessible to everyone)
  {
    path: '/',
    element: (
      <LazyWrapper>
        <LandingPage />
      </LazyWrapper>
    ),
  },

  // Landing page alternative route
  {
    path: '/landing',
    element: (
      <LazyWrapper>
        <LandingPage />
      </LazyWrapper>
    ),
  },

  // Public routes (no authentication required, redirect if authenticated)
  {
    path: '/login',
    element: (
      <PublicRoute>
        <LazyWrapper>
          <LoginPage />
        </LazyWrapper>
      </PublicRoute>
    ),
  },
  {
    path: '/register',
    element: (
      <PublicRoute>
        <LazyWrapper>
          <RegisterPage />
        </LazyWrapper>
      </PublicRoute>
    ),
  },

  // Protected routes (authentication required)
  {
    path: '/app',
    element: (
      <ProtectedRoute>
        <Layout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/app/dashboard" replace />,
      },
      {
        path: 'dashboard',
        element: (
          <LazyWrapper>
            <Dashboard />
          </LazyWrapper>
        ),
      },
      {
        path: 'subjects',
        element: (
          <LazyWrapper>
            <SubjectListPage />
          </LazyWrapper>
        ),
      },
      {
        path: 'subjects/:subjectId',
        element: (
          <LazyWrapper>
            <SubjectDetailPage />
          </LazyWrapper>
        ),
      },
      {
        path: 'subjects/:subjectId/topics/:topicId/questions',
        element: (
          <LazyWrapper>
            <QuestionPage />
          </LazyWrapper>
        ),
      },
      {
        path: 'performance',
        element: (
          <LazyWrapper>
            <PerformanceAnalysisPage />
          </LazyWrapper>
        ),
      },
      {
        path: 'recommendations',
        element: (
          <LazyWrapper>
            <RecommendationsDemo />
          </LazyWrapper>
        ),
      },
      {
        path: 'responsive-demo',
        element: (
          <LazyWrapper>
            <ResponsiveDemo />
          </LazyWrapper>
        ),
      },
      {
        path: 'quiz',
        element: (
          <LazyWrapper>
            <QuizSetupPage />
          </LazyWrapper>
        ),
      },
      {
        path: 'profile',
        element: (
          <LazyWrapper>
            <ProfilePage />
          </LazyWrapper>
        ),
      },
      {
        path: 'settings',
        element: (
          <LazyWrapper>
            <SettingsPage />
          </LazyWrapper>
        ),
      },
    ],
  },

  // 404 error page
  {
    path: '*',
    element: (
      <LazyWrapper>
        <NotFoundPage />
      </LazyWrapper>
    ),
  },
]);