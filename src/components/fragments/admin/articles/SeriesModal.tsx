import React, { useState, useEffect } from "react";
import { useAuth } from "../../../../contexts/AuthContext";

interface Series {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  status: "active" | "completed";
  articleCount?: number; // Changed from articlesCount to articleCount to match the backend response
  _creationTime: number;
}

interface SeriesModalProps {
  isOpen: boolean;
  onClose: () => void;
  series: Series[];
  onSeriesUpdated?: () => void;
}

interface SeriesFormData {
  name: string;
  description: string;
  status: "active" | "completed";
}

const SeriesModal: React.FC<SeriesModalProps> = ({
  isOpen,
  onClose,
  series,
  onSeriesUpdated,
}) => {
  const { token } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [editingSeries, setEditingSeries] = useState<Series | null>(null);
  const [formData, setFormData] = useState<SeriesFormData>({
    name: "",
    description: "",
    status: "active",
  });
  const [searchTerm, setSearchTerm] = useState("");

  const CONVEX_HTTP_URL = import.meta.env.VITE_CONVEX_HTTP_URL;

  const getApiBaseUrl = () => {
    if (!CONVEX_HTTP_URL) {
      throw new Error("VITE_CONVEX_HTTP_URL is not configured.");
    }
    return CONVEX_HTTP_URL;
  };

  // Helper function to generate URL-friendly slug
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  const statusOptions = [
    {
      value: "active",
      label: "Active",
      color: "#10B981",
      description: "Series is actively being written",
    },
    {
      value: "completed",
      label: "Completed",
      color: "#6366F1",
      description: "All articles in the series are published",
    },
  ];

  const filteredSeries = series.filter(
    (seriesItem) =>
      seriesItem.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (seriesItem.description &&
        seriesItem.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  useEffect(() => {
    if (!isOpen) {
      setEditingSeries(null);
      setFormData({ name: "", description: "", status: "active" });
      setSearchTerm("");
    }
  }, [isOpen]);

  const handleEdit = (seriesItem: Series) => {
    setEditingSeries(seriesItem);
    setFormData({
      name: seriesItem.name,
      description: seriesItem.description || "",
      status: seriesItem.status,
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !formData.name.trim()) return;

    setIsLoading(true);
    try {
      const apiBaseUrl = getApiBaseUrl();
      const slug = generateSlug(formData.name.trim());

      const payload = {
        name: formData.name.trim(),
        slug: slug,
        description: formData.description.trim() || undefined,
        status: formData.status,
      };

      let response;
      if (editingSeries) {
        response = await fetch(
          `${apiBaseUrl}/articles/series/${editingSeries._id}`,
          {
            method: "PATCH",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
          }
        );
      } else {
        response = await fetch(`${apiBaseUrl}/articles/series`, {
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

      setFormData({ name: "", description: "", status: "active" });
      setEditingSeries(null);

      if (onSeriesUpdated) {
        onSeriesUpdated();
      }

      alert(
        editingSeries
          ? "Series updated successfully!"
          : "Series created successfully!"
      );
    } catch (error: any) {
      console.error("Save error:", error);
      alert(`Failed to save series: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (seriesId: string) => {
    if (
      !token ||
      !confirm(
        "Are you sure you want to delete this series? Articles in this series will be unassigned."
      )
    )
      return;

    setIsLoading(true);
    try {
      const apiBaseUrl = getApiBaseUrl();
      const response = await fetch(
        `${apiBaseUrl}/articles/series/${seriesId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ error: "Unknown error" }));
        throw new Error(
          errorData.error || `Failed to delete: ${response.status}`
        );
      }

      if (onSeriesUpdated) {
        onSeriesUpdated();
      }

      alert("Series deleted successfully!");
    } catch (error: any) {
      console.error("Delete error:", error);
      alert(`Failed to delete series: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusConfig = (status: string) => {
    return (
      statusOptions.find((option) => option.value === status) ||
      statusOptions[0]
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-background border border-gray-800 rounded-xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800 flex-shrink-0">
          <div>
            <h2 className="text-2xl font-bold text-whiteText">Manage Series</h2>
            <p className="text-grayText mt-1">
              Create and organize article series
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-grayText hover:text-whiteText hover:bg-gray-800 rounded-lg transition-all duration-200"
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

        {/* Content with proper scrolling */}
        <div className="flex flex-1 overflow-hidden">
          {/* Form Section */}
          <div className="w-1/2 border-r border-gray-800 flex flex-col">
            <div className="flex-1 overflow-y-auto p-6">
              <form onSubmit={handleSave} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-whiteText mb-2">
                    Series Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-background2 border border-gray-700 rounded-lg text-whiteText focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter series name"
                    required
                  />
                  {formData.name && (
                    <p className="text-xs text-grayText mt-1">
                      Slug: {generateSlug(formData.name)}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-whiteText mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-background2 border border-gray-700 rounded-lg text-whiteText focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    placeholder="Describe what this series covers"
                    rows={4}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-whiteText mb-2">
                    Status
                  </label>
                  <div className="space-y-3">
                    {statusOptions.map((option) => (
                      <label
                        key={option.value}
                        className="flex items-start space-x-3 cursor-pointer group"
                      >
                        <input
                          type="radio"
                          name="status"
                          value={option.value}
                          checked={formData.status === option.value}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              status: e.target.value as "active" | "completed",
                            })
                          }
                          className="w-4 h-4 text-blue-600 bg-background2 border-gray-600 focus:ring-blue-500 focus:ring-2 mt-0.5"
                        />
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: option.color }}
                            />
                            <span className="text-whiteText font-medium">
                              {option.label}
                            </span>
                          </div>
                          <p className="text-sm text-grayText group-hover:text-gray-300 transition-colors">
                            {option.description}
                          </p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Preview */}
                {formData.name && (
                  <div className="p-4 bg-background2 rounded-lg border border-gray-700">
                    <h3 className="text-whiteText text-sm font-medium mb-3">
                      Preview:
                    </h3>
                    <div className="flex items-center space-x-2 mb-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{
                          backgroundColor: getStatusConfig(formData.status)
                            .color,
                        }}
                      />
                      <span className="text-whiteText font-medium">
                        {formData.name}
                      </span>
                      <span
                        className="px-2 py-1 rounded-full text-xs font-medium"
                        style={{
                          backgroundColor: `${getStatusConfig(formData.status).color}20`,
                          color: getStatusConfig(formData.status).color,
                        }}
                      >
                        {getStatusConfig(formData.status).label}
                      </span>
                    </div>
                    {formData.description && (
                      <p className="text-grayText text-sm">
                        {formData.description}
                      </p>
                    )}
                  </div>
                )}
              </form>
            </div>

            {/* Sticky Form Actions */}
            <div className="p-6 border-t border-gray-700 bg-background flex-shrink-0">
              <div className="flex space-x-4">
                <button
                  type="submit"
                  disabled={isLoading || !formData.name.trim()}
                  onClick={handleSave}
                  className="flex-1 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-medium transition-all duration-200"
                >
                  {isLoading
                    ? "Saving..."
                    : editingSeries
                      ? "Update Series"
                      : "Create Series"}
                </button>
                {editingSeries && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingSeries(null);
                      setFormData({
                        name: "",
                        description: "",
                        status: "active",
                      });
                    }}
                    disabled={isLoading}
                    className="px-6 py-3 text-grayText hover:text-whiteText hover:bg-gray-800 disabled:opacity-50 rounded-lg font-medium transition-all duration-200"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* List Section */}
          <div className="w-1/2 flex flex-col">
            {/* Search Header */}
            <div className="p-6 border-b border-gray-800 flex-shrink-0">
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
                  placeholder="Search series..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-background2 border border-gray-700 rounded-lg text-whiteText focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Scrollable List */}
            <div className="flex-1 overflow-y-auto p-6">
              {filteredSeries.length === 0 ? (
                <div className="text-center py-8">
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
                  <p className="text-grayText">
                    {searchTerm
                      ? "No series found matching your search"
                      : "No series created yet"}
                  </p>
                  {!searchTerm && (
                    <p className="text-grayText text-sm mt-2">
                      Create your first series to organize related articles
                    </p>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredSeries.map((seriesItem) => {
                    const statusConfig = getStatusConfig(seriesItem.status);
                    // Use articleCount (from backend) and provide fallback to 0
                    const articleCount = seriesItem.articleCount ?? 0;

                    return (
                      <div
                        key={seriesItem._id}
                        className="flex items-start justify-between p-4 bg-background2 rounded-lg border border-gray-700 hover:border-gray-600 transition-all duration-200"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-2">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: statusConfig.color }}
                            />
                            <h3 className="text-whiteText font-medium truncate">
                              {seriesItem.name}
                            </h3>
                            <span
                              className="px-2 py-1 rounded-full text-xs font-medium flex-shrink-0"
                              style={{
                                backgroundColor: `${statusConfig.color}20`,
                                color: statusConfig.color,
                              }}
                            >
                              {statusConfig.label}
                            </span>
                          </div>

                          {seriesItem.description && (
                            <p className="text-grayText text-sm line-clamp-2 mb-2">
                              {seriesItem.description}
                            </p>
                          )}

                          <div className="flex items-center space-x-4 text-xs text-grayText">
                            <span className="flex items-center space-x-1">
                              <svg
                                className="w-3 h-3"
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
                              <span>
                                {articleCount}{" "}
                                {articleCount === 1 ? "article" : "articles"}
                              </span>
                            </span>
                            <span>
                              {new Date(
                                seriesItem._creationTime
                              ).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              })}
                            </span>
                          </div>
                        </div>

                        <div className="flex space-x-2 ml-4">
                          <button
                            onClick={() => handleEdit(seriesItem)}
                            disabled={isLoading}
                            className="p-2 text-grayText hover:text-orange-400 hover:bg-orange-900/20 disabled:opacity-50 rounded-lg transition-all duration-200"
                            title="Edit"
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
                            onClick={() => handleDelete(seriesItem._id)}
                            disabled={isLoading}
                            className="p-2 text-grayText hover:text-red-400 hover:bg-red-900/20 disabled:opacity-50 rounded-lg transition-all duration-200"
                            title="Delete"
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
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeriesModal;
