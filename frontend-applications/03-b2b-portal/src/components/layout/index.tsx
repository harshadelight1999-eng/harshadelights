import React from 'react';

// Re-export React Admin layout components
export {
  Layout,
  AppBar,
  Sidebar,
  Menu,
  MenuItemLink,
  DashboardMenuItem,
  UserMenu,
  Logout,
  Title,
  Loading,
  LinearProgress,
  Notification
} from 'react-admin';

// Simple Offline component
export const Offline = ({ variant = 'inline' }: { variant?: string }) => (
  <div className={`offline-indicator ${variant}`}>
    <span>Offline</span>
  </div>
);

// Simple Confirm component for delete confirmations
export const Confirm = ({ 
  isOpen, 
  title, 
  content, 
  onConfirm, 
  onClose, 
  message = 'Are you sure?' 
}: {
  isOpen?: boolean;
  title?: string;
  content?: string;
  onConfirm: () => void;
  onClose: () => void;  
  message?: string;
}) => {
  if (!isOpen) return null;
  
  return (
    <div className="confirm-dialog">
      <h3>{title}</h3>
      <p>{content || message}</p>
      <button onClick={onConfirm}>Yes</button>
      <button onClick={onClose}>No</button>
    </div>
  );
};