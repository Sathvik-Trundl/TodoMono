import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  login: (data: { user: User; token: string }) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('todo_user');
    const savedToken = localStorage.getItem('todo_token');
    if (savedUser && savedToken) {
      setUser(JSON.parse(savedUser));
    } else {
      // Clear if one is missing
      localStorage.removeItem('todo_user');
      localStorage.removeItem('todo_token');
    }
    setIsLoading(false);
  }, []);

  const login = (data: { user: User; token: string }) => {
    setUser(data.user);
    localStorage.setItem('todo_user', JSON.stringify(data.user));
    localStorage.setItem('todo_token', data.token);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('todo_user');
    localStorage.removeItem('todo_token');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
