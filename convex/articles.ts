// convex/articles.ts - Complete Articles Implementation (FIXED)
import { v } from "convex/values";
import { internalMutation, mutation, query } from "./_generated/server";
import type { Id } from "./_generated/dataModel";

// ===== UPLOAD URL GENERATION =====
export const generateUploadUrl = internalMutation(async (ctx) => {
  return await ctx.storage.generateUploadUrl();
});

// ===== ARTICLE CATEGORIES =====

// Create article category
export const createArticleCategory = internalMutation({
  args: {
    name: v.string(),
    slug: v.string(),
    description: v.optional(v.string()),
    color: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Get next position
    const categories = await ctx.db.query("articleCategories").collect();
    const nextPosition = categories.length;

    return await ctx.db.insert("articleCategories", {
      ...args,
      position: nextPosition,
    });
  },
});

// Get all categories
export const getArticleCategories = query(async (ctx) => {
  return await ctx.db
    .query("articleCategories")
    .withIndex("by_position")
    .collect();
});

// Get category by slug
export const getCategoryBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("articleCategories")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();
  },
});

// Update category
export const updateArticleCategory = internalMutation({
  args: {
    categoryId: v.id("articleCategories"),
    name: v.string(),
    slug: v.string(),
    description: v.optional(v.string()),
    color: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { categoryId, ...updateData } = args;
    await ctx.db.patch(categoryId, updateData);
  },
});

// Delete category
export const deleteArticleCategory = internalMutation({
  args: { categoryId: v.id("articleCategories") },
  handler: async (ctx, args) => {
    // Check if category has articles
    const articlesWithCategory = await ctx.db
      .query("articles")
      .withIndex("by_category", (q) => q.eq("categoryId", args.categoryId))
      .collect();

    if (articlesWithCategory.length > 0) {
      throw new Error("Cannot delete category that has articles");
    }

    await ctx.db.delete(args.categoryId);
  },
});

// Reorder categories
export const reorderCategories = internalMutation({
  args: {
    categoryOrders: v.array(
      v.object({
        categoryId: v.id("articleCategories"),
        position: v.number(),
      })
    ),
  },
  handler: async (ctx, args) => {
    const updatePromises = args.categoryOrders.map(({ categoryId, position }) =>
      ctx.db.patch(categoryId, { position })
    );
    await Promise.all(updatePromises);
  },
});

// ===== ARTICLE TAGS =====

// Create tag
export const createArticleTag = internalMutation({
  args: {
    name: v.string(),
    slug: v.string(),
    color: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("articleTags", args);
  },
});

// Get all tags
export const getArticleTags = query(async (ctx) => {
  return await ctx.db.query("articleTags").order("asc").collect();
});

// Get tag by slug
export const getTagBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("articleTags")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();
  },
});

// Update tag
export const updateArticleTag = internalMutation({
  args: {
    tagId: v.id("articleTags"),
    name: v.string(),
    slug: v.string(),
    color: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { tagId, ...updateData } = args;
    await ctx.db.patch(tagId, updateData);
  },
});

// Delete tag
export const deleteArticleTag = internalMutation({
  args: { tagId: v.id("articleTags") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.tagId);
  },
});

// ===== ARTICLE SERIES =====

