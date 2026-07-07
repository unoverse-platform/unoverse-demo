// Floating chat launcher — the only thing visible over the fake page until the
// user opens the drawer. Ported from legacy GravitySAB; the lucide <Sparkles>
// icon is inlined as SVG so we don't pull in lucide-react.
export function ToggleChatButton({ onClick, position = "fixed bottom-7 right-8" }) {
  return (
    <div className={`${position} z-[9999]`}>
      <div className="relative">
        <div
          className="absolute -inset-1 rounded-full blur-sm opacity-20 animate-pulse"
          style={{ background: "linear-gradient(135deg, rgba(211,49,49,0.4) 0%, rgba(184,42,42,0.4) 100%)" }}
        />

        <button
          onClick={onClick}
          aria-label="Open chat"
          className="
            relative group flex items-center justify-center
            w-20 h-20 rounded-full shadow-lg hover:shadow-xl
            transform hover:scale-110 transition-all duration-300 ease-in-out
          "
          style={{ background: "linear-gradient(135deg, #d33131 0%, #b82a2a 100%)" }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            className="h-10 w-10 text-white transform group-hover:scale-110 transition-transform duration-300"
          >
            <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .962 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.582a.5.5 0 0 1 0 .962L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.962 0z" />
            <path d="M20 3v4" />
            <path d="M22 5h-4" />
            <path d="M4 17v2" />
            <path d="M5 18H3" />
          </svg>
          <span
            className="
              absolute right-full mr-4 bg-white px-3 py-2 rounded-lg
              text-base font-medium text-red-700 shadow-md
              opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap
            "
          >
            Chat with Unoverse
          </span>
        </button>
      </div>
    </div>
  );
}

export default ToggleChatButton;
