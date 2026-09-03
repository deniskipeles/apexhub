#!/usr/bin/env python3
import os
import re
import time
import mimetypes
from pathlib import Path
import requests

# ==============================================================================
# CONFIGURATION
# ==============================================================================
API_BASE = os.getenv("APEXKIT_URL", "http://localhost:5000").rstrip("/")
API_KEY = os.getenv("APEXKIT_API_KEY", "root_sys_prod_4158d1447c1a7227a3540d10a8ed589ae9c1f68ee54da3f54afb75a500445314_dce9")
DOCS_DIR = Path(os.getenv("DOCS_PATH", "/tmp/dev/apex-kit/docs"))
TENANT_ID = os.getenv("APEXKIT_TENANT_ID", "") # e.g. "apexhub" or leave blank for root

# Construct proper scoped API endpoint
if TENANT_ID:
    API_URL = f"{API_BASE}/tenant/{TENANT_ID}/api/v1"
else:
    API_URL = f"{API_BASE}/api/v1"

HEADERS = {
    "x-api-key": API_KEY,
    "Authorization": f"Bearer {API_KEY}",
    "Content-Type": "application/json"
}

ALLOWED_CATEGORIES = [
    "getting started",
    "integrations",
    "core concepts",
    "community guides",
    "others"
]

# ==============================================================================
# HELPER FUNCTIONS
# ==============================================================================

def slugify(text: str) -> str:
    """Generates a clean slug to check against existing database records."""
    slug = re.sub(r'[^a-zA-Z0-9]+', '-', text.lower()).strip('-')
    return slug

def upload_screenshot(file_path: Path) -> str:
    """Uploads an image file to ApexKit storage with rate-limiting protection."""
    upload_url = f"{API_URL}/storage/upload"
    mime_type, _ = mimetypes.guess_type(str(file_path))
    mime_type = mime_type or "application/octet-stream"

    with open(file_path, "rb") as f:
        files = {"file": (file_path.name, f, mime_type)}
        auth_headers = {"x-api-key": API_KEY, "Authorization": f"Bearer {API_KEY}"}
        
        resp = requests.post(upload_url, headers=auth_headers, files=files)
        time.sleep(2)  # Pause to respect rate limits
        
        if resp.ok:
            data = resp.json()
            file_url = data.get("url")
            if file_url and file_url.startswith("/"):
                file_url = f"{API_BASE}{file_url}"
            return file_url
        else:
            print(f"⚠️  Failed to upload image {file_path.name}: {resp.status_code} - {resp.text}")
            return ""

def extract_title_and_clean_content(md_text: str, fallback_name: str) -> tuple[str, str]:
    """Extracts the first H1 header for title and returns the text."""
    lines = md_text.splitlines()
    title = None
    cleaned_lines = []

    for line in lines:
        if title is None and line.strip().startswith("# "):
            title = line.strip().lstrip("# ").strip()
        else:
            cleaned_lines.append(line)

    if not title:
        title = fallback_name.replace("-", " ").replace("_", " ").title()

    return title, md_text.strip()

def map_category(rel_path: Path) -> str:
    """Classifies a Markdown file into one of the allowed categories."""
    path_str = str(rel_path).lower()
    name = rel_path.stem.lower()

    if any(k in path_str for k in ["example-", "examples-"]):
        return "community guides"
    
    if any(k in path_str for k in ["sdk", "framework-", "microframe", "javascript-sdk"]):
        return "integrations"

    if any(k in name for k in ["getting-started", "introduction", "dashboard_tour", "quick_dev"]):
        return "getting started"

    if any(k in path_str for k in [
        "architecture", "policies", "collections", "records", "realtime",
        "cron", "graphql", "wasm", "replication", "write-optimizations",
        "scripting", "files-api", "users-api", "system-api", "hooks"
    ]):
        return "core concepts"

    return "others"

# ==============================================================================
# MAIN SEEDING RUNNER
# ==============================================================================

