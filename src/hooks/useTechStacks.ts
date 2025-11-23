import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";

export type TechStack = {
  _id: Id<"techStacks">;
  name: string;
  category: string;
  imageUrl: string | null;
  position: number;
};

export interface UseTechStacksResult {
  stacks: TechStack[];
  isLoading: boolean;
  isEmpty: boolean;
}

export const useTechStacks = (): UseTechStacksResult => {
  const data = useQuery(api.techStack.getTechStacks);

  const isLoading = data === undefined;
  const stacks = data ?? [];
  const isEmpty = stacks.length === 0;

  return {
    stacks,
    isLoading,
    isEmpty,
  };
};
