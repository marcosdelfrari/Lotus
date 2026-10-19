export type Role = "admin" | "client";

export interface Account {
  id: string;
  name: string;
  email: string;
  role: Role;
  planActive: boolean;
}

export interface SessionCookie {
  userId: string;
  role: Role;
  name: string;
  email: string;
}

export interface Session extends SessionCookie {
  planActive: boolean;
}
