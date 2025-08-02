import { v } from "convex/values";
import { mutation, query, action } from "./_generated/server";
import type { Id } from "./_generated/dataModel";

// Mutation

// membuat url untuk mengunggah file
export const generateUploadUrl = mutation(async (ctx) => {
  return await ctx.storage.generateUploadUrl();
});

// membuat tech stack
export const createTechStack = mutation({
  args: {
    name: v.string(),
    category: v.string(),
    storageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("techStacks", {
      name: args.name,
      category: args.category,
      storageId: args.storageId,
    });
  },
});

// get tech stacks
export const getTechStacks = query(async (ctx) => {
  const stacks = await ctx.db.query("techStacks").collect();
  const stacksWithImageUrls = await Promise.all(
    stacks.map(async (stack) => {
      const imageUrl = await ctx.storage.getUrl(stack.storageId);
      return {
        ...stack,
        imageUrl,
      };
    })
  );
  return stacksWithImageUrls;
});

// update tech stack
export const updateTechStack = mutation({
  args: {
    stackId: v.id("techStacks"),
    name: v.string(),
    category: v.string(),
    storageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    if (args.storageId) {
      const oldStack = await ctx.db.get(args.stackId);
      if (!oldStack) {
        throw new Error("Tech Stack tidak ditemukan");
      }
      await ctx.storage.delete(oldStack.storageId);

      await ctx.db.patch(args.stackId, {
        name: args.name,
        category: args.category,
        storageId: args.storageId,
      });
    } else {
      await ctx.db.patch(args.stackId, {
        name: args.name,
        category: args.category,
      });
    }
  },
});

// delete tech stack
export const deleteTechStack = mutation({
  args: {
    stackId: v.id("techStacks"),
    storageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    await ctx.storage.delete(args.storageId);
    await ctx.db.delete(args.stackId);
  },
});
