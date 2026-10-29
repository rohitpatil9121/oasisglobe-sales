import { createContext, useCallback, useContext, useRef, useState } from "react";
import { Icon } from "../components/ui.jsx";

/* App-wide toasts.

   Actions used to complete silently — a request was created, a technician
   assigned, and the only signal was the modal closing. A toast closes that loop:
   a short, self-dismissing confirmation for success and a sticky-ish one for
   failure. It is deliberately tiny; anything that needs a decision belongs in a
   dialog, not here.

   toast.success(msg) / toast.error(msg) / toast.info(msg), or toast(msg, opts). */
const ToastCtx = createContext(null);

let nextId = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timers = useRef(new Map());

  const dismiss = useCallback((id) => {
    setToasts((list) => list.filter((t) => t.id !== id));
    const h = timers.current.get(id);
    if (h) { clearTimeout(h); timers.current.delete(id); }
  }, []);

  const push = useCallback((message, { type = "info", duration = 4000 } = {}) => {
    if (!message) return;
    const id = ++nextId;
    setToasts((list) => [...list, { id, message, type }]);
    // Errors linger a little longer; everything self-dismisses so the stack
    // never grows without bound.
    const ms = type === "error" ? Math.max(duration, 6000) : duration;
    timers.current.set(id, setTimeout(() => dismiss(id), ms));
    return id;
  }, [dismiss]);

  // Attach helpers without re-creating `push` identity every render.
  const toast = useCallback((message, opts) => push(message, opts), [push]);
  toast.success = useCallback((m, o) => push(m, { ...o, type: "success" }), [push]);
  toast.error = useCallback((m, o) => push(m, { ...o, type: "error" }), [push]);
  toast.info = useCallback((m, o) => push(m, { ...o, type: "info" }), [push]);

  return (
    <ToastCtx.Provider value={toast}>
      {children}
      <ToastViewport toasts={toasts} onDismiss={dismiss} />
    </ToastCtx.Provider>
  );
}

const STYLE = {
  success: { ring: "border-emerald-200", dot: "text-emerald-600", icon: "check" },
  error: { ring: "border-red-200", dot: "text-red-600", icon: "alert" },
  info: { ring: "border-ash", dot: "text-brand", icon: "bell" },
};

function ToastViewport({ toasts, onDismiss }) {
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex flex-col items-center gap-2 p-4 sm:items-end sm:p-6"
      aria-live="polite" aria-atomic="false">
      {toasts.map((t) => {
        const s = STYLE[t.type] || STYLE.info;
        return (
          <div key={t.id} role={t.type === "error" ? "alert" : "status"}
            className={`pointer-events-auto flex w-full max-w-sm animate-in items-start gap-2.5 rounded-xl border bg-white px-3.5 py-2.5 shadow-pop ${s.ring}`}>
            <span className={`mt-0.5 shrink-0 ${s.dot}`}><Icon name={s.icon} className="h-4 w-4" /></span>
            <p className="min-w-0 flex-1 text-sm text-slate-700">{t.message}</p>
            <button type="button" onClick={() => onDismiss(t.id)} aria-label="Dismiss"
              className="shrink-0 rounded p-0.5 text-slate-400 transition hover:bg-paper hover:text-slate-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/40">
              <Icon name="x" className="h-3.5 w-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}

// Returns the toast function (with .success/.error/.info). Safe no-op fallback
// so a component rendered outside the provider (tests, storybook) doesn't crash.
export function useToast() {
  const ctx = useContext(ToastCtx);
  return ctx || Object.assign(() => {}, { success: () => {}, error: () => {}, info: () => {} });
}
