// convex/http.ts

import { httpRouter } from "convex/server";
import { internal } from "./_generated/api";
import { httpAction, type ActionCtx } from "./_generated/server";
import { api } from "./_generated/api";
import type { Id } from "./_generated/dataModel";

// Helper untuk verifikasi JWT menggunakan action
const verifyToken = async (ctx: ActionCtx, req: Request) => {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return { status: 401, body: "Authorization header is missing" };
  }
  const token = authHeader.replace("Bearer ", "");

  const result = await ctx.runAction(api.authActions.verifyJWT, { token });

  if (!result.success) {
    return { status: 403, body: result.error };
  }

  return { success: true, decoded: result.decoded };
};

// Helper untuk CORS headers
const getCorsHeaders = () => ({
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PATCH, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
});

const http = httpRouter();

// OPTIONS handler untuk CORS preflight
http.route({
  path: "/generateUploadUrl",
  method: "OPTIONS",
  handler: httpAction(async (ctx, req) => {
    return new Response(null, {
      status: 200,
      headers: getCorsHeaders(),
    });
  }),
});

http.route({
  path: "/techstacks",
  method: "OPTIONS",
  handler: httpAction(async (ctx, req) => {
    return new Response(null, {
      status: 200,
      headers: getCorsHeaders(),
    });
  }),
});

http.route({
  path: "/techstacks/order",
  method: "OPTIONS",
  handler: httpAction(async (ctx, req) => {
    return new Response(null, {
      status: 200,
      headers: getCorsHeaders(),
    });
  }),
});

http.route({
  pathPrefix: "/techstacks/",
  method: "OPTIONS",
  handler: httpAction(async (ctx, req) => {
    return new Response(null, {
      status: 200,
      headers: getCorsHeaders(),
    });
  }),
});

// --- Upload URL Route ---
http.route({
  path: "/generateUploadUrl",
  method: "GET",
  handler: httpAction(async (ctx, req) => {
    console.log("generateUploadUrl route hit");

    const authResult = await verifyToken(ctx, req);
    if ("status" in authResult) {
      return new Response(JSON.stringify({ error: authResult.body }), {
        status: authResult.status,
        headers: getCorsHeaders(),
      });
    }

    try {
      const url = await ctx.runMutation(internal.techStack.generateUploadUrl);
      console.log("Upload URL generated:", url);

      return new Response(JSON.stringify({ url }), {
        status: 200,
        headers: getCorsHeaders(),
      });
    } catch (error) {
      console.error("Error generating upload URL:", error);
      return new Response(
        JSON.stringify({ error: "Failed to generate upload URL" }),
        {
          status: 500,
          headers: getCorsHeaders(),
        }
      );
    }
  }),
});

// --- Tech Stacks Routes ---
http.route({
  path: "/techstacks",
  method: "POST",
  handler: httpAction(async (ctx, req) => {
    console.log("POST /techstacks route hit");

    const authResult = await verifyToken(ctx, req);
    if ("status" in authResult) {
      return new Response(JSON.stringify({ error: authResult.body }), {
        status: authResult.status,
        headers: getCorsHeaders(),
      });
    }

    try {
      const body = await req.json();
      const { name, category, storageId } = body;

      if (!name || !category) {
        return new Response(
          JSON.stringify({ error: "Name and category are required" }),
          {
            status: 400,
            headers: getCorsHeaders(),
          }
        );
      }

      await ctx.runMutation(internal.techStack.createTechStack, {
        name,
        category,
        storageId: storageId || undefined,
      });

      return new Response(JSON.stringify({ success: true }), {
        status: 201,
        headers: getCorsHeaders(),
      });
    } catch (error) {
      console.error("Error creating tech stack:", error);
      return new Response(
        JSON.stringify({ error: "Failed to create tech stack" }),
        {
          status: 500,
          headers: getCorsHeaders(),
        }
      );
    }
  }),
});

http.route({
  path: "/techstacks/order",
  method: "POST",
  handler: httpAction(async (ctx, req) => {
    console.log("POST /techstacks/order route hit");

    const authResult = await verifyToken(ctx, req);
    if ("status" in authResult) {
      return new Response(JSON.stringify({ error: authResult.body }), {
        status: authResult.status,
        headers: getCorsHeaders(),
      });
    }

    try {
      const { orderedIds } = await req.json();

      if (!Array.isArray(orderedIds)) {
        return new Response(
          JSON.stringify({ error: "orderedIds must be an array" }),
          {
            status: 400,
            headers: getCorsHeaders(),
          }
        );
      }

      await ctx.runMutation(internal.techStack.updateTechStackOrder, {
        orderedIds,
      });

      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: getCorsHeaders(),
      });
    } catch (error) {
      console.error("Error updating order:", error);
      return new Response(JSON.stringify({ error: "Failed to update order" }), {
        status: 500,
        headers: getCorsHeaders(),
      });
    }
  }),
});

// Update tech stack
http.route({
  pathPrefix: "/techstacks/",
  method: "PATCH",
  handler: httpAction(async (ctx, request) => {
    console.log("PATCH /techstacks/{id} route hit"); // Extract ID from URL path

    const url = new URL(request.url);
    const pathSegments = url.pathname.split("/");
    const id = pathSegments[pathSegments.length - 1];

    if (!id || id === "order") {
      // Skip if it's the order endpoint
      return new Response(
        JSON.stringify({ error: "ID parameter is required" }),
        {
          status: 400,
          headers: getCorsHeaders(),
        }
      );
    }

    const authResult = await verifyToken(ctx, request);
    if ("status" in authResult) {
      return new Response(JSON.stringify({ error: authResult.body }), {
        status: authResult.status,
        headers: getCorsHeaders(),
      });
    }

    try {
      const stackId = id as Id<"techStacks">;
      const body = await request.json();
      const { name, category, storageId } = body;

      if (!name || !category) {
        return new Response(
          JSON.stringify({ error: "Name and category are required" }),
          {
            status: 400,
            headers: getCorsHeaders(),
          }
        );
      }

      await ctx.runMutation(internal.techStack.updateTechStack, {
        stackId,
        name,
        category,
        storageId: storageId || undefined,
      });

      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: getCorsHeaders(),
      });
    } catch (error) {
      console.error("Error updating tech stack:", error);
      return new Response(
        JSON.stringify({ error: "Failed to update tech stack" }),
        {
          status: 500,
          headers: getCorsHeaders(),
        }
      );
    }
  }),
});

// Delete tech stack
http.route({
  pathPrefix: "/techstacks/",
  method: "DELETE",
  handler: httpAction(async (ctx, request) => {
    console.log("DELETE /techstacks/{id} route hit"); // Extract ID from URL path

    const url = new URL(request.url);
    const pathSegments = url.pathname.split("/");
    const id = pathSegments[pathSegments.length - 1];

    if (!id || id === "order") {
      // Skip if it's the order endpoint
      return new Response(
        JSON.stringify({ error: "ID parameter is required" }),
        {
          status: 400,
          headers: getCorsHeaders(),
        }
      );
    }

    const authResult = await verifyToken(ctx, request);
    if ("status" in authResult) {
      return new Response(JSON.stringify({ error: authResult.body }), {
        status: authResult.status,
        headers: getCorsHeaders(),
      });
    }

    try {
      const stackId = id as Id<"techStacks">;
      await ctx.runMutation(internal.techStack.deleteTechStack, { stackId });

      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: getCorsHeaders(),
      });
    } catch (error) {
      console.error("Error deleting tech stack:", error);
      return new Response(
        JSON.stringify({ error: "Failed to delete tech stack" }),
        {
          status: 500,
          headers: getCorsHeaders(),
        }
      );
    }
  }),
});

// --- Project Upload URL Route ---
http.route({
  path: "/projects/generateUploadUrl",
  method: "OPTIONS",
  handler: httpAction(async (ctx, req) => {
    return new Response(null, {
      status: 200,
      headers: getCorsHeaders(),
    });
  }),
});

http.route({
  path: "/projects/generateUploadUrl",
  method: "GET",
  handler: httpAction(async (ctx, req) => {
    console.log("projects generateUploadUrl route hit");

    const authResult = await verifyToken(ctx, req);
    if ("status" in authResult) {
      return new Response(JSON.stringify({ error: authResult.body }), {
        status: authResult.status,
        headers: getCorsHeaders(),
      });
    }

    try {
      const url = await ctx.runMutation(internal.projects.generateUploadUrl);
      console.log("Project Upload URL generated:", url);

      return new Response(JSON.stringify({ url }), {
        status: 200,
        headers: getCorsHeaders(),
      });
    } catch (error) {
      console.error("Error generating project upload URL:", error);
      return new Response(
        JSON.stringify({ error: "Failed to generate upload URL" }),
        {
          status: 500,
          headers: getCorsHeaders(),
        }
      );
    }
  }),
});

