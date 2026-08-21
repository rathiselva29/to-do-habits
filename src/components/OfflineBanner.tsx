import React from 'react';
import { WifiOff, RefreshCw, CheckCircle2 } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const OfflineBanner: React.FC = () => {
  const { isOnline, syncQueue, isSyncing, triggerManualSync } = useApp();

  if (isOnline && syncQueue.length === 0 && !isSyncing) return null;

  return (
    <div className="w-full bg-amber-500/10 dark:bg-amber-950/40 border-b border-amber-500/20 px-4 py-2 text-xs transition-all animate-fadeIn">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-medium">
          {!isOnline ? (
            <>
              <WifiOff className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
              <span>You're offline — your changes are safely stored and will sync automatically.</span>
            </>
          ) : isSyncing ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>Syncing {syncQueue.length} pending updates to your cloud account...</span>
            </>
          ) : syncQueue.length > 0 ? (
            <>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>{syncQueue.length} pending updates ready to sync.</span>
            </>
          ) : null}
        </div>

        {isOnline && syncQueue.length > 0 && !isSyncing && (
          <button
            onClick={triggerManualSync}
            className="flex items-center gap-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-900 dark:text-amber-200 px-2 py-0.5 rounded-full font-medium transition-colors"
          >
            <RefreshCw className="w-3 h-3" />
            Sync Now
          </button>
        )}
      </div>
    </div>
  );
};
