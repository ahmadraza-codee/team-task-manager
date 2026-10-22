
import { createContext, useContext, useEffect, useState } from 'react'; import { api } from '../lib/api';
const Ctx=createContext(null); export const useAuth=()=>useContext(Ctx);
export function AuthProvider({children}){ const [user,setUser]=useState(null); const [loading,setLoading]=useState(true);
  useEffect(()=>{ api.me().then(d=>setUser(d.user)).catch(()=>setUser(null)).finally(()=>setLoading(false)); },[]);
  const login=async(b)=>{ const d=await api.login(b); setUser(d.user); return d; };
  const register=async(b)=>{ const d=await api.register(b); setUser(d.user); return d; };
  const logout=async()=>{ await api.logout().catch(()=>{}); setUser(null); };
  return <Ctx.Provider value={{user,loading,login,register,logout}}>{children}</Ctx.Provider>;
}
