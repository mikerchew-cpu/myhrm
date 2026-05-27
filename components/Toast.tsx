'use client';

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

interface ToastItem {
  id: number;
  message: string;
  type: 'success' | 'error' | '';
}

interface ToastCtx {
  toast: (msg: string, type?: 'success' | 'error' | '') => void;
}

const Ctx = createContext<ToastCtx>({ toast: () => {} });

export function useToast() {
  return useContext(Ctx);
}

let nextId = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);

  const toast = useCallback((msg: string, type: 'success' | 'error' | '' = '') => {
    const id = nextId++;
    setItems(prev => [...prev, { id, message: msg, type }]);
    setTimeout(() => setItems(prev => prev.filter(t => t.id !== id)), 3000);
  }, []);

  return (
    <Ctx.Provider value={{ toast }}>
      {children}
      {items.map(t => (
        <div key={t.id} className={'toast' + (t.type ? ' toast-' + t.type : '')}>
          {t.message}
        </div>
      ))}
    </Ctx.Provider>
  );
}
