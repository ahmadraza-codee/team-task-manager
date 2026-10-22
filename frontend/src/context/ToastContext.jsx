
import { createContext, useCallback, useContext, useState } from 'react';
const Ctx = createContext(null);
export const useToast = () => useContext(Ctx);
let nextId = 1;
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const toast = useCallback((message, type = 'success') => {
    const id = nextId++;
    setToasts(t => [...t, { id, message, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3500);
  }, []);
  return <Ctx.Provider value={{ toast }}>
    {children}
    <div className="fixed bottom-4 right-4 z-[100] space-y-2 w-80 max-w-[90vw]">
      {toasts.map(t => <div key={t.id} className={`rounded-lg px-4 py-3 shadow-lg text-sm text-white ${t.type === 'error' ? 'bg-red-600' : 'bg-emerald-600'}`}>{t.message}</div>)}
    </div>
  </Ctx.Provider>;
}
