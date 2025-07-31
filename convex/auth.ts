// convex/auth.ts (Node.js actions only) - FIXED VERSION
"use node";

import { v } from "convex/values";
import { internal } from "./_generated/api";
import { action, ActionCtx } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import jwt from "jsonwebtoken";
import { Crypto } from "@peculiar/webcrypto";

// Polyfill globalThis.crypto if it doesn't exist
if (!globalThis.crypto) {
  globalThis.crypto = new Crypto();
}

import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
} from "@simplewebauthn/server";
import type {
  VerifiedRegistrationResponse,
  VerifiedAuthenticationResponse,
} from "@simplewebauthn/server";
import type {
  RegistrationResponseJSON,
  AuthenticationResponseJSON,
  AuthenticatorTransport,
} from "@simplewebauthn/types";

// --- CONSTANTS ---
const rpID = process.env.RP_ID!;
const rpOrigin = process.env.RP_ORIGIN!;
const jwtSecret = process.env.JWT_SECRET!;

// TAMBAHAN: Daftar username yang diizinkan mendaftar
const ALLOWED_USERNAMES = ["admin", "owner"];
const MAX_USERS = 2;

if (!rpID || !rpOrigin || !jwtSecret) {
  throw new Error(
    "Missing environment variables for WebAuthn or JWT. Check your Convex dashboard."
  );
}

// Store untuk menyimpan mapping challenge ke userId sementara
const challengeToUserMap = new Map<string, Id<"users">>();

// Cleanup function untuk membersihkan expired challenges
const cleanupExpiredChallenges = () => {
  // Implement basic cleanup - in production you'd want more sophisticated approach
  if (challengeToUserMap.size > 100) {
    const keys = Array.from(challengeToUserMap.keys());
    // Remove oldest half
    for (let i = 0; i < keys.length / 2; i++) {
      challengeToUserMap.delete(keys[i]);
    }
  }
};

// TAMBAHAN: Action untuk cek apakah registrasi masih diizinkan
export const checkRegistrationAllowed = action({
  args: { username: v.string() },
  handler: async (
    ctx: ActionCtx,
    { username }: { username: string }
  ): Promise<{
    allowed: boolean;
    reason: string;
  }> => {
    try {
      const userCount: number = await ctx.runQuery(
        internal.authHelpers.getUserCount
      );
      const isUsernameAllowed: boolean = ALLOWED_USERNAMES.includes(username);
      const hasReachedMaxUsers: boolean = userCount >= MAX_USERS;

      const existingUser = await ctx.runQuery(
        internal.authHelpers.getUserByUsername,
        { username }
      );

      return {
        allowed: isUsernameAllowed && !hasReachedMaxUsers && !existingUser,
        reason: !isUsernameAllowed
          ? "Username not in allowed list"
          : hasReachedMaxUsers
            ? "Maximum users reached"
            : existingUser
              ? "Username already exists"
              : "Registration allowed",
      };
    } catch (error) {
      console.error("Error checking registration allowed:", error);
      return {
        allowed: false,
        reason: "Error checking registration status",
      };
    }
  },
});

export const generateRegistrationOptionsAction = action({
  args: { username: v.string() },
  handler: async (ctx: ActionCtx, { username }: { username: string }) => {
    try {
      // TAMBAHAN: Cek apakah username diizinkan
      if (!ALLOWED_USERNAMES.includes(username)) {
        throw new Error(
          `Registration is not allowed for username: ${username}. Only specific users can register.`
        );
      }

      // TAMBAHAN: Cek jumlah user yang sudah terdaftar
      const userCount: number = await ctx.runQuery(
        internal.authHelpers.getUserCount
      );
      if (userCount >= MAX_USERS) {
        throw new Error(
          `Maximum number of users (${MAX_USERS}) has been reached. No new registrations allowed.`
        );
      }

      const existingUser = await ctx.runQuery(
        internal.authHelpers.getUserByUsername,
        {
          username,
        }
      );
      if (existingUser) {
        throw new Error(`Username ${username} is already taken.`);
      }

      // Buat user dengan status pending
      const userId = await ctx.runMutation(internal.authHelpers.createUser, {
        username,
        isRegistrationComplete: false, // Tambahan: flag untuk status registrasi
      });

      const options = await generateRegistrationOptions({
        rpName: "My Portfolio Admin",
        rpID,
        userID: new TextEncoder().encode(userId),
        userName: username,
        userDisplayName: username,
        attestationType: "none",
        excludeCredentials: [],
        authenticatorSelection: {
          residentKey: "preferred",
          userVerification: "preferred",
          authenticatorAttachment: "cross-platform", // Ubah ke cross-platform untuk compatibility lebih baik
        },
        supportedAlgorithmIDs: [-7, -257], // ES256 and RS256
        timeout: 60000, // 60 detik timeout
      });

      // Simpan mapping challenge ke userId
      challengeToUserMap.set(options.challenge, userId);

      await ctx.runMutation(internal.authHelpers.setUserCurrentChallenge, {
        userId,
        challenge: options.challenge,
      });

      console.log(
        `Registration options generated for user ${username} with ID ${userId}`
      );

      // Cleanup expired challenges
      cleanupExpiredChallenges();

      return options;
    } catch (error) {
      console.error("Error generating registration options:", error);
      throw error;
    }
  },
});

