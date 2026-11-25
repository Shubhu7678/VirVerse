import { lazy, Suspense } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { GuestRoute, ProtectedRoute, AdminRoute } from './components/RouteGuards'
import Login from './pages/Login'
import Signup from './pages/Signup'
import LandingPage from './pages/LandingPage'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import Dashboard from './pages/Dashboard'
import Tasks from './pages/Tasks'
import Topics from './pages/Topics'
import TopicDetail from './pages/TopicDetail'
import AdminStudents from './pages/admin/Students'
import AdminStudentDetail from './pages/admin/StudentDetail'
import AdminLogs from './pages/admin/Logs'
import AdminEmails from './pages/admin/Emails'
import Leaderboard from './pages/Leaderboard'
import { PythonGuideIndex, PythonGuideLesson } from './pages/PythonGuide'
import { LoadingBlock } from './components/States'
import Submissions from './pages/Submissions'
import Profile from './pages/Profile'
import DashboardLayout from './components/DashboardLayout'

// The IDE page bundles Monaco, so load it only when a task is opened.
const TaskDetail = lazy(() => import('./pages/TaskDetail'))
const Playground = lazy(() => import('./pages/Playground'))
const WebDevelopment = lazy(() => import('./pages/WebDevelopment'))
const HtmlCatalog = lazy(() => import('./pages/HtmlCatalog'))

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route element={<GuestRoute />}>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
          </Route>
          <Route element={<ProtectedRoute />}>
            <Route element={<DashboardLayout />}>
              <Route element={<AdminRoute />}>
                <Route path="/admin" element={<AdminStudents />} />
                <Route path="/admin/students/:id" element={<AdminStudentDetail />} />
                <Route path="/admin/logs" element={<AdminLogs />} />
                <Route path="/admin/emails" element={<AdminEmails />} />
              </Route>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/leaderboard" element={<Leaderboard />} />
              <Route path="/tasks" element={<Topics />} />
              <Route path="/javascript" element={<Topics language="javascript" />} />
              <Route path="/python" element={<Topics language="python" />} />
              <Route path="/python/guide" element={<PythonGuideIndex />} />
              <Route path="/python/guide/:slug" element={<PythonGuideLesson />} />
              <Route path="/javascript/topics/:category" element={<TopicDetail language="javascript" />} />
              <Route path="/python/topics/:category" element={<TopicDetail language="python" />} />
              <Route path="/javascript/practice" element={<Tasks language="javascript" />} />
              <Route path="/python/practice" element={<Tasks language="python" />} />
              <Route path="/javascript/completed" element={<Tasks language="javascript" view="completed" />} />
              <Route path="/python/completed" element={<Tasks language="python" view="completed" />} />
              <Route
                path="/javascript/tasks/:slug"
                element={
                  <Suspense fallback={<LoadingBlock label="Opening editor…" />}>
                    <TaskDetail language="javascript" />
                  </Suspense>
                }
              />
              <Route
                path="/python/tasks/:slug"
                element={
                  <Suspense fallback={<LoadingBlock label="Opening editor…" />}>
                    <TaskDetail language="python" />
                  </Suspense>
                }
              />
              <Route path="/web-development/html" element={<Suspense fallback={<LoadingBlock label="Opening HTML courses…" />}><HtmlCatalog view="overview" /></Suspense>} />
              <Route path="/web-development/html-basics" element={<Suspense fallback={<LoadingBlock label="Opening HTML lessons…" />}><HtmlCatalog view="topics" /></Suspense>} />
              <Route path="/web-development/html-basics/:taskId" element={<Suspense fallback={<LoadingBlock label="Opening HTML lesson…" />}><WebDevelopment /></Suspense>} />
              <Route path="/topics/:category" element={<TopicDetail />} />
              <Route path="/practice" element={<Tasks view="all" />} />
              <Route
                path="/tasks/:slug"
                element={
                  <Suspense fallback={<LoadingBlock label="Opening editor…" />}>
                    <TaskDetail />
                  </Suspense>
                }
              />
              <Route
                path="/playground"
                element={
                  <Suspense fallback={<LoadingBlock label="Opening editor…" />}>
                    <Playground key="c-playground" />
                  </Suspense>
                }
              />
              <Route
                path="/javascript/playground"
                element={
                  <Suspense fallback={<LoadingBlock label="Opening editor…" />}>
                    <Playground key="javascript-playground" language="javascript" />
                  </Suspense>
                }
              />
              <Route
                path="/python/playground"
                element={
                  <Suspense fallback={<LoadingBlock label="Opening editor…" />}>
                    <Playground key="python-playground" language="python" />
                  </Suspense>
                }
              />
              <Route path="/completed" element={<Tasks view="completed" />} />
              <Route path="/submissions" element={<Submissions />} />
              <Route path="/profile" element={<Profile />} />
            </Route>
          </Route>
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
