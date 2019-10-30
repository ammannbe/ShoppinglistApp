export interface User {
  id: number;
  email: string;
  password: string;
  offline_only: boolean;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date;
}
