import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function imagePath(path: string) {
  const basePath = process.env.NODE_ENV === "production" ? "/Tienda-Emma" : "";
  if (path.startsWith("/")) return `${basePath}${path}`;
  return `${basePath}/${path}`;
}
