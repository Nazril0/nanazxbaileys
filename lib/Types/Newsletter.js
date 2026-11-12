/**
 * Newsletter.js — Extended Newsletter types from Baron Baileys.
 * NewsletterRole / NewsletterState already exist in Original (Mex.js) —
 * re-exported here for convenience. NewsletterReactionSetting is NEW.
 * XWAPaths and QueryIds here are superset of Original's Mex.js — use these
 * instead of the ones from Mex.js when you need the extended set.
 */

export const NewsletterRole = {
    SUBSCRIBER: 'SUBSCRIBER',
    ADMIN: 'ADMIN',
    OWNER: 'OWNER',
    GUEST: 'GUEST'
};

export const NewsletterState = {
    ACTIVE: 'ACTIVE',
    SUSPENDED: 'SUSPENDED',
    GEO_SUSPENDED: 'GEO_SUSPENDED',
    UNKNOWN: 'UNKNOWN'
};

/** NEW in nanazxbaileys — not present in Original */
export const NewsletterReactionSetting = {
    ALLOWLIST: 'ALLOWLIST',
    BLOCKLIST: 'BLOCKLIST',
    NONE: 'NONE'
};

/**
 * Extended XWAPaths — superset of Original Mex.js XWAPaths.
 * Includes admin invite/accept/revoke, directory, search, engagement,
 * moderation, Wamo, and other new paths from WA 2.26.x.
 */
export const XWAPaths = {
    xwa2_newsletter_create: 'xwa2_newsletter_create',
    // stale, kept for backward reference — server uses _followers/_admin_demote now
    xwa2_newsletter_subscribers: 'xwa2_newsletter_subscribers',
    xwa2_newsletter_followers: 'xwa2_newsletter_followers',
    xwa2_newsletter_view: 'xwa2_newsletter_view',
    xwa2_newsletter_metadata: 'xwa2_newsletter',
    xwa2_newsletter_admin_count: 'xwa2_newsletter_admin',
    xwa2_newsletter_mute_v2: 'xwa2_newsletter_mute_v2',
    xwa2_newsletter_unmute_v2: 'xwa2_newsletter_unmute_v2',
    xwa2_newsletter_follow: 'xwa2_newsletter_follow',
    xwa2_newsletter_unfollow: 'xwa2_newsletter_unfollow',
    xwa2_newsletter_change_owner: 'xwa2_newsletter_change_owner',
    xwa2_newsletter_demote: 'xwa2_newsletter_demote',
    xwa2_newsletter_admin_demote: 'xwa2_newsletter_admin_demote',
    xwa2_newsletter_delete_v2: 'xwa2_newsletter_delete_v2',
    xwa2_newsletter_join_v2: 'xwa2_newsletter_join_v2',
    xwa2_newsletter_leave_v2: 'xwa2_newsletter_leave_v2',
    xwa2_fetch_account_reachout_timelock: 'xwa2_fetch_account_reachout_timelock',
    xwa2_message_capping_info: 'xwa2_message_capping_info',
    // Admin invite paths
    xwa2_newsletter_admin_invite_create: 'xwa2_newsletter_admin_invite_create',
    xwa2_newsletter_admin_invite_revoke: 'xwa2_newsletter_admin_invite_revoke',
    xwa2_newsletter_admin_invite_accept: 'xwa2_newsletter_admin_invite_accept',
    xwa2_newsletter_admin: 'xwa2_newsletter_admin',
    xwa2_newsletter_admin_profile_update: 'xwa2_newsletter_admin_profile_update',
    // Directory / search
    xwa2_newsletters_directory_list: 'xwa2_newsletters_directory_list',
    xwa2_newsletters_directory_search: 'xwa2_newsletters_directory_search',
    xwa2_newsletters_directory_category_preview: 'xwa2_newsletters_directory_category_preview',
    xwa2_newsletters_search: 'xwa2_newsletters_search',
    xwa2_newsletters_recommended: 'xwa2_newsletters_recommended',
    xwa2_newsletters_similar: 'xwa2_newsletters_similar',
    xwa2_newsletter_following: 'xwa2_newsletter_following',
    // Engagement
    xwa2_newsletter_admin_insights: 'xwa2_newsletter_admin_insights',
    xwa2_newsletters_poll_voter_list: 'xwa2_newsletters_poll_voter_list',
    xwa2_newsletters_reaction_sender_list: 'xwa2_newsletters_reaction_sender_list',
    // Moderation
    xwa2_newsletter_enforcements: 'xwa2_newsletter_enforcements',
    xwa2_newsletter_user_reports: 'xwa2_newsletter_user_reports',
    xwa2_newsletter_create_report_appeal: 'xwa2_newsletter_create_report_appeal',
    xwa2_newsletter_link_preview_check: 'xwa2_newsletter_link_preview_check',
    xwa2_newsletter_update_verification: 'xwa2_newsletter_update_verification',
    xwa2_newsletter_label_paid_partnership: 'xwa2_newsletter_label_paid_partnership',
    xwa2_newsletter_label_ai_content: 'xwa2_newsletter_label_ai_content',
    // Log / user
    xwa2_newsletter_log_exposures: 'xwa2_newsletter_log_exposures',
    xwa2_newsletter_update_user_setting: 'xwa2_newsletter_update_user_setting',
    xwa2_newsletter_create_verified: 'xwa2_newsletter_create_verified',
    xwa2_newsletter_ranking_features: 'xwa2_newsletter_ranking_features',
    xwa2_newsletter_question_response_state_update: 'xwa2_newsletter_question_response_state_update',
    // Wamo
    xwa2_wamo_afs_age_collection: 'xwa2_wamo_afs_age_collection',
    xwa2_wamo_asset_collection: 'xwa2_wamo_asset_collection',
    xwa2_wamo_fetch_adhoc_notice_by_id: 'xwa2_wamo_fetch_adhoc_notice_by_id',
    xwa2_wamo_fetch_identity_token: 'xwa2_wamo_fetch_identity_token',
    xwa2_wamo_sub_get_compliance_info: 'xwa2_wamo_sub_get_compliance_info',
    xwa2_wamo_user_id_version: 'xwa2_wamo_user_id_version',
    xwa2_wamo_set_user_id_version: 'xwa2_wamo_set_user_id_version'
};

