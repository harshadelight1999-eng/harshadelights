import React from 'react';

export interface OfflineProps {
  children?: React.ReactNode;
  variant?: string;
  className?: string;
}

export const Offline: React.FC<OfflineProps> = ({ children, variant = 'inline', className }) => {
  const [isOnline, setIsOnline] = React.useState(navigator.onLine);

  React.useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) {
    return <>{children}</>;
  }

  return (
    <div className={`offline-indicator ${variant} ${className || ''}`}>
      <p>You are offline. Some features may not be available.</p>
    </div>
  );
};

export default Offline;