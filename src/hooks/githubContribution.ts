import { useState, useEffect } from "react";
import { ContributionsData } from "../lib/types/github_types";

const USERNAME = "eveeze"; // Ganti dengan username GitHub Anda

export const useGitHubContributions = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<ContributionsData | null>(null);

  useEffect(() => {
    const fetchContributions = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `https://github-contributions-api.jogruber.de/v4/${USERNAME}`
        );

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const contributionsData = await response.json();
        setData(contributionsData);
        setError(null);
      } catch (err) {
        setError(
          err instanceof Error
            ? err
            : new Error("Failed to fetch GitHub contributions")
        );
      } finally {
        setLoading(false);
      }
    };

    fetchContributions();
  }, []);

  return { data, loading, error };
};
