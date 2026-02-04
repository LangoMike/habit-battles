import * as React from "react";
import { cn } from "@/lib/utils";

interface PageLayoutProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Consistent page layout wrapper
 * Provides max-width, gutters, and spacing rhythm
 */
export function PageLayout({ children, className }: PageLayoutProps) {
  return (
    <div className={cn("space-y-6 sm:space-y-8 pb-8", className)}>
      {children}
    </div>
  );
}

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}

/**
 * Page header component with consistent styling
 * Title uses display font, subtitle uses UI font
 */
export function PageHeader({
  title,
  subtitle,
  actions,
  icon,
  className,
}: PageHeaderProps) {
  return (
    <div className={cn("space-y-2 pb-2", className)}>
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 sm:gap-4">
          {icon && <div className="text-primary">{icon}</div>}
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground">
              {title}
            </h1>
            {subtitle && (
              <p className="font-ui text-sm sm:text-base text-muted-foreground mt-1">
                {subtitle}
              </p>
            )}
          </div>
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
    </div>
  );
}

interface SectionProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  className?: string;
}

/**
 * Section wrapper with optional header
 * Provides consistent spacing and styling
 */
export function Section({
  children,
  title,
  description,
  icon,
  className,
}: SectionProps) {
  return (
    <div className={cn("space-y-4 pb-2", className)}>
      {(title || description) && (
        <div className="flex items-center gap-2 mb-1">
          {icon && <div className="text-primary">{icon}</div>}
          <div>
            {title && (
              <h2 className="font-display text-lg sm:text-xl font-semibold text-foreground">
                {title}
              </h2>
            )}
            {description && (
              <p className="font-ui text-sm text-muted-foreground mt-1">
                {description}
              </p>
            )}
          </div>
        </div>
      )}
      {children}
    </div>
  );
}
