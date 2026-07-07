import { getRoute } from "../lib/config";
import { LandingPage } from "./LandingPage";
import { ClientDemo } from "./ClientDemo";

/**
 * Top-level path router. The URL alone decides what mounts:
 *   `/`            → the Unoverse landing page (the hub)
 *   `/sab`, `/bpp` → that channel's live demo, chat drawer already open
 *
 * Navigation between them is a full page load (each `<a href>` below), so this only ever
 * mounts one branch per session — no conditional hooks, and each channel boots a clean
 * iframe. See ClientDemo for the channel/auth/session logic.
 */
export function App() {
  const route = getRoute();
  return route ? <ClientDemo clientKey={route} /> : <LandingPage />;
}
