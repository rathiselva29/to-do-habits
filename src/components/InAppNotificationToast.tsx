import React, { useState, useEffect } from 'react';
import { Bell, X } from 'lucide-react';

interface NotificationToastData {
  id: string;
  title: string;
  body: string;
  tag?: string;
  timestamp: number;
}

export const InAppNotificationToast: React.FC = () => {
  const [toast, setToast] = useState<NotificationToastData | null>(null);

  useEffect(() => {
    const handleNotificationEvent = (event: Event) => {
      const customEvent = event as CustomEvent<{
        title: string;
        body: string;
        tag?: string;
        timestamp: number;
      }>;
      if (customEvent.detail) {
        setToast({
          id: String(Date.now()),
          title: customEvent.detail.title || '🔔 Notification',
          body: customEvent.detail.body || '',
          tag: customEvent.detail.tag,
          timestamp: customEvent.detail.timestamp || Date.now(),
        });
      }
    };

    window.addEventListener('applet-notification', handleNotificationEvent);
    return () => {
      window.removeEventListener('applet-notification', handleNotificationEvent);
    };
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      setToast(null);
    }, 6000);
    return () => clearTimeout(timer);
  }, [toast]);

  if (!toast) return null;

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[92vw] max-w-md animate-slideDown pointer-events-auto">
      <div className="p-4 rounded-3xl bg-slate-900/95 dark:bg-slate-900/95 text-white border border-amber-500/30 shadow-2xl backdrop-blur-md flex items-start gap-3.5">
        <div className="w-9 h-9 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/30">
          <Bell className="w-5 h-5 animate-bounce" />
        </div>
        
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <h4 className="text-xs font-black text-amber-300 tracking-wide uppercase">
              {toast.title}
            </h4>
            <span className="text-[10px] text-slate-400">Just now</span>
          </div>
          <p className="text-xs text-slate-200 mt-1 leading-relaxed">
            {toast.body}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setToast(null)}
          aria-label="Dismiss notification"
          className="p-1 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
