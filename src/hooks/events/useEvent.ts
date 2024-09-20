import { useState, useEffect, useRef, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import jwt from 'jsonwebtoken';
import { useRouter } from 'next/navigation';
import { DecodedToken } from '../../shared/interface/auth.interface';

export const useEventSource = (baseUrl: string | null, onMessage: (data: any) => void) => {
  const { data: session, update } = useSession();
  const [error, setError] = useState<Error | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  const retryCount = useRef(0);
  const maxRetries = 3;
  const retryDelay = 5000;
  const router = useRouter();
  const isSettingUp = useRef(false);

  const isTokenExpired = useCallback((token: string): boolean => {
    try {
      const decoded = jwt.decode(token) as DecodedToken;
      const isExpired = decoded.exp <= Math.floor(Date.now() / 1000);
      return isExpired;
    } catch (error) {
      console.error('Error decoding token:', error);
      return true;
    }
  }, []);

  const refreshToken = useCallback(async (): Promise<boolean> => {
    try {
      const result = await update();
      return !!result;
    } catch (error) {
      console.error('Error refreshing token:', error);
      return false;
    }
  }, [update]);

  const getValidToken = useCallback(async (): Promise<string | null> => {
    if (!session?.access_token) {
      return null;
    }

    if (isTokenExpired(session.access_token)) {
      const refreshSuccessful = await refreshToken();
      if (!refreshSuccessful) {
        router.push('/');
        return null;
      }
    }

    return session.access_token;
  }, [session, isTokenExpired, refreshToken, router]);

  const setupEventSource = useCallback(async () => {
    if (isSettingUp.current || !baseUrl) {
      return;
    }

    isSettingUp.current = true;

    try {
      const validToken = await getValidToken();
      if (!validToken) {
        return;
      }

      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }

      const fullUrl = `${baseUrl}${baseUrl.includes('?') ? '&' : '?'}token=${encodeURIComponent(validToken)}`;

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
        eventSourceRef.current?.close();

        if (retryCount.current < maxRetries) {
          retryCount.current += 1;
          setTimeout(() => {
            setupEventSource();
          }, retryDelay);
        } else {
          setError(new Error('Max retry attempts reached'));
        }
      };

      eventSourceRef.current.onopen = () => {
        retryCount.current = 0;
      };
    } catch (setupError) {
      console.error('Error in setupEventSource:', setupError);
      setError(setupError as Error);
    } finally {
      isSettingUp.current = false;
    }
  }, [baseUrl, getValidToken, onMessage]);

  useEffect(() => {
    if (session && baseUrl) {
      setupEventSource();
    }

    return () => {
      eventSourceRef.current?.close();
    };
  }, [session, baseUrl, setupEventSource]);

  return { error };
};