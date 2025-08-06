//components/fragments/admin/projects/ProjectCard.tsx
import React, { useState } from "react";

interface Project {
  _id: string;
  title: string;
  description: string;
  projectType: "website" | "mobile" | "backend" | "desktop" | "other";
  thumbnailUrl: string;
  projectUrl?: string;
  githubUrl?: string;
  techStack: Array<{
    _id: string;
    name: string;
    category: string;
    imageUrl?: string;
  }>;
  images?: Array<{
    _id: string;
    imageUrl: string;
  }>;
}

interface ProjectCardProps {
  project: Project;
  viewMode: "grid" | "list";
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  viewMode,
  onEdit,
  onDelete,
}) => {
  const [imageError, setImageError] = useState(false);

  const getProjectTypeIcon = (type: string) => {
    const icons = {
      website: "🌐",
      mobile: "📱",
      backend: "⚙️",
      desktop: "💻",
      other: "📦",
    };
    return icons[type as keyof typeof icons] || "📦";
  };

  const getProjectTypeColor = (type: string) => {
    const colors = {
      website: "bg-blue-600/20 text-blue-400 border-blue-600/30",
      mobile: "bg-green-600/20 text-green-400 border-green-600/30",
      backend: "bg-purple-600/20 text-purple-400 border-purple-600/30",
      desktop: "bg-yellow-600/20 text-yellow-400 border-yellow-600/30",
      other: "bg-gray-600/20 text-gray-400 border-gray-600/30",
    };
    return colors[type as keyof typeof colors] || colors.other;
  };

  const formatProjectType = (type: string) => {
    const labels = {
      website: "Website",
      mobile: "Mobile App",
      backend: "Backend",
      desktop: "Desktop App",
      other: "Other",
    };
    return labels[type as keyof typeof labels] || "Other";
  };

  const handleImageError = () => {
    setImageError(true);
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  if (viewMode === "list") {
    return (
      <div className="bg-background border border-gray-800 rounded-xl p-6 hover:border-gray-700 transition-all duration-200">
        <div className="flex items-start space-x-6">
          {/* Thumbnail */}
          <div className="w-24 h-24 bg-gray-800 rounded-xl overflow-hidden flex-shrink-0">
            {!imageError ? (
              <img
                src={project.thumbnailUrl}
                alt={project.title}
                className="w-full h-full object-cover"
                onError={handleImageError}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-grayText">
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
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <h3 className="text-whiteText font-semibold text-lg mb-1 truncate">
                  {project.title}
                </h3>
                <p className="text-grayText text-sm mb-3">
                  {truncateText(project.description, 120)}
                </p>
              </div>

              {/* Project Type Badge */}
              <span
                className={`ml-4 px-3 py-1 rounded-full text-xs font-medium border ${getProjectTypeColor(
                  project.projectType
                )} flex-shrink-0`}
              >
                {getProjectTypeIcon(project.projectType)}{" "}
                {formatProjectType(project.projectType)}
              </span>
            </div>

            {/* Tech Stack */}
            <div className="flex flex-wrap gap-2 mb-4">
              {project.techStack.slice(0, 6).map((tech) => (
                <div
                  key={tech._id}
                  className="flex items-center space-x-1 bg-gray-800 px-2 py-1 rounded-md"
                >
                  {tech.imageUrl && (
                    <img
                      src={tech.imageUrl}
                      alt={tech.name}
                      className="w-4 h-4 rounded object-cover"
                    />
                  )}
                  <span className="text-grayText text-xs">{tech.name}</span>
                </div>
              ))}
              {project.techStack.length > 6 && (
                <div className="bg-gray-800 px-2 py-1 rounded-md">
                  <span className="text-grayText text-xs">
                    +{project.techStack.length - 6} more
                  </span>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between">
              <div className="flex space-x-4">
                {project.projectUrl && (
                  <a
                    href={project.projectUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 text-sm flex items-center space-x-1"
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
                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                      />
                    </svg>
                    <span>Live Demo</span>
                  </a>
                )}
                {project.githubUrl && (
                  <a
                    href={project.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-grayText hover:text-whiteText text-sm flex items-center space-x-1"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                    </svg>
                    <span>GitHub</span>
                  </a>
                )}
                {project.images && project.images.length > 0 && (
                  <div className="text-grayText text-sm flex items-center space-x-1">
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
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <span>{project.images.length} images</span>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex space-x-2">
                <button
                  onClick={() => onEdit(project._id)}
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
                  onClick={() => onDelete(project._id)}
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
        </div>
      </div>
    );
  }

  // Grid View
  return (
    <div className="bg-background border border-gray-800 rounded-xl overflow-hidden hover:border-gray-700 hover:shadow-lg transition-all duration-300 group">
      {/* Thumbnail */}
      <div className="relative aspect-video bg-gray-800 overflow-hidden">
        {!imageError ? (
          <img
            src={project.thumbnailUrl}
            alt={project.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            onError={handleImageError}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-grayText">
            <svg
              className="w-12 h-12"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
        )}

        {/* Overlay with Actions */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center space-x-3">
          <button
            onClick={() => onEdit(project._id)}
            className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full transform hover:scale-110 transition-all duration-200"
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
            onClick={() => onDelete(project._id)}
            className="bg-red-600 hover:bg-red-700 text-white p-3 rounded-full transform hover:scale-110 transition-all duration-200"
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

        {/* Project Type Badge */}
        <div className="absolute top-3 right-3">
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium border ${getProjectTypeColor(
              project.projectType
            )}`}
          >
            {getProjectTypeIcon(project.projectType)}{" "}
            {formatProjectType(project.projectType)}
          </span>
        </div>

        {/* Images Count Badge */}
        {project.images && project.images.length > 0 && (
          <div className="absolute top-3 left-3">
            <span className="bg-black/60 text-white px-2 py-1 rounded-full text-xs flex items-center space-x-1">
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
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <span>{project.images.length}</span>
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6">
        <h3 className="text-whiteText font-semibold text-lg mb-2 line-clamp-2">
          {project.title}
        </h3>
        <p className="text-grayText text-sm mb-4 line-clamp-3">
          {project.description}
        </p>

        {/* Tech Stack */}
        <div className="flex flex-wrap gap-2 mb-4">
          {project.techStack.slice(0, 4).map((tech) => (
            <div
              key={tech._id}
              className="flex items-center space-x-1 bg-gray-800 px-2 py-1 rounded-md"
              title={tech.name}
            >
              {tech.imageUrl && (
                <img
                  src={tech.imageUrl}
                  alt={tech.name}
                  className="w-4 h-4 rounded object-cover"
                />
              )}
              <span className="text-grayText text-xs">{tech.name}</span>
            </div>
          ))}
          {project.techStack.length > 4 && (
            <div className="bg-gray-800 px-2 py-1 rounded-md">
              <span className="text-grayText text-xs">
                +{project.techStack.length - 4}
              </span>
            </div>
          )}
        </div>

        {/* Footer Links */}
        <div className="flex items-center space-x-4 text-sm">
          {project.projectUrl && (
            <a
              href={project.projectUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 flex items-center space-x-1 transition-colors duration-200"
              onClick={(e) => e.stopPropagation()}
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
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
              <span>Live</span>
            </a>
          )}
          {project.githubUrl && (
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-grayText hover:text-whiteText flex items-center space-x-1 transition-colors duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
              <span>Code</span>
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;
