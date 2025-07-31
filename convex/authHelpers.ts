// convex/authHelpers.ts (Convex runtime - no "use node") - FIXED VERSION
import { v } from "convex/values";
import { internalMutation, internalQuery, QueryCtx } from "./_generated/server";
import type { Doc, Id } from "./_generated/dataModel";

// Helper types for cleaner code
type UserDoc = Doc<"users">;
type AuthenticatorDoc = Doc<"authenticators">;

// --- INTERNAL QUERIES ---

export const getUserByUsername = internalQuery({
  args: { username: v.string() },
  handler: async (
    ctx: QueryCtx,
    { username }: { username: string }
  ): Promise<UserDoc | null> => {
    return await ctx.db
      .query("users")
      .withIndex("by_username", (q) => q.eq("username", username))
      .unique();
  },
});

export const getUserById = internalQuery({
  args: { userId: v.id("users") },
  handler: async (
    ctx: QueryCtx,
    { userId }: { userId: Id<"users"> }
  ): Promise<UserDoc | null> => {
    return await ctx.db.get(userId);
  },
});

export const getAuthenticatorsByUserId = internalQuery({
  args: { userId: v.id("users") },
  handler: async (
    ctx: QueryCtx,
    { userId }: { userId: Id<"users"> }
  ): Promise<AuthenticatorDoc[]> => {
    return await ctx.db
      .query("authenticators")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();
  },
});

export const getAuthenticatorByCredentialID = internalQuery({
  args: { credentialID: v.string() }, // PERBAIKAN: Ubah ke string (base64url)
  handler: async (
    ctx: QueryCtx,
    { credentialID }: { credentialID: string } // PERBAIKAN: Ubah ke string
  ): Promise<AuthenticatorDoc | null> => {
    return await ctx.db
      .query("authenticators")
      .filter((q) => q.eq(q.field("credentialID"), credentialID))
      .first();
  },
});

// Query untuk menghitung jumlah user yang sudah menyelesaikan registrasi
export const getUserCount = internalQuery({
  args: {},
  handler: async (ctx: QueryCtx): Promise<number> => {
    const users = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("isRegistrationComplete"), true))
      .collect();
    return users.length;
  },
});

// --- INTERNAL MUTATIONS ---

export const createUser = internalMutation({
  args: {
    username: v.string(),
    isRegistrationComplete: v.optional(v.boolean()),
  },
  handler: async (ctx, { username, isRegistrationComplete = false }) => {
    return await ctx.db.insert("users", {
      username,
      isRegistrationComplete,
    });
  },
});

export const completeUserRegistration = internalMutation({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    await ctx.db.patch(userId, { isRegistrationComplete: true });
  },
});

export const deleteUser = internalMutation({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    // Hapus semua authenticators milik user ini
    const authenticators = await ctx.db
      .query("authenticators")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();

    for (const auth of authenticators) {
      await ctx.db.delete(auth._id);
    }

    // Hapus user
    await ctx.db.delete(userId);
  },
});

export const setUserCurrentChallenge = internalMutation({
  args: { userId: v.id("users"), challenge: v.optional(v.string()) },
  handler: async (ctx, { userId, challenge }) => {
    await ctx.db.patch(userId, { currentChallenge: challenge });
  },
});

export const createAuthenticator = internalMutation({
  args: {
    userId: v.id("users"),
    credentialID: v.string(), // PERBAIKAN: Ubah ke string (base64url)
    credentialPublicKey: v.string(), // PERBAIKAN: Ubah ke string (base64)
    counter: v.number(),
    transports: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("authenticators", args);
  },
});

export const updateAuthenticatorCounter = internalMutation({
  args: { authenticatorId: v.id("authenticators"), newCounter: v.number() },
  handler: async (ctx, { authenticatorId, newCounter }) => {
    await ctx.db.patch(authenticatorId, { counter: newCounter });
  },
});
