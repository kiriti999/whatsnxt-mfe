// ** Types
export interface AuthContextType {
  user: AuthenticatedUserType | null;
  loading: boolean;
  isAuthenticated: boolean;
  setUser: (user: AuthenticatedUserType | null) => void;
  setLoading: (loading: boolean) => void;
  login: (
    params: LoginParamsType,
    errorCallback?: (error: Error) => void
  ) => Promise<void>;
  logout: () => Promise<void>;
  profileApi: () => Promise<void>;
}

export interface AuthenticatedUserType {
  id?: string;
  name?: string;
  email?: string;
  image?: string;
  creator?: boolean;
}

export interface LoginParamsType {
  email: string;
  password: string;
  callbackUrl?: string;
  redirect?: boolean;
}