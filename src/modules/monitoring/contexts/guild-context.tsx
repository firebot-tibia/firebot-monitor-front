import type { ReactNode } from 'react'
import { createContext, useContext, useCallback, useState, useEffect, useMemo, useRef } from 'react'

import { FIREBOT_SSE_URL } from '@/core/constants/env'
import { useStorage } from '@/core/store/storage-store'
import type { GuildMemberResponse } from '@/core/types/guild-member.response'
import { formatTimeOnline } from '@/core/utils/format-time-online'

import { useCharacterTypes } from '../hooks/useCharacterTypes'
import { useSSE } from '../hooks/useSSE'

interface GuildContextData {
  isLoading: boolean
  status: string
  types: string[]
  addType: (type: string) => void
  handleLocalChange: (member: GuildMemberResponse, newLocal: string) => Promise<void>
  handleClassificationChange: (
    member: GuildMemberResponse,
    newClassification: string,
  ) => Promise<void>
  groupedData: Array<{ type: string; data: GuildMemberResponse[]; onlineCount: number }>
  guildData: GuildMemberResponse[]
}

const GuildContext = createContext<GuildContextData | undefined>(undefined)

// Create a member map for O(1) lookups
type MemberMap = Map<string, GuildMemberResponse>;

export function GuildProvider({ children }: { children: ReactNode }) {
  const [value] = useStorage('monitorMode', 'enemy')
  const [guildData, setGuildData] = useState<GuildMemberResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [characterChanges, setCharacterChanges] = useState<GuildMemberResponse[]>([])
  const { types, addType } = useCharacterTypes(guildData)

  // Use a ref for memberMap to avoid recreating it on every render
  const memberMapRef = useRef<MemberMap>(new Map());

  // Timestamping-related refs to avoid unnecessary renders
  const lastUpdateRef = useRef(Date.now());
  const frameIdRef = useRef<number | null>(null);

  // Handle SSE messages efficiently
  const handleMessage = useCallback(
    (data: any) => {
      if (data?.[value]) {
        const now = new Date();
        // Use a single transform on the incoming data
        const processedData = data[value].map((member: GuildMemberResponse) => {
          if (!member.OnlineStatus) {
            return { ...member, OnlineSince: null, TimeOnline: null };
          }

          const onlineSince = member.OnlineSince || now.toISOString();
          return {
            ...member,
            OnlineSince: onlineSince,
            TimeOnline: formatTimeOnline(new Date(onlineSince), now)
          };
        });

        // Update the data and rebuild the member map
        setGuildData(processedData);

        // Update our reference map for O(1) lookups
        const newMemberMap = new Map();
        processedData.forEach((member: { Name: any }) => {
          newMemberMap.set(member.Name, member);
        });
        memberMapRef.current = newMemberMap;
      }

      if (data?.[`${value}-changes`]) {
        // Use batch updates for changes
        setGuildData(prevData => {
          const newChanges: GuildMemberResponse[] = [];
          const updatedData = prevData.map(member => {
            const change = data[`${value}-changes`][member.Name];
            if (!change) return member;

            const now = new Date();
            let updatedMember = { ...member };

            if (change.ChangeType === 'logged-in') {
              updatedMember = {
                ...updatedMember,
                ...change.Member,
                OnlineStatus: true,
                OnlineSince: now.toISOString(),
                TimeOnline: '00:00:00',
              };
              newChanges.push(updatedMember);
            } else if (change.ChangeType === 'logged-out') {
              updatedMember = {
                ...updatedMember,
                ...change.Member,
                OnlineStatus: false,
                OnlineSince: null,
                TimeOnline: null,
              };
            } else {
              updatedMember = { ...updatedMember, ...change.Member };
            }

            // Update our reference map
            memberMapRef.current.set(updatedMember.Name, updatedMember);
            return updatedMember;
          });

          if (newChanges.length > 0) {
            setCharacterChanges(prev => [...prev, ...newChanges]);
          }

          return updatedData;
        });
      }

      setIsLoading(false);
    },
    [value],
  );

  // Single efficient time update mechanism using requestAnimationFrame
  useEffect(() => {
    const updateTimes = () => {
      const now = Date.now();
      // Only update if sufficient time has passed (throttle updates)
      if (now - lastUpdateRef.current >= 1000) {
        lastUpdateRef.current = now;
        const nowDate = new Date(now);

        // Using a functional update to ensure we have the latest state
        setGuildData(prevData => {
          // Only update if we have online members
          const hasOnlineMembers = prevData.some(m => m.OnlineStatus);
          if (!hasOnlineMembers) return prevData;

          return prevData.map(member => {
            if (!member.OnlineStatus || !member.OnlineSince) return member;

            return {
              ...member,
              TimeOnline: formatTimeOnline(new Date(member.OnlineSince), nowDate)
            };
          });
        });
      }

      frameIdRef.current = requestAnimationFrame(updateTimes);
    };

    frameIdRef.current = requestAnimationFrame(updateTimes);

    // Cleanup on unmount
    return () => {
      if (frameIdRef.current) {
        cancelAnimationFrame(frameIdRef.current);
      }
    };
  }, []);

  // Reconnect SSE every 5 minutes to refresh data
  const { status, reconnect } = useSSE({
    endpoint: `${FIREBOT_SSE_URL}${value}/`,
    onMessage: handleMessage,
    bufferSize: 0,  // Disable buffering for real-time updates
    throttle: 50,   // Fast updates (milliseconds)
    reconnectInterval: 5,  // Faster reconnection
  });

  // Force refresh every 5 minutes
  useEffect(() => {
    const refreshInterval = setInterval(() => {
      console.log('Refreshing guild data...');
      reconnect(); // This will close and reopen the SSE connection
    }, 5 * 60 * 500); // 5 minutes in milliseconds

    return () => clearInterval(refreshInterval);
  }, [reconnect]);

  // Memoize expensive operations
  const groupedData = useMemo(() => {
    return guildData.reduce<Array<{
      type: string;
      data: GuildMemberResponse[];
      onlineCount: number
    }>>(
      (acc, member) => {
        const type = member.Kind || 'sem classificação';
        const existingGroup = acc.find(group => group.type === type);

        if (existingGroup) {
          existingGroup.data.push(member);
          if (member.OnlineStatus) {
            existingGroup.onlineCount++;
          }
        } else {
          acc.push({
            type,
            data: [member],
            onlineCount: member.OnlineStatus ? 1 : 0,
          });
        }

        return acc;
      },
      []
    );
  }, [guildData]);

  // Optimize member updates with O(1) lookups
  const handleLocalChange = useCallback(async (member: GuildMemberResponse, newLocal: string) => {
    setGuildData(prevData => {
      // Use map for O(1) lookups instead of findIndex (O(n))
      const targetMember = memberMapRef.current.get(member.Name);
      if (!targetMember) return prevData;

      // Update the map
      memberMapRef.current.set(member.Name, { ...targetMember, Local: newLocal });

      // Return new array with updated member
      return prevData.map(m =>
        m.Name === member.Name ? { ...m, Local: newLocal } : m
      );
    });
  }, []);

  const handleClassificationChange = useCallback(
    async (member: GuildMemberResponse, newClassification: string) => {
      setGuildData(prevData => {
        // Use map for O(1) lookups
        const targetMember = memberMapRef.current.get(member.Name);
        if (!targetMember) return prevData;

        // Update the map
        memberMapRef.current.set(member.Name, { ...targetMember, Kind: newClassification });

        // Return new array with updated member
        return prevData.map(m =>
          m.Name === member.Name ? { ...m, Kind: newClassification } : m
        );
      });
    },
    [],
  );

  return (
    <GuildContext.Provider
      value={{
        isLoading,
        status,
        types,
        addType,
        handleLocalChange,
        handleClassificationChange,
        groupedData,
        guildData,
      }}
    >
      {children}
    </GuildContext.Provider>
  );
}

export function useGuildContext() {
  const context = useContext(GuildContext);
  if (!context) {
    throw new Error('useGuildContext must be used within a GuildProvider');
  }
  return context;
}
