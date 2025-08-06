import React, { useState, useEffect, useRef } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useAuth } from "../../contexts/AuthContext";
import { gsap } from "gsap";
import AdminLayout from "../layouts/AdminLayout";
import ArticleCard from "../fragments/admin/articles/ArticleCard";
import ArticleModal from "../fragments/admin/articles/ArticleModal";
import ArticleStats from "../fragments/admin/articles/ArticleStats";
import CategoryModal from "../fragments/admin/articles/CategoryModal";
import TagModal from "../fragments/admin/articles/TagModal";
import SeriesModal from "../fragments/admin/articles/SeriesModal";
import LoadingSkeleton from "../ui/LoadingSkeleton";
import ConfirmationModal from "../ui/ConfirmationModal";

interface ArticleFormData {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  categoryId: string;
  tags: string[];
  metaDescription?: string;
  featuredImage: File | null;
  status: "draft" | "published" | "archived";
  publishedAt?: number;
  scheduledAt?: number;
  readingTime: number;
  techStack?: string[];
  images: File[];
  imagesToDelete?: string[];
  seriesId?: string;
  seriesPosition?: number;
}

interface ConvexArticle {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  categoryId: string;
  tags: string[];
  metaDescription?: string;
  featuredImage?: string;
  status: "draft" | "published" | "archived";
  publishedAt?: number;
  scheduledAt?: number;
  viewCount: number;
  readingTime: number;
  techStack?: Array<{
    _id: string;
    name: string;
    category: string;
    imageUrl?: string;
  }>;
  category?: { _id: string; name: string; slug: string; color?: string };
  articleTags?: Array<{
    _id: string;
    name: string;
    slug: string;
    color?: string;
  }>;
  series?: { _id: string; name: string; position: number };
  images?: Array<{
    _id: string;
    imageUrl: string;
    caption?: string;
    altText?: string;
  }>;
  _creationTime: number;
}

// Type for ArticleCard props
interface ArticleCardData {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  status: "draft" | "published" | "archived";
  featuredImage?: string;
  publishedAt?: number;
  scheduledAt?: number;
  viewCount: number;
  readingTime: number;
  techStack?: Array<{
    _id: string;
    name: string;
    category: string;
    imageUrl?: string;
  }>;
  category?: { _id: string; name: string; slug: string; color?: string };
  tags?: Array<{ _id: string; name: string; color?: string }>;
  series?: { _id: string; name: string; position: number };
  _creationTime: number;
}

// TechStack interface to match expected type
interface TechStack {
  _id: string;
  name: string;
  category: string;
  imageUrl?: string;
  _creationTime: number;
  position: number;
  storageId: string;
}

