// src/components/ui/TechStackStats.tsx
import React, { useRef, useEffect } from "react";
import { gsap } from "gsap";

interface TechStackStatsProps {
  totalStacks: number;
  stacksByCategory: Record<string, number>;
  isLoading?: boolean;
}

const TechStackStats: React.FC<TechStackStatsProps> = ({
  totalStacks,
  stacksByCategory,
  isLoading = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current && !isLoading) {
      gsap.fromTo(
        containerRef.current,
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: "power2.out",
        }
      );

      if (cardsRef.current) {
        const cards = cardsRef.current.children;
        gsap.fromTo(
          cards,
          { scale: 0.8, opacity: 0 },
          {
            scale: 1,
            opacity: 1,
            duration: 0.6,
            stagger: 0.1,
            delay: 0.2,
            ease: "back.out(1.7)",
          }
        );
      }
    }
  }, [isLoading, totalStacks]);

  const getCategoryIcon = (category: string) => {
    const icons = {
      Frontend: "🎨",
      Backend: "⚙️",
      Database: "🗄️",
      DevOps: "🚀",
      Mobile: "📱",
      Design: "✨",
    };
    return icons[category as keyof typeof icons] || "🔧";
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      Frontend: "from-blue-500 to-blue-600",
      Backend: "from-green-500 to-green-600",
      Database: "from-purple-500 to-purple-600",
      DevOps: "from-orange-500 to-orange-600",
      Mobile: "from-pink-500 to-pink-600",
      Design: "from-yellow-500 to-yellow-600",
    };
    return (
      colors[category as keyof typeof colors] || "from-gray-500 to-gray-600"
    );
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, index) => (
          <div
            key={index}
            className="bg-background border border-gray-800 rounded-xl p-6"
          >
            <div className="animate-pulse">
              <div className="flex items-center justify-between mb-4">
                <div className="w-8 h-8 bg-gray-700 rounded-full"></div>
                <div className="w-12 h-6 bg-gray-700 rounded-full"></div>
              </div>
              <div className="w-20 h-4 bg-gray-700 rounded mb-2"></div>
              <div className="w-16 h-8 bg-gray-700 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  const totalCount = Object.values(stacksByCategory).reduce(
    (sum, count) => sum + count,
    0
  );
  const sortedCategories = Object.entries(stacksByCategory).sort(
    ([, a], [, b]) => b - a
  );

  return (
    <div ref={containerRef} className="mb-8">
      <div
        ref={cardsRef}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {/* Total Tech Stacks Card */}
        <div className="bg-background border border-gray-800 rounded-xl p-6 hover:border-gray-700 transition-all duration-300 group">
          <div className="flex items-center justify-between mb-4">
            <div className="text-3xl">📊</div>
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xs px-3 py-1 rounded-full font-medium">
              Total
            </div>
          </div>
          <h3 className="text-grayText text-sm font-medium mb-1">
            Total Tech Stacks
          </h3>
          <p className="text-whiteText text-3xl font-bold group-hover:text-blue-400 transition-colors">
            {totalStacks}
          </p>
          <div className="mt-3 flex items-center text-green-400 text-sm">
            <svg
              className="w-4 h-4 mr-1"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z"
                clipRule="evenodd"
              />
            </svg>
            <span>Active</span>
          </div>
        </div>

        {/* Top Categories */}
        {sortedCategories.slice(0, 3).map(([category, count], index) => {
          const percentage =
            totalCount > 0 ? Math.round((count / totalCount) * 100) : 0;

          return (
            <div
              key={category}
              className="bg-background border border-gray-800 rounded-xl p-6 hover:border-gray-700 transition-all duration-300 group"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="text-3xl">{getCategoryIcon(category)}</div>
                <div
                  className={`bg-gradient-to-r ${getCategoryColor(category)} text-white text-xs px-3 py-1 rounded-full font-medium`}
                >
                  {percentage}%
                </div>
              </div>
              <h3 className="text-grayText text-sm font-medium mb-1">
                {category}
              </h3>
              <p className="text-whiteText text-3xl font-bold group-hover:text-blue-400 transition-colors">
                {count}
              </p>
              <div className="mt-3">
                <div className="w-full bg-gray-800 rounded-full h-2">
                  <div
                    className={`bg-gradient-to-r ${getCategoryColor(category)} h-2 rounded-full transition-all duration-1000 ease-out`}
                    style={{
                      width: `${percentage}%`,
                      animationDelay: `${index * 0.2}s`,
                    }}
                  ></div>
                </div>
              </div>
            </div>
          );
        })}

        {/* Add placeholder if less than 3 categories */}
        {sortedCategories.length < 3 && (
          <div className="bg-background border border-gray-800 border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-center opacity-50">
            <div className="text-3xl mb-3">➕</div>
            <h3 className="text-grayText text-sm font-medium mb-1">Add More</h3>
            <p className="text-grayText text-sm">
              Add tech stacks to see more categories
            </p>
          </div>
        )}
      </div>

      {/* Category Breakdown */}
      {Object.keys(stacksByCategory).length > 0 && (
        <div className="mt-6 bg-background border border-gray-800 rounded-xl p-6">
          <h3 className="text-whiteText text-lg font-semibold mb-4 flex items-center">
            <span className="mr-2">📈</span>
            Category Breakdown
          </h3>
          <div className="space-y-3">
            {Object.entries(stacksByCategory)
              .sort(([, a], [, b]) => b - a)
              .map(([category, count]) => {
                const percentage =
                  totalCount > 0 ? Math.round((count / totalCount) * 100) : 0;

                return (
                  <div
                    key={category}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-xl">
                        {getCategoryIcon(category)}
                      </span>
                      <span className="text-whiteText font-medium">
                        {category}
                      </span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-24 bg-gray-800 rounded-full h-2">
                        <div
                          className={`bg-gradient-to-r ${getCategoryColor(category)} h-2 rounded-full transition-all duration-1000 ease-out`}
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      <span className="text-grayText text-sm w-12 text-right">
                        {count}
                      </span>
                      <span className="text-grayText text-xs w-10 text-right">
                        ({percentage}%)
                      </span>
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

export default TechStackStats;