// Create series
export const createArticleSeries = internalMutation({
  args: {
    name: v.string(),
    slug: v.string(),
    description: v.optional(v.string()),
    coverImageStorageId: v.optional(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    let coverImage: string | undefined = undefined;
    if (args.coverImageStorageId) {
      const url = await ctx.storage.getUrl(args.coverImageStorageId);
      coverImage = url || undefined; // Fix: Handle null case
    }

    return await ctx.db.insert("articleSeries", {
      name: args.name,
      slug: args.slug,
      description: args.description,
      coverImage,
      coverImageId: args.coverImageStorageId,
      status: "active",
    });
  },
});

// Get all series
export const getArticleSeries = query(async (ctx) => {
  const series = await ctx.db.query("articleSeries").collect();

  // Get article counts for each series
  const seriesWithCounts = await Promise.all(
    series.map(async (s) => {
      const articleCount = await ctx.db
        .query("seriesArticles")
        .withIndex("by_series", (q) => q.eq("seriesId", s._id))
        .collect();

      return {
        ...s,
        articleCount: articleCount.length,
      };
    })
  );

  return seriesWithCounts;
});

// Get series by slug
export const getSeriesBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const series = await ctx.db
      .query("articleSeries")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();

    if (!series) return null;

    // Get articles in series
    const seriesArticles = await ctx.db
      .query("seriesArticles")
      .withIndex("by_series", (q) => q.eq("seriesId", series._id))
      .collect();

    // Sort by position and get article details
    const sortedArticles = seriesArticles.sort(
      (a, b) => a.position - b.position
    );
    const articlesWithDetails = await Promise.all(
      sortedArticles.map(async (sa) => {
        const article = await ctx.db.get(sa.articleId);
        return article ? { ...article, seriesPosition: sa.position } : null;
      })
    );

    return {
      ...series,
      articles: articlesWithDetails.filter(Boolean),
    };
  },
});

// Update series
export const updateArticleSeries = internalMutation({
  args: {
    seriesId: v.id("articleSeries"),
    name: v.string(),
    slug: v.string(),
    description: v.optional(v.string()),
    coverImageStorageId: v.optional(v.id("_storage")),
    status: v.union(v.literal("active"), v.literal("completed")),
  },
  handler: async (ctx, args) => {
    const { seriesId, coverImageStorageId, ...updateData } = args;
    const finalUpdateData: any = { ...updateData };

    if (coverImageStorageId) {
      // Delete old cover image if exists
      const existingSeries = await ctx.db.get(seriesId);
      if (existingSeries?.coverImageId) {
        await ctx.storage.delete(existingSeries.coverImageId as Id<"_storage">);
      }

      // Set new cover image
      const url = await ctx.storage.getUrl(coverImageStorageId);
      const coverImage = url || undefined; // Fix: Handle null case
      finalUpdateData.coverImage = coverImage;
      finalUpdateData.coverImageId = coverImageStorageId;
    }

    await ctx.db.patch(seriesId, finalUpdateData);
  },
});

// Delete series
export const deleteArticleSeries = internalMutation({
  args: { seriesId: v.id("articleSeries") },
  handler: async (ctx, args) => {
    const series = await ctx.db.get(args.seriesId);
    if (!series) return;

    // Delete cover image
    if (series.coverImageId) {
      await ctx.storage.delete(series.coverImageId as Id<"_storage">);
    }

    // Delete all series-article relations
    const seriesArticles = await ctx.db
      .query("seriesArticles")
      .withIndex("by_series", (q) => q.eq("seriesId", args.seriesId))
      .collect();

    await Promise.all(seriesArticles.map((sa) => ctx.db.delete(sa._id)));

    // Delete series
    await ctx.db.delete(args.seriesId);
  },
});

// ===== MAIN ARTICLES =====

// Create article
export const createArticle = internalMutation({
  args: {
    title: v.string(),
    slug: v.string(),
    excerpt: v.string(),
    content: v.string(),
    categoryId: v.id("articleCategories"),
    tags: v.array(v.id("articleTags")),
    metaDescription: v.optional(v.string()),
    featuredImageStorageId: v.optional(v.id("_storage")),
    status: v.union(
      v.literal("draft"),
      v.literal("published"),
      v.literal("archived")
    ),
    publishedAt: v.optional(v.number()),
    scheduledAt: v.optional(v.number()),
    readingTime: v.number(),
    techStack: v.optional(v.array(v.id("techStacks"))),
  },
  handler: async (ctx, args) => {
    let featuredImage: string | undefined = undefined;
    if (args.featuredImageStorageId) {
      const url = await ctx.storage.getUrl(args.featuredImageStorageId);
      featuredImage = url || undefined; // Fix: Handle null case
    }

    return await ctx.db.insert("articles", {
      title: args.title,
      slug: args.slug,
      excerpt: args.excerpt,
      content: args.content,
      categoryId: args.categoryId,
      tags: args.tags,
      metaDescription: args.metaDescription,
      featuredImage,
      featuredImageId: args.featuredImageStorageId,
      status: args.status,
      publishedAt: args.publishedAt,
      scheduledAt: args.scheduledAt,
      viewCount: 0,
      readingTime: args.readingTime,
      techStack: args.techStack,
    });
  },
});

