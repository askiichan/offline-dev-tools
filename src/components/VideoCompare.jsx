import { useEffect, useRef, useState } from "react";
import { Film, Pause, Play, Upload, Volume2, VolumeX, X } from "lucide-react";
import { formatTime, getVideoFormat } from "./videoTrim";
import { commonDuration, comparisonTime } from "./comparePlayback";
import "./VideoCompare.css";

const accept = ".mp4,.m4v,.mov,.webm,.mkv,video/mp4,video/quicktime,video/webm,video/x-matroska";

export default function VideoCompare() {
  const [sources, setSources] = useState([null, null]);
  const [durations, setDurations] = useState([0, 0]);
  const [errors, setErrors] = useState(["", ""]);
  const [time, setTime] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [secondMuted, setSecondMuted] = useState(true);
  const videos = useRef([null, null]);
  const inputs = useRef([null, null]);
  const duration = commonDuration(durations);
  const firstSource = sources[0];
  const secondSource = sources[1];

  useEffect(() => () => { if (firstSource) URL.revokeObjectURL(firstSource.url); }, [firstSource]);
  useEffect(() => () => { if (secondSource) URL.revokeObjectURL(secondSource.url); }, [secondSource]);

  const pauseBoth = () => {
    videos.current.forEach((video) => video?.pause());
    setPlaying(false);
  };

  const showError = (index, message) => {
    setErrors((previous) => previous.map((error, i) => i === index ? message : error));
  };

  const pickFile = (index, file) => {
    if (!file) return;
    if (!getVideoFormat(file.name) || !file.size) {
      showError(index, "Choose a non-empty MP4, M4V, MOV, WebM, or MKV video.");
      return;
    }
    pauseBoth();
    videos.current.forEach((video) => { if (video) video.currentTime = 0; });
    setTime(0);
    setDurations((previous) => previous.map((value, i) => i === index ? 0 : value));
    setErrors(["", ""]);
    setSources((previous) => previous.map((source, i) => i === index
      ? { name: file.name, url: URL.createObjectURL(file) }
      : source));
  };

  const seek = (value) => {
    const next = comparisonTime(Number(value), duration);
    videos.current.forEach((video) => { if (video) video.currentTime = next; });
    setTime(next);
  };

  const togglePlayback = async () => {
    if (!duration || errors.some(Boolean)) return;
    if (playing) {
      pauseBoth();
      return;
    }
    if (videos.current[0].currentTime >= duration - 0.05) seek(0);
    // Start both from the same user gesture so browser autoplay policies allow playback.
    const results = await Promise.allSettled(videos.current.map((video) => video.play()));
    if (results.some((result) => result.status === "rejected")) {
      pauseBoth();
      showError(results.findIndex((result) => result.status === "rejected"), "Playback could not start. Try another browser-supported video.");
    } else {
      setPlaying(true);
    }
  };

  const onTimeUpdate = (index) => {
    const first = videos.current[0];
    const second = videos.current[1];
    if (!first || !second || !duration) return;
    if (index === 0) setTime(comparisonTime(first.currentTime, duration));
    if (first.currentTime >= duration - 0.04 || second.currentTime >= duration - 0.04) {
      pauseBoth();
      setTime(duration);
      return;
    }
    if (playing && Math.abs(first.currentTime - second.currentTime) > 0.2) {
      second.currentTime = first.currentTime;
    }
  };

  return (
    <section className="video-compare">
      <div className="compare-heading">
        <div>
          <div className="compare-eyebrow"><Film size={14} /> LOCAL VIDEO TOOL <span>/ 02</span></div>
          <h3>See the difference.</h3>
          <p>Load two videos and watch them side by side, in step. Nothing leaves your device.</p>
        </div>
        <div className="compare-privacy"><span /> 100% on your device</div>
      </div>

      <div className="compare-panes">
        {[0, 1].map((index) => (
          <div className="compare-pane" key={index}>
            <div className="compare-pane-heading">
              <span className="compare-pane-number">0{index + 1} <span>/</span> {index ? "SECOND VIDEO" : "FIRST VIDEO"}</span>
              {sources[index] && <button type="button" className="compare-replace" onClick={() => inputs.current[index]?.click()}>Replace</button>}
            </div>
            <input
              ref={(node) => { inputs.current[index] = node; }}
              className="sr-only"
              type="file"
              accept={accept}
              aria-label={`Choose ${index ? "second" : "first"} video`}
              onChange={(event) => {
                pickFile(index, event.target.files?.[0]);
                event.target.value = "";
              }}
            />
            {sources[index] ? (
              <>
                <div className="compare-screen">
                  <video
                    key={sources[index].url}
                    ref={(node) => { videos.current[index] = node; }}
                    src={sources[index].url}
                    muted={index === 1 && secondMuted}
                    playsInline
                    preload="metadata"
                    aria-label={`${index ? "Second" : "First"} video preview`}
                    onLoadedMetadata={(event) => {
                      const length = event.currentTarget.duration;
                      if (!Number.isFinite(length) || length <= 0) {
                        pauseBoth();
                        showError(index, "This video has no usable duration.");
                        return;
                      }
                      setDurations((previous) => previous.map((value, i) => i === index ? length : value));
                    }}
                    onError={() => {
                      pauseBoth();
                      showError(index, "This browser cannot play this file. Try an MP4 or WebM video.");
                    }}
                    onTimeUpdate={() => onTimeUpdate(index)}
                    onEnded={pauseBoth}
                    onPause={() => { if (videos.current.some((video) => video && !video.paused)) pauseBoth(); }}
                  />
                </div>
                <div className="compare-file" title={sources[index].name}><Film size={15} /><span>{sources[index].name}</span><small>{durations[index] ? formatTime(durations[index]) : "Loading..."}</small></div>
              </>
            ) : (
              <div
                className="compare-empty"
                onDragOver={(event) => event.preventDefault()}
                onDrop={(event) => { event.preventDefault(); pickFile(index, event.dataTransfer.files[0]); }}
              >
                <div className="compare-empty-icon"><Upload size={26} strokeWidth={1.6} /></div>
                <strong>Choose {index ? "second" : "first"} video</strong>
                <p>Drop a video here, or browse your files.</p>
                <button type="button" className="compare-choose" onClick={() => inputs.current[index]?.click()}>Browse files</button>
                <small>MP4, M4V, MOV, WebM or MKV</small>
              </div>
            )}
            {errors[index] && <div className="compare-error" role="alert"><span>{errors[index]}</span><button type="button" aria-label={`Dismiss ${index ? "second" : "first"} video error`} onClick={() => showError(index, "")}><X size={16} /></button></div>}
          </div>
        ))}
      </div>

      <div className="compare-transport">
        <div className="compare-transport-top">
          <div><span className="compare-live-dot" /> LINKED PLAYBACK <small>Both videos start together and stop at the shorter one.</small></div>
          <span className="compare-clock">{formatTime(time)} <span>/ {formatTime(duration)}</span></span>
        </div>
        <input
          type="range"
          min="0"
          max={duration || 1}
          step="0.01"
          value={comparisonTime(time, duration)}
          onChange={(event) => seek(event.target.value)}
          disabled={!duration || errors.some(Boolean)}
          style={{ "--compare-progress": `${duration ? time / duration * 100 : 0}%` }}
          aria-label="Seek both videos"
        />
        <div className="compare-actions">
          <button type="button" className="compare-play" disabled={!duration || errors.some(Boolean)} onClick={togglePlayback}>
            {playing ? <Pause size={17} fill="currentColor" /> : <Play size={17} fill="currentColor" />}
            {playing ? "Pause both" : "Play both"}
          </button>
          <button type="button" className="compare-audio" onClick={() => setSecondMuted((muted) => !muted)} disabled={!sources[1]} aria-label={secondMuted ? "Unmute second video" : "Mute second video"}>
            {secondMuted ? <VolumeX size={17} /> : <Volume2 size={17} />}
            Second video {secondMuted ? "muted" : "unmuted"}
          </button>
        </div>
      </div>
    </section>
  );
}
