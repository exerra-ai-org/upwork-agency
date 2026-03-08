export interface JwtPayload {
  sub: string; // userId
  email: string;
  role: string;
  teamId?: string;
}
