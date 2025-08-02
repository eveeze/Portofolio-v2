// convex/auth.ts
"use node";

import { v } from "convex/values";
import { internal } from "./_generated/api";
import { action, ActionCtx } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import jwt from "jsonwebtoken";
import { Crypto } from "@peculiar/webcrypto";

// Polyfill
if (!globalThis.crypto) {
  globalThis.crypto = new Crypto() as any;
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
  RegistrationResponseJSON,
  AuthenticationResponseJSON,
  AuthenticatorTransportFuture,
} from "@simplewebauthn/server";

// --- KONSTANTA ---
const rpID = process.env.RP_ID!;
const rpOrigin = process.env.RP_ORIGIN!;
const jwtSecret = process.env.JWT_SECRET!;
const ALLOWED_USERNAMES = ["admin", "owner"];
const MAX_USERS = 2;

if (!rpID || !rpOrigin || !jwtSecret) {
  throw new Error(
    "Variabel environment untuk WebAuthn atau JWT tidak ditemukan. Periksa dashboard Convex Anda."
  );
}

// --- ACTIONS ---

export const generateRegistrationOptionsAction = action({
  args: { username: v.string() },
  handler: async (ctx: ActionCtx, { username }: { username: string }) => {
    // Logika pengecekan registrasi yang sudah digabung
    const userCount: number = await ctx.runQuery(
      internal.authHelpers.getUserCount
    );
    const isUsernameAllowed: boolean = ALLOWED_USERNAMES.includes(username);
    const hasReachedMaxUsers: boolean = userCount >= MAX_USERS;
    const existingUser = await ctx.runQuery(
      internal.authHelpers.getUserByUsername,
      { username }
    );

    const isAllowed = isUsernameAllowed && !hasReachedMaxUsers && !existingUser;

    if (!isAllowed) {
      const reason = !isUsernameAllowed
        ? "Username tidak ada dalam daftar yang diizinkan"
        : hasReachedMaxUsers
          ? "Jumlah maksimum pengguna telah tercapai"
          : existingUser
            ? "Username sudah ada"
            : "Registrasi tidak diizinkan";
      throw new Error(`Registrasi tidak diizinkan: ${reason}`);
    }

    const userId = await ctx.runMutation(internal.authHelpers.createUser, {
      username,
      isRegistrationComplete: false,
    });

    const userAuthenticators = await ctx.runQuery(
      internal.authHelpers.getAuthenticatorsByUserId,
      { userId }
    );

    const options = await generateRegistrationOptions({
      rpName: "Portfolio Admin",
      rpID,
      userName: username,
      userDisplayName: username,
      attestationType: "none",
      excludeCredentials: userAuthenticators.map((auth) => ({
        id: auth.credentialID,
        type: "public-key",
        transports: auth.transports as AuthenticatorTransportFuture[],
      })),
      authenticatorSelection: {
        residentKey: "preferred",
        userVerification: "preferred",
      },
      supportedAlgorithmIDs: [-7, -257],
    });

    await ctx.runMutation(internal.authHelpers.setUserCurrentChallenge, {
      userId,
      challenge: options.challenge,
      webauthnUserID: options.user.id,
    });

    return options;
  },
});

