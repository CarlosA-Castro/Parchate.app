import React from 'react';
import clsx from 'clsx';

const Button = ({
  children,
  type = 'button',
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  disabled = false,
  icon,
  iconPosition = 'left',
  className = '',
  ...props
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-semibold rounded-2xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed touch-target';
  
  const variants = {
    primary: 'bg-primary-600 text-white hover:bg-primary-700 active:bg-primary-800 focus:ring-primary-500',
    secondary: 'bg-neutral-100 text-neutral-900 hover:bg-neutral-200 active:bg-neutral-300 focus:ring-neutral-400',
    ghost: 'bg-transparent text-neutral-700 hover:bg-neutral-100 active:bg-neutral-200 focus:ring-neutral-300',
    gradient: 'bg-gradient-to-r from-primary-600 to-secondary-600 text-white hover:from-primary-700 hover:to-secondary-700 focus:ring-primary-500',
    outline: 'bg-transparent text-primary-600 border border-primary-600 hover:bg-primary-50 active:bg-primary-100 focus:ring-primary-500',
  };
  
  const sizes = {
    sm: 'px-4 py-2.5 text-sm',
    md: 'px-5 py-3 text-base',
    lg: 'px-6 py-3.5 text-lg',
    xl: 'px-7 py-4 text-lg',
  };
  
  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-5 h-5',
    xl: 'w-6 h-6',
  };
  
  const iconOnlyClasses = !children ? {
    sm: 'p-2.5',
    md: 'p-3',
    lg: 'p-3.5',
    xl: 'p-4',
  }[size] : '';
  
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={clsx(
        baseClasses,
        variants[variant],
        sizes[size],
        iconOnlyClasses,
        fullWidth && 'w-full',
        loading && 'cursor-wait',
        className
      )}
      {...props}
    >
      {loading && (
        <svg className={clsx('animate-spin mr-2', iconSizes[size])} fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      
      {!loading && icon && iconPosition === 'left' && (
        <span className={clsx('mr-2', iconSizes[size])}>
          {icon}
        </span>
      )}
      
      {children}
      
      {!loading && icon && iconPosition === 'right' && (
        <span className={clsx('ml-2', iconSizes[size])}>
          {icon}
        </span>
      )}
    </button>
  );
};

export default Button;
