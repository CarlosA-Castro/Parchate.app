// REPARACIÓN FORZADA - Card.jsx limpio
import React from 'react';

const Card = ({ children, className = '', ...props }) => {
  return (
    <div className={'rounded-2xl border border-gray-200 bg-white ' + className} {...props}>
      {children}
    </div>
  );
};

export const CardBody = ({ children, className = '', ...props }) => (
  <div className={'p-6 ' + className} {...props}>
    {children}
  </div>
);

export const CardHeader = ({ children, className = '', ...props }) => (
  <div className={'p-6 border-b border-gray-100 ' + className} {...props}>
    {children}
  </div>
);

export const CardFooter = ({ children, className = '', ...props }) => (
  <div className={'p-6 border-t border-gray-100 ' + className} {...props}>
    {children}
  </div>
);

export default Card;
