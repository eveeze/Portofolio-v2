// pages/Work.tsx — 2 Column Grid Layout with Filter Left, Hero Right
import { useState, useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useProjects, useProjectStats } from "../../hooks/useProjects";
import ProjectFilter from "../fragments/work/ProjectFilter";
import ProjectCard from "../fragments/work/ProjectCard";
import type { ProjectType, Project } from "../../lib/types/project";

gsap.registerPlugin(ScrollTrigger);
gsap.ticker.lagSmoothing(500, 33);

const Work = () => {
  const [activeFilter, setActiveFilter] = useState<ProjectType | "all">("all");
  const { projects, isLoading: isLoadingProjects } = useProjects(
    activeFilter === "all" ? undefined : activeFilter
  );
  const { stats } = useProjectStats();

  const headerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const countRef = useRef<HTMLElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const animationContextRef = useRef<gsap.Context | null>(null);

  const projectCounts = stats?.projectsByType || {};

  // Animate header on mount
  useEffect(() => {
    if (!headerRef.current) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline();

      if (titleRef.current) {
        tl.from(titleRef.current, {
          opacity: 0,
          y: 100,
          duration: 1.0,
          ease: "power3.out",
          force3D: true,
        });
      }

      if (countRef.current) {
        gsap.set(countRef.current, { opacity: 1 });
        tl.from(
          countRef.current,
          {
            opacity: 0,
            x: 50,
            duration: 0.7,
            ease: "power3.out",
            force3D: true,
          },
          "-=0.6"
        );
      }

      if (subtitleRef.current) {
        gsap.set(subtitleRef.current, { opacity: 1 });
        tl.from(
          subtitleRef.current,
          {
            opacity: 0,
            y: 24,
            duration: 0.7,
            ease: "power3.out",
            force3D: true,
          },
          "-=0.4"
        );
      }
    }, headerRef);

    return () => ctx.revert();
  }, []);

  // Animate grid on data change
  useEffect(() => {
    if (!gridRef.current || !projects?.length) return;

    animationContextRef.current?.revert();

    const id = setTimeout(() => {
      if (!gridRef.current) return;

      animationContextRef.current = gsap.context(() => {
        const children = Array.from(gridRef.current?.children || []);
        if (children.length) {
          gsap.fromTo(
            children,
            { opacity: 0, y: 60 },
            {
              opacity: 1,
              y: 0,
              duration: 0.8,
              stagger: 0.1,
              ease: "power3.out",
              force3D: true,
            }
          );
        }
      }, gridRef);
    }, 100);

    return () => clearTimeout(id);
  }, [projects?.length, activeFilter]);

  useEffect(() => {
    return () => animationContextRef.current?.revert();
  }, []);

  // Loading
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

  // Empty (all)
  if (!projects?.length && activeFilter === "all") {
    return (
      <section className="w-full min-h-screen bg-background2 flex items-center justify-center">
        <div className="text-center space-y-4 max-w-md">
          <h2 className="font-ogg text-whiteText text-4xl">No Projects Yet</h2>
          <p className="font-centsbook text-grayText">
            Projects will appear here once they are added.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="w-full min-h-screen bg-background2 py-20 md:py-32">
      {/* Container - LEBIH LEBAR, SPACE KE TEPI LEBIH TIPIS */}
      <div
        className="mx-auto px-2 md:px-3 lg:px-4"
        style={{ width: "clamp(320px, 98vw, 1600px)" }}
      >
        {/* Header / Hero - FILTER KIRI, HERO KANAN */}
        <div ref={headerRef} className="mb-12 md:mb-16">
          {/* Filter di kiri atas */}
          <div className="mb-8 md:mb-0">
            <ProjectFilter
              activeFilter={activeFilter}
              onFilterChange={setActiveFilter}
              projectCounts={projectCounts}
            />
          </div>

          {/* Hero di kanan */}
          <div className="flex flex-col items-end text-left mb-8">
            <h1
              ref={titleRef}
              className="font-ogg text-whiteText text-6xl md:text-8xl lg:text-9xl leading-none"
            >
              <span className="inline-block">WORK</span>
              <sup
                ref={countRef}
                className="font-centsbook text-whiteText text-xl md:text-2xl lg:text-3xl ml-2 align-super"
                style={{
                  opacity: 1,
                  verticalAlign: "super",
                  fontSize: "0.5em",
                  lineHeight: 0,
                }}
              >
                &#40;{projects ? projects.length : 0}&#41;
              </sup>
            </h1>
          </div>
          <p
            ref={subtitleRef}
            className="font-centsbook text-whiteText text-base md:text-lg max-w-3xl ml-auto text-left"
            style={{ opacity: 1, transform: "translateY(0)" }}
          >
            Crafting seamless digital experiences, from concept to deployment.
            Explore my case studies below.
          </p>
        </div>

        {/* Grid - 2 KOLOM, GAP LEBIH RAPAT, IMAGES FULLY VISIBLE */}
        {projects?.length ? (
          <div
            ref={gridRef}
            className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8"
          >
            {projects?.map((project, index) => (
              <ProjectCard
                key={project._id}
                project={project as Project}
                index={index}
                disableAnimation={false}
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
      </div>
    </section>
  );
};

export default Work;
