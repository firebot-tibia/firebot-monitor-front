import { GuildMemberResponse } from "../interface/guild-member.interface";

export const normalizeTimeOnline = (timeOnline: string): string => {
    return timeOnline && timeOnline.trim() !== '' ? timeOnline : '00:00:00';
};

export const isOnline = (member: GuildMemberResponse): boolean => {
    const normalizedTime = normalizeTimeOnline(member.TimeOnline);
    return normalizedTime !== '00:00:00';
};