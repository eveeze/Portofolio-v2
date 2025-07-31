// src/components/pages/AdminDashboard.tsx
import React, { useEffect, useRef, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { gsap } from "gsap";

interface DashboardCard {
  title: string;
  value: string | number;
  icon: string;
  trend?: {
    value: number;
    direction: "up" | "down";
  };
}

const AdminDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<
    "overview" | "projects" | "messages" | "settings"
  >("overview");

  const headerRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);

  // Mock data
  const dashboardCards: DashboardCard[] = [
    {
      title: "Total Projects",
      value: 12,
      icon: "📁",
      trend: { value: 2, direction: "up" },
    },
    {
      title: "Messages",
      value: 45,
      icon: "💬",
      trend: { value: 5, direction: "up" },
    },
    {
      title: "Page Views",
      value: "2.4K",
      icon: "👁️",
      trend: { value: 12, direction: "up" },
    },
    {
      title: "Uptime",
      value: "99.9%",
      icon: "⚡",
      trend: { value: 0.1, direction: "down" },
    },
  ];

  useEffect(() => {
    // GSAP entrance animations
    const tl = gsap.timeline();

    if (
      sidebarRef.current &&
      headerRef.current &&
      cardsRef.current &&
      contentRef.current
    ) {
      // Set initial states
      gsap.set(
        [
          sidebarRef.current,
          headerRef.current,
          cardsRef.current,
          contentRef.current,
        ],
        {
          opacity: 0,
        }
      );

      gsap.set(sidebarRef.current, { x: -100 });
      gsap.set(headerRef.current, { y: -50 });
      gsap.set(cardsRef.current, { y: 30 });
      gsap.set(contentRef.current, { y: 50 });

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
          cardsRef.current,
          {
            duration: 0.6,
            opacity: 1,
            y: 0,
            ease: "power2.out",
          },
          "-=0.2"
        )
        .to(
          contentRef.current,
          {
            duration: 0.7,
            opacity: 1,
            y: 0,
            ease: "power2.out",
          },
          "-=0.4"
        );

      // Animate cards individually
      const cards = cardsRef.current.children;
      Array.from(cards).forEach((card, index) => {
        gsap.fromTo(
          card,
          { scale: 0.8, opacity: 0 },
          {
            scale: 1,
            opacity: 1,
            duration: 0.4,
            delay: index * 0.1,
            ease: "back.out(1.7)",
          }
        );
      });
    }
  }, []);

  const handleTabChange = (tab: typeof activeTab) => {
    if (contentRef.current) {
      gsap.to(contentRef.current, {
        duration: 0.2,
        opacity: 0,
        y: 10,
        onComplete: () => {
          setActiveTab(tab);
          gsap.to(contentRef.current, {
            duration: 0.3,
            opacity: 1,
            y: 0,
            ease: "power2.out",
          });
        },
      });
    }
  };

  const handleLogout = () => {
    // Animate logout
    if (headerRef.current && cardsRef.current && contentRef.current) {
      const tl = gsap.timeline({
        onComplete: logout,
      });

      tl.to([headerRef.current, cardsRef.current, contentRef.current], {
        duration: 0.4,
        opacity: 0,
        y: -30,
        stagger: 0.1,
        ease: "power2.in",
      });
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return (
          <div className="space-y-6">
            <div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
              ref={cardsRef}
            >
              {dashboardCards.map((card, index) => (
                <div
                  key={index}
                  className="bg-background border border-gray-800 rounded-lg p-6 hover:border-gray-700 transition-all duration-300 cursor-pointer transform hover:scale-105"
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-2xl">{card.icon}</span>
                    {card.trend && (
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          card.trend.direction === "up"
                            ? "bg-green-900 text-green-400"
                            : "bg-red-900 text-red-400"
                        }`}
                      >
                        {card.trend.direction === "up" ? "↗" : "↘"}{" "}
                        {card.trend.value}%
                      </span>
                    )}
                  </div>
                  <h3 className="text-grayText text-sm font-medium">
                    {card.title}
                  </h3>
                  <p className="text-whiteText text-2xl font-bold mt-1">
                    {card.value}
                  </p>
                </div>
              ))}
            </div>

            {/* Recent Activity */}
            <div className="bg-background border border-gray-800 rounded-lg p-6">
              <h3 className="text-whiteText text-lg font-semibold mb-4">
                Recent Activity
              </h3>
              <div className="space-y-3">
                {[
                  {
                    action: "New project added",
                    time: "2 hours ago",
                    type: "success",
                  },
                  {
                    action: "Message received",
                    time: "4 hours ago",
                    type: "info",
                  },
                  {
                    action: "Portfolio updated",
                    time: "1 day ago",
                    type: "warning",
                  },
                ].map((activity, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between py-2 border-b border-gray-800 last:border-b-0"
                  >
                    <div className="flex items-center">
                      <div
                        className={`w-2 h-2 rounded-full mr-3 ${
                          activity.type === "success"
                            ? "bg-green-500"
                            : activity.type === "info"
                              ? "bg-blue-500"
                              : "bg-yellow-500"
                        }`}
                      ></div>
                      <span className="text-whiteText">{activity.action}</span>
                    </div>
                    <span className="text-grayText text-sm">
                      {activity.time}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case "projects":
        return (
          <div className="bg-background border border-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-whiteText text-lg font-semibold">
                Project Management
              </h3>
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors">
                Add Project
              </button>
            </div>
            <div className="text-grayText text-center py-12">
              <div className="text-4xl mb-4">🚧</div>
              <p>Project management interface coming soon...</p>
            </div>
          </div>
        );

      case "messages":
        return (
          <div className="bg-background border border-gray-800 rounded-lg p-6">
            <h3 className="text-whiteText text-lg font-semibold mb-6">
              Messages
            </h3>
            <div className="text-grayText text-center py-12">
              <div className="text-4xl mb-4">📧</div>
              <p>Message management interface coming soon...</p>
            </div>
          </div>
        );

      case "settings":
        return (
          <div className="bg-background border border-gray-800 rounded-lg p-6">
            <h3 className="text-whiteText text-lg font-semibold mb-6">
              Settings
            </h3>
            <div className="space-y-4">
              <div className="border-b border-gray-800 pb-4">
                <h4 className="text-whiteText font-medium mb-2">Account</h4>
                <p className="text-grayText text-sm">
                  Manage your account settings and preferences
                </p>
              </div>
              <div className="border-b border-gray-800 pb-4">
                <h4 className="text-whiteText font-medium mb-2">Security</h4>
                <p className="text-grayText text-sm">
                  Configure security settings and authentication
                </p>
              </div>
              <div>
                <h4 className="text-whiteText font-medium mb-2">Appearance</h4>
                <p className="text-grayText text-sm">
                  Customize the look and feel of your dashboard
                </p>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

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
            {[
              { id: "overview", label: "Overview", icon: "📊" },
              { id: "projects", label: "Projects", icon: "📁" },
              { id: "messages", label: "Messages", icon: "💬" },
              { id: "settings", label: "Settings", icon: "⚙️" },
            ].map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => handleTabChange(item.id as typeof activeTab)}
                  className={`w-full flex items-center px-4 py-3 rounded-lg text-left transition-all duration-200 ${
                    activeTab === item.id
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
              <h1 className="text-2xl font-bold text-whiteText capitalize">
                {activeTab}
              </h1>
              <p className="text-grayText text-sm mt-1">
                {activeTab === "overview" &&
                  "Monitor your portfolio performance"}
                {activeTab === "projects" &&
                  "Manage your projects and portfolio"}
                {activeTab === "messages" && "View and respond to messages"}
                {activeTab === "settings" && "Configure your preferences"}
              </p>
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
        <main ref={contentRef} className="flex-1 p-8">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
