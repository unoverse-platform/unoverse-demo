/**
 * Session identity — the channel-supplied session FACTS (§5a; UNOVERSE_MCP_TEMPLATE_
 * PROTOCOL). These are supplied ONCE by the channel and never invented per-turn:
 *
 *   - userId          the authenticated subject (the JWT `sub`) — who
 *   - conversationId  the persistent thread — survives reloads AND is shared across
 *                     MCP apps in the same conversation (mirrors legacy gravity-client's
 *                     persisted user id; conversationId is a sessionParam it requires)
 *
 * The workflow streams its reply to (userId, conversationId), so both MUST be stable and
 * identical on the stream session AND the tool call. Minting a fresh id per click/reload
 * (the earlier bug) means the reply never lands.
 */
const CONVERSATION_KEY = "unoverse.conversationId";

// Legacy id shape: `${prefix}_${Date.now()}_${rand}` (HistoryManager.generateId).
const makeId = (prefix) => `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;

/**
 * The persistent conversation id — generated ONCE, cached in localStorage, reused across
 * reloads and across MCP apps until explicitly reset. Storage-blocked → ephemeral fallback.
 */
export function getConversationId() {
  try {
    let id = localStorage.getItem(CONVERSATION_KEY);
    if (!id) {
      id = makeId("conv");
      localStorage.setItem(CONVERSATION_KEY, id);
    }
    return id;
  } catch {
    return makeId("conv");
  }
}

/** Start a fresh thread ("new conversation") — clears the cached id and returns a new one. */
export function resetConversation() {
  try {
    localStorage.removeItem(CONVERSATION_KEY);
  } catch {
    /* ignore */
  }
  return getConversationId();
}
