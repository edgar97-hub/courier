export interface AuthResponse {
  accessToken: string;
  refreshToken?: string;
  user: {
    id: string;
    username?: string;
    email?: string;
    role?: string;
  };
  expiresIn?: number; // Tiempo de expiración del token en segundos
}
