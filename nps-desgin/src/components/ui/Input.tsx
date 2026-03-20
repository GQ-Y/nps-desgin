import React from 'react';

const baseInputClass =
  'w-full bg-surface-container-low border-none rounded-xl focus:ring-2 focus:ring-primary/30 focus:bg-surface-container-lowest transition-all text-sm py-3 px-4 text-on-surface placeholder-outline outline-none';

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'className'> {
  label?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onRightIconClick?: () => void;
  rightIconAriaLabel?: string;
  containerClassName?: string;
  inputClassName?: string;
}

export function Input({
  label,
  leftIcon,
  rightIcon,
  onRightIconClick,
  rightIconAriaLabel,
  containerClassName = '',
  inputClassName = '',
  id,
  ...props
}: InputProps) {
  const inputId = id || (label ? `input-${label.replace(/\s/g, '-')}` : undefined);
  return (
    <div className={containerClassName}>
      {label && (
        <label htmlFor={inputId} className="text-sm font-semibold mb-1.5 block text-on-surface">
          {label}
        </label>
      )}
      <div className="relative">
        {leftIcon && (
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-outline">
            {leftIcon}
          </div>
        )}
        <input
          id={inputId}
          className={`${baseInputClass} ${leftIcon ? 'pl-11' : ''} ${rightIcon || onRightIconClick ? 'pr-12' : ''} ${inputClassName}`}
          {...props}
        />
        {(rightIcon || onRightIconClick) && (
          <div
            className={`absolute inset-y-0 right-0 pr-4 flex items-center ${onRightIconClick ? 'cursor-pointer text-outline hover:text-on-surface-variant' : 'pointer-events-none text-outline'}`}
            onClick={onRightIconClick}
            role={onRightIconClick ? 'button' : undefined}
            tabIndex={onRightIconClick ? -1 : undefined}
            aria-label={rightIconAriaLabel}
          >
            {rightIcon}
          </div>
        )}
      </div>
    </div>
  );
}
