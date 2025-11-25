// src/components/fragments/home/FeaturedProjects.tsx
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import AnimatedTextHeader from "../../ui/AnimatedHeader";
import { useProjects } from "../../../hooks/useProjects";
import ProjectCard from "../work/ProjectCard";
import type { Project } from "../../../lib/types/project";

gsap.registerPlugin(ScrollTrigger);

const FeaturedProjects = () => {
  const { projects, isLoading } = useProjects();
  const gridRef = useRef<HTMLDivElement>(null);

  // Ambil hanya 4 project pertama untuk featured
  const featuredProjects = projects?.slice(0, 4);

  useEffect(() => {
    if (!isLoading && featuredProjects?.length && gridRef.current) {
      const ctx = gsap.context(() => {
        const cards = gridRef.current?.children;

        if (cards && cards.length > 0) {
          gsap.fromTo(
            cards,
            {
              opacity: 0,
              y: 60,
            },
            {
              opacity: 1,
              y: 0,
              duration: 1,
              stagger: 0.1,
              ease: "power3.out",
              scrollTrigger: {
                trigger: gridRef.current,
                start: "top bottom-=100px",
                toggleActions: "play none none none",
              },
            }
          );
        }
      }, gridRef);

      return () => ctx.revert();
    }
  }, [isLoading, featuredProjects]);

  return (
    <section className="w-full bg-background2 min-h-screen pb-20 md:pb-32">
      {/* Heading Section */}
      <div className="pt-16 md:pt-24 px-4 md:px-6 lg:px-10">
        <div className="w-full">
          <div className="space-y-0 w-full h-full tracking-tight text-whiteText leading-none">
            <AnimatedTextHeader
              text="SIGNATURE"
              location="start"
              animationDuration={1.3}
              stagger={0.07}
              scrollStart="top bottom-=50px"
              scrollEnd="bottom top+=100px"
              delay={0}
              fontFamily="font-oggs"
            />

            <AnimatedTextHeader
              text="PROJECTS"
              location="start"
              animationDuration={1.5}
              stagger={0.06}
              scrollStart="top bottom"
              scrollEnd="bottom top+=100px"
              delay={300}
              fontFamily="font-oggs"
            />
          </div>
        </div>
      </div>

      {/* Projects Grid Section - Almost Full Bleed */}
      <div className="mt-10 md:mt-14">
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="w-8 h-8 border-2 border-whiteText border-t-transparent rounded-full animate-spin" />
          </div>
        ) : featuredProjects?.length ? (
          <div
            className="mx-auto px-2 sm:px-3 md:px-4 lg:px-6"
            style={{ width: "clamp(320px, 98vw, 1800px)" }}
          >
            <div
              ref={gridRef}
              className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 md:gap-6 lg:gap-8"
            >
              {featuredProjects.map((project, index) => (
                <ProjectCard
                  key={project._id}
                  project={project as Project}
                  index={index}
                  disableAnimation={false}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="font-centsbook text-grayText text-lg">
              Projects will appear here soon.
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedProjects;
