import React from 'react';
import clsx from 'clsx';
import { FiAlertCircle } from 'react-icons/fi';

const Input = ({
  label,
  type = 'text',
  name,
  value,
  onChange,
  placeholder,
  required = false,
  disabled = false,
  error,
  leftIcon,
  rightIcon,
  className = '',
  ...props
}) => {
  return (
    <div className={className}>
      {label && (
        <label 
          htmlFor={name} 
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        {leftIcon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            {leftIcon}
          </div>
        )}
        
        <input
          id={name}
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          className={clsx(
            'w-full px-4 py-3 rounded-xl border border-gray-300 bg-white',
            'focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent',
            'disabled:bg-gray-100 disabled:cursor-not-allowed',
            'transition-all duration-200',
            leftIcon ? 'pl-10' : '',
            rightIcon ? 'pr-10' : '',
            error ? 'border-red-300 focus:ring-red-200' : ''
          )}
          {...props}
        />
        
        {rightIcon && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            {rightIcon}
          </div>
        )}
      </div>
      
      {error && (
        <div className="mt-2 flex items-center text-sm text-red-600">
          <FiAlertCircle className="mr-1" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};

export default Input;
