import { createContext, useEffect, useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useSearchParams } from 'next/navigation'
import { useDispatch } from 'react-redux';
import { handleLogin, handleLogout } from './authActions';

type User = {
  about: string;
  role: string;
  active: boolean;
  agreedTerms?: boolean;
  as_trainer_apply: boolean;
  availability: string;
  createdAt: string;
  email: string;
  emailConfirmed: boolean;
  emailResetToken: string;
  enrolled_courses: any[];
  name: string;
  phone: string;
  rate: number;
  skills: string[];
  address: string;
  updatedAt: string;
  _id: string;
  isAuthenticated: boolean; // Required field now
};

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  login: (user: User, isToastMessage?: boolean) => Promise<void>;
  logout: () => Promise<void>;
  token: string | null;
}

const defaultProvider: AuthContextType = {
  user: null,
  loading: false,
  setUser: () => null,
  setLoading: () => null,
  login: () => Promise.resolve(),
  logout: () => Promise.resolve(),
  isAuthenticated: false,
  token: null
};

const AuthContext = createContext<AuthContextType>(defaultProvider);

interface AuthProviderProps {
  children: React.ReactNode;
  userData?: User | null;
}

const AuthProvider = ({
  children,
  userData
}: AuthProviderProps) => {
  const dispatch = useDispatch();
  const searchParams = useSearchParams();
  const router = useRouter();

  // Initialize state from server-side data
  const [user, setUser] = useState<User | null>(userData || null);
  const [loading, setLoading] = useState<boolean>(false);
  const [token] = useState<string | null>(null);

  // Determine authentication status from user object
  const isAuthenticated = useMemo(() => {
    return user?.isAuthenticated ?? false;
  }, [user]);

  const setUserOnly = useCallback((newUser: User | null) => {
    setUser(newUser);
  }, []);

  // Sync with userData prop changes (from server-side updates)
  useEffect(() => {
    if (userData !== undefined) {
      setUserOnly(userData);
    }
  }, [userData, setUserOnly]);

  // Debug logging
  useEffect(() => {
    console.log('Debug:: AuthContext state updated: ', user)
  }, [user, isAuthenticated]);

  const login = useMemo(() =>
    async (loginUser: User, isToastMessage = true) => {
      // Ensure isAuthenticated is set to true during login
      const authenticatedUser = { ...loginUser, isAuthenticated: true };
      return handleLogin(authenticatedUser, setUserOnly, router, searchParams, isToastMessage);
    },
    [router, searchParams, setUserOnly]
  );

  const logout = useMemo(() =>
    async () => {
      return handleLogout(setUserOnly, router, dispatch);
    },
    [router, dispatch, setUserOnly]
  );

  const values: AuthContextType = useMemo(() => ({
    isAuthenticated,
    user,
    loading,
    setUser: setUserOnly,
    setLoading,
    login,
    logout,
    token
  }), [isAuthenticated, user, loading, token, login, logout, setUserOnly]);

  return <AuthContext.Provider value={values}>{children}</AuthContext.Provider>;
};

export { AuthContext, AuthProvider };