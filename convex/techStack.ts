import { v } from "convex/values";
import { internalMutation, query } from "./_generated/server";
import type { Id } from "./_generated/dataModel";

// Ini sekarang internal, hanya bisa dipanggil dari backend (seperti dari http.ts)
export const generateUploadUrl = internalMutation(async (ctx) => {
  return await ctx.storage.generateUploadUrl();
});

// Ini juga internal
export const createTechStack = internalMutation({
  args: {
    name: v.string(),
    category: v.string(),
    storageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    const lastStack = await ctx.db
      .query("techStacks")
      .withIndex("by_position")
      .order("desc")
      .first();
    const newPosition = (lastStack?.position ?? -1) + 1;
    await ctx.db.insert("techStacks", {
      name: args.name,
      category: args.category,
      storageId: args.storageId,
      position: newPosition,
    });
  },
});

// Query ini tetap publik karena tidak mengubah data dan dibutuhkan untuk menampilkan
export const getTechStacks = query(async (ctx) => {
  const stacks = await ctx.db
    .query("techStacks")
    .withIndex("by_position")
    .order("asc")
    .collect();
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

// internalMutation
export const updateTechStackOrder = internalMutation({
  args: {
    orderedIds: v.array(v.id("techStacks")),
  },
  handler: async (ctx, args) => {
    await Promise.all(
      args.orderedIds.map((stackId, index) => {
        return ctx.db.patch(stackId, { position: index });
      })
    );
  },
});

// internalMutation dengan validasi
export const updateTechStack = internalMutation({
  args: {
    stackId: v.id("techStacks"),
    name: v.string(),
    category: v.string(),
    // Argumen storageId tetap opsional, ini sudah benar
    storageId: v.optional(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    const { stackId, name, category, storageId } = args;

    // 1. Siapkan data dasar untuk di-update
    const updateData: {
      name: string;
      category: string;
      storageId?: Id<"_storage">;
    } = {
      name,
      category,
    };

    // 2. Jika ada storageId BARU yang dikirim...
    if (storageId) {
      // Dapatkan data lama untuk menghapus gambar lama dari storage
      const existingStack = await ctx.db.get(stackId);
      if (existingStack) {
        await ctx.storage.delete(existingStack.storageId);
      }

      // Tambahkan storageId baru ke data yang akan di-update
      updateData.storageId = storageId;
    }

    // 3. Lakukan patch dengan data yang sudah disiapkan.
    // Jika storageId tidak ada di `updateData`, Convex akan membiarkan
    // nilai storageId yang ada di database tidak berubah.
    await ctx.db.patch(stackId, updateData);
  },
});

// Query ini juga tetap publik
export const getTechStackStats = query(async (ctx) => {
  const allStacks = await ctx.db.query("techStacks").collect();
  const totalStacks = allStacks.length;
  const stacksByCategory = allStacks.reduce(
    (acc, stack) => {
      const category = stack.category;
      if (!acc[category]) {
        acc[category] = 0;
      }
      acc[category]++;
      return acc;
    },
    {} as Record<string, number>
  );
  return {
    totalStacks,
    stacksByCategory,
  };
});

// internalMutation dengan validasi
export const deleteTechStack = internalMutation({
  args: {
    stackId: v.id("techStacks"),
  },
  handler: async (ctx, args) => {
    // 👇 VALIDASI DITAMBAHKAN
    const stackToDelete = await ctx.db.get(args.stackId);
    if (!stackToDelete) {
      throw new Error("Tech Stack tidak ditemukan untuk dihapus.");
    }

    await ctx.storage.delete(stackToDelete.storageId);
    await ctx.db.delete(args.stackId);

    const stacksToUpdate = await ctx.db
      .query("techStacks")
      .withIndex("by_position")
      .filter((q) => q.gt(q.field("position"), stackToDelete.position))
      .collect();

    await Promise.all(
      stacksToUpdate.map((stack) => {
        return ctx.db.patch(stack._id, { position: stack.position - 1 });
      })
    );
  },
});
