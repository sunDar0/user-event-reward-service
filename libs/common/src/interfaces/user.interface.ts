export interface UserRequest {
  id: string;
  username: string;
  email: string;
  roles: string[];
}

export interface UserPayload {
  sub: string; // 사용자 ID
  username: string;
  email: string;
  roles: string[];
}
