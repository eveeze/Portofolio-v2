// convex/schema.ts - FIXED VERSION
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    username: v.string(),
    currentChallenge: v.optional(v.string()),
    isRegistrationComplete: v.optional(v.boolean()), // Flag untuk status registrasi
  }).index("by_username", ["username"]),

  authenticators: defineTable({
    userId: v.id("users"),
    credentialID: v.string(), // PERBAIKAN: Ubah ke string (base64url format)
    credentialPublicKey: v.string(), // PERBAIKAN: Ubah ke string (base64 format)
    counter: v.number(),
    transports: v.optional(v.array(v.string())),
  }).index("by_userId", ["userId"]),
});
