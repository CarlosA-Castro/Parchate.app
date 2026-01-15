import React from 'react';
import clsx from 'clsx';
import { FiLoader } from 'react-icons/fi';

const Button = ({
  children,
  type = 'button',
  variant = 'primary',
  size = 'medium',
  fullWidth = false,
  loading = false,
  disabled = false,
  className = '',
  ...props
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'bg-black text-white hover:bg-gray-800 active:bg-gray-900 focus:ring-black',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 active:bg-gray-400 focus:ring-gray-400',
    ghost: 'bg-transparent text-gray-700 hover:bg-gray-100 active:bg-gray-200 focus:ring-gray-300',
    danger: 'bg-red-600 text-white hover:bg-red-700 active:bg-red-800 focus:ring-red-500',
  };
  
  const sizes = {
    small: 'px-3 py-2 text-sm',
    medium: 'px-5 py-3 text-base',
    large: 'px-6 py-4 text-lg',
  };
  
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={clsx(
        baseClasses,
        variants[variant],
        sizes[size],
        fullWidth && 'w-full',
        loading && 'cursor-wait',
        className
      )}
      {...props}
    >
      {loading && (
        <FiLoader className="animate-spin mr-2" />
      )}
      {children}
    </button>
  );
};

export default Button;
