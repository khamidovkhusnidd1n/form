import React, { forwardRef } from 'react';
import { cn } from '../../lib/utils';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, hint, className, id, ...props }, ref) => {
    const areaId = id || label?.toLowerCase().replace(/\s+/g, '-');
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={areaId} className="text-sm font-medium text-slate-700">
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <textarea
          ref={ref}
          id={areaId}
          className={cn(
            "w-full rounded-[10px] border bg-white px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 transition-all resize-none",
            "focus:outline-none focus:ring-2 focus:ring-[#1a56db]/30 focus:border-[#1a56db]",
            error ? "border-red-400" : "border-slate-200 hover:border-slate-300",
            className
          )}
          {...props}
        />
        {error && <p className="text-xs text-red-500">{error}</p>}
        {hint && !error && <p className="text-xs text-slate-400">{hint}</p>}
      </div>
    );
  }
);
Textarea.displayName = 'Textarea';
export default Textarea;
