import { useEffect, useRef, useState } from "react";
import { Check, Download, Film, Pause, Play, Scissors, Upload, X } from "lucide-react";
import coreURL from "@ffmpeg/core?url";
import wasmURL from "@ffmpeg/core/wasm?url";
import { clipName, formatTime, getVideoFormat, MAX_VIDEO_BYTES, trimArguments } from "./videoTrim";
import "./VideoTrimmer.css";

export default function VideoTrimmer() {
  const [source, setSource] = useState(null);
  const [duration, setDuration] = useState(0);
  const [start, setStart] = useState(0);
  const [end, setEnd] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [output, setOutput] = useState(null);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [dragging, setDragging] = useState(false);
  const videoRef = useRef(null);
  const inputRef = useRef(null);
  const engineRef = useRef(null);
  const jobRef = useRef(0);

  useEffect(() => () => {
    jobRef.current += 1;
    engineRef.current?.terminate();
  }, []);
  useEffect(() => () => { if (source) URL.revokeObjectURL(source.url); }, [source]);
  useEffect(() => () => { if (output) URL.revokeObjectURL(output.url); }, [output]);

  const resetOutput = () => {
    setOutput(null);
    setError("");
  };

  const pickFile = (file) => {
    if (!file) return;
    const format = getVideoFormat(file.name);
    if (!format) {
      setError("Choose an MP4, M4V, MOV, WebM, or MKV video.");
      return;
    }
    if (file.size > MAX_VIDEO_BYTES) {
      setError("This file is over 250 MB. Browser-based export needs room for both the original and the clip.");
      return;
    }
    if (!file.size) {
      setError("This file is empty. Choose another video.");
      return;
    }
    videoRef.current?.pause();
    setSource({ file, format, url: URL.createObjectURL(file) });
    setDuration(0);
    setStart(0);
    setEnd(0);
    setCurrentTime(0);
    setPlaying(false);
    resetOutput();
    if (inputRef.current) inputRef.current.value = "";
  };

  const updateStart = (value) => {
    const number = Number(value);
    if (value === "" || !Number.isFinite(number)) return;
    const next = Math.max(0, Math.min(number, end - 0.1));
    setStart(next);
    resetOutput();
    if (videoRef.current && videoRef.current.currentTime < next) videoRef.current.currentTime = next;
  };

  const updateEnd = (value) => {
    const number = Number(value);
    if (value === "" || !Number.isFinite(number)) return;
    const next = Math.min(duration, Math.max(number, start + 0.1));
    setEnd(next);
    resetOutput();
    if (videoRef.current && videoRef.current.currentTime >= next) {
      videoRef.current.pause();
      videoRef.current.currentTime = start;
    }
  };

  const togglePreview = async () => {
    const video = videoRef.current;
    if (!video) return;
    if (!video.paused) {
      video.pause();
      return;
    }
    if (video.currentTime < start || video.currentTime >= end - 0.05) video.currentTime = start;
    try {
      await video.play();
    } catch {
      setError("Preview could not start. Try using the video's built-in controls.");
    }
  };

  const exportClip = async () => {
    if (!source || !duration || end <= start || status) return;
    const job = ++jobRef.current;
    let ffmpeg;
    resetOutput();
    setStatus("Starting local video engine...");
    try {
      const { FFmpeg } = await import("@ffmpeg/ffmpeg");
      if (job !== jobRef.current) return;
      ffmpeg = new FFmpeg();
      engineRef.current = ffmpeg;
      await ffmpeg.load({ coreURL, wasmURL });
      if (job !== jobRef.current) return;
      setStatus("Preparing video...");
      await ffmpeg.writeFile(`source.${source.format.extension}`, new Uint8Array(await source.file.arrayBuffer()));
      if (job !== jobRef.current) return;
      setStatus("Copying video and audio streams...");
      const code = await ffmpeg.exec(trimArguments(start, end, source.format.extension));
      if (job !== jobRef.current) return;
      if (code !== 0) throw new Error("The video could not be cut with stream copy. Try a different file or selection.");
      const data = await ffmpeg.readFile(`clip.${source.format.extension}`);
      if (!data.length) throw new Error("No video was produced. Try a longer selection or a different video.");
      if (job !== jobRef.current) return;
      const blob = new Blob([data], { type: source.format.type });
      setOutput({ url: URL.createObjectURL(blob), name: clipName(source.file.name, source.format.extension), size: blob.size });
    } catch (cause) {
      if (job === jobRef.current) setError(cause instanceof Error ? cause.message : "Export failed. Try a different video.");
    } finally {
      ffmpeg?.terminate();
      if (engineRef.current === ffmpeg) engineRef.current = null;
      if (job === jobRef.current) setStatus("");
    }
  };

  const cancelExport = () => {
    jobRef.current += 1;
    engineRef.current?.terminate();
    engineRef.current = null;
    setStatus("");
  };

  const percent = (value) => `${duration ? (value / duration) * 100 : 0}%`;

  return (
    <section className="video-trimmer pb-12">
      <div className="trim-heading">
        <div>
          <div className="trim-eyebrow"><Scissors size={14} /> LOCAL VIDEO TOOL <span> / 01</span></div>
          <h3>Keep the good part.</h3>
          <p>Pick a moment, preview it, and save a new clip. Your video stays on this device.</p>
        </div>
        <div className="trim-privacy"><span className="trim-privacy-dot" /> 100% on your device</div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept=".mp4,.m4v,.mov,.webm,.mkv,video/mp4,video/quicktime,video/webm,video/x-matroska"
        className="sr-only"
        aria-label="Choose a video"
        onChange={(event) => pickFile(event.target.files?.[0])}
      />

      {!source ? (
        <div
          className={`trim-drop ${dragging ? "trim-drop-active" : ""}`}
          onDragOver={(event) => { event.preventDefault(); setDragging(true); }}
          onDragLeave={(event) => { event.preventDefault(); setDragging(false); }}
          onDrop={(event) => { event.preventDefault(); setDragging(false); pickFile(event.dataTransfer.files[0]); }}
        >
          <div className="trim-drop-symbol"><Film size={36} strokeWidth={1.4} /><span>+</span></div>
          <h4>Start with a video</h4>
          <p>Drop it here, or choose one from your device.</p>
          <button className="trim-primary" onClick={() => inputRef.current?.click()}><Upload size={17} /> Choose video</button>
          <small>MP4, M4V, MOV, WebM or MKV · Up to 250 MB</small>
        </div>
      ) : (
        <div className="trim-workspace">
          <div className="trim-fileline">
            <div className="trim-file-name"><Film size={18} /><span title={source.file.name}>{source.file.name}</span><small>{(source.file.size / 1024 / 1024).toFixed(1)} MB</small></div>
            <button className="trim-text-button" disabled={!!status} onClick={() => inputRef.current?.click()}>Replace video</button>
          </div>

          <div className="trim-stage">
            <video
              ref={videoRef}
              src={source.url}
              controls
              playsInline
              preload="metadata"
              onLoadedMetadata={(event) => {
                const length = event.currentTarget.duration;
                if (!Number.isFinite(length) || length < 0.1) {
                  setError("This video has no usable duration. Try another file.");
                  return;
                }
                setDuration(length);
                setEnd(length);
              }}
              onError={() => setError("This browser cannot preview this video. Try a browser-supported MP4 or WebM file.")}
              onTimeUpdate={(event) => {
                const time = event.currentTarget.currentTime;
                setCurrentTime(time);
                if (end && time >= end) event.currentTarget.pause();
              }}
              onPlay={(event) => {
                if (event.currentTarget.currentTime < start || event.currentTarget.currentTime >= end) event.currentTarget.currentTime = start;
                setPlaying(true);
              }}
              onPause={() => setPlaying(false)}
            />
          </div>

          {duration > 0 && (
            <div className="trim-editor">
              <div className="trim-section-label"><span>01 / SELECT A CLIP</span><span>{formatTime(duration)} TOTAL</span></div>
              <div className="trim-timeline" style={{ "--trim-start": percent(start), "--trim-end": percent(end), "--trim-playhead": percent(currentTime) }}>
                <div className="trim-timeline-selection" />
                <div className="trim-playhead" />
                <input type="range" min="0" max={duration} step="0.01" value={start} onChange={(event) => updateStart(event.target.value)} aria-label="Clip start" disabled={!!status} />
                <input type="range" min="0" max={duration} step="0.01" value={end} onChange={(event) => updateEnd(event.target.value)} aria-label="Clip end" disabled={!!status} />
              </div>
              <div className="trim-time-labels"><span>0:00</span><span>{formatTime(duration)}</span></div>
              <div className="trim-controls">
                <label>IN <input type="number" min="0" max={end - 0.1} step="0.01" value={Number(start.toFixed(2))} onChange={(event) => updateStart(event.target.value)} disabled={!!status} aria-label="Clip start in seconds" /><span>s</span></label>
                <button className="trim-preview" onClick={togglePreview} aria-label={playing ? "Pause clip preview" : "Play clip preview"}>{playing ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" />}<span>{playing ? "Pause" : "Preview clip"}</span></button>
                <label>OUT <input type="number" min={start + 0.1} max={duration} step="0.01" value={Number(end.toFixed(2))} onChange={(event) => updateEnd(event.target.value)} disabled={!!status} aria-label="Clip end in seconds" /><span>s</span></label>
              </div>
              <div className="trim-bottom">
                <div><strong>{formatTime(end - start)}</strong><span> selected · Stream-copy cuts land on nearby keyframes, so saved boundaries may differ slightly from the preview.</span></div>
                {status ? (
                  <div className="trim-processing"><span role="status">{status}</span><button onClick={cancelExport}>Cancel</button></div>
                ) : (
                  <button className="trim-primary" onClick={exportClip} disabled={end - start < 0.1}><Scissors size={17} /> Export clip</button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {error && <div className="trim-error" role="alert"><span>{error}</span><button aria-label="Dismiss error" onClick={() => setError("")}><X size={16} /></button></div>}
      {output && (
        <div className="trim-result">
          <div className="trim-section-label"><span><Check size={15} /> 02 / YOUR CLIP IS READY</span><span>{(output.size / 1024 / 1024).toFixed(1)} MB</span></div>
          <video src={output.url} controls playsInline preload="metadata" aria-label="Exported clip preview" />
          <div className="trim-result-actions"><span title={output.name}>{output.name}</span><a className="trim-primary" href={output.url} download={output.name}><Download size={17} /> Save video</a></div>
        </div>
      )}
    </section>
  );
}
