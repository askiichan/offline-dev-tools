export const MAX_VIDEO_BYTES = 250 * 1024 * 1024;

const formats = {
  mp4: "video/mp4",
  m4v: "video/mp4",
  mov: "video/quicktime",
  webm: "video/webm",
  mkv: "video/x-matroska",
};

export function getVideoFormat(name) {
  const extension = name.split(".").pop()?.toLowerCase();
  return extension && formats[extension]
    ? { extension, type: formats[extension] }
    : null;
}

export function formatTime(seconds) {
  const centiseconds = Math.round(Math.max(0, seconds) * 100);
  const hours = Math.floor(centiseconds / 360000);
  const minutes = Math.floor((centiseconds % 360000) / 6000);
  const remainder = Math.floor((centiseconds % 6000) / 100);
  const fraction = String(centiseconds % 100).padStart(2, "0");
  return `${hours ? `${hours}:` : ""}${String(minutes).padStart(2, "0")}:${String(remainder).padStart(2, "0")}.${fraction}`;
}

export function trimArguments(start, end, extension) {
  if (!formats[extension] || !Number.isFinite(start) || !Number.isFinite(end) || start < 0 || end <= start) {
    throw new Error("Choose a valid clip before exporting.");
  }
  return [
    "-i", `source.${extension}`,
    "-ss", start.toFixed(3),
    "-t", (end - start).toFixed(3),
    "-map", "0",
    "-c", "copy",
    "-avoid_negative_ts", "make_zero",
    `clip.${extension}`,
  ];
}

export function clipName(name, extension) {
  return `${name.slice(0, -(extension.length + 1))}-clip.${extension}`;
}
