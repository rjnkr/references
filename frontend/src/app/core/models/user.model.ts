/** Shape returned by `GET /api/auth/me`. */
export interface AuthUser {
  id: string;
  email: string;
  name: string;
}
