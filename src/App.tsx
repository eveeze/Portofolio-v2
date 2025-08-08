// src/App.tsx
import About from "./components/pages/About";
import Home from "./components/pages/Home";
import Contact from "./components/pages/Contact";
import Project from "./components/pages/Project";
import AdminLogin from "./components/pages/AdminLogin";
import AdminRegister from "./components/pages/AdminRegister";
import AdminDashboard from "./components/pages/AdminDashboard";
import AdminTechStack from "./components/pages/AdminTechStack";
import AdminProjects from "./components/pages/AdminProjects";
import AdminArticles from "./components/pages/AdminArticles";
import CreateArticle from "./components/pages/CreateArticle";
import EditArticle from "./components/pages/EditArticle";
import Navbar from "./components/ui/Navbar";
import ProtectedRoute from "./components/ui/ProtectedRoute";
import Preloader from "./components/ui/Preloader";
import { AuthProvider } from "./contexts/AuthContext";
import { AnalyticsProvider } from "./providers/AnalyticsProvider";
import { Routes, Route, Navigate } from "react-router-dom";

const App = () => {
  return (
    <AuthProvider>
      <AnalyticsProvider>
        <Preloader>
          <Routes>
            {/* Public Routes */}
            <Route
              path="/"
              element={
                <>
                  <Navbar />
                  <Home />
                </>
              }
            />
            <Route
              path="/about"
              element={
                <>
                  <Navbar />
                  <About />
                </>
              }
            />
            <Route
              path="/project"
              element={
                <>
                  <Navbar />
                  <Project />
                </>
              }
            />
            <Route
              path="/contact"
              element={
                <>
                  <Navbar />
                  <Contact />
                </>
              }
            />

            {/* Admin Authentication Routes */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/register" element={<AdminRegister />} />

            {/* Protected Admin Routes */}
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/techstack"
              element={
                <ProtectedRoute>
                  <AdminTechStack />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/projects"
              element={
                <ProtectedRoute>
                  <AdminProjects />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/articles"
              element={
                <ProtectedRoute>
                  <AdminArticles />
                </ProtectedRoute>
              }
            />
            {/* Article Management Routes */}
            <Route
              path="/admin/articles/create"
              element={
                <ProtectedRoute>
                  <CreateArticle />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/articles/edit/:id"
              element={
                <ProtectedRoute>
                  <EditArticle />
                </ProtectedRoute>
              }
            />

            {/* Admin redirect - default to dashboard */}
            <Route
              path="/admin"
              element={<Navigate to="/admin/dashboard" replace />}
            />

            {/* 404 fallback - redirect to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Preloader>
      </AnalyticsProvider>
    </AuthProvider>
  );
};

export default App;
