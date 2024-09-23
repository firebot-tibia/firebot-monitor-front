export interface DeletedAt {
    time: string;
    valid: boolean;
}
  
export interface Respawn {
    created_at: string;
    deleted_at: DeletedAt;
    description: string;
    id: string;
    name: string;
}
  
export interface Reservation {
    created_at: string;
    deleted_at: DeletedAt;
    end_time: string;
    guild_id: string;
    id: string;
    reserved_by: string;
    reserved_for: string;
    respawn: Respawn;
    start_time: string; 
    status: 'reserved' | 'canceled' | 'free';
}
  
export interface ReservationsListResponse {
    reservations: Reservation[];
}

export interface CreateReservationData {
  end_time: string;
  reserved_for: string;
  respawn_id: string;
  start_time: string;
}