// --- Projects Routes ---
http.route({
  path: "/projects",
  method: "OPTIONS",
  handler: httpAction(async (ctx, req) => {
    return new Response(null, {
      status: 200,
      headers: getCorsHeaders(),
    });
  }),
});

// Create project
http.route({
  path: "/projects",
  method: "POST",
  handler: httpAction(async (ctx, req) => {
    console.log("POST /projects route hit");

    const authResult = await verifyToken(ctx, req);
    if ("status" in authResult) {
      return new Response(JSON.stringify({ error: authResult.body }), {
        status: authResult.status,
        headers: getCorsHeaders(),
      });
    }

    try {
      const body = await req.json();
      const {
        title,
        description,
        techStack,
        projectUrl,
        projectType,
        githubUrl,
        thumbnailStorageId,
        imageStorageIds = [],
      } = body;

      if (!title || !description || !projectType || !thumbnailStorageId) {
        return new Response(
          JSON.stringify({
            error:
              "Title, description, projectType, and thumbnailStorageId are required",
          }),
          {
            status: 400,
            headers: getCorsHeaders(),
          }
        );
      } // Create project

      const projectId = await ctx.runMutation(internal.projects.createProject, {
        title,
        description,
        techStack: techStack || [],
        projectUrl,
        projectType,
        githubUrl,
        thumbnailStorageId,
      }); // Add images if provided

      if (imageStorageIds.length > 0) {
        await ctx.runMutation(internal.projects.addProjectImages, {
          projectId,
          imageStorageIds,
        });
      }

      return new Response(JSON.stringify({ success: true, projectId }), {
        status: 201,
        headers: getCorsHeaders(),
      });
    } catch (error) {
      console.error("Error creating project:", error);
      return new Response(
        JSON.stringify({ error: "Failed to create project" }),
        {
          status: 500,
          headers: getCorsHeaders(),
        }
      );
    }
  }),
});

// BARU: Menambahkan OPTIONS handler untuk rute dinamis /projects/{id}
// Ini akan menangani preflight request untuk PATCH dan DELETE
http.route({
  pathPrefix: "/projects/",
  method: "OPTIONS",
  handler: httpAction(async (ctx, req) => {
    return new Response(null, {
      status: 200,
      headers: getCorsHeaders(),
    });
  }),
});

// Update project
http.route({
  pathPrefix: "/projects/",
  method: "PATCH",
  handler: httpAction(async (ctx, request) => {
    console.log("PATCH /projects/{id} route hit");

    const url = new URL(request.url);
    const pathSegments = url.pathname.split("/");
    const id = pathSegments[pathSegments.length - 1]; // Modifikasi kecil: Cek apakah path segment terakhir adalah 'images' atau path spesifik lain

    const isSpecialPath = [
      "images",
      "generateUploadUrl",
      "image-count",
    ].includes(id);

    if (!id || isSpecialPath) {
      // Abaikan jika ini adalah path spesifik atau tidak ada ID
      return new Response(
        JSON.stringify({ error: "Not a valid project ID path for PATCH" }),
        {
          status: 404,
          headers: getCorsHeaders(),
        }
      );
    }

    const authResult = await verifyToken(ctx, request);
    if ("status" in authResult) {
      return new Response(JSON.stringify({ error: authResult.body }), {
        status: authResult.status,
        headers: getCorsHeaders(),
      });
    }

    try {
      const projectId = id as Id<"projects">;
      const body = await request.json();
      const {
        title,
        description,
        techStack,
        projectUrl,
        projectType,
        githubUrl,
        thumbnailStorageId,
        imageStorageIds,
      } = body;

      if (!title || !description || !projectType) {
        return new Response(
          JSON.stringify({
            error: "Title, description, and projectType are required",
          }),
          {
            status: 400,
            headers: getCorsHeaders(),
          }
        );
      } // Update project

      await ctx.runMutation(internal.projects.updateProject, {
        projectId,
        title,
        description,
        techStack: techStack || [],
        projectUrl,
        projectType,
        githubUrl,
        thumbnailStorageId,
      }); // Update images if provided

      if (imageStorageIds) {
        await ctx.runMutation(internal.projects.updateProjectImages, {
          projectId,
          imageStorageIds,
        });
      }

      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: getCorsHeaders(),
      });
    } catch (error) {
      console.error("Error updating project:", error);
      return new Response(
        JSON.stringify({ error: "Failed to update project" }),
        {
          status: 500,
          headers: getCorsHeaders(),
        }
      );
    }
  }),
});
// Projects by Type - OPTIONS
http.route({
  path: "/projects/by-type",
  method: "OPTIONS",
  handler: httpAction(async (ctx, req) => {
    return new Response(null, {
      status: 200,
      headers: getCorsHeaders(),
    });
  }),
});

// Get projects by type - GET
http.route({
  path: "/projects/by-type",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    console.log("GET /projects/by-type route hit");

    try {
      const url = new URL(request.url);
      const searchParams = url.searchParams;
      const projectType = searchParams.get("type"); // Ambil dari ?type=...

      if (!projectType) {
        return new Response(
          JSON.stringify({ error: "Query parameter 'type' is required" }),
          {
            status: 400,
            headers: getCorsHeaders(),
          }
        );
      } // Panggil query Anda dari projects.ts

      const articles = await ctx.runQuery(api.projects.getProjectsByType, {
        projectType: projectType as any, // 'any' digunakan di sini agar mudah,
        // karena query Anda sudah memvalidasi tipenya
      });

      return new Response(JSON.stringify(articles), {
        status: 200,
        headers: getCorsHeaders(),
      });
    } catch (error) {
      console.error("Error getting projects by type:", error);
      return new Response(
        JSON.stringify({ error: "Failed to get projects by type" }),
        {
          status: 500,
          headers: getCorsHeaders(),
        }
      );
    }
  }),
});
// Delete project
http.route({
  pathPrefix: "/projects/",
  method: "DELETE",
  handler: httpAction(async (ctx, request) => {
    console.log("DELETE /projects/{id} route hit");

    const url = new URL(request.url);
    const pathSegments = url.pathname.split("/");
    const id = pathSegments[pathSegments.length - 1]; // Modifikasi kecil: Cek apakah path segment terakhir adalah path spesifik lain

    const isSpecialPath = [
      "images",
      "generateUploadUrl",
      "image-count",
    ].includes(id);

    if (!id || isSpecialPath) {
      return new Response(
        JSON.stringify({ error: "Not a valid project ID path for DELETE" }),
        {
          status: 404,
          headers: getCorsHeaders(),
        }
      );
    }

    const authResult = await verifyToken(ctx, request);
    if ("status" in authResult) {
      return new Response(JSON.stringify({ error: authResult.body }), {
        status: authResult.status,
        headers: getCorsHeaders(),
      });
    }

    try {
      const projectId = id as Id<"projects">;
      await ctx.runMutation(internal.projects.deleteProject, { projectId });

      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: getCorsHeaders(),
      });
    } catch (error) {
      console.error("Error deleting project:", error);
      return new Response(
        JSON.stringify({ error: "Failed to delete project" }),
        {
          status: 500,
          headers: getCorsHeaders(),
        }
      );
    }
  }),
});

// --- Project Images Routes ---
http.route({
  path: "/projects/images",
  method: "OPTIONS",
  handler: httpAction(async (ctx, req) => {
    return new Response(null, {
      status: 200,
      headers: getCorsHeaders(),
    });
  }),
});

