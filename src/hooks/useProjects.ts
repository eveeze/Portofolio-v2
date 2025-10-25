// hooks/useProjects.ts
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Project, ProjectType } from "../lib/types/project";

export const useProjects = () => {
  const projects = useQuery(api.projects.getProjects);
  return {
    projects: projects as Project[] | undefined,
    isLoading: projects === undefined,
  };
};

export const useProjectsByType = (projectType: ProjectType) => {
  const projects = useQuery(api.projects.getProjectsByType, { projectType });
  return {
    projects: projects as Project[] | undefined,
    isLoading: projects === undefined,
  };
};

export const useProjectStats = () => {
  const stats = useQuery(api.projects.getProjectStats);
  return {
    stats,
    isLoading: stats === undefined,
  };
};
