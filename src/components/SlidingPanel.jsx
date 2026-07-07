import { useState, useEffect } from "preact/hooks";
import { useWidget } from "../hooks/useWidget";

// Right-side chat drawer. Ported from legacy GravitySAB, minus the floating launcher.
//
// The route IS the launcher now (`/sab`, `/bpp`), so the drawer AUTO-OPENS on mount and
// slides in over the static "fake" page. When it closes we wait for the slide-out
// transition to finish, THEN unmount the children — so the Unoverse SDK tears down its
// WebSocket/stream gracefully rather than mid-animation — and hand control back to the
// host via `onClose` (which returns to the landing page).
export function SlidingPanel({ children, width = "70vw", onClose }) {
  const { isOpen, open, close } = useWidget();

  // The URL opened this channel — so slide in as soon as we mount.
  useEffect(() => {
    open();
  }, [open]);

  const [isMounted, setIsMounted] = useState(true);
  useEffect(() => {
    if (isOpen) {
      setIsMounted(true);
      return;
    }
    // Match the 300ms transition on the panel below before unmounting.
    const t = setTimeout(() => setIsMounted(false), 320);
    return () => clearTimeout(t);
  }, [isOpen]);

  // The APP owns the close control (its own top-right X) — it posts `unoverse:close`, and the
  // host slides the drawer shut, then returns to the landing page. No host-drawn X, so it never
  // clashes with the app's focus-mode X.
  useEffect(() => {
    const onMessage = (e) => {
      if (e.data?.type === "unoverse:close") {
        close();
        onClose?.();
      }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [close, onClose]);

  return (
    <div className="h-full">
      {/* Sliding panel */}
      <div
        className={`fixed inset-y-0 right-0 bg-white shadow-2xl transform transition-all duration-300 ease-in-out z-[9999] ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        style={{ width }}
      >
        {/* Content — unmounted once the drawer is fully closed so the chat
            session (connection, stream) ends gracefully. */}
        <div className="h-full overflow-y-auto">{isMounted ? children : null}</div>
      </div>
    </div>
  );
}

export default SlidingPanel;
