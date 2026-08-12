import React from 'react';
import { cn } from '../../lib/utils';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  glass?: boolean;
  hover?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export default function Card({ glass, hover, padding = 'md', className, children, ...props }: CardProps) {
  const paddings = { none: '', sm: 'p-4', md: 'p-6', lg: 'p-8' };
  return (
    <div
      className={cn(
        "rounded-2xl border",
        glass
          ? "bg-white/70 backdrop-blur-md border-white/50 shadow-lg"
          : "bg-white border-slate-100 shadow-sm",
        hover && "transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 cursor-pointer",
        paddings[padding],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