export const verifyRegistrationAction = action({
  args: { response: v.any() },
  handler: async (
    ctx: ActionCtx,
    { response }: { response: RegistrationResponseJSON }
  ): Promise<{ verified: boolean }> => {
    try {
      console.log("Starting registration verification...");

      // Decode the challenge dari response untuk mendapatkan userId
      const clientDataJSON = JSON.parse(
        Buffer.from(response.response.clientDataJSON, "base64url").toString(
          "utf8"
        )
      );
      const challenge = clientDataJSON.challenge;

      console.log("Challenge from response:", challenge);

      // Dapatkan userId dari mapping challenge
      const userId = challengeToUserMap.get(challenge);
      if (!userId) {
        console.error(
          "Registration session not found for challenge:",
          challenge
        );
        throw new Error("Registration session not found or expired.");
      }

      console.log("Found user ID:", userId);

      const user = await ctx.runQuery(internal.authHelpers.getUserById, {
        userId,
      });
      if (!user || !user.currentChallenge) {
        console.error("User or challenge not found:", { user, userId });
        throw new Error("User or registration challenge not found.");
      }

      console.log("User found, verifying registration...");

      let verification: VerifiedRegistrationResponse;
      try {
        verification = await verifyRegistrationResponse({
          response,
          expectedChallenge: user.currentChallenge,
          expectedOrigin: rpOrigin,
          expectedRPID: rpID,
          requireUserVerification: false,
        });

        console.log("Verification result:", verification.verified);
      } catch (error) {
        console.error("Verification failed:", error);
        // Hapus mapping jika verifikasi gagal
        challengeToUserMap.delete(challenge);
        // Hapus user yang gagal registrasi
        await ctx.runMutation(internal.authHelpers.deleteUser, {
          userId,
        });
        throw new Error(
          `Registration verification failed: ${(error as Error).message}`
        );
      }

      const { verified, registrationInfo } = verification;
      if (verified && registrationInfo) {
        console.log("Registration verified, saving authenticator...");

        const { credential } = registrationInfo;
        const credentialID = credential.id;
        const credentialPublicKey = credential.publicKey;
        const counter = credential.counter;

        // PERBAIKAN: Simpan credential dalam format yang konsisten
        const credentialIDBase64 =
          Buffer.from(credentialID).toString("base64url");
        const credentialPublicKeyBase64 =
          Buffer.from(credentialPublicKey).toString("base64");

        // Simpan authenticator dengan format base64 untuk konsistensi
        await ctx.runMutation(internal.authHelpers.createAuthenticator, {
          userId: user._id,
          credentialID: credentialIDBase64, // Simpan sebagai base64url string
          credentialPublicKey: credentialPublicKeyBase64, // Simpan sebagai base64 string
          counter,
          transports: response.response.transports as AuthenticatorTransport[],
        });

        // Update user sebagai registered
        await ctx.runMutation(internal.authHelpers.completeUserRegistration, {
          userId: user._id,
        });

        // Clear challenge
        await ctx.runMutation(internal.authHelpers.setUserCurrentChallenge, {
          userId: user._id,
          challenge: undefined,
        });

        // Hapus mapping setelah berhasil
        challengeToUserMap.delete(challenge);

        console.log(
          "Registration completed successfully for user:",
          user.username
        );
      } else {
        console.error("Registration verification failed");
        // Hapus user yang gagal registrasi
        await ctx.runMutation(internal.authHelpers.deleteUser, {
          userId,
        });
        challengeToUserMap.delete(challenge);
      }

      return { verified };
    } catch (error) {
      console.error("Error in verifyRegistrationAction:", error);
      throw error;
    }
  },
});

