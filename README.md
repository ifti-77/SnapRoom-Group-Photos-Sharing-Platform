# SnapRoom

> **Full-Res Group Photo Dumps. Zero Messaging Apps.**

SnapRoom is a lightweight, zero-login, real-time photo sharing platform designed for events, trips, and meetups. Create an ephemeral room in seconds, share the 6-character room ID or QR code, drop original uncompressed photos directly from any mobile or desktop browser, organize them into folders, and download the entire collection as a ZIP archive.

---

## Screenshots

| Home & Room Discovery | Room Creation |
| :---: | :---: |
| ![SnapRoom Home Page](screenshots/home%20page.png) | ![Create Room](screenshots/create%20room.png) |

| Room View & Folder Management |
| :---: |
| ![SnapRoom Room View](screenshots/room%20view.png) |

---

## Key Features

* **Zero-Auth Ephemeral Rooms:** No accounts, passwords to remember, or phone numbers required. Access rooms via a unique 6-character room ID or by scanning a generated QR code.
* **Host PIN & Access Control:** Room creators can set an optional 4-digit host PIN to protect room administration, manage access verification, and authorize room deletion.
* **Hierarchical Folder System:** 
  * Create root folders and nested subfolders (e.g., `1st Day`, `2nd Day`).
  * In-place folder renaming and move operations across directories.
  * Interactive breadcrumb trail for navigation.
* **Full-Resolution Storage:** Upload images up to 16 MB directly to cloud storage without the heavy compression applied by messaging apps.
* **Real-Time Synchronization (WebSockets):**
  * Powered by Pusher Channels to support persistent real-time updates within serverless environments.
  * Instant photo grid refreshes when anyone in the room uploads or deletes images.
  * Real-time folder tree updates (creations, moves, renames) across all connected devices.
  * Instant room purge notifications if the host deletes the room.
* **Live In-Room Ephemeral Chat:**
  * Floating in-room message drawer.
  * Unique emoji-avatar claiming system (prevents duplicate participant avatars).
  * Real-time message streaming.
* **Batch Operations & Downloads:**
  * Multi-select mode for individual photo downloads.
  * Client-side ZIP compilation and batch download powered by JSZip.
  * Bulk photo deletion with simultaneous physical storage purging.

---

## Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Framework** | [Next.js](https://nextjs.org/) (App Router, Server Actions, Route Handlers) |
| **Database** | [Neon](https://neon.tech/) (Serverless PostgreSQL via `@neondatabase/serverless`) |
| **Object Storage** | [UploadThing](https://uploadthing.com/) (Direct client-to-cloud uploads & UTApi) |
| **Real-Time WebSockets** | [Pusher Channels](https://pusher.com/) (`pusher` & `pusher-js`) |
| **Styling** | [Tailwind CSS](https://tailwindcss.com/) |
| **Language** | [TypeScript](https://www.typescriptlang.org/) |
| **Utilities** | `jszip`, `file-saver`, `qrcode.react`, `cookies-next`, `zod` |
| **Deployment** | [Vercel](https://snaproomx.vercel.app/) |

---

## Database Architecture

The application runs on Neon Serverless Postgres with relational cascading integrity:

```sql
-- 1. Rooms
CREATE TABLE rooms (
    id VARCHAR(10) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    delete_pin VARCHAR(10) DEFAULT 'NoPin',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 2. Folders (Self-referencing for nested subfolders)
CREATE TABLE folders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id VARCHAR(10) NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
    parent_folder_id UUID REFERENCES folders(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 3. Photos
CREATE TABLE photos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id VARCHAR(10) NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
    folder_id UUID REFERENCES folders(id) ON DELETE SET NULL,
    file_key TEXT NOT NULL,
    url TEXT NOT NULL,
    name TEXT NOT NULL,
    size BIGINT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 4. In-Room Chat Messages
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id VARCHAR(10) NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
    sender_emoji VARCHAR(16) NOT NULL,
    sender_identity TEXT NOT NULL,
    text TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
