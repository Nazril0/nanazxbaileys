import { DEFAULT_CONNECTION_CONFIG } from '../Defaults/index.js';
import { makeCommunitiesSocket } from './communities.js';
// nanazxbaileys: additional socket layers
import { makePrivacySocket } from './privacy.js';
import { makeRegistrationSocket } from './registration.js';
import { makeManagedAccountSocket } from './managed-account.js';
import { makeInteropSocket } from './interop.js';
import { makeGraphQLSocket } from './graphql.js';
import { makeAIGroupsSocket } from './aigroups.js';
import { makeUsernameSocket } from './username.js';
// export the last socket layer
const makeWASocket = (config) => {
    const newConfig = {
        ...DEFAULT_CONNECTION_CONFIG,
        ...config
    };
    // Original chain: socket → chats → groups → newsletter → business → communities
    // nanazxbaileys additions use _existingSock bypass to avoid re-constructing lower layers.
    // All layers return { ...sock, ...newMethods } so no existing API is removed.
    const base = makeCommunitiesSocket(newConfig);
    // aigroups and username use _existingSock to extend base without double-constructing
    const withAIGroups = makeAIGroupsSocket({ ...newConfig, _existingSock: base });
    const withUsername = makeUsernameSocket({ ...newConfig, _existingSock: withAIGroups });
    // privacy/registration/managed-account/interop/graphql accept sock directly
    const withPrivacy = makePrivacySocket(withUsername);
    const withRegistration = makeRegistrationSocket(withPrivacy);
    const withManagedAccount = makeManagedAccountSocket(withRegistration);
    const withInterop = makeInteropSocket(withManagedAccount);
    const withGraphQL = makeGraphQLSocket(withInterop);
    return withGraphQL;
};
export default makeWASocket;