// Add images to project
http.route({
  path: "/projects/images",
  method: "POST",
  handler: httpAction(async (ctx, req) => {
    console.log("POST /projects/images route hit");

    const authResult = await verifyToken(ctx, req);
    if ("status" in authResult) {
      return new Response(JSON.stringify({ error: authResult.body }), {
        status: authResult.status,
        headers: getCorsHeaders(),
      });
    }

    try {
      const body = await req.json();
      const { projectId, imageStorageIds } = body;

      if (!projectId || !Array.isArray(imageStorageIds)) {
        return new Response(
          JSON.stringify({
            error: "projectId and imageStorageIds array are required",
          }),
          {
            status: 400,
            headers: getCorsHeaders(),
          }
        );
      }

      await ctx.runMutation(internal.projects.addProjectImages, {
        projectId,
        imageStorageIds,
      });

      return new Response(JSON.stringify({ success: true }), {
        status: 201,
        headers: getCorsHeaders(),
      });
    } catch (error) {
      console.error("Error adding project images:", error);
      return new Response(
        JSON.stringify({ error: "Failed to add project images" }),
        {
          status: 500,
          headers: getCorsHeaders(),
        }
      );
    }
  }),
});

// BARU: Menambahkan OPTIONS handler untuk rute dinamis /projects/images/{id}
http.route({
  pathPrefix: "/projects/images/",
  method: "OPTIONS",
  handler: httpAction(async (ctx, req) => {
    return new Response(null, {
      status: 200,
      headers: getCorsHeaders(),
    });
  }),
});

// Delete specific project image
http.route({
  pathPrefix: "/projects/images/",
  method: "DELETE",
  handler: httpAction(async (ctx, request) => {
    console.log("DELETE /projects/images/{id} route hit");

    const url = new URL(request.url);
    const pathSegments = url.pathname.split("/");
    const id = pathSegments[pathSegments.length - 1];

    if (!id) {
      return new Response(
        JSON.stringify({ error: "Image ID parameter is required" }),
        {
          status: 400,
          headers: getCorsHeaders(),
        }
      );
    }

    const authResult = await verifyToken(ctx, request);
    if ("status" in authResult) {
      return new Response(JSON.stringify({ error: authResult.body }), {
        status: authResult.status,
        headers: getCorsHeaders(),
      });
    }

    try {
      const imageId = id as Id<"projectImages">;
      await ctx.runMutation(internal.projects.deleteProjectImage, { imageId });

      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: getCorsHeaders(),
      });
    } catch (error) {
      console.error("Error deleting project image:", error);
      return new Response(
        JSON.stringify({ error: "Failed to delete project image" }),
        {
          status: 500,
          headers: getCorsHeaders(),
        }
      );
    }
  }),
});

// Reorder project images
http.route({
  path: "/projects/images/reorder",
  method: "OPTIONS",
  handler: httpAction(async (ctx, req) => {
    return new Response(null, {
      status: 200,
      headers: getCorsHeaders(),
    });
  }),
});

http.route({
  path: "/projects/images/reorder",
  method: "POST",
  handler: httpAction(async (ctx, req) => {
    console.log("POST /projects/images/reorder route hit");

    const authResult = await verifyToken(ctx, req);
    if ("status" in authResult) {
      return new Response(JSON.stringify({ error: authResult.body }), {
        status: authResult.status,
        headers: getCorsHeaders(),
      });
    }

    try {
      const body = await req.json();
      const { projectId, imageOrders } = body;

      if (!projectId || !Array.isArray(imageOrders)) {
        return new Response(
          JSON.stringify({
            error: "projectId and imageOrders array are required",
          }),
          {
            status: 400,
            headers: getCorsHeaders(),
          }
        );
      }

      await ctx.runMutation(internal.projects.reorderProjectImages, {
        projectId,
        imageOrders,
      });

      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: getCorsHeaders(),
      });
    } catch (error) {
      console.error("Error reordering project images:", error);
      return new Response(
        JSON.stringify({ error: "Failed to reorder project images" }),
        {
          status: 500,
          headers: getCorsHeaders(),
        }
      );
    }
  }),
});

// Delete multiple project images
http.route({
  path: "/projects/images/batch-delete",
  method: "OPTIONS",
  handler: httpAction(async (ctx, req) => {
    return new Response(null, {
      status: 200,
      headers: getCorsHeaders(),
    });
  }),
});

http.route({
  path: "/projects/images/batch-delete",
  method: "DELETE",
  handler: httpAction(async (ctx, req) => {
    console.log("DELETE /projects/images/batch-delete route hit");

    const authResult = await verifyToken(ctx, req);
    if ("status" in authResult) {
      return new Response(JSON.stringify({ error: authResult.body }), {
        status: authResult.status,
        headers: getCorsHeaders(),
      });
    }

    try {
      const body = await req.json();
      const { imageIds } = body;

      if (!Array.isArray(imageIds)) {
        return new Response(
          JSON.stringify({
            error: "imageIds array is required",
          }),
          {
            status: 400,
            headers: getCorsHeaders(),
          }
        );
      }

      await ctx.runMutation(internal.projects.deleteProjectImages, {
        imageIds,
      });

      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: getCorsHeaders(),
      });
    } catch (error) {
      console.error("Error batch deleting project images:", error);
      return new Response(
        JSON.stringify({ error: "Failed to batch delete project images" }),
        {
          status: 500,
          headers: getCorsHeaders(),
        }
      );
    }
  }),
});

// Get project image count
http.route({
  pathPrefix: "/projects/",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    const url = new URL(request.url);
    const pathSegments = url.pathname.split("/");

    if (pathSegments.length === 4 && pathSegments[3] === "image-count") {
      const projectId = pathSegments[2];

      if (!projectId) {
        return new Response(
          JSON.stringify({ error: "Project ID parameter is required" }),
          {
            status: 400,
            headers: getCorsHeaders(),
          }
        );
      }

      try {
        const count = await ctx.runQuery(api.projects.getProjectImageCount, {
          projectId: projectId as Id<"projects">,
        });

        return new Response(JSON.stringify({ count }), {
          status: 200,
          headers: getCorsHeaders(),
        });
      } catch (error) {
        console.error("Error getting project image count:", error);
        return new Response(
          JSON.stringify({ error: "Failed to get project image count" }),
          {
            status: 500,
            headers: getCorsHeaders(),
          }
        );
      }
    }

    return new Response(JSON.stringify({ error: "Route not found for GET" }), {
      status: 404,
      headers: getCorsHeaders(),
    });
  }),
});

// ===== ARTICLES UPLOAD URL ROUTES =====

// Articles upload URL - OPTIONS
http.route({
  path: "/articles/generateUploadUrl",
  method: "OPTIONS",
  handler: httpAction(async (ctx, req) => {
    return new Response(null, {
      status: 200,
      headers: getCorsHeaders(),
    });
  }),
});

// Articles upload URL - GET
http.route({
  path: "/articles/generateUploadUrl",
  method: "GET",
  handler: httpAction(async (ctx, req) => {
    console.log("articles generateUploadUrl route hit");

    const authResult = await verifyToken(ctx, req);
    if ("status" in authResult) {
      return new Response(JSON.stringify({ error: authResult.body }), {
        status: authResult.status,
        headers: getCorsHeaders(),
      });
    }

    try {
      const url = await ctx.runMutation(internal.articles.generateUploadUrl);
      console.log("Article Upload URL generated:", url);

      return new Response(JSON.stringify({ url }), {
        status: 200,
        headers: getCorsHeaders(),
      });
    } catch (error) {
      console.error("Error generating article upload URL:", error);
      return new Response(
        JSON.stringify({ error: "Failed to generate upload URL" }),
        {
          status: 500,
          headers: getCorsHeaders(),
        }
      );
    }
  }),
});

// ===== ARTICLE CATEGORIES ROUTES =====

// Article Categories - OPTIONS
http.route({
  path: "/articles/categories",
  method: "OPTIONS",
  handler: httpAction(async (ctx, req) => {
    return new Response(null, {
      status: 200,
      headers: getCorsHeaders(),
    });
  }),
});

// Create article category - POST
http.route({
  path: "/articles/categories",
  method: "POST",
  handler: httpAction(async (ctx, req) => {
    console.log("POST /articles/categories route hit");

    const authResult = await verifyToken(ctx, req);
    if ("status" in authResult) {
      return new Response(JSON.stringify({ error: authResult.body }), {
        status: authResult.status,
        headers: getCorsHeaders(),
      });
    }

    try {
      const body = await req.json();
      const { name, slug, description, color } = body;

      if (!name || !slug) {
        return new Response(
          JSON.stringify({ error: "Name and slug are required" }),
          {
            status: 400,
            headers: getCorsHeaders(),
          }
        );
      }

      const categoryId = await ctx.runMutation(
        internal.articles.createArticleCategory,
        {
          name,
          slug,
          description,
          color,
        }
      );

      return new Response(JSON.stringify({ success: true, categoryId }), {
        status: 201,
        headers: getCorsHeaders(),
      });
    } catch (error) {
      console.error("Error creating article category:", error);
      return new Response(
        JSON.stringify({ error: "Failed to create article category" }),
        {
          status: 500,
          headers: getCorsHeaders(),
        }
      );
    }
  }),
});

