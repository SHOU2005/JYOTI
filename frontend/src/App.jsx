import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import MainLayout from './components/layout/MainLayout';
import DashboardLayout from './components/layout/DashboardLayout';
import ProtectedRoute from './routes/ProtectedRoute';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import StudentDashboard from './pages/StudentDashboard';
import InterviewPage from './pages/InterviewPage';
import ReportPage from './pages/ReportPage';
import ResumePage from './pages/ResumePage';
import JobsPage from './pages/JobsPage';
import LeaderboardPage from './pages/LeaderboardPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import StudentsList from './pages/admin/StudentsList';

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route element={<MainLayout />}>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
            </Route>

            {/* Student Routes */}
            <Route element={
              <ProtectedRoute roles={['student', 'admin']}>
                <DashboardLayout />
              </ProtectedRoute>
            }>
              <Route path="/dashboard" element={<StudentDashboard />} />
              <Route path="/interview" element={<InterviewPage />} />
              <Route path="/report" element={<ReportPage />} />
              <Route path="/resume" element={<ResumePage />} />
              <Route path="/jobs" element={<JobsPage />} />
              <Route path="/leaderboard" element={<LeaderboardPage />} />
            </Route>

            {/* Admin Routes */}
            <Route path="/admin" element={
              <ProtectedRoute roles={['admin']}>
                <DashboardLayout />
              </ProtectedRoute>
            }>
              <Route index element={<AdminDashboard />} />
              <Route path="students" element={<StudentsList />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
