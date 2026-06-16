import { createContext, useContext, useEffect, useState } from 'react';

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [username, setUsername] = useState(() => localStorage.getItem('username'));

  useEffect(() => {
    if (token) localStorage.setItem('token', token); else localStorage.removeItem('token');
    if (username) localStorage.setItem('username', username); else localStorage.removeItem('username');
  }, [token, username]);

  const login = (t, u) => { setToken(t); setUsername(u); };
  const logout = () => { setToken(null); setUsername(null); };

  return <AuthCtx.Provider value={{ token, username, login, logout }}>{children}</AuthCtx.Provider>;
}

export const useAuth = () => useContext(AuthCtx);