const AdminArticles: React.FC = () => {
  const { token } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isTagModalOpen, setIsTagModalOpen] = useState(false);
  const [isSeriesModalOpen, setIsSeriesModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [editData, setEditData] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState<"title" | "status" | "recent" | "views">(
    "recent"
  );

  // Refs for animations
  const controlsRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);

  // Queries
  const convexArticles = useQuery(api.articles.getArticles, {}) as
    | ConvexArticle[]
    | undefined;
  const articleStats = useQuery(api.articles.getArticleStats, {});
  const categories = useQuery(api.articles.getArticleCategories, {});
  const tags = useQuery(api.articles.getArticleTags, {});
  const series = useQuery(api.articles.getArticleSeries, {});
  const rawTechStacks = useQuery(api.techStack.getTechStacks, {});
  const scheduledArticles = useQuery(api.articles.getScheduledArticles, {});

  // Get the Convex HTTP URL from environment variable
  const CONVEX_HTTP_URL = import.meta.env.VITE_CONVEX_HTTP_URL;

  const getApiBaseUrl = () => {
    if (!CONVEX_HTTP_URL) {
      const errorMessage =
        "VITE_CONVEX_HTTP_URL (.convex.site URL) is not configured.";
      console.error(errorMessage);
      throw new Error(errorMessage);
    }
    return CONVEX_HTTP_URL;
  };

  const statusOptions = ["All", "draft", "published", "archived"];
  const statusLabels: Record<string, string> = {
    All: "All Status",
    draft: "Draft",
    published: "Published",
    archived: "Archived",
  };

  // Transform raw tech stacks to match expected type
  const techStacks: TechStack[] =
    rawTechStacks?.map((stack) => ({
      _id: stack._id,
      name: stack.name,
      category: stack.category,
      imageUrl: stack.imageUrl ?? undefined,
      _creationTime: stack._creationTime,
      position: stack.position,
      storageId: stack.storageId,
    })) || [];

  // Transform ConvexArticle to ArticleCardData
  const transformArticleForCard = (article: ConvexArticle): ArticleCardData => {
    return {
      _id: article._id,
      title: article.title,
      slug: article.slug,
      excerpt: article.excerpt,
      status: article.status,
      featuredImage: article.featuredImage,
      publishedAt: article.publishedAt,
      scheduledAt: article.scheduledAt,
      viewCount: article.viewCount,
      readingTime: article.readingTime,
      techStack: article.techStack,
      category: article.category,
      tags: article.articleTags?.map((tag) => ({
        _id: tag._id,
        name: tag.name,
        color: tag.color,
      })),
      series: article.series,
      _creationTime: article._creationTime,
    };
  };

  // Filter and sort articles
  const filteredAndSortedArticles = React.useMemo(() => {
    if (!convexArticles) return [];

    let filtered = convexArticles.filter((article) => {
      const matchesSearch =
        article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.content.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus =
        selectedStatus === "All" || article.status === selectedStatus;
      const matchesCategory =
        selectedCategory === "All" ||
        (article.category && article.category._id === selectedCategory);

      return matchesSearch && matchesStatus && matchesCategory;
    });

    // Sort articles
    switch (sortBy) {
      case "title":
        filtered.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case "status":
        filtered.sort((a, b) => a.status.localeCompare(b.status));
        break;
      case "views":
        filtered.sort((a, b) => b.viewCount - a.viewCount);
        break;
      case "recent":
      default:
        filtered.sort((a, b) => {
          if (a.status === "published" && b.status === "published") {
            return (b.publishedAt || 0) - (a.publishedAt || 0);
          }
          return b._creationTime - a._creationTime;
        });
        break;
    }

    return filtered.map(transformArticleForCard);
  }, [convexArticles, searchTerm, selectedStatus, selectedCategory, sortBy]);

  useEffect(() => {
    // Entrance animations
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
    const article = convexArticles?.find((a) => a._id === id);
    if (article) {
      setEditData({
        id: article._id,
        title: article.title,
        slug: article.slug,
        excerpt: article.excerpt,
        content: article.content,
        categoryId: article.categoryId,
        tags: article.tags,
        metaDescription: article.metaDescription,
        featuredImageUrl: article.featuredImage,
        status: article.status,
        publishedAt: article.publishedAt,
        scheduledAt: article.scheduledAt,
        readingTime: article.readingTime,
        techStack: article.techStack?.map((tech) => tech._id) || [],
        images: article.images || [],
        seriesId: article.series?._id,
        seriesPosition: article.series?.position,
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
      const response = await fetch(`${apiBaseUrl}/articles/${deleteId}`, {
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
        throw new Error(
          errorData.error || `Failed to delete: ${response.status}`
        );
      }

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

  const handleSave = async (formData: ArticleFormData) => {
    if (!token) {
      throw new Error("No authentication token available");
    }

    setIsLoading(true);
    try {
      const apiBaseUrl = getApiBaseUrl();

      let featuredImageStorageId = null;
      let imageStorageIds: string[] = [];

      // Handle existing image deletions first (for edit mode)
      if (
        editData &&
        formData.imagesToDelete &&
        formData.imagesToDelete.length > 0
      ) {
        for (const imageId of formData.imagesToDelete) {
          try {
            await fetch(`${apiBaseUrl}/articles/images/${imageId}`, {
              method: "DELETE",
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            });
          } catch (error) {
            console.warn(`Error deleting image ${imageId}:`, error);
          }
        }
      }

      // Upload featured image if provided
      if (formData.featuredImage) {
        const uploadUrlResponse = await fetch(
          `${apiBaseUrl}/articles/generateUploadUrl`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!uploadUrlResponse.ok) {
          throw new Error("Failed to get upload URL");
        }

        const uploadUrlData = await uploadUrlResponse.json();
        const uploadResponse = await fetch(uploadUrlData.url, {
          method: "POST",
          body: formData.featuredImage,
        });

        if (!uploadResponse.ok) {
          throw new Error("Failed to upload featured image");
        }

        const uploadResult = await uploadResponse.json();
        featuredImageStorageId = uploadResult.storageId;
      }

      // Upload additional images
      if (formData.images && formData.images.length > 0) {
        for (const image of formData.images) {
          const uploadUrlResponse = await fetch(
            `${apiBaseUrl}/articles/generateUploadUrl`,
            {
              method: "GET",
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            }
          );

          if (!uploadUrlResponse.ok) {
            throw new Error("Failed to get upload URL for image");
          }

          const uploadUrlData = await uploadUrlResponse.json();
          const uploadResponse = await fetch(uploadUrlData.url, {
            method: "POST",
            body: image,
          });

          if (!uploadResponse.ok) {
            throw new Error("Failed to upload image");
          }

          const uploadResult = await uploadResponse.json();
          imageStorageIds.push(uploadResult.storageId);
        }
      }

      const payload = {
        title: formData.title,
        slug: formData.slug,
        excerpt: formData.excerpt,
        content: formData.content,
        categoryId: formData.categoryId,
        tags: formData.tags,
        metaDescription: formData.metaDescription,
        status: formData.status,
        publishedAt: formData.publishedAt,
        scheduledAt: formData.scheduledAt,
        readingTime: formData.readingTime,
        techStack: formData.techStack,
        ...(featuredImageStorageId && { featuredImageStorageId }),
        ...(imageStorageIds.length > 0 && { imageStorageIds }),
      };

      let response;
      if (editData) {
        // Update existing article
        response = await fetch(`${apiBaseUrl}/articles/${editData.id}`, {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });
      } else {
        // Create new article
        response = await fetch(`${apiBaseUrl}/articles`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });
      }

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ error: "Unknown error" }));
        throw new Error(
          errorData.error || `Failed to save: ${response.status}`
        );
      }

      const result = await response.json();

      // Handle series assignment if needed
      if (formData.seriesId && formData.seriesPosition !== undefined) {
        const articleId = editData?.id || result.articleId;
        await fetch(`${apiBaseUrl}/articles/series-articles`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            seriesId: formData.seriesId,
            articleId,
            position: formData.seriesPosition,
          }),
        });
      }

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

  const isLoadingData = !convexArticles || !articleStats;

  return (
    <AdminLayout
      title="Article Management"
      subtitle="Create, edit, and manage your blog articles and content"
    >
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header Actions */}
          <div className="flex flex-wrap gap-4 justify-end mb-8">
            <button
              onClick={() => setIsCategoryModalOpen(true)}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 active:scale-95 flex items-center space-x-2"
            >
              <span>Categories</span>
            </button>
            <button
              onClick={() => setIsTagModalOpen(true)}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 active:scale-95 flex items-center space-x-2"
            >
              <span>Tags</span>
            </button>
            <button
              onClick={() => setIsSeriesModalOpen(true)}
              className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 active:scale-95 flex items-center space-x-2"
            >
              <span>Series</span>
            </button>
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
              <span>Add Article</span>
            </button>
          </div>

          {/* Stats */}
          <div ref={statsRef}>
            {isLoadingData ? (
              <LoadingSkeleton type="stats" count={4} />
            ) : (
              <ArticleStats
                totalArticles={articleStats?.total || 0}
                publishedArticles={articleStats?.published || 0}
                draftArticles={articleStats?.draft || 0}
                totalViews={articleStats?.totalViews || 0}
                scheduledCount={scheduledArticles?.length || 0}
                articlesByCategory={articleStats?.articlesByCategory || []}
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
                      placeholder="Search articles..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-background2 border border-gray-700 rounded-lg text-whiteText focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    />
                  </div>

                  {/* Status Filter */}
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="px-4 py-3 bg-background2 border border-gray-700 rounded-lg text-whiteText focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  >
                    {statusOptions.map((status) => (
                      <option key={status} value={status}>
                        {statusLabels[status]}
                      </option>
                    ))}
                  </select>

                  {/* Category Filter */}
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="px-4 py-3 bg-background2 border border-gray-700 rounded-lg text-whiteText focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  >
                    <option value="All">All Categories</option>
                    {categories?.map((category) => (
                      <option key={category._id} value={category._id}>
                        {category.name}
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
                    <option value="status">Status</option>
                    <option value="views">Most Views</option>
                  </select>
                </div>

                {/* View Controls */}
                <div className="flex items-center space-x-4">
                  {/* Results Count */}
                  <span className="text-grayText text-sm">
                    {filteredAndSortedArticles.length} of{" "}
                    {convexArticles?.length || 0} articles
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
            ) : filteredAndSortedArticles.length === 0 ? (
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
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-whiteText mb-2">
                  {searchTerm ||
                  selectedStatus !== "All" ||
                  selectedCategory !== "All"
                    ? "No matching articles found"
                    : "No articles yet"}
                </h3>
                <p className="text-grayText mb-6">
                  {searchTerm ||
                  selectedStatus !== "All" ||
                  selectedCategory !== "All"
                    ? "Try adjusting your search or filter criteria"
                    : "Get started by creating your first article"}
                </p>
                {!searchTerm &&
                  selectedStatus === "All" &&
                  selectedCategory === "All" && (
                    <button
                      onClick={handleAddNew}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 active:scale-95"
                    >
                      Create Your First Article
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
                {filteredAndSortedArticles.map((article) => (
                  <div
                    key={article._id}
                    data-id={article._id}
                    className={
                      viewMode === "list"
                        ? "transform transition-all duration-200 hover:scale-[1.01]"
                        : ""
                    }
                  >
                    <ArticleCard
                      article={article}
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
        <ArticleModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditData(null);
          }}
          onSave={handleSave}
          editData={editData}
          categories={categories || []}
          tags={tags || []}
          series={series || []}
          techStacks={techStacks}
        />

        <CategoryModal
          isOpen={isCategoryModalOpen}
          onClose={() => setIsCategoryModalOpen(false)}
          categories={categories || []}
        />

        <TagModal
          isOpen={isTagModalOpen}
          onClose={() => setIsTagModalOpen(false)}
          tags={tags || []}
        />

        <SeriesModal
          isOpen={isSeriesModalOpen}
          onClose={() => setIsSeriesModalOpen(false)}
          series={series || []}
        />

        <ConfirmationModal
          isOpen={isConfirmModalOpen}
          onClose={() => {
            setIsConfirmModalOpen(false);
            setDeleteId(null);
          }}
          onConfirm={confirmDelete}
          title="Delete Article"
          message="Are you sure you want to delete this article? This action cannot be undone and will remove all associated data."
          confirmText="Delete"
          cancelText="Cancel"
          type="danger"
          isLoading={isLoading}
        />
      </div>
    </AdminLayout>
  );
};

export default AdminArticles;
