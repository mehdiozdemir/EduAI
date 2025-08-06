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
const Recommendations = React.lazy(
  () => import(/* webpackChunkName: "recommendations" */ '../pages/Recommendations')
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
const AdminPanel = React.lazy(() =>
  import(/* webpackChunkName: "admin" */ '../pages/AdminPanelNew').then(module => ({ default: module.default }))
);
const PracticeExamSelectionPage = React.lazy(() =>
  import(/* webpackChunkName: "practice-exam" */ '../pages/PracticeExamSelectionPage').then(module => ({ default: module.default }))
);
const PracticeExamPage = React.lazy(() =>
  import(/* webpackChunkName: "practice-exam" */ '../pages/PracticeExamPage').then(module => ({ default: module.default }))
);
const PracticeExamResultsPage = React.lazy(() =>
  import(/* webpackChunkName: "practice-exam" */ '../pages/PracticeExamResultsPage').then(module => ({ default: module.default }))
);
const PracticeExamHistoryPage = React.lazy(() =>
  import(/* webpackChunkName: "practice-exam" */ '../pages/PracticeExamHistoryPage').then(module => ({ default: module.default }))
);
const TopicSelectionPage = React.lazy(() =>
  import(/* webpackChunkName: "education" */ '../pages/TopicSelectionPage').then(module => ({ default: module.TopicSelectionPage }))
);
const QuizConfigurationPage = React.lazy(() =>
  import(/* webpackChunkName: "education" */ '../pages/QuizConfigurationPage').then(module => ({ default: module.QuizConfigurationPage }))
);
const QuizPage = React.lazy(() =>
  import(/* webpackChunkName: "education" */ '../pages/QuizPage').then(module => ({ default: module.QuizPage }))
);
const NotFoundPage = React.lazy(() =>
  import(/* webpackChunkName: "error" */ '../pages/NotFoundPage').then(
    module => ({ default: module.NotFoundPage })
  )
);
const AIGuidancePage = React.lazy(() =>
  import(/* webpackChunkName: "ai-guidance" */ '../pages/AIGuidancePage').then(
    module => ({ default: module.default })
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
            <Recommendations />
          </LazyWrapper>
        ),
      },
      {
        path: 'ai-guidance',
        element: (
          <LazyWrapper>
            <AIGuidancePage />
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
        path: 'quiz-setup',
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
      {
        path: 'admin',
        element: (
          <LazyWrapper>
            <AdminPanel />
          </LazyWrapper>
        ),
      },
      {
        path: 'practice-exam',
        element: (
          <LazyWrapper>
            <PracticeExamSelectionPage />
          </LazyWrapper>
        ),
      },
      {
        path: 'practice-exam/:examId',
        element: (
          <LazyWrapper>
            <PracticeExamPage />
          </LazyWrapper>
        ),
      },
      {
        path: 'practice-exam/:examId/results',
        element: (
          <LazyWrapper>
            <PracticeExamResultsPage />
          </LazyWrapper>
        ),
      },
      {
        path: 'practice-exam-history',
        element: (
          <LazyWrapper>
            <PracticeExamHistoryPage />
          </LazyWrapper>
        ),
      },
      // New education system routes
      {
        path: 'courses/:courseId/topics',
        element: (
          <LazyWrapper>
            <TopicSelectionPage />
          </LazyWrapper>
        ),
      },
      {
        path: 'courses/:courseId/quiz-config',
        element: (
          <LazyWrapper>
            <QuizConfigurationPage />
          </LazyWrapper>
        ),
      },
      {
        path: 'quiz',
        element: (
          <LazyWrapper>
            <QuizPage />
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