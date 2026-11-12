import { caching } from 'cache-manager';
import { BufferJSON } from '../Utils/index.js';
import logger from '../Utils/logger.js';

/**
 * Auth state store backed by cache-manager (supports Redis, Memcached, in-memory, etc.).
 *
 * @param {object} store  cache-manager store config (e.g. { store: 'memory', max: 200 })
 * @param {string} sessionKey  prefix key for this session
 *
 * @example
 * const { state, saveCreds } = await makeCacheManagerAuthState({ store: 'memory' }, 'my-session')
 */
export const makeCacheManagerAuthState = async (store, sessionKey) => {
    const defaultKey = file => `${sessionKey}:${file}`;
    const databaseConn = await caching(store);

    const writeData = async (file, data) => {
        let ttl = undefined;
        if (file === 'creds') ttl = 63115200; // 2 years in seconds
        await databaseConn.set(defaultKey(file), JSON.stringify(data, BufferJSON.replacer), ttl);
    };

    const readData = async file => {
        try {
            const data = await databaseConn.get(defaultKey(file));
            if (data) return JSON.parse(data, BufferJSON.reviver);
            return null;
        } catch (error) {
            logger.error(error);
            return null;
        }
    };

    const removeData = async file => {
        try {
            return await databaseConn.del(defaultKey(file));
        } catch (err) {
            logger.error({ err }, `Error removing ${file} from session ${sessionKey}`);
        }
    };

    const clearState = async () => {
        try {
            const result = await databaseConn.store.keys(`${sessionKey}*`);
            await Promise.all(result.map(key => databaseConn.del(key)));
        } catch (err) {
            logger.warn({ err }, 'clearState failed');
        }
    };

    const { state, saveCreds } = await (async () => {
        const { initAuthCreds, proto } = await import('../Utils/index.js');
        const creds = await readData('creds') || initAuthCreds();
        return {
            state: {
                creds,
                keys: {
                    get: async (type, ids) => {
                        const data = {};
                        await Promise.all(ids.map(async id => {
                            let value = await readData(`${type}-${id}`);
                            if (type === 'app-state-sync-key' && value) {
                                value = proto.Message.AppStateSyncKeyData.fromObject(value);
                            }
                            data[id] = value;
                        }));
                        return data;
                    },
                    set: async data => {
                        const tasks = [];
                        for (const category of Object.keys(data)) {
                            for (const id of Object.keys(data[category])) {
                                const value = data[category][id];
                                tasks.push(value ? writeData(`${category}-${id}`, value) : removeData(`${category}-${id}`));
                            }
                        }
                        await Promise.all(tasks);
                    }
                }
            },
            saveCreds: () => writeData('creds', creds)
        };
    })();

    return { state, saveCreds, clearState };
};
