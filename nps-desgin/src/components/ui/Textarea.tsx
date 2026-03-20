import React from 'react';

const baseClass =
  'w-full bg-surface-container-low border-none rounded-xl focus:ring-2 focus:ring-primary/30 focus:bg-surface-container-lowest transition-all text-sm py-3 px-4 text-on-surface placeholder-outline outline-none resize-y min-h-[80px]';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  containerClassName?: string;
}

export function Textarea({ label, containerClassName = '', id, ...props }: TextareaProps) {
  const inputId = id || (label ? `textarea-${label.replace(/\s/g, '-')}` : undefined);
  return (
    <div className={containerClassName}>
      {label && (
        <label htmlFor={inputId} className="text-sm font-semibold mb-1.5 block text-on-surface">
          {label}
        </label>
      )}
      <textarea id={inputId} className={baseClass} {...props} />
    </div>
  );
}
