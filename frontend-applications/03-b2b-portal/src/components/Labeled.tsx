import React from 'react';

export interface LabeledProps {
  children: React.ReactNode;
  label?: React.ReactNode;
  source?: string;
  resource?: string;
  htmlFor?: string;
  isRequired?: boolean;
  className?: string;
}

export const Labeled: React.FC<LabeledProps> = ({ 
  children, 
  label, 
  source,
  resource,
  htmlFor,
  isRequired,
  className 
}) => {
  return (
    <div className={`labeled-input ${className || ''}`}>
      {label && (
        <label htmlFor={htmlFor || source}>
          {label}
          {isRequired && <span className="required">*</span>}
        </label>
      )}
      {children}
    </div>
  );
};

export default Labeled;