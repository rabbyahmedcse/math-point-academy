"use client";

import { useImageSource } from "./useImageSource";

/**
 * Photo layer for tiles that already draw their own fallback (e.g. the initial letter behind it in StudentsPage).
 * Renders nothing when the URL is empty, unsupported or cannot be loaded, so the fallback stays visible.
 */
export function PhotoImage({ src: raw, alt, className, size }: { src?: string | null; alt: string; className?: string; size?: number }) {
  const { src, ref, onError } = useImageSource(raw, size);
  if (!src) return null;
  // Plain <img> on purpose (see README): avoids next/image remotePatterns + Vercel optimizer quota for user-supplied hosts.
  // eslint-disable-next-line @next/next/no-img-element
  return <img key={src} ref={ref} src={src} alt={alt} loading="lazy" referrerPolicy="no-referrer" onError={onError} className={className} />;
}
