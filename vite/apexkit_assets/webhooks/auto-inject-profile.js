/** @type {import("../apexkit").FileMetadata} */
export const __fileMetadata__ = {
  "id": 548,
  "name": "auto-inject-profile",
  "extension": "js",
  "target_collection": null,
  "type": "webhook",
  "path": "./webhooks/",
  "trigger_type": "before_create_record",
  "active": true,
  "visibility": "private"
};

/**
 * EVENT Webhook
 * 
 * @param {import("../apexkit").RecordHookEvent} e - The standard incoming WHATWG Request object
 * @returns {Promise<Response>}
 */
export default async function (e) {
    // If no authenticated user, pass data through unmodified
    if (!e.auth || !e.auth.id) return e.record.data;

    // Collections that require automatic profile linking
    const communityCols = [
        'ecosystem_items', 
        'community_threads', 
        'thread_comments', 
        'optimizations', 
        'tenancy_offers'
    ];
    
    if (communityCols.includes(e.collection.name)) {
        // Find existing profile
        const profiles = await $db.records.list("profiles", { 
            filter: JSON.stringify({ user_id: e.auth.id }), 
            limit: 1 
        });
        
        let profileId = null;
        if (profiles.total === 0) {
            // Auto-provision a default profile for first-time community participants
            const res = await $db.records.create("profiles", { 
                user_id: e.auth.id, 
                username: e.auth.email.split('@')[0],
                bio: "ApexKit Community Member"
            });
            profileId = res.id;
        } else {
            profileId = profiles.items[0].id;
        }
        
        // Inject the Relation ID
        e.record.data.author_id = profileId;
    }
    
    return e.record.data;
}