// Get all articles with details
export const getArticles = query({
  args: {
    status: v.optional(
      v.union(v.literal("draft"), v.literal("published"), v.literal("archived"))
    ),
    limit: v.optional(v.number()),
    offset: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let articles;
    if (args.status) {
      articles = await ctx.db
        .query("articles")
        .withIndex("by_status", (q) => q.eq("status", args.status!))
        .collect();
    } else {
      articles = await ctx.db.query("articles").collect();
    }

    // Sort by publishedAt for published articles, by creation time for others
    articles = articles.sort((a, b) => {
      if (a.status === "published" && b.status === "published") {
        return (b.publishedAt || 0) - (a.publishedAt || 0);
      }
      return b._creationTime - a._creationTime;
    });

    // Apply pagination
    if (args.offset) {
      articles = articles.slice(args.offset);
    }
    if (args.limit) {
      articles = articles.slice(0, args.limit);
    }

    // Get full details for each article
    const articlesWithDetails = await Promise.all(
      articles.map(async (article) => {
        // Get category
        const category = await ctx.db.get(article.categoryId);

        // Get tags
        const tagDetails = await Promise.all(
          article.tags.map(async (tagId) => await ctx.db.get(tagId))
        );

        // Get tech stack if exists
        let techStackDetails = null;
        if (article.techStack) {
          techStackDetails = await Promise.all(
            article.techStack.map(async (techId) => {
              const tech = await ctx.db.get(techId);
              if (tech) {
                const imageUrl = tech.storageId
                  ? await ctx.storage.getUrl(tech.storageId)
                  : null;
                return { ...tech, imageUrl };
              }
              return null;
            })
          );
        }

        // Get series info if article is part of series
        const seriesArticle = await ctx.db
          .query("seriesArticles")
          .withIndex("by_article", (q) => q.eq("articleId", article._id))
          .first();

        let seriesInfo = null;
        if (seriesArticle) {
          const series = await ctx.db.get(seriesArticle.seriesId);
          if (series) {
            seriesInfo = {
              ...series,
              position: seriesArticle.position,
            };
          }
        }

        // Get images
        const images = await ctx.db
          .query("articleImages")
          .withIndex("by_articleId", (q) => q.eq("articleId", article._id))
          .collect();

        const sortedImages = images.sort((a, b) => a.position - b.position);

        return {
          ...article,
          category,
          tags: tagDetails.filter(Boolean),
          techStack: techStackDetails?.filter(Boolean) || [],
          series: seriesInfo,
          images: sortedImages,
        };
      })
    );

    return articlesWithDetails;
  },
});

// Get article by slug
export const getArticleBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const article = await ctx.db
      .query("articles")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();

    if (!article) return null;

    // Get category
    const category = await ctx.db.get(article.categoryId);

    // Get tags
    const tagDetails = await Promise.all(
      article.tags.map(async (tagId) => await ctx.db.get(tagId))
    );

    // Get tech stack if exists
    let techStackDetails = null;
    if (article.techStack) {
      techStackDetails = await Promise.all(
        article.techStack.map(async (techId) => {
          const tech = await ctx.db.get(techId);
          if (tech) {
            const imageUrl = tech.storageId
              ? await ctx.storage.getUrl(tech.storageId)
              : null;
            return { ...tech, imageUrl };
          }
          return null;
        })
      );
    }

    // Get series info
    const seriesArticle = await ctx.db
      .query("seriesArticles")
      .withIndex("by_article", (q) => q.eq("articleId", article._id))
      .first();

    let seriesInfo = null;
    if (seriesArticle) {
      const series = await ctx.db.get(seriesArticle.seriesId);
      if (series) {
        // Get other articles in series
        const seriesArticles = await ctx.db
          .query("seriesArticles")
          .withIndex("by_series", (q) => q.eq("seriesId", series._id))
          .collect();

        const otherArticles = await Promise.all(
          seriesArticles
            .filter((sa) => sa.articleId !== article._id)
            .sort((a, b) => a.position - b.position)
            .map(async (sa) => {
              const a = await ctx.db.get(sa.articleId);
              return a ? { ...a, seriesPosition: sa.position } : null;
            })
        );

        seriesInfo = {
          ...series,
          position: seriesArticle.position,
          otherArticles: otherArticles.filter(Boolean),
        };
      }
    }

    // Get images
    const images = await ctx.db
      .query("articleImages")
      .withIndex("by_articleId", (q) => q.eq("articleId", article._id))
      .collect();

    const sortedImages = images.sort((a, b) => a.position - b.position);

    return {
      ...article,
      category,
      tags: tagDetails.filter(Boolean),
      techStack: techStackDetails?.filter(Boolean) || [],
      series: seriesInfo,
      images: sortedImages,
    };
  },
});

