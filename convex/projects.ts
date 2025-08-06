// convex/projects.ts - Updated version
import { v } from "convex/values";
import { internalMutation, query } from "./_generated/server";
import type { Id } from "./_generated/dataModel";

// Generate upload URL untuk project thumbnails dan images
export const generateUploadUrl = internalMutation(async (ctx) => {
  return await ctx.storage.generateUploadUrl();
});

// Create new project
export const createProject = internalMutation({
  args: {
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
    thumbnailStorageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    // Get thumbnail URL from storage
    const thumbnailUrl = await ctx.storage.getUrl(args.thumbnailStorageId);

    const projectId = await ctx.db.insert("projects", {
      title: args.title,
      description: args.description,
      techStack: args.techStack,
      projectUrl: args.projectUrl,
      projectType: args.projectType,
      githubUrl: args.githubUrl,
      thumbnailUrl: thumbnailUrl!,
      thumbnailId: args.thumbnailStorageId,
    });

    return projectId;
  },
});

// Add images to project (dengan urutan)
export const addProjectImages = internalMutation({
  args: {
    projectId: v.id("projects"),
    imageStorageIds: v.array(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    const imagePromises = args.imageStorageIds.map(async (storageId, index) => {
      const imageUrl = await ctx.storage.getUrl(storageId);
      return ctx.db.insert("projectImages", {
        projectId: args.projectId,
        imageUrl: imageUrl!,
        imageId: storageId,
        position: index, // Tambahkan posisi untuk urutan
      });
    });

    await Promise.all(imagePromises);
  },
});

// Get all projects with their tech stacks and images (sorted by position)
export const getProjects = query(async (ctx) => {
  const projects = await ctx.db.query("projects").collect();

  const projectsWithDetails = await Promise.all(
    projects.map(async (project) => {
      // Get tech stack details
      const techStackDetails = await Promise.all(
        project.techStack.map(async (techId) => {
          const tech = await ctx.db.get(techId);
          if (tech) {
            const imageUrl = tech.storageId
              ? await ctx.storage.getUrl(tech.storageId)
              : null;
            return {
              ...tech,
              imageUrl,
            };
          }
          return null;
        })
      );

      // Get project images sorted by position
      const projectImages = await ctx.db
        .query("projectImages")
        .withIndex("by_projectId", (q) => q.eq("projectId", project._id))
        .collect();

      // Sort images by position
      const sortedImages = projectImages.sort(
        (a, b) => (a.position || 0) - (b.position || 0)
      );

      return {
        ...project,
        techStack: techStackDetails.filter(Boolean),
        images: sortedImages,
      };
    })
  );

  return projectsWithDetails;
});

// Get single project by ID
export const getProject = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    const project = await ctx.db.get(args.projectId);
    if (!project) return null;

    // Get tech stack details
    const techStackDetails = await Promise.all(
      project.techStack.map(async (techId) => {
        const tech = await ctx.db.get(techId);
        if (tech) {
          const imageUrl = tech.storageId
            ? await ctx.storage.getUrl(tech.storageId)
            : null;
          return {
            ...tech,
            imageUrl,
          };
        }
        return null;
      })
    );

    // Get project images sorted by position
    const projectImages = await ctx.db
      .query("projectImages")
      .withIndex("by_projectId", (q) => q.eq("projectId", project._id))
      .collect();

    const sortedImages = projectImages.sort(
      (a, b) => (a.position || 0) - (b.position || 0)
    );

    return {
      ...project,
      techStack: techStackDetails.filter(Boolean),
      images: sortedImages,
    };
  },
});

