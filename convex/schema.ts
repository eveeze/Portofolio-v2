// convex/schema.ts

import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    username: v.string(),
    isRegistrationComplete: v.boolean(),
    currentChallenge: v.optional(v.string()),
    // PASTIKAN BARIS INI ADA
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
  }).index("by_category", ["category"]),
});