// Update article
export const updateArticle = internalMutation({
  args: {
    articleId: v.id("articles"),
    title: v.string(),
    slug: v.string(),
    excerpt: v.string(),
    content: v.string(),
    categoryId: v.id("articleCategories"),
    tags: v.array(v.id("articleTags")),
    metaDescription: v.optional(v.string()),
    featuredImageStorageId: v.optional(v.id("_storage")),
    status: v.union(
      v.literal("draft"),
      v.literal("published"),
      v.literal("archived")
    ),
    publishedAt: v.optional(v.number()),
    scheduledAt: v.optional(v.number()),
    readingTime: v.number(),
    techStack: v.optional(v.array(v.id("techStacks"))),
  },
  handler: async (ctx, args) => {
    const { articleId, featuredImageStorageId, ...updateData } = args;
    const finalUpdateData: any = { ...updateData };

    // Handle featured image update
    if (featuredImageStorageId) {
      const existingArticle = await ctx.db.get(articleId);
      if (existingArticle?.featuredImageId) {
        await ctx.storage.delete(
          existingArticle.featuredImageId as Id<"_storage">
        );
      }

      const url = await ctx.storage.getUrl(featuredImageStorageId);
      const featuredImage = url || undefined; // Fix: Handle null case
      finalUpdateData.featuredImage = featuredImage;
      finalUpdateData.featuredImageId = featuredImageStorageId;
    }

    await ctx.db.patch(articleId, finalUpdateData);
  },
});

// Delete article
export const deleteArticle = internalMutation({
  args: { articleId: v.id("articles") },
  handler: async (ctx, args) => {
    const article = await ctx.db.get(args.articleId);
    if (!article) return;

    // Delete featured image
    if (article.featuredImageId) {
      await ctx.storage.delete(article.featuredImageId as Id<"_storage">);
    }

    // Delete article images
    const images = await ctx.db
      .query("articleImages")
      .withIndex("by_articleId", (q) => q.eq("articleId", args.articleId))
      .collect();

    await Promise.all([
      ...images.map((img) => ctx.storage.delete(img.imageId as Id<"_storage">)),
      ...images.map((img) => ctx.db.delete(img._id)),
    ]);

    // Remove from series
    const seriesArticles = await ctx.db
      .query("seriesArticles")
      .withIndex("by_article", (q) => q.eq("articleId", args.articleId))
      .collect();

    await Promise.all(seriesArticles.map((sa) => ctx.db.delete(sa._id)));

    // Delete views
    const views = await ctx.db
      .query("articleViews")
      .withIndex("by_article", (q) => q.eq("articleId", args.articleId))
      .collect();

    await Promise.all(views.map((view) => ctx.db.delete(view._id)));

    // Delete article
    await ctx.db.delete(args.articleId);
  },
});

