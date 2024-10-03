import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { GuildMemberResponse } from '../shared/interface/guild/guild-member.interface';
import { Death } from '../shared/interface/death.interface';

interface ISSEStore {
  enemyGuildData: GuildMemberResponse[];
  allyGuildData: GuildMemberResponse[];
  deathList: Death[];
  newDeathCount: number;
  error: Error | null;
  eventSource: EventSource | null;
  retryCount: number;
  mode: 'ally' | 'enemy';
  setEnemyGuildData: (data: GuildMemberResponse[]) => void;
  setAllyGuildData: (data: GuildMemberResponse[]) => void;
  addDeath: (death: Death) => void;
  setNewDeathCount: (count: number) => void;
  setError: (error: Error | null) => void;
  setEventSource: (eventSource: EventSource | null) => void;
  setRetryCount: (count: number) => void;
  setMode: (mode: 'ally' | 'enemy') => void;
  setupEventSource: (
    baseUrl: string, 
    getAccessToken: () => string | null, 
    getRefreshToken: () => string | null,
    refreshTokenFunc: () => Promise<void>
  ) => Promise<void>;
}

const useSSEStore = create<ISSEStore>()(
  devtools(
    persist(
      (set, get) => ({
        enemyGuildData: [],
        allyGuildData: [],
        deathList: [],
        newDeathCount: 0,
        error: null,
        eventSource: null,
        retryCount: 0,
        mode: 'enemy',

        setEnemyGuildData: (data) => set({ enemyGuildData: data }),
        setAllyGuildData: (data) => set({ allyGuildData: data }),
        addDeath: (death) => set((state) => ({ 
          deathList: [death, ...state.deathList],
          newDeathCount: state.newDeathCount + 1
        })),
        setNewDeathCount: (count) => set({ newDeathCount: count }),
        setError: (error) => set({ error }),
        setEventSource: (eventSource) => set({ eventSource }),
        setRetryCount: (count) => set({ retryCount: count }),
        setMode: (mode) => set({ mode, newDeathCount: 0 }),

        setupEventSource: async (baseUrl, getAccessToken, getRefreshToken, refreshTokenFunc) => {
          console.log('Setting up EventSource');
          const { mode } = get();

          const createEventSource = async () => {
            const accessToken = getAccessToken();
            if (!accessToken) {
              console.error('No access token available');
              return;
            }

            const fullUrl = new URL(`${baseUrl}/${mode}`);
            fullUrl.searchParams.append('token', accessToken);
            console.log('EventSource URL:', fullUrl.toString());

            const eventSource = new EventSource(fullUrl.toString());

            eventSource.onopen = () => {
              console.log('EventSource connection opened');
              get().setRetryCount(0);
            };

            eventSource.onmessage = (event) => {
              console.log('Received message:', event.data);
              try {
                const data = JSON.parse(event.data);
                if (data.enemy && Array.isArray(data.enemy)) {
                  get().setEnemyGuildData(data.enemy);
                }
                if (data.ally && Array.isArray(data.ally)) {
                  get().setAllyGuildData(data.ally);
                }
                if (data.death) {
                  const newDeath: Death = {
                    ...data.death,
                    date: new Date(data.death.date || Date.now()),
                    death: data.death.text,
                  };
                  get().addDeath(newDeath);
                }
              } catch (parseError) {
                console.error('Error parsing event data:', parseError);
              }
            };

            eventSource.onerror = async (error) => {
              console.error('EventSource error:', error);
              eventSource.close();
              
              const currentRetryCount = get().retryCount;
              if (currentRetryCount < 3) {
                get().setRetryCount(currentRetryCount + 1);
                console.log(`Retrying connection (attempt ${currentRetryCount + 1})`);
                
                // Try to refresh the token before retrying
                await refreshTokenFunc();
                setTimeout(createEventSource, 5000);
              } else {
                console.error('Max retry attempts reached');
                set({ error: new Error('Failed to establish SSE connection after multiple attempts') });
              }
            };

            get().setEventSource(eventSource);
          };

          await createEventSource();
        },
      }),
      {
        name: 'sse-store',
      }
    )
  )
);

export default useSSEStore;