def main():
    if not DOCS_DIR.exists():
        print(f"❌ Docs directory not found at: {DOCS_DIR}")
        return

    print(f"🚀 Starting ApexKit Docs Seeding to: {API_URL}")
    print(f"📂 Source Directory: {DOCS_DIR.resolve()}\n")

    # Step 1: Upload Screenshots and build map
    screenshots_dir = DOCS_DIR / "screenshots"
    image_url_map = {}

    if screenshots_dir.exists():
        print("📸 Uploading screenshot assets to ApexKit Storage...")
        for img_file in screenshots_dir.iterdir():
            if img_file.is_file() and img_file.suffix.lower() in [".png", ".jpg", ".jpeg", ".webp", ".svg"]:
                print(f"  ⬆️  Uploading {img_file.name}...")
                remote_url = upload_screenshot(img_file)
                if remote_url:
                    image_url_map[img_file.name] = remote_url
                    print(f"     ✅ Linked to: {remote_url}")
        print()

    # Step 2: Pre-fetch existing docs to index both SLUG and TITLE collisions
    print("📋 Checking existing documents in 'docs' collection for slug collisions...")
    existing_docs = {}
    try:
        list_url = f"{API_URL}/collections/docs/records?per_page=500"
        res = requests.get(list_url, headers=HEADERS)
        time.sleep(2)  # Pause after listing
        
        if res.ok:
            items = res.json().get("items", [])
            for item in items:
                record_id = item.get("id")
                data = item.get("data", {})
                slug = data.get("slug")
                title = data.get("title")

                # Map slug to record ID
                if slug:
                    existing_docs[slug.strip().lower()] = record_id
                
                # Also map title-derived slug to record ID
                if title:
                    existing_docs[slugify(title)] = record_id
                    existing_docs[title.strip().lower()] = record_id

            print(f"  Found {len(items)} existing docs in database.\n")
        else:
            print(f"  ℹ️  Collection fetch status: {res.status_code}. Proceeding with fresh inserts.\n")
    except Exception as e:
        print(f"  ⚠️ Could not query existing docs: {e}\n")

    # Step 3: Parse and seed all Markdown files
    md_files = list(DOCS_DIR.rglob("*.md"))
    print(f"📝 Processing {len(md_files)} Markdown files (with 2s rate-limit pause)...\n")

    created_count = 0
    updated_count = 0
    error_count = 0

    for md_path in md_files:
        rel_path = md_path.relative_to(DOCS_DIR)
        
        try:
            with open(md_path, "r", encoding="utf-8") as f:
                content = f.read()

            if not content.strip():
                continue

            # Replace relative screenshot links with live storage URLs
            for img_name, remote_url in image_url_map.items():
                content = re.sub(
                    rf"(\.\./|\./|screenshots/)?{re.escape(img_name)}",
                    remote_url,
                    content
                )

            title, final_content = extract_title_and_clean_content(content, md_path.stem)
            category = map_category(rel_path)
            target_slug = slugify(title)

            # Payload (ApexKit's slugify-doc hook will auto-normalize slug on creation if omitted)
            doc_payload = {
                "data": {
                    "title": title,
                    "content": final_content,
                    "category": category
                }
            }

            # Check for Slug or Title collision
            matched_id = (
                existing_docs.get(target_slug) 
                or existing_docs.get(title.strip().lower())
            )

            if matched_id:
                # Collision detected -> UPDATE existing record
                update_url = f"{API_URL}/collections/docs/records/{matched_id}"
                resp = requests.put(update_url, headers=HEADERS, json=doc_payload)
                time.sleep(2)  # 2s Pause to avoid rate limits

                if resp.ok:
                    print(f"  🔄 [Updated / Slug Match] ID {matched_id}: {title} (slug: {target_slug})")
                    updated_count += 1
                else:
                    print(f"  ❌ [Update Failed] {title}: {resp.status_code} - {resp.text}")
                    error_count += 1
            else:
                # No collision -> CREATE new record
                create_url = f"{API_URL}/collections/docs/records"
                resp = requests.post(create_url, headers=HEADERS, json=doc_payload)
                time.sleep(2)  # 2s Pause to avoid rate limits

                if resp.ok:
                    new_record = resp.json()
                    new_id = new_record.get("id")
                    
                    # Store in lookup map for subsequent files
                    existing_docs[target_slug] = new_id
                    existing_docs[title.strip().lower()] = new_id

                    print(f"  ✨ [Created] ID {new_id}: {title} (slug: {target_slug})")
                    created_count += 1
                else:
                    print(f"  ❌ [Create Failed] {title}: {resp.status_code} - {resp.text}")
                    error_count += 1

        except Exception as err:
            print(f"  ❌ Error processing {rel_path}: {err}")
            error_count += 1

    print("\n" + "="*50)
    print(f"🎉 Seeding Complete!")
    print(f"   • Created: {created_count}")
    print(f"   • Updated: {updated_count}")
    print(f"   • Errors:  {error_count}")
    print("="*50)

if __name__ == "__main__":
    main()