// types/project.ts
import type { Id } from "../../../convex/_generated/dataModel";
export type ProjectType =
  | "website"
  | "mobile"
  | "backend"
  | "desktop"
  | "other";

export interface TechStack {
  _id: Id<"techStacks">;
  _creationTime: number;
  name: string;
  category: string;
  storageId: Id<"_storage">;
  position: number;
  imageUrl: string | null;
}

export interface ProjectImage {
  _id: Id<"projectImages">;
  _creationTime: number;
  projectId: Id<"projects">;
  imageUrl: string;
  imageId: Id<"_storage">;
  position: number;
}

export interface Project {
  _id: Id<"projects">;
  _creationTime: number;
  title: string;
  description: string;
  techStack: TechStack[];
  projectUrl?: string;
  projectType: ProjectType;
  githubUrl?: string;
  thumbnailUrl: string;
  thumbnailId: Id<"_storage">;
  images: ProjectImage[];
}

export interface ProjectStats {
  totalProjects: number;
  totalImages: number;
  avgImagesPerProject: number;
  projectsByType: Record<string, number>;
}
