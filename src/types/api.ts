/** Shapes returned by pet-api. Keep these aligned with app/schemas in pet-api. */

export type ApiUserStatus = 0 | 1 | 2;

export interface Role {
  id: number;
  name: string;
  slug: string;
}

export interface ApiUser {
  id: number;
  username: string;
  email: string;
  firstname: string | null;
  lastname: string | null;
  phone: string | null;
  avatar: string | null;
  gender: string | null;
  /** 0 = inactive, 1 = active, 2 = frozen */
  status: ApiUserStatus;
  roles: Role[];
  created_at: string | null;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

export interface LoginParams {
  username: string;
  password: string;
}

export interface RegisterParams {
  username: string;
  email: string;
  password: string;
  firstname?: string;
  lastname?: string;
}

/** Fields `PUT /users/{id}` and `PATCH /me` accept. */
export interface UserUpdateParams {
  firstname?: string | null;
  lastname?: string | null;
  phone?: string | null;
  avatar?: string | null;
  gender?: string;
}

export interface UserListParams {
  page?: number;
  per_page?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  search?: string;
  status?: ApiUserStatus;
  role_id?: number;
}
