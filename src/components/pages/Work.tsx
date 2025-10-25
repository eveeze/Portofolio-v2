// pages/Work.tsx - Fixed Race Condition Version
import { useState, useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useProjects, useProjectStats } from "../../hooks/useProjects";
import ProjectFilter from "../fragments/work/ProjectFilter";
import ProjectCard from "../fragments/work/ProjectCard";
import type { ProjectType, Project } from "../../lib/types/project";

gsap.registerPlugin(ScrollTrigger);

const Work = () => {
  const [activeFilter, setActiveFilter] = useState<ProjectType | "all">("all");
  const [isAnimating, setIsAnimating] = useState(false);

  // Single query - filter di backend via hook
  const { projects, isLoading: isLoadingProjects } = useProjects(
    activeFilter === "all" ? undefined : activeFilter
  );

  const { stats } = useProjectStats();

  const headerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const countRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const animationContextRef = useRef<gsap.Context | null>(null);

  const projectCounts = stats?.projectsByType || {};

  // Animate header on mount (ONCE)
  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline();
      tl.from(titleRef.current, {
        opacity: 0,
        y: 100,
        duration: 1.2,
        ease: "power3.out",
      });
      tl.from(
        countRef.current,
        {
          opacity: 0,
          x: 50,
          duration: 0.8,
          ease: "power3.out",
        },
        "-=0.6"
      );
    }, headerRef);

    return () => ctx.revert();
  }, []); // Empty dependency - only run once on mount

  // Animate grid when projects change
  useEffect(() => {
    if (!gridRef.current || !projects || projects.length === 0 || isAnimating) {
      return;
    }

    // Cleanup previous animation context
    if (animationContextRef.current) {
      animationContextRef.current.revert();
    }

    setIsAnimating(true);

    // Small delay to ensure DOM is ready
    const timeoutId = setTimeout(() => {
      animationContextRef.current = gsap.context(() => {
        const children = Array.from(gridRef.current?.children || []);

        if (children.length > 0) {
          // Set initial state
          gsap.set(children, { opacity: 0, y: 60 });

          // Animate in
          gsap.to(children, {
            opacity: 1,
            y: 0,
            duration: 0.8,
            stagger: 0.1,
            ease: "power3.out",
            onComplete: () => {
              setIsAnimating(false);
            },
          });
        } else {
          setIsAnimating(false);
        }
      }, gridRef);
    }, 50); // Small delay to prevent race condition

    return () => {
      clearTimeout(timeoutId);
    };
  }, [projects?.length, activeFilter]); // Only depend on projects length and filter

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationContextRef.current) {
        animationContextRef.current.revert();
      }
    };
  }, []);

  // Loading state
  if (isLoadingProjects) {
    return (
      <section className="w-full min-h-screen bg-background2 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-2 border-whiteText/20 border-t-whiteText rounded-full animate-spin mx-auto" />
          <p className="font-centsbook text-grayText">Loading projects...</p>
        </div>
      </section>
    );
  }

  // Empty state for all projects
  if (!projects || projects.length === 0) {
    if (activeFilter === "all") {
      return (
        <section className="w-full min-h-screen bg-background2 flex items-center justify-center">
          <div className="text-center space-y-4 max-w-md">
            <h2 className="font-ogg text-whiteText text-4xl">
              No Projects Yet
            </h2>
            <p className="font-centsbook text-grayText">
              Projects will appear here once they are added.
            </p>
          </div>
        </section>
      );
    }
  }

  return (
    <section className="w-full min-h-screen bg-background2 py-20 md:py-32">
      <div className="max-w-[1400px] mx-auto px-6 md:px-12 lg:px-16">
        {/* Header */}
        <div ref={headerRef} className="mb-16 md:mb-24">
          <div className="flex items-end justify-between mb-8">
            <h1
              ref={titleRef}
              className="font-ogg text-whiteText text-6xl md:text-8xl lg:text-9xl italic overflow-hidden"
            >
              <span className="inline-block">WORK</span>
            </h1>
            <div
              ref={countRef}
              className="font-centsbook text-whiteText text-5xl md:text-7xl lg:text-8xl"
            >
              {projects ? projects.length : 0}
            </div>
          </div>

          {/* Filter */}
          <ProjectFilter
            activeFilter={activeFilter}
            onFilterChange={setActiveFilter}
            projectCounts={projectCounts}
          />
        </div>

        {/* Projects Grid */}
        {projects && projects.length > 0 ? (
          <div
            ref={gridRef}
            className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 lg:gap-16"
          >
            {projects.map((project) => (
              <ProjectCard
                key={project._id}
                project={project as Project}
                disableAnimation={true} // Disable card animation to prevent conflict
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="font-centsbook text-grayText text-lg">
              No projects found with the selected filter.
            </p>
          </div>
        )}

        {/* Stats Footer */}
        {stats && (
          <div className="mt-24 pt-12 border-t border-whiteText/10">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div>
                <div className="font-ogg text-whiteText text-4xl mb-2">
                  {stats.totalProjects}
                </div>
                <div className="font-centsbook text-grayText text-sm">
                  Total Projects
                </div>
              </div>
              <div>
                <div className="font-ogg text-whiteText text-4xl mb-2">
                  {stats.totalImages}
                </div>
                <div className="font-centsbook text-grayText text-sm">
                  Total Images
                </div>
              </div>
              <div>
                <div className="font-ogg text-whiteText text-4xl mb-2">
                  {stats.avgImagesPerProject}
                </div>
                <div className="font-centsbook text-grayText text-sm">
                  Avg per Project
                </div>
              </div>
              <div>
                <div className="font-ogg text-whiteText text-4xl mb-2">
                  {Object.keys(stats.projectsByType).length}
                </div>
                <div className="font-centsbook text-grayText text-sm">
                  Categories
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default Work;
