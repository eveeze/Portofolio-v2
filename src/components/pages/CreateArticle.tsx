import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useAuth } from "../../contexts/AuthContext";
import AdminLayout from "../../components/layouts/AdminLayout";
import TipTapEditor from "../../components/ui/TipTapEditor";
import ImageUpload from "../../components/ui/ImageUpload";
import LoadingSkeleton from "../../components/ui/LoadingSkeleton";

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
  seriesId?: string;
  seriesPosition?: number;
}

const CreateArticle: React.FC = () => {
  const navigate = useNavigate();
  const { token } = useAuth();

  // Form state
  const [formData, setFormData] = useState<ArticleFormData>({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    categoryId: "",
    tags: [],
    metaDescription: "",
    featuredImage: null,
    status: "draft",
    readingTime: 1,
    techStack: [],
    images: [],
    seriesId: "",
    seriesPosition: 1,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isScheduled, setIsScheduled] = useState(false);
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");

  // Queries
  const categories = useQuery(api.articles.getArticleCategories, {});
  const tags = useQuery(api.articles.getArticleTags, {});
  const series = useQuery(api.articles.getArticleSeries, {});
  const rawTechStacks = useQuery(api.techStack.getTechStacks, {});

  // Transform tech stacks
  const techStacks =
    rawTechStacks?.map((stack) => ({
      _id: stack._id,
      name: stack.name,
      category: stack.category,
      imageUrl: stack.imageUrl ?? undefined,
    })) || [];

  const CONVEX_HTTP_URL = import.meta.env.VITE_CONVEX_HTTP_URL;

  const getApiBaseUrl = () => {
    if (!CONVEX_HTTP_URL) {
      throw new Error("VITE_CONVEX_HTTP_URL is not configured");
    }
    return CONVEX_HTTP_URL;
  };

  // Auto-generate slug from title
  useEffect(() => {
    if (formData.title && !formData.slug) {
      const slug = formData.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
      setFormData((prev) => ({ ...prev, slug }));
    }
  }, [formData.title]);

  // Calculate reading time from content
  useEffect(() => {
    if (formData.content) {
      const wordsPerMinute = 200;
      const wordCount = formData.content.split(/\s+/).length;
      const readingTime = Math.max(1, Math.ceil(wordCount / wordsPerMinute));
      setFormData((prev) => ({ ...prev, readingTime }));
    }
  }, [formData.content]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    }

    if (!formData.slug.trim()) {
      newErrors.slug = "Slug is required";
    }

    if (!formData.excerpt.trim()) {
      newErrors.excerpt = "Excerpt is required";
    }

    if (!formData.content.trim()) {
      newErrors.content = "Content is required";
    }

    if (!formData.categoryId) {
      newErrors.categoryId = "Category is required";
    }

    if (isScheduled) {
      if (!scheduledDate) {
        newErrors.scheduledDate = "Scheduled date is required";
      }
      if (!scheduledTime) {
        newErrors.scheduledTime = "Scheduled time is required";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof ArticleFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleTagsChange = (selectedTags: string[]) => {
    handleInputChange("tags", selectedTags);
  };

  const handleTechStackChange = (selectedTechStack: string[]) => {
    handleInputChange("techStack", selectedTechStack);
  };

  const handleFeaturedImageChange = (file: File | null) => {
    handleInputChange("featuredImage", file);
  };

  const handleImagesChange = (files: File[]) => {
    handleInputChange("images", files);
  };

  const handleSubmit = async (status: "draft" | "published") => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      let publishedAt;
      let scheduledAt;

      if (status === "published") {
        if (isScheduled && scheduledDate && scheduledTime) {
          const scheduledDateTime = new Date(
            `${scheduledDate}T${scheduledTime}`
          );
          if (scheduledDateTime > new Date()) {
            // If scheduled for future, keep as draft with scheduledAt
            status = "draft";
            scheduledAt = scheduledDateTime.getTime();
          } else {
            // If scheduled for past/now, publish immediately
            publishedAt = Date.now();
          }
        } else {
          publishedAt = Date.now();
        }
      }

      const submissionData = {
        ...formData,
        status,
        publishedAt,
        scheduledAt,
      };

      await saveArticle(submissionData);
      navigate("/admin/articles");
    } catch (error: any) {
      console.error("Error saving article:", error);
      alert(error.message || "Failed to save article");
    } finally {
      setIsLoading(false);
    }
  };

  const saveArticle = async (data: ArticleFormData) => {
    if (!token) {
      throw new Error("No authentication token available");
    }

    const apiBaseUrl = getApiBaseUrl();

    let featuredImageStorageId = null;
    let imageStorageIds: string[] = [];

    // Upload featured image
    if (data.featuredImage) {
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
        body: data.featuredImage,
      });

      if (!uploadResponse.ok) {
        throw new Error("Failed to upload featured image");
      }

      const uploadResult = await uploadResponse.json();
      featuredImageStorageId = uploadResult.storageId;
    }

    // Upload additional images
    if (data.images && data.images.length > 0) {
      for (const image of data.images) {
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
      title: data.title,
      slug: data.slug,
      excerpt: data.excerpt,
      content: data.content,
      categoryId: data.categoryId,
      tags: data.tags,
      metaDescription: data.metaDescription,
      status: data.status,
      publishedAt: data.publishedAt,
      scheduledAt: data.scheduledAt,
      readingTime: data.readingTime,
      techStack: data.techStack,
      ...(featuredImageStorageId && { featuredImageStorageId }),
      ...(imageStorageIds.length > 0 && { imageStorageIds }),
    };

    const response = await fetch(`${apiBaseUrl}/articles`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ error: "Unknown error" }));
      throw new Error(errorData.error || `Failed to save: ${response.status}`);
    }

    const result = await response.json();

    // Handle series assignment
    if (data.seriesId && data.seriesPosition !== undefined) {
      await fetch(`${apiBaseUrl}/articles/series-articles`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          seriesId: data.seriesId,
          articleId: result.articleId,
          position: data.seriesPosition,
        }),
      });
    }

    return result;
  };

  const isLoadingData = !categories || !tags || !series || !techStacks;

  return (
    <AdminLayout
      title="Create New Article"
      subtitle="Write and publish your new blog article"
    >
      <div className="p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={() => navigate("/admin/articles")}
              className="flex items-center space-x-2 text-grayText hover:text-whiteText transition-colors"
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
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              <span>Back to Articles</span>
            </button>

            <div className="flex items-center space-x-3">
              <button
                onClick={() => handleSubmit("draft")}
                disabled={isLoading}
                className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-all duration-200 disabled:opacity-50"
              >
                {isLoading ? "Saving..." : "Save Draft"}
              </button>
              <button
                onClick={() => handleSubmit("published")}
                disabled={isLoading}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all duration-200 disabled:opacity-50"
              >
                {isLoading
                  ? "Publishing..."
                  : isScheduled
                    ? "Schedule"
                    : "Publish"}
              </button>
            </div>
          </div>

          {isLoadingData ? (
            <LoadingSkeleton type="form" count={8} />
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-whiteText mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    className={`w-full px-4 py-3 bg-background2 border rounded-lg text-whiteText focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                      errors.title ? "border-red-500" : "border-gray-700"
                    }`}
                    placeholder="Enter article title..."
                  />
                  {errors.title && (
                    <p className="text-red-500 text-sm mt-1">{errors.title}</p>
                  )}
                </div>

                {/* Slug */}
                <div>
                  <label className="block text-sm font-medium text-whiteText mb-2">
                    Slug *
                  </label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => handleInputChange("slug", e.target.value)}
                    className={`w-full px-4 py-3 bg-background2 border rounded-lg text-whiteText focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                      errors.slug ? "border-red-500" : "border-gray-700"
                    }`}
                    placeholder="article-url-slug"
                  />
                  {errors.slug && (
                    <p className="text-red-500 text-sm mt-1">{errors.slug}</p>
                  )}
                </div>

                {/* Excerpt */}
                <div>
                  <label className="block text-sm font-medium text-whiteText mb-2">
                    Excerpt *
                  </label>
                  <textarea
                    value={formData.excerpt}
                    onChange={(e) =>
                      handleInputChange("excerpt", e.target.value)
                    }
                    rows={3}
                    className={`w-full px-4 py-3 bg-background2 border rounded-lg text-whiteText focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none ${
                      errors.excerpt ? "border-red-500" : "border-gray-700"
                    }`}
                    placeholder="Brief description of your article..."
                  />
                  {errors.excerpt && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.excerpt}
                    </p>
                  )}
                </div>

                {/* Content Editor */}
                <div>
                  <label className="block text-sm font-medium text-whiteText mb-2">
                    Content *
                  </label>
                  <TipTapEditor
                    content={formData.content}
                    onChange={(content) =>
                      handleInputChange("content", content)
                    }
                    placeholder="Start writing your article..."
                  />
                  {errors.content && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.content}
                    </p>
                  )}
                </div>

                {/* Meta Description */}
                <div>
                  <label className="block text-sm font-medium text-whiteText mb-2">
                    Meta Description
                  </label>
                  <textarea
                    value={formData.metaDescription}
                    onChange={(e) =>
                      handleInputChange("metaDescription", e.target.value)
                    }
                    rows={2}
                    maxLength={160}
                    className="w-full px-4 py-3 bg-background2 border border-gray-700 rounded-lg text-whiteText focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                    placeholder="SEO meta description (max 160 characters)..."
                  />
                  <div className="text-xs text-grayText mt-1">
                    {formData.metaDescription?.length || 0}/160 characters
                  </div>
                </div>

                {/* Images */}
                <div>
                  <label className="block text-sm font-medium text-whiteText mb-2">
                    Additional Images
                  </label>
                  <ImageUpload
                    onImagesChange={handleImagesChange}
                    multiple={true}
                    maxFiles={10}
                  />
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Publishing Options */}
                <div className="bg-background border border-gray-800 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-whiteText mb-4">
                    Publishing
                  </h3>

                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="scheduled"
                        checked={isScheduled}
                        onChange={(e) => setIsScheduled(e.target.checked)}
                        className="w-4 h-4 text-blue-600 bg-background2 border-gray-700 rounded focus:ring-blue-500 focus:ring-2"
                      />
                      <label
                        htmlFor="scheduled"
                        className="text-sm text-whiteText"
                      >
                        Schedule for later
                      </label>
                    </div>

                    {isScheduled && (
                      <div className="space-y-3">
                        <input
                          type="date"
                          value={scheduledDate}
                          onChange={(e) => setScheduledDate(e.target.value)}
                          className={`w-full px-3 py-2 bg-background2 border rounded-lg text-whiteText focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm ${
                            errors.scheduledDate
                              ? "border-red-500"
                              : "border-gray-700"
                          }`}
                        />
                        {errors.scheduledDate && (
                          <p className="text-red-500 text-xs">
                            {errors.scheduledDate}
                          </p>
                        )}

                        <input
                          type="time"
                          value={scheduledTime}
                          onChange={(e) => setScheduledTime(e.target.value)}
                          className={`w-full px-3 py-2 bg-background2 border rounded-lg text-whiteText focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm ${
                            errors.scheduledTime
                              ? "border-red-500"
                              : "border-gray-700"
                          }`}
                        />
                        {errors.scheduledTime && (
                          <p className="text-red-500 text-xs">
                            {errors.scheduledTime}
                          </p>
                        )}
                      </div>
                    )}

                    <div className="text-xs text-grayText">
                      Reading time: {formData.readingTime} min
                    </div>
                  </div>
                </div>

                {/* Featured Image */}
                <div className="bg-background border border-gray-800 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-whiteText mb-4">
                    Featured Image
                  </h3>
                  <ImageUpload
                    onImageChange={handleFeaturedImageChange}
                    multiple={false}
                  />
                </div>

                {/* Category */}
                <div className="bg-background border border-gray-800 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-whiteText mb-4">
                    Category *
                  </h3>
                  <select
                    value={formData.categoryId}
                    onChange={(e) =>
                      handleInputChange("categoryId", e.target.value)
                    }
                    className={`w-full px-4 py-3 bg-background2 border rounded-lg text-whiteText focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.categoryId ? "border-red-500" : "border-gray-700"
                    }`}
                  >
                    <option value="">Select category</option>
                    {categories?.map((category) => (
                      <option key={category._id} value={category._id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                  {errors.categoryId && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.categoryId}
                    </p>
                  )}
                </div>

                {/* Tags */}
                <div className="bg-background border border-gray-800 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-whiteText mb-4">
                    Tags
                  </h3>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {tags?.map((tag) => (
                      <label
                        key={tag._id}
                        className="flex items-center space-x-2 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={formData.tags.includes(tag._id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              handleTagsChange([...formData.tags, tag._id]);
                            } else {
                              handleTagsChange(
                                formData.tags.filter((id) => id !== tag._id)
                              );
                            }
                          }}
                          className="w-4 h-4 text-blue-600 bg-background2 border-gray-700 rounded focus:ring-blue-500 focus:ring-2"
                        />
                        <span className="text-sm text-whiteText">
                          {tag.name}
                        </span>
                        {tag.color && (
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: tag.color }}
                          />
                        )}
                      </label>
                    ))}
                  </div>
                </div>

                {/* Tech Stack */}
                {techStacks.length > 0 && (
                  <div className="bg-background border border-gray-800 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-whiteText mb-4">
                      Tech Stack
                    </h3>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {techStacks.map((tech) => (
                        <label
                          key={tech._id}
                          className="flex items-center space-x-2 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={
                              formData.techStack?.includes(tech._id) || false
                            }
                            onChange={(e) => {
                              const currentTechStack = formData.techStack || [];
                              if (e.target.checked) {
                                handleTechStackChange([
                                  ...currentTechStack,
                                  tech._id,
                                ]);
                              } else {
                                handleTechStackChange(
                                  currentTechStack.filter(
                                    (id) => id !== tech._id
                                  )
                                );
                              }
                            }}
                            className="w-4 h-4 text-blue-600 bg-background2 border-gray-700 rounded focus:ring-blue-500 focus:ring-2"
                          />
                          <div className="flex items-center space-x-2">
                            {tech.imageUrl && (
                              <img
                                src={tech.imageUrl}
                                alt={tech.name}
                                className="w-5 h-5 object-contain rounded"
                              />
                            )}
                            <span className="text-sm text-whiteText">
                              {tech.name}
                            </span>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* Series */}
                {series && series.length > 0 && (
                  <div className="bg-background border border-gray-800 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-whiteText mb-4">
                      Article Series
                    </h3>
                    <select
                      value={formData.seriesId || ""}
                      onChange={(e) =>
                        handleInputChange(
                          "seriesId",
                          e.target.value || undefined
                        )
                      }
                      className="w-full px-4 py-3 bg-background2 border border-gray-700 rounded-lg text-whiteText focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-3"
                    >
                      <option value="">No series</option>
                      {series.map((s) => (
                        <option key={s._id} value={s._id}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                    {formData.seriesId && (
                      <input
                        type="number"
                        min="1"
                        value={formData.seriesPosition}
                        onChange={(e) =>
                          handleInputChange(
                            "seriesPosition",
                            parseInt(e.target.value)
                          )
                        }
                        className="w-full px-4 py-3 bg-background2 border border-gray-700 rounded-lg text-whiteText focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Position in series"
                      />
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default CreateArticle;
