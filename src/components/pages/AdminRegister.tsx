// src/components/pages/AdminRegister.tsx
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAction } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { gsap } from "gsap";
import type { PublicKeyCredentialCreationOptionsJSON } from "@simplewebauthn/types";

const AdminRegister: React.FC = () => {
  const [username, setUsername] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [currentStep, setCurrentStep] = useState<
    "check" | "username" | "webauthn" | "complete"
  >("check");
  // Fix the type here - change from null to the proper type
  const [registrationOptions, setRegistrationOptions] =
    useState<PublicKeyCredentialCreationOptionsJSON | null>(null);

  const navigate = useNavigate();

  const checkRegistrationAllowed = useAction(api.auth.checkRegistrationAllowed);
  const generateRegistrationOptions = useAction(
    api.auth.generateRegistrationOptionsAction
  );
  const verifyRegistration = useAction(api.auth.verifyRegistrationAction);

  // Refs for GSAP animations
  const containerRef = useRef<HTMLDivElement>(null);
  const stepContentRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);

  // GSAP animations on mount
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

  // Check if registration is allowed on mount
  useEffect(() => {
    const checkStatus = async () => {
      try {
        const result = await checkRegistrationAllowed({ username: "admin" });
        if (!result.allowed) {
          setError(result.reason);
          setCurrentStep("check");
        } else {
          setCurrentStep("username");
        }
      } catch (err) {
        setError("Failed to check registration status");
        setCurrentStep("check");
      }
    };

    checkStatus();
  }, [checkRegistrationAllowed]);

  const handleUsernameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;

    setIsLoading(true);
    setError("");

    try {
      // Check if this specific username is allowed
      const check = await checkRegistrationAllowed({
        username: username.trim(),
      });
      if (!check.allowed) {
        setError(check.reason);
        setIsLoading(false);
        return;
      }

      // Generate registration options
      const options = await generateRegistrationOptions({
        username: username.trim(),
      });

      setRegistrationOptions(options);

      // Animate step transition
      if (stepContentRef.current) {
        gsap.to(stepContentRef.current, {
          duration: 0.3,
          opacity: 0,
          x: -20,
          onComplete: () => {
            setCurrentStep("webauthn");
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
      }
    } catch (err) {
      console.error("Registration options error:", err);
      setError(
        err instanceof Error ? err.message : "Failed to start registration"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleWebAuthnRegistration = async () => {
    if (!registrationOptions) {
      setError("Registration options not available");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      // Import and start WebAuthn registration
      const { startRegistration } = await import("@simplewebauthn/browser");

      console.log(
        "Starting WebAuthn registration with options:",
        registrationOptions
      );

      const regResponse = await startRegistration({
        optionsJSON: registrationOptions,
        useAutoRegister: false, // Disable auto-register untuk kontrol lebih baik
      });

      console.log("WebAuthn registration response:", regResponse);

      // Verify registration with backend dengan timeout
      const verificationPromise = verifyRegistration({ response: regResponse });
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(
          () => reject(new Error("Registration verification timeout")),
          30000
        )
      );

      const verification = (await Promise.race([
        verificationPromise,
        timeoutPromise,
      ])) as { verified: boolean };

      if (verification.verified) {
        setSuccess("Registration completed successfully!");
        setCurrentStep("complete");

        // Success animation
        if (stepContentRef.current) {
          gsap.to(stepContentRef.current, {
            duration: 0.5,
            scale: 1.05,
            opacity: 0.8,
            yoyo: true,
            repeat: 1,
            ease: "power2.inOut",
            onComplete: () => {
              setTimeout(() => {
                navigate("/admin/login");
              }, 2000);
            },
          });
        }
      } else {
        throw new Error("Registration verification failed");
      }
    } catch (err) {
      console.error("WebAuthn registration error:", err);

      let errorMessage = "Registration failed";
      if (err instanceof Error) {
        if (err.name === "NotAllowedError") {
          errorMessage =
            "Registration was cancelled or timed out. Please try again.";
        } else if (err.name === "InvalidStateError") {
          errorMessage =
            "This authenticator is already registered. Try using a different one.";
        } else if (err.name === "NotSupportedError") {
          errorMessage =
            "Your browser or device doesn't support this type of authentication.";
        } else if (err.message.includes("timeout")) {
          errorMessage = "Registration verification timeout. Please try again.";
        } else {
          errorMessage = err.message;
        }
      }

      setError(errorMessage);

      // Error shake animation
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
    if (stepContentRef.current) {
      gsap.to(stepContentRef.current, {
        duration: 0.3,
        opacity: 0,
        x: 20,
        onComplete: () => {
          setCurrentStep("username");
          setError("");
          setRegistrationOptions(null);
          gsap.fromTo(
            stepContentRef.current,
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

  const renderStep = () => {
    switch (currentStep) {
      case "check":
        return (
          <div className="text-center">
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
                  Only authorized usernames can register (admin, owner)
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
          <div ref={stepContentRef} className="space-y-6">
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
                Setup Biometric Authentication
              </h2>
              <p className="text-grayText text-sm mb-6">
                Click the button below to set up your passkey. You'll be
                prompted to use your fingerprint, face ID, PIN, or security key.
              </p>

              {!isLoading && (
                <button
                  onClick={handleWebAuthnRegistration}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 mb-4"
                >
                  Create Passkey
                </button>
              )}

              {isLoading && (
                <div className="flex flex-col items-center justify-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-2"></div>
                  <p className="text-grayText text-sm">
                    Follow the prompts from your browser or device...
                  </p>
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
          </div>
        );

      case "complete":
        return (
          <div className="text-center">
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
            <p className="text-grayText text-sm mb-6">
              Your admin account has been created successfully. Redirecting to
              login...
            </p>
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
            </div>
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

          {error && currentStep !== "check" && (
            <div className="bg-red-900/20 border border-red-500 text-red-400 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-900/20 border border-green-500 text-green-400 px-4 py-3 rounded mb-6">
              {success}
            </div>
          )}

          {renderStep()}
        </div>
      </div>
    </div>
  );
};

export default AdminRegister;
