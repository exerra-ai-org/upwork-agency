'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  getToken,
  setToken,
  removeToken,
  isAuthenticated,
  getUser,
  type TokenUser,
} from '@/lib/auth';
import api from '@/lib/api';

interface UseAuthReturn {
  user: TokenUser | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

export function useAuth(): UseAuthReturn {
  const router = useRouter();
  const [user, setUser] = useState<TokenUser | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const authenticated = isAuthenticated();
    setIsLoggedIn(authenticated);
    setUser(authenticated ? getUser() : null);
    setIsLoading(false);
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      const response = await api.post('/auth/login', { email, password });
      const { token } = response.data;
      setToken(token);
      const currentUser = getUser();
      setUser(currentUser);
      setIsLoggedIn(true);
      router.push('/');
    },
    [router],
  );

  const logout = useCallback(() => {
    removeToken();
    setUser(null);
    setIsLoggedIn(false);
    router.push('/login');
  }, [router]);

  return { user, isLoggedIn, isLoading, login, logout };
}
