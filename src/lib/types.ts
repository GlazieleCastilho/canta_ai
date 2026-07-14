export type Song = {
  id: string;
  title: string;
  artist: string;
  style: string;
  mp3_path: string;
  lrc_text: string;
  created_at: string;
};

export type BackgroundVideo = {
  id: string;
  style: string;
  mp4_path: string;
  created_at: string;
};

export type QueueStatus = "waiting" | "performing" | "done";

export type QueueEntry = {
  id: string;
  singer_name: string;
  song_id: string | null;
  status: QueueStatus;
  created_at: string;
  songs: Pick<Song, "id" | "title" | "artist" | "style" | "mp3_path" | "lrc_text"> | null;
};

export const SUGGESTED_STYLES = [
  "sertanejo",
  "pop",
  "rock",
  "mpb",
  "pagode",
  "forró",
  "axé",
  "internacional",
];

/** URL pública de um arquivo no bucket `midia`. */
export function mediaUrl(path: string): string {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return `${base}/storage/v1/object/public/midia/${path}`;
}
