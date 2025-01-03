export interface ExperienceDataItem {
  average_experience_per_hour: number
  date: string
  exp_change: number
  experience: number
  level: number
  level_change: number
  time_online: string
}

export interface PlayerExperienceProps {
  characterName: string
}
