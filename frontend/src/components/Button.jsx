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
  const base = 'inline-flex items-center justify-center font-semibold rounded-2xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

  const variants = {
    primary:   'bg-black text-white hover:bg-gray-800 active:bg-gray-900 focus:ring-black',
    secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200 active:bg-gray-300 focus:ring-gray-400',
    ghost:     'bg-transparent text-gray-700 hover:bg-gray-100 active:bg-gray-200 focus:ring-gray-300',
    outline:   'bg-transparent text-black border-2 border-black hover:bg-black hover:text-white focus:ring-black',
    danger:    'bg-red-500 text-white hover:bg-red-600 active:bg-red-700 focus:ring-red-500',
    gradient:  'bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600 focus:ring-blue-500',
  };

  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-5 py-3 text-base',
    lg: 'px-6 py-4 text-lg',
    xl: 'px-7 py-4 text-xl',
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-5 h-5',
    xl: 'w-6 h-6',
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={clsx(
        base,
        variants[variant],
        sizes[size],
        fullWidth && 'w-full',
        loading && 'cursor-wait',
        className
      )}
      {...props}
    >
      {loading && (
        <svg className={clsx('animate-spin mr-2', iconSizes[size])} fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      )}

      {!loading && icon && iconPosition === 'left' && (
        <span className={clsx('mr-2', iconSizes[size])}>{icon}</span>
      )}

      {children}

      {!loading && icon && iconPosition === 'right' && (
        <span className={clsx('ml-2', iconSizes[size])}>{icon}</span>
      )}
    </button>
  );
};

export default Button;
