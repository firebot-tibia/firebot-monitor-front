import { useState, useEffect, useRef, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import jwt from 'jsonwebtoken';
import { useRouter } from 'next/navigation';
import { DecodedToken } from '../../shared/interface/auth.interface';

export const useEventSource = (baseUrl: string | null, onMessage: (data: any) => void) => {
  console.log('useEventSource hook initialized', { baseUrl });
  const { data: session, status, update } = useSession();
  const [error, setError] = useState<Error | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  const retryCount = useRef(0);
  const maxRetries = 3;
  const retryDelay = 5000;
  const router = useRouter();
  const isSettingUp = useRef(false);

  const isTokenExpired = useCallback((token: string): boolean => {
    console.log('Checking token expiration');
    try {
      const decoded = jwt.decode(token) as DecodedToken;
      const currentTime = Math.floor(Date.now() / 1000);
      const isExpired = decoded.exp <= currentTime;
      console.log('Token expiration check result:', { isExpired, exp: decoded.exp, currentTime });
      return isExpired;
    } catch (error) {
      console.error('Error decoding token:', error);
      return true;
    }
  }, []);

  const refreshToken = useCallback(async (): Promise<boolean> => {
    console.log('Attempting to refresh token');
    try {
      const result = await update();
      console.log('Token refresh result:', result);
      return !!result;
    } catch (error) {
      console.error('Error refreshing token:', error);
      return false;
    }
  }, [update]);

  const setupEventSource = useCallback(async () => {
    console.log('setupEventSource called', { isSettingUp: isSettingUp.current, baseUrl, sessionExists: !!session?.access_token });
    if (isSettingUp.current || !baseUrl || !session?.access_token) {
      console.log('Aborting setupEventSource');
      return;
    }

    isSettingUp.current = true;
    console.log('Setting up EventSource');

    try {
      if (isTokenExpired(session.access_token)) {
        console.log('Token is expired, attempting refresh');
        const refreshSuccessful = await refreshToken();
        if (!refreshSuccessful) {
          console.log('Token refresh failed, redirecting to home');
          router.push('/');
          return;
        }
        console.log('Token refresh successful');
      }

      if (eventSourceRef.current) {
        console.log('Closing existing EventSource connection');
        eventSourceRef.current.close();
      }

      const fullUrl = `${baseUrl}${baseUrl.includes('?') ? '&' : '?'}token=${encodeURIComponent(session.access_token)}`;
      console.log('Creating new EventSource with URL:', fullUrl);
      eventSourceRef.current = new EventSource(fullUrl);

      eventSourceRef.current.onmessage = (event) => {
        console.log('Received message from EventSource');
        try {
          const data = JSON.parse(event.data);
          console.log('Parsed message data:', data);
          onMessage(data);
        } catch (parseError) {
          console.error('Error parsing event data:', parseError);
        }
      };

      eventSourceRef.current.onerror = (event) => {
        console.error('EventSource error:', event);
        setError(new Error('Connection error'));
        eventSourceRef.current?.close();

        if (retryCount.current < maxRetries) {
          retryCount.current += 1;
          console.log(`Scheduling retry... Attempt ${retryCount.current}`);
          setTimeout(() => {
            console.log(`Retrying connection... Attempt ${retryCount.current}`);
            setupEventSource();
          }, retryDelay);
        } else {
          console.log('Max retry attempts reached');
          setError(new Error('Max retry attempts reached'));
        }
      };

      eventSourceRef.current.onopen = () => {
        console.log('EventSource connection opened successfully');
        retryCount.current = 0;
      };
    } finally {
      console.log('Finished setupEventSource');
      isSettingUp.current = false;
    }
  }, [baseUrl, session, onMessage, isTokenExpired, refreshToken, router]);

  useEffect(() => {
    console.log('useEffect triggered', { status, baseUrl });
    if (status === 'authenticated' && baseUrl) {
      console.log('Conditions met for setupEventSource');
      setupEventSource();
    }

    return () => {
      console.log('Cleanup: closing EventSource connection');
      eventSourceRef.current?.close();
    };
  }, [status, baseUrl, setupEventSource]);

  return { error };
};