export const generateLoginOptionsAction = action({
  args: { username: v.string() },
  handler: async (ctx: ActionCtx, { username }: { username: string }) => {
    try {
      console.log("Generating login options for username:", username);

      const user = await ctx.runQuery(internal.authHelpers.getUserByUsername, {
        username,
      });
      if (!user) {
        console.log("User not found:", username);
        throw new Error("User not found.");
      }

      console.log(
        "User found:",
        user._id,
        "Registration complete:",
        user.isRegistrationComplete
      );

      // Cek apakah user sudah menyelesaikan registrasi
      if (!user.isRegistrationComplete) {
        throw new Error(
          "User registration is not complete. Please complete registration first."
        );
      }

      const userAuthenticators = await ctx.runQuery(
        internal.authHelpers.getAuthenticatorsByUserId,
        { userId: user._id }
      );

      console.log("Authenticators found:", userAuthenticators.length);

      if (userAuthenticators.length === 0) {
        throw new Error("No authenticators found for this user.");
      }

      // PERBAIKAN: Ensure credential ID is in proper format for allowCredentials
      const allowCredentials = userAuthenticators.map((auth) => {
        console.log(
          "Processing authenticator credential ID:",
          auth.credentialID
        );

        // Ensure the credentialID is in base64url format (as string)
        // The SimpleWebAuthn library expects string format for the JSON,
        // but will convert it internally to Uint8Array
        return {
          id: auth.credentialID, // Keep as base64url string
          type: "public-key" as const,
          transports: auth.transports as AuthenticatorTransport[],
        };
      });

      console.log("Allow credentials:", allowCredentials);

      const options = await generateAuthenticationOptions({
        rpID,
        allowCredentials,
        userVerification: "preferred",
        timeout: 60000,
      });

      console.log("Generated authentication options:", {
        ...options,
        // Don't log the full challenge for security
        challenge: options.challenge ? "***CHALLENGE_SET***" : "NO_CHALLENGE",
      });

      await ctx.runMutation(internal.authHelpers.setUserCurrentChallenge, {
        userId: user._id,
        challenge: options.challenge,
      });

      console.log("Login options generated successfully");

      // Cleanup expired challenges
      cleanupExpiredChallenges();

      return options;
    } catch (error) {
      console.error("Error generating login options:", error);
      throw error;
    }
  },
});

export const verifyLoginAction = action({
  args: { response: v.any() },
  handler: async (
    ctx: ActionCtx,
    { response }: { response: AuthenticationResponseJSON }
  ): Promise<{ verified: boolean; token: string | null }> => {
    try {
      console.log("Starting login verification...");
      console.log("Response rawId:", response.rawId);

      // PERBAIKAN: Gunakan rawId langsung sebagai base64url string
      const credentialID = response.rawId;

      console.log("Looking for authenticator with credentialID:", credentialID);

      const authenticator = await ctx.runQuery(
        internal.authHelpers.getAuthenticatorByCredentialID,
        { credentialID }
      );

      if (!authenticator) {
        console.error(
          "Authenticator not found for credentialID:",
          credentialID
        );
        throw new Error("Authenticator is not registered.");
      }

      console.log("Authenticator found:", authenticator._id);

      const user = await ctx.runQuery(internal.authHelpers.getUserById, {
        userId: authenticator.userId,
      });
      if (!user || !user.currentChallenge) {
        console.error("User or challenge not found");
        throw new Error("User or login challenge not found.");
      }

      console.log("User found, verifying authentication...");

      let verification: VerifiedAuthenticationResponse;
      try {
        verification = await verifyAuthenticationResponse({
          response,
          expectedChallenge: user.currentChallenge,
          expectedOrigin: rpOrigin,
          expectedRPID: rpID,
          credential: {
            id: authenticator.credentialID, // Sudah dalam format base64url
            publicKey: Buffer.from(authenticator.credentialPublicKey, "base64"), // Convert dari base64 ke Uint8Array
            counter: authenticator.counter,
            transports: authenticator.transports as
              | AuthenticatorTransport[]
              | undefined,
          },
          requireUserVerification: false,
        });

        console.log(
          "Authentication verification result:",
          verification.verified
        );
      } catch (error) {
        console.error("Verification error:", error);

        // Clear the challenge on verification failure
        await ctx.runMutation(internal.authHelpers.setUserCurrentChallenge, {
          userId: user._id,
          challenge: undefined,
        });

        throw new Error(
          `Login verification failed: ${(error as Error).message}`
        );
      }

      const { verified, authenticationInfo } = verification;
      let token = null;

      if (verified) {
        console.log(
          "Authentication successful, updating counter and generating token"
        );

        await ctx.runMutation(internal.authHelpers.updateAuthenticatorCounter, {
          authenticatorId: authenticator._id,
          newCounter: authenticationInfo.newCounter,
        });

        await ctx.runMutation(internal.authHelpers.setUserCurrentChallenge, {
          userId: user._id,
          challenge: undefined,
        });

        token = jwt.sign(
          { userId: user._id, username: user.username },
          jwtSecret,
          { expiresIn: "1d" }
        );

        console.log("Token generated successfully");
      } else {
        // Clear challenge even if verification failed
        await ctx.runMutation(internal.authHelpers.setUserCurrentChallenge, {
          userId: user._id,
          challenge: undefined,
        });
      }

      return { verified, token };
    } catch (error) {
      console.error("Error in verifyLoginAction:", error);
      throw error;
    }
  },
});
