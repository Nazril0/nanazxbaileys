/**
 * USyncBackoff — per-protocol backoff state for USync queries.
 *
 * A server-reported error on a usync protocol (e.g. "devices") can carry a
 * backoff (seconds); subsequent usync queries touching that protocol should
 * wait it out before firing, except time-critical device lookups made while
 * sending a message or placing a call.
 */

const backoffPromises = new Map();

/**
 * Set a backoff for a protocol by name (in milliseconds).
 * @param {string} protocolName
 * @param {number} ms
 */
export const setProtocolBackoffMs = (protocolName, ms) => {
    backoffPromises.set(protocolName, new Promise(resolve => setTimeout(resolve, ms)));
};

const shouldWaitForBackoff = query => {
    if (query.context === 'interactive') return false;
    const protocolNames = query.protocols.map(p => p.name);
    return !(protocolNames.includes('devices') && (query.context === 'message' || query.context === 'voip'));
};

/**
 * Wait out any active backoff for the query's protocols.
 * No-op for interactive context or message/voip device lookups.
 * @param {object} query  { protocols: Array<{name: string}>, context?: string }
 */
export const waitForBackoff = async query => {
    if (!shouldWaitForBackoff(query)) return;
    await Promise.all(query.protocols.map(p => backoffPromises.get(p.name)));
};
