import React, { useState, useEffect, useRef } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useAuth } from "../../contexts/AuthContext";
import { gsap } from "gsap";
import AdminLayout from "../layouts/AdminLayout";
import ProjectCard from "../fragments/admin/projects/ProjectCard";
import ProjectModal from "../fragments/admin/projects/ProjectModal";
import ProjectStats from "../fragments/admin/projects/ProjectStats";
import LoadingSkeleton from "../ui/LoadingSkeleton";
import ConfirmationModal from "../ui/ConfirmationModal";

interface ProjectFormData {
  title: string;
  description: string;
  techStack: string[];
  projectUrl?: string;
  projectType: "website" | "mobile" | "backend" | "desktop" | "other";
  githubUrl?: string;
  thumbnail: File | null;
  images: File[];
  imagesToDelete?: string[];
}

// Enhanced type definitions to match Convex data structure
interface ConvexTechStack {
  _id: string;
  name: string;
  category: string;
  imageUrl: string | null;
  storageId: string;
  position: number;
}

interface ConvexProject {
  _id: string;
  title: string;
  description: string;
  projectType: "website" | "mobile" | "backend" | "desktop" | "other";
  thumbnailUrl: string;
  projectUrl?: string;
  githubUrl?: string;
  techStack: (ConvexTechStack | null)[];
  images?: Array<{
    _id: string;
    imageUrl: string;
  }>;
  _creationTime: number;
}

// Transform function to convert Convex data to component-compatible format
const transformConvexProject = (convexProject: ConvexProject) => {
  return {
    ...convexProject,
    techStack: convexProject.techStack
      .filter((tech): tech is ConvexTechStack => tech !== null)
      .map((tech) => ({
        _id: tech._id,
        name: tech.name,
        category: tech.category,
        imageUrl: tech.imageUrl || undefined, // Convert null to undefined
      })),
  };
};