/**
 * Extended QueryIds — superset of Original Mex.js QueryIds.
 * IDs marked "verified 2026-07-19" / "verified 2026-08-28" were cross-checked
 * against live WA Web graphql module dumps. Others may be stale.
 */
export const QueryIds = {
    // Core
    CREATE: '25149874324715067',              // NewsletterCreate — verified 2026-07-19
    CREATE_VERIFIED: '27777918425146464',      // NewsletterCreateVerified
    UPDATE_METADATA: '27150690864552229',      // NewsletterMetadataUpdate
    METADATA: '26629010453445271',             // NewsletterMetadata
    SUBSCRIBERS: '27472091235714801',          // NewsletterFollowers — verified 2026-07-19
    FOLLOW: '24404358912487870',               // NewsletterJoin — verified 2026-07-19
    LEAVE: '9767147403369991',                 // NewsletterLeave — verified 2026-07-19
    UNFOLLOW: '9767147403369991',              // NewsletterLeave (unfollow == leave) — verified 2026-07-19
    MUTE: '25033614912931367',                 // NewsletterHide
    UNMUTE: '24551592861177484',               // NewsletterUnhide
    ADMIN_COUNT: '27579307995002556',          // NewslettersAdminCapabilitiesQuery
    ADMIN_CAPABILITIES: '9801384413216421',    // WAWebMexFetchNewsletterAdminCapabilitiesJobQuery
    CHANGE_OWNER: '24737692515842078',         // NewsletterChangeOwner
    DEMOTE: '9880997548630971',                // NewsletterAdminDemote — verified 2026-07-19
    DELETE: '30062808666639665',               // NewsletterDelete — verified 2026-07-19
    REACHOUT_TIMELOCK: '23983697327930364',    // WAWebMexFetchReachoutTimelockJobQuery — verified 2026-08-28
    MESSAGE_CAPPING_INFO: '27910975521856601', // WAWebMexFetchNewChatMessageCappingInfoJobQuery — verified 2026-08-28
    UPDATE_USER_SETTING: '24935528202764688',  // NewsletterUpdateUserSetting
    // Admin invite
    ADMIN_INVITE: '26278681041745438',                 // NewsletterAdminInvite
    ADMIN_INVITE_REVOKE: '24369392486051948',          // NewsletterAdminInviteRevoke
    ADMIN_INVITE_ACCEPT: '24934958956134858',          // NewsletterAcceptAdminInvite
    ADMIN_METADATA: '26882701001369256',               // NewsletterAdminMetadataQuery
    ADMIN_PROFILE_UPDATE: '25959584293627630',         // NewsletterAdminProfileUpdate
    ADMIN_INFO: '26278439461859188',                   // WAWebMexFetchNewsletterAdminInfoJobQuery — verified 2026-08-28
    DEHYDRATED: '26944199458535748',                   // WAWebMexFetchNewsletterDehydratedJobQuery — verified 2026-08-28
    // Directory / search
    DIRECTORY_LIST: '26125047313831973',                        // verified 2026-08-28
    DIRECTORY_SEARCH: '27887355094203575',                      // NewsletterDirectorySearch
    DIRECTORY_CATEGORY_PREVIEW: '35266481849605779',            // verified 2026-08-28
    SEARCH: '25909596625362196',                                // NewsletterSearch
    RECOMMENDED: '25806748772361516',                           // verified 2026-08-28
    SIMILAR: '36410329795280256',                               // NewsletterSimilar
    FOLLOWING_LIST: '26856957210673444',                        // NewsletterFollowing
    // Engagement
    INSIGHTS: '24672564052397921',                              // NewsletterInsights
    POLL_VOTER_LIST: '24803802869271956',                       // NewsletterPollVoterList
    REACTION_SENDERS_LIST: '25219734117717032',                 // NewsletterReactionSendersList
    QUESTION_RESPONSE_STATE_UPDATE: '24896618076668076',        // NewsletterQuestionResponseStateUpdate
    LOG_EXPOSURES: '25260800823586918',                         // verified 2026-08-28
    RANKING_FEATURES: '24742757908756088',                      // FetchNewsletterRankingFeatures
    // Moderation
    BLOCK_USER: '25106066249006236',                            // NewsletterBlockUser
    USER_REPORTS: '27149305681394065',                          // NewsletterUserReports
    CREATE_REPORT_APPEAL: '27792557363683798',                  // NewsletterCreateReportAppeal
    ENFORCEMENTS: '27835373536068060',                          // verified 2026-08-28
    LINK_PREVIEW_CHECK: '24188786150796507',                    // NewsletterLinkPreviewCheck
    UPDATE_VERIFICATION: '27133493439664458',                   // NewsletterUpdateVerification
    LABEL_PAID_PARTNERSHIP: '26102375079404865',                // NewsletterLabelPaidPartnership
    LABEL_AI_CONTENT: '27909718265289596',                      // WAWebMexNewsletterLabelAiContentJobMutation
    // Wamo
    WAMO_CHANGE_SUB: '25201342542835866',
    WAMO_ENABLE_SUB: '25122474967344830',
    WAMO_DISABLE_SUB: '31916794074578680',
    WAMO_AFS_AGE_COLLECTION: '25012618978387375',
    WAMO_ASSET_COLLECTION: '24347085218298773',
    WAMO_FETCH_ADHOC_NOTICE: '24758534413802422',
    WAMO_FETCH_IDENTITY_TOKEN: '24677346488597665',
    WAMO_SUB_COMPLIANCE_INFO: '25105596879072480',
    WAMO_USER_ID_VERSION: '24958410737155269',
    WAMO_SET_USER_ID_VERSION: '8148672891859281'
};
