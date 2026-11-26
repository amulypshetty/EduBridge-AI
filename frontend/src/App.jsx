import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/common/PrivateRoute';
import AppShell from './components/layout/AppShell';

import LandingPage from './pages/public/LandingPage';
import AuthPage from './pages/public/AuthPage';
import StudentDashboard from './pages/student/StudentDashboard';
import StudentDoubts from './pages/student/StudentDoubts';
import StudentQuizzes from './pages/student/StudentQuizzes';
import QuizPlayer from './pages/student/QuizPlayer';
import FacultyDashboard from './pages/faculty/FacultyDashboard';
import FacultyDoubts from './pages/faculty/FacultyDoubts';
import FacultyQuizzes from './pages/faculty/FacultyQuizzes';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminResources from './pages/admin/AdminResources';
import ResourcesHub from './pages/shared/ResourcesHub';
import ProfilePage from './pages/shared/ProfilePage';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3500,
            style: {
              borderRadius: '14px',
              background: '#13112B',
              color: '#FFFFFF',
              fontSize: '13px',
              fontWeight: 500,
              boxShadow: '0 10px 25px rgba(19, 17, 43, 0.2)',
            },
          }}
        />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<AuthPage defaultTab="login" />} />
          <Route path="/register" element={<AuthPage defaultTab="register" />} />

          {/* Student Routes */}
          <Route element={<PrivateRoute allowedRoles={['student']} />}>
            <Route element={<AppShell />}>
              <Route path="/student/dashboard" element={<StudentDashboard />} />
              <Route path="/student/resources" element={<ResourcesHub />} />
              <Route path="/student/doubts" element={<StudentDoubts />} />
              <Route path="/student/quizzes" element={<StudentQuizzes />} />
            </Route>
            {/* Distraction-free Quiz Player */}
            <Route path="/student/quizzes/:quizId" element={<QuizPlayer />} />
          </Route>

          {/* Faculty Routes */}
          <Route element={<PrivateRoute allowedRoles={['faculty']} />}>
            <Route element={<AppShell />}>
              <Route path="/faculty/dashboard" element={<FacultyDashboard />} />
              <Route path="/faculty/resources" element={<ResourcesHub />} />
              <Route path="/faculty/doubts" element={<FacultyDoubts />} />
              <Route path="/faculty/quizzes" element={<FacultyQuizzes />} />
            </Route>
          </Route>

          {/* Admin Routes */}
          <Route element={<PrivateRoute allowedRoles={['admin']} />}>
            <Route element={<AppShell />}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/users" element={<AdminUsers />} />
              <Route path="/admin/resources" element={<AdminResources />} />
            </Route>
          </Route>

          {/* Shared Profile Route */}
          <Route element={<PrivateRoute allowedRoles={['student', 'faculty', 'admin']} />}>
            <Route element={<AppShell />}>
              <Route path="/profile" element={<ProfilePage />} />
            </Route>
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