const AdminProjects: React.FC = () => {
  const { token } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [editData, setEditData] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("All");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState<"title" | "type" | "recent">("recent");

  // Refs for animations
  const controlsRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);

  // Queries with proper typing
  const convexProjects = useQuery(api.projects.getProjects) as
    | ConvexProject[]
    | undefined;
  const projectStats = useQuery(api.projects.getProjectStats);
  const convexTechStacks = useQuery(api.techStack.getTechStacks);

  // Transform the projects data
  const projects = convexProjects?.map(transformConvexProject) || [];

  // Transform tech stacks to match expected interface
  const techStacks =
    convexTechStacks?.map((tech) => ({
      _id: tech._id,
      name: tech.name,
      category: tech.category,
      imageUrl: tech.imageUrl || undefined,
    })) || [];

  // Get the Convex HTTP URL from Vite environment variable
  const CONVEX_HTTP_URL = import.meta.env.VITE_CONVEX_HTTP_URL;

  // Build proper API base URL
  const getApiBaseUrl = () => {
    if (!CONVEX_HTTP_URL) {
      const errorMessage =
        "VITE_CONVEX_HTTP_URL (.convex.site URL) is not configured.";
      console.error(errorMessage);
      throw new Error(errorMessage);
    }
    return CONVEX_HTTP_URL;
  };

  const projectTypes = [
    "All",
    "website",
    "mobile",
    "backend",
    "desktop",
    "other",
  ];

  const typeLabels: Record<string, string> = {
    All: "All Projects",
    website: "Website",
    mobile: "Mobile App",
    backend: "Backend",
    desktop: "Desktop App",
    other: "Other",
  };

  // Filter and sort projects
  const filteredAndSortedProjects = React.useMemo(() => {
    let filtered = projects.filter((project) => {
      const matchesSearch =
        project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType =
        selectedType === "All" || project.projectType === selectedType;
      return matchesSearch && matchesType;
    });

    // Sort projects
    switch (sortBy) {
      case "title":
        filtered.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case "type":
        filtered.sort((a, b) => a.projectType.localeCompare(b.projectType));
        break;
      case "recent":
      default:
        filtered.sort(
          (a, b) =>
            new Date(b._creationTime).getTime() -
            new Date(a._creationTime).getTime()
        );
        break;
    }

    return filtered;
  }, [projects, searchTerm, selectedType, sortBy]);

  useEffect(() => {
    // Entrance animations for content elements
    const tl = gsap.timeline({ delay: 0.5 });

    if (statsRef.current && controlsRef.current && contentRef.current) {
      gsap.set([statsRef.current, controlsRef.current, contentRef.current], {
        opacity: 0,
        y: 30,
      });

      tl.to(statsRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.6,
        ease: "power2.out",
      })
        .to(
          controlsRef.current,
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: "power2.out",
          },
          "-=0.3"
        )
        .to(
          contentRef.current,
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: "power2.out",
          },
          "-=0.3"
        );
    }
  }, []);

  const handleAddNew = () => {
    setEditData(null);
    setIsModalOpen(true);
  };

  const handleEdit = (id: string) => {
    const project = projects.find((p) => p._id === id);
    if (project) {
      setEditData({
        id: project._id,
        title: project.title,
        description: project.description,
        techStack: project.techStack.map((tech) => tech._id),
        projectUrl: project.projectUrl,
        projectType: project.projectType,
        githubUrl: project.githubUrl,
        thumbnailUrl: project.thumbnailUrl,
        images: project.images || [],
      });
      setIsModalOpen(true);
    }
  };

  const handleDelete = (id: string) => {
    setDeleteId(id);
    setIsConfirmModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteId || !token) return;

    setIsLoading(true);
    try {
      const apiBaseUrl = getApiBaseUrl();
      console.log(`Attempting to delete: ${apiBaseUrl}/projects/${deleteId}`);

      const response = await fetch(`${apiBaseUrl}/projects/${deleteId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ error: "Unknown error" }));
        console.error("Delete response:", response.status, errorData);
        throw new Error(
          errorData.error || `Failed to delete: ${response.status}`
        );
      }

      const result = await response.json();
      console.log("Delete successful:", result);

      // Animate removal
      if (gridRef.current) {
        const cardElement = gridRef.current.querySelector(
          `[data-id="${deleteId}"]`
        );
        if (cardElement) {
          gsap.to(cardElement, {
            scale: 0,
            opacity: 0,
            duration: 0.3,
            ease: "power2.in",
          });
        }
      }

      setIsConfirmModalOpen(false);
      setDeleteId(null);
    } catch (error: any) {
      console.error("Delete error:", error);
      alert(`Failed to delete: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (formData: ProjectFormData) => {
    if (!token) {
      throw new Error("No authentication token available");
    }

    setIsLoading(true);
    try {
      const apiBaseUrl = getApiBaseUrl();
      console.log("Using API base URL:", apiBaseUrl);

      let thumbnailStorageId = null;
      let imageStorageIds: string[] = [];

      // Handle existing image deletions first (for edit mode)
      if (
        editData &&
        formData.imagesToDelete &&
        formData.imagesToDelete.length > 0
      ) {
        console.log("Deleting existing images:", formData.imagesToDelete);

        for (const imageId of formData.imagesToDelete) {
          try {
            const deleteImageResponse = await fetch(
              `${apiBaseUrl}/projects/images/${imageId}`,
              {
                method: "DELETE",
                headers: {
                  Authorization: `Bearer ${token}`,
                  "Content-Type": "application/json",
                },
              }
            );

            if (!deleteImageResponse.ok) {
              console.warn(`Failed to delete image ${imageId}`);
            }
          } catch (error) {
            console.warn(`Error deleting image ${imageId}:`, error);
          }
        }
      }

      // Upload thumbnail if provided
      if (formData.thumbnail) {
        console.log("Requesting upload URL for thumbnail...");

        const uploadUrlEndpoint = `${apiBaseUrl}/projects/generateUploadUrl`;
        const uploadUrlResponse = await fetch(uploadUrlEndpoint, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!uploadUrlResponse.ok) {
          const errorData = await uploadUrlResponse
            .json()
            .catch(() => ({ error: "Unknown error" }));
          throw new Error(
            errorData.error ||
              `Failed to get upload URL: ${uploadUrlResponse.status}`
          );
        }

        const uploadUrlData = await uploadUrlResponse.json();
        console.log("Thumbnail upload URL:", uploadUrlData.url);

        const uploadResponse = await fetch(uploadUrlData.url, {
          method: "POST",
          body: formData.thumbnail,
        });

        if (!uploadResponse.ok) {
          throw new Error(
            `Failed to upload thumbnail: ${uploadResponse.status}`
          );
        }

        const uploadResult = await uploadResponse.json();
        thumbnailStorageId = uploadResult.storageId;
      }

      // Upload additional images if provided
      if (formData.images && formData.images.length > 0) {
        console.log("Uploading additional images...", formData.images.length);

        for (const [index, image] of formData.images.entries()) {
          console.log(`Uploading image ${index + 1}/${formData.images.length}`);

          const uploadUrlEndpoint = `${apiBaseUrl}/projects/generateUploadUrl`;
          const uploadUrlResponse = await fetch(uploadUrlEndpoint, {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          });

          if (!uploadUrlResponse.ok) {
            throw new Error(`Failed to get upload URL for image ${index + 1}`);
          }

          const uploadUrlData = await uploadUrlResponse.json();
          const uploadResponse = await fetch(uploadUrlData.url, {
            method: "POST",
            body: image,
          });

          if (!uploadResponse.ok) {
            throw new Error(
              `Failed to upload image ${index + 1}: ${uploadResponse.status}`
            );
          }

          const uploadResult = await uploadResponse.json();
          imageStorageIds.push(uploadResult.storageId);
        }
      }

      const payload = {
        title: formData.title,
        description: formData.description,
        techStack: formData.techStack,
        projectUrl: formData.projectUrl,
        projectType: formData.projectType,
        githubUrl: formData.githubUrl,
        ...(thumbnailStorageId && { thumbnailStorageId }),
        ...(imageStorageIds.length > 0 && { imageStorageIds }),
      };

      console.log("Saving project with payload:", payload);

      let response;
      if (editData) {
        // Update existing
        console.log("Updating project:", editData.id);
        const updateEndpoint = `${apiBaseUrl}/projects/${editData.id}`;

        response = await fetch(updateEndpoint, {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });
      } else {
        // Create new - thumbnail is required for new projects
        if (!thumbnailStorageId) {
          throw new Error("Thumbnail is required for new projects");
        }

        console.log("Creating new project");
        const createEndpoint = `${apiBaseUrl}/projects`;

        response = await fetch(createEndpoint, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });
      }

      console.log("Save response status:", response.status);

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ error: "Unknown error" }));
        console.error("Save error response:", errorData);
        throw new Error(
          errorData.error || `Failed to save: ${response.status}`
        );
      }

      const result = await response.json();
      console.log("Save result:", result);

      setIsModalOpen(false);
      setEditData(null);
    } catch (error: any) {
      console.error("Save error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewModeChange = (mode: "grid" | "list") => {
    if (gridRef.current) {
      gsap.to(gridRef.current, {
        opacity: 0,
        duration: 0.2,
        onComplete: () => {
          setViewMode(mode);
          gsap.to(gridRef.current, {
            opacity: 1,
            duration: 0.3,
          });
        },
      });
    }
  };

  const isLoadingData = !convexProjects || !projectStats;

  return (
    <AdminLayout
      title="Project Management"
      subtitle="Manage your portfolio projects and showcase your work"
    >
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header Actions */}
          <div className="flex justify-end mb-8">
            <button
              onClick={handleAddNew}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 active:scale-95 flex items-center space-x-2"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              <span>Add Project</span>
            </button>
          </div>

          {/* Stats */}
          <div ref={statsRef}>
            {isLoadingData ? (
              <LoadingSkeleton type="stats" count={4} />
            ) : (
              <ProjectStats
                totalProjects={projectStats?.totalProjects || 0}
                totalImages={projectStats?.totalImages || 0}
                projectsByType={projectStats?.projectsByType || {}}
              />
            )}
          </div>

          {/* Controls */}
          <div ref={controlsRef} className="mb-8">
            <div className="bg-background border border-gray-800 rounded-xl p-6">
              <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                {/* Search and Filter */}
                <div className="flex flex-col sm:flex-row gap-4 flex-1">
                  {/* Search */}
                  <div className="relative flex-1 max-w-md">
                    <svg
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-grayText"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                    <input
                      type="text"
                      placeholder="Search projects..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-background2 border border-gray-700 rounded-lg text-whiteText focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    />
                  </div>

                  {/* Project Type Filter */}
                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="px-4 py-3 bg-background2 border border-gray-700 rounded-lg text-whiteText focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  >
                    {projectTypes.map((type) => (
                      <option key={type} value={type}>
                        {typeLabels[type]}
                      </option>
                    ))}
                  </select>

                  {/* Sort By */}
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="px-4 py-3 bg-background2 border border-gray-700 rounded-lg text-whiteText focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  >
                    <option value="recent">Most Recent</option>
                    <option value="title">Title A-Z</option>
                    <option value="type">Project Type</option>
                  </select>
                </div>

                {/* View Controls */}
                <div className="flex items-center space-x-4">
                  {/* Results Count */}
                  <span className="text-grayText text-sm">
                    {filteredAndSortedProjects.length} of {projects.length}{" "}
                    projects
                  </span>

                  {/* View Mode Toggle */}
                  <div className="flex bg-background2 border border-gray-700 rounded-lg overflow-hidden">
                    <button
                      onClick={() => handleViewModeChange("grid")}
                      className={`px-4 py-2 transition-all duration-200 ${
                        viewMode === "grid"
                          ? "bg-blue-600 text-white"
                          : "text-grayText hover:text-whiteText hover:bg-gray-800"
                      }`}
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                        />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleViewModeChange("list")}
                      className={`px-4 py-2 transition-all duration-200 ${
                        viewMode === "list"
                          ? "bg-blue-600 text-white"
                          : "text-grayText hover:text-whiteText hover:bg-gray-800"
                      }`}
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 6h16M4 10h16M4 14h16M4 18h16"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div ref={contentRef}>
            {isLoadingData ? (
              <LoadingSkeleton type="card" count={6} />
            ) : filteredAndSortedProjects.length === 0 ? (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-800 rounded-full mb-4">
                  <svg
                    className="w-8 h-8 text-grayText"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-whiteText mb-2">
                  {searchTerm || selectedType !== "All"
                    ? "No matching projects found"
                    : "No projects yet"}
                </h3>
                <p className="text-grayText mb-6">
                  {searchTerm || selectedType !== "All"
                    ? "Try adjusting your search or filter criteria"
                    : "Get started by creating your first project"}
                </p>
                {!searchTerm && selectedType === "All" && (
                  <button
                    onClick={handleAddNew}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 active:scale-95"
                  >
                    Create Your First Project
                  </button>
                )}
              </div>
            ) : (
              <div
                ref={gridRef}
                className={
                  viewMode === "grid"
                    ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                    : "space-y-6"
                }
              >
                {filteredAndSortedProjects.map((project) => (
                  <div
                    key={project._id}
                    data-id={project._id}
                    className={
                      viewMode === "list"
                        ? "transform transition-all duration-200 hover:scale-[1.01]"
                        : ""
                    }
                  >
                    <ProjectCard
                      project={project}
                      viewMode={viewMode}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Modals */}
        <ProjectModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditData(null);
          }}
          onSave={handleSave}
          editData={editData}
          techStacks={techStacks}
        />

        <ConfirmationModal
          isOpen={isConfirmModalOpen}
          onClose={() => {
            setIsConfirmModalOpen(false);
            setDeleteId(null);
          }}
          onConfirm={confirmDelete}
          title="Delete Project"
          message="Are you sure you want to delete this project? This action cannot be undone and will remove all associated images."
          confirmText="Delete"
          cancelText="Cancel"
          type="danger"
          isLoading={isLoading}
        />
      </div>
    </AdminLayout>
  );
};

export default AdminProjects;
