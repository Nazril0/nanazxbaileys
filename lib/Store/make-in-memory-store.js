import KeyedDB from '@adiwajshing/keyed-db';
import { proto } from '../../WAProto/index.js';
import { DEFAULT_CONNECTION_CONFIG } from '../Defaults/index.js';
import { LabelAssociationType } from '../Types/LabelAssociation.js';
import { toNumber } from '../Utils/index.js';
import { jidNormalizedUser, isJidGroup } from '../WABinary/index.js';
import { makeOrderedDictionary } from './make-ordered-dictionary.js';
import { ObjectRepository } from './object-repository.js';

const waChatKey = pin => ({
    key: c =>
        (pin ? (c.pinned ? '1' : '0') : '') +
        (c.archived ? '0' : '1') +
        (c.conversationTimestamp ? c.conversationTimestamp.toString(16).padStart(8, '0') : '') +
        c.id,
    compare: (k1, k2) => k2.localeCompare(k1)
});

const waMessageID = m => m.key.id || '';

const waLabelAssociationKey = {
    key: la =>
        la.type === LabelAssociationType.Chat
            ? la.chatId + la.labelId
            : la.chatId + la.messageId + la.labelId,
    compare: (k1, k2) => k2.localeCompare(k1)
};

const makeMessagesDictionary = () => makeOrderedDictionary(waMessageID);

export const makeInMemoryStore = config => {
    const socket = config.socket;
    const chatKey = config.chatKey || waChatKey(true);
    const labelAssociationKey = config.labelAssociationKey || waLabelAssociationKey;
    const logger = config.logger || DEFAULT_CONNECTION_CONFIG.logger.child({ stream: 'in-mem-store' });

    const chats = new KeyedDB(chatKey, c => c.id);
    const messages = {};
    const contacts = {};
    const groupMetadata = {};
    const presences = {};
    const state = { connection: 'close' };
    const labels = new ObjectRepository();
    const labelAssociations = new KeyedDB(labelAssociationKey, labelAssociationKey.key);

    const assertMessageList = jid => {
        if (!messages[jid]) messages[jid] = makeMessagesDictionary();
        return messages[jid];
    };

    const contactsUpsert = newContacts => {
        const oldContacts = new Set(Object.keys(contacts));
        for (const contact of newContacts) {
            oldContacts.delete(contact.id);
            contacts[contact.id] = Object.assign(contacts[contact.id] || {}, contact);
        }
        return oldContacts;
    };

    const labelsUpsert = newLabels => {
        for (const label of newLabels) labels.upsertById(label.id, label);
    };

    const bind = ev => {
        ev.on('connection.update', update => {
            Object.assign(state, update);
        });
        ev.on('messaging-history.set', ({ chats: newChats, contacts: newContacts, messages: newMessages, isLatest }) => {
            if (isLatest) {
                chats.clear();
                Object.assign(messages, {});
            }
            const chatsAdded = chats.insertIfAbsent(...newChats).added;
            logger.debug({ chatsAdded: chatsAdded.length }, 'synced chats');
            contactsUpsert(newContacts);
            for (const msg of newMessages) {
                const jid = jidNormalizedUser(msg.key.remoteJid);
                assertMessageList(jid).upsert(msg, 'append');
            }
        });
        ev.on('contacts.upsert', contacts_ => contactsUpsert(contacts_));
        ev.on('contacts.update', updates => {
            for (const update of updates) {
                if (contacts[update.id]) Object.assign(contacts[update.id], update);
                else contacts[update.id] = update;
            }
        });
        ev.on('chats.upsert', newChats => {
            chats.upsert(...newChats);
        });
        ev.on('chats.update', updates => {
            for (const update of updates) {
                const result = chats.get(update.id);
                if (result) Object.assign(result, update);
            }
        });
        ev.on('chats.delete', deletions => {
            for (const item of deletions) {
                const c = chats.get(item);
                if (c) chats.deleteById(item);
            }
        });
        ev.on('presence.update', ({ id, presences: update }) => {
            presences[id] = presences[id] || {};
            Object.assign(presences[id], update);
        });
        ev.on('messages.upsert', ({ messages: newMessages, type }) => {
            switch (type) {
                case 'notify':
                case 'append':
                    for (const msg of newMessages) {
                        const jid = jidNormalizedUser(msg.key.remoteJid);
                        const list = assertMessageList(jid);
                        list.upsert(msg, type === 'append' ? 'append' : 'prepend');
                        if (type === 'notify') {
                            if (!chats.get(jid)) {
                                ev.emit('chats.upsert', [{ id: jid, conversationTimestamp: toNumber(msg.messageTimestamp), unreadCount: 1 }]);
                            }
                        }
                    }
                    break;
            }
        });
        ev.on('messages.update', updates => {
            for (const { update, key } of updates) {
                const list = assertMessageList(jidNormalizedUser(key.remoteJid));
                const msg = list.get(key.id);
                if (msg) Object.assign(msg, update);
            }
        });
        ev.on('messages.delete', item => {
            if ('all' in item) {
                const list = messages[item.jid];
                if (list) list.array.splice(0, list.array.length);
            } else {
                const jid = item.keys[0].remoteJid;
                const list = messages[jid];
                if (list) {
                    for (const { id } of item.keys) {
                        list.remove({ key: { id } });
                    }
                }
            }
        });
        ev.on('groups.update', updates => {
            for (const update of updates) {
                const id = update.id;
                if (groupMetadata[id]) Object.assign(groupMetadata[id], update);
                else logger.debug({ id }, 'got update for non-existent group');
            }
        });
        ev.on('group-participants.update', ({ id, participants, action }) => {
            const metadata = groupMetadata[id];
            if (metadata) {
                switch (action) {
                    case 'add':
                        metadata.participants.push(...participants.map(id => ({ id, isAdmin: false, isSuperAdmin: false })));
                        break;
                    case 'demote':
                    case 'promote':
                        for (const participant of metadata.participants) {
                            if (participants.includes(participant.id)) {
                                participant.isAdmin = action === 'promote';
                            }
                        }
                        break;
                    case 'remove':
                        metadata.participants = metadata.participants.filter(p => !participants.includes(p.id));
                        break;
                }
            }
        });
        ev.on('labels.edit', label => labelsUpsert([label]));
        ev.on('labels.association', async ({ type, association }) => {
            switch (type) {
                case 'add':
                    labelAssociations.upsert(association);
                    break;
                case 'remove':
                    labelAssociations.delete(association);
                    break;
            }
        });
    };

    const toJSON = () => ({ chats, contacts, messages, labels });
    const fromJSON = (json) => {
        chats.upsert(...json.chats);
        contactsUpsert(json.contacts);
        labelsUpsert(json.labels);
        for (const jid of Object.keys(json.messages)) {
            const list = assertMessageList(jid);
            for (const msg of json.messages[jid]) list.upsert(msg, 'append');
        }
    };

    return {
        chats, messages, contacts, groupMetadata, presences, state, labels, labelAssociations,
        bind, toJSON, fromJSON
    };
};
