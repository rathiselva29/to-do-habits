import React from 'react';
import { useApp } from '../context/AppContext';

export const OfflineBanner: React.FC = () => {
  // Silent background sync — do not show alarming pending updates or Sync Now alerts
  const { isOnline } = useApp();

  // If connected online, render nothing
  if (isOnline) return null;

  return null;
};
