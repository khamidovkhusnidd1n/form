import React from 'react';
import { cn } from '../../lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
}

export default function Button({
  variant = 'primary', size = 'md', loading, icon, children, className, disabled, ...props
}: ButtonProps) {
  const base = "inline-flex items-center justify-center gap-2 font-semibold rounded-[10px] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed";
  const variants = {
    primary: "bg-[#1a56db] text-white hover:bg-[#1341b0] focus:ring-[#1a56db] shadow-sm hover:shadow-md",
    secondary: "bg-[#e8f0fe] text-[#1a56db] hover:bg-[#d1e3fd] focus:ring-[#1a56db]",
    outline: "border-2 border-[#1a56db] text-[#1a56db] hover:bg-[#e8f0fe] focus:ring-[#1a56db] bg-transparent",
    ghost: "text-slate-600 hover:bg-slate-100 focus:ring-slate-300 bg-transparent",
    danger: "bg-red-500 text-white hover:bg-red-600 focus:ring-red-500 shadow-sm",
  };
  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-5 py-2.5 text-sm",
    lg: "px-7 py-3.5 text-base",
  };
  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={cn(base, variants[variant], sizes[size], className)}
    >
      {loading ? (
        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
        </svg>
      ) : icon}
      {children}
    </button>
  );
}
