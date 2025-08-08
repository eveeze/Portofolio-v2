// convex/analytics.ts

import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Track visitor analytics
 */
export const trackVisitor = mutation({
  args: {
    type: v.string(), // "visitor", "page_view", "portfolio_view", "contact_form"
    page: v.optional(v.string()),
    userAgent: v.optional(v.string()),
    referrer: v.optional(v.string()),
    ipHash: v.optional(v.string()), // Hash IP for privacy
    sessionId: v.optional(v.string()),
    additionalData: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("analytics", {
      type: args.type,
      page: args.page,
      userAgent: args.userAgent,
      referrer: args.referrer,
      ipHash: args.ipHash,
      sessionId: args.sessionId,
      additionalData: args.additionalData,
      timestamp: Date.now(),
    });
  },
});

/**
 * Get analytics summary
 */
export const getAnalyticsSummary = query({
  args: {
    days: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const days = args.days || 30;
    const startTime = Date.now() - days * 24 * 60 * 60 * 1000;

    const analytics = await ctx.db
      .query("analytics")
      .filter((q) => q.gte(q.field("_creationTime"), startTime))
      .collect();

    // Group by type
    const summary = analytics.reduce((acc: any, item: any) => {
      acc[item.type] = (acc[item.type] || 0) + 1;
      return acc;
    }, {});

    return summary;
  },
});

/**
 * Get page views analytics
 */
export const getPageViews = query({
  args: {
    days: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const days = args.days || 7;
    const startTime = Date.now() - days * 24 * 60 * 60 * 1000;

    const pageViews = await ctx.db
      .query("analytics")
      .filter((q) =>
        q.and(
          q.eq(q.field("type"), "page_view"),
          q.gte(q.field("_creationTime"), startTime)
        )
      )
      .collect();

    // Group by page
    const pageStats = pageViews.reduce((acc: any, item: any) => {
      acc[item.page] = (acc[item.page] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(pageStats)
      .map(([page, views]) => ({ page, views }))
      .sort((a: any, b: any) => b.views - a.views);
  },
});
