import React, { cloneElement, isValidElement, ReactNode } from "react";
import { useLayout } from "@/contexts/LayoutContext";
import { OpenVideoStoriesDialogProps } from "@/contexts/LayoutContext";

export interface VideoStoryTriggerProps extends OpenVideoStoriesDialogProps {
  children: ReactNode;
  asChild?: boolean;
  className?: string;
}

export function VideoStoryTrigger({
  children,
  asChild = false,
  className,
  videos,
  title,
  ctaText,
  ctaLink,
  onCtaClick,
  showCta,
  loop,
}: VideoStoryTriggerProps) {
  const { openVideoStoriesDialog } = useLayout();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    openVideoStoriesDialog({
      videos,
      title,
      ctaText,
      ctaLink,
      onCtaClick,
      showCta,
      loop,
    });
  };

  if (asChild && isValidElement(children)) {
    return cloneElement(children as React.ReactElement<{ onClick?: (e: React.MouseEvent) => void }>, {
      onClick: (e: React.MouseEvent) => {
        children.props.onClick?.(e);
        handleClick(e);
      },
    });
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          handleClick(e as unknown as React.MouseEvent);
        }
      }}
      className={className || "inline-block cursor-pointer"}
    >
      {children}
    </div>
  );
}
