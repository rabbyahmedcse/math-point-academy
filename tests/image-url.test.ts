import { test } from "node:test";
import assert from "node:assert/strict";
import { classifyImageUrl, extractDriveFileId, getImageCandidates, imageProblemHint, toImageSrc } from "../lib/image-url";

const ID = "1AbCdEfGhIjKlMnOpQrStUvWxYz_-0123456";
const THUMB = `https://drive.google.com/thumbnail?id=${ID}&sz=w256`;
const VIEW = `https://drive.google.com/uc?export=view&id=${ID}`;

test("the four requested Drive formats resolve to the same file id and image candidates", () => {
  for (const url of [
    `https://drive.google.com/file/d/${ID}/view?usp=sharing`,
    `https://drive.google.com/file/d/${ID}/view?usp=drive_link`,
    `https://drive.google.com/open?id=${ID}`,
    `https://drive.google.com/uc?export=view&id=${ID}`,
  ]) {
    assert.equal(extractDriveFileId(url), ID, url);
    assert.equal(classifyImageUrl(url), "drive-file", url);
    assert.deepEqual(getImageCandidates(url), [THUMB, VIEW], url);
    assert.equal(toImageSrc(url), THUMB, url);
  }
});

test("other real-world Drive link shapes", () => {
  for (const url of [
    `https://drive.google.com/file/d/${ID}`,
    `https://drive.google.com/file/d/${ID}/`,
    `https://drive.google.com/file/d/${ID}/preview`,
    `https://drive.google.com/file/u/0/d/${ID}/view`,
    `https://drive.google.com/file/u/2/d/${ID}/view?resourcekey=0-abc`,
    `https://drive.google.com/uc?id=${ID}`,
    `https://drive.google.com/uc?id=${ID}&export=download`,
    `https://drive.google.com/thumbnail?id=${ID}&sz=w1000`,
    `https://drive.usercontent.google.com/download?id=${ID}&export=view`,
    `https://docs.google.com/uc?id=${ID}`,
    `  https://drive.google.com/open?id=${ID}  `, // surrounding spaces
    `HTTPS://DRIVE.GOOGLE.COM/open?id=${ID}`, // case-insensitive scheme/host
    `http://drive.google.com/open?id=${ID}`,
  ]) assert.equal(extractDriveFileId(url), ID, url);
});

test("ordinary external image URLs are preserved untouched (existing data keeps working)", () => {
  for (const url of ["https://i.ibb.co/abc/photo.jpg", "https://example.com/a.png?x=1", "http://cdn.example.com/p.webp", `https://lh3.googleusercontent.com/d/${ID}=w200`]) {
    assert.equal(classifyImageUrl(url), "external", url);
    assert.deepEqual(getImageCandidates(url), [url], url);
  }
});

test("empty / malformed / non-http values produce no candidates and never throw", () => {
  for (const v of ["", "   ", null, undefined, "not a url", "drive.google.com/file/d/" + ID + "/view", "javascript:alert(1)", "data:image/png;base64,AAAA", "file:///etc/passwd", "ftp://drive.google.com/open?id=" + ID, "https://", "https://user:pw@drive.google.com/open?id=" + ID]) {
    assert.deepEqual(getImageCandidates(v as never), [], String(v));
    assert.equal(toImageSrc(v as never), null, String(v));
    assert.equal(extractDriveFileId(v as never), null, String(v));
  }
  assert.equal(classifyImageUrl(""), "empty");
  assert.equal(classifyImageUrl("not a url"), "invalid");
});

test("overlong URLs are rejected", () => {
  assert.deepEqual(getImageCandidates("https://example.com/" + "a".repeat(3000)), []);
});

test("Drive links that are not a single image file are not converted (and not treated as external)", () => {
  for (const url of [
    `https://drive.google.com/drive/folders/${ID}`,
    `https://drive.google.com/drive/u/0/folders/${ID}`,
    `https://drive.google.com/drive/my-drive`,
    `https://docs.google.com/document/d/${ID}/edit`,
    `https://docs.google.com/spreadsheets/d/${ID}/edit`,
    "https://drive.google.com/open", // no id
    "https://drive.google.com/open?id=",
  ]) {
    assert.equal(extractDriveFileId(url), null, url);
    assert.equal(classifyImageUrl(url), "drive-other", url);
    assert.deepEqual(getImageCandidates(url), [], url);
  }
});

test("invalid ids are rejected (too short, bad characters, injection attempts)", () => {
  for (const bad of ["short", "abc def ghijkl", `${ID}&evil=1`, `${ID}/../x`, "a".repeat(101), "<script>alert(1)</script>"])
    assert.equal(extractDriveFileId(`https://drive.google.com/open?id=${encodeURIComponent(bad)}`), null, bad);
  assert.equal(extractDriveFileId("https://drive.google.com/file/d/short/view"), null);
});

test("look-alike hosts are NOT treated as Drive (exact hostname match only)", () => {
  for (const url of [
    `https://drive.google.com.evil.com/file/d/${ID}/view`,
    `https://evil.com/drive.google.com/file/d/${ID}/view`,
    `https://evil.com/open?id=${ID}&u=drive.google.com`,
    `https://notdrive.google.com/open?id=${ID}`,
    `https://google.com/open?id=${ID}`,
  ]) {
    assert.equal(extractDriveFileId(url), null, url);
    assert.equal(classifyImageUrl(url), "external", url);
    assert.deepEqual(getImageCandidates(url), [url], url); // unchanged, not rewritten
  }
});

test("thumbnail size: default, custom, clamped, sanitised", () => {
  const u = `https://drive.google.com/open?id=${ID}`;
  assert.equal(toImageSrc(u, 400), `https://drive.google.com/thumbnail?id=${ID}&sz=w400`);
  assert.equal(toImageSrc(u, 99999), `https://drive.google.com/thumbnail?id=${ID}&sz=w1600`);
  for (const bad of [0, -5, NaN]) assert.equal(toImageSrc(u, bad), THUMB);
});

test("problem hints are specific and honest", () => {
  assert.match(imageProblemHint(`https://drive.google.com/file/d/${ID}/view`), /Anyone with the link/);
  assert.match(imageProblemHint(`https://drive.google.com/drive/folders/${ID}`), /folder/);
  assert.match(imageProblemHint("nonsense"), /https:\/\//);
  assert.match(imageProblemHint("https://example.com/x.png"), /publicly accessible/);
});
