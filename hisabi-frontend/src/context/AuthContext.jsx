import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('hisabi_token');
    const savedUser = localStorage.getItem('hisabi_user');
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const loginUser = (userData, jwt) => {
    setUser(userData);
    setToken(jwt);
    localStorage.setItem('hisabi_token', jwt);
    localStorage.setItem('hisabi_user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('hisabi_token');
    localStorage.removeItem('hisabi_user');
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, loginUser, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
