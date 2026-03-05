"use client";

import * as React from "react";
import {
  AnimatePresence,
  motion,
  LayoutGroup,
  HTMLMotionProps,
} from "framer-motion";
import { cn } from "@/lib/utils";

interface ExpandableContextProps {
  isExpanded: boolean;
  toggleExpand: () => void;
  expandDirection: "both" | "vertical" | "horizontal";
}

const ExpandableContext = React.createContext<
  ExpandableContextProps | undefined
>(undefined);

export function useExpandable() {
  const context = React.useContext(ExpandableContext);
  if (!context) {
    throw new Error("useExpandable must be used within an Expandable provider");
  }
  return context;
}

interface ExpandableProps {
  children:
    | React.ReactNode
    | ((props: {
        isExpanded: boolean;
        toggleExpand: () => void;
      }) => React.ReactNode);
  expandDirection?: "both" | "vertical" | "horizontal";
  expandBehavior?: "replace" | "overlay";
  initialExpanded?: boolean;
}

export function Expandable({
  children,
  expandDirection = "both",
  initialExpanded = false,
}: ExpandableProps) {
  const [isExpanded, setIsExpanded] = React.useState(initialExpanded);

  const toggleExpand = React.useCallback(() => {
    setIsExpanded((prev) => !prev);
  }, []);

  const value = React.useMemo(
    () => ({ isExpanded, toggleExpand, expandDirection }),
    [isExpanded, toggleExpand, expandDirection],
  );

  return (
    <ExpandableContext.Provider value={value}>
      <LayoutGroup>
        {typeof children === "function"
          ? children({ isExpanded, toggleExpand })
          : children}
      </LayoutGroup>
    </ExpandableContext.Provider>
  );
}

export function ExpandableTrigger({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const { toggleExpand } = useExpandable();
  return (
    <div onClick={toggleExpand} className={cn("cursor-pointer", className)}>
      {children}
    </div>
  );
}

interface ExpandableCardProps extends HTMLMotionProps<"div"> {
  collapsedSize: { width: number | string; height: number | string };
  expandedSize: { width: number | string; height: number | string };
  hoverToExpand?: boolean;
  expandDelay?: number;
  collapseDelay?: number;
}

export function ExpandableCard({
  children,
  className,
  collapsedSize,
  expandedSize,
  ...props
}: ExpandableCardProps) {
  const { isExpanded } = useExpandable();

  return (
    <motion.div
      layout
      initial={false}
      animate={{
        width: isExpanded ? expandedSize.width : collapsedSize.width,
        height: isExpanded ? expandedSize.height : collapsedSize.height,
      }}
      transition={{
        type: "spring",
        stiffness: 260,
        damping: 25,
        mass: 0.5,
      }}
      className={cn(
        "relative overflow-hidden bg-white dark:bg-zinc-900 rounded-[1.25rem] border border-zinc-200 dark:border-zinc-800",
        className,
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function ExpandableCardHeader({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cn("p-4", className)}>{children}</div>;
}

export function ExpandableCardContent({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cn("p-0", className)}>{children}</div>;
}

export function ExpandableCardFooter({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "py-3 px-4 border-t border-zinc-100 dark:border-zinc-800",
        className,
      )}
    >
      {children}
    </div>
  );
}

interface ExpandableContentProps {
  children: React.ReactNode;
  className?: string;
  preset?: "fade" | "slide-up";
  keepMounted?: boolean;
  animateIn?: any;
}

export function ExpandableContent({
  children,
  className,
  preset = "fade",
}: ExpandableContentProps) {
  const { isExpanded } = useExpandable();

  const variants = {
    fade: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
    },
    "slide-up": {
      initial: { opacity: 0, y: 10 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: 10 },
    },
  };

  const currentVariant = variants[preset];

  return (
    <AnimatePresence>
      {isExpanded && (
        <motion.div
          className={className}
          initial={currentVariant.initial}
          animate={currentVariant.animate}
          exit={currentVariant.exit}
          transition={{ duration: 0.2 }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
