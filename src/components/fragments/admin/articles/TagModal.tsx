import React, { useState, useEffect } from "react";
import { useAuth } from "../../../../contexts/AuthContext";

interface Tag {
  _id: string;
  name: string;
  slug: string;
  color?: string;
  description?: string;
  _creationTime: number;
}

interface TagModalProps {
  isOpen: boolean;
  onClose: () => void;
  tags: Tag[];
}

interface TagFormData {
  name: string;
  description: string;
  color: string;
}

const TagModal: React.FC<TagModalProps> = ({ isOpen, onClose, tags }) => {
  const { token } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [formData, setFormData] = useState<TagFormData>({
    name: "",
    description: "",
    color: "#3B82F6",
  });
  const [searchTerm, setSearchTerm] = useState("");

  const CONVEX_HTTP_URL = import.meta.env.VITE_CONVEX_HTTP_URL;

  const getApiBaseUrl = () => {
    if (!CONVEX_HTTP_URL) {
      throw new Error("VITE_CONVEX_HTTP_URL is not configured.");
    }
    return CONVEX_HTTP_URL;
  };

  const colorOptions = [
    "#3B82F6",
    "#EF4444",
    "#10B981",
    "#F59E0B",
    "#8B5CF6",
    "#EC4899",
    "#14B8A6",
    "#F97316",
    "#6366F1",
    "#84CC16",
  ];

  const filteredTags = tags.filter(
    (tag) =>
      tag.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (tag.description &&
        tag.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  useEffect(() => {
    if (!isOpen) {
      setEditingTag(null);
      setFormData({ name: "", description: "", color: "#3B82F6" });
      setSearchTerm("");
    }
  }, [isOpen]);

  const handleEdit = (tag: Tag) => {
    setEditingTag(tag);
    setFormData({
      name: tag.name,
      description: tag.description || "",
      color: tag.color || "#3B82F6",
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !formData.name.trim()) return;

    setIsLoading(true);
    try {
      const apiBaseUrl = getApiBaseUrl();
      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        color: formData.color,
      };

      let response;
      if (editingTag) {
        response = await fetch(
          `${apiBaseUrl}/articles/tags/${editingTag._id}`,
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
        response = await fetch(`${apiBaseUrl}/articles/tags`, {
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

      setFormData({ name: "", description: "", color: "#3B82F6" });
      setEditingTag(null);
    } catch (error: any) {
      console.error("Save error:", error);
      alert(`Failed to save tag: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (tagId: string) => {
    if (!token || !confirm("Are you sure you want to delete this tag?")) return;

    setIsLoading(true);
    try {
      const apiBaseUrl = getApiBaseUrl();
      const response = await fetch(`${apiBaseUrl}/articles/tags/${tagId}`, {
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
    } catch (error: any) {
      console.error("Delete error:", error);
      alert(`Failed to delete tag: ${error.message}`);
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

        <div className="flex h-[600px]">
          {/* Form Section */}
          <div className="w-1/2 p-6 border-r border-gray-800">
            <form onSubmit={handleSave} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-whiteText mb-2">
                  Tag Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-background2 border border-gray-700 rounded-lg text-whiteText focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter tag name"
                  required
                />
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
                  className="w-full px-4 py-3 bg-background2 border border-gray-700 rounded-lg text-whiteText focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Optional description"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-whiteText mb-2">
                  Color
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {colorOptions.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setFormData({ ...formData, color })}
                      className={`w-12 h-12 rounded-lg border-2 transition-all duration-200 ${
                        formData.color === color
                          ? "border-white"
                          : "border-gray-600"
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
                <input
                  type="color"
                  value={formData.color}
                  onChange={(e) =>
                    setFormData({ ...formData, color: e.target.value })
                  }
                  className="w-full mt-2 h-12 rounded-lg border border-gray-700"
                />
              </div>

              <div className="flex space-x-4">
                <button
                  type="submit"
                  disabled={isLoading || !formData.name.trim()}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200"
                >
                  {isLoading
                    ? "Saving..."
                    : editingTag
                      ? "Update Tag"
                      : "Create Tag"}
                </button>
                {editingTag && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingTag(null);
                      setFormData({
                        name: "",
                        description: "",
                        color: "#3B82F6",
                      });
                    }}
                    className="px-6 py-3 text-grayText hover:text-whiteText hover:bg-gray-800 rounded-lg font-medium transition-all duration-200"
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
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {filteredTags.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-grayText">
                    {searchTerm
                      ? "No tags found matching your search"
                      : "No tags created yet"}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredTags.map((tag) => (
                    <div
                      key={tag._id}
                      className="flex items-center justify-between p-4 bg-background2 rounded-lg border border-gray-700 hover:border-gray-600 transition-all duration-200"
                    >
                      <div className="flex items-center space-x-3">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: tag.color || "#3B82F6" }}
                        />
                        <div>
                          <h3 className="text-whiteText font-medium">
                            {tag.name}
                          </h3>
                          {tag.description && (
                            <p className="text-grayText text-sm">
                              {tag.description}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(tag)}
                          className="p-2 text-grayText hover:text-blue-400 hover:bg-blue-900/20 rounded-lg transition-all duration-200"
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
                          onClick={() => handleDelete(tag._id)}
                          className="p-2 text-grayText hover:text-red-400 hover:bg-red-900/20 rounded-lg transition-all duration-200"
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
