import { fetchPlaylistItems } from "@/lib/youtube";
import LetItJazzClient from "./let-it-jazz-client";

export const revalidate = 3600; // revalidate every hour

export default async function LetItJazzPage() {
  const tracks = await fetchPlaylistItems();

  return <LetItJazzClient tracks={tracks} />;
}
