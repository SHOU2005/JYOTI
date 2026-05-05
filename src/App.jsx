import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import InterviewSetup from './pages/InterviewSetup';
import InterviewSession from './pages/InterviewSession';
import LiveInterview from './pages/LiveInterview';
import Report from './pages/Report';
import ResumePage from './pages/ResumePage';
import JobsPage from './pages/JobsPage';
import Leaderboard from './pages/Leaderboard';
import MockInterviews from './pages/MockInterviews';
import AdminDashboard from './pages/AdminDashboard';
import SchedulePage from './pages/SchedulePage';
import AdminProctoring from './pages/AdminProctoring';
import IndianHRInterview from './pages/IndianHRInterview';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/interview/setup"
            element={
              <ProtectedRoute>
                <InterviewSetup />
              </ProtectedRoute>
            }
          />
          <Route
            path="/interview/session/:interviewId"
            element={
              <ProtectedRoute>
                <InterviewSession />
              </ProtectedRoute>
            }
          />
          <Route
            path="/live/:interviewId"
            element={
              <ProtectedRoute>
                <LiveInterview />
              </ProtectedRoute>
            }
          />
          <Route
            path="/interview/live"
            element={
              <ProtectedRoute>
                <LiveInterview />
              </ProtectedRoute>
            }
          />
          <Route
            path="/report/:id"
            element={
              <ProtectedRoute>
                <Report />
              </ProtectedRoute>
            }
          />
          <Route
            path="/resume"
            element={
              <ProtectedRoute>
                <ResumePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/jobs"
            element={
              <ProtectedRoute>
                <JobsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/leaderboard"
            element={
              <ProtectedRoute>
                <Leaderboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/mock-interviews"
            element={
              <ProtectedRoute>
                <MockInterviews />
              </ProtectedRoute>
            }
          />
          <Route
            path="/schedule"
            element={
              <ProtectedRoute>
                <SchedulePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute adminOnly>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/proctoring/:sessionId"
            element={
              <ProtectedRoute adminOnly>
                <AdminProctoring />
              </ProtectedRoute>
            }
          />
          <Route
            path="/interview/indian-hr"
            element={
              <ProtectedRoute>
                <IndianHRInterview />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Layout>
    </Router>
  )
}

export default App
