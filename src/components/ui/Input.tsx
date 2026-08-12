import React, { forwardRef } from 'react';
import { cn } from '../../lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  icon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, leftIcon, icon, rightIcon, className, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
    const effectiveLeftIcon = leftIcon || icon;
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-slate-700">
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <div className="relative">
          {effectiveLeftIcon && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">{effectiveLeftIcon}</span>}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              "w-full rounded-[10px] border bg-white px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 transition-all",
              "focus:outline-none focus:ring-2 focus:ring-[#1a56db]/30 focus:border-[#1a56db]",
              "disabled:bg-slate-50 disabled:cursor-not-allowed",
              error ? "border-red-400 focus:ring-red-200" : "border-slate-200 hover:border-slate-300",
              effectiveLeftIcon && "pl-10",
              rightIcon && "pr-10",
              className
            )}
            {...props}
          />
          {rightIcon && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">{rightIcon}</span>}
        </div>
        {error && <p className="text-xs text-red-500 flex items-center gap-1"><span>&#9888;</span>{error}</p>}
        {hint && !error && <p className="text-xs text-slate-400">{hint}</p>}
      </div>
    );
  }
);
Input.displayName = 'Input';
export default Input;
