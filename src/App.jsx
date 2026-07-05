import { useEffect, useMemo, useState } from "preact/hooks";
import { useAuth } from "react-oidc-context";
import { config, clients, getClientKey } from "./config";
import { hasAuth, getAccessToken, setAccessTokenFn } from "./auth";
import { LoginScreen } from "./LoginScreen";
import { SlidingPanel } from "./SlidingPanel";
import { ClientSwitcher } from "./ClientSwitcher";
import { getConversationId } from "./session";
import { AppHost } from "./appHost";

/**
 * The SAB shell. Today it owns the CHANNEL concerns — auth/OIDC, the login gate, the session
 * facts (userId, conversationId), and the sliding-panel chrome — then mounts the surface-
 * agnostic AppEngine (§6d: the ONE native app). Stage 4 turns this into a real MCP-Apps HOST
 * that loads the app's `ui://` resource in a sandboxed iframe instead of mounting AppEngine
 * directly; the engine itself won't change (that's the whole point — one engine, many hosts).
 */
export function App() {
  // Auth lives in this CHANNEL. Register the current token getter so the MCP client +
  // stream send the bearer on every call (refresh-safe). null → anonymous.
  const auth = useAuth();
  useEffect(() => {
    setAccessTokenFn(hasAuth ? () => auth?.user?.access_token ?? null : null);
    return () => setAccessTokenFn(null);
  }, [auth?.user?.access_token]);

  // Logout: visit `?logout` → full Auth0 SSO sign-out → back to the login gate. Logout is a HOST
  // concern (it holds the session); no template/app change. Needs Auth0 "Allowed Logout URLs" to
  // include this origin.
  useEffect(() => {
    if (!hasAuth || !auth) return;
    if (!new URLSearchParams(window.location.search).has("logout")) return;
    window.history.replaceState({}, document.title, window.location.pathname);
    auth.signoutRedirect();
  }, [auth]);

  // Demo client route (`?client=sab|bpp`) — picks the template + the fake page skin.
  // The screenshot <img> lives on the HOST page (index.html), outside this widget's
  // tree, so we swap its src directly; absent on a real embed → guard.
  const [clientKey, setClientKey] = useState(getClientKey);
  const client = clients[clientKey];
  useEffect(() => {
    const url = new URL(window.location.href);
    url.searchParams.set("client", clientKey);
    window.history.replaceState({}, "", url);
    const img = document.querySelector(".bg-container img");
    if (img) img.src = client.background;
  }, [clientKey]);

  // Login gate — ask the server whether it enforces auth (/health → authRequired).
  const [authRequired, setAuthRequired] = useState(null);
  useEffect(() => {
    fetch(`${config.serverUrl}/health`)
      .then((r) => r.json())
      .then((d) => setAuthRequired(!!d.authRequired))
      .catch(() => setAuthRequired(true)); // fail safe: assume secured
  }, []);
  const signedIn = !!auth?.isAuthenticated;
  const needsLogin = authRequired === true && !signedIn;

  // Session facts (§5a), supplied once by the channel — never minted per-turn.
  //   conversationId → PERSISTED (survives reloads, shared across MCP apps) — see session.js
  //   userId         → the authenticated JWT `sub` (must equal what the server validates)
  const conversationId = useMemo(() => getConversationId(), []);
  const userId = auth?.user?.profile?.sub;

  let content;
  if (authRequired === null || (hasAuth && auth?.isLoading)) {
    content = (
      <div className="flex h-full items-center justify-center bg-[#0f141a] text-sm text-gray-400">Loading…</div>
    );
  } else if (needsLogin && hasAuth) {
    content = <LoginScreen onLogin={() => auth?.signinRedirect()} />;
  } else if (needsLogin && !hasAuth) {
    content = (
      <div className="flex h-full flex-col items-center justify-center gap-3 bg-[#0f141a] text-center">
        <div className="text-sm font-semibold text-gray-200">This server requires authentication</div>
        <div className="max-w-sm text-xs leading-relaxed text-gray-500">
          Configure OIDC (VITE_AUTH_ISSUER / VITE_AUTH_CLIENT_ID) to sign in, or set{" "}
          <code className="text-gray-400">DISABLE_AUTH=true</code> in the server .env for anonymous local dev.
        </div>
      </div>
    );
  } else {
    // SAB as HOST (§6d): stream the app (the server's ui:// resource) into a sandboxed iframe
    // and hand it config — the SAME contract Claude/ChatGPT use. The app opens its own
    // /mcp + /stream inside the iframe; this host embeds no Unoverse SDK at all.
    content = (
      <AppHost
        key={clientKey} // remount on switch → fresh iframe, clean app boot with the new template
        serverUrl={config.serverUrl}
        apiUrl={config.apiUrl}
        templateId={client.templateId}
        token={auth?.user?.access_token}
        userId={userId}
        conversationId={conversationId}
      />
    );
  }

  return (
    <>
      <ClientSwitcher value={clientKey} onChange={setClientKey} />
      <SlidingPanel>{content}</SlidingPanel>
    </>
  );
}
