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
// Legacy id shape: `${prefix}_${Date.now()}_${rand}` (HistoryManager.generateId).
const makeId = (prefix) => `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;

/**
 * The conversation id — minted ONCE PER PAGE LOAD and held in memory. A browser
 * refresh starts a fresh conversation (fresh agent thread, fresh durable surfaces);
 * within the load, every MCP app, stream session and tool call shares this ONE id
 * (the "reply never lands" bug was minting per click/turn — per-LOAD is safe).
 */
let conversationId = makeId("conv");

export function getConversationId() {
  return conversationId;
}

/** Start a fresh thread ("new conversation") mid-session — mints and returns a new id. */
export function resetConversation() {
  conversationId = makeId("conv");
  return conversationId;
}
