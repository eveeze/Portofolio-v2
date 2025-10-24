// src/App.tsx (Updated)
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
import { LenisProvider } from "./providers/LenisProvider";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useEffect } from "react";

// Layout wrapper untuk halaman publik
const PublicLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">{children}</main>
    </div>
  );
};

// ScrollToTop component untuk reset scroll position saat route change
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

const App = () => {
  return (
    <AuthProvider>
      <AnalyticsProvider>
        <LenisProvider
          options={{
            duration: 1.2,
            easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            smooth: true,
            smoothTouch: false,
            touchMultiplier: 2,
            wheelMultiplier: 1,
            normalizeWheel: true,
          }}
        >
          <Preloader>
            <ScrollToTop />
            <Routes>
              {/* Public Routes */}
              <Route
                path="/"
                element={
                  <PublicLayout>
                    <Home />
                  </PublicLayout>
                }
              />
              <Route
                path="/about"
                element={
                  <PublicLayout>
                    <About />
                  </PublicLayout>
                }
              />
              <Route
                path="/project"
                element={
                  <PublicLayout>
                    <Project />
                  </PublicLayout>
                }
              />
              <Route
                path="/contact"
                element={
                  <PublicLayout>
                    <Contact />
                  </PublicLayout>
                }
              />

              {/* Admin Authentication Routes - No Footer */}
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin/register" element={<AdminRegister />} />

              {/* Protected Admin Routes - No Footer */}
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
        </LenisProvider>
      </AnalyticsProvider>
    </AuthProvider>
  );
};

export default App;
