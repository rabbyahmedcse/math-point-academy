"use client";

import { useEffect } from "react";
import { cn } from "@/lib/utils";
import { useImageSource } from "./useImageSource";

const TONES = [
  "bg-blue-100 text-blue-700 ring-blue-200",
  "bg-purple-100 text-purple-700 ring-purple-200",
  "bg-pink-100 text-pink-700 ring-pink-200",
  "bg-emerald-100 text-emerald-700 ring-emerald-200",
  "bg-amber-100 text-amber-700 ring-amber-200",
  "bg-cyan-100 text-cyan-700 ring-cyan-200",
];

const tone = (s: string) =>
  TONES[
    [...s].reduce((a, c) => a + c.charCodeAt(0), 0) %
      TONES.length
  ];

/**
 * Shows the profile picture from an image URL.
 * Falls back to a coloured initial if the URL is missing
 * or the image fails to load.
 */
export function Avatar({
  name,
  image,
  size = "h-12 w-12 text-lg",
  onFail,
}: {
  name: string;
  image?: string | null;
  size?: string;
  /** Called once when a URL was given but no image could be loaded (private / deleted / not an image). */
  onFail?: () => void;
}) {
  // Google Drive sharing links are converted to real image URLs (lib/image-url.ts); other URLs are used as-is.
  const { src, ref, onError, exhausted } = useImageSource(image);
  useEffect(() => {
    if (exhausted) onFail?.();
  }, [exhausted, onFail]);

  const initial = name.trim().charAt(0).toUpperCase() || "?";

  if (src) {
    // eslint-disable-next-line @next/next/no-img-element
    return (
      <span
        className={cn(
          "relative inline-flex shrink-0 overflow-hidden rounded-full bg-slate-100 align-middle ring-2 ring-white shadow-md transition-transform duration-300 hover:scale-105",
          size,
        )}
      >
        <img
          key={src}
          ref={ref}
          src={src}
          alt={`${name} profile`}
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={onError}
          className="absolute inset-0 h-full w-full rounded-full object-cover"
        />
      </span>
    );
  }

  return (
    <span
      aria-label={`${name} avatar`}
      title={name}
      className={cn(
        "inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full font-extrabold ring-2 shadow-sm transition-all duration-300 hover:scale-105",
        "bg-gradient-to-br",
        size,
        tone(name),
      )}
    >
      <span className="select-none">{initial}</span>
    </span>
  );
}