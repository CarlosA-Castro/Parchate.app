import React from 'react';
import clsx from 'clsx';

const Card = ({ 
  children, 
  className = '', 
  variant = 'default',
  hover = true,
  padding = 'md',
  blur = false,
  gradient = false,
  ...props 
}) => {
  const baseClasses = 'rounded-3xl border';
  
  const variants = {
    default: 'bg-white border-neutral-200',
    glass: 'glass border-white/50',
    elevated: 'bg-white border-neutral-200 shadow-soft',
    flat: 'bg-white border-none',
  };
  
  const paddings = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };
  
  const hoverClasses = hover ? 'transition-all duration-300 hover:shadow-medium hover:-translate-y-0.5' : '';
  const gradientClasses = gradient ? 'bg-gradient-to-br from-white to-primary-50' : '';
  const blurClasses = blur ? 'backdrop-blur-sm' : '';
  
  return (
    <div
      className={clsx(
        baseClasses,
        variants[variant],
        paddings[padding],
        hoverClasses,
        gradientClasses,
        blurClasses,
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardBody = ({ children, className = '', padding = 'md', ...props }) => {
  const paddings = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };
  
  return (
    <div className={clsx(paddings[padding], className)} {...props}>
      {children}
    </div>
  );
};

export const CardHeader = ({ children, className = '', ...props }) => (
  <div className={clsx('p-6 border-b border-neutral-100', className)} {...props}>
    {children}
  </div>
);

export const CardFooter = ({ children, className = '', ...props }) => (
  <div className={clsx('p-6 border-t border-neutral-100', className)} {...props}>
    {children}
  </div>
);

export default Card;
