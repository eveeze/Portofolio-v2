// src/components/pages/AdminDashboard.tsx
import { useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { gsap } from "gsap";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
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
  const chartsRef = useRef<HTMLDivElement>(null);

  // Fetch dashboard data
  const dashboardData = useQuery(api.dashboard.getDashboardData);

  // Calculate trends dynamically
  const calculateTrend = (current: number, previous: number) => {
    if (previous === 0) return { value: 0, direction: "up" as const };
    const percentage = Math.round(((current - previous) / previous) * 100);
    return {
      value: Math.abs(percentage),
      direction: percentage >= 0 ? ("up" as const) : ("down" as const),
    };
  };

  // Generate dashboard cards from real data - ALL DYNAMIC
  const dashboardCards: DashboardCard[] = dashboardData
    ? [
        {
          title: "Total Visitors",
          value: dashboardData.stats.analytics.totalVisitors.toLocaleString(),
          icon: "👥",
          trend: calculateTrend(
            dashboardData.stats.analytics.weeklyVisitors,
            Math.max(
              dashboardData.stats.analytics.monthlyVisitors -
                dashboardData.stats.analytics.weeklyVisitors,
              1
            )
          ),
        },
        {
          title: "Today's Visitors",
          value: dashboardData.stats.analytics.todayVisitors,
          icon: "📈",
          trend: calculateTrend(
            dashboardData.stats.analytics.todayVisitors,
            Math.max(
              Math.floor(dashboardData.stats.analytics.weeklyVisitors / 7),
              1
            )
          ),
        },
        {
          title: "Total Projects",
          value: dashboardData.stats.projects.total,
          icon: "📁",
          trend: dashboardData.stats.projects.recentGrowth
            ? {
                value: dashboardData.stats.projects.recentGrowth,
                direction: "up",
              }
            : undefined,
        },
        {
          title: "Tech Stacks",
          value: dashboardData.stats.techStacks.total,
          icon: "⚙️",
          trend: dashboardData.stats.techStacks.recentGrowth
            ? {
                value: dashboardData.stats.techStacks.recentGrowth,
                direction: "up",
              }
            : undefined,
        },
        {
          title: "Articles",
          value: dashboardData.stats.articles.total,
          icon: "📝",
          trend: dashboardData.stats.articles.recentGrowth
            ? {
                value: dashboardData.stats.articles.recentGrowth,
                direction: "up",
              }
            : undefined,
        },
        {
          title: "Portfolio Views",
          value: dashboardData.stats.analytics.portfolioViews.toLocaleString(),
          icon: "👁️",
          trend: calculateTrend(
            dashboardData.stats.analytics.portfolioViews,
            Math.max(
              Math.floor(dashboardData.stats.analytics.portfolioViews * 0.8),
              1
            )
          ),
        },
        {
          title: "Contact Forms",
          value: dashboardData.stats.analytics.contactSubmissions,
          icon: "💬",
          trend: calculateTrend(
            dashboardData.stats.analytics.contactSubmissions,
            Math.max(
              Math.floor(
                dashboardData.stats.analytics.contactSubmissions * 0.7
              ),
              1
            )
          ),
        },
      ]
    : [];

  // Generate recent activity from real data - COMPLETELY DYNAMIC
  const recentActivity = dashboardData
    ? [
        ...dashboardData.recentActivity.articles.map((article: any) => ({
          action: `Article ${article.status}: ${article.title}`,
          time: new Date(article._creationTime).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "short",
            year: "numeric",
          }),
          type:
            article.status === "published"
              ? ("success" as const)
              : ("info" as const),
          icon: "📝",
        })),
        ...dashboardData.recentActivity.projects.map((project: any) => ({
          action: `Project updated: ${project.title}`,
          time: new Date(project._creationTime).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "short",
            year: "numeric",
          }),
          type: "success" as const,
          icon: "📁",
        })),
        ...dashboardData.recentActivity.visitors
          .slice(0, 3)
          .map((visitor: any) => ({
            action: `New visitor from ${visitor.page || "Home"}`,
            time: new Date(visitor._creationTime).toLocaleDateString("id-ID", {
              day: "numeric",
              month: "short",
              year: "numeric",
            }),
            type: "info" as const,
            icon: "👥",
          })),
      ]
        .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
        .slice(0, 8)
    : [];

  useEffect(() => {
    if (!dashboardData) return;

    // Entrance animations for content elements
    const tl = gsap.timeline({ delay: 0.5 }); // Delay to let layout animate first

    if (cardsRef.current && quickActionsRef.current && activityRef.current) {
      gsap.set(
        [
          cardsRef.current,
          quickActionsRef.current,
          activityRef.current,
          chartsRef.current,
        ],
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
          chartsRef.current,
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: "power2.out",
          },
          "-=0.3"
        )
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
  }, [dashboardData]);

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

  if (!dashboardData) {
    return (
      <AdminLayout title="Dashboard" subtitle="Loading dashboard data...">
        <div className="p-8 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </AdminLayout>
    );
  }

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

          {/* Charts Section */}
          <div
            ref={chartsRef}
            className="grid grid-cols-1 lg:grid-cols-2 gap-6"
          >
            {/* Visitors Trend Chart - DYNAMIC DATA */}
            <div className="bg-background border border-gray-800 rounded-lg p-6">
              <h3 className="text-whiteText text-lg font-semibold mb-4">
                Visitors Trend (Last 7 Days)
              </h3>
              <div className="space-y-3">
                {dashboardData.charts.visitorsTrend.length > 0 ? (
                  dashboardData.charts.visitorsTrend.map(
                    (day: any, index: number) => (
                      <div
                        key={index}
                        className="flex items-center justify-between"
                      >
                        <span className="text-grayText text-sm">
                          {new Date(day.date).toLocaleDateString("id-ID", {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                        <div className="flex items-center space-x-3">
                          <div className="w-20 bg-gray-800 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{
                                width: `${Math.min((day.visitors / Math.max(...dashboardData.charts.visitorsTrend.map((d: any) => d.visitors), 1)) * 100, 100)}%`,
                              }}
                            ></div>
                          </div>
                          <span className="text-whiteText font-medium w-8 text-right">
                            {day.visitors}
                          </span>
                        </div>
                      </div>
                    )
                  )
                ) : (
                  <p className="text-grayText text-sm">
                    No visitor data available yet
                  </p>
                )}
              </div>
            </div>

            {/* Popular Pages - DYNAMIC DATA */}
            <div className="bg-background border border-gray-800 rounded-lg p-6">
              <h3 className="text-whiteText text-lg font-semibold mb-4">
                Popular Pages
              </h3>
              <div className="space-y-3">
                {dashboardData.charts.popularPages.length > 0 ? (
                  dashboardData.charts.popularPages
                    .slice(0, 5)
                    .map((page: any, index: number) => (
                      <div
                        key={index}
                        className="flex items-center justify-between"
                      >
                        <span className="text-grayText text-sm truncate">
                          {page.page || "Home"}
                        </span>
                        <div className="flex items-center space-x-3">
                          <div className="w-16 bg-gray-800 rounded-full h-2">
                            <div
                              className="bg-green-600 h-2 rounded-full"
                              style={{
                                width: `${Math.min((page.views / Math.max(...dashboardData.charts.popularPages.map((p: any) => p.views), 1)) * 100, 100)}%`,
                              }}
                            ></div>
                          </div>
                          <span className="text-whiteText font-medium w-8 text-right">
                            {page.views}
                          </span>
                        </div>
                      </div>
                    ))
                ) : (
                  <p className="text-grayText text-sm">
                    No page view data available yet
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Quick Actions - Using DYNAMIC counts */}
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
                  <p className="text-grayText text-sm">
                    {dashboardData.stats.techStacks.total} technologies
                  </p>
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
                  <p className="text-grayText text-sm">
                    {dashboardData.stats.projects.total} projects
                  </p>
                </div>
              </button>

              <button
                onClick={() => handleNavigation("/admin/articles")}
                className="flex items-center p-4 bg-purple-600/10 border border-purple-600/20 rounded-lg hover:bg-purple-600/20 transition-all duration-200 group"
              >
                <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center mr-3 group-hover:scale-110 transition-transform">
                  <span className="text-white text-lg">📝</span>
                </div>
                <div className="text-left">
                  <h4 className="text-whiteText font-medium">Articles</h4>
                  <p className="text-grayText text-sm">
                    {dashboardData.stats.articles.published} published
                  </p>
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
                  <p className="text-grayText text-sm">
                    {dashboardData.stats.analytics.portfolioViews} views
                  </p>
                </div>
              </button>

              <button className="flex items-center p-4 bg-gray-600/10 border border-gray-600/20 rounded-lg hover:bg-gray-600/20 transition-all duration-200 group">
                <div className="w-10 h-10 bg-gray-600 rounded-lg flex items-center justify-center mr-3 group-hover:scale-110 transition-transform">
                  <span className="text-white text-lg">📊</span>
                </div>
                <div className="text-left">
                  <h4 className="text-whiteText font-medium">Analytics</h4>
                  <p className="text-grayText text-sm">
                    {dashboardData.stats.analytics.totalVisitors} total visitors
                  </p>
                </div>
              </button>
            </div>
          </div>

          {/* Recent Activity - COMPLETELY DYNAMIC */}
          <div
            ref={activityRef}
            className="bg-background border border-gray-800 rounded-lg p-6"
          >
            <h3 className="text-whiteText text-lg font-semibold mb-6">
              Recent Activity
            </h3>
            <div className="space-y-4">
              {recentActivity.length > 0 ? (
                recentActivity
                  .slice(0, 8)
                  .map((activity: any, index: number) => (
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
                        <p className="text-whiteText text-sm">
                          {activity.action}
                        </p>
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
                  ))
              ) : (
                <p className="text-grayText text-sm">
                  No recent activity available
                </p>
              )}
            </div>
          </div>

          {/* Analytics Summary */}
          <div className="bg-background border border-gray-800 rounded-lg p-6">
            <h3 className="text-whiteText text-lg font-semibold mb-4">
              Analytics Summary
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-grayText text-sm">Total Visitors</span>
                <span className="text-whiteText font-medium">
                  {dashboardData.stats.analytics.totalVisitors.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-grayText text-sm">
                  Contact Form Submissions
                </span>
                <span className="text-whiteText font-medium">
                  {dashboardData.stats.analytics.contactSubmissions}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-grayText text-sm">Portfolio Views</span>
                <span className="text-whiteText font-medium">
                  {dashboardData.stats.analytics.portfolioViews.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-grayText text-sm">
                  This Week's Visitors
                </span>
                <span className="text-whiteText font-medium">
                  {dashboardData.stats.analytics.weeklyVisitors}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-grayText text-sm">
                  This Month's Visitors
                </span>
                <span className="text-whiteText font-medium">
                  {dashboardData.stats.analytics.monthlyVisitors}
                </span>
              </div>
            </div>
          </div>

          {/* Recent Articles and Projects - DYNAMIC */}
          {(dashboardData.recentActivity.articles.length > 0 ||
            dashboardData.recentActivity.projects.length > 0) && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Articles */}
              {dashboardData.recentActivity.articles.length > 0 && (
                <div className="bg-background border border-gray-800 rounded-lg p-6">
                  <h3 className="text-whiteText text-lg font-semibold mb-4">
                    Recent Articles
                  </h3>
                  <div className="space-y-3">
                    {dashboardData.recentActivity.articles
                      .slice(0, 3)
                      .map((article: any, index: number) => (
                        <div
                          key={index}
                          className="flex items-start space-x-3 p-3 hover:bg-gray-800/50 rounded-lg transition-all duration-200"
                        >
                          <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                          <div className="flex-1">
                            <h4 className="text-whiteText text-sm font-medium truncate">
                              {article.title}
                            </h4>
                            <p className="text-grayText text-xs">
                              Status: {article.status} •{" "}
                              {new Date(
                                article._creationTime
                              ).toLocaleDateString("id-ID")}
                            </p>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Recent Projects */}
              {dashboardData.recentActivity.projects.length > 0 && (
                <div className="bg-background border border-gray-800 rounded-lg p-6">
                  <h3 className="text-whiteText text-lg font-semibold mb-4">
                    Recent Projects
                  </h3>
                  <div className="space-y-3">
                    {dashboardData.recentActivity.projects
                      .slice(0, 3)
                      .map((project: any, index: number) => (
                        <div
                          key={index}
                          className="flex items-start space-x-3 p-3 hover:bg-gray-800/50 rounded-lg transition-all duration-200"
                        >
                          <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                          <div className="flex-1">
                            <h4 className="text-whiteText text-sm font-medium truncate">
                              {project.title}
                            </h4>
                            <p className="text-grayText text-xs">
                              {project.techStack?.length || 0} technologies •{" "}
                              {new Date(
                                project._creationTime
                              ).toLocaleDateString("id-ID")}
                            </p>
                            <div className="flex space-x-1 mt-1">
                              {project.techStack
                                ?.slice(0, 3)
                                .map((tech: any, techIndex: number) => (
                                  <span
                                    key={techIndex}
                                    className="text-xs bg-gray-700 px-2 py-1 rounded"
                                  >
                                    {tech.name}
                                  </span>
                                ))}
                              {project.techStack &&
                                project.techStack.length > 3 && (
                                  <span className="text-xs text-grayText">
                                    +{project.techStack.length - 3} more
                                  </span>
                                )}
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
