// components/fragments/work/ProjectFilter.tsx - Fixed Version
import type { ProjectType } from "../../../lib/types/project";

interface ProjectFilterProps {
  activeFilter: ProjectType | "all";
  onFilterChange: (filter: ProjectType | "all") => void;
  projectCounts: Record<string, number>;
}

const ProjectFilter = ({
  activeFilter,
  onFilterChange,
  projectCounts,
}: ProjectFilterProps) => {
  // Define all available filters with labels
  const filters: Array<{ value: ProjectType | "all"; label: string }> = [
    { value: "all", label: "ALL" },
    { value: "website", label: "WEBSITE" },
    { value: "mobile", label: "MOBILE" },
    { value: "backend", label: "BACKEND" },
    { value: "desktop", label: "DESKTOP" },
    { value: "other", label: "OTHER" },
  ];

  // Get count for each filter (default to 0 if not found)
  const getCount = (filterValue: ProjectType | "all"): number => {
    if (filterValue === "all") {
      // Sum all project counts for "all"
      return Object.values(projectCounts).reduce(
        (sum, count) => sum + count,
        0
      );
    }
    return projectCounts[filterValue] || 0;
  };

  return (
    <div className="flex flex-wrap gap-3 md:gap-4">
      {filters.map((filter) => {
        const count = getCount(filter.value);
        const isActive = activeFilter === filter.value;

        return (
          <button
            key={filter.value}
            onClick={() => onFilterChange(filter.value)}
            className={`
              relative px-6 py-3 font-centsbook text-sm md:text-base
              transition-all duration-300 ease-out
              border-2 rounded-full
              ${
                isActive
                  ? "border-whiteText text-whiteText bg-whiteText/5"
                  : "border-whiteText/20 text-grayText hover:border-whiteText/40 hover:text-whiteText"
              }
            `}
          >
            <span className="flex items-center gap-2">
              {filter.label}
              <span
                className={`
                text-xs px-2 py-0.5 rounded-full
                ${
                  isActive
                    ? "bg-whiteText text-background2"
                    : "bg-whiteText/10 text-grayText"
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
  );
};

export default ProjectFilter;
