// src/components/pages/AdminLogin.tsx - FIXED VERSION
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

const AdminLogin: React.FC = () => {
  const [username, setUsername] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentStep, setCurrentStep] = useState<"username" | "webauthn">(
    "username"
  );
  const [loginOptions, setLoginOptions] =
    useState<PublicKeyCredentialRequestOptionsJSON | null>(null);
  const [autoTriggered, setAutoTriggered] = useState(false);

  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();

  const generateLoginOptions = useAction(api.auth.generateLoginOptionsAction);
  const verifyLogin = useAction(api.auth.verifyLoginAction);

  const containerRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/admin/dashboard", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // GSAP animations on mount
  useEffect(() => {
    if (containerRef.current && formRef.current && titleRef.current) {
      const tl = gsap.timeline();

      gsap.set([titleRef.current, formRef.current], {
        opacity: 0,
        y: 30,
      });

      tl.to(titleRef.current, {
        duration: 0.8,
        opacity: 1,
        y: 0,
        ease: "power2.out",
      }).to(
        formRef.current,
        {
          duration: 0.6,
          opacity: 1,
          y: 0,
          ease: "power2.out",
        },
        "-=0.4"
      );

      gsap.fromTo(
        containerRef.current,
        { scale: 0.9, opacity: 0 },
        {
          scale: 1,
          opacity: 1,
          duration: 1,
          ease: "power2.out",
        }
      );
    }
  }, []);

  const handleUsernameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;

    setIsLoading(true);
    setError("");

    try {
      console.log("Generating login options for:", username.trim());
      const options = await generateLoginOptions({ username: username.trim() });
      console.log("Login options generated successfully", options);

      setLoginOptions(options);
      setAutoTriggered(false); // Reset auto-trigger flag

      // Animate step transition
      if (formRef.current) {
        gsap.to(formRef.current, {
          duration: 0.3,
          opacity: 0,
          x: -20,
          onComplete: () => {
            setCurrentStep("webauthn");
            setIsLoading(false); // Reset loading state after step change
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
      }
    } catch (err) {
      console.error("Generate login options error:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Failed to generate login options";

      // Check for specific error messages and provide helpful guidance
      if (errorMessage.includes("not found")) {
        setError(
          "User not found. Please register first by clicking 'Register' below."
        );
      } else if (errorMessage.includes("No authenticators found")) {
        setError(
          "No biometric credentials found. Please complete registration first."
        );
      } else if (errorMessage.includes("not complete")) {
        setError(
          "Registration is not complete. Please complete registration first."
        );
      } else {
        setError(errorMessage);
      }

      setIsLoading(false);

      // Error shake animation
      if (formRef.current) {
        gsap.to(formRef.current, {
          duration: 0.1,
          x: -10,
          yoyo: true,
          repeat: 5,
          ease: "power2.inOut",
        });
      }
    }
  };

  const handleWebAuthnLogin = async () => {
    if (!loginOptions) {
      setError("Login options not available");
      return;
    }

    if (isLoading) {
      console.log("Already processing authentication, skipping...");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      console.log("Starting WebAuthn authentication...");
      console.log("Login options:", loginOptions);

      // Dynamically import SimpleWebAuthn
      const { startAuthentication } = await import("@simplewebauthn/browser");

      console.log("Using login options for WebAuthn:", loginOptions);

      let authResponse: AuthenticationResponseJSON;

      try {
        // Create a timeout promise
        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(
            () => reject(new Error("Authentication timeout after 60 seconds")),
            60000
          )
        );

        // Start authentication
        console.log("Calling startAuthentication...");
        const authPromise = startAuthentication({
          optionsJSON: loginOptions,
          useBrowserAutofill: false,
        });

        authResponse = await Promise.race([authPromise, timeoutPromise]);
        console.log("WebAuthn authentication completed:", authResponse);
      } catch (webauthnError) {
        console.error("WebAuthn authentication error:", webauthnError);

        // Handle specific WebAuthn errors
        if (webauthnError instanceof Error) {
          if (webauthnError.name === "NotAllowedError") {
            throw new Error(
              "Authentication was cancelled or timed out. Please try again."
            );
          } else if (webauthnError.name === "InvalidStateError") {
            throw new Error("Authentication failed. Please try again.");
          } else if (webauthnError.name === "NotSupportedError") {
            throw new Error(
              "Your browser or device doesn't support this type of authentication."
            );
          } else if (webauthnError.name === "AbortError") {
            throw new Error("Authentication was aborted. Please try again.");
          }
        }

        throw webauthnError;
      }

      // Verify the authentication with timeout
      console.log("Verifying login with backend...");

      let verification: { verified: boolean; token: string | null };

      try {
        const verifyPromise = verifyLogin({ response: authResponse });
        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(
            () =>
              reject(new Error("Login verification timeout after 30 seconds")),
            30000
          )
        );

        verification = await Promise.race([verifyPromise, timeoutPromise]);
        console.log("Verification result:", verification);
      } catch (verifyError) {
        console.error("Verification error:", verifyError);
        throw new Error(
          `Verification failed: ${verifyError instanceof Error ? verifyError.message : "Unknown error"}`
        );
      }

      if (verification.verified && verification.token) {
        console.log("Login verification successful");

        // Success animation
        if (formRef.current) {
          gsap.to(formRef.current, {
            duration: 0.5,
            scale: 1.05,
            opacity: 0.8,
            yoyo: true,
            repeat: 1,
            ease: "power2.inOut",
            onComplete: () => {
              // Ensure we have proper user data
              const userData = {
                id: authResponse.id || authResponse.rawId,
                username: username,
              };

              login(verification.token!, userData);
              navigate("/admin/dashboard", { replace: true });
            },
          });
        }
      } else {
        throw new Error("Authentication failed - verification not successful");
      }
    } catch (err) {
      console.error("WebAuthn login error:", err);
      let errorMessage = "Login failed";

      if (err instanceof Error) {
        if (err.name === "NotAllowedError") {
          errorMessage =
            "Authentication was cancelled or timed out. Please try again.";
        } else if (err.name === "InvalidStateError") {
          errorMessage = "Authentication failed. Please try again.";
        } else if (err.name === "NotSupportedError") {
          errorMessage =
            "Your browser or device doesn't support this type of authentication.";
        } else if (err.name === "AbortError") {
          errorMessage = "Authentication was aborted. Please try again.";
        } else if (err.message.includes("timeout")) {
          errorMessage = "Authentication timeout. Please try again.";
        } else if (
          err.message.includes(
            "The operation either timed out or was not allowed"
          )
        ) {
          errorMessage =
            "Authentication timed out or was cancelled. Please try again.";
        } else {
          errorMessage = err.message;
        }
      }

      console.error("Final error message:", errorMessage);
      setError(errorMessage);

      // Don't reset to username step immediately, let user try again
      setLoginOptions(null);

      // Error shake animation
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
      setAutoTriggered(true); // Mark as triggered to prevent loops
    }
  };

  const handleBack = () => {
    if (formRef.current) {
      gsap.to(formRef.current, {
        duration: 0.3,
        opacity: 0,
        x: 20,
        onComplete: () => {
          setCurrentStep("username");
          setError("");
          setLoginOptions(null);
          setAutoTriggered(false);
          setIsLoading(false);
          gsap.fromTo(
            formRef.current,
            { opacity: 0, x: -20 },
            {
              opacity: 1,
              x: 0,
              duration: 0.3,
              ease: "power2.out",
            }
          );
        },
      });
    }
  };

  // FIXED: Auto-trigger WebAuthn authentication when ready
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    if (
      currentStep === "webauthn" &&
      loginOptions &&
      !isLoading &&
      !autoTriggered &&
      !error // Don't auto-trigger if there's an error
    ) {
      console.log("Auto-triggering WebAuthn authentication...");

      // Use a longer delay and ensure DOM is ready
      timeoutId = setTimeout(() => {
        if (
          currentStep === "webauthn" &&
          loginOptions &&
          !isLoading &&
          !autoTriggered
        ) {
          handleWebAuthnLogin();
        }
      }, 1500); // Increased delay to 1.5 seconds
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [currentStep, loginOptions, isLoading, autoTriggered, error]);

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

          {currentStep === "username" ? (
            <div ref={formRef}>
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
                  <p className="text-grayText text-xs mt-2">
                    Only registered users can login
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
                    "Continue"
                  )}
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
            </div>
          ) : (
            <div ref={formRef} className="space-y-6">
              <div className="text-center">
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
                  Biometric Authentication
                </h2>
                <p className="text-grayText text-sm mb-6">
                  {isLoading
                    ? "Follow the prompts from your browser or device..."
                    : autoTriggered
                      ? "Authentication completed. Click authenticate if you need to try again."
                      : "Authentication will start automatically..."}
                </p>

                {!isLoading && (
                  <button
                    onClick={() => {
                      console.log("Manual authentication button clicked");
                      setAutoTriggered(false); // Reset auto-trigger flag
                      handleWebAuthnLogin();
                    }}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 mb-4"
                  >
                    {autoTriggered ? "Try Again" : "Authenticate Now"}
                  </button>
                )}

                {isLoading && (
                  <div className="flex items-center justify-center py-4 mb-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                    <span className="ml-2 text-grayText text-sm">
                      Authenticating...
                    </span>
                  </div>
                )}
              </div>

              <button
                onClick={handleBack}
                className="w-full bg-gray-700 hover:bg-gray-600 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200"
                disabled={isLoading}
              >
                Back
              </button>

              {/* Debug info for development */}
              {process.env.NODE_ENV === "development" && (
                <div className="text-xs text-gray-500 mt-4">
                  <p>Debug Info:</p>
                  <p>Auto-triggered: {autoTriggered ? "Yes" : "No"}</p>
                  <p>Is Loading: {isLoading ? "Yes" : "No"}</p>
                  <p>Has Options: {loginOptions ? "Yes" : "No"}</p>
                  <p>Has Error: {error ? "Yes" : "No"}</p>
                  <p>Current Step: {currentStep}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
