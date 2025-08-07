import React, { useState, useEffect } from "react";
import { useAuth } from "../../../../contexts/AuthContext";

interface Tag {
  _id: string;
  name: string;
  slug: string;
  color?: string;
  _creationTime: number;
}

interface TagModalProps {
  isOpen: boolean;
  onClose: () => void;
  tags: Tag[];
}

interface TagFormData {
  name: string;
  color: string;
}

const TagModal: React.FC<TagModalProps> = ({ isOpen, onClose, tags }) => {
  const { token } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [formData, setFormData] = useState<TagFormData>({
    name: "",
    color: "#3B82F6",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState<string | null>(null);

  const CONVEX_HTTP_URL = import.meta.env.VITE_CONVEX_HTTP_URL;

  const getApiBaseUrl = () => {
    if (!CONVEX_HTTP_URL) {
      throw new Error("VITE_CONVEX_HTTP_URL is not configured.");
    }
    return CONVEX_HTTP_URL;
  };

  // Helper function to generate slug from name
  const generateSlug = (name: string): string => {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "") // Remove special characters
      .replace(/[\s_-]+/g, "-") // Replace spaces and underscores with hyphens
      .replace(/^-+|-+$/g, ""); // Remove leading/trailing hyphens
  };

  const colorOptions = [
    "#3B82F6", // Blue
    "#EF4444", // Red
    "#10B981", // Green
    "#F59E0B", // Yellow
    "#8B5CF6", // Purple
    "#EC4899", // Pink
    "#14B8A6", // Teal
    "#F97316", // Orange
    "#6366F1", // Indigo
    "#84CC16", // Lime
    "#06B6D4", // Cyan
    "#F43F5E", // Rose
  ];

  const filteredTags = tags.filter((tag) =>
    tag.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    if (!isOpen) {
      setEditingTag(null);
      setFormData({ name: "", color: "#3B82F6" });
      setSearchTerm("");
      setError(null);
    }
  }, [isOpen]);

  const handleEdit = (tag: Tag) => {
    setEditingTag(tag);
    setFormData({
      name: tag.name,
      color: tag.color || "#3B82F6",
    });
    setError(null);
  };

  const handleCancel = () => {
    setEditingTag(null);
    setFormData({
      name: "",
      color: "#3B82F6",
    });
    setError(null);
  };

  const validateForm = (): string | null => {
    if (!formData.name.trim()) {
      return "Tag name is required";
    }

    if (formData.name.trim().length < 2) {
      return "Tag name must be at least 2 characters long";
    }

    if (formData.name.trim().length > 50) {
      return "Tag name must be less than 50 characters";
    }

    // Check for duplicate names (excluding current editing tag)
    const existingTag = tags.find(
      (tag) =>
        tag.name.toLowerCase() === formData.name.trim().toLowerCase() &&
        (!editingTag || tag._id !== editingTag._id)
    );

    if (existingTag) {
      return "A tag with this name already exists";
    }

    return null;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    if (!token) {
      setError("Authentication required");
      return;
    }

    setIsLoading(true);
    try {
      const apiBaseUrl = getApiBaseUrl();
      const slug = generateSlug(formData.name);

      const payload = {
        name: formData.name.trim(),
        slug: slug,
        color: formData.color,
      };

      console.log("Sending payload:", payload); // Debug log

      let response;
      let url;

      if (editingTag) {
        url = `${apiBaseUrl}/articles/tags/${editingTag._id}`;
        response = await fetch(url, {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });
      } else {
        url = `${apiBaseUrl}/articles/tags`;
        response = await fetch(url, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });
      }

      console.log("Request URL:", url); // Debug log
      console.log("Response status:", response.status); // Debug log

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}`;
        try {
          const errorData = await response.json();
          console.error("Error response:", errorData); // Debug log
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch (parseError) {
          // If we can't parse the error response, get text instead
          try {
            const errorText = await response.text();
            console.error("Error text:", errorText); // Debug log
            errorMessage = errorText || errorMessage;
          } catch {
            // Use default error message
          }
        }
        throw new Error(errorMessage);
      }

      // Success - reset form
      setFormData({ name: "", color: "#3B82F6" });
      setEditingTag(null);
      setError(null);
    } catch (error: any) {
      console.error("Save error:", error);
      setError(error.message || "Failed to save tag");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (tagId: string) => {
    if (!token) {
      setError("Authentication required");
      return;
    }

    if (
      !confirm(
        "Are you sure you want to delete this tag? This action cannot be undone."
      )
    ) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const apiBaseUrl = getApiBaseUrl();
      const url = `${apiBaseUrl}/articles/tags/${tagId}`;

      console.log("Delete URL:", url); // Debug log

      const response = await fetch(url, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      console.log("Delete response status:", response.status); // Debug log

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}`;
        try {
          const errorData = await response.json();
          console.error("Delete error response:", errorData); // Debug log
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch (parseError) {
          try {
            const errorText = await response.text();
            console.error("Delete error text:", errorText); // Debug log
            errorMessage = errorText || errorMessage;
          } catch {
            // Use default error message
          }
        }
        throw new Error(errorMessage);
      }

      // Success - clear edit state if deleted tag was being edited
      if (editingTag && editingTag._id === tagId) {
        handleCancel();
      }
    } catch (error: any) {
      console.error("Delete error:", error);
      setError(error.message || "Failed to delete tag");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-background border border-gray-800 rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <div>
            <h2 className="text-2xl font-bold text-whiteText">Manage Tags</h2>
            <p className="text-grayText mt-1">Create and manage article tags</p>
          </div>
          <button
            onClick={onClose}
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

        <div className="flex h-[600px]">
          {/* Form Section */}
          <div className="w-1/2 p-6 border-r border-gray-800">
            {/* Error Display */}
            {error && (
              <div className="mb-4 p-4 bg-red-900/20 border border-red-500/50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <svg
                    className="w-5 h-5 text-red-400 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span className="text-red-200 text-sm">{error}</span>
                </div>
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-whiteText mb-2">
                  Tag Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => {
                    setFormData({ ...formData, name: e.target.value });
                    setError(null); // Clear error when user types
                  }}
                  className="w-full px-4 py-3 bg-background2 border border-gray-700 rounded-lg text-whiteText focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter tag name"
                  required
                  maxLength={50}
                  disabled={isLoading}
                />
                <p className="text-xs text-grayText mt-1">
                  Slug will be:{" "}
                  {formData.name
                    ? generateSlug(formData.name)
                    : "auto-generated"}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-whiteText mb-2">
                  Color
                </label>
                <div className="grid grid-cols-6 gap-2 mb-3">
                  {colorOptions.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setFormData({ ...formData, color })}
                      disabled={isLoading}
                      className={`w-10 h-10 rounded-lg border-2 transition-all duration-200 hover:scale-110 disabled:hover:scale-100 disabled:opacity-50 ${
                        formData.color === color
                          ? "border-white shadow-lg"
                          : "border-gray-600 hover:border-gray-400"
                      }`}
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
                <input
                  type="color"
                  value={formData.color}
                  onChange={(e) =>
                    setFormData({ ...formData, color: e.target.value })
                  }
                  className="w-full h-12 rounded-lg border border-gray-700 bg-background2"
                  disabled={isLoading}
                />
              </div>

              <div className="flex space-x-4">
                <button
                  type="submit"
                  disabled={isLoading || !formData.name.trim()}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-medium transition-all duration-200"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <svg
                        className="animate-spin h-4 w-4"
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
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="m12 2 8.09 8.09L12 22l-8.09-11.91L12 2z"
                        />
                      </svg>
                      <span>Saving...</span>
                    </div>
                  ) : editingTag ? (
                    "Update Tag"
                  ) : (
                    "Create Tag"
                  )}
                </button>
                {editingTag && (
                  <button
                    type="button"
                    onClick={handleCancel}
                    disabled={isLoading}
                    className="px-6 py-3 text-grayText hover:text-whiteText hover:bg-gray-800 disabled:opacity-50 rounded-lg font-medium transition-all duration-200"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* List Section */}
          <div className="w-1/2 flex flex-col">
            <div className="p-6 border-b border-gray-800">
              <div className="relative">
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
                  placeholder="Search tags..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-background2 border border-gray-700 rounded-lg text-whiteText focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {filteredTags.length === 0 ? (
                <div className="text-center py-8 px-6">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-800 rounded-full mb-4">
                    <svg
                      className="w-6 h-6 text-grayText"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 7h.01M7 3h5c1.1045695 0 2 .8954305 2 2v1.1945695c0 .5522847.4477153 1 1 1h3c1.1045695 0 2 .8954305 2 2V12c0 1.1045695-.8954305 2-2 2h-3c-.5522847 0-1 .4477153-1 1v5c0 1.1045695-.8954305 2-2 2H7c-1.1045695 0-2-.8954305-2-2v-5c0-.5522847-.4477153-1-1-1H1c-1.1045695 0-2-.8954305-2-2V9c0-1.1045695.8954305-2 2-2h3c.5522847 0 1-.4477153 1-1V5c0-1.1045695.8954305-2 2-2z"
                      />
                    </svg>
                  </div>
                  <p className="text-grayText">
                    {searchTerm
                      ? "No tags found matching your search"
                      : "No tags created yet"}
                  </p>
                  {!searchTerm && (
                    <p className="text-sm text-grayText mt-1">
                      Create your first tag using the form on the left
                    </p>
                  )}
                </div>
              ) : (
                <div className="p-6 space-y-3">
                  {filteredTags.map((tag) => (
                    <div
                      key={tag._id}
                      className={`flex items-center justify-between p-4 bg-background2 rounded-lg border transition-all duration-200 ${
                        editingTag && editingTag._id === tag._id
                          ? "border-blue-500 bg-blue-900/10"
                          : "border-gray-700 hover:border-gray-600"
                      }`}
                    >
                      <div className="flex items-center space-x-3 flex-1 min-w-0">
                        <div
                          className="w-4 h-4 rounded-full flex-shrink-0"
                          style={{ backgroundColor: tag.color || "#3B82F6" }}
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center space-x-2">
                            <h3 className="text-whiteText font-medium truncate">
                              {tag.name}
                            </h3>
                            {editingTag && editingTag._id === tag._id && (
                              <span className="text-xs bg-blue-500 text-white px-2 py-1 rounded-full">
                                Editing
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-grayText truncate">
                            /{tag.slug}
                          </p>
                        </div>
                      </div>
                      <div className="flex space-x-2 flex-shrink-0">
                        <button
                          onClick={() => handleEdit(tag)}
                          disabled={isLoading}
                          className="p-2 text-grayText hover:text-blue-400 hover:bg-blue-900/20 rounded-lg transition-all duration-200 disabled:opacity-50"
                          title="Edit tag"
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
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                            />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDelete(tag._id)}
                          disabled={isLoading}
                          className="p-2 text-grayText hover:text-red-400 hover:bg-red-900/20 rounded-lg transition-all duration-200 disabled:opacity-50"
                          title="Delete tag"
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
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TagModal;
