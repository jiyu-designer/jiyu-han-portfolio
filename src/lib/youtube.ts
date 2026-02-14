const PLAYLIST_ID = "PLn7_KfecPX-ai6F4kwSWDZvLW5RezCE5j";
const API_KEY = process.env.YOUTUBE_API_KEY;

export interface PlaylistItem {
  title: string;
  channelTitle: string;
  thumbnail: string;
  videoId: string;
  url: string;
}

export async function fetchPlaylistItems(): Promise<PlaylistItem[]> {
  if (!API_KEY) {
    console.warn("YOUTUBE_API_KEY is not set");
    return [];
  }

  const items: PlaylistItem[] = [];
  let pageToken = "";

  do {
    const params = new URLSearchParams({
      part: "snippet",
      playlistId: PLAYLIST_ID,
      maxResults: "50",
      key: API_KEY,
    });
    if (pageToken) params.set("pageToken", pageToken);

    const res = await fetch(
      `https://www.googleapis.com/youtube/v3/playlistItems?${params}`,
      { next: { revalidate: 3600 } }
    );

    if (!res.ok) {
      console.error("YouTube API error:", res.status, await res.text());
      return items;
    }

    const data = await res.json();

    for (const item of data.items ?? []) {
      const snippet = item.snippet;
      if (!snippet || snippet.title === "Private video" || snippet.title === "Deleted video") continue;

      const videoId = snippet.resourceId?.videoId;
      if (!videoId) continue;

      items.push({
        title: snippet.title,
        channelTitle: snippet.videoOwnerChannelTitle ?? snippet.channelTitle ?? "",
        thumbnail:
          snippet.thumbnails?.maxres?.url ??
          snippet.thumbnails?.high?.url ??
          snippet.thumbnails?.medium?.url ??
          snippet.thumbnails?.default?.url ??
          "",
        videoId,
        url: `https://www.youtube.com/watch?v=${videoId}`,
      });
    }

    pageToken = data.nextPageToken ?? "";
  } while (pageToken);

  return items;
}
