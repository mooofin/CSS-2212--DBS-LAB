import { useState, useCallback, createContext, useContext, useEffect, useRef } from 'react';

const ToastContext = createContext(null);

export function useToast() {
    return useContext(ToastContext);
}

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);
    const timeoutsRef = useRef({});

    useEffect(() => {
        return () => {
            // Cleanup all timeouts on unmount
            Object.values(timeoutsRef.current).forEach(clearTimeout);
        };
    }, []);

    const addToast = useCallback((message, type = 'success') => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);
        
        const timeoutId = setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
            delete timeoutsRef.current[id];
        }, 3500);
        
        timeoutsRef.current[id] = timeoutId;
    }, []);

    const toast = {
        success: (msg) => addToast(msg, 'success'),
        error: (msg) => addToast(msg, 'error'),
        info: (msg) => addToast(msg, 'info'),
    };

    return (
        <ToastContext.Provider value={toast}>
            {children}
            <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2">
                {toasts.map(t => (
                    <div
                        key={t.id}
                        className={`toast-enter px-4 py-3 rounded-lg shadow-lg text-sm font-medium text-white max-w-sm
              ${t.type === 'success' ? 'bg-emerald-600' : ''}
              ${t.type === 'error' ? 'bg-red-600' : ''}
              ${t.type === 'info' ? 'bg-blue-600' : ''}
            `}
                    >
                        {t.message}
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
}