// Category reorder - OPTIONS
http.route({
  path: "/articles/categories/reorder",
  method: "OPTIONS",
  handler: httpAction(async (ctx, req) => {
    return new Response(null, {
      status: 200,
      headers: getCorsHeaders(),
    });
  }),
});

// Category reorder - POST
http.route({
  path: "/articles/categories/reorder",
  method: "POST",
  handler: httpAction(async (ctx, req) => {
    console.log("POST /articles/categories/reorder route hit");

    const authResult = await verifyToken(ctx, req);
    if ("status" in authResult) {
      return new Response(JSON.stringify({ error: authResult.body }), {
        status: authResult.status,
        headers: getCorsHeaders(),
      });
    }

    try {
      const { categoryOrders } = await req.json();

      if (!Array.isArray(categoryOrders)) {
        return new Response(
          JSON.stringify({ error: "categoryOrders must be an array" }),
          {
            status: 400,
            headers: getCorsHeaders(),
          }
        );
      }

      await ctx.runMutation(internal.articles.reorderCategories, {
        categoryOrders,
      });

      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: getCorsHeaders(),
      });
    } catch (error) {
      console.error("Error reordering categories:", error);
      return new Response(
        JSON.stringify({ error: "Failed to reorder categories" }),
        {
          status: 500,
          headers: getCorsHeaders(),
        }
      );
    }
  }),
});

// Dynamic category routes - OPTIONS
http.route({
  pathPrefix: "/articles/categories/",
  method: "OPTIONS",
  handler: httpAction(async (ctx, req) => {
    return new Response(null, {
      status: 200,
      headers: getCorsHeaders(),
    });
  }),
});

// Update category - PATCH
http.route({
  pathPrefix: "/articles/categories/",
  method: "PATCH",
  handler: httpAction(async (ctx, request) => {
    console.log("PATCH /articles/categories/{id} route hit");

    const url = new URL(request.url);
    const pathSegments = url.pathname.split("/");
    const id = pathSegments[pathSegments.length - 1];

    if (!id || id === "reorder") {
      return new Response(
        JSON.stringify({ error: "Category ID parameter is required" }),
        {
          status: 400,
          headers: getCorsHeaders(),
        }
      );
    }

    const authResult = await verifyToken(ctx, request);
    if ("status" in authResult) {
      return new Response(JSON.stringify({ error: authResult.body }), {
        status: authResult.status,
        headers: getCorsHeaders(),
      });
    }

    try {
      const categoryId = id as Id<"articleCategories">;
      const body = await request.json();
      const { name, slug, description, color } = body;

      if (!name || !slug) {
        return new Response(
          JSON.stringify({ error: "Name and slug are required" }),
          {
            status: 400,
            headers: getCorsHeaders(),
          }
        );
      }

      await ctx.runMutation(internal.articles.updateArticleCategory, {
        categoryId,
        name,
        slug,
        description,
        color,
      });

      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: getCorsHeaders(),
      });
    } catch (error) {
      console.error("Error updating article category:", error);
      return new Response(
        JSON.stringify({ error: "Failed to update article category" }),
        {
          status: 500,
          headers: getCorsHeaders(),
        }
      );
    }
  }),
});

// Delete category - DELETE
http.route({
  pathPrefix: "/articles/categories/",
  method: "DELETE",
  handler: httpAction(async (ctx, request) => {
    console.log("DELETE /articles/categories/{id} route hit");

    const url = new URL(request.url);
    const pathSegments = url.pathname.split("/");
    const id = pathSegments[pathSegments.length - 1];

    if (!id || id === "reorder") {
      return new Response(
        JSON.stringify({ error: "Category ID parameter is required" }),
        {
          status: 400,
          headers: getCorsHeaders(),
        }
      );
    }

    const authResult = await verifyToken(ctx, request);
    if ("status" in authResult) {
      return new Response(JSON.stringify({ error: authResult.body }), {
        status: authResult.status,
        headers: getCorsHeaders(),
      });
    }

    try {
      const categoryId = id as Id<"articleCategories">;
      await ctx.runMutation(internal.articles.deleteArticleCategory, {
        categoryId,
      });

      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: getCorsHeaders(),
      });
    } catch (error) {
      console.error("Error deleting article category:", error);
      return new Response(
        JSON.stringify({ error: "Failed to delete article category" }),
        {
          status: 500,
          headers: getCorsHeaders(),
        }
      );
    }
  }),
});

// ===== ARTICLE TAGS ROUTES =====

// Article Tags - OPTIONS
http.route({
  path: "/articles/tags",
  method: "OPTIONS",
  handler: httpAction(async (ctx, req) => {
    return new Response(null, {
      status: 200,
      headers: getCorsHeaders(),
    });
  }),
});

// Create article tag - POST
http.route({
  path: "/articles/tags",
  method: "POST",
  handler: httpAction(async (ctx, req) => {
    console.log("POST /articles/tags route hit");

    const authResult = await verifyToken(ctx, req);
    if ("status" in authResult) {
      return new Response(JSON.stringify({ error: authResult.body }), {
        status: authResult.status,
        headers: getCorsHeaders(),
      });
    }

    try {
      const body = await req.json();
      const { name, slug, color } = body;

      if (!name || !slug) {
        return new Response(
          JSON.stringify({ error: "Name and slug are required" }),
          {
            status: 400,
            headers: getCorsHeaders(),
          }
        );
      }

      const tagId = await ctx.runMutation(internal.articles.createArticleTag, {
        name,
        slug,
        color,
      });

      return new Response(JSON.stringify({ success: true, tagId }), {
        status: 201,
        headers: getCorsHeaders(),
      });
    } catch (error) {
      console.error("Error creating article tag:", error);
      return new Response(
        JSON.stringify({ error: "Failed to create article tag" }),
        {
          status: 500,
          headers: getCorsHeaders(),
        }
      );
    }
  }),
});

// Dynamic tag routes - OPTIONS
http.route({
  pathPrefix: "/articles/tags/",
  method: "OPTIONS",
  handler: httpAction(async (ctx, req) => {
    return new Response(null, {
      status: 200,
      headers: getCorsHeaders(),
    });
  }),
});

// Update tag - PATCH
http.route({
  pathPrefix: "/articles/tags/",
  method: "PATCH",
  handler: httpAction(async (ctx, request) => {
    console.log("PATCH /articles/tags/{id} route hit");

    const url = new URL(request.url);
    const pathSegments = url.pathname.split("/");
    const id = pathSegments[pathSegments.length - 1];

    if (!id) {
      return new Response(
        JSON.stringify({ error: "Tag ID parameter is required" }),
        {
          status: 400,
          headers: getCorsHeaders(),
        }
      );
    }

    const authResult = await verifyToken(ctx, request);
    if ("status" in authResult) {
      return new Response(JSON.stringify({ error: authResult.body }), {
        status: authResult.status,
        headers: getCorsHeaders(),
      });
    }

    try {
      const tagId = id as Id<"articleTags">;
      const body = await request.json();
      const { name, slug, color } = body;

      if (!name || !slug) {
        return new Response(
          JSON.stringify({ error: "Name and slug are required" }),
          {
            status: 400,
            headers: getCorsHeaders(),
          }
        );
      }

      await ctx.runMutation(internal.articles.updateArticleTag, {
        tagId,
        name,
        slug,
        color,
      });

      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: getCorsHeaders(),
      });
    } catch (error) {
      console.error("Error updating article tag:", error);
      return new Response(
        JSON.stringify({ error: "Failed to update article tag" }),
        {
          status: 500,
          headers: getCorsHeaders(),
        }
      );
    }
  }),
});

