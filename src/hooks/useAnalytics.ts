// src/hooks/useAnalytics.ts
import { useEffect, useRef } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

interface AnalyticsData {
  type: "visitor" | "page_view" | "portfolio_view" | "contact_form";
  page?: string;
  additionalData?: any;
}

export const useAnalytics = () => {
  const trackAnalytics = useMutation(api.analytics.trackVisitor);

  // Use useRef to store session data in memory instead of browser storage
  const sessionData = useRef({
    sessionId: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    visitorTracked: false,
    ipHash: "",
  });

  // Generate browser fingerprint for privacy (no storage needed)
  const generateFingerprint = async () => {
    if (sessionData.current.ipHash) return sessionData.current.ipHash;

    try {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.textBaseline = "top";
        ctx.font = "14px 'Arial'";
        ctx.textBaseline = "alphabetic";
        ctx.fillStyle = "#f60";
        ctx.fillRect(125, 1, 62, 20);
        ctx.fillStyle = "#069";
        ctx.fillText("Analytics fingerprint 🔍", 2, 15);
        ctx.fillStyle = "rgba(102, 204, 0, 0.2)";
        ctx.fillText("Analytics fingerprint 🔍", 4, 17);
      }

      const fingerprint = canvas.toDataURL();

      // Simple hash function
      let hash = 0;
      for (let i = 0; i < fingerprint.length; i++) {
        const char = fingerprint.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash = hash & hash; // Convert to 32bit integer
      }

      sessionData.current.ipHash = hash.toString();
      return sessionData.current.ipHash;
    } catch {
      sessionData.current.ipHash = `fallback_${Date.now()}`;
      return sessionData.current.ipHash;
    }
  };

  const track = async (data: AnalyticsData) => {
    try {
      const ipHash = await generateFingerprint();

      await trackAnalytics({
        type: data.type,
        page: data.page || window.location.pathname,
        userAgent: navigator.userAgent,
        referrer: document.referrer,
        ipHash,
        sessionId: sessionData.current.sessionId,
        additionalData: data.additionalData,
      });
    } catch (error) {
      console.error("Analytics tracking error:", error);
    }
  };

  // Auto track page views and visitors
  useEffect(() => {
    // Track page view
    track({ type: "page_view", page: window.location.pathname });

    // Track visitor (only once per session using in-memory flag)
    if (!sessionData.current.visitorTracked) {
      track({ type: "visitor" });
      sessionData.current.visitorTracked = true;
    }

    // Track page visibility changes
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        track({ type: "page_view", page: window.location.pathname });
      }
    };

    // Track before page unload
    const handleBeforeUnload = () => {
      // Send final analytics data if needed
      track({
        type: "page_view",
        page: window.location.pathname,
        additionalData: { action: "unload" },
      });
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [window.location.pathname]); // Re-run when pathname changes

  return { track };
};
