/** @type {import("../apexkit").FileMetadata} */
export const __fileMetadata__ = {
  "id": 211,
  "name": "slugify-doc",
  "extension": "js",
  "target_collection": "docs",
  "type": "webhook",
  "path": "./webhooks/",
  "trigger_type": "before_create_record",
  "active": true,
  "visibility": "private"
};

/**
 * Automatically slugifies the document title on creation
 * 
 * @param {import("../apexkit").RecordHookEvent} event
 */
export default async function (event) {
    const data = event.record.data;

    if (data.title) {
        if (!data.slug || String(data.slug).trim() === "") {
            data.slug = $util.slugify(data.title);
        } else {
            data.slug = $util.slugify(data.slug);
        }
    }

    return data;
}