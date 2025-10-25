// components/work/ProjectFilter.tsx
import { useEffect, useRef } from "react";
import gsap from "gsap";
import type { ProjectType } from "../../../lib/types/project";

interface ProjectFilterProps {
  activeFilter: ProjectType | "all";
  onFilterChange: (filter: ProjectType | "all") => void;
  projectCounts: Record<string, number>;
}

const filters: Array<{ id: ProjectType | "all"; label: string }> = [
  { id: "all", label: "All" },
  { id: "website", label: "Website" },
  { id: "mobile", label: "Mobile" },
  { id: "backend", label: "Backend" },
  { id: "desktop", label: "Desktop" },
  { id: "other", label: "Other" },
];

const ProjectFilter = ({
  activeFilter,
  onFilterChange,
  projectCounts,
}: ProjectFilterProps) => {
  const filterRef = useRef<HTMLDivElement>(null);
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(buttonRefs.current, {
        opacity: 0,
        y: -20,
        duration: 0.6,
        stagger: 0.1,
        ease: "power3.out",
      });
    }, filterRef);

    return () => ctx.revert();
  }, []);

  const handleFilterClick = (filterId: ProjectType | "all") => {
    onFilterChange(filterId);
  };

  return (
    <div ref={filterRef} className="w-full mb-12 md:mb-16">
      <div className="flex flex-wrap items-center gap-3 md:gap-4">
        <span className="font-centsbook text-grayText text-sm md:text-base mr-2">
          Filter
        </span>
        {filters.map((filter, index) => {
          const count =
            filter.id === "all"
              ? Object.values(projectCounts).reduce((a, b) => a + b, 0)
              : projectCounts[filter.id] || 0;

          return (
            <button
              key={filter.id}
              ref={(el) => {
                buttonRefs.current[index] = el;
              }}
              onClick={() => handleFilterClick(filter.id)}
              className={`
                relative px-4 py-2 rounded-full font-centsbook text-sm md:text-base
                transition-all duration-300 ease-out
                ${
                  activeFilter === filter.id
                    ? "bg-whiteText text-background"
                    : "bg-transparent text-grayText border border-grayText/30 hover:border-whiteText/50 hover:text-whiteText"
                }
              `}
            >
              <span className="relative z-10 flex items-center gap-2">
                {filter.label}
                <span
                  className={`
                  text-xs
                  ${
                    activeFilter === filter.id
                      ? "text-background/70"
                      : "text-grayText"
                  }
                `}
                >
                  {count}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ProjectFilter;
