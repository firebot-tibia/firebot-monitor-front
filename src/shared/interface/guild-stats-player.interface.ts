export interface PlayerModalProps {
    isOpen: boolean;
    onClose: () => void;
    characterName: string | null;
  }
  
export interface OnlineTimeDay {
    date: string;
    online_time_messages: { duration: string; end_time: string; start_time: string; }[] | null;
    total_online_time: number;
    total_online_time_str: string;
}
  
export interface DeathData {
    date: string;
    killers: string[];
    text: string;
}
  
export interface PlayerDeaths {
    deaths: DeathData[];
    last_day: number;
    last_week: number;
    last_month: number;
    name: string;
}
  