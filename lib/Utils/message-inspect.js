/**
 * message-inspect.js — Extended message inspection utilities (from Baron Baileys).
 * Contains NEW functions not present in the original messages.js.
 * Functions that already exist in messages.js are NOT duplicated here.
 */

import { proto } from '../../WAProto/index.js';
import { jidDecode, isLidUser, isHostedLidUser, isPnUser, isHostedPnUser } from '../WABinary/index.js';
import { getKeyAuthor } from './generics.js';

// ─── Extended normalizeMessageContent ─────────────────────────────────────────
// Baron adds many new message types not in the original normalizeMessageContent.
// Use this if you need the extended version that covers newer WA message types.

const getFutureProofMessage = message => (
    message.ephemeralMessage ||
    message.viewOnceMessage ||
    message.documentWithCaptionMessage ||
    message.viewOnceMessageV2 ||
    message.viewOnceMessageV2Extension ||
    message.editedMessage ||
    message.groupMentionedMessage ||
    message.botInvokeMessage ||
    message.lottieStickerMessage ||
    message.eventCoverImage ||
    message.statusMentionMessage ||
    message.pollCreationOptionImageMessage ||
    message.associatedChildMessage ||
    message.groupStatusMentionMessage ||
    message.pollCreationMessageV4 ||
    message.pollCreationMessageV5 ||
    message.statusAddYours ||
    message.groupStatusMessage ||
    message.limitSharingMessage ||
    message.botTaskMessage ||
    message.questionMessage ||
    message.groupStatusMessageV2 ||
    message.botForwardedMessage ||
    message.questionReplyMessage ||
    message.newsletterAdminProfileMessage ||
    message.newsletterAdminProfileMessageV2 ||
    message.newsletterAdminProfileStatusMessage ||
    message.spoilerMessage ||
    message.groupStatusV3Message ||
    message.pollCreationMessageV6 ||
    message.botPlatformRegistrationSuccessMessage ||
    message.newsletterScheduledMessage ||
    message.acp2SettingMessage ||
    message.audioStickerMessage
);

import { sha256 } from './crypto.js';

/**
 * Extended version of normalizeMessageContent — covers all Baron message types.
 * Use instead of the original when dealing with newer WA message types.
 */
export const normalizeMessageContentExtended = content => {
    if (!content) return undefined;
    for (let i = 0; i < 5; i++) {
        const inner = getFutureProofMessage(content);
        if (!inner) break;
        content = inner.message;
    }
    return content;
};

// ─── Scheduled Messages ───────────────────────────────────────────────────────

/** Check if a WebMessageInfo has a scheduled reveal time (ConditionalRevealMessage). */
export const isScheduledMessage = msg => !!msg?.scheduledMessageMetadata?.scheduledTime;

/** Get scheduled reveal time of a message as a Date, or null. */
export const getScheduledMessageTime = msg => {
    const t = msg?.scheduledMessageMetadata?.scheduledTime;
    if (!t) return null;
    return new Date(Number(t) * 1000);
};

// ─── Payment / Comment / Add-ons ─────────────────────────────────────────────

/** Extract PaymentInfo from a WebMessageInfo. */
export const getMessagePaymentInfo = msg => msg?.paymentInfo || msg?.quotedPaymentInfo || null;

/** Get comment metadata from a WebMessageInfo. */
export const getMessageCommentMetadata = msg => msg?.commentMetadata || null;

/** Get all message add-ons (reactions, poll updates, pins) from a WebMessageInfo. */
export const getMessageAddOns = msg => msg?.messageAddOns || [];

// ─── Poll helpers (extended) ──────────────────────────────────────────────────

/** Get the quiz correct answer from a poll creation message, if it's a quiz. */
export const getPollCorrectAnswer = pollMsg => {
    const poll =
        pollMsg?.pollCreationMessage ||
        pollMsg?.pollCreationMessageV2 ||
        pollMsg?.pollCreationMessageV3 ||
        pollMsg?.pollCreationMessageV5 ||
        pollMsg?.pollCreationMessageV6;
    if (!poll) return null;
    const isQuiz = poll.pollType === proto.Message.PollType?.QUIZ || poll.pollType === 1;
    return isQuiz ? poll.correctAnswer?.optionName || null : null;
};

/**
 * Extended getAggregateVotesInPollMessage — also handles V4/V5/V6 poll messages.
 */
export const getAggregateVotesInPollMessageExtended = ({ message, pollUpdates }, meId) => {
    const opts =
        message?.pollCreationMessage?.options ||
        message?.pollCreationMessageV2?.options ||
        message?.pollCreationMessageV3?.options ||
        message?.pollCreationMessageV5?.options ||
        message?.pollCreationMessageV6?.options ||
        message?.pollCreationMessageV4?.message?.pollCreationMessage?.options ||
        message?.pollCreationMessageV4?.message?.pollCreationMessageV3?.options ||
        [];
    const voteHashMap = opts.reduce((acc, opt) => {
        const hash = sha256(Buffer.from(opt.optionName || '')).toString();
        acc[hash] = { name: opt.optionName || '', voters: [] };
        return acc;
    }, {});
    for (const update of pollUpdates || []) {
        const { vote } = update;
        if (!vote) continue;
        for (const option of vote.selectedOptions || []) {
            const hash = option.toString();
            if (!voteHashMap[hash]) voteHashMap[hash] = { name: 'Unknown', voters: [] };
            voteHashMap[hash].voters.push(getKeyAuthor(update.pollUpdateMessageKey, meId));
        }
    }
    return Object.values(voteHashMap);
};

// ─── Event Responses ──────────────────────────────────────────────────────────

/**
 * Aggregate all event responses in an event message.
 * @param eventResponses array of event response updates
 * @param meLid your LID JID
 */
export const getAggregateResponsesInEventMessage = ({ eventResponses }, meLid) => {
    const responseTypes = ['GOING', 'NOT_GOING', 'MAYBE'];
    const responseMap = {};
    for (const type of responseTypes) responseMap[type] = { response: type, responders: [] };
    for (const update of eventResponses || []) {
        const { response } = update.response || {};
        const responseType = proto.Message.EventResponseMessage.EventResponseType[response];
        if (responseType !== 'UNKNOWN' && responseMap[responseType]) {
            responseMap[responseType].responders.push(getKeyAuthor(update.eventResponseMessageKey, meLid));
        }
    }
    return Object.values(responseMap);
};

// ─── LID / JID helpers ───────────────────────────────────────────────────────

/** Normalize a bare user id to @s.whatsapp.net. */
export const toJid = id => {
    if (!id) return '';
    if (id.includes('@')) return id;
    return `${id}@s.whatsapp.net`;
};

/** Returns the peer LID JID when the key is LID-primary. */
export const getSenderLid = message => {
    const k = message.key;
    if (!k) return { jid: '', lid: '' };
    const jid = k.participant || k.remoteJid || '';
    if (jid.endsWith('@lid') || jid.endsWith('@hosted.lid')) return { jid, lid: jid };
    if (k.lid && typeof k.lid === 'string') {
        const lid = k.lid.includes('@') ? k.lid : jidDecode ? `${k.lid}@lid` : k.lid;
        return { jid, lid };
    }
    if (k.participantLid && (isLidUser(k.participantLid) || isHostedLidUser(k.participantLid))) {
        return { jid, lid: k.participantLid };
    }
    return { jid, lid: '' };
};