// Delete tag - DELETE
http.route({
  pathPrefix: "/articles/tags/",
  method: "DELETE",
  handler: httpAction(async (ctx, request) => {
    console.log("DELETE /articles/tags/{id} route hit");

    const url = new URL(request.url);
    const pathSegments = url.pathname.split("/");
    const id = pathSegments[pathSegments.length - 1];

    if (!id) {
      return new Response(
        JSON.stringify({ error: "Tag ID parameter is required" }),
        {
          status: 400,
          headers: getCorsHeaders(),
        }
      );
    }

    const authResult = await verifyToken(ctx, request);
    if ("status" in authResult) {
      return new Response(JSON.stringify({ error: authResult.body }), {
        status: authResult.status,
        headers: getCorsHeaders(),
      });
    }

    try {
      const tagId = id as Id<"articleTags">;
      await ctx.runMutation(internal.articles.deleteArticleTag, { tagId });

      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: getCorsHeaders(),
      });
    } catch (error) {
      console.error("Error deleting article tag:", error);
      return new Response(
        JSON.stringify({ error: "Failed to delete article tag" }),
        {
          status: 500,
          headers: getCorsHeaders(),
        }
      );
    }
  }),
});

// ===== ARTICLE SERIES ROUTES =====

// Article Series - OPTIONS
http.route({
  path: "/articles/series",
  method: "OPTIONS",
  handler: httpAction(async (ctx, req) => {
    return new Response(null, {
      status: 200,
      headers: getCorsHeaders(),
    });
  }),
});

// Create article series - POST
http.route({
  path: "/articles/series",
  method: "POST",
  handler: httpAction(async (ctx, req) => {
    console.log("POST /articles/series route hit");

    const authResult = await verifyToken(ctx, req);
    if ("status" in authResult) {
      return new Response(JSON.stringify({ error: authResult.body }), {
        status: authResult.status,
        headers: getCorsHeaders(),
      });
    }

    try {
      const body = await req.json();
      const { name, slug, description, coverImageStorageId } = body;

      if (!name || !slug) {
        return new Response(
          JSON.stringify({ error: "Name and slug are required" }),
          {
            status: 400,
            headers: getCorsHeaders(),
          }
        );
      }

      const seriesId = await ctx.runMutation(
        internal.articles.createArticleSeries,
        {
          name,
          slug,
          description,
          coverImageStorageId,
        }
      );

      return new Response(JSON.stringify({ success: true, seriesId }), {
        status: 201,
        headers: getCorsHeaders(),
      });
    } catch (error) {
      console.error("Error creating article series:", error);
      return new Response(
        JSON.stringify({ error: "Failed to create article series" }),
        {
          status: 500,
          headers: getCorsHeaders(),
        }
      );
    }
  }),
});

// Dynamic series routes - OPTIONS
http.route({
  pathPrefix: "/articles/series/",
  method: "OPTIONS",
  handler: httpAction(async (ctx, req) => {
    return new Response(null, {
      status: 200,
      headers: getCorsHeaders(),
    });
  }),
});

// Update series - PATCH
http.route({
  pathPrefix: "/articles/series/",
  method: "PATCH",
  handler: httpAction(async (ctx, request) => {
    console.log("PATCH /articles/series/{id} route hit");

    const url = new URL(request.url);
    const pathSegments = url.pathname.split("/");
    const id = pathSegments[pathSegments.length - 1];

    if (!id) {
      return new Response(
        JSON.stringify({ error: "Series ID parameter is required" }),
        {
          status: 400,
          headers: getCorsHeaders(),
        }
      );
    }

    const authResult = await verifyToken(ctx, request);
    if ("status" in authResult) {
      return new Response(JSON.stringify({ error: authResult.body }), {
        status: authResult.status,
        headers: getCorsHeaders(),
      });
    }

    try {
      const seriesId = id as Id<"articleSeries">;
      const body = await request.json();
      const { name, slug, description, coverImageStorageId, status } = body;

      if (!name || !slug || !status) {
        return new Response(
          JSON.stringify({ error: "Name, slug, and status are required" }),
          {
            status: 400,
            headers: getCorsHeaders(),
          }
        );
      }

      await ctx.runMutation(internal.articles.updateArticleSeries, {
        seriesId,
        name,
        slug,
        description,
        coverImageStorageId,
        status,
      });

      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: getCorsHeaders(),
      });
    } catch (error) {
      console.error("Error updating article series:", error);
      return new Response(
        JSON.stringify({ error: "Failed to update article series" }),
        {
          status: 500,
          headers: getCorsHeaders(),
        }
      );
    }
  }),
});

// Delete series - DELETE
http.route({
  pathPrefix: "/articles/series/",
  method: "DELETE",
  handler: httpAction(async (ctx, request) => {
    console.log("DELETE /articles/series/{id} route hit");

    const url = new URL(request.url);
    const pathSegments = url.pathname.split("/");
    const id = pathSegments[pathSegments.length - 1];

    if (!id) {
      return new Response(
        JSON.stringify({ error: "Series ID parameter is required" }),
        {
          status: 400,
          headers: getCorsHeaders(),
        }
      );
    }

    const authResult = await verifyToken(ctx, request);
    if ("status" in authResult) {
      return new Response(JSON.stringify({ error: authResult.body }), {
        status: authResult.status,
        headers: getCorsHeaders(),
      });
    }

    try {
      const seriesId = id as Id<"articleSeries">;
      await ctx.runMutation(internal.articles.deleteArticleSeries, {
        seriesId,
      });

      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: getCorsHeaders(),
      });
    } catch (error) {
      console.error("Error deleting article series:", error);
      return new Response(
        JSON.stringify({ error: "Failed to delete article series" }),
        {
          status: 500,
          headers: getCorsHeaders(),
        }
      );
    }
  }),
});

// ===== MAIN ARTICLES ROUTES =====

// Articles - OPTIONS
http.route({
  path: "/articles",
  method: "OPTIONS",
  handler: httpAction(async (ctx, req) => {
    return new Response(null, {
      status: 200,
      headers: getCorsHeaders(),
    });
  }),
});

// Create article - POST
http.route({
  path: "/articles",
  method: "POST",
  handler: httpAction(async (ctx, req) => {
    console.log("POST /articles route hit");

    const authResult = await verifyToken(ctx, req);
    if ("status" in authResult) {
      return new Response(JSON.stringify({ error: authResult.body }), {
        status: authResult.status,
        headers: getCorsHeaders(),
      });
    }

    try {
      const body = await req.json();
      const {
        title,
        slug,
        excerpt,
        content,
        categoryId,
        tags = [],
        metaDescription,
        featuredImageStorageId,
        status = "draft",
        publishedAt,
        scheduledAt,
        readingTime,
        techStack,
        imageStorageIds = [],
        imageCaptions = [],
        imageAltTexts = [],
      } = body;

      if (
        !title ||
        !slug ||
        !excerpt ||
        !content ||
        !categoryId ||
        !readingTime
      ) {
        return new Response(
          JSON.stringify({
            error:
              "Title, slug, excerpt, content, categoryId, and readingTime are required",
          }),
          {
            status: 400,
            headers: getCorsHeaders(),
          }
        );
      }

      // Create article
      const articleId = await ctx.runMutation(internal.articles.createArticle, {
        title,
        slug,
        excerpt,
        content,
        categoryId,
        tags,
        metaDescription,
        featuredImageStorageId,
        status,
        publishedAt,
        scheduledAt,
        readingTime,
        techStack,
      });

      // Add images if provided
      if (imageStorageIds.length > 0) {
        await ctx.runMutation(internal.articles.addArticleImages, {
          articleId,
          imageStorageIds,
          captions: imageCaptions,
          altTexts: imageAltTexts,
        });
      }

      return new Response(JSON.stringify({ success: true, articleId }), {
        status: 201,
        headers: getCorsHeaders(),
      });
    } catch (error) {
      console.error("Error creating article:", error);
      return new Response(
        JSON.stringify({ error: "Failed to create article" }),
        {
          status: 500,
          headers: getCorsHeaders(),
        }
      );
    }
  }),
});

// Dynamic article routes - OPTIONS (untuk /articles/{id})
http.route({
  pathPrefix: "/articles/",
  method: "OPTIONS",
  handler: httpAction(async (ctx, req) => {
    return new Response(null, {
      status: 200,
      headers: getCorsHeaders(),
    });
  }),
});

