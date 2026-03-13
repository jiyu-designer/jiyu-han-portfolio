import type { Metadata } from "next";
import { fetchPlaylistItems } from "@/lib/youtube";
import LetItJazzClient from "./let-it-jazz-client";

export const revalidate = 3600; // revalidate every hour

export const metadata: Metadata = {
  title: "Let it Jazz | Jiyu Han",
  description: "An AI-powered music player that curates jazz tracks from YouTube, featuring a coverflow album interface and ambient visuals.",
  openGraph: {
    title: "Let it Jazz | Jiyu Han",
    description: "An AI-powered music player that curates jazz tracks from YouTube, featuring a coverflow album interface and ambient visuals.",
    images: [{ url: "/images/projects/Letitjazz-main.png" }],
  },
};

export default async function LetItJazzPage() {
  const tracks = await fetchPlaylistItems();

  return <LetItJazzClient tracks={tracks} />;
}
