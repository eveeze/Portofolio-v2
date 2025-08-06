// src/components/layouts/AdminLayout.tsx
import React, { useEffect, useRef, ReactNode } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import { gsap } from "gsap";

interface AdminLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({
  children,
  title,
  subtitle,
}) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const sidebarRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // GSAP entrance animations
    const tl = gsap.timeline();

    if (sidebarRef.current && headerRef.current && contentRef.current) {
      // Set initial states
      gsap.set([sidebarRef.current, headerRef.current, contentRef.current], {
        opacity: 0,
      });

      gsap.set(sidebarRef.current, { x: -100 });
      gsap.set(headerRef.current, { y: -50 });
      gsap.set(contentRef.current, { y: 30 });

      // Animate entrance
      tl.to(sidebarRef.current, {
        duration: 0.6,
        opacity: 1,
        x: 0,
        ease: "power2.out",
      })
        .to(
          headerRef.current,
          {
            duration: 0.5,
            opacity: 1,
            y: 0,
            ease: "power2.out",
          },
          "-=0.3"
        )
        .to(
          contentRef.current,
          {
            duration: 0.6,
            opacity: 1,
            y: 0,
            ease: "power2.out",
          },
          "-=0.2"
        );
    }
  }, []);

  const handleNavigation = (path: string) => {
    if (location.pathname === path) return;

    // Animate out and navigate
    if (contentRef.current) {
      gsap.to(contentRef.current, {
        duration: 0.3,
        opacity: 0,
        x: -30,
        ease: "power2.in",
        onComplete: () => {
          navigate(path);
        },
      });
    }
  };

  const handleLogout = () => {
    // Animate logout
    if (headerRef.current && contentRef.current) {
      const tl = gsap.timeline({
        onComplete: logout,
      });

      tl.to([headerRef.current, contentRef.current], {
        duration: 0.4,
        opacity: 0,
        y: -30,
        stagger: 0.1,
        ease: "power2.in",
      });
    }
  };

  const isCurrentPath = (path: string) => {
    return location.pathname === path;
  };

  const navigationItems = [
    {
      path: "/admin/dashboard",
      label: "Dashboard",
      icon: "📊",
    },
    {
      path: "/admin/techstack",
      label: "Tech Stack",
      icon: "⚙️",
    },
    {
      path: "/admin/projects",
      label: "Projects",
      icon: "📁",
    },
    {
      path: "/admin/articles",
      label: "Articles",
      icon: "💬",
    },
    {
      path: "/admin/settings",
      label: "Settings",
      icon: "🔧",
    },
  ];

  return (
    <div className="min-h-screen bg-background2 flex">
      {/* Sidebar */}
      <div
        ref={sidebarRef}
        className="w-64 bg-background border-r border-gray-800 flex flex-col"
      >
        <div className="p-6 border-b border-gray-800">
          <h2 className="text-whiteText text-xl font-bold font-['Oggs']">
            Admin Panel
          </h2>
          <p className="text-grayText text-sm mt-1">
            Welcome, {user?.username}
          </p>
        </div>

        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {navigationItems.map((item) => (
              <li key={item.path}>
                <button
                  onClick={() => handleNavigation(item.path)}
                  className={`w-full flex items-center px-4 py-3 rounded-lg text-left transition-all duration-200 ${
                    isCurrentPath(item.path)
                      ? "bg-blue-600 text-white"
                      : "text-grayText hover:bg-gray-800 hover:text-whiteText"
                  }`}
                >
                  <span className="mr-3">{item.icon}</span>
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <div className="p-4 border-t border-gray-800">
          <button
            onClick={handleLogout}
            className="w-full flex items-center px-4 py-3 text-red-400 hover:bg-red-900/20 rounded-lg transition-all duration-200"
          >
            <span className="mr-3">🚪</span>
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header
          ref={headerRef}
          className="bg-background border-b border-gray-800 px-8 py-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-whiteText">{title}</h1>
              {subtitle && (
                <p className="text-grayText text-sm mt-1">{subtitle}</p>
              )}
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <button className="p-2 text-grayText hover:text-whiteText transition-colors">
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 17h5l-5 5h5m-5-10v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2h8a2 2 0 012 2z"
                    />
                  </svg>
                </button>
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  3
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main ref={contentRef} className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