// Search articles
export const searchArticles = query({
  args: { searchTerm: v.string() },
  handler: async (ctx, args) => {
    const articles = await ctx.db
      .query("articles")
      .withSearchIndex("by_title_content", (q) =>
        q.search("title", args.searchTerm)
      )
      .collect();

    // Get basic details for search results
    const articlesWithDetails = await Promise.all(
      articles.map(async (article) => {
        const category = await ctx.db.get(article.categoryId);
        const tagDetails = await Promise.all(
          article.tags.map(async (tagId) => await ctx.db.get(tagId))
        );

        return {
          ...article,
          category,
          tags: tagDetails.filter(Boolean),
        };
      })
    );

    return articlesWithDetails;
  },
});

// ===== ARTICLE IMAGES =====

// Add images to article
export const addArticleImages = internalMutation({
  args: {
    articleId: v.id("articles"),
    imageStorageIds: v.array(v.id("_storage")),
    captions: v.optional(v.array(v.string())),
    altTexts: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const imagePromises = args.imageStorageIds.map(async (storageId, index) => {
      const imageUrl = await ctx.storage.getUrl(storageId);
      return ctx.db.insert("articleImages", {
        articleId: args.articleId,
        imageUrl: imageUrl!,
        imageId: storageId,
        caption: args.captions?.[index],
        altText: args.altTexts?.[index],
        position: index,
      });
    });

    await Promise.all(imagePromises);
  },
});

// Update article images
export const updateArticleImages = internalMutation({
  args: {
    articleId: v.id("articles"),
    imageStorageIds: v.array(v.id("_storage")),
    captions: v.optional(v.array(v.string())),
    altTexts: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    // Delete existing images
    const existingImages = await ctx.db
      .query("articleImages")
      .withIndex("by_articleId", (q) => q.eq("articleId", args.articleId))
      .collect();

    await Promise.all([
      ...existingImages.map((img) =>
        ctx.storage.delete(img.imageId as Id<"_storage">)
      ),
      ...existingImages.map((img) => ctx.db.delete(img._id)),
    ]);

    // Add new images
    const imagePromises = args.imageStorageIds.map(async (storageId, index) => {
      const imageUrl = await ctx.storage.getUrl(storageId);
      return ctx.db.insert("articleImages", {
        articleId: args.articleId,
        imageUrl: imageUrl!,
        imageId: storageId,
        caption: args.captions?.[index],
        altText: args.altTexts?.[index],
        position: index,
      });
    });

    await Promise.all(imagePromises);
  },
});

// Delete article image
export const deleteArticleImage = internalMutation({
  args: { imageId: v.id("articleImages") },
  handler: async (ctx, args) => {
    const image = await ctx.db.get(args.imageId);
    if (!image) return;

    // Delete from storage
    await ctx.storage.delete(image.imageId as Id<"_storage">);

    // Delete from database
    await ctx.db.delete(args.imageId);

    // Reorder remaining images
    const remainingImages = await ctx.db
      .query("articleImages")
      .withIndex("by_articleId", (q) => q.eq("articleId", image.articleId))
      .collect();

    const sortedImages = remainingImages.sort(
      (a, b) => a.position - b.position
    );

    const reorderPromises = sortedImages.map((img, index) =>
      ctx.db.patch(img._id, { position: index })
    );

    await Promise.all(reorderPromises);
  },
});

// Reorder article images
export const reorderArticleImages = internalMutation({
  args: {
    articleId: v.id("articles"),
    imageOrders: v.array(
      v.object({
        imageId: v.id("articleImages"),
        position: v.number(),
      })
    ),
  },
  handler: async (ctx, args) => {
    const updatePromises = args.imageOrders.map(({ imageId, position }) =>
      ctx.db.patch(imageId, { position })
    );
    await Promise.all(updatePromises);
  },
});

// ===== SERIES ARTICLES MANAGEMENT =====

// Add article to series
export const addArticleToSeries = internalMutation({
  args: {
    seriesId: v.id("articleSeries"),
    articleId: v.id("articles"),
    position: v.number(),
  },
  handler: async (ctx, args) => {
    // Check if article is already in series
    const existing = await ctx.db
      .query("seriesArticles")
      .withIndex("by_article", (q) => q.eq("articleId", args.articleId))
      .first();

    if (existing) {
      throw new Error("Article is already part of a series");
    }

    await ctx.db.insert("seriesArticles", args);
  },
});