// Update article - PATCH
http.route({
  pathPrefix: "/articles/",
  method: "PATCH",
  handler: httpAction(async (ctx, request) => {
    console.log("PATCH /articles/{id} route hit");

    const url = new URL(request.url);
    const pathSegments = url.pathname.split("/");
    const id = pathSegments[pathSegments.length - 1];

    // Skip special paths
    const isSpecialPath =
      [
        "categories",
        "tags",
        "series",
        "images",
        "generateUploadUrl",
        "analytics",
        "views",
      ].includes(id) ||
      pathSegments.includes("categories") ||
      pathSegments.includes("tags") ||
      pathSegments.includes("series");

    if (!id || isSpecialPath) {
      return new Response(
        JSON.stringify({ error: "Not a valid article ID path for PATCH" }),
        {
          status: 404,
          headers: getCorsHeaders(),
        }
      );
    }

    const authResult = await verifyToken(ctx, request);
    if ("status" in authResult) {
      return new Response(JSON.stringify({ error: authResult.body }), {
        status: authResult.status,
        headers: getCorsHeaders(),
      });
    }

    try {
      const articleId = id as Id<"articles">;
      const body = await request.json();
      const {
        title,
        slug,
        excerpt,
        content,
        categoryId,
        tags = [],
        metaDescription,
        featuredImageStorageId,
        status,
        publishedAt,
        scheduledAt,
        readingTime,
        techStack,
        imageStorageIds,
        imageCaptions,
        imageAltTexts,
      } = body;

      if (
        !title ||
        !slug ||
        !excerpt ||
        !content ||
        !categoryId ||
        !readingTime ||
        !status
      ) {
        return new Response(
          JSON.stringify({
            error:
              "Title, slug, excerpt, content, categoryId, status, and readingTime are required",
          }),
          {
            status: 400,
            headers: getCorsHeaders(),
          }
        );
      }

      // Update article
      await ctx.runMutation(internal.articles.updateArticle, {
        articleId,
        title,
        slug,
        excerpt,
        content,
        categoryId,
        tags,
        metaDescription,
        featuredImageStorageId,
        status,
        publishedAt,
        scheduledAt,
        readingTime,
        techStack,
      });

      // Update images if provided
      if (imageStorageIds) {
        await ctx.runMutation(internal.articles.updateArticleImages, {
          articleId,
          imageStorageIds,
          captions: imageCaptions,
          altTexts: imageAltTexts,
        });
      }

      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: getCorsHeaders(),
      });
    } catch (error) {
      console.error("Error updating article:", error);
      return new Response(
        JSON.stringify({ error: "Failed to update article" }),
        {
          status: 500,
          headers: getCorsHeaders(),
        }
      );
    }
  }),
});

// Delete article - DELETE
http.route({
  pathPrefix: "/articles/",
  method: "DELETE",
  handler: httpAction(async (ctx, request) => {
    console.log("DELETE /articles/{id} route hit");

    const url = new URL(request.url);
    const pathSegments = url.pathname.split("/");
    const id = pathSegments[pathSegments.length - 1];

    // Skip special paths
    const isSpecialPath =
      [
        "categories",
        "tags",
        "series",
        "images",
        "generateUploadUrl",
        "analytics",
        "views",
      ].includes(id) ||
      pathSegments.includes("categories") ||
      pathSegments.includes("tags") ||
      pathSegments.includes("series");

    if (!id || isSpecialPath) {
      return new Response(
        JSON.stringify({ error: "Not a valid article ID path for DELETE" }),
        {
          status: 404,
          headers: getCorsHeaders(),
        }
      );
    }

    const authResult = await verifyToken(ctx, request);
    if ("status" in authResult) {
      return new Response(JSON.stringify({ error: authResult.body }), {
        status: authResult.status,
        headers: getCorsHeaders(),
      });
    }

    try {
      const articleId = id as Id<"articles">;
      await ctx.runMutation(internal.articles.deleteArticle, { articleId });

      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: getCorsHeaders(),
      });
    } catch (error) {
      console.error("Error deleting article:", error);
      return new Response(
        JSON.stringify({ error: "Failed to delete article" }),
        {
          status: 500,
          headers: getCorsHeaders(),
        }
      );
    }
  }),
});

// ===== ARTICLE IMAGES ROUTES =====

// Article Images - OPTIONS
http.route({
  path: "/articles/images",
  method: "OPTIONS",
  handler: httpAction(async (ctx, req) => {
    return new Response(null, {
      status: 200,
      headers: getCorsHeaders(),
    });
  }),
});

// Add images to article - POST
http.route({
  path: "/articles/images",
  method: "POST",
  handler: httpAction(async (ctx, req) => {
    console.log("POST /articles/images route hit");

    const authResult = await verifyToken(ctx, req);
    if ("status" in authResult) {
      return new Response(JSON.stringify({ error: authResult.body }), {
        status: authResult.status,
        headers: getCorsHeaders(),
      });
    }

    try {
      const body = await req.json();
      const { articleId, imageStorageIds, captions, altTexts } = body;

      if (!articleId || !Array.isArray(imageStorageIds)) {
        return new Response(
          JSON.stringify({
            error: "articleId and imageStorageIds array are required",
          }),
          {
            status: 400,
            headers: getCorsHeaders(),
          }
        );
      }

      await ctx.runMutation(internal.articles.addArticleImages, {
        articleId,
        imageStorageIds,
        captions,
        altTexts,
      });

      return new Response(JSON.stringify({ success: true }), {
        status: 201,
        headers: getCorsHeaders(),
      });
    } catch (error) {
      console.error("Error adding article images:", error);
      return new Response(
        JSON.stringify({ error: "Failed to add article images" }),
        {
          status: 500,
          headers: getCorsHeaders(),
        }
      );
    }
  }),
});

// Article Images reorder - OPTIONS
http.route({
  path: "/articles/images/reorder",
  method: "OPTIONS",
  handler: httpAction(async (ctx, req) => {
    return new Response(null, {
      status: 200,
      headers: getCorsHeaders(),
    });
  }),
});

// Reorder article images - POST
http.route({
  path: "/articles/images/reorder",
  method: "POST",
  handler: httpAction(async (ctx, req) => {
    console.log("POST /articles/images/reorder route hit");

    const authResult = await verifyToken(ctx, req);
    if ("status" in authResult) {
      return new Response(JSON.stringify({ error: authResult.body }), {
        status: authResult.status,
        headers: getCorsHeaders(),
      });
    }

    try {
      const body = await req.json();
      const { articleId, imageOrders } = body;

      if (!articleId || !Array.isArray(imageOrders)) {
        return new Response(
          JSON.stringify({
            error: "articleId and imageOrders array are required",
          }),
          {
            status: 400,
            headers: getCorsHeaders(),
          }
        );
      }

      await ctx.runMutation(internal.articles.reorderArticleImages, {
        articleId,
        imageOrders,
      });

      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: getCorsHeaders(),
      });
    } catch (error) {
      console.error("Error reordering article images:", error);
      return new Response(
        JSON.stringify({ error: "Failed to reorder article images" }),
        {
          status: 500,
          headers: getCorsHeaders(),
        }
      );
    }
  }),
});

// Dynamic article image routes - OPTIONS
http.route({
  pathPrefix: "/articles/images/",
  method: "OPTIONS",
  handler: httpAction(async (ctx, req) => {
    return new Response(null, {
      status: 200,
      headers: getCorsHeaders(),
    });
  }),
});

// Delete specific article image - DELETE
http.route({
  pathPrefix: "/articles/images/",
  method: "DELETE",
  handler: httpAction(async (ctx, request) => {
    console.log("DELETE /articles/images/{id} route hit");

    const url = new URL(request.url);
    const pathSegments = url.pathname.split("/");
    const id = pathSegments[pathSegments.length - 1];

    if (!id || id === "reorder") {
      return new Response(
        JSON.stringify({ error: "Image ID parameter is required" }),
        {
          status: 400,
          headers: getCorsHeaders(),
        }
      );
    }

    const authResult = await verifyToken(ctx, request);
    if ("status" in authResult) {
      return new Response(JSON.stringify({ error: authResult.body }), {
        status: authResult.status,
        headers: getCorsHeaders(),
      });
    }

    try {
      const imageId = id as Id<"articleImages">;
      await ctx.runMutation(internal.articles.deleteArticleImage, { imageId });

      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: getCorsHeaders(),
      });
    } catch (error) {
      console.error("Error deleting article image:", error);
      return new Response(
        JSON.stringify({ error: "Failed to delete article image" }),
        {
          status: 500,
          headers: getCorsHeaders(),
        }
      );
    }
  }),
});

// ===== SERIES ARTICLES MANAGEMENT ROUTES =====