export const verifyRegistrationAction = action({
  args: { response: v.any() },
  handler: async (
    ctx: ActionCtx,
    { response }: { response: RegistrationResponseJSON }
  ): Promise<{ verified: boolean }> => {
    const clientData = JSON.parse(
      Buffer.from(response.response.clientDataJSON, "base64url").toString()
    );
    const challenge = clientData.challenge;

    const user = await ctx.runQuery(internal.authHelpers.getUserByChallenge, {
      challenge,
    });

    if (!user || !user.currentChallenge || !user.webauthnUserID) {
      throw new Error(
        "User atau challenge tidak valid, mungkin sudah kedaluwarsa."
      );
    }

    let verification: VerifiedRegistrationResponse;
    try {
      verification = await verifyRegistrationResponse({
        response,
        expectedChallenge: user.currentChallenge,
        expectedOrigin: rpOrigin,
        expectedRPID: rpID,
        requireUserVerification: false,
      });
    } catch (error) {
      await ctx.runMutation(internal.authHelpers.deleteUser, {
        userId: user._id,
      });
      throw new Error(
        `Verifikasi registrasi gagal: ${(error as Error).message}`
      );
    }

    const { verified, registrationInfo } = verification;
    if (verified && registrationInfo) {
      const { credential, credentialDeviceType, credentialBackedUp } =
        registrationInfo;
      const {
        id: credentialID,
        publicKey: credentialPublicKey,
        counter,
      } = credential;

      const transports =
        (response.response.transports as AuthenticatorTransportFuture[]) || [];

      await ctx.runMutation(internal.authHelpers.createAuthenticator, {
        userId: user._id,
        webauthnUserID: user.webauthnUserID, // =====================================================================
        // PERBAIKAN: Gunakan `id` langsung dari respons asli.
        credentialID: response.id, // =====================================================================
        credentialPublicKey:
          Buffer.from(credentialPublicKey).toString("base64"),
        counter,
        deviceType: credentialDeviceType,
        backedUp: credentialBackedUp,
        transports,
      });

      await ctx.runMutation(internal.authHelpers.completeUserRegistration, {
        userId: user._id,
      });
    } else {
      await ctx.runMutation(internal.authHelpers.deleteUser, {
        userId: user._id,
      });
      throw new Error("Verifikasi registrasi tidak berhasil.");
    }

    return { verified };
  },
});

export const generateLoginOptionsAction = action({
  args: { username: v.string() },
  handler: async (ctx: ActionCtx, { username }: { username: string }) => {
    const user = await ctx.runQuery(internal.authHelpers.getUserByUsername, {
      username,
    });
    if (!user || !user.isRegistrationComplete) {
      throw new Error("User tidak ditemukan atau registrasi belum selesai.");
    } // Kita tidak lagi memerlukan ini untuk discoverable credentials,
    // tapi tidak apa-apa membiarkannya untuk validasi bahwa user punya setidaknya satu authenticator.

    const userAuthenticators = await ctx.runQuery(
      internal.authHelpers.getAuthenticatorsByUserId,
      { userId: user._id }
    );

    if (userAuthenticators.length === 0) {
      throw new Error("Tidak ada authenticator terdaftar untuk user ini.");
    }

    const options = await generateAuthenticationOptions({
      rpID, // =====================================================================
      // PERBAIKAN: Hapus atau komentari baris `allowCredentials`.
      // Ini akan mengaktifkan mode "discoverable credential" (username-less).
      // allowCredentials: userAuthenticators.map((auth) => ({
      //   id: auth.credentialID,
      //   type: "public-key",
      //   transports: auth.transports as AuthenticatorTransportFuture[],
      // })),
      // =====================================================================
      userVerification: "preferred",
    });

    await ctx.runMutation(internal.authHelpers.setUserCurrentChallenge, {
      userId: user._id,
      challenge: options.challenge,
    });

    return options;
  },
});

export const verifyLoginAction = action({
  args: { response: v.any() },
  handler: async (
    ctx: ActionCtx,
    { response }: { response: AuthenticationResponseJSON }
  ): Promise<{ verified: boolean; token: string | null }> => {
    const credentialID = response.id;

    const authenticator = await ctx.runQuery(
      internal.authHelpers.getAuthenticatorByCredentialID,
      { credentialID }
    );

    if (!authenticator) {
      throw new Error("Authenticator tidak terdaftar.");
    }

    const user = await ctx.runQuery(internal.authHelpers.getUserById, {
      userId: authenticator.userId,
    });

    if (!user || !user.currentChallenge) {
      throw new Error("User atau challenge login tidak ditemukan.");
    }

    let verification: VerifiedAuthenticationResponse;
    try {
      verification = await verifyAuthenticationResponse({
        response,
        expectedChallenge: user.currentChallenge,
        expectedOrigin: rpOrigin,
        expectedRPID: rpID,
        credential: {
          id: authenticator.credentialID,
          publicKey: Buffer.from(authenticator.credentialPublicKey, "base64"),
          counter: authenticator.counter,
          transports:
            authenticator.transports as AuthenticatorTransportFuture[],
        },
        requireUserVerification: false,
      });
    } catch (error) {
      throw new Error(`Verifikasi login gagal: ${(error as Error).message}`);
    }

    const { verified, authenticationInfo } = verification;
    let token = null;

    if (verified) {
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
    }

    return { verified, token };
  },
});
