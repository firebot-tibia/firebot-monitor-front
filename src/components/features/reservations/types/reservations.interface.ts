export interface DeletedAt {
  Time: string
  Valid: boolean
}

export interface Respawn {
  id?: string
  created_at?: string
  updated_at?: string
  deleted_at?: DeletedAt
  name: string
  description?: string
  premium?: boolean
  image?: string
}

export interface Reservation {
  id: string
  created_at: string
  updated_at: string
  deleted_at: DeletedAt
  respawn_id: string
  ally_guild_id: string
  enemy_guild_id: string
  start_time: string
  end_time: string
  status: string
  respawn: Respawn
  reserved_by: string
  reserved_for: string
}

export interface CreateReservationData {
  end_time: string
  reserved_for: string
  respawn_id: string
  start_time: string
  kind: string
  world: string
}
