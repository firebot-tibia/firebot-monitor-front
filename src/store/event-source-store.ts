import { create } from 'zustand';
import { Session } from 'next-auth';

type MonitorMode = 'ally' | 'enemy';

interface GlobalState {
  mode: MonitorMode;
  error: Error | null;
  eventSource: EventSource | null;
  isSettingUp: boolean;
  isConnected: boolean;
  onMessage: (data: any) => void;
  reconnectTimeout: NodeJS.Timeout | null;
  reconnectAttempts: number;
  setMode: (mode: MonitorMode) => void;
  setError: (error: Error | null) => void;
  setEventSource: (eventSource: EventSource | null) => void;
  setIsSettingUp: (isSettingUp: boolean) => void;
  setReconnectTimeout: (timeout: NodeJS.Timeout | null) => void;
  setupEventSource: (baseUrl: string, getSession: () => Promise<Session | null>, onMessage: (data: any) => void) => Promise<void>;
  closeEventSource: () => void;
  init: () => void;
}

const useEventSourceGlobal = create<GlobalState>()((set, get) => ({
  mode: 'enemy',
  error: null,
  eventSource: null,
  isSettingUp: false,
  isConnected: false,
  onMessage: () => {},
  reconnectTimeout: null,
  reconnectAttempts: 0,

  setMode: (mode) => {
    set({ mode });
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('monitorMode', mode);
    }
    get().closeEventSource();
  },

  setError: (error) => set({ error }),
  setEventSource: (eventSource) => set({ eventSource }),
  setIsSettingUp: (isSettingUp) => set({ isSettingUp }),
  setReconnectTimeout: (timeout) => set({ reconnectTimeout: timeout }),

  setupEventSource: async (baseUrl, getSession, onMessage) => {
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

      const fullUrl = `${baseUrl}${baseUrl.includes('?') ? '&' : '?'}token=${encodeURIComponent(session.access_token)}`;

      const newEventSource = new EventSource(fullUrl);

      newEventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          onMessage(data);
        } catch (parseError) {
          console.error('Error parsing event data:', parseError);
        }
      };

      newEventSource.onerror = (event) => {
        console.error('EventSource error:', event);
        newEventSource.close();
        set({ isConnected: false, isSettingUp: false });

        const nextAttempt = reconnectAttempts + 1;
        const delay = Math.min(1000 * (2 ** nextAttempt), 30000);

        console.log(`Attempting to reconnect in ${delay}ms (attempt ${nextAttempt})`);

        const newTimeout = setTimeout(() => {
          get().setupEventSource(baseUrl, getSession, onMessage);
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
      console.error('Error in setupEventSource:', setupError);
      set({ error: setupError as Error, isSettingUp: false });
      
      const nextAttempt = reconnectAttempts + 1;
      const delay = Math.min(1000 * (2 ** nextAttempt), 30000);

      console.log(`Attempting to reconnect in ${delay}ms (attempt ${nextAttempt})`);

      const newTimeout = setTimeout(() => {
        get().setupEventSource(baseUrl, getSession, onMessage);
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

  init: () => {
    if (typeof window !== 'undefined') {
      const storedMode = window.localStorage.getItem('monitorMode');
      if (storedMode === 'ally' || storedMode === 'enemy') {
        set({ mode: storedMode as MonitorMode });
      }
    }
  },
}));

export default useEventSourceGlobal;