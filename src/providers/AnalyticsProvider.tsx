// src/components/providers/AnalyticsProvider.tsx
import React, { createContext, useContext, ReactNode } from "react";
import { useAnalytics } from "../hooks/useAnalytics";
interface AnalyticsContextType {
  track: (data: {
    type: "visitor" | "page_view" | "portfolio_view" | "contact_form";
    page?: string;
    additionalData?: any;
  }) => Promise<void>;
}

const AnalyticsContext = createContext<AnalyticsContextType | undefined>(
  undefined
);

export const useAnalyticsContext = () => {
  const context = useContext(AnalyticsContext);
  if (!context) {
    throw new Error(
      "useAnalyticsContext must be used within AnalyticsProvider"
    );
  }
  return context;
};

interface AnalyticsProviderProps {
  children: ReactNode;
}

export const AnalyticsProvider: React.FC<AnalyticsProviderProps> = ({
  children,
}) => {
  const { track } = useAnalytics();

  return (
    <AnalyticsContext.Provider value={{ track }}>
      {children}
    </AnalyticsContext.Provider>
  );
};
