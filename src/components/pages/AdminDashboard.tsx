// src/components/pages/AdminDashboard.tsx
import { useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { gsap } from "gsap";
import AdminLayout from "../layouts/AdminLayout";

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
  const navigate = useNavigate();
  const cardsRef = useRef<HTMLDivElement>(null);
  const quickActionsRef = useRef<HTMLDivElement>(null);
  const activityRef = useRef<HTMLDivElement>(null);

  // Mock data
  const dashboardCards: DashboardCard[] = [
    {
      title: "Total Projects",
      value: 12,
      icon: "📁",
      trend: { value: 2, direction: "up" },
    },
    {
      title: "Tech Stacks",
      value: 24,
      icon: "⚙️",
      trend: { value: 3, direction: "up" },
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
  ];

  useEffect(() => {
    // Entrance animations for content elements
    const tl = gsap.timeline({ delay: 0.5 }); // Delay to let layout animate first

    if (cardsRef.current && quickActionsRef.current && activityRef.current) {
      gsap.set(
        [cardsRef.current, quickActionsRef.current, activityRef.current],
        {
          opacity: 0,
          y: 30,
        }
      );

      tl.to(cardsRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.6,
        ease: "power2.out",
      })
        .to(
          quickActionsRef.current,
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: "power2.out",
          },
          "-=0.3"
        )
        .to(
          activityRef.current,
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: "power2.out",
          },
          "-=0.3"
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
            delay: 0.7 + index * 0.1,
            ease: "back.out(1.7)",
          }
        );
      });
    }
  }, []);

  const handleNavigation = (path: string) => {
    // Animate out and navigate
    if (cardsRef.current) {
      gsap.to(
        [cardsRef.current, quickActionsRef.current, activityRef.current],
        {
          duration: 0.3,
          opacity: 0,
          x: -30,
          stagger: 0.1,
          ease: "power2.in",
          onComplete: () => {
            navigate(path);
          },
        }
      );
    }
  };

  return (
    <AdminLayout
      title="Dashboard"
      subtitle="Monitor your portfolio performance and manage your content"
    >
      <div className="p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Stats Cards */}
          <div
            ref={cardsRef}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
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

          {/* Quick Actions */}
          <div
            ref={quickActionsRef}
            className="bg-background border border-gray-800 rounded-lg p-6"
          >
            <h3 className="text-whiteText text-lg font-semibold mb-6">
              Quick Actions
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <button
                onClick={() => handleNavigation("/admin/techstack")}
                className="flex items-center p-4 bg-blue-600/10 border border-blue-600/20 rounded-lg hover:bg-blue-600/20 transition-all duration-200 group"
              >
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center mr-3 group-hover:scale-110 transition-transform">
                  <span className="text-white text-lg">⚙️</span>
                </div>
                <div className="text-left">
                  <h4 className="text-whiteText font-medium">Tech Stack</h4>
                  <p className="text-grayText text-sm">Manage technologies</p>
                </div>
              </button>

              <button
                onClick={() => handleNavigation("/admin/projects")}
                className="flex items-center p-4 bg-green-600/10 border border-green-600/20 rounded-lg hover:bg-green-600/20 transition-all duration-200 group"
              >
                <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center mr-3 group-hover:scale-110 transition-transform">
                  <span className="text-white text-lg">📁</span>
                </div>
                <div className="text-left">
                  <h4 className="text-whiteText font-medium">Projects</h4>
                  <p className="text-grayText text-sm">Manage portfolio</p>
                </div>
              </button>

              <button
                onClick={() => handleNavigation("/admin/messages")}
                className="flex items-center p-4 bg-purple-600/10 border border-purple-600/20 rounded-lg hover:bg-purple-600/20 transition-all duration-200 group"
              >
                <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center mr-3 group-hover:scale-110 transition-transform">
                  <span className="text-white text-lg">💬</span>
                </div>
                <div className="text-left">
                  <h4 className="text-whiteText font-medium">Messages</h4>
                  <p className="text-grayText text-sm">View contacts</p>
                </div>
              </button>

              <button
                onClick={() => handleNavigation("/admin/settings")}
                className="flex items-center p-4 bg-yellow-600/10 border border-yellow-600/20 rounded-lg hover:bg-yellow-600/20 transition-all duration-200 group"
              >
                <div className="w-10 h-10 bg-yellow-600 rounded-lg flex items-center justify-center mr-3 group-hover:scale-110 transition-transform">
                  <span className="text-white text-lg">🔧</span>
                </div>
                <div className="text-left">
                  <h4 className="text-whiteText font-medium">Settings</h4>
                  <p className="text-grayText text-sm">System preferences</p>
                </div>
              </button>

              <button
                onClick={() => window.open("/", "_blank")}
                className="flex items-center p-4 bg-indigo-600/10 border border-indigo-600/20 rounded-lg hover:bg-indigo-600/20 transition-all duration-200 group"
              >
                <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center mr-3 group-hover:scale-110 transition-transform">
                  <span className="text-white text-lg">🌐</span>
                </div>
                <div className="text-left">
                  <h4 className="text-whiteText font-medium">View Site</h4>
                  <p className="text-grayText text-sm">Open portfolio</p>
                </div>
              </button>

              <button className="flex items-center p-4 bg-gray-600/10 border border-gray-600/20 rounded-lg hover:bg-gray-600/20 transition-all duration-200 group">
                <div className="w-10 h-10 bg-gray-600 rounded-lg flex items-center justify-center mr-3 group-hover:scale-110 transition-transform">
                  <span className="text-white text-lg">📊</span>
                </div>
                <div className="text-left">
                  <h4 className="text-whiteText font-medium">Analytics</h4>
                  <p className="text-grayText text-sm">Coming soon</p>
                </div>
              </button>
            </div>
          </div>

          {/* Recent Activity */}
          <div
            ref={activityRef}
            className="bg-background border border-gray-800 rounded-lg p-6"
          >
            <h3 className="text-whiteText text-lg font-semibold mb-6">
              Recent Activity
            </h3>
            <div className="space-y-4">
              {[
                {
                  action: "New tech stack added: React",
                  time: "2 hours ago",
                  type: "success",
                  icon: "⚙️",
                },
                {
                  action: "Project updated: Portfolio Website",
                  time: "4 hours ago",
                  type: "info",
                  icon: "📁",
                },
                {
                  action: "New message received",
                  time: "6 hours ago",
                  type: "info",
                  icon: "💬",
                },
                {
                  action: "Tech stack reordered",
                  time: "1 day ago",
                  type: "warning",
                  icon: "🔄",
                },
                {
                  action: "System backup completed",
                  time: "2 days ago",
                  type: "success",
                  icon: "💾",
                },
              ].map((activity, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-4 p-3 hover:bg-gray-800/50 rounded-lg transition-all duration-200"
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                      activity.type === "success"
                        ? "bg-green-600/20 text-green-400"
                        : activity.type === "info"
                          ? "bg-blue-600/20 text-blue-400"
                          : "bg-yellow-600/20 text-yellow-400"
                    }`}
                  >
                    {activity.icon}
                  </div>
                  <div className="flex-1">
                    <p className="text-whiteText text-sm">{activity.action}</p>
                    <p className="text-grayText text-xs">{activity.time}</p>
                  </div>
                  <div
                    className={`w-2 h-2 rounded-full ${
                      activity.type === "success"
                        ? "bg-green-500"
                        : activity.type === "info"
                          ? "bg-blue-500"
                          : "bg-yellow-500"
                    }`}
                  ></div>
                </div>
              ))}
            </div>
          </div>

          {/* System Status */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-background border border-gray-800 rounded-lg p-6">
              <h3 className="text-whiteText text-lg font-semibold mb-4">
                System Status
              </h3>
              <div className="space-y-3">
                {[
                  {
                    service: "Database",
                    status: "Operational",
                    uptime: "99.9%",
                  },
                  { service: "API", status: "Operational", uptime: "99.8%" },
                  { service: "Storage", status: "Operational", uptime: "100%" },
                  { service: "CDN", status: "Operational", uptime: "99.7%" },
                ].map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-whiteText text-sm">
                        {item.service}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-green-400 text-xs">
                        {item.status}
                      </span>
                      <p className="text-grayText text-xs">
                        {item.uptime} uptime
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-background border border-gray-800 rounded-lg p-6">
              <h3 className="text-whiteText text-lg font-semibold mb-4">
                Quick Stats
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-grayText text-sm">
                    Total Visitors Today
                  </span>
                  <span className="text-whiteText font-medium">1,234</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-grayText text-sm">
                    Contact Form Submissions
                  </span>
                  <span className="text-whiteText font-medium">23</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-grayText text-sm">Portfolio Views</span>
                  <span className="text-whiteText font-medium">567</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-grayText text-sm">
                    Download Requests
                  </span>
                  <span className="text-whiteText font-medium">89</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
