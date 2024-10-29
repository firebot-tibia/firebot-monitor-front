import { LucideIcon } from "lucide-react";
import { ExperienceDataItem } from "../../../interfaces/guild-stats-experience-history.interface";
import { OnlineTimeDay, PlayerDeaths } from "../../../interfaces/guild-stats-player.interface";

export interface StatCardProps {
    title: string;
    value: string | number;
    change?: number;
    suffix?: string;
    icon: LucideIcon;
  }

  export interface PlayerDashboardProps {
    experienceData: ExperienceDataItem[];
    onlineHistory: OnlineTimeDay[];
    deathData: PlayerDeaths | null;
    isLoading?: boolean;
  }

  export interface CustomTooltipProps {
    active?: boolean;
    payload?: any[];
    label?: string;
    valueFormatter?: (value: number) => string;
  }

  export interface ChartCardProps {
    title: string;
    children: React.ReactNode;
    action?: React.ReactNode;
    isLoading?: boolean;
  }

  export interface DateSelectorProps {
    dates: Array<{
      date: string;
      label: string;
    }>;
    selectedDate: string;
    onDateChange: (date: string) => void;
  }
