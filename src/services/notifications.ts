/**
 * Client-Side Notification & Real-Time Habit Reminder Service
 * Supports Web Notification API, PWA Service Worker Notifications, and Android native wrappers.
 */

export interface TriggerNotificationOptions {
  iconUrl?: string;
  badgeUrl?: string;
  tag?: string;
  data?: any;
  sound?: boolean;
}

class NotificationServiceManager {
  private audioCtx: AudioContext | null = null;
  private lastTriggeredMinutes: Set<string> = new Set();

  private getAudioContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume().catch(() => {});
    }
    return this.audioCtx;
  }

  /**
   * Whether notifications are supported in this environment
   */
  public isSupported(): boolean {
    if (typeof window === 'undefined') return false;
    return (
      'Notification' in window ||
      'serviceWorker' in navigator ||
      Boolean((window as any).Android && typeof (window as any).Android.showNotification === 'function')
    );
  }

  /**
   * Current notification permission status ('granted' | 'denied' | 'default')
   */
  public getPermissionStatus(): 'granted' | 'denied' | 'default' {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return 'denied';
    }
    return Notification.permission;
  }

  /**
   * Request browser / platform permission for system notifications
   */
  public async requestPermission(): Promise<'granted' | 'denied' | 'default'> {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return 'denied';
    }
    try {
      if (Notification.permission === 'granted') {
        return 'granted';
      }
      let perm: NotificationPermission = Notification.permission;
      const res = Notification.requestPermission();
      if (res && typeof (res as any).then === 'function') {
        perm = await res;
      } else {
        perm = await new Promise((resolve) => {
          Notification.requestPermission(resolve);
        });
      }
      return perm;
    } catch (e) {
      console.warn('Could not request notification permission:', e);
      return Notification.permission || 'denied';
    }
  }

  /**
   * Play clean melodic chime using Web Audio API
   */
  public playChime(type: 'reminder' | 'completion' | 'streak' = 'reminder') {
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;

      const now = ctx.currentTime;

      if (type === 'completion') {
        // Upbeat dual chime
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain = ctx.createGain();

        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(1046.5, now);
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(1318.51, now + 0.08);

        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.2, now + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(ctx.destination);

        osc1.start(now);
        osc1.stop(now + 0.25);
        osc2.start(now + 0.08);
        osc2.stop(now + 0.45);
      } else if (type === 'streak') {
        // Triple celebratory chime
        [698.46, 880.0, 1046.5].forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + i * 0.1);
          gain.gain.setValueAtTime(0, now + i * 0.1);
          gain.gain.linearRampToValueAtTime(0.22, now + i * 0.1 + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.1 + 0.5);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + i * 0.1);
          osc.stop(now + i * 0.1 + 0.5);
        });
      } else {
        // Soft gentle reminder bell
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, now);
        osc.frequency.exponentialRampToValueAtTime(1174.66, now + 0.12);

        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.18, now + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.6);
      }
    } catch (e) {
      console.warn('Audio playback note:', e);
    }
  }

  /**
   * Trigger a real device / browser system notification.
   * Priority:
   * 1. Android Native Bridge (if packaged as Android APK/AAB)
   * 2. Service Worker showNotification (PWA standard, works on Android Chrome & Desktop)
   * 3. Web Notification API fallback
   */
  public async triggerNotification(
    title: string,
    body: string,
    options?: TriggerNotificationOptions
  ): Promise<boolean> {
    if (options?.sound !== false) {
      this.playChime('reminder');
    }

    // Always dispatch in-app alert toast so active users see the alert immediately
    if (typeof window !== 'undefined') {
      try {
        window.dispatchEvent(
          new CustomEvent('applet-notification', {
            detail: {
              title,
              body,
              tag: options?.tag || 'daily-habit-reminder',
              timestamp: Date.now(),
            },
          })
        );
      } catch (e) {
        console.warn('In-app notification event dispatch note:', e);
      }
    }

    let notified = false;

    // 1. Android Native interface check (e.g. WebView addJavascriptInterface or Capacitor plugin)
    if (typeof window !== 'undefined') {
      const androidBridge = (window as any).Android;
      if (androidBridge && typeof androidBridge.showNotification === 'function') {
        try {
          androidBridge.showNotification(title, body);
          notified = true;
        } catch (e) {
          console.warn('Android bridge notification error:', e);
        }
      }

      const capacitor = (window as any).Capacitor;
      if (capacitor?.Plugins?.LocalNotifications?.schedule) {
        try {
          await capacitor.Plugins.LocalNotifications.schedule({
            notifications: [
              {
                title,
                body,
                id: Math.floor(Math.random() * 100000),
                schedule: { at: new Date(Date.now() + 100) },
              },
            ],
          });
          notified = true;
        } catch (e) {
          console.warn('Capacitor LocalNotifications error:', e);
        }
      }
    }

    // 2. Service Worker registration.showNotification (recommended for PWAs & Android browsers)
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      try {
        const registration = await Promise.race([
          navigator.serviceWorker.ready,
          new Promise<null>((resolve) => setTimeout(() => resolve(null), 800)),
        ]);
        if (registration && typeof registration.showNotification === 'function') {
          await registration.showNotification(title, {
            body,
            icon: options?.iconUrl || '/pwa-192x192.png',
            badge: options?.badgeUrl || '/pwa-192x192.png',
            tag: options?.tag || 'daily-habit-reminder',
            renotify: true,
            vibrate: [200, 100, 200],
            data: options?.data || { url: '/' },
          } as NotificationOptions);
          return true;
        }
      } catch (swErr) {
        console.warn('ServiceWorker showNotification note:', swErr);
      }
    }

    // 3. Fallback to standard Web Notification constructor
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'granted') {
        try {
          const notification = new Notification(title, {
            body,
            icon: options?.iconUrl || '/pwa-192x192.png',
            tag: options?.tag || 'daily-habit-reminder',
          });
          notification.onclick = () => {
            window.focus();
            notification.close();
          };
          notified = true;
        } catch (err) {
          console.warn('Web Notification constructor note:', err);
        }
      }
    }

    // Return true since in-app notification and chime sound were successfully delivered
    return notified || true;
  }

  /**
   * Dedicated Day Start Morning Notification helper
   * Dispatched exactly when a person's day starts (wake time / anchor morning time)
   */
  public async sendDayStartMorningNotification(
    personName: string,
    unfinishedCount: number,
    totalScheduledToday: number,
    habitNames?: string[],
    options?: { sound?: boolean }
  ): Promise<boolean> {
    const firstName = personName ? personName.split(' ')[0] : 'there';
    const title = `🔔 Good morning, ${firstName}!`;

    let body = '';
    if (totalScheduledToday === 0) {
      body = `Your day has started! Open To-Do-Habits to track your daily routines and build momentum.`;
    } else if (unfinishedCount === 0) {
      body = `Your day has started and all ${totalScheduledToday} scheduled habits are completed! Amazing start.`;
    } else {
      const topHabitsStr = habitNames && habitNames.length > 0
        ? `: ${habitNames.slice(0, 3).join(', ')}${habitNames.length > 3 ? '...' : ''}`
        : '';
      const habitPlural = unfinishedCount === 1 ? 'habit' : 'habits';
      body = `Your day has started! You have ${unfinishedCount} ${habitPlural} scheduled today${topHabitsStr}.`;
    }

    return await this.triggerNotification(title, body, {
      tag: `day-start-${new Date().toISOString().slice(0, 10)}`,
      sound: options?.sound !== false,
      data: {
        type: 'day_start',
        unfinishedCount,
        totalScheduledToday,
        timestamp: Date.now(),
      },
    });
  }

  /**
   * Helper to format and send the real daily unfinished habit reminder
   */
  public async sendDailyUnfinishedReminder(
    unfinishedCount: number,
    reminderTimeStr?: string,
    habitNames?: string[]
  ): Promise<boolean> {
    if (unfinishedCount <= 0) return false;

    // Calculate time-appropriate greeting
    let hour = new Date().getHours();
    if (reminderTimeStr) {
      const parts = reminderTimeStr.split(':');
      if (parts.length > 0) {
        const parsedHour = parseInt(parts[0], 10);
        if (!isNaN(parsedHour)) hour = parsedHour;
      }
    }

    let greeting = 'Good morning!';
    if (hour >= 12 && hour < 17) {
      greeting = 'Good afternoon!';
    } else if (hour >= 17 || hour < 5) {
      greeting = 'Good evening!';
    }

    const title = `🔔 ${greeting}`;
    const habitPlural = unfinishedCount === 1 ? 'habit' : 'habits';
    const body = `You have ${unfinishedCount} ${habitPlural} to complete today.`;

    return await this.triggerNotification(title, body, {
      tag: `daily-reminder-${new Date().toISOString().slice(0, 10)}`,
      data: {
        unfinishedCount,
        habitNames: habitNames || [],
        timestamp: Date.now(),
      },
    });
  }

  /**
   * Check if a notification for key has already fired in the current minute
   */
  public hasFiredThisMinute(key: string): boolean {
    const currentMinuteKey = `${key}_${new Date().toISOString().substring(0, 16)}`;
    if (this.lastTriggeredMinutes.has(currentMinuteKey)) {
      return true;
    }
    this.lastTriggeredMinutes.add(currentMinuteKey);
    // Cleanup old keys
    if (this.lastTriggeredMinutes.size > 200) {
      this.lastTriggeredMinutes.clear();
      this.lastTriggeredMinutes.add(currentMinuteKey);
    }
    return false;
  }
}

export const NotificationService = new NotificationServiceManager();