// Remove article from series
export const removeArticleFromSeries = internalMutation({
  args: { articleId: v.id("articles") },
  handler: async (ctx, args) => {
    const seriesArticle = await ctx.db
      .query("seriesArticles")
      .withIndex("by_article", (q) => q.eq("articleId", args.articleId))
      .first();

    if (seriesArticle) {
      const seriesId = seriesArticle.seriesId;
      const removedPosition = seriesArticle.position;

      // Delete the series-article relation
      await ctx.db.delete(seriesArticle._id);

      // Reorder remaining articles in series
      const remainingArticles = await ctx.db
        .query("seriesArticles")
        .withIndex("by_series", (q) => q.eq("seriesId", seriesId))
        .collect();

      const articlesToReorder = remainingArticles
        .filter((sa) => sa.position > removedPosition)
        .map((sa) => ({
          id: sa._id,
          position: sa.position - 1,
        }));

      await Promise.all(
        articlesToReorder.map(({ id, position }) =>
          ctx.db.patch(id, { position })
        )
      );
    }
  },
});

// Reorder series articles
export const reorderSeriesArticles = internalMutation({
  args: {
    seriesId: v.id("articleSeries"),
    articleOrders: v.array(
      v.object({
        articleId: v.id("articles"),
        position: v.number(),
      })
    ),
  },
  handler: async (ctx, args) => {
    const updatePromises = args.articleOrders.map(
      async ({ articleId, position }) => {
        const seriesArticle = await ctx.db
          .query("seriesArticles")
          .withIndex("by_article", (q) => q.eq("articleId", articleId))
          .first();

        if (seriesArticle) {
          await ctx.db.patch(seriesArticle._id, { position });
        }
      }
    );

    await Promise.all(updatePromises);
  },
});

// ===== ANALYTICS & VIEWS =====

// Record article view
export const recordArticleView = mutation({
  args: {
    articleId: v.id("articles"),
    userAgent: v.optional(v.string()),
    referrer: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Record view
    await ctx.db.insert("articleViews", {
      articleId: args.articleId,
      viewedAt: Date.now(),
      userAgent: args.userAgent,
      referrer: args.referrer,
    });

    // Update article view count
    const article = await ctx.db.get(args.articleId);
    if (article) {
      await ctx.db.patch(args.articleId, {
        viewCount: article.viewCount + 1,
      });
    }
  },
});