// Series Articles - OPTIONS
http.route({
  path: "/articles/series-articles",
  method: "OPTIONS",
  handler: httpAction(async (ctx, req) => {
    return new Response(null, {
      status: 200,
      headers: getCorsHeaders(),
    });
  }),
});

// Add article to series - POST
http.route({
  path: "/articles/series-articles",
  method: "POST",
  handler: httpAction(async (ctx, req) => {
    console.log("POST /articles/series-articles route hit");

    const authResult = await verifyToken(ctx, req);
    if ("status" in authResult) {
      return new Response(JSON.stringify({ error: authResult.body }), {
        status: authResult.status,
        headers: getCorsHeaders(),
      });
    }

    try {
      const body = await req.json();
      const { seriesId, articleId, position } = body;

      if (!seriesId || !articleId || typeof position !== "number") {
        return new Response(
          JSON.stringify({
            error: "seriesId, articleId, and position are required",
          }),
          {
            status: 400,
            headers: getCorsHeaders(),
          }
        );
      }

      await ctx.runMutation(internal.articles.addArticleToSeries, {
        seriesId,
        articleId,
        position,
      });

      return new Response(JSON.stringify({ success: true }), {
        status: 201,
        headers: getCorsHeaders(),
      });
    } catch (error) {
      console.error("Error adding article to series:", error);
      return new Response(
        JSON.stringify({ error: "Failed to add article to series" }),
        {
          status: 500,
          headers: getCorsHeaders(),
        }
      );
    }
  }),
});

// Series Articles reorder - OPTIONS
http.route({
  path: "/articles/series-articles/reorder",
  method: "OPTIONS",
  handler: httpAction(async (ctx, req) => {
    return new Response(null, {
      status: 200,
      headers: getCorsHeaders(),
    });
  }),
});

// Reorder series articles - POST
http.route({
  path: "/articles/series-articles/reorder",
  method: "POST",
  handler: httpAction(async (ctx, req) => {
    console.log("POST /articles/series-articles/reorder route hit");

    const authResult = await verifyToken(ctx, req);
    if ("status" in authResult) {
      return new Response(JSON.stringify({ error: authResult.body }), {
        status: authResult.status,
        headers: getCorsHeaders(),
      });
    }

    try {
      const body = await req.json();
      const { seriesId, articleOrders } = body;

      if (!seriesId || !Array.isArray(articleOrders)) {
        return new Response(
          JSON.stringify({
            error: "seriesId and articleOrders array are required",
          }),
          {
            status: 400,
            headers: getCorsHeaders(),
          }
        );
      }

      await ctx.runMutation(internal.articles.reorderSeriesArticles, {
        seriesId,
        articleOrders,
      });

      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: getCorsHeaders(),
      });
    } catch (error) {
      console.error("Error reordering series articles:", error);
      return new Response(
        JSON.stringify({ error: "Failed to reorder series articles" }),
        {
          status: 500,
          headers: getCorsHeaders(),
        }
      );
    }
  }),
});

// Dynamic series article routes - OPTIONS
http.route({
  pathPrefix: "/articles/series-articles/",
  method: "OPTIONS",
  handler: httpAction(async (ctx, req) => {
    return new Response(null, {
      status: 200,
      headers: getCorsHeaders(),
    });
  }),
});

// Remove article from series - DELETE
http.route({
  pathPrefix: "/articles/series-articles/",
  method: "DELETE",
  handler: httpAction(async (ctx, request) => {
    console.log("DELETE /articles/series-articles/{articleId} route hit");

    const url = new URL(request.url);
    const pathSegments = url.pathname.split("/");
    const articleId = pathSegments[pathSegments.length - 1];

    if (!articleId || articleId === "reorder") {
      return new Response(
        JSON.stringify({ error: "Article ID parameter is required" }),
        {
          status: 400,
          headers: getCorsHeaders(),
        }
      );
    }

    const authResult = await verifyToken(ctx, request);
    if ("status" in authResult) {
      return new Response(JSON.stringify({ error: authResult.body }), {
        status: authResult.status,
        headers: getCorsHeaders(),
      });
    }

    try {
      await ctx.runMutation(internal.articles.removeArticleFromSeries, {
        articleId: articleId as Id<"articles">,
      });

      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: getCorsHeaders(),
      });
    } catch (error) {
      console.error("Error removing article from series:", error);
      return new Response(
        JSON.stringify({ error: "Failed to remove article from series" }),
        {
          status: 500,
          headers: getCorsHeaders(),
        }
      );
    }
  }),
});

// ===== ANALYTICS & VIEWS ROUTES =====

// Article Views - OPTIONS
http.route({
  path: "/articles/views",
  method: "OPTIONS",
  handler: httpAction(async (ctx, req) => {
    return new Response(null, {
      status: 200,
      headers: getCorsHeaders(),
    });
  }),
});

// Record article view - POST
http.route({
  path: "/articles/views",
  method: "POST",
  handler: httpAction(async (ctx, req) => {
    console.log("POST /articles/views route hit");

    try {
      const body = await req.json();
      const { articleId, userAgent, referrer } = body;

      if (!articleId) {
        return new Response(
          JSON.stringify({ error: "articleId is required" }),
          {
            status: 400,
            headers: getCorsHeaders(),
          }
        );
      }

      await ctx.runMutation(api.articles.recordArticleView, {
        articleId,
        userAgent,
        referrer,
      });

      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: getCorsHeaders(),
      });
    } catch (error) {
      console.error("Error recording article view:", error);
      return new Response(
        JSON.stringify({ error: "Failed to record article view" }),
        {
          status: 500,
          headers: getCorsHeaders(),
        }
      );
    }
  }),
});

// Article Analytics - OPTIONS
http.route({
  pathPrefix: "/articles/analytics/",
  method: "OPTIONS",
  handler: httpAction(async (ctx, req) => {
    return new Response(null, {
      status: 200,
      headers: getCorsHeaders(),
    });
  }),
});

// Get article analytics - GET
http.route({
  pathPrefix: "/articles/analytics/",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    console.log("GET /articles/analytics/{id} route hit");

    const url = new URL(request.url);
    const pathSegments = url.pathname.split("/");
    const articleId = pathSegments[pathSegments.length - 1];

    if (!articleId) {
      return new Response(
        JSON.stringify({ error: "Article ID parameter is required" }),
        {
          status: 400,
          headers: getCorsHeaders(),
        }
      );
    }

    const authResult = await verifyToken(ctx, request);
    if ("status" in authResult) {
      return new Response(JSON.stringify({ error: authResult.body }), {
        status: authResult.status,
        headers: getCorsHeaders(),
      });
    }

    try {
      const searchParams = url.searchParams;
      const days = searchParams.get("days");

      const analytics = await ctx.runQuery(api.articles.getArticleAnalytics, {
        articleId: articleId as Id<"articles">,
        days: days ? parseInt(days) : undefined,
      });

      return new Response(JSON.stringify(analytics), {
        status: 200,
        headers: getCorsHeaders(),
      });
    } catch (error) {
      console.error("Error getting article analytics:", error);
      return new Response(
        JSON.stringify({ error: "Failed to get article analytics" }),
        {
          status: 500,
          headers: getCorsHeaders(),
        }
      );
    }
  }),
});

// Popular Articles - OPTIONS
http.route({
  path: "/articles/popular",
  method: "OPTIONS",
  handler: httpAction(async (ctx, req) => {
    return new Response(null, {
      status: 200,
      headers: getCorsHeaders(),
    });
  }),
});

// Get popular articles - GET
http.route({
  path: "/articles/popular",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    console.log("GET /articles/popular route hit");

    try {
      const url = new URL(request.url);
      const searchParams = url.searchParams;
      const limit = searchParams.get("limit");
      const days = searchParams.get("days");

      const popularArticles = await ctx.runQuery(
        api.articles.getPopularArticles,
        {
          limit: limit ? parseInt(limit) : undefined,
          days: days ? parseInt(days) : undefined,
        }
      );

      return new Response(JSON.stringify(popularArticles), {
        status: 200,
        headers: getCorsHeaders(),
      });
    } catch (error) {
      console.error("Error getting popular articles:", error);
      return new Response(
        JSON.stringify({ error: "Failed to get popular articles" }),
        {
          status: 500,
          headers: getCorsHeaders(),
        }
      );
    }
  }),
});

// Article Statistics - OPTIONS
http.route({
  path: "/articles/stats",
  method: "OPTIONS",
  handler: httpAction(async (ctx, req) => {
    return new Response(null, {
      status: 200,
      headers: getCorsHeaders(),
    });
  }),
});

