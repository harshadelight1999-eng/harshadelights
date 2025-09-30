import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg' | 'small' | 'medium' | 'large';
  loading?: boolean;
  tooltip?: string;
  label?: string;
  color?: 'primary' | 'secondary' | 'default' | 'warning';
}

export const IconButtonWithTooltip: React.FC<ButtonProps> = ({ 
  children, 
  className = '', 
  variant = 'primary',
  size = 'md',
  loading = false,
  tooltip,
  ...props 
}) => {
  return (
    <button
      className={`inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ${className}`}
      title={tooltip}
      disabled={loading}
      {...props}
    >
      {loading ? 'Loading...' : children}
    </button>
  );
};

export const SaveButton = IconButtonWithTooltip;

export default IconButtonWithTooltip;