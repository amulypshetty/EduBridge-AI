import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { authAPI } from '../api/services';

const AuthContext = createContext(null);

export function getDashboardPath(role) {
  switch (role) {
    case 'student':
      return '/student/dashboard';
    case 'faculty':
      return '/faculty/dashboard';
    case 'admin':
      return '/admin/dashboard';
    default:
      return '/';
  }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [initializing, setInitializing] = useState(Boolean(localStorage.getItem('token')));

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  }, []);

  const refreshProfile = useCallback(async () => {
    const activeToken = localStorage.getItem('token');
    if (!activeToken) {
      setInitializing(false);
      return null;
    }
    try {
      const { data } = await authAPI.getProfile();
      const profileUser = data?.user;
      if (profileUser) {
        setUser((prev) => {
          const merged = { ...prev, ...profileUser };
          localStorage.setItem('user', JSON.stringify(merged));
          return merged;
        });
      }
      return profileUser;
    } catch {
      return null;
    } finally {
      setInitializing(false);
    }
  }, []);

  useEffect(() => {
    refreshProfile();
  }, [refreshProfile]);

  useEffect(() => {
    const handleUnauthorized = () => {
      setToken(null);
      setUser(null);
    };
    window.addEventListener('edubridge:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('edubridge:unauthorized', handleUnauthorized);
  }, []);

  const login = async (email, password) => {
    const { data } = await authAPI.login({ email, password });
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
    return data;
  };

  const register = async (full_name, email, password, role, faculty_code) => {
    const payload = { full_name, email, password };
    if (role) payload.role = role;
    if (faculty_code) payload.faculty_code = faculty_code;
    const { data } = await authAPI.register(payload);
    // Auto-login if server returns a token (faculty/student registration)
    if (data?.token && data?.user) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);
    }
    return data;
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        isAuthenticated: Boolean(token && user),
        initializing,
        login,
        register,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
