/**
 * Image URL helpers (pure — no framework or browser imports, so they are shared by server and client code
 * and unit-tested in tests/image-url.test.ts).
 *
 * WHY THIS EXISTS: a Google Drive *sharing* link (drive.google.com/file/d/ID/view, /open?id=ID …) is an HTML
 * page, not an image, so `<img src="…">` can never display it. This module recognises single-file Drive links,
 * extracts the file id and produces URLs that Google serves as actual image bytes.
 *
 * LIMITS (by design): this only rewrites the URL. It cannot and does not bypass Drive permissions — the file must
 * be shared as "Anyone with the link" (Viewer). Private / deleted / quota-blocked files will still fail to load,
 * and the UI then falls back to initials. Nothing is proxied or fetched on our servers.
 */

/** Hosts whose links are treated as Google Drive file links. Compared by exact hostname, never by substring. */
const DRIVE_HOSTS = new Set(["drive.google.com", "drive.usercontent.google.com"]);
const DOCS_HOST = "docs.google.com"; // only the legacy /uc?id= form is an image-style link

/** Drive file ids are URL-safe base64-ish tokens, in practice 25–45 chars. Be lenient on length, strict on charset. */
const FILE_ID_RE = /^[A-Za-z0-9_-]{10,100}$/;

const MAX_URL_LENGTH = 2048;
const DEFAULT_SIZE = 256;
const MAX_SIZE = 1600;

export type ImageUrlKind =
  | "empty" // nothing entered
  | "invalid" // not a well-formed http(s) URL
  | "drive-file" // a single Google Drive file link we can convert
  | "drive-other" // a Google Drive link that is NOT a single file (folder, Docs, …) — cannot be shown as an image
  | "external"; // any other http(s) URL — used as-is

function parse(raw: string | null | undefined): URL | null {
  const s = (raw ?? "").trim();
  if (!s || s.length > MAX_URL_LENGTH) return null;
  try {
    const u = new URL(s);
    if (u.protocol !== "https:" && u.protocol !== "http:") return null; // blocks javascript:, data:, file:, ftp: …
    if (u.username || u.password) return null; // never follow credentials embedded in a URL
    return u;
  } catch {
    return null;
  }
}

const validId = (id: string | null | undefined): string | null => (id && FILE_ID_RE.test(id) ? id : null);

/**
 * File id of a supported single-file Google Drive link, otherwise null.
 * Supported: /file/d/ID/(view|preview|edit…), /file/u/N/d/ID/…, /open?id=ID, /uc?id=ID (&export=view|download),
 * /thumbnail?id=ID, drive.usercontent.google.com/(download|uc)?id=ID, docs.google.com/uc?id=ID.
 * Not supported (null): folders, Google Docs/Sheets/Slides, shortcuts without an id, ids with unexpected characters.
 */
export function extractDriveFileId(raw: string | null | undefined): string | null {
  const u = parse(raw);
  if (!u) return null;
  const host = u.hostname.toLowerCase();
  const path = u.pathname.replace(/\/+$/, "");

  if (host === DOCS_HOST) return path === "/uc" ? validId(u.searchParams.get("id")) : null;
  if (!DRIVE_HOSTS.has(host)) return null;

  const m = path.match(/^\/file(?:\/u\/\d+)?\/d\/([^/]+)(?:\/|$)/);
  if (m) return validId(m[1]);

  if (host === "drive.usercontent.google.com") return path === "/download" || path === "/uc" ? validId(u.searchParams.get("id")) : null;
  if (path === "/open" || path === "/uc" || path === "/thumbnail") return validId(u.searchParams.get("id"));
  return null;
}

/** Classifies what the user typed; useful for hints in forms. */
export function classifyImageUrl(raw: string | null | undefined): ImageUrlKind {
  if (!(raw ?? "").trim()) return "empty";
  const u = parse(raw);
  if (!u) return "invalid";
  if (extractDriveFileId(raw)) return "drive-file";
  const host = u.hostname.toLowerCase();
  if (DRIVE_HOSTS.has(host) || host === DOCS_HOST) return "drive-other";
  return "external";
}

const clampSize = (n: number | undefined) =>
  Number.isFinite(n) && (n as number) > 0 ? Math.min(Math.round(n as number), MAX_SIZE) : DEFAULT_SIZE;

/** Google's thumbnail endpoint: returns image bytes (resized to width `size`) for files shared with "Anyone with the link". */
export const driveThumbnailUrl = (fileId: string, size?: number) =>
  `https://drive.google.com/thumbnail?id=${encodeURIComponent(fileId)}&sz=w${clampSize(size)}`;

/** Classic direct-view endpoint. Less reliable today (redirects, quota pages) — only used as a second attempt. */
export const driveViewUrl = (fileId: string) => `https://drive.google.com/uc?export=view&id=${encodeURIComponent(fileId)}`;

/**
 * Ordered list of URLs to TRY for an `<img>`:
 *   Drive file link  -> [thumbnail URL, uc?export=view URL]   (callers advance on error, so at most 2 attempts)
 *   other http(s)    -> [the URL unchanged]                    (existing external images keep working)
 *   empty / invalid / Drive folder or Docs link -> []          (nothing can be displayed -> show the fallback)
 */
export function getImageCandidates(raw: string | null | undefined, size?: number): string[] {
  const kind = classifyImageUrl(raw);
  if (kind === "empty" || kind === "invalid" || kind === "drive-other") return [];
  if (kind === "external") return [(raw as string).trim()];
  const id = extractDriveFileId(raw) as string;
  return [driveThumbnailUrl(id, size), driveViewUrl(id)];
}

/** First URL to try, or null when there is nothing displayable. */
export const toImageSrc = (raw: string | null | undefined, size?: number): string | null => getImageCandidates(raw, size)[0] ?? null;

/** Plain-language reason shown when an image could not be displayed. */
export function imageProblemHint(raw: string | null | undefined): string {
  switch (classifyImageUrl(raw)) {
    case "invalid":
      return "This doesn’t look like a valid web link. It must start with https://";
    case "drive-other":
      return "This Google Drive link isn’t a single image file (it may be a folder or a document). Open the image itself, choose Share, and copy that link.";
    case "drive-file":
      return "We couldn’t load this Google Drive file. Set its sharing to “Anyone with the link” (Viewer) and make sure it is an image file that hasn’t been deleted.";
    default:
      return "We couldn’t load this image. Check that the link points directly to an image and is publicly accessible.";
  }
}
