import { createContext, useCallback, useContext, useRef, useState } from 'react';
import { ConfirmDialog } from './ConfirmDialog';

const ConfirmContext = createContext(undefined);

export function ConfirmProvider({ children }) {
  const [state, setState] = useState({ open: false, title: '', message: '', confirmLabel: 'Confirm', danger: true });
  const resolverRef = useRef(null);

  const confirm = useCallback((options) => {
    setState({ open: true, confirmLabel: 'Confirm', danger: true, ...options });
    return new Promise((resolve) => { resolverRef.current = resolve; });
  }, []);

  function handleConfirm() {
    resolverRef.current?.(true);
    setState((s) => ({ ...s, open: false }));
  }

  function handleCancel() {
    resolverRef.current?.(false);
    setState((s) => ({ ...s, open: false }));
  }

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <ConfirmDialog {...state} onConfirm={handleConfirm} onCancel={handleCancel} />
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error('useConfirm must be used within ConfirmProvider');
  return ctx;
}