// Get article statistics - GET
http.route({
  path: "/articles/stats",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    console.log("GET /articles/stats route hit");

    const authResult = await verifyToken(ctx, request);
    if ("status" in authResult) {
      return new Response(JSON.stringify({ error: authResult.body }), {
        status: authResult.status,
        headers: getCorsHeaders(),
      });
    }

    try {
      const stats = await ctx.runQuery(api.articles.getArticleStats);

      return new Response(JSON.stringify(stats), {
        status: 200,
        headers: getCorsHeaders(),
      });
    } catch (error) {
      console.error("Error getting article stats:", error);
      return new Response(
        JSON.stringify({ error: "Failed to get article stats" }),
        {
          status: 500,
          headers: getCorsHeaders(),
        }
      );
    }
  }),
});

// Scheduled Articles - OPTIONS
http.route({
  path: "/articles/scheduled",
  method: "OPTIONS",
  handler: httpAction(async (ctx, req) => {
    return new Response(null, {
      status: 200,
      headers: getCorsHeaders(),
    });
  }),
});

// Get scheduled articles - GET
http.route({
  path: "/articles/scheduled",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    console.log("GET /articles/scheduled route hit");

    const authResult = await verifyToken(ctx, request);
    if ("status" in authResult) {
      return new Response(JSON.stringify({ error: authResult.body }), {
        status: authResult.status,
        headers: getCorsHeaders(),
      });
    }

    try {
      const scheduledArticles = await ctx.runQuery(
        api.articles.getScheduledArticles
      );

      return new Response(JSON.stringify(scheduledArticles), {
        status: 200,
        headers: getCorsHeaders(),
      });
    } catch (error) {
      console.error("Error getting scheduled articles:", error);
      return new Response(
        JSON.stringify({ error: "Failed to get scheduled articles" }),
        {
          status: 500,
          headers: getCorsHeaders(),
        }
      );
    }
  }),
});

// Recent Articles - OPTIONS
http.route({
  path: "/articles/recent",
  method: "OPTIONS",
  handler: httpAction(async (ctx, req) => {
    return new Response(null, {
      status: 200,
      headers: getCorsHeaders(),
    });
  }),
});

// Get recent articles - GET
http.route({
  path: "/articles/recent",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    console.log("GET /articles/recent route hit");

    try {
      const url = new URL(request.url);
      const searchParams = url.searchParams;
      const limit = searchParams.get("limit");

      const recentArticles = await ctx.runQuery(
        api.articles.getRecentArticles,
        {
          limit: limit ? parseInt(limit) : undefined,
        }
      );

      return new Response(JSON.stringify(recentArticles), {
        status: 200,
        headers: getCorsHeaders(),
      });
    } catch (error) {
      console.error("Error getting recent articles:", error);
      return new Response(
        JSON.stringify({ error: "Failed to get recent articles" }),
        {
          status: 500,
          headers: getCorsHeaders(),
        }
      );
    }
  }),
});

// Related Articles - OPTIONS
http.route({
  pathPrefix: "/articles/related/",
  method: "OPTIONS",
  handler: httpAction(async (ctx, req) => {
    return new Response(null, {
      status: 200,
      headers: getCorsHeaders(),
    });
  }),
});

// Get related articles - GET
http.route({
  pathPrefix: "/articles/related/",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    console.log("GET /articles/related/{id} route hit");

    const url = new URL(request.url);
    const pathSegments = url.pathname.split("/");
    const articleId = pathSegments[pathSegments.length - 1];

    if (!articleId) {
      return new Response(
        JSON.stringify({ error: "Article ID parameter is required" }),
        {
          status: 400,
          headers: getCorsHeaders(),
        }
      );
    }

    try {
      const searchParams = url.searchParams;
      const limit = searchParams.get("limit");

      const relatedArticles = await ctx.runQuery(
        api.articles.getRelatedArticles,
        {
          articleId: articleId as Id<"articles">,
          limit: limit ? parseInt(limit) : undefined,
        }
      );

      return new Response(JSON.stringify(relatedArticles), {
        status: 200,
        headers: getCorsHeaders(),
      });
    } catch (error) {
      console.error("Error getting related articles:", error);
      return new Response(
        JSON.stringify({ error: "Failed to get related articles" }),
        {
          status: 500,
          headers: getCorsHeaders(),
        }
      );
    }
  }),
});

// Search Articles - OPTIONS
http.route({
  path: "/articles/search",
  method: "OPTIONS",
  handler: httpAction(async (ctx, req) => {
    return new Response(null, {
      status: 200,
      headers: getCorsHeaders(),
    });
  }),
});

// Search articles - GET
http.route({
  path: "/articles/search",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    console.log("GET /articles/search route hit");

    try {
      const url = new URL(request.url);
      const searchParams = url.searchParams;
      const searchTerm = searchParams.get("q");

      if (!searchTerm) {
        return new Response(
          JSON.stringify({ error: "Search term 'q' parameter is required" }),
          {
            status: 400,
            headers: getCorsHeaders(),
          }
        );
      }

      const searchResults = await ctx.runQuery(api.articles.searchArticles, {
        searchTerm,
      });

      return new Response(JSON.stringify(searchResults), {
        status: 200,
        headers: getCorsHeaders(),
      });
    } catch (error) {
      console.error("Error searching articles:", error);
      return new Response(
        JSON.stringify({ error: "Failed to search articles" }),
        {
          status: 500,
          headers: getCorsHeaders(),
        }
      );
    }
  }),
});

// ===== UTILITY ROUTES FOR FILTERING =====

// Articles by Category - OPTIONS
http.route({
  path: "/articles/by-category",
  method: "OPTIONS",
  handler: httpAction(async (ctx, req) => {
    return new Response(null, {
      status: 200,
      headers: getCorsHeaders(),
    });
  }),
});

// Get articles by category - GET
http.route({
  path: "/articles/by-category",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    console.log("GET /articles/by-category route hit");

    try {
      const url = new URL(request.url);
      const searchParams = url.searchParams;
      const categoryId = searchParams.get("categoryId");
      const limit = searchParams.get("limit");
      const offset = searchParams.get("offset");

      if (!categoryId) {
        return new Response(
          JSON.stringify({ error: "categoryId parameter is required" }),
          {
            status: 400,
            headers: getCorsHeaders(),
          }
        );
      }

      const articles = await ctx.runQuery(api.articles.getArticlesByCategory, {
        categoryId: categoryId as Id<"articleCategories">,
        limit: limit ? parseInt(limit) : undefined,
        offset: offset ? parseInt(offset) : undefined,
      });

      return new Response(JSON.stringify(articles), {
        status: 200,
        headers: getCorsHeaders(),
      });
    } catch (error) {
      console.error("Error getting articles by category:", error);
      return new Response(
        JSON.stringify({ error: "Failed to get articles by category" }),
        {
          status: 500,
          headers: getCorsHeaders(),
        }
      );
    }
  }),
});

// Articles by Tag - OPTIONS
http.route({
  path: "/articles/by-tag",
  method: "OPTIONS",
  handler: httpAction(async (ctx, req) => {
    return new Response(null, {
      status: 200,
      headers: getCorsHeaders(),
    });
  }),
});

// Get articles by tag - GET
http.route({
  path: "/articles/by-tag",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    console.log("GET /articles/by-tag route hit");

    try {
      const url = new URL(request.url);
      const searchParams = url.searchParams;
      const tagId = searchParams.get("tagId");
      const limit = searchParams.get("limit");
      const offset = searchParams.get("offset");

      if (!tagId) {
        return new Response(
          JSON.stringify({ error: "tagId parameter is required" }),
          {
            status: 400,
            headers: getCorsHeaders(),
          }
        );
      }

      const articles = await ctx.runQuery(api.articles.getArticlesByTag, {
        tagId: tagId as Id<"articleTags">,
        limit: limit ? parseInt(limit) : undefined,
        offset: offset ? parseInt(offset) : undefined,
      });

      return new Response(JSON.stringify(articles), {
        status: 200,
        headers: getCorsHeaders(),
      });
    } catch (error) {
      console.error("Error getting articles by tag:", error);
      return new Response(
        JSON.stringify({ error: "Failed to get articles by tag" }),
        {
          status: 500,
          headers: getCorsHeaders(),
        }
      );
    }
  }),
});
export default http;
