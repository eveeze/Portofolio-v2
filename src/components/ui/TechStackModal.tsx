// src/components/ui/TechStackModal.tsx
import React, { useState, useRef, useEffect } from "react";
import { gsap } from "gsap";

interface TechStackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: TechStackFormData) => Promise<void>;
  editData?: {
    id: string;
    name: string;
    category: string;
    imageUrl: string;
  } | null;
}

interface TechStackFormData {
  name: string;
  category: string;
  image: File | null;
}

// Fix: Create a separate interface for form errors
interface TechStackFormErrors {
  name?: string;
  category?: string;
  image?: string; // This should be string for error messages, not File
}

const TechStackModal: React.FC<TechStackModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editData,
}) => {
  const [formData, setFormData] = useState<TechStackFormData>({
    name: "",
    category: "Frontend",
    image: null,
  });
  const [imagePreview, setImagePreview] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  // Fix: Use the correct error type
  const [errors, setErrors] = useState<TechStackFormErrors>({});

  const overlayRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const categories = [
    "Frontend",
    "Backend",
    "Database",
    "DevOps",
    "Mobile",
    "Design",
  ];

  useEffect(() => {
    if (editData) {
      setFormData({
        name: editData.name,
        category: editData.category,
        image: null,
      });
      setImagePreview(editData.imageUrl);
    } else {
      setFormData({
        name: "",
        category: "Frontend",
        image: null,
      });
      setImagePreview("");
    }
    setErrors({});
  }, [editData, isOpen]);

  useEffect(() => {
    if (isOpen && overlayRef.current && modalRef.current) {
      // Entrance animation
      gsap.set(overlayRef.current, { opacity: 0 });
      gsap.set(modalRef.current, { scale: 0.8, opacity: 0, y: 50 });

      const tl = gsap.timeline();
      tl.to(overlayRef.current, {
        opacity: 1,
        duration: 0.3,
        ease: "power2.out",
      }).to(
        modalRef.current,
        {
          scale: 1,
          opacity: 1,
          y: 0,
          duration: 0.5,
          ease: "back.out(1.7)",
        },
        "-=0.2"
      );

      // Form elements animation
      if (formRef.current) {
        const elements = formRef.current.querySelectorAll(".form-element");
        gsap.fromTo(
          elements,
          { y: 20, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.4,
            stagger: 0.1,
            delay: 0.3,
            ease: "power2.out",
          }
        );
      }
    }
  }, [isOpen]);

  const handleClose = () => {
    if (overlayRef.current && modalRef.current) {
      const tl = gsap.timeline({
        onComplete: onClose,
      });
      tl.to(modalRef.current, {
        scale: 0.8,
        opacity: 0,
        y: 50,
        duration: 0.3,
        ease: "power2.in",
      }).to(
        overlayRef.current,
        {
          opacity: 0,
          duration: 0.2,
          ease: "power2.in",
        },
        "-=0.1"
      );
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        setErrors((prev) => ({
          ...prev,
          image: "Please select a valid image file",
        }));
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors((prev) => ({
          ...prev,
          image: "Image size must be less than 5MB",
        }));
        return;
      }

      setFormData((prev) => ({ ...prev, image: file }));
      setErrors((prev) => ({ ...prev, image: undefined }));

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: TechStackFormErrors = {};

    // FIXED: Better name validation that properly handles spaces and multi-word names
    const trimmedName = formData.name.trim();

    if (!trimmedName) {
      newErrors.name = "Name is required";
    } else if (trimmedName.length < 1) {
      // Changed from 2 to 1 to be more permissive
      newErrors.name = "Name cannot be empty";
    } else if (trimmedName.length > 50) {
      newErrors.name = "Name must be less than 50 characters";
    } else if (/^\s+|\s+$/.test(formData.name)) {
      // Check for leading/trailing spaces but don't block internal spaces
      newErrors.name = "Name cannot start or end with spaces";
    } else if (/\s{2,}/.test(formData.name)) {
      // Check for multiple consecutive spaces
      newErrors.name = "Name cannot contain multiple consecutive spaces";
    }

    if (!formData.category) {
      newErrors.category = "Category is required";
    }

    if (!editData && !formData.image) {
      newErrors.image = "Image is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      // Shake animation for errors
      if (modalRef.current) {
        gsap.to(modalRef.current, {
          x: -10,
          duration: 0.1,
          yoyo: true,
          repeat: 5,
          ease: "power2.inOut",
        });
      }
      return;
    }

    setIsLoading(true);

    try {
      // FIXED: Clean the name properly while preserving internal spaces
      const cleanedFormData = {
        ...formData,
        name: formData.name.trim().replace(/\s+/g, " "), // Replace multiple spaces with single space
      };

      await onSave(cleanedFormData);
      handleClose();
    } catch (error) {
      console.error("Failed to save tech stack:", error);
      if (modalRef.current) {
        gsap.to(modalRef.current, {
          x: -10,
          duration: 0.1,
          yoyo: true,
          repeat: 5,
          ease: "power2.inOut",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={(e) => {
        if (e.target === overlayRef.current) handleClose();
      }}
    >
      <div
        ref={modalRef}
        className="bg-background border border-gray-800 rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <h2 className="text-2xl font-bold text-whiteText font-['Oggs']">
            {editData ? "Edit Tech Stack" : "Add Tech Stack"}
          </h2>
          <button
            onClick={handleClose}
            className="text-grayText hover:text-whiteText transition-colors p-2 hover:bg-gray-800 rounded-lg"
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

        {/* Form */}
        <form ref={formRef} onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Name Input */}
          <div className="form-element">
            <label
              htmlFor="name"
              className="block text-grayText text-sm font-medium mb-2"
            >
              Name *
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => {
                // Allow all characters including spaces
                const newValue = e.target.value;
                setFormData((prev) => ({ ...prev, name: newValue }));
                // Clear error when user starts typing
                if (errors.name) {
                  setErrors((prev) => ({ ...prev, name: undefined }));
                }
              }}
              onKeyDown={(e) => {
                // Ensure space key works properly
                if (e.key === " ") {
                  e.stopPropagation();
                }
              }}
              className={`w-full px-4 py-3 bg-background2 border rounded-lg text-whiteText focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                errors.name ? "border-red-500" : "border-gray-700"
              }`}
              placeholder="e.g., Tailwind CSS, React Native, Node.js, MongoDB Atlas"
              disabled={isLoading}
              maxLength={50}
              autoComplete="off"
              spellCheck="false"
            />
            {errors.name && (
              <p className="text-red-400 text-sm mt-1">{errors.name}</p>
            )}
            {/* Character counter with better visual feedback */}
            <p className="text-xs text-grayText mt-1">
              <span
                className={formData.name.length > 45 ? "text-yellow-400" : ""}
              >
                {formData.name.length}/50 characters
              </span>
            </p>
          </div>

          {/* Category Select */}
          <div className="form-element">
            <label
              htmlFor="category"
              className="block text-grayText text-sm font-medium mb-2"
            >
              Category *
            </label>
            <select
              id="category"
              value={formData.category}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, category: e.target.value }))
              }
              className={`w-full px-4 py-3 bg-background2 border rounded-lg text-whiteText focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                errors.category ? "border-red-500" : "border-gray-700"
              }`}
              disabled={isLoading}
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
            {errors.category && (
              <p className="text-red-400 text-sm mt-1">{errors.category}</p>
            )}
          </div>

          {/* Image Upload */}
          <div className="form-element">
            <label className="block text-grayText text-sm font-medium mb-2">
              Image {!editData && "*"}
            </label>

            {/* Image Preview */}
            {imagePreview && (
              <div className="mb-4">
                <div className="relative w-24 h-24 mx-auto bg-gray-800 rounded-lg overflow-hidden">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setImagePreview("");
                      setFormData((prev) => ({ ...prev, image: null }));
                      if (fileInputRef.current) {
                        fileInputRef.current.value = "";
                      }
                    }}
                    className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-700 transition-colors"
                  >
                    ×
                  </button>
                </div>
              </div>
            )}

            {/* File Input */}
            <div className="relative">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className={`w-full px-4 py-3 border-2 border-dashed rounded-lg text-center transition-all duration-200 ${
                  errors.image
                    ? "border-red-500 text-red-400"
                    : "border-gray-700 text-grayText hover:border-gray-600 hover:text-whiteText"
                }`}
                disabled={isLoading}
              >
                <div className="flex flex-col items-center space-y-2">
                  <svg
                    className="w-8 h-8"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                  <span className="text-sm">
                    {imagePreview ? "Change Image" : "Upload Image"}
                  </span>
                  <span className="text-xs opacity-60">
                    PNG, JPG, GIF up to 5MB
                  </span>
                </div>
              </button>
            </div>
            {errors.image && (
              <p className="text-red-400 text-sm mt-1">{errors.image}</p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="form-element flex space-x-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              disabled={isLoading}
              className="flex-1 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>{editData ? "Updating..." : "Adding..."}</span>
                </div>
              ) : editData ? (
                "Update"
              ) : (
                "Add"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TechStackModal;
