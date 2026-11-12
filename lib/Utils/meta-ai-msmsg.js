/**
 * meta-ai-msmsg.js — Decrypt <enc type="msmsg"> bot messages.
 *
 * Rewritten using native Node.js crypto (no Rust bridge dependency).
 *
 * Two-pass HKDF algorithm (from Baron/bot_message.rs BotMessageContext):
 *   k1  = HKDF-SHA256(messageSecret, salt=empty, info="Bot Message",              32)
 *   k2  = HKDF-SHA256(k1,            salt=empty, info=msgID||targetJID||botJID,   32)
 *   AAD = msgID || 0x00 || botJID
 *   plain = AES-256-GCM.Decrypt(key=k2, iv=encIv, ciphertext=encPayload[:-16],
 *                                authTag=encPayload[-16:], aad=AAD)
 */

import { createDecipheriv, hkdfSync } from 'crypto';
import { proto } from '../../WAProto/index.js';

const BOT_MESSAGE_INFO = 'Bot Message';
const KEY_LENGTH = 32;
const GCM_TAG_LENGTH = 16;

const toBuffer = value => {
    if (Buffer.isBuffer(value)) return value;
    if (value instanceof Uint8Array) return Buffer.from(value.buffer, value.byteOffset, value.byteLength);
    return Buffer.from(value);
};

const unpadRandomMax16 = value => {
    const bytes = new Uint8Array(value);
    if (!bytes.length) throw new Error('unpadPkcs7 given empty bytes');
    const padLength = bytes[bytes.length - 1];
    if (padLength > bytes.length) throw new Error(`unpad given ${bytes.length} bytes, but pad is ${padLength}`);
    return new Uint8Array(bytes.buffer, bytes.byteOffset, bytes.length - padLength);
};

/**
 * HKDF-SHA256 using native Node.js crypto.hkdfSync.
 * @param {Buffer} key  input keying material
 * @param {number} len  output key length in bytes
 * @param {Buffer|string} info  context info (no salt — matches Rust bridge behaviour)
 */
const hkdf = (key, len, info) => {
    const infoBuffer = typeof info === 'string' ? Buffer.from(info) : toBuffer(info);
    // salt = empty Buffer (zero-length) → matches rb.hkdf with no salt
    return Buffer.from(hkdfSync('sha256', key, Buffer.alloc(0), infoBuffer, len));
};

/**
 * AES-256-GCM decrypt using native Node.js crypto.
 * encPayload layout: [ ciphertext ... | authTag (16 bytes) ]
 */
const aesDecryptGCM = (encPayload, key, iv, aad) => {
    const payload = toBuffer(encPayload);
    if (payload.length < GCM_TAG_LENGTH) {
        throw new Error(`aesDecryptGCM: payload too short (${payload.length} bytes)`);
    }
    const ciphertext = payload.slice(0, payload.length - GCM_TAG_LENGTH);
    const authTag = payload.slice(payload.length - GCM_TAG_LENGTH);
    const decipher = createDecipheriv('aes-256-gcm', toBuffer(key), toBuffer(iv));
    decipher.setAuthTag(authTag);
    if (aad) decipher.setAAD(toBuffer(aad));
    return Buffer.concat([decipher.update(ciphertext), decipher.final()]);
};

// ─── JID helpers ──────────────────────────────────────────────────────────────

/** Strip device suffix from LID JIDs: "user:device@lid" → "user@lid". */
const normalizeLidJid = jid => {
    if (!jid || !jid.endsWith('@lid') || !jid.includes(':')) return jid;
    return `${jid.split(':')[0]}@lid`;
};

// ─── Candidate selectors (matches Rust BotMessageContext) ────────────────────

const selectMsgIdCandidates = messageKey => {
    const seen = new Set();
    const result = [];
    for (const id of [messageKey?.botEditTargetId, messageKey?.stanzaId, messageKey?.metaTargetId]) {
        const s = id ? String(id) : '';
        if (s && !seen.has(s)) { seen.add(s); result.push(s); }
    }
    return result;
};

const selectTargetJidCandidates = messageKey => {
    const seen = new Set();
    const result = [];
    for (const jid of [normalizeLidJid(messageKey?.meId), normalizeLidJid(messageKey?.meLid)]) {
        const s = jid ? String(jid) : '';
        if (s && !seen.has(s)) { seen.add(s); result.push(s); }
    }
    return result;
};

// ─── Unified response helpers ─────────────────────────────────────────────────

/** Parse unifiedResponse.data (base64/bytes → JSON). */
export const parseUnifiedResponseData = data => {
    if (!data) return null;
    try {
        let buf;
        if (Buffer.isBuffer(data)) buf = data;
        else if (data instanceof Uint8Array) buf = Buffer.from(data);
        else if (typeof data === 'string') buf = Buffer.from(data, 'base64');
        else if (data.type === 'Buffer' && Array.isArray(data.data)) buf = Buffer.from(data.data);
        else return null;
        return JSON.parse(buf.toString('utf8'));
    } catch { return null; }
};

