// src/components/ui/LoadingSkeleton.tsx
import React, { useRef, useEffect } from "react";
import { gsap } from "gsap";

interface LoadingSkeletonProps {
  type: "card" | "list" | "stats" | "form";
  count?: number;
}

const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  type,
  count = 6,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      const skeletons =
        containerRef.current.querySelectorAll(".skeleton-pulse");

      // Create floating animation for skeleton elements
      skeletons.forEach((skeleton, index) => {
        gsap.to(skeleton, {
          opacity: 0.3,
          duration: 1.5,
          repeat: -1,
          yoyo: true,
          delay: index * 0.2,
          ease: "power2.inOut",
        });
      });
    }
  }, []);

  const renderCardSkeleton = () => (
    <div className="bg-background border border-gray-800 rounded-xl p-6 animate-pulse">
      <div className="flex flex-col items-center">
        {/* Image placeholder */}
        <div className="w-16 h-16 bg-gray-700 rounded-lg mb-4 skeleton-pulse"></div>

        {/* Title placeholder */}
        <div className="w-24 h-4 bg-gray-700 rounded mb-2 skeleton-pulse"></div>

        {/* Category placeholder */}
        <div className="w-16 h-6 bg-gray-700 rounded-full skeleton-pulse"></div>
      </div>
    </div>
  );

  const renderListSkeleton = () => (
    <div className="bg-background border border-gray-800 rounded-xl p-4 animate-pulse">
      <div className="flex items-center space-x-4">
        {/* Icon placeholder */}
        <div className="w-12 h-12 bg-gray-700 rounded-lg flex-shrink-0 skeleton-pulse"></div>

        <div className="flex-1">
          {/* Title placeholder */}
          <div className="w-32 h-4 bg-gray-700 rounded mb-2 skeleton-pulse"></div>

          {/* Description placeholder */}
          <div className="w-20 h-3 bg-gray-700 rounded skeleton-pulse"></div>
        </div>

        {/* Action buttons placeholder */}
        <div className="flex space-x-2">
          <div className="w-8 h-8 bg-gray-700 rounded skeleton-pulse"></div>
          <div className="w-8 h-8 bg-gray-700 rounded skeleton-pulse"></div>
        </div>
      </div>
    </div>
  );

  const renderStatsSkeleton = () => (
    <div className="bg-background border border-gray-800 rounded-xl p-6 animate-pulse">
      <div className="flex items-center justify-between mb-4">
        <div className="w-8 h-8 bg-gray-700 rounded-full skeleton-pulse"></div>
        <div className="w-12 h-6 bg-gray-700 rounded-full skeleton-pulse"></div>
      </div>
      <div className="w-20 h-4 bg-gray-700 rounded mb-2 skeleton-pulse"></div>
      <div className="w-16 h-8 bg-gray-700 rounded skeleton-pulse"></div>
    </div>
  );

  const renderFormSkeleton = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Main Content Area */}
      <div className="lg:col-span-2 space-y-6">
        {/* Title Field */}
        <div className="animate-pulse">
          <div className="w-16 h-4 bg-gray-700 rounded mb-2 skeleton-pulse"></div>
          <div className="w-full h-12 bg-gray-700 rounded-lg skeleton-pulse"></div>
        </div>

        {/* Slug Field */}
        <div className="animate-pulse">
          <div className="w-12 h-4 bg-gray-700 rounded mb-2 skeleton-pulse"></div>
          <div className="w-full h-12 bg-gray-700 rounded-lg skeleton-pulse"></div>
        </div>

        {/* Excerpt Field */}
        <div className="animate-pulse">
          <div className="w-16 h-4 bg-gray-700 rounded mb-2 skeleton-pulse"></div>
          <div className="w-full h-20 bg-gray-700 rounded-lg skeleton-pulse"></div>
        </div>

        {/* Content Editor */}
        <div className="animate-pulse">
          <div className="w-20 h-4 bg-gray-700 rounded mb-2 skeleton-pulse"></div>
          <div className="w-full h-64 bg-gray-700 rounded-lg skeleton-pulse"></div>
        </div>

        {/* Meta Description */}
        <div className="animate-pulse">
          <div className="w-32 h-4 bg-gray-700 rounded mb-2 skeleton-pulse"></div>
          <div className="w-full h-16 bg-gray-700 rounded-lg skeleton-pulse"></div>
        </div>

        {/* Images */}
        <div className="animate-pulse">
          <div className="w-32 h-4 bg-gray-700 rounded mb-2 skeleton-pulse"></div>
          <div className="w-full h-32 bg-gray-700 rounded-lg border-2 border-dashed border-gray-600 skeleton-pulse"></div>
        </div>
      </div>

      {/* Sidebar */}
      <div className="space-y-6">
        {/* Publishing Options */}
        <div className="bg-background border border-gray-800 rounded-xl p-6 animate-pulse">
          <div className="w-24 h-5 bg-gray-700 rounded mb-4 skeleton-pulse"></div>
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-gray-700 rounded skeleton-pulse"></div>
              <div className="w-32 h-4 bg-gray-700 rounded skeleton-pulse"></div>
            </div>
            <div className="w-24 h-4 bg-gray-700 rounded skeleton-pulse"></div>
          </div>
        </div>

        {/* Featured Image */}
        <div className="bg-background border border-gray-800 rounded-xl p-6 animate-pulse">
          <div className="w-32 h-5 bg-gray-700 rounded mb-4 skeleton-pulse"></div>
          <div className="w-full h-32 bg-gray-700 rounded-lg border-2 border-dashed border-gray-600 skeleton-pulse"></div>
        </div>

        {/* Category */}
        <div className="bg-background border border-gray-800 rounded-xl p-6 animate-pulse">
          <div className="w-20 h-5 bg-gray-700 rounded mb-4 skeleton-pulse"></div>
          <div className="w-full h-12 bg-gray-700 rounded-lg skeleton-pulse"></div>
        </div>

        {/* Tags */}
        <div className="bg-background border border-gray-800 rounded-xl p-6 animate-pulse">
          <div className="w-12 h-5 bg-gray-700 rounded mb-4 skeleton-pulse"></div>
          <div className="space-y-2">
            {Array.from({ length: 5 }, (_, i) => (
              <div key={i} className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-gray-700 rounded skeleton-pulse"></div>
                <div className="w-20 h-4 bg-gray-700 rounded skeleton-pulse"></div>
                <div className="w-3 h-3 bg-gray-700 rounded-full skeleton-pulse"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Tech Stack */}
        <div className="bg-background border border-gray-800 rounded-xl p-6 animate-pulse">
          <div className="w-24 h-5 bg-gray-700 rounded mb-4 skeleton-pulse"></div>
          <div className="space-y-2">
            {Array.from({ length: 4 }, (_, i) => (
              <div key={i} className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-gray-700 rounded skeleton-pulse"></div>
                <div className="w-5 h-5 bg-gray-700 rounded skeleton-pulse"></div>
                <div className="w-16 h-4 bg-gray-700 rounded skeleton-pulse"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const getGridClasses = () => {
    switch (type) {
      case "card":
        return "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6";
      case "stats":
        return "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6";
      case "list":
        return "space-y-4";
      case "form":
        return ""; // Form skeleton has its own layout structure
      default:
        return "grid grid-cols-1 gap-4";
    }
  };

  const renderSkeleton = () => {
    switch (type) {
      case "card":
        return renderCardSkeleton();
      case "list":
        return renderListSkeleton();
      case "stats":
        return renderStatsSkeleton();
      case "form":
        return renderFormSkeleton();
      default:
        return renderCardSkeleton();
    }
  };

  // For form type, render directly without container grid classes
  if (type === "form") {
    return <div ref={containerRef}>{renderFormSkeleton()}</div>;
  }

  return (
    <div ref={containerRef} className={getGridClasses()}>
      {Array.from({ length: count }, (_, index) => (
        <div key={index}>{renderSkeleton()}</div>
      ))}
    </div>
  );
};

export default LoadingSkeleton;
