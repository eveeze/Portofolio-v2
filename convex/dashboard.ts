// convex/dashboard.ts

import { query } from "./_generated/server";
import { api } from "./_generated/api";
import type { Doc } from "./_generated/dataModel";

// Type definitions for the dashboard data structure
interface DashboardStats {
  articles: {
    total: number;
    published: number;
    draft: number;
    archived: number;
    totalViews: number;
    recentGrowth?: number; // Dynamic growth percentage
  };
  projects: {
    total: number;
    recentGrowth?: number; // Dynamic growth percentage
  };
  techStacks: {
    total: number;
    recentGrowth?: number; // Dynamic growth percentage
  };
  analytics: {
    totalVisitors: number;
    todayVisitors: number;
    portfolioViews: number;
    contactSubmissions: number;
    weeklyVisitors: number;
    monthlyVisitors: number;
  };
}

// Type for hydrated project with full tech stack details
type HydratedProject = Omit<Doc<"projects">, "techStack"> & {
  techStack: (Doc<"techStacks"> & { imageUrl: string | null })[];
};

interface DashboardData {
  stats: DashboardStats;
  charts: {
    articlesByCategory: any[];
    projectsByType: any[];
    visitorsTrend: any[];
    popularPages: any[];
  };
  recentActivity: {
    articles: any[];
    projects: HydratedProject[];
    visitors: any[];
  };
  popularArticles: any[];
  scheduledArticles: any[];
}

/**
 * Calculate growth percentage between two periods
 */
const calculateGrowthPercentage = (
  current: number,
  previous: number
): number | undefined => {
  if (previous === 0) return current > 0 ? 100 : undefined;
  const growth = Math.round(((current - previous) / previous) * 100);
  return growth > 0 ? growth : undefined;
};

/**
 * Fetches aggregated data from various sources for the main dashboard.
 * This query is designed to be the primary data source for a dashboard view,
 * minimizing the number of separate client-side requests.
 */
