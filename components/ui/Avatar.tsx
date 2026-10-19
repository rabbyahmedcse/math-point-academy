"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

const TONES = ["bg-blue-100 text-blue-700", "bg-purple-100 text-purple-700", "bg-pink-100 text-pink-700", "bg-emerald-100 text-emerald-700", "bg-amber-100 text-amber-700", "bg-cyan-100 text-cyan-700"];
const tone = (s: string) => TONES[[...s].reduce((a, c) => a + c.charCodeAt(0), 0) % TONES.length];

/** Shows the picture at `image` (a URL). Falls back to a coloured initial if there is no URL or it fails to load. */
export function Avatar({ name, image, size = "h-12 w-12 text-lg" }: { name: string; image?: string | null; size?: string }) {
  const [failed, setFailed] = useState<string | null>(null);
  const ok = !!image && /^https?:\/\//i.test(image) && failed !== image;
  if (ok) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={image!} alt={name} loading="lazy" referrerPolicy="no-referrer" onError={() => setFailed(image!)} className={cn("shrink-0 rounded-full object-cover", size)} />;
  }
  return <span className={cn("flex shrink-0 items-center justify-center rounded-full font-bold", size, tone(name))}>{name.trim().charAt(0).toUpperCase()}</span>;
}
