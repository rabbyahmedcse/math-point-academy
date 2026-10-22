"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getImageCandidates } from "@/lib/image-url";

/**
 * Drives an <img> through the candidate URLs from lib/image-url.ts.
 *  - Each candidate is tried at most ONCE: onError moves to the next one, then to "exhausted" — no retry loops.
 *  - State is keyed by the candidate list, so changing the URL (e.g. typing in the edit form) starts fresh.
 *  - Server and first client render use the same first candidate, so there is no hydration mismatch.
 *  - An image that already failed before hydration (its error event was missed) is detected from the DOM.
 * `exhausted` is true when a URL was supplied but nothing could be displayed -> show the fallback.
 */
export function useImageSource(raw: string | null | undefined, size?: number) {
  const candidates = useMemo(() => getImageCandidates(raw, size), [raw, size]);
  const key = candidates.join("|");
  const [state, setState] = useState({ key: "", index: 0 });
  const index = state.key === key ? state.index : 0;
  const src = candidates[index] ?? null;
  const ref = useRef<HTMLImageElement>(null);

  const onError = useCallback(() => setState({ key, index: index + 1 }), [key, index]);

  useEffect(() => {
    const el = ref.current;
    if (src && el && el.complete && el.naturalWidth === 0) onError();
  }, [src, onError]);

  return { src, ref, onError, exhausted: candidates.length > 0 && src === null };
}
