import React, { useState, useEffect, useRef } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useAuth } from "../../contexts/AuthContext";
import { gsap } from "gsap";
import AdminLayout from "../layouts/AdminLayout";
import TechStackCard from "../fragments/admin/techstack/TechStackCard";
import TechStackModal from "../ui/TechStackModal";
import TechStackStats from "../ui/TechStackStats";
import LoadingSkeleton from "../ui/LoadingSkeleton";
import ConfirmationModal from "../ui/ConfirmationModal";

interface TechStackFormData {
  name: string;
  category: string;
  image: File | null;
}

const AdminTechStack: React.FC = () => {
  const { token } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [editData, setEditData] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Refs for animations
  const controlsRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);

  // Queries
  const techStacks = useQuery(api.techStack.getTechStacks) || [];
  const techStackStats = useQuery(api.techStack.getTechStackStats);

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
    // Cukup kembalikan URL .site tanpa modifikasi
    return CONVEX_HTTP_URL;
  };

  const categories = [
    "All",
    "Frontend",
    "Backend",
    "Database",
    "DevOps",
    "Mobile",
    "Design",
  ];

  // Filter tech stacks
  const filteredTechStacks = techStacks.filter((stack) => {
    const matchesSearch = stack.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "All" || stack.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

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
    const stack = techStacks.find((s) => s._id === id);
    if (stack) {
      setEditData({
        id: stack._id,
        name: stack.name,
        category: stack.category,
        imageUrl: stack.imageUrl,
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
      console.log(`Attempting to delete: ${apiBaseUrl}/techstacks/${deleteId}`);

      const response = await fetch(`${apiBaseUrl}/techstacks/${deleteId}`, {
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

  const handleSave = async (formData: TechStackFormData) => {
    if (!token) {
      throw new Error("No authentication token available");
    }

    setIsLoading(true);
    try {
      const apiBaseUrl = getApiBaseUrl();
      console.log("Using API base URL:", apiBaseUrl);

      let storageId = null;

      // Upload image if provided
      if (formData.image) {
        console.log("Requesting upload URL...");

        const uploadUrlEndpoint = `${apiBaseUrl}/generateUploadUrl`;
        console.log("Upload URL endpoint:", uploadUrlEndpoint);

        const uploadUrlResponse = await fetch(uploadUrlEndpoint, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        console.log("Upload URL response status:", uploadUrlResponse.status);

        if (!uploadUrlResponse.ok) {
          const errorData = await uploadUrlResponse
            .json()
            .catch(() => ({ error: "Unknown error" }));
          console.error("Upload URL error response:", errorData);
          throw new Error(
            errorData.error ||
              `Failed to get upload URL: ${uploadUrlResponse.status}`
          );
        }

        const uploadUrlData = await uploadUrlResponse.json();
        console.log("Upload URL data:", uploadUrlData);

        if (!uploadUrlData.url) {
          throw new Error("No upload URL received from server");
        }

        console.log("Uploading image to:", uploadUrlData.url);

        const uploadResponse = await fetch(uploadUrlData.url, {
          method: "POST",
          body: formData.image,
        });

        console.log("Image upload response status:", uploadResponse.status);

        if (!uploadResponse.ok) {
          const errorText = await uploadResponse.text();
          console.error("Image upload error:", errorText);
          throw new Error(
            `Failed to upload image: ${uploadResponse.status} ${errorText}`
          );
        }

        const uploadResult = await uploadResponse.json();
        console.log("Image upload result:", uploadResult);
        storageId = uploadResult.storageId;

        if (!storageId) {
          throw new Error("No storage ID received from image upload");
        }
      }

      const payload = {
        name: formData.name,
        category: formData.category,
        ...(storageId && { storageId }),
      };

      console.log("Saving tech stack with payload:", payload);

      let response;
      if (editData) {
        // Update existing
        console.log("Updating tech stack:", editData.id);
        const updateEndpoint = `${apiBaseUrl}/techstacks/${editData.id}`;
        console.log("Update endpoint:", updateEndpoint);

        response = await fetch(updateEndpoint, {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });
      } else {
        // Create new
        console.log("Creating new tech stack");
        const createEndpoint = `${apiBaseUrl}/techstacks`;
        console.log("Create endpoint:", createEndpoint);

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

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent, targetId: string) => {
    e.preventDefault();

    const draggedId = e.dataTransfer.getData("text/plain");
    if (draggedId === targetId || !token) return;

    const draggedIndex = techStacks.findIndex((s) => s._id === draggedId);
    const targetIndex = techStacks.findIndex((s) => s._id === targetId);

    if (draggedIndex === -1 || targetIndex === -1) return;

    // Create new order
    const newOrder = [...techStacks];
    const [draggedItem] = newOrder.splice(draggedIndex, 1);
    newOrder.splice(targetIndex, 0, draggedItem);

    try {
      const apiBaseUrl = getApiBaseUrl();
      const orderedIds = newOrder.map((item) => item._id);
      const orderEndpoint = `${apiBaseUrl}/techstacks/order`;
      console.log("Order endpoint:", orderEndpoint);

      const response = await fetch(orderEndpoint, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ orderedIds }),
      });

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ error: "Unknown error" }));
        console.error("Reorder error:", errorData);
        throw new Error(
          errorData.error || `Failed to reorder: ${response.status}`
        );
      }

      console.log("Reorder successful");
    } catch (error) {
      console.error("Reorder error:", error);
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

  const isLoadingData = !techStacks || !techStackStats;

  return (
    <AdminLayout
      title="Tech Stack Management"
      subtitle="Manage your technology stack and showcase your expertise"
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
              <span>Add Tech Stack</span>
            </button>
          </div>

          {/* Stats */}
          <div ref={statsRef}>
            {isLoadingData ? (
              <LoadingSkeleton type="stats" count={4} />
            ) : (
              <TechStackStats
                totalStacks={techStackStats?.totalStacks || 0}
                stacksByCategory={techStackStats?.stacksByCategory || {}}
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
                      placeholder="Search tech stacks..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-background2 border border-gray-700 rounded-lg text-whiteText focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    />
                  </div>

                  {/* Category Filter */}
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="px-4 py-3 bg-background2 border border-gray-700 rounded-lg text-whiteText focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  >
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category === "All" ? "All Categories" : category}
                      </option>
                    ))}
                  </select>
                </div>

                {/* View Controls */}
                <div className="flex items-center space-x-4">
                  {/* Results Count */}
                  <span className="text-grayText text-sm">
                    {filteredTechStacks.length} of {techStacks.length} items
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
            ) : filteredTechStacks.length === 0 ? (
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
                      d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.291-1.1-5.643-2.757C8.056 8.285 10.213 6 12.8 6c1.765 0 3.348.634 4.596 1.686"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-whiteText mb-2">
                  {searchTerm || selectedCategory !== "All"
                    ? "No matching tech stacks found"
                    : "No tech stacks yet"}
                </h3>
                <p className="text-grayText mb-6">
                  {searchTerm || selectedCategory !== "All"
                    ? "Try adjusting your search or filter criteria"
                    : "Get started by adding your first technology stack"}
                </p>
                {!searchTerm && selectedCategory === "All" && (
                  <button
                    onClick={handleAddNew}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 active:scale-95"
                  >
                    Add Your First Tech Stack
                  </button>
                )}
              </div>
            ) : (
              <div
                ref={gridRef}
                className={
                  viewMode === "grid"
                    ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                    : "space-y-4"
                }
              >
                {filteredTechStacks.map((stack, index) => (
                  <div
                    key={stack._id}
                    data-id={stack._id}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, stack._id)}
                    className={
                      viewMode === "list"
                        ? "transform transition-all duration-200 hover:scale-[1.02]"
                        : ""
                    }
                  >
                    {viewMode === "grid" ? (
                      <TechStackCard
                        id={stack._id}
                        name={stack.name}
                        category={stack.category}
                        imageUrl={stack.imageUrl ?? ""}
                        position={index}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        isDragging={draggedItem === stack._id}
                      />
                    ) : (
                      // List View
                      <div className="bg-background border border-gray-800 rounded-xl p-4 hover:border-gray-700 transition-all duration-200">
                        <div className="flex items-center space-x-4">
                          {/* Drag Handle */}
                          <div
                            className="cursor-move text-grayText hover:text-whiteText p-2"
                            draggable
                            onDragStart={(e) => {
                              e.dataTransfer.setData("text/plain", stack._id);
                              setDraggedItem(stack._id);
                            }}
                            onDragEnd={() => setDraggedItem(null)}
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
                                d="M4 8h16M4 16h16"
                              />
                            </svg>
                          </div>

                          {/* Image */}
                          <div className="w-12 h-12 bg-gray-800 rounded-lg overflow-hidden flex-shrink-0">
                            <img
                              src={stack.imageUrl ?? ""}
                              alt={stack.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = `data:image/svg+xml;base64,${btoa(`
                                  <svg width="48" height="48" xmlns="http://www.w3.org/2000/svg">
                                    <rect width="48" height="48" fill="#374151"/>
                                    <text x="24" y="28" text-anchor="middle" fill="#9CA3AF" font-size="8">${stack.name.slice(0, 2).toUpperCase()}</text>
                                  </svg>
                                `)}`;
                              }}
                            />
                          </div>

                          {/* Content */}
                          <div className="flex-1">
                            <h3 className="text-whiteText font-semibold">
                              {stack.name}
                            </h3>
                            <p className="text-grayText text-sm">
                              {stack.category}
                            </p>
                          </div>

                          {/* Position Badge */}
                          <div className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full font-medium">
                            #{stack.position + 1}
                          </div>

                          {/* Actions */}
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleEdit(stack._id)}
                              className="p-2 text-grayText hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-all duration-200"
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
                                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleDelete(stack._id)}
                              className="p-2 text-grayText hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all duration-200"
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
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Modals */}
        <TechStackModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditData(null);
          }}
          onSave={handleSave}
          editData={editData}
        />

        <ConfirmationModal
          isOpen={isConfirmModalOpen}
          onClose={() => {
            setIsConfirmModalOpen(false);
            setDeleteId(null);
          }}
          onConfirm={confirmDelete}
          title="Delete Tech Stack"
          message="Are you sure you want to delete this tech stack? This action cannot be undone."
          confirmText="Delete"
          cancelText="Cancel"
          type="danger"
          isLoading={isLoading}
        />
      </div>
    </AdminLayout>
  );
};

export default AdminTechStack;
