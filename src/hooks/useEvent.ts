import { useState, useEffect, useRef, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { refreshAccessToken } from '../services/auth';

export const useEventSource = (baseUrl: string | null, onMessage: (data: any) => void) => {
  const { data: session, status, update } = useSession();
  const [error, setError] = useState<Error | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  const retryCount = useRef(0);
  const maxRetries = 3;
  const retryDelay = 5000;

  const setupEventSource = useCallback(async () => {
    if (!baseUrl || !session?.access_token) return;

    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    const tokenExp = session.user.exp ? session.user.exp * 1000 : 0;
    const fiveMinutesFromNow = Date.now() + 5 * 60 * 1000;

    if (tokenExp < fiveMinutesFromNow) {
      try {
        const newSession = await refreshAccessToken(session);
        await update(newSession);
      } catch (refreshError) {
        console.error('Failed to refresh token:', refreshError);
        setError(new Error('Failed to refresh access token'));
        return;
      }
    }

    const fullUrl = `${baseUrl}${baseUrl.includes('?') ? '&' : '?'}token=${encodeURIComponent(session.access_token)}`;
    eventSourceRef.current = new EventSource(fullUrl);

    eventSourceRef.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        onMessage(data);
      } catch (parseError) {
        console.error('Error parsing event data:', parseError);
      }
    };

    eventSourceRef.current.onerror = async (event) => {
      console.error('EventSource error:', event);
      setError(new Error('Connection error'));
      eventSourceRef.current?.close();

      if (retryCount.current < maxRetries) {
        retryCount.current += 1;
        setTimeout(() => {
          console.log(`Retrying connection... Attempt ${retryCount.current}`);
          setupEventSource();
        }, retryDelay);
      } else {
        setError(new Error('Max retry attempts reached'));
      }
    };

    eventSourceRef.current.onopen = () => {
      console.log('EventSource connection opened');
      retryCount.current = 0;
    };
  }, [baseUrl, session, onMessage, update]);

  useEffect(() => {
    if (status === 'authenticated' && baseUrl) {
      setupEventSource();
    }

    return () => {
      eventSourceRef.current?.close();
    };
  }, [status, baseUrl, setupEventSource]);

  return { error };
};