/** A tenant (workspace) the signed-in user belongs to. */
export interface Tenant {
  id: string;
  name: string;
  logo: string;
  role: string;
}

export interface AppUser {
  id: string;
  name: string;
  email: string;
}

/** What `POST /api/auth/login` returns. */
export interface AuthResponse {
  token: string;
  user: AppUser;
  tenants: Tenant[];
}
