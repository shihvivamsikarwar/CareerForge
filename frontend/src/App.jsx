import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./routes/ProtectedRoute";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AuthSuccess from "./pages/AuthSuccess";
import Dashboard from "./pages/Dashboard";
import Resume from "./pages/Resume";
import Interview from "./pages/Interview";
import InterviewSession from "./pages/InterviewSession";
import InterviewResult from "./pages/InterviewResult";
import InterviewHistory from "./pages/InterviewHistory";
import Performance from "./pages/Performance";
import JobAnalyzer from "./pages/JobAnalyzer";

// ─────────────────────────────────────────────────────────────────────────────
// Main component

const Protected = ({ children }) => <ProtectedRoute>{children}</ProtectedRoute>;

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/auth/success" element={<AuthSuccess />} />

          {/* Protected */}
          <Route
            path="/dashboard"
            element={
              <Protected>
                <Dashboard />
              </Protected>
            }
          />
          <Route
            path="/resume"
            element={
              <Protected>
                <Resume />
              </Protected>
            }
          />
          <Route
            path="/interviews"
            element={
              <Protected>
                <Interview />
              </Protected>
            }
          />
          <Route
            path="/interviews/session"
            element={
              <Protected>
                <InterviewSession />
              </Protected>
            }
          />
          <Route
            path="/interviews/result"
            element={
              <Protected>
                <InterviewResult />
              </Protected>
            }
          />
          <Route
            path="/interviews/result/:id"
            element={
              <Protected>
                <InterviewResult />
              </Protected>
            }
          />
          <Route
            path="/interviews/history"
            element={
              <Protected>
                <InterviewHistory />
              </Protected>
            }
          />
          <Route
            path="/performance"
            element={
              <Protected>
                <Performance />
              </Protected>
            }
          />
          <Route
            path="/job-analyzer"
            element={
              <Protected>
                <JobAnalyzer />
              </Protected>
            }
          />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