// Get article analytics
export const getArticleAnalytics = query({
  args: {
    articleId: v.id("articles"),
    days: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const daysBack = args.days || 30;
    const startTime = Date.now() - daysBack * 24 * 60 * 60 * 1000;

    const views = await ctx.db
      .query("articleViews")
      .withIndex("by_article", (q) => q.eq("articleId", args.articleId))
      .filter((q) => q.gte(q.field("viewedAt"), startTime))
      .collect();

    // Group by day
    const viewsByDay = views.reduce(
      (acc, view) => {
        const day = new Date(view.viewedAt).toDateString();
        acc[day] = (acc[day] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    // Get referrer stats
    const referrerStats = views.reduce(
      (acc, view) => {
        const referrer = view.referrer || "Direct";
        acc[referrer] = (acc[referrer] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    return {
      totalViews: views.length,
      viewsByDay,
      referrerStats,
      averageViewsPerDay: Math.round((views.length / daysBack) * 100) / 100,
    };
  },
});

// Get popular articles
export const getPopularArticles = query({
  args: {
    limit: v.optional(v.number()),
    days: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 10;
    const daysBack = args.days || 30;
    const startTime = Date.now() - daysBack * 24 * 60 * 60 * 1000;

    // Get recent views
    const recentViews = await ctx.db
      .query("articleViews")
      .withIndex("by_date", (q) => q.gte("viewedAt", startTime))
      .collect();

    // Count views per article
    const viewCounts = recentViews.reduce(
      (acc, view) => {
        const articleId = view.articleId;
        acc[articleId] = (acc[articleId] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    // Sort articles by view count
    const sortedArticles = Object.entries(viewCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, limit);

    // Get article details
    const articlesWithDetails = await Promise.all(
      sortedArticles.map(async ([articleId, viewCount]) => {
        const article = await ctx.db.get(articleId as Id<"articles">);
        if (!article) return null;

        const category = await ctx.db.get(article.categoryId);
        return {
          ...article,
          category,
          recentViews: viewCount,
        };
      })
    );

    return articlesWithDetails.filter(Boolean);
  },
});

// ===== UTILITY FUNCTIONS =====

// Get articles by category
export const getArticlesByCategory = query({
  args: {
    categoryId: v.id("articleCategories"),
    limit: v.optional(v.number()),
    offset: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let articles = await ctx.db
      .query("articles")
      .withIndex("by_category", (q) => q.eq("categoryId", args.categoryId))
      .filter((q) => q.eq(q.field("status"), "published"))
      .collect();

    // Sort by publishedAt
    articles = articles.sort(
      (a, b) => (b.publishedAt || 0) - (a.publishedAt || 0)
    );

    // Apply pagination
    if (args.offset) {
      articles = articles.slice(args.offset);
    }
    if (args.limit) {
      articles = articles.slice(0, args.limit);
    }

    // Get details
    const articlesWithDetails = await Promise.all(
      articles.map(async (article) => {
        const category = await ctx.db.get(article.categoryId);
        const tagDetails = await Promise.all(
          article.tags.map(async (tagId) => await ctx.db.get(tagId))
        );

        return {
          ...article,
          category,
          tags: tagDetails.filter(Boolean),
        };
      })
    );

    return articlesWithDetails;
  },
});

// Get articles by tag - FIXED
export const getArticlesByTag = query({
  args: {
    tagId: v.id("articleTags"),
    limit: v.optional(v.number()),
    offset: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Fix: Use proper filter approach for checking array membership
    let articles = await ctx.db
      .query("articles")
      .filter((q) =>
        q.and(
          q.eq(q.field("status"), "published")
          // Note: Convex doesn't have built-in array contains, so we'll get all and filter
        )
      )
      .collect();

    // Filter articles that contain the tag
    articles = articles.filter((article) => article.tags.includes(args.tagId));

    // Sort by publishedAt
    articles = articles.sort(
      (a, b) => (b.publishedAt || 0) - (a.publishedAt || 0)
    );

    // Apply pagination
    if (args.offset) {
      articles = articles.slice(args.offset);
    }
    if (args.limit) {
      articles = articles.slice(0, args.limit);
    }

    // Get details
    const articlesWithDetails = await Promise.all(
      articles.map(async (article) => {
        const category = await ctx.db.get(article.categoryId);
        const tagDetails = await Promise.all(
          article.tags.map(async (tagId) => await ctx.db.get(tagId))
        );

        return {
          ...article,
          category,
          tags: tagDetails.filter(Boolean),
        };
      })
    );

    return articlesWithDetails;
  },
});

// Get recent articles
export const getRecentArticles = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = args.limit || 5;

    const articles = await ctx.db
      .query("articles")
      .withIndex("by_published", (q) => q.eq("status", "published"))
      .order("desc")
      .take(limit);

    const articlesWithDetails = await Promise.all(
      articles.map(async (article) => {
        const category = await ctx.db.get(article.categoryId);
        const tagDetails = await Promise.all(
          article.tags.map(async (tagId) => await ctx.db.get(tagId))
        );

        return {
          ...article,
          category,
          tags: tagDetails.filter(Boolean),
        };
      })
    );

    return articlesWithDetails;
  },
});

// Get article statistics
export const getArticleStats = query(async (ctx) => {
  const allArticles = await ctx.db.query("articles").collect();

  const stats = {
    total: allArticles.length,
    published: allArticles.filter((a) => a.status === "published").length,
    draft: allArticles.filter((a) => a.status === "draft").length,
    archived: allArticles.filter((a) => a.status === "archived").length,
    totalViews: allArticles.reduce((sum, a) => sum + a.viewCount, 0),
    averageReadingTime: Math.round(
      allArticles.reduce((sum, a) => sum + a.readingTime, 0) /
        allArticles.length || 0
    ),
  };

  // Get articles by category
  const categories = await ctx.db.query("articleCategories").collect();
  const articlesByCategory = await Promise.all(
    categories.map(async (category) => {
      const count = allArticles.filter(
        (a) => a.categoryId === category._id
      ).length;
      return {
        category: category.name,
        count,
      };
    })
  );

  // Get most popular articles
  const popularArticles = allArticles
    .filter((a) => a.status === "published")
    .sort((a, b) => b.viewCount - a.viewCount)
    .slice(0, 5)
    .map((a) => ({
      title: a.title,
      slug: a.slug,
      viewCount: a.viewCount,
    }));

  return {
    ...stats,
    articlesByCategory,
    popularArticles,
  };
});

// Get scheduled articles
export const getScheduledArticles = query(async (ctx) => {
  const now = Date.now();
  const scheduledArticles = await ctx.db
    .query("articles")
    .filter((q) =>
      q.and(
        q.eq(q.field("status"), "draft"),
        q.neq(q.field("scheduledAt"), undefined),
        q.gt(q.field("scheduledAt"), now)
      )
    )
    .collect();

  const articlesWithDetails = await Promise.all(
    scheduledArticles.map(async (article) => {
      const category = await ctx.db.get(article.categoryId);
      return {
        ...article,
        category,
      };
    })
  );

  return articlesWithDetails.sort(
    (a, b) => (a.scheduledAt || 0) - (b.scheduledAt || 0)
  );
});

// Publish scheduled articles (to be called by cron job)
export const publishScheduledArticles = internalMutation(async (ctx) => {
  const now = Date.now();
  const articlesToPublish = await ctx.db
    .query("articles")
    .filter((q) =>
      q.and(
        q.eq(q.field("status"), "draft"),
        q.neq(q.field("scheduledAt"), undefined),
        q.lte(q.field("scheduledAt"), now)
      )
    )
    .collect();

  const publishPromises = articlesToPublish.map((article) =>
    ctx.db.patch(article._id, {
      status: "published" as const,
      publishedAt: now,
      scheduledAt: undefined,
    })
  );

  await Promise.all(publishPromises);
  return articlesToPublish.length;
});

// Get related articles
export const getRelatedArticles = query({
  args: {
    articleId: v.id("articles"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 5;
    const article = await ctx.db.get(args.articleId);
    if (!article) return [];

    // Find articles with similar tags or same category
    const allArticles = await ctx.db
      .query("articles")
      .filter((q) =>
        q.and(
          q.eq(q.field("status"), "published"),
          q.neq(q.field("_id"), args.articleId)
        )
      )
      .collect();

    // Score articles based on similarity
    const scoredArticles = allArticles.map((a) => {
      let score = 0;

      // Same category
      if (a.categoryId === article.categoryId) {
        score += 3;
      }

      // Shared tags
      const sharedTags = a.tags.filter((tag) => article.tags.includes(tag));
      score += sharedTags.length * 2;

      // Same tech stack
      if (a.techStack && article.techStack) {
        const sharedTech = a.techStack.filter((tech) =>
          article.techStack!.includes(tech)
        );
        score += sharedTech.length;
      }

      return { article: a, score };
    });

    // Sort by score and take top results
    const relatedArticles = scoredArticles
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(({ article }) => article);

    // Get details
    const articlesWithDetails = await Promise.all(
      relatedArticles.map(async (article) => {
        const category = await ctx.db.get(article.categoryId);
        const tagDetails = await Promise.all(
          article.tags.map(async (tagId) => await ctx.db.get(tagId))
        );

        return {
          ...article,
          category,
          tags: tagDetails.filter(Boolean),
        };
      })
    );

    return articlesWithDetails;
  },
});

// Get article count by status
export const getArticleCountByStatus = query(async (ctx) => {
  const articles = await ctx.db.query("articles").collect();

  return {
    total: articles.length,
    published: articles.filter((a) => a.status === "published").length,
    draft: articles.filter((a) => a.status === "draft").length,
    archived: articles.filter((a) => a.status === "archived").length,
  };
});
