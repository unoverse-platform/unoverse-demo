import { useState, useEffect } from "preact/hooks";
import { useWidget } from "./useWidget";
import { ToggleChatButton } from "./ToggleChatButton";

// Right-side chat drawer + floating launcher. Ported from legacy GravitySAB.
//
// The chat lives in a panel that slides in over a static "fake" page. When the
// drawer closes we wait for the slide-out transition to finish, THEN unmount the
// children — so the Unoverse SDK tears down its WebSocket/stream gracefully
// rather than mid-animation.
export function SlidingPanel({ children, width = "70vw" }) {
  const { isOpen, open, close } = useWidget();

  const [isMounted, setIsMounted] = useState(isOpen);
  useEffect(() => {
    if (isOpen) {
      setIsMounted(true);
      return;
    }
    // Match the 300ms transition on the panel below before unmounting.
    const t = setTimeout(() => setIsMounted(false), 320);
    return () => clearTimeout(t);
  }, [isOpen]);

  return (
    <div className="h-full">
      {/* Sliding panel */}
      <div
        className={`fixed inset-y-0 right-0 bg-white shadow-2xl transform transition-all duration-300 ease-in-out z-[9999] ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        style={{ width }}
      >
        {/* Close button */}
        <button
          onClick={close}
          aria-label="Close chat"
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            className="h-6 w-6 text-gray-600"
          >
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
          </svg>
        </button>

        {/* Content — unmounted once the drawer is fully closed so the chat
            session (connection, stream) ends gracefully. */}
        <div className="h-full overflow-y-auto">{isMounted ? children : null}</div>
      </div>

      {/* Launcher (shown when the drawer is closed) */}
      {!isOpen && <ToggleChatButton onClick={open} />}
    </div>
  );
}

export default SlidingPanel;
