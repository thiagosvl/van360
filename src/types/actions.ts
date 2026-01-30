import { ReactNode } from "react";

export interface ActionItem {
  label: string;
  icon: ReactNode;
  onClick: () => void;
  // Visual hints
  variant?: "default" | "destructive" | "ghost"; // For Dropdown items
  swipeColor?: string; // For Mobile Swipe/Drawer styling (e.g. 'bg-red-500')
  // State
  disabled?: boolean;
  hidden?: boolean;
  // Specifics
  isDestructive?: boolean; // Semantic flag
  drawerClass?: string; // Specific class for mobile drawer override
  title?: string;
  className?: string; // Additional custom classes (e.g. text color)
  hasSeparatorAfter?: boolean; // Render a separator line after this item
}
