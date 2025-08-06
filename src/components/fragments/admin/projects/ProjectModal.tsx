import React, { useState, useEffect } from "react";

interface ProjectFormData {
  title: string;
  description: string;
  techStack: string[];
  projectUrl?: string;
  projectType: "website" | "mobile" | "backend" | "desktop" | "other";
  githubUrl?: string;
  thumbnail: File | null;
  images: File[];
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
  description: string;
  techStack: string[];
  projectUrl?: string;
  projectType: "website" | "mobile" | "backend" | "desktop" | "other";
  githubUrl?: string;
  thumbnailUrl?: string;
  images?: Array<{
    _id: string;
    imageUrl: string;
  }>;
}

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: ProjectFormData) => Promise<void>;
  editData?: EditData | null;
  techStacks: TechStack[];
}

interface ImagePreview {
  id: string;
  url: string;
  file?: File;
  isExisting?: boolean;
}

const ProjectModal: React.FC<ProjectModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editData,
  techStacks,
}) => {
  const [formData, setFormData] = useState<ProjectFormData>({
    title: "",
    description: "",
    techStack: [],
    projectUrl: "",
    projectType: "website",
    githubUrl: "",
    thumbnail: null,
    images: [],
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [imagePreviews, setImagePreviews] = useState<ImagePreview[]>([]);
  const [imagesToDelete, setImagesToDelete] = useState<string[]>([]);

  const projectTypes = [
    { value: "website", label: "Website" },
    { value: "mobile", label: "Mobile App" },
    { value: "backend", label: "Backend" },
    { value: "desktop", label: "Desktop App" },
    { value: "other", label: "Other" },
  ];

  // Reset form when modal opens/closes or editData changes
  useEffect(() => {
    if (isOpen) {
      if (editData) {
        setFormData({
          title: editData.title,
          description: editData.description,
          techStack: editData.techStack,
          projectUrl: editData.projectUrl || "",
          projectType: editData.projectType,
          githubUrl: editData.githubUrl || "",
          thumbnail: null,
          images: [],
        });
        setThumbnailPreview(editData.thumbnailUrl || null);

        // Set existing images as previews
        const existingImages: ImagePreview[] =
          editData.images?.map((img) => ({
            id: img._id,
            url: img.imageUrl,
            isExisting: true,
          })) || [];
        setImagePreviews(existingImages);
      } else {
        setFormData({
          title: "",
          description: "",
          techStack: [],
          projectUrl: "",
          projectType: "website",
          githubUrl: "",
          thumbnail: null,
          images: [],
        });
        setThumbnailPreview(null);
        setImagePreviews([]);
      }
      setErrors({});
      setImagesToDelete([]);
    }
  }, [isOpen, editData]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    }

    if (formData.techStack.length === 0) {
      newErrors.techStack = "At least one technology is required";
    }

    if (!editData && !formData.thumbnail) {
      newErrors.thumbnail = "Thumbnail is required for new projects";
    }

    if (formData.projectUrl && !isValidUrl(formData.projectUrl)) {
      newErrors.projectUrl = "Please enter a valid URL";
    }

    if (formData.githubUrl && !isValidUrl(formData.githubUrl)) {
      newErrors.githubUrl = "Please enter a valid URL";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleTechStackChange = (techId: string) => {
    setFormData((prev) => ({
      ...prev,
      techStack: prev.techStack.includes(techId)
        ? prev.techStack.filter((id) => id !== techId)
        : [...prev.techStack, techId],
    }));
    if (errors.techStack) {
      setErrors((prev) => ({ ...prev, techStack: "" }));
    }
  };

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrors((prev) => ({
          ...prev,
          thumbnail: "File size must be less than 5MB",
        }));
        return;
      }
      setFormData((prev) => ({ ...prev, thumbnail: file }));
      setThumbnailPreview(URL.createObjectURL(file));
      if (errors.thumbnail) {
        setErrors((prev) => ({ ...prev, thumbnail: "" }));
      }
    }
  };

  const handleImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter((file) => file.size <= 5 * 1024 * 1024);

    if (validFiles.length !== files.length) {
      setErrors((prev) => ({
        ...prev,
        images: "Some files were skipped (max 5MB each)",
      }));
    }

    // Add new images to existing previews
    const newImagePreviews: ImagePreview[] = validFiles.map((file, index) => ({
      id: `new-${Date.now()}-${index}`,
      url: URL.createObjectURL(file),
      file,
      isExisting: false,
    }));

    setImagePreviews((prev) => [...prev, ...newImagePreviews]);
    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, ...validFiles],
    }));
  };

  const handleRemoveImage = (imageId: string) => {
    const imageToRemove = imagePreviews.find((img) => img.id === imageId);

    if (imageToRemove?.isExisting) {
      // Mark existing image for deletion
      setImagesToDelete((prev) => [...prev, imageId]);
    } else if (imageToRemove?.file) {
      // Remove new image file from formData
      setFormData((prev) => ({
        ...prev,
        images: prev.images.filter(
          (file) => URL.createObjectURL(file) !== imageToRemove.url
        ),
      }));
    }

    // Remove from previews
    setImagePreviews((prev) => prev.filter((img) => img.id !== imageId));
  };

  const handleReorderImages = (fromIndex: number, toIndex: number) => {
    const newPreviews = [...imagePreviews];
    const [movedItem] = newPreviews.splice(fromIndex, 1);
    newPreviews.splice(toIndex, 0, movedItem);
    setImagePreviews(newPreviews);

    // Also reorder files in formData
    const newFiles = [...formData.images];
    const fileFromIndex = newPreviews.findIndex(
      (preview) => preview.file && formData.images.includes(preview.file)
    );
    if (fileFromIndex >= 0) {
      const [movedFile] = newFiles.splice(fileFromIndex, 1);
      newFiles.splice(toIndex, 0, movedFile);
      setFormData((prev) => ({ ...prev, images: newFiles }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    try {
      // Create modified formData with deletion info for existing project
      const submitData = {
        ...formData,
        imagesToDelete: editData ? imagesToDelete : [],
      };

      await onSave(submitData as any);
      onClose();
    } catch (error: any) {
      setErrors({ general: error.message || "Failed to save project" });
    } finally {
      setIsLoading(false);
    }
  };

  const groupedTechStacks = techStacks.reduce(
    (acc, tech) => {
      if (!acc[tech.category]) {
        acc[tech.category] = [];
      }
      acc[tech.category].push(tech);
      return acc;
    },
    {} as Record<string, TechStack[]>
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
      <div className="bg-background border border-gray-800 rounded-xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <h2 className="text-xl font-semibold text-whiteText">
            {editData ? "Edit Project" : "Add New Project"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-grayText hover:text-whiteText hover:bg-gray-800 rounded-lg transition-colors"
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
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {errors.general && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg">
                {errors.general}
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-6">
                {/* Title */}
                <div>
                  <label className="block text-whiteText font-medium mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 bg-background2 border rounded-lg text-whiteText transition-colors ${
                      errors.title
                        ? "border-red-500"
                        : "border-gray-700 focus:border-blue-500"
                    }`}
                    placeholder="Enter project title"
                  />
                  {errors.title && (
                    <p className="text-red-400 text-sm mt-1">{errors.title}</p>
                  )}
                </div>

                {/* Description */}
                <div>
                  <label className="block text-whiteText font-medium mb-2">
                    Description *
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={4}
                    className={`w-full px-4 py-3 bg-background2 border rounded-lg text-whiteText resize-none transition-colors ${
                      errors.description
                        ? "border-red-500"
                        : "border-gray-700 focus:border-blue-500"
                    }`}
                    placeholder="Describe your project"
                  />
                  {errors.description && (
                    <p className="text-red-400 text-sm mt-1">
                      {errors.description}
                    </p>
                  )}
                </div>

                {/* Project Type */}
                <div>
                  <label className="block text-whiteText font-medium mb-2">
                    Project Type *
                  </label>
                  <select
                    name="projectType"
                    value={formData.projectType}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-background2 border border-gray-700 rounded-lg text-whiteText focus:border-blue-500 transition-colors"
                  >
                    {projectTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* URLs */}
                <div>
                  <label className="block text-whiteText font-medium mb-2">
                    Project URL
                  </label>
                  <input
                    type="url"
                    name="projectUrl"
                    value={formData.projectUrl}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 bg-background2 border rounded-lg text-whiteText transition-colors ${
                      errors.projectUrl
                        ? "border-red-500"
                        : "border-gray-700 focus:border-blue-500"
                    }`}
                    placeholder="https://example.com"
                  />
                  {errors.projectUrl && (
                    <p className="text-red-400 text-sm mt-1">
                      {errors.projectUrl}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-whiteText font-medium mb-2">
                    GitHub URL
                  </label>
                  <input
                    type="url"
                    name="githubUrl"
                    value={formData.githubUrl}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 bg-background2 border rounded-lg text-whiteText transition-colors ${
                      errors.githubUrl
                        ? "border-red-500"
                        : "border-gray-700 focus:border-blue-500"
                    }`}
                    placeholder="https://github.com/username/repo"
                  />
                  {errors.githubUrl && (
                    <p className="text-red-400 text-sm mt-1">
                      {errors.githubUrl}
                    </p>
                  )}
                </div>

                {/* Tech Stack */}
                <div>
                  <label className="block text-whiteText font-medium mb-2">
                    Technologies *
                  </label>
                  <div className="max-h-48 overflow-y-auto bg-background2 border border-gray-700 rounded-lg p-4">
                    {Object.entries(groupedTechStacks).map(
                      ([category, techs]) => (
                        <div key={category} className="mb-4 last:mb-0">
                          <h4 className="text-grayText text-sm font-medium mb-2 capitalize">
                            {category}
                          </h4>
                          <div className="grid grid-cols-2 gap-2">
                            {techs.map((tech) => (
                              <label
                                key={tech._id}
                                className="flex items-center space-x-2 cursor-pointer hover:bg-gray-800 p-2 rounded"
                              >
                                <input
                                  type="checkbox"
                                  checked={formData.techStack.includes(
                                    tech._id
                                  )}
                                  onChange={() =>
                                    handleTechStackChange(tech._id)
                                  }
                                  className="w-4 h-4 text-blue-600 bg-gray-800 border-gray-600 rounded focus:ring-blue-500"
                                />
                                {tech.imageUrl && (
                                  <img
                                    src={tech.imageUrl}
                                    alt={tech.name}
                                    className="w-5 h-5 rounded object-cover"
                                  />
                                )}
                                <span className="text-whiteText text-sm">
                                  {tech.name}
                                </span>
                              </label>
                            ))}
                          </div>
                        </div>
                      )
                    )}
                  </div>
                  {errors.techStack && (
                    <p className="text-red-400 text-sm mt-1">
                      {errors.techStack}
                    </p>
                  )}
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                {/* Thumbnail */}
                <div>
                  <label className="block text-whiteText font-medium mb-2">
                    Thumbnail {!editData && "*"}
                  </label>
                  <div className="space-y-3">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleThumbnailChange}
                      className="w-full px-4 py-3 bg-background2 border border-gray-700 rounded-lg text-whiteText file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700"
                    />
                    {thumbnailPreview && (
                      <div className="relative">
                        <img
                          src={thumbnailPreview}
                          alt="Thumbnail preview"
                          className="w-full h-32 object-cover rounded-lg"
                        />
                      </div>
                    )}
                  </div>
                  {errors.thumbnail && (
                    <p className="text-red-400 text-sm mt-1">
                      {errors.thumbnail}
                    </p>
                  )}
                </div>

                {/* Project Images */}
                <div>
                  <label className="block text-whiteText font-medium mb-2">
                    Project Images
                    <span className="text-grayText text-sm font-normal ml-2">
                      ({imagePreviews.length} images)
                    </span>
                  </label>

                  {/* Add Images Button */}
                  <div className="mb-4">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImagesChange}
                      className="w-full px-4 py-3 bg-background2 border border-gray-700 rounded-lg text-whiteText file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700"
                    />
                  </div>

                  {/* Images Preview Grid */}
                  {imagePreviews.length > 0 && (
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3 max-h-60 overflow-y-auto p-2 bg-background2 rounded-lg border border-gray-700">
                        {imagePreviews.map((image, index) => (
                          <div
                            key={image.id}
                            className="relative group aspect-square"
                          >
                            <img
                              src={image.url}
                              alt={`Preview ${index + 1}`}
                              className="w-full h-full object-cover rounded-lg"
                            />

                            {/* Image Controls Overlay */}
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center space-x-2">
                              {/* Move Up Button */}
                              {index > 0 && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleReorderImages(index, index - 1)
                                  }
                                  className="p-1 bg-blue-600 hover:bg-blue-700 text-white rounded"
                                  title="Move up"
                                >
                                  <svg
                                    className="w-4 h-4"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M5 15l7-7 7 7"
                                    />
                                  </svg>
                                </button>
                              )}

                              {/* Delete Button */}
                              <button
                                type="button"
                                onClick={() => handleRemoveImage(image.id)}
                                className="p-1 bg-red-600 hover:bg-red-700 text-white rounded"
                                title="Remove image"
                              >
                                <svg
                                  className="w-4 h-4"
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

                              {/* Move Down Button */}
                              {index < imagePreviews.length - 1 && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleReorderImages(index, index + 1)
                                  }
                                  className="p-1 bg-blue-600 hover:bg-blue-700 text-white rounded"
                                  title="Move down"
                                >
                                  <svg
                                    className="w-4 h-4"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M19 9l-7 7-7-7"
                                    />
                                  </svg>
                                </button>
                              )}
                            </div>

                            {/* Image Status Badge */}
                            <div className="absolute top-2 left-2">
                              {image.isExisting ? (
                                <span className="px-2 py-1 bg-green-600 text-white text-xs rounded">
                                  Saved
                                </span>
                              ) : (
                                <span className="px-2 py-1 bg-blue-600 text-white text-xs rounded">
                                  New
                                </span>
                              )}
                            </div>

                            {/* Image Index */}
                            <div className="absolute top-2 right-2">
                              <span className="px-2 py-1 bg-black/70 text-white text-xs rounded">
                                #{index + 1}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Images Info */}
                      <div className="text-grayText text-sm">
                        <p>
                          • Drag and drop or use arrow buttons to reorder images
                        </p>
                        <p>• First image will be used as secondary thumbnail</p>
                        <p>• Maximum file size: 5MB per image</p>
                      </div>
                    </div>
                  )}

                  {errors.images && (
                    <p className="text-red-400 text-sm mt-1">{errors.images}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-800">
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="px-6 py-3 text-grayText hover:text-whiteText hover:bg-gray-800 rounded-lg transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center space-x-2"
              >
                {isLoading && (
                  <svg
                    className="animate-spin w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                )}
                <span>{editData ? "Update Project" : "Create Project"}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProjectModal;
