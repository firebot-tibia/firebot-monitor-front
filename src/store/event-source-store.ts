import { create } from 'zustand';
import { Session } from 'next-auth';

interface GlobalState {
  error: Error | null;
  eventSource: EventSource | null;
  isSettingUp: boolean;
  isConnected: boolean;
  onMessage: (data: any) => void;
  reconnectTimeout: NodeJS.Timeout | null;
  reconnectAttempts: number;
  setError: (error: Error | null) => void;
  setEventSource: (eventSource: EventSource | null) => void;
  setIsSettingUp: (isSettingUp: boolean) => void;
  setReconnectTimeout: (timeout: NodeJS.Timeout | null) => void;
  setupEventSource: (baseUrl: string, getSession: () => Promise<Session | null>, onMessage: (data: any) => void, selectedWorld: string) => Promise<void>;
  closeEventSource: () => void;
  initializeEventSource: (baseUrl: string, getSession: () => Promise<Session | null>, onMessage: (data: any) => void, selectedWorld: string) => void;
}

const useEventSourceGlobal = create<GlobalState>()((set, get) => ({
  error: null,
  eventSource: null,
  isSettingUp: false,
  isConnected: false,
  onMessage: () => {},
  reconnectTimeout: null,
  reconnectAttempts: 0,

  setError: (error) => set({ error }),
  setEventSource: (eventSource) => set({ eventSource }),
  setIsSettingUp: (isSettingUp) => set({ isSettingUp }),
  setReconnectTimeout: (timeout) => set({ reconnectTimeout: timeout }),

  setupEventSource: async (baseUrl, getSession, onMessage, selectedWorld) => {
    const { isSettingUp, isConnected, reconnectTimeout, reconnectAttempts } = get();
 
    if (isSettingUp || isConnected) {
      return;
    }

    if (reconnectTimeout) {
      clearTimeout(reconnectTimeout);
      get().setReconnectTimeout(null);
    }

    set({ isSettingUp: true });

    try {
      const session = await getSession();
      if (!session?.access_token) {
        throw new Error('No valid session');
      }

      const fullUrl = `${baseUrl}${baseUrl.includes('?') ? '&' : '?'}token=${encodeURIComponent(session.access_token)}&world=${selectedWorld}`;
      const newEventSource = new EventSource(fullUrl);

      newEventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          onMessage(data);
        } catch (parseError) {
          console.error('Error parsing event data:', parseError);
        }
      };

      newEventSource.onerror = () => {
        newEventSource.close();
        set({ isConnected: false, isSettingUp: false });

        const nextAttempt = reconnectAttempts + 1;
        const delay = Math.min(1000 * (2 ** nextAttempt), 30000);

        const newTimeout = setTimeout(() => {
          get().setupEventSource(baseUrl, getSession, onMessage, selectedWorld);
        }, delay);

        set({ reconnectAttempts: nextAttempt });
        get().setReconnectTimeout(newTimeout);
      };

      newEventSource.onopen = () => {
        console.log('EventSource connection opened');
        set({ isConnected: true, isSettingUp: false, reconnectAttempts: 0 });
      };

      set({ eventSource: newEventSource, onMessage });

    } catch (setupError) {
      set({ error: setupError as Error, isSettingUp: false });
      const nextAttempt = reconnectAttempts + 1;
      const delay = Math.min(1000 * (2 ** nextAttempt), 30000);
      const newTimeout = setTimeout(() => {
        get().setupEventSource(baseUrl, getSession, onMessage, selectedWorld);
      }, delay);

      set({ reconnectAttempts: nextAttempt });
      get().setReconnectTimeout(newTimeout);
    }
  },

  closeEventSource: () => {
    const { eventSource, reconnectTimeout } = get();
    if (eventSource) {
      eventSource.close();
      set({ eventSource: null, isConnected: false, reconnectAttempts: 0 });
    }
    if (reconnectTimeout) {
      clearTimeout(reconnectTimeout);
      set({ reconnectTimeout: null });
    }
  },

  initializeEventSource: (baseUrl, getSession, onMessage, selectedWorld) => {
    const { isConnected, eventSource } = get();
    if (isConnected || eventSource) {
      get().closeEventSource();
    }
    get().setupEventSource(baseUrl, getSession, onMessage, selectedWorld);
  },
}));

export default useEventSourceGlobal;