export const getDashboardData = query({
  handler: async (ctx): Promise<DashboardData> => {
    const now = Date.now();
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const weekAgo = now - 7 * 24 * 60 * 60 * 1000;
    const monthAgo = now - 30 * 24 * 60 * 60 * 1000;
    const twoMonthsAgo = now - 60 * 24 * 60 * 60 * 1000;

    // 1. Get aggregated stats by running existing queries
    const articleStats: any = await ctx.runQuery(api.articles.getArticleStats);
    const projectStats: any = await ctx.runQuery(api.projects.getProjectStats);
    const techStackStats: any = await ctx.runQuery(
      api.techStack.getTechStackStats
    );

    // 2. Calculate dynamic growth for articles
    const articlesLastMonth = await ctx.db
      .query("articles")
      .filter((q) =>
        q.and(
          q.gte(q.field("_creationTime"), twoMonthsAgo),
          q.lt(q.field("_creationTime"), monthAgo)
        )
      )
      .collect()
      .then((articles) => articles.length);

    const articlesThisMonth = await ctx.db
      .query("articles")
      .filter((q) => q.gte(q.field("_creationTime"), monthAgo))
      .collect()
      .then((articles) => articles.length);

    // 3. Calculate dynamic growth for projects
    const projectsLastMonth = await ctx.db
      .query("projects")
      .filter((q) =>
        q.and(
          q.gte(q.field("_creationTime"), twoMonthsAgo),
          q.lt(q.field("_creationTime"), monthAgo)
        )
      )
      .collect()
      .then((projects) => projects.length);

    const projectsThisMonth = await ctx.db
      .query("projects")
      .filter((q) => q.gte(q.field("_creationTime"), monthAgo))
      .collect()
      .then((projects) => projects.length);

    // 4. Calculate dynamic growth for tech stacks
    const techStacksLastMonth = await ctx.db
      .query("techStacks")
      .filter((q) =>
        q.and(
          q.gte(q.field("_creationTime"), twoMonthsAgo),
          q.lt(q.field("_creationTime"), monthAgo)
        )
      )
      .collect()
      .then((stacks) => stacks.length);

    const techStacksThisMonth = await ctx.db
      .query("techStacks")
      .filter((q) => q.gte(q.field("_creationTime"), monthAgo))
      .collect()
      .then((stacks) => stacks.length);

    // 5. Get analytics data (completely dynamic)
    const totalVisitors = await ctx.db
      .query("analytics")
      .filter((q) => q.eq(q.field("type"), "visitor"))
      .collect()
      .then((visitors) => visitors.length);

    const todayVisitors = await ctx.db
      .query("analytics")
      .filter((q) =>
        q.and(
          q.eq(q.field("type"), "visitor"),
          q.gte(q.field("_creationTime"), todayStart.getTime())
        )
      )
      .collect()
      .then((visitors) => visitors.length);

    const weeklyVisitors = await ctx.db
      .query("analytics")
      .filter((q) =>
        q.and(
          q.eq(q.field("type"), "visitor"),
          q.gte(q.field("_creationTime"), weekAgo)
        )
      )
      .collect()
      .then((visitors) => visitors.length);

    const monthlyVisitors = await ctx.db
      .query("analytics")
      .filter((q) =>
        q.and(
          q.eq(q.field("type"), "visitor"),
          q.gte(q.field("_creationTime"), monthAgo)
        )
      )
      .collect()
      .then((visitors) => visitors.length);

    const portfolioViews = await ctx.db
      .query("analytics")
      .filter((q) => q.eq(q.field("type"), "portfolio_view"))
      .collect()
      .then((views) => views.length);

    const contactSubmissions = await ctx.db
      .query("analytics")
      .filter((q) => q.eq(q.field("type"), "contact_form"))
      .collect()
      .then((submissions) => submissions.length);

    // 6. Get visitors trend data for charts (last 7 days) - completely dynamic
    const visitorsTrend = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      const nextDay = new Date(date);
      nextDay.setDate(nextDay.getDate() + 1);

      const dayVisitors = await ctx.db
        .query("analytics")
        .filter((q) =>
          q.and(
            q.eq(q.field("type"), "visitor"),
            q.gte(q.field("_creationTime"), date.getTime()),
            q.lt(q.field("_creationTime"), nextDay.getTime())
          )
        )
        .collect()
        .then((visitors) => visitors.length);

      visitorsTrend.push({
        date: date.toISOString().split("T")[0],
        visitors: dayVisitors,
      });
    }

    // 7. Get popular pages - completely dynamic
    const popularPages = await ctx.db
      .query("analytics")
      .filter((q) => q.eq(q.field("type"), "page_view"))
      .collect()
      .then((views) => {
        const pageViews: { [key: string]: number } = {};
        views.forEach((view: any) => {
          const page = view.page || "Home";
          pageViews[page] = (pageViews[page] || 0) + 1;
        });
        return Object.entries(pageViews)
          .map(([page, views]) => ({ page, views }))
          .sort((a, b) => b.views - a.views)
          .slice(0, 10);
      });

    // 8. Get lists of recent and upcoming content
    const recentArticles: any = await ctx.runQuery(
      api.articles.getRecentArticles,
      {
        limit: 10,
      }
    );
    const scheduledArticles: any = await ctx.runQuery(
      api.articles.getScheduledArticles
    );

    // 9. Get recent projects (dynamic, with proper error handling)
    const recentProjectsRaw: Doc<"projects">[] = await ctx.db
      .query("projects")
      .order("desc")
      .take(10);

    // Hydrate recent projects with their tech stack details and image URLs
    const recentProjects: HydratedProject[] = await Promise.all(
      recentProjectsRaw.map(
        async (project: Doc<"projects">): Promise<HydratedProject> => {
          if (!project.techStack || project.techStack.length === 0) {
            return {
              ...project,
              techStack: [],
            };
          }

          const techStackDetails = await Promise.all(
            project.techStack.map(async (techId: Doc<"techStacks">["_id"]) => {
              try {
                const tech = await ctx.db.get(techId);
                if (tech && tech.storageId) {
                  const imageUrl = await ctx.storage.getUrl(tech.storageId);
                  return { ...tech, imageUrl };
                }
                return tech ? { ...tech, imageUrl: null } : null;
              } catch (error) {
                console.error(`Error fetching tech stack ${techId}:`, error);
                return null;
              }
            })
          );

          const validTechStack = techStackDetails.filter(
            (t): t is Doc<"techStacks"> & { imageUrl: string | null } =>
              t !== null
          );

          return {
            ...project,
            techStack: validTechStack,
          };
        }
      )
    );

    // 10. Get recent visitors activity - dynamic
    const recentVisitors = await ctx.db
      .query("analytics")
      .filter((q) => q.eq(q.field("type"), "visitor"))
      .order("desc")
      .take(15);

    // 11. Assemble the final dashboard data object
    return {
      // Key statistics for display cards - ALL DYNAMIC
      stats: {
        articles: {
          total: articleStats.total,
          published: articleStats.published,
          draft: articleStats.draft,
          archived: articleStats.archived,
          totalViews: articleStats.totalViews,
          recentGrowth: calculateGrowthPercentage(
            articlesThisMonth,
            articlesLastMonth
          ),
        },
        projects: {
          total: projectStats.totalProjects,
          recentGrowth: calculateGrowthPercentage(
            projectsThisMonth,
            projectsLastMonth
          ),
        },
        techStacks: {
          total: techStackStats.totalStacks,
          recentGrowth: calculateGrowthPercentage(
            techStacksThisMonth,
            techStacksLastMonth
          ),
        },
        analytics: {
          totalVisitors,
          todayVisitors,
          portfolioViews,
          contactSubmissions,
          weeklyVisitors,
          monthlyVisitors,
        },
      },
      // Data formatted for charts/visualizations - ALL DYNAMIC
      charts: {
        articlesByCategory: articleStats.articlesByCategory || [],
        projectsByType: projectStats.projectsByType || [],
        visitorsTrend,
        popularPages,
      },
      // Lists for "Recent Activity" sections - ALL DYNAMIC
      recentActivity: {
        articles: recentArticles || [],
        projects: recentProjects,
        visitors: recentVisitors,
      },
      // Top-performing content - DYNAMIC
      popularArticles: articleStats.popularArticles || [],
      // Upcoming scheduled posts - DYNAMIC
      scheduledArticles: scheduledArticles || [],
    };
  },
});
