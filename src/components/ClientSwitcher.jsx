import { clients } from "../lib/config";

// Tiny fixed client picker (top-left) — swaps the whole demo skin in one move:
// the template the app loads AND the fake host page behind the drawer.
export function ClientSwitcher({ value, onChange }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.currentTarget.value)}
      aria-label="Demo client"
      className="fixed top-4 left-4 z-[10000] cursor-pointer rounded-md border border-gray-300 bg-white/90 px-2 py-1 text-xs font-medium text-gray-700 shadow-sm backdrop-blur hover:bg-white"
    >
      {Object.entries(clients).map(([key, c]) => (
        <option key={key} value={key}>
          {c.label}
        </option>
      ))}
    </select>
  );
}
