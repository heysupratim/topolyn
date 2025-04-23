import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { itemTypes } from "./ItemTypes";
import { Server } from "lucide-react";
import React from "react";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Gets the appropriate icon component for a given inventory item type
 * @param type The inventory item type
 * @returns A React component for the icon
 */
export function getIconForType(type: string) {
  const itemType = itemTypes.find((t) => t.value === type);
  if (itemType && itemType.icon) {
    const Icon = itemType.icon;
    return React.createElement(Icon, { className: "h-4 w-4" });
  }
  return React.createElement(Server, { className: "h-4 w-4" }); // Default icon
}
