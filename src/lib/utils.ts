import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function imagePath(path: string) {
  const isGithubActions = process.env.NEXT_PUBLIC_GITHUB_ACTIONS === "true" || process.env.GITHUB_ACTIONS === "true";
  const basePath = isGithubActions ? "/Tienda-Emma" : "";
  if (path.startsWith("/")) return `${basePath}${path}`;
  return `${basePath}/${path}`;
}
