// convex/authActions.ts
"use node";

import { v } from "convex/values";
import { action } from "./_generated/server";
import jwt from "jsonwebtoken";

const jwtSecret = process.env.JWT_SECRET!;
if (!jwtSecret) {
  throw new Error(
    "Variabel environment JWT_SECRET tidak ditemukan. Periksa dashboard Convex Anda."
  );
}

export const verifyJWT = action({
  args: { token: v.string() },
  handler: async (ctx, { token }) => {
    try {
      const decoded = jwt.verify(token, jwtSecret);
      return { success: true, decoded };
    } catch (error) {
      return {
        success: false,
        error: `Token verification failed: ${(error as Error).message}`,
      };
    }
  },
});