/** Flatten unifiedResponse JSON to markdown text. */
export const textFromUnifiedResponse = data => {
    const j = parseUnifiedResponseData(data);
    if (!j) return null;
    const parts = [];
    for (const section of j.sections || []) {
        const t = section?.view_model?.primitive?.text;
        if (t) parts.push(t);
    }
    return parts.length ? parts.join('\n') : null;
};

/** Extract text from richResponseMessage. */
export const textFromRichResponse = rr => {
    if (!rr) return null;
    if (Array.isArray(rr.submessages)) {
        const parts = rr.submessages
            .map(sm => sm?.messageText)
            .filter(t => typeof t === 'string' && t.length);
        if (parts.length) return parts.join('\n');
    }
    return textFromUnifiedResponse(rr.unifiedResponse?.data);
};

/** Extract answer text from any Meta AI message body. */
export const extractMetaAiText = message => {
    if (!message) return null;
    const body = message.protocolMessage?.editedMessage || message;
    return (
        body.extendedTextMessage?.text ??
        body.conversation ??
        textFromRichResponse(body.richResponseMessage) ??
        null
    );
};

/**
 * Decode unifiedResponse.data IN PLACE: attach decodedData + text.
 * Idempotent — safe to call more than once.
 */
export const decodeUnifiedResponseInPlace = message => {
    if (!message || typeof message !== 'object') return message;
    const bodies = [message, message.protocolMessage?.editedMessage, message.editedMessage].filter(Boolean);
    for (const body of bodies) {
        const ur = body.richResponseMessage?.unifiedResponse;
        if (ur && ur.data != null && ur.decodedData === undefined) {
            ur.decodedData = parseUnifiedResponseData(ur.data);
            const txt = textFromUnifiedResponse(ur.data);
            if (txt != null) ur.text = txt;
        }
    }
    return message;
};

export const decodeDecryptedMsmsgMessage = decrypted => {
    const buf = toBuffer(decrypted);
    try {
        const unpadded = Buffer.from(unpadRandomMax16(buf));
        const decoded = proto.Message.decode(unpadded);
        const hasContent = Object.keys(decoded).some(k => k !== 'messageContextInfo' && decoded[k] != null);
        if (hasContent) return decodeUnifiedResponseInPlace(decoded);
    } catch {}
    return decodeUnifiedResponseInPlace(proto.Message.decode(buf));
};

// ─── Main decryption function ─────────────────────────────────────────────────

/**
 * Decrypt an <enc type="msmsg"> bot message using native Node.js crypto.
 *
 * @param {Buffer|Uint8Array} messageSecret  from messageContextInfo.messageSecret
 * @param {object} messageKey  { participant, meId, meLid, stanzaId, botEditTargetId, metaTargetId }
 * @param {object} msMsg       { encIv, encPayload }
 * @returns {Buffer} decrypted raw bytes (not yet proto-decoded)
 */
export const decryptMsmsgBotMessage = async (messageSecret, messageKey, msMsg) => {
    if (!messageSecret || (messageSecret instanceof Uint8Array && !messageSecret.byteLength)) {
        throw new Error('Missing required messageSecret for msmsg decryption');
    }
    if (!messageKey?.participant) throw new Error('Missing required participant for msmsg decryption');
    if (!messageKey?.meId) throw new Error('Missing required meId for msmsg decryption');
    if (!msMsg?.encIv) throw new Error('Missing required encIv for msmsg decryption');
    if (!msMsg?.encPayload) throw new Error('Missing required encPayload for msmsg decryption');

    const msgIdCandidates = selectMsgIdCandidates(messageKey);
    if (!msgIdCandidates.length) throw new Error('Missing required target message id for msmsg decryption');

    const targetJidCandidates = selectTargetJidCandidates(messageKey);
    if (!targetJidCandidates.length) throw new Error('Missing required target JID for msmsg decryption');

    const botJidBuf = Buffer.from(String(messageKey.participant));
    const payload = toBuffer(msMsg.encPayload);
    const iv = toBuffer(msMsg.encIv);

    // k1 depends only on messageSecret — derive once and reuse
    const baseKey = hkdf(toBuffer(messageSecret), KEY_LENGTH, BOT_MESSAGE_INFO);

    let lastError;
    for (const msgId of msgIdCandidates) {
        const idBuf = Buffer.from(msgId); // ASCII bytes per Rust spec
        for (const targetJid of targetJidCandidates) {
            const info = Buffer.concat([idBuf, Buffer.from(targetJid), botJidBuf]);
            const key = hkdf(baseKey, KEY_LENGTH, info);
            const aad = Buffer.concat([idBuf, Buffer.from([0x00]), botJidBuf]);
            try {
                return aesDecryptGCM(payload, key, iv, aad);
            } catch (e) {
                lastError = e;
            }
        }
    }

    const err = new Error('msmsg decryption failed: all key derivation candidates exhausted');
    err.cause = lastError;
    throw err;
};
