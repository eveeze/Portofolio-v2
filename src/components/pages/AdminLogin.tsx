// src/components/pages/AdminLogin.tsx
import React, { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useAction } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { gsap } from "gsap";
import type {
  PublicKeyCredentialRequestOptionsJSON,
  AuthenticationResponseJSON,
} from "@simplewebauthn/types";

// Tipe untuk error dari Convex
class ConvexError extends Error {
  data: any;
  constructor(message: string, data?: any) {
    super(message);
    this.name = "ConvexError";
    this.data = data;
  }
}

const AdminLogin: React.FC = () => {
  const [username, setUsername] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentStep, setCurrentStep] = useState<"username" | "webauthn">(
    "username"
  );
  const [loginOptions, setLoginOptions] =
    useState<PublicKeyCredentialRequestOptionsJSON | null>(null);

  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();

  const generateLoginOptions = useAction(api.auth.generateLoginOptionsAction);
  const verifyLogin = useAction(api.auth.verifyLoginAction);

  const containerRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);

  // Redirect jika sudah terotentikasi
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/admin/dashboard", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // Animasi GSAP saat komponen dimuat
  useEffect(() => {
    if (containerRef.current && formRef.current && titleRef.current) {
      gsap.fromTo(
        containerRef.current,
        { scale: 0.95, opacity: 0 },
        {
          scale: 1,
          opacity: 1,
          duration: 0.7,
          ease: "power2.out",
        }
      );
      gsap.fromTo(
        [titleRef.current, formRef.current],
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.7,
          stagger: 0.2,
          ease: "power2.out",
        }
      );
    }
  }, []);

  const animateStepTransition = (nextStep: () => void) => {
    if (formRef.current) {
      gsap.to(formRef.current, {
        duration: 0.3,
        opacity: 0,
        x: -20,
        onComplete: () => {
          nextStep();
          gsap.fromTo(
            formRef.current,
            { opacity: 0, x: 20 },
            {
              opacity: 1,
              x: 0,
              duration: 0.3,
              ease: "power2.out",
            }
          );
        },
      });
    } else {
      nextStep();
    }
  };

  const handleUsernameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;

    setIsLoading(true);
    setError("");

    try {
      const options = await generateLoginOptions({ username: username.trim() });
      setLoginOptions(options);
      animateStepTransition(() => {
        setCurrentStep("webauthn");
        setIsLoading(false);
      });
    } catch (err) {
      console.error("Generate login options error:", err);
      const convexError = err as ConvexError;
      const errorMessage =
        convexError.data?.value ||
        (err instanceof Error ? err.message : "Failed to initiate login.");

      setError(errorMessage.replace("Error: ", ""));
      setIsLoading(false);
    }
  };

  const handleWebAuthnLogin = async () => {
    if (!loginOptions) {
      setError("Login options not available. Please try again.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      // 1. Panggil simplewebauthn/browser untuk mendapatkan respons dari authenticator
      const { startAuthentication } = await import("@simplewebauthn/browser");
      const authResponse: AuthenticationResponseJSON =
        await startAuthentication({
          optionsJSON: loginOptions,
        });

      // 2. Verifikasi respons dengan backend Convex
      const verification = await verifyLogin({ response: authResponse });

      // 3. Handle hasil verifikasi
      if (verification.verified && verification.token) {
        // Panggil fungsi login dari AuthContext untuk menyimpan token dan state
        const userData = {
          id: authResponse.id,
          username: username.trim(),
        };
        login(verification.token, userData);

        // Animasikan dan arahkan ke dashboard
        if (formRef.current) {
          gsap.to(formRef.current, {
            duration: 0.5,
            opacity: 0,
            scale: 0.9,
            ease: "power2.in",
            onComplete: () => {
              navigate("/admin/dashboard", { replace: true });
            },
          });
        } else {
          navigate("/admin/dashboard", { replace: true });
        }
      } else {
        throw new Error(
          "Verification failed. The server did not approve the login."
        );
      }
    } catch (err) {
      console.error("WebAuthn login process failed:", err);
      let errorMessage = "An unknown login error occurred.";

      if (err instanceof Error) {
        switch (err.name) {
          case "NotAllowedError":
            errorMessage =
              "Authentication was cancelled or no matching passkey was found for this site.";
            break;
          case "InvalidStateError":
            errorMessage =
              "There was an issue with the authenticator. Please try again.";
            break;
          default:
            errorMessage = err.message;
            break;
        }
      }

      setError(errorMessage);
      if (formRef.current) {
        gsap.to(formRef.current, {
          duration: 0.1,
          x: -10,
          yoyo: true,
          repeat: 5,
          ease: "power2.inOut",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    animateStepTransition(() => {
      setCurrentStep("username");
      setError("");
      setLoginOptions(null);
      setIsLoading(false);
    });
  };

  const renderCurrentStep = () => {
    if (currentStep === "username") {
      return (
        <form onSubmit={handleUsernameSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="username"
              className="block text-grayText text-sm font-medium mb-2"
            >
              Username
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 bg-background2 border border-gray-700 rounded-lg text-whiteText focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              placeholder="Enter your username"
              required
              disabled={isLoading}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || !username.trim()}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
          >
            {isLoading ? "Checking..." : "Continue with Passkey"}
          </button>

          <div className="text-center">
            <Link
              to="/admin/register"
              className="text-grayText hover:text-whiteText text-sm transition-colors"
            >
              Don't have an account? Register
            </Link>
          </div>
        </form>
      );
    }

    if (currentStep === "webauthn") {
      return (
        <div className="space-y-6 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-whiteText mb-2">
            Passkey Authentication
          </h2>
          <p className="text-grayText text-sm mb-6">
            Ready to authenticate for <strong>{username}</strong>. Please use
            your registered passkey.
          </p>

          <button
            onClick={handleWebAuthnLogin}
            disabled={isLoading}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200"
          >
            {isLoading ? "Waiting for response..." : "Authenticate Now"}
          </button>

          <button
            onClick={handleBack}
            className="w-full bg-gray-700 hover:bg-gray-600 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200"
            disabled={isLoading}
          >
            Back
          </button>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="min-h-screen bg-background2 flex items-center justify-center px-4">
      <div ref={containerRef} className="w-full max-w-md">
        <div className="bg-background border border-gray-800 rounded-lg shadow-2xl p-8">
          <h1
            ref={titleRef}
            className="text-3xl font-bold text-whiteText text-center mb-8 font-['Oggs']"
          >
            Admin Access
          </h1>

          {error && (
            <div className="bg-red-900/20 border border-red-500 text-red-400 px-4 py-3 rounded mb-6 text-sm">
              {error}
            </div>
          )}

          <div ref={formRef}>{renderCurrentStep()}</div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
