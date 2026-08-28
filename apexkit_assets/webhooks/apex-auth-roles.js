/** @type {import("../apexkit").FileMetadata} */
export const __fileMetadata__ = {
  "id": 1,
  "name": "apex-auth-roles",
  "extension": "js",
  "target_collection": null,
  "type": "webhook",
  "path": "./webhooks/",
  "trigger_type": "manual",
  "active": true,
  "visibility": "private"
};

export default async function(req) {
  return new Response({ 
      roles: ["user", "admin", "editor"] 
  });
}