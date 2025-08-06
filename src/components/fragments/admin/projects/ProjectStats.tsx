import React from "react";

interface ProjectStatsProps {
  totalProjects: number;
  totalImages: number;
  projectsByType: Record<string, number>;
}

const ProjectStats: React.FC<ProjectStatsProps> = ({
  totalProjects,
  totalImages,
  projectsByType,
}) => {
  const getTypeIcon = (type: string) => {
    const icons = {
      website: "🌐",
      mobile: "📱",
      backend: "⚙️",
      desktop: "💻",
      other: "📦",
    };
    return icons[type as keyof typeof icons] || "📦";
  };

  const getTypeColor = (type: string) => {
    const colors = {
      website: "text-blue-400",
      mobile: "text-green-400",
      backend: "text-purple-400",
      desktop: "text-yellow-400",
      other: "text-gray-400",
    };
    return colors[type as keyof typeof colors] || "text-gray-400";
  };

  const formatTypeName = (type: string) => {
    const names = {
      website: "Websites",
      mobile: "Mobile Apps",
      backend: "Backend",
      desktop: "Desktop Apps",
      other: "Other",
    };
    return names[type as keyof typeof names] || "Other";
  };

  const stats = [
    {
      label: "Total Projects",
      value: totalProjects,
      icon: (
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
            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
          />
        </svg>
      ),
      color: "text-blue-400",
      bgColor: "bg-blue-500/10",
      borderColor: "border-blue-500/20",
    },
    {
      label: "Total Images",
      value: totalImages,
      icon: (
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
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      ),
      color: "text-green-400",
      bgColor: "bg-green-500/10",
      borderColor: "border-green-500/20",
    },
  ];

  // Calculate most common project type
  const mostCommonType = Object.entries(projectsByType).reduce(
    (max, [type, count]) => (count > max.count ? { type, count } : max),
    { type: "", count: 0 }
  );

  if (mostCommonType.count > 0) {
    stats.push({
      label: "Most Common",
      value: mostCommonType.count,
      icon: <span className="text-xl">{getTypeIcon(mostCommonType.type)}</span>,
      color: getTypeColor(mostCommonType.type),
      bgColor: "bg-purple-500/10",
      borderColor: "border-purple-500/20",
    });
  }

  // Calculate average images per project
  const avgImages =
    totalProjects > 0 ? Math.round((totalImages / totalProjects) * 10) / 10 : 0;

  stats.push({
    label: "Avg Images/Project",
    value: avgImages,
    icon: (
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
          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
        />
      </svg>
    ),
    color: "text-orange-400",
    bgColor: "bg-orange-500/10",
    borderColor: "border-orange-500/20",
  });

  return (
    <div className="mb-8">
      {/* Main Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((stat, index) => (
          <div
            key={index}
            className={`bg-background border rounded-xl p-4 ${stat.borderColor} hover:shadow-lg transition-all duration-200 transform hover:scale-105`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-grayText text-sm font-medium mb-1">
                  {stat.label}
                </p>
                <p className={`text-2xl font-bold ${stat.color}`}>
                  {typeof stat.value === "number"
                    ? stat.value.toLocaleString()
                    : stat.value}
                </p>
              </div>
              <div className={`p-3 rounded-lg ${stat.bgColor} ${stat.color}`}>
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Project Types Breakdown */}
      {Object.keys(projectsByType).length > 0 && (
        <div className="bg-background border border-gray-800 rounded-xl p-6">
          <h3 className="text-whiteText font-semibold mb-4">
            Projects by Type
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(projectsByType)
              .filter(([_, count]) => count > 0)
              .sort(([, a], [, b]) => b - a)
              .map(([type, count]) => (
                <div
                  key={type}
                  className="flex items-center justify-between p-3 bg-background2 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-xl">{getTypeIcon(type)}</span>
                    <div>
                      <p className="text-whiteText font-medium text-sm">
                        {formatTypeName(type)}
                      </p>
                      <p className="text-grayText text-xs">
                        {Math.round((count / totalProjects) * 100)}% of total
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-lg font-bold ${getTypeColor(type)}`}>
                      {count}
                    </p>
                  </div>
                </div>
              ))}
          </div>

          {/* Progress Bars */}
          <div className="mt-4 space-y-2">
            {Object.entries(projectsByType)
              .filter(([_, count]) => count > 0)
              .sort(([, a], [, b]) => b - a)
              .map(([type, count]) => {
                const percentage = (count / totalProjects) * 100;
                return (
                  <div
                    key={`${type}-progress`}
                    className="flex items-center space-x-3"
                  >
                    <div className="w-20 text-xs text-grayText truncate">
                      {formatTypeName(type)}
                    </div>
                    <div className="flex-1 bg-gray-800 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-500 ${
                          type === "website"
                            ? "bg-blue-500"
                            : type === "mobile"
                              ? "bg-green-500"
                              : type === "backend"
                                ? "bg-purple-500"
                                : type === "desktop"
                                  ? "bg-yellow-500"
                                  : "bg-gray-500"
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <div className="w-12 text-xs text-grayText text-right">
                      {count}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectStats;
