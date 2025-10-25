// hooks/useProjects.ts - Simplified version
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Project, ProjectType } from "../lib/types/project";
import type { Id } from "../../convex/_generated/dataModel";

// Main hook - supports optional projectType filter
export const useProjects = (projectType?: ProjectType) => {
  const projects = useQuery(
    api.projects.getProjects,
    projectType ? { projectType } : {} // ← Empty object instead of undefined
  );

  return {
    projects: projects as Project[] | undefined,
    isLoading: projects === undefined,
  };
};

// Get single project
export const useProject = (projectId: Id<"projects"> | null) => {
  const project = useQuery(
    api.projects.getProject,
    projectId ? { projectId } : "skip"
  );

  return {
    project: project as Project | null | undefined,
    isLoading: project === undefined,
  };
};

// Get project statistics
export const useProjectStats = () => {
  const stats = useQuery(api.projects.getProjectStats);

  return {
    stats,
    isLoading: stats === undefined,
  };
};

// Search projects
export const useProjectSearch = (searchTerm: string | null) => {
  const projects = useQuery(
    api.projects.searchProjects,
    searchTerm ? { searchTerm } : "skip"
  );

  return {
    projects: projects as Project[] | undefined,
    isLoading: projects === undefined,
  };
};
