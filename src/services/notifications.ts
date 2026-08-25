/**
 * Client-Side Notification & Real-Time Habit Reminder Service
 */

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
   * Request browser permission for system notifications
   */
  public async requestPermission(): Promise<'granted' | 'denied' | 'default'> {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return 'denied';
    }
    try {
      const perm = await Notification.requestPermission();
      return perm;
    } catch (e) {
      console.warn('Could not request notification permission:', e);
      return 'denied';
    }
  }

  public getPermissionStatus(): 'granted' | 'denied' | 'default' {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return 'denied';
    }
    return Notification.permission;
  }

  /**
   * Play a clean, gentle melodic chime using Web Audio API
   */
  public playChime(type: 'reminder' | 'completion' | 'streak' = 'reminder') {
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;

      const now = ctx.currentTime;

      if (type === 'completion') {
        // High upbeat dual chime: C6 (1046Hz) -> E6 (1318Hz)
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
        // Triple celebratory chime: F5 (698Hz) -> A5 (880Hz) -> C6 (1046Hz)
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
        // Soft gentle reminder bell: A5 (880Hz) -> D6 (1174Hz)
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
   * Trigger a browser notification
   */
  public triggerNotification(title: string, body: string, iconUrl?: string) {
    this.playChime('reminder');

    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(title, {
          body,
          icon: iconUrl || '/favicon.ico',
        });
      } catch (err) {
        console.warn('Browser notification error:', err);
      }
    }
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
