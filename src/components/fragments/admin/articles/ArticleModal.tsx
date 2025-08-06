import React, { useState, useEffect, useRef } from "react";
import { gsap } from "gsap";

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

interface Category {
  _id: string;
  name: string;
  slug: string;
  color?: string;
}

interface Tag {
  _id: string;
  name: string;
  slug: string;
  color?: string;
}

interface Series {
  _id: string;
  name: string;
  slug: string;
  description?: string;
}

interface TechStack {
  _id: string;
  name: string;
  category: string;
  imageUrl?: string;
}

interface EditData {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  categoryId: string;
  tags: string[];
  metaDescription?: string;
  featuredImageUrl?: string;
  status: "draft" | "published" | "archived";
  publishedAt?: number;
  scheduledAt?: number;
  readingTime: number;
  techStack: string[];
  images: Array<{
    _id: string;
    imageUrl: string;
    caption?: string;
    altText?: string;
  }>;
  seriesId?: string;
  seriesPosition?: number;
}

interface ArticleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (formData: ArticleFormData) => Promise<void>;
  editData: EditData | null;
  categories: Category[];
  tags: Tag[];
  series: Series[];
  techStacks: TechStack[];
}

const ArticleModal: React.FC<ArticleModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editData,
  categories,
  tags,
  series,
  techStacks,
}) => {
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
    imagesToDelete: [],
  });

  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedTechStack, setSelectedTechStack] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showScheduling, setShowScheduling] = useState(false);
  const [featuredImagePreview, setFeaturedImagePreview] = useState<string>("");
  const [additionalImagePreviews, setAdditionalImagePreviews] = useState<
    string[]
  >([]);

  const modalRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Generate slug from title
  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();
  };

  // Calculate reading time (assuming 200 words per minute)
  const calculateReadingTime = (content: string) => {
    const words = content.split(/\s+/).filter((word) => word.length > 0);
    return Math.max(1, Math.ceil(words.length / 200));
  };

  useEffect(() => {
    if (editData) {
      setFormData({
        title: editData.title,
        slug: editData.slug,
        excerpt: editData.excerpt,
        content: editData.content,
        categoryId: editData.categoryId,
        tags: editData.tags,
        metaDescription: editData.metaDescription,
        featuredImage: null,
        status: editData.status,
        publishedAt: editData.publishedAt,
        scheduledAt: editData.scheduledAt,
        readingTime: editData.readingTime,
        techStack: editData.techStack,
        images: [],
        imagesToDelete: [],
        seriesId: editData.seriesId,
        seriesPosition: editData.seriesPosition,
      });
      setSelectedTags(editData.tags);
      setSelectedTechStack(editData.techStack);
      setFeaturedImagePreview(editData.featuredImageUrl || "");
      setShowScheduling(!!editData.scheduledAt);
    } else {
      // Reset form for new article
      setFormData({
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
        imagesToDelete: [],
      });
      setSelectedTags([]);
      setSelectedTechStack([]);
      setFeaturedImagePreview("");
      setAdditionalImagePreviews([]);
      setShowScheduling(false);
    }
    setErrors({});
  }, [editData, isOpen]);

  useEffect(() => {
    if (isOpen && modalRef.current && contentRef.current) {
      gsap.fromTo(
        modalRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.3 }
      );
      gsap.fromTo(
        contentRef.current,
        { scale: 0.95, y: 20 },
        { scale: 1, y: 0, duration: 0.3, ease: "power2.out" }
      );
    }
  }, [isOpen]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;

    if (name === "title") {
      const newSlug = generateSlug(value);
      setFormData((prev) => ({
        ...prev,
        [name]: value,
        slug: newSlug,
      }));
    } else if (name === "content") {
      const readingTime = calculateReadingTime(value);
      setFormData((prev) => ({
        ...prev,
        [name]: value,
        readingTime,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleTagToggle = (tagId: string) => {
    const newSelectedTags = selectedTags.includes(tagId)
      ? selectedTags.filter((id) => id !== tagId)
      : [...selectedTags, tagId];

    setSelectedTags(newSelectedTags);
    setFormData((prev) => ({
      ...prev,
      tags: newSelectedTags,
    }));
  };

  const handleTechStackToggle = (techId: string) => {
    const newSelectedTechStack = selectedTechStack.includes(techId)
      ? selectedTechStack.filter((id) => id !== techId)
      : [...selectedTechStack, techId];

    setSelectedTechStack(newSelectedTechStack);
    setFormData((prev) => ({
      ...prev,
      techStack: newSelectedTechStack,
    }));
  };

  const handleFeaturedImageChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData((prev) => ({
        ...prev,
        featuredImage: file,
      }));

      const reader = new FileReader();
      reader.onload = (e) => {
        setFeaturedImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAdditionalImagesChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, ...files],
      }));

      // Create previews
      files.forEach((file) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          setAdditionalImagePreviews((prev) => [
            ...prev,
            e.target?.result as string,
          ]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeAdditionalImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
    setAdditionalImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const validateForm = () => {
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

    if (
      formData.status === "published" &&
      !formData.publishedAt &&
      !showScheduling
    ) {
      setFormData((prev) => ({
        ...prev,
        publishedAt: Date.now(),
      }));
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      await onSave(formData);
    } catch (error) {
      console.error("Error saving article:", error);
      // Handle error (could show a toast notification)
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      ref={modalRef}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={handleClose}
    >
      <div
        ref={contentRef}
        className="bg-background border border-gray-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-background border-b border-gray-800 p-6 z-10">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-whiteText">
              {editData ? "Edit Article" : "Create New Article"}
            </h2>
            <button
              onClick={handleClose}
              disabled={isLoading}
              className="p-2 text-grayText hover:text-whiteText hover:bg-gray-800 rounded-lg transition-all duration-200 disabled:opacity-50"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-whiteText">
              Basic Information
            </h3>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-grayText mb-2">
                Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
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
              <label className="block text-sm font-medium text-grayText mb-2">
                Slug *
              </label>
              <input
                type="text"
                name="slug"
                value={formData.slug}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 bg-background2 border rounded-lg text-whiteText focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                  errors.slug ? "border-red-500" : "border-gray-700"
                }`}
                placeholder="article-slug"
              />
              {errors.slug && (
                <p className="text-red-500 text-sm mt-1">{errors.slug}</p>
              )}
            </div>

            {/* Excerpt */}
            <div>
              <label className="block text-sm font-medium text-grayText mb-2">
                Excerpt *
              </label>
              <textarea
                name="excerpt"
                value={formData.excerpt}
                onChange={handleInputChange}
                rows={3}
                className={`w-full px-4 py-3 bg-background2 border rounded-lg text-whiteText focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-vertical ${
                  errors.excerpt ? "border-red-500" : "border-gray-700"
                }`}
                placeholder="Brief description of the article..."
              />
              {errors.excerpt && (
                <p className="text-red-500 text-sm mt-1">{errors.excerpt}</p>
              )}
            </div>

            {/* Content */}
            <div>
              <label className="block text-sm font-medium text-grayText mb-2">
                Content *
              </label>
              <textarea
                name="content"
                value={formData.content}
                onChange={handleInputChange}
                rows={12}
                className={`w-full px-4 py-3 bg-background2 border rounded-lg text-whiteText focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-vertical ${
                  errors.content ? "border-red-500" : "border-gray-700"
                }`}
                placeholder="Write your article content here..."
              />
              {errors.content && (
                <p className="text-red-500 text-sm mt-1">{errors.content}</p>
              )}
              <p className="text-sm text-grayText mt-1">
                Estimated reading time: {formData.readingTime} minute
                {formData.readingTime !== 1 ? "s" : ""}
              </p>
            </div>
          </div>

          {/* Category and Tags */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-whiteText">
              Classification
            </h3>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-grayText mb-2">
                Category *
              </label>
              <select
                name="categoryId"
                value={formData.categoryId}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 bg-background2 border rounded-lg text-whiteText focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                  errors.categoryId ? "border-red-500" : "border-gray-700"
                }`}
              >
                <option value="">Select a category</option>
                {categories.map((category) => (
                  <option key={category._id} value={category._id}>
                    {category.name}
                  </option>
                ))}
              </select>
              {errors.categoryId && (
                <p className="text-red-500 text-sm mt-1">{errors.categoryId}</p>
              )}
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-grayText mb-2">
                Tags
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-32 overflow-y-auto p-3 bg-background2 border border-gray-700 rounded-lg">
                {tags.map((tag) => (
                  <label
                    key={tag._id}
                    className="flex items-center space-x-2 text-sm cursor-pointer hover:bg-gray-800 p-2 rounded"
                  >
                    <input
                      type="checkbox"
                      checked={selectedTags.includes(tag._id)}
                      onChange={() => handleTagToggle(tag._id)}
                      className="rounded border-gray-600 bg-background text-blue-600 focus:ring-blue-500"
                    />
                    <span
                      className="text-whiteText"
                      style={{ color: tag.color || "#ffffff" }}
                    >
                      #{tag.name}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Series */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-whiteText">
              Series (Optional)
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Series Selection */}
              <div>
                <label className="block text-sm font-medium text-grayText mb-2">
                  Series
                </label>
                <select
                  name="seriesId"
                  value={formData.seriesId || ""}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-background2 border border-gray-700 rounded-lg text-whiteText focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                >
                  <option value="">No series</option>
                  {series.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Series Position */}
              {formData.seriesId && (
                <div>
                  <label className="block text-sm font-medium text-grayText mb-2">
                    Position in Series
                  </label>
                  <input
                    type="number"
                    name="seriesPosition"
                    value={formData.seriesPosition || ""}
                    onChange={handleInputChange}
                    min="1"
                    className="w-full px-4 py-3 bg-background2 border border-gray-700 rounded-lg text-whiteText focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="1"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Tech Stack */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-whiteText">
              Tech Stack (Optional)
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 max-h-32 overflow-y-auto p-3 bg-background2 border border-gray-700 rounded-lg">
              {techStacks.map((tech) => (
                <label
                  key={tech._id}
                  className="flex items-center space-x-2 text-sm cursor-pointer hover:bg-gray-800 p-2 rounded"
                >
                  <input
                    type="checkbox"
                    checked={selectedTechStack.includes(tech._id)}
                    onChange={() => handleTechStackToggle(tech._id)}
                    className="rounded border-gray-600 bg-background text-blue-600 focus:ring-blue-500"
                  />
                  <div className="flex items-center space-x-2">
                    {tech.imageUrl && (
                      <img
                        src={tech.imageUrl}
                        alt={tech.name}
                        className="w-4 h-4 rounded"
                      />
                    )}
                    <span className="text-whiteText">{tech.name}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Images */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-whiteText">Images</h3>

            {/* Featured Image */}
            <div>
              <label className="block text-sm font-medium text-grayText mb-2">
                Featured Image
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFeaturedImageChange}
                className="w-full px-4 py-3 bg-background2 border border-gray-700 rounded-lg text-whiteText focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
              {featuredImagePreview && (
                <div className="mt-2">
                  <img
                    src={featuredImagePreview}
                    alt="Featured preview"
                    className="w-32 h-32 object-cover rounded-lg"
                  />
                </div>
              )}
            </div>

            {/* Additional Images */}
            <div>
              <label className="block text-sm font-medium text-grayText mb-2">
                Additional Images
              </label>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleAdditionalImagesChange}
                className="w-full px-4 py-3 bg-background2 border border-gray-700 rounded-lg text-whiteText focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
              {additionalImagePreviews.length > 0 && (
                <div className="mt-2 grid grid-cols-4 gap-2">
                  {additionalImagePreviews.map((preview, index) => (
                    <div key={index} className="relative">
                      <img
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-20 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeAdditionalImage(index)}
                        className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-700 transition-colors"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* SEO */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-whiteText">SEO</h3>

            <div>
              <label className="block text-sm font-medium text-grayText mb-2">
                Meta Description
              </label>
              <textarea
                name="metaDescription"
                value={formData.metaDescription || ""}
                onChange={handleInputChange}
                rows={2}
                maxLength={160}
                className="w-full px-4 py-3 bg-background2 border border-gray-700 rounded-lg text-whiteText focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-vertical"
                placeholder="SEO meta description (max 160 characters)..."
              />
              <p className="text-sm text-grayText mt-1">
                {(formData.metaDescription || "").length}/160 characters
              </p>
            </div>
          </div>

          {/* Publishing Options */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-whiteText">Publishing</h3>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-grayText mb-2">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-background2 border border-gray-700 rounded-lg text-whiteText focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            {/* Scheduling */}
            <div>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showScheduling}
                  onChange={(e) => setShowScheduling(e.target.checked)}
                  className="rounded border-gray-600 bg-background text-blue-600 focus:ring-blue-500"
                />
                <span className="text-grayText">Schedule for later</span>
              </label>
            </div>

            {showScheduling && (
              <div>
                <label className="block text-sm font-medium text-grayText mb-2">
                  Scheduled Date & Time
                </label>
                <input
                  type="datetime-local"
                  name="scheduledAt"
                  value={
                    formData.scheduledAt
                      ? new Date(formData.scheduledAt)
                          .toISOString()
                          .slice(0, 16)
                      : ""
                  }
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      scheduledAt: e.target.value
                        ? new Date(e.target.value).getTime()
                        : undefined,
                    }))
                  }
                  className="w-full px-4 py-3 bg-background2 border border-gray-700 rounded-lg text-whiteText focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-800">
            <button
              type="button"
              onClick={handleClose}
              disabled={isLoading}
              className="px-6 py-3 text-grayText hover:text-whiteText hover:bg-gray-800 rounded-lg transition-all duration-200 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all duration-200 transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:transform-none flex items-center space-x-2"
            >
              {isLoading && (
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    className="opacity-25"
                  ></circle>
                  <path
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    className="opacity-75"
                  ></path>
                </svg>
              )}
              <span>
                {isLoading
                  ? "Saving..."
                  : editData
                    ? "Update Article"
                    : "Create Article"}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ArticleModal;
