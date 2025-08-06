// convex/schema.ts - Updated version
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    username: v.string(),
    isRegistrationComplete: v.boolean(),
    currentChallenge: v.optional(v.string()),
    webauthnUserID: v.optional(v.string()),
  })
    .index("by_username", ["username"])
    .index("by_challenge", ["currentChallenge"]),

  authenticators: defineTable({
    userId: v.id("users"),
    webauthnUserID: v.string(),
    credentialID: v.string(),
    credentialPublicKey: v.string(),
    counter: v.number(),
    deviceType: v.string(),
    backedUp: v.boolean(),
    transports: v.optional(v.array(v.string())),
  })
    .index("by_userId", ["userId"])
    .index("by_credentialID", ["credentialID"]),

  techStacks: defineTable({
    name: v.string(),
    category: v.string(),
    storageId: v.id("_storage"),
    position: v.number(),
  })
    .index("by_category", ["category"])
    .index("by_position", ["position"]),

  projects: defineTable({
    title: v.string(),
    description: v.string(),
    techStack: v.array(v.id("techStacks")),
    projectUrl: v.optional(v.string()),
    projectType: v.union(
      v.literal("website"),
      v.literal("mobile"),
      v.literal("backend"),
      v.literal("desktop"),
      v.literal("other")
    ),
    githubUrl: v.optional(v.string()),
    thumbnailUrl: v.string(),
    thumbnailId: v.id("_storage"),
  })
    .searchIndex("by_title", {
      searchField: "title",
    })
    .index("by_projectType", ["projectType"]),

  // Updated project images table dengan position field
  projectImages: defineTable({
    projectId: v.id("projects"),
    imageUrl: v.string(),
    imageId: v.id("_storage"),
    position: v.number(), // Tambahkan field untuk urutan gambar
  })
    .index("by_projectId", ["projectId"])
    .index("by_position", ["projectId", "position"]), // Composite index untuk sorting

  // Kategori artikel untuk organisasi konten
  articleCategories: defineTable({
    name: v.string(),
    slug: v.string(), // URL-friendly version
    description: v.optional(v.string()),
    color: v.optional(v.string()), // Hex color untuk UI
    position: v.number(), // Untuk sorting kategori
  })
    .index("by_slug", ["slug"])
    .index("by_position", ["position"]),

  // Tag untuk labeling artikel
  articleTags: defineTable({
    name: v.string(),
    slug: v.string(),
    color: v.optional(v.string()),
  })
    .index("by_slug", ["slug"])
    .index("by_name", ["name"]),

  // Tabel utama artikel
  articles: defineTable({
    title: v.string(),
    slug: v.string(), // URL slug untuk SEO
    excerpt: v.string(), // Ringkasan artikel untuk preview
    content: v.string(), // Konten artikel (markdown/HTML)

    // Metadata
    categoryId: v.id("articleCategories"),
    tags: v.array(v.id("articleTags")),

    // SEO & Social
    metaDescription: v.optional(v.string()),
    featuredImage: v.optional(v.string()), // URL gambar utama
    featuredImageId: v.optional(v.id("_storage")),

    // Status & Timing
    status: v.union(
      v.literal("draft"),
      v.literal("published"),
      v.literal("archived")
    ),
    publishedAt: v.optional(v.number()), // Timestamp
    scheduledAt: v.optional(v.number()), // Untuk scheduled posts

    // Engagement metrics
    viewCount: v.number(),
    readingTime: v.number(), // Estimasi waktu baca dalam menit

    // Technical
    techStack: v.optional(v.array(v.id("techStacks"))), // Jika artikel terkait tech tertentu
  })
    .searchIndex("by_title_content", {
      searchField: "title",
    })
    .index("by_slug", ["slug"])
    .index("by_status", ["status"])
    .index("by_category", ["categoryId"])
    .index("by_published", ["status", "publishedAt"])
    .index("by_popularity", ["status", "viewCount"]),

  // Gambar tambahan untuk artikel
  articleImages: defineTable({
    articleId: v.id("articles"),
    imageUrl: v.string(),
    imageId: v.id("_storage"),
    caption: v.optional(v.string()),
    altText: v.optional(v.string()),
    position: v.number(),
  })
    .index("by_articleId", ["articleId"])
    .index("by_position", ["articleId", "position"]),

  // Series artikel (untuk tutorial multi-part)
  articleSeries: defineTable({
    name: v.string(),
    slug: v.string(),
    description: v.optional(v.string()),
    coverImage: v.optional(v.string()),
    coverImageId: v.optional(v.id("_storage")),
    status: v.union(v.literal("active"), v.literal("completed")),
  }).index("by_slug", ["slug"]),

  // Relasi artikel dengan series
  seriesArticles: defineTable({
    seriesId: v.id("articleSeries"),
    articleId: v.id("articles"),
    position: v.number(), // Urutan dalam series
  })
    .index("by_series", ["seriesId"])
    .index("by_position", ["seriesId", "position"])
    .index("by_article", ["articleId"]),

  // Simple analytics untuk tracking
  articleViews: defineTable({
    articleId: v.id("articles"),
    viewedAt: v.number(),
    userAgent: v.optional(v.string()),
    referrer: v.optional(v.string()),
  })
    .index("by_article", ["articleId"])
    .index("by_date", ["viewedAt"]),
});
