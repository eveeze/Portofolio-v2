import React from "react";

interface ArticleCardProps {
  article: {
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
    category?: { _id: string; name: string; color?: string };
    tags?: Array<{ _id: string; name: string; color?: string }>;
    series?: { _id: string; name: string; position: number };
    techStack?: Array<{ _id: string; name: string; imageUrl?: string }>;
    _creationTime: number;
  };
  viewMode: "grid" | "list";
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

const ArticleCard: React.FC<ArticleCardProps> = ({
  article,
  viewMode,
  onEdit,
  onDelete,
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "published":
        return "bg-green-500";
      case "draft":
        return "bg-yellow-500";
      case "archived":
        return "bg-gray-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "published":
        return "Published";
      case "draft":
        return article.scheduledAt ? "Scheduled" : "Draft";
      case "archived":
        return "Archived";
      default:
        return status;
    }
  };

  const formatDate = (timestamp?: number) => {
    if (!timestamp) return "No date";
    return new Date(timestamp).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0
      ? `${hours}h ${remainingMinutes}m`
      : `${hours}h`;
  };

  if (viewMode === "list") {
    return (
      <div className="bg-background border border-gray-800 rounded-xl p-6 hover:border-blue-500 transition-all duration-200">
        <div className="flex items-start gap-6">
          {/* Featured Image */}
          <div className="flex-shrink-0">
            {article.featuredImage ? (
              <img
                src={article.featuredImage}
                alt={article.title}
                className="w-24 h-24 object-cover rounded-lg"
              />
            ) : (
              <div className="w-24 h-24 bg-gray-800 rounded-lg flex items-center justify-center">
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
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center space-x-3">
                <h3 className="text-xl font-semibold text-whiteText truncate">
                  {article.title}
                </h3>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium text-white ${getStatusColor(article.status)}`}
                >
                  {getStatusText(article.status)}
                </span>
                {article.series && (
                  <span className="px-2 py-1 bg-purple-600 text-white rounded-full text-xs font-medium">
                    Series #{article.series.position}
                  </span>
                )}
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => onEdit(article._id)}
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
                  onClick={() => onDelete(article._id)}
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

            <p className="text-grayText mb-3 line-clamp-2">{article.excerpt}</p>

            <div className="flex flex-wrap items-center gap-4 text-sm text-grayText mb-3">
              {article.category && (
                <span
                  className="px-2 py-1 rounded-full text-xs font-medium"
                  style={{
                    backgroundColor: article.category.color
                      ? `${article.category.color}20`
                      : "#374151",
                    color: article.category.color || "#9CA3AF",
                  }}
                >
                  {article.category.name}
                </span>
              )}
              <span className="flex items-center space-x-1">
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
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
                <span>{article.viewCount}</span>
              </span>
              <span className="flex items-center space-x-1">
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
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span>{formatTime(article.readingTime)} read</span>
              </span>
              <span>
                {article.status === "published" && article.publishedAt
                  ? formatDate(article.publishedAt)
                  : article.scheduledAt
                    ? `Scheduled: ${formatDate(article.scheduledAt)}`
                    : formatDate(article._creationTime)}
              </span>
            </div>

            {/* Tags */}
            {article.tags && article.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {article.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag._id}
                    className="px-2 py-1 rounded-full text-xs font-medium"
                    style={{
                      backgroundColor: tag.color ? `${tag.color}20` : "#1F2937",
                      color: tag.color || "#6B7280",
                    }}
                  >
                    #{tag.name}
                  </span>
                ))}
                {article.tags.length > 3 && (
                  <span className="px-2 py-1 bg-gray-800 text-grayText rounded-full text-xs font-medium">
                    +{article.tags.length - 3} more
                  </span>
                )}
              </div>
            )}

            {/* Tech Stack */}
            {article.techStack && article.techStack.length > 0 && (
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs text-grayText">Tech:</span>
                {article.techStack.slice(0, 4).map((tech) => (
                  <div key={tech._id} className="flex items-center space-x-1">
                    {tech.imageUrl ? (
                      <img
                        src={tech.imageUrl}
                        alt={tech.name}
                        className="w-4 h-4 rounded"
                      />
                    ) : (
                      <div className="w-4 h-4 bg-gray-700 rounded"></div>
                    )}
                    <span className="text-xs text-grayText">{tech.name}</span>
                  </div>
                ))}
                {article.techStack.length > 4 && (
                  <span className="text-xs text-grayText">
                    +{article.techStack.length - 4} more
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Grid view
  return (
    <div className="bg-background border border-gray-800 rounded-xl overflow-hidden hover:border-blue-500 transition-all duration-200 transform hover:scale-105">
      {/* Featured Image */}
      <div className="aspect-video relative">
        {article.featuredImage ? (
          <img
            src={article.featuredImage}
            alt={article.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gray-800 flex items-center justify-center">
            <svg
              className="w-12 h-12 text-grayText"
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

        {/* Status Badge */}
        <div className="absolute top-3 left-3">
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium text-white ${getStatusColor(article.status)}`}
          >
            {getStatusText(article.status)}
          </span>
        </div>

        {/* Series Badge */}
        {article.series && (
          <div className="absolute top-3 right-3">
            <span className="px-2 py-1 bg-purple-600 text-white rounded-full text-xs font-medium">
              Series #{article.series.position}
            </span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="absolute bottom-3 right-3 flex space-x-2">
          <button
            onClick={() => onEdit(article._id)}
            className="p-2 bg-black/50 backdrop-blur-sm text-white hover:bg-blue-600 rounded-lg transition-all duration-200"
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
            onClick={() => onDelete(article._id)}
            className="p-2 bg-black/50 backdrop-blur-sm text-white hover:bg-red-600 rounded-lg transition-all duration-200"
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

      {/* Content */}
      <div className="p-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-whiteText line-clamp-2 flex-1">
            {article.title}
          </h3>
        </div>

        <p className="text-grayText text-sm mb-4 line-clamp-3">
          {article.excerpt}
        </p>

        {/* Category */}
        {article.category && (
          <div className="mb-3">
            <span
              className="px-2 py-1 rounded-full text-xs font-medium"
              style={{
                backgroundColor: article.category.color
                  ? `${article.category.color}20`
                  : "#374151",
                color: article.category.color || "#9CA3AF",
              }}
            >
              {article.category.name}
            </span>
          </div>
        )}

        {/* Tags */}
        {article.tags && article.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {article.tags.slice(0, 2).map((tag) => (
              <span
                key={tag._id}
                className="px-2 py-1 rounded-full text-xs font-medium"
                style={{
                  backgroundColor: tag.color ? `${tag.color}20` : "#1F2937",
                  color: tag.color || "#6B7280",
                }}
              >
                #{tag.name}
              </span>
            ))}
            {article.tags.length > 2 && (
              <span className="px-2 py-1 bg-gray-800 text-grayText rounded-full text-xs font-medium">
                +{article.tags.length - 2}
              </span>
            )}
          </div>
        )}

        {/* Tech Stack */}
        {article.techStack && article.techStack.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 mb-4">
            {article.techStack.slice(0, 3).map((tech) => (
              <div key={tech._id} className="flex items-center space-x-1">
                {tech.imageUrl ? (
                  <img
                    src={tech.imageUrl}
                    alt={tech.name}
                    className="w-4 h-4 rounded"
                  />
                ) : (
                  <div className="w-4 h-4 bg-gray-700 rounded"></div>
                )}
                <span className="text-xs text-grayText">{tech.name}</span>
              </div>
            ))}
            {article.techStack.length > 3 && (
              <span className="text-xs text-grayText">
                +{article.techStack.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Meta Info */}
        <div className="flex items-center justify-between text-xs text-grayText">
          <div className="flex items-center space-x-4">
            <span className="flex items-center space-x-1">
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
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
              <span>{article.viewCount}</span>
            </span>
            <span className="flex items-center space-x-1">
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
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>{formatTime(article.readingTime)}</span>
            </span>
          </div>
          <span>
            {article.status === "published" && article.publishedAt
              ? formatDate(article.publishedAt)
              : article.scheduledAt
                ? `Scheduled: ${formatDate(article.scheduledAt)}`
                : formatDate(article._creationTime)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ArticleCard;
