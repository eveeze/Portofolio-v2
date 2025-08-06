// /convex/authHelpers.ts
import { v } from "convex/values";
import { internalMutation, internalQuery, QueryCtx } from "./_generated/server";
import type { Doc, Id } from "./_generated/dataModel";

// --- INTERNAL QUERIES ---

export const getUserByUsername = internalQuery({
  args: { username: v.string() },
  handler: async (ctx, { username }) => {
    return await ctx.db
      .query("users")
      .withIndex("by_username", (q) => q.eq("username", username))
      .unique();
  },
});

export const getUserById = internalQuery({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    return await ctx.db.get(userId);
  },
});

export const getAuthenticatorsByUserId = internalQuery({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    return await ctx.db
      .query("authenticators")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();
  },
});

export const getAuthenticatorByCredentialID = internalQuery({
  args: { credentialID: v.string() },
  handler: async (ctx, { credentialID }) => {
    return await ctx.db
      .query("authenticators")
      .withIndex("by_credentialID", (q) => q.eq("credentialID", credentialID))
      .unique();
  },
});

export const getUserCount = internalQuery({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("isRegistrationComplete"), true))
      .collect();
    return users.length;
  },
});

export const getUserByChallenge = internalQuery({
  args: { challenge: v.string() },
  handler: async (ctx, { challenge }) => {
    if (!challenge) return null;
    return await ctx.db
      .query("users")
      .withIndex("by_challenge", (q) => q.eq("currentChallenge", challenge))
      .unique();
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
    // Hanya hapus challenge, JANGAN hapus webauthnUserID
    await ctx.db.patch(userId, {
      isRegistrationComplete: true,
      currentChallenge: undefined,
    });
  },
});

export const deleteUser = internalMutation({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const authenticators = await ctx.db
      .query("authenticators")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();
    for (const auth of authenticators) {
      await ctx.db.delete(auth._id);
    }
    await ctx.db.delete(userId);
  },
});

export const setUserCurrentChallenge = internalMutation({
  args: {
    userId: v.id("users"),
    challenge: v.optional(v.string()),
    webauthnUserID: v.optional(v.string()),
  },
  handler: async (ctx, { userId, challenge, webauthnUserID }) => {
    const patchData: { currentChallenge?: string; webauthnUserID?: string } =
      {};
    if (challenge !== undefined) {
      patchData.currentChallenge = challenge;
    }
    if (webauthnUserID !== undefined) {
      patchData.webauthnUserID = webauthnUserID;
    }
    await ctx.db.patch(userId, patchData);
  },
});

export const createAuthenticator = internalMutation({
  args: {
    userId: v.id("users"),
    webauthnUserID: v.string(),
    credentialID: v.string(),
    credentialPublicKey: v.string(),
    counter: v.number(),
    deviceType: v.string(),
    backedUp: v.boolean(),
    transports: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("authenticators", {
      userId: args.userId,
      webauthnUserID: args.webauthnUserID,
      credentialID: args.credentialID,
      credentialPublicKey: args.credentialPublicKey,
      counter: args.counter,
      deviceType: args.deviceType,
      backedUp: args.backedUp,
      transports: args.transports || [],
    });
  },
});

export const updateAuthenticatorCounter = internalMutation({
  args: { authenticatorId: v.id("authenticators"), newCounter: v.number() },
  handler: async (ctx, { authenticatorId, newCounter }) => {
    await ctx.db.patch(authenticatorId, { counter: newCounter });
  },
});