// Update project
export const updateProject = internalMutation({
  args: {
    projectId: v.id("projects"),
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
    thumbnailStorageId: v.optional(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    const { projectId, thumbnailStorageId, ...updateData } = args;

    // Prepare update data
    const finalUpdateData: any = { ...updateData };

    // If new thumbnail is provided
    if (thumbnailStorageId) {
      // Get existing project to delete old thumbnail
      const existingProject = await ctx.db.get(projectId);
      if (existingProject?.thumbnailId) {
        await ctx.storage.delete(existingProject.thumbnailId as Id<"_storage">);
      }

      // Get new thumbnail URL and update data
      const thumbnailUrl = await ctx.storage.getUrl(thumbnailStorageId);
      finalUpdateData.thumbnailUrl = thumbnailUrl;
      finalUpdateData.thumbnailId = thumbnailStorageId;
    }

    await ctx.db.patch(projectId, finalUpdateData);
  },
});

// Update project images dengan handling existing images
export const updateProjectImages = internalMutation({
  args: {
    projectId: v.id("projects"),
    imageStorageIds: v.array(v.id("_storage")),
    keepExistingImages: v.optional(v.boolean()), // Flag untuk mempertahankan existing images
  },
  handler: async (ctx, args) => {
    if (!args.keepExistingImages) {
      // Get existing images
      const existingImages = await ctx.db
        .query("projectImages")
        .withIndex("by_projectId", (q) => q.eq("projectId", args.projectId))
        .collect();

      // Delete existing images from storage and database
      await Promise.all([
        ...existingImages.map((img) =>
          ctx.storage.delete(img.imageId as Id<"_storage">)
        ),
        ...existingImages.map((img) => ctx.db.delete(img._id)),
      ]);
    }

    // Add new images with proper positioning
    const existingCount = args.keepExistingImages
      ? (
          await ctx.db
            .query("projectImages")
            .withIndex("by_projectId", (q) => q.eq("projectId", args.projectId))
            .collect()
        ).length
      : 0;

    const imagePromises = args.imageStorageIds.map(async (storageId, index) => {
      const imageUrl = await ctx.storage.getUrl(storageId);
      return ctx.db.insert("projectImages", {
        projectId: args.projectId,
        imageUrl: imageUrl!,
        imageId: storageId,
        position: existingCount + index,
      });
    });

    await Promise.all(imagePromises);
  },
});

// Reorder project images
export const reorderProjectImages = internalMutation({
  args: {
    projectId: v.id("projects"),
    imageOrders: v.array(
      v.object({
        imageId: v.id("projectImages"),
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

// Delete specific project image
export const deleteProjectImage = internalMutation({
  args: {
    imageId: v.id("projectImages"),
  },
  handler: async (ctx, args) => {
    const projectImage = await ctx.db.get(args.imageId);
    if (!projectImage) {
      throw new Error("Project image tidak ditemukan untuk dihapus.");
    }

    const projectId = projectImage.projectId;

    // Delete from storage
    await ctx.storage.delete(projectImage.imageId as Id<"_storage">);

    // Delete from database
    await ctx.db.delete(args.imageId);

    // Reorder remaining images
    const remainingImages = await ctx.db
      .query("projectImages")
      .withIndex("by_projectId", (q) => q.eq("projectId", projectId))
      .collect();

    const sortedImages = remainingImages.sort(
      (a, b) => (a.position || 0) - (b.position || 0)
    );

    // Update positions to maintain sequential order
    const reorderPromises = sortedImages.map((img, index) =>
      ctx.db.patch(img._id, { position: index })
    );

    await Promise.all(reorderPromises);
  },
});

// Delete multiple project images
export const deleteProjectImages = internalMutation({
  args: {
    imageIds: v.array(v.id("projectImages")),
  },
  handler: async (ctx, args) => {
    const deletePromises = args.imageIds.map(async (imageId) => {
      const projectImage = await ctx.db.get(imageId);
      if (projectImage) {
        // Delete from storage
        await ctx.storage.delete(projectImage.imageId as Id<"_storage">);
        // Delete from database
        await ctx.db.delete(imageId);
        return projectImage.projectId;
      }
      return null;
    });

    const results = await Promise.all(deletePromises);
    const projectIds = [
      ...new Set(results.filter((id): id is Id<"projects"> => id !== null)),
    ];

    // Reorder images for affected projects
    for (const projectId of projectIds) {
      const remainingImages = await ctx.db
        .query("projectImages")
        .withIndex("by_projectId", (q) => q.eq("projectId", projectId))
        .collect();

      const sortedImages = remainingImages.sort(
        (a, b) => (a.position || 0) - (b.position || 0)
      );

      const reorderPromises = sortedImages.map((img, index) =>
        ctx.db.patch(img._id, { position: index })
      );

      await Promise.all(reorderPromises);
    }
  },
});

// Delete project and all associated images
export const deleteProject = internalMutation({
  args: {
    projectId: v.id("projects"),
  },
  handler: async (ctx, args) => {
    const project = await ctx.db.get(args.projectId);
    if (!project) {
      throw new Error("Project tidak ditemukan untuk dihapus.");
    }

    // Delete thumbnail from storage
    if (project.thumbnailId) {
      await ctx.storage.delete(project.thumbnailId as Id<"_storage">);
    }

    // Get and delete all project images
    const projectImages = await ctx.db
      .query("projectImages")
      .withIndex("by_projectId", (q) => q.eq("projectId", args.projectId))
      .collect();

    // Delete images from storage and database
    await Promise.all([
      ...projectImages.map((img) =>
        ctx.storage.delete(img.imageId as Id<"_storage">)
      ),
      ...projectImages.map((img) => ctx.db.delete(img._id)),
    ]);

    // Delete the project
    await ctx.db.delete(args.projectId);
  },
});

// Get projects by type
export const getProjectsByType = query({
  args: {
    projectType: v.union(
      v.literal("website"),
      v.literal("mobile"),
      v.literal("backend"),
      v.literal("desktop"),
      v.literal("other")
    ),
  },
  handler: async (ctx, args) => {
    const projects = await ctx.db
      .query("projects")
      .filter((q) => q.eq(q.field("projectType"), args.projectType))
      .collect();

    const projectsWithDetails = await Promise.all(
      projects.map(async (project) => {
        // Get tech stack details
        const techStackDetails = await Promise.all(
          project.techStack.map(async (techId) => {
            const tech = await ctx.db.get(techId);
            if (tech) {
              const imageUrl = tech.storageId
                ? await ctx.storage.getUrl(tech.storageId)
                : null;
              return {
                ...tech,
                imageUrl,
              };
            }
            return null;
          })
        );

        // Get project images sorted by position
        const projectImages = await ctx.db
          .query("projectImages")
          .withIndex("by_projectId", (q) => q.eq("projectId", project._id))
          .collect();

        const sortedImages = projectImages.sort(
          (a, b) => (a.position || 0) - (b.position || 0)
        );

        return {
          ...project,
          techStack: techStackDetails.filter(Boolean),
          images: sortedImages,
        };
      })
    );

    return projectsWithDetails;
  },
});

// Search projects by title
export const searchProjects = query({
  args: { searchTerm: v.string() },
  handler: async (ctx, args) => {
    const projects = await ctx.db
      .query("projects")
      .withSearchIndex("by_title", (q) => q.search("title", args.searchTerm))
      .collect();

    const projectsWithDetails = await Promise.all(
      projects.map(async (project) => {
        // Get tech stack details
        const techStackDetails = await Promise.all(
          project.techStack.map(async (techId) => {
            const tech = await ctx.db.get(techId);
            if (tech) {
              const imageUrl = tech.storageId
                ? await ctx.storage.getUrl(tech.storageId)
                : null;
              return {
                ...tech,
                imageUrl,
              };
            }
            return null;
          })
        );

        // Get project images sorted by position
        const projectImages = await ctx.db
          .query("projectImages")
          .withIndex("by_projectId", (q) => q.eq("projectId", project._id))
          .collect();

        const sortedImages = projectImages.sort(
          (a, b) => (a.position || 0) - (b.position || 0)
        );

        return {
          ...project,
          techStack: techStackDetails.filter(Boolean),
          images: sortedImages,
        };
      })
    );

    return projectsWithDetails;
  },
});

// Get project statistics
export const getProjectStats = query(async (ctx) => {
  const allProjects = await ctx.db.query("projects").collect();
  const totalProjects = allProjects.length;

  const projectsByType = allProjects.reduce(
    (acc, project) => {
      const type = project.projectType;
      if (!acc[type]) {
        acc[type] = 0;
      }
      acc[type]++;
      return acc;
    },
    {} as Record<string, number>
  );

  // Count total images
  const allImages = await ctx.db.query("projectImages").collect();
  const totalImages = allImages.length;

  // Get average images per project
  const avgImagesPerProject =
    totalProjects > 0
      ? Math.round((totalImages / totalProjects) * 100) / 100
      : 0;

  return {
    totalProjects,
    totalImages,
    avgImagesPerProject,
    projectsByType,
  };
});

// Get project image count
export const getProjectImageCount = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    const images = await ctx.db
      .query("projectImages")
      .withIndex("by_projectId", (q) => q.eq("projectId", args.projectId))
      .collect();

    return images.length;
  },
});
