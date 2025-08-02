// src/components/pages/AdminRegister.tsx
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAction } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { gsap } from "gsap";
import type { RegistrationResponseJSON } from "@simplewebauthn/types";
import type { PublicKeyCredentialCreationOptionsJSON } from "@simplewebauthn/server";

// Tipe untuk error dari Convex
class ConvexError extends Error {
  data: any;
  constructor(message: string, data?: any) {
    super(message);
    this.name = "ConvexError";
    this.data = data;
  }
}

const AdminRegister: React.FC = () => {
  const [username, setUsername] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [currentStep, setCurrentStep] = useState<
    "username" | "webauthn" | "complete" | "error"
  >("username");
  const [registrationOptions, setRegistrationOptions] =
    useState<PublicKeyCredentialCreationOptionsJSON | null>(null);

  const navigate = useNavigate();

  const generateRegistrationOptions = useAction(
    api.auth.generateRegistrationOptionsAction
  );
  const verifyRegistration = useAction(api.auth.verifyRegistrationAction);

  const containerRef = useRef<HTMLDivElement>(null);
  const stepContentRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (containerRef.current && titleRef.current) {
      const tl = gsap.timeline();
      gsap.set([titleRef.current, containerRef.current], {
        opacity: 0,
        y: 30,
      });
      tl.to(titleRef.current, {
        duration: 0.8,
        opacity: 1,
        y: 0,
        ease: "power2.out",
      }).to(
        containerRef.current,
        {
          duration: 0.6,
          opacity: 1,
          y: 0,
          ease: "power2.out",
        },
        "-=0.4"
      );
    }
  }, []);

  const animateStepTransition = (nextStep: () => void) => {
    if (stepContentRef.current) {
      gsap.to(stepContentRef.current, {
        duration: 0.3,
        opacity: 0,
        x: -20,
        onComplete: () => {
          nextStep();
          gsap.fromTo(
            stepContentRef.current,
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
      const options = await generateRegistrationOptions({
        username: username.trim(),
      });

      setRegistrationOptions(options);
      animateStepTransition(() => {
        setCurrentStep("webauthn");
        setIsLoading(false);
      });
    } catch (err) {
      console.error("Failed to generate registration options:", err);
      // Convex melempar error dengan properti 'data'
      const convexError = err as ConvexError;
      const errorMessage =
        convexError.data?.value ||
        (err instanceof Error ? err.message : "Failed to start registration.");

      setError(errorMessage.replace("Error: Registrasi tidak diizinkan: ", ""));
      setIsLoading(false);
    }
  };

  const handleWebAuthnRegistration = async () => {
    if (!registrationOptions) {
      setError("Registration options are not available. Please go back.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const { startRegistration } = await import("@simplewebauthn/browser");
      const regResponse: RegistrationResponseJSON = await startRegistration({
        optionsJSON: registrationOptions,
      });

      const verification = await verifyRegistration({ response: regResponse });

      if (verification.verified) {
        setSuccess(
          "Registration completed successfully! Redirecting to login..."
        );
        animateStepTransition(() => {
          setCurrentStep("complete");
          setTimeout(() => navigate("/admin/login"), 3000);
        });
      } else {
        throw new Error("Registration verification failed on the server.");
      }
    } catch (err) {
      console.error("WebAuthn registration process failed:", err);
      let errorMessage = "An unknown registration error occurred.";

      if (err instanceof Error) {
        switch (err.name) {
          case "InvalidStateError":
            errorMessage =
              "A passkey for this account may already exist. Try logging in or use a different authenticator.";
            break;
          case "NotAllowedError":
            errorMessage =
              "Registration was cancelled or not allowed by the authenticator. Please try again and approve the passkey creation.";
            break;
          case "NotSupportedError":
            errorMessage =
              "Your browser or device does not support passkeys. Please use a modern browser like Chrome, Safari, or Firefox.";
            break;
          default:
            errorMessage = err.message;
            break;
        }
      }

      setError(errorMessage);
      if (stepContentRef.current) {
        gsap.to(stepContentRef.current, {
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
      setRegistrationOptions(null);
      setIsLoading(false);
    });
  };

  const renderStep = () => {
    switch (currentStep) {
      case "username":
        return (
          <div ref={stepContentRef} className="space-y-6">
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
                  placeholder="Enter admin username"
                  required
                  disabled={isLoading}
                />
                <p className="text-grayText text-xs mt-2">
                  Only authorized usernames can register (e.g., admin, owner)
                </p>
              </div>

              <button
                type="submit"
                disabled={isLoading || !username.trim()}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Processing...
                  </div>
                ) : (
                  "Continue Registration"
                )}
              </button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => navigate("/admin/login")}
                  className="text-grayText hover:text-whiteText text-sm transition-colors"
                >
                  Already have an account? Login
                </button>
              </div>
            </form>
          </div>
        );

      case "webauthn":
        return (
          <div ref={stepContentRef} className="space-y-6 text-center">
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
              Create Your Passkey
            </h2>
            <p className="text-grayText text-sm mb-6">
              Follow the browser prompts to create a secure passkey for your
              account.
            </p>

            <button
              onClick={handleWebAuthnRegistration}
              disabled={isLoading}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Waiting for authenticator...
                </div>
              ) : (
                "Create Passkey Now"
              )}
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

      case "complete":
        return (
          <div ref={stepContentRef} className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-600 rounded-full mb-4">
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
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-whiteText mb-2">
              Registration Complete!
            </h2>
            <p className="text-green-400 text-sm mb-6">{success}</p>
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
            </div>
          </div>
        );

      case "error":
        return (
          <div ref={stepContentRef} className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-600 rounded-full mb-4">
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
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-whiteText mb-2">
              Registration Not Available
            </h2>
            <p className="text-grayText text-sm mb-6">{error}</p>
            <button
              onClick={() => navigate("/admin/login")}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-all duration-200"
            >
              Go to Login
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background2 flex items-center justify-center px-4">
      <div ref={containerRef} className="w-full max-w-md">
        <div className="bg-background border border-gray-800 rounded-lg shadow-2xl p-8">
          <h1
            ref={titleRef}
            className="text-3xl font-bold text-whiteText text-center mb-8 font-['Oggs']"
          >
            Admin Registration
          </h1>

          {error && currentStep !== "error" && (
            <div className="bg-red-900/20 border border-red-500 text-red-400 px-4 py-3 rounded mb-6">
              <div className="flex items-start">
                <svg
                  className="w-5 h-5 text-red-400 mt-0.5 mr-2 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <div className="text-sm">{error}</div>
              </div>
            </div>
          )}

          {renderStep()}
        </div>
      </div>
    </div>
  );
};

export default AdminRegister;
