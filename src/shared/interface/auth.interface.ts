export interface AuthDTO {
    email?: string;
    password?: string;
}
  
  export interface DecodedToken {
    ally_guild: string;
    email: string;
    enemy_guild: string;
    exp: number;
    status: string;
    sub: string;
}