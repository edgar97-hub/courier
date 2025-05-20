export interface AuthResponse {
  accessToken: string;
  refreshToken?: string;
  user: {
    id: string;
    username?: string;
    email?: string;
    rol?: string;
  };
  expiresIn?: number; // Tiempo de expiración del token en segundos
}
