export type UserRole = 'ADMIN' | 'PARKING_ATTENDANT';

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

export interface SignUpFormData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
}

export interface LoginFormData {
  email: string;
  password: string;
}

export interface ResetPasswordFormData {
  password: string;
  confirmPassword: string;
  token: string;
}

export interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  error: string | null;
  login: (data: LoginFormData) => Promise<void>;
  signUp: (data: SignUpFormData) => Promise<void>;
  logout: () => Promise<void>;
}
