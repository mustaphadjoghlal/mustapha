import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import { Play, Pause, ArrowLeft, ExternalLink } from "lucide-react";

interface VoiceSampleCardProps {
  id: string;
  title: string;
  audioUrl?: string;
  soundcloudUrl?: string;
}

/** أعمدة الموجة الصوتية — نمط ثابت حتى لا يتغيّر الشكل عند كل إعادة رسم */
const BARS = [
  18, 34, 52, 30, 66, 44, 78, 58, 90, 64, 46, 72, 38, 84, 56, 28, 62, 40, 74, 50,
  86, 60, 32, 68, 44, 80, 54, 24, 70, 48, 88, 58, 36, 64, 42, 76, 52, 30, 66, 46,
  82, 56, 26, 72, 50, 84, 38, 60, 44, 78, 34, 68, 48, 90, 54, 28, 62, 40, 74, 32,
];

function formatTime(seconds: number) {
  if (!seconds || Number.isNaN(seconds)) return "00:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function VoiceSampleCard({ id, title, audioUrl, soundcloudUrl }: VoiceSampleCardProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onTime = () => setCurrent(audio.currentTime);
    const onMeta = () => setDuration(audio.duration);
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    const onEnd = () => { setPlaying(false); setCurrent(0); };
    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("loadedmetadata", onMeta);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("ended", onEnd);
    return () => {
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("loadedmetadata", onMeta);
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("ended", onEnd);
    };
  }, [audioUrl]);

  const progress = duration ? current / duration : 0;

  const toggle = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) audio.pause();
    else audio.play().catch(() => setPlaying(false));
  };

  /** النقر على الموجة ينقل موضع التشغيل */
  const seek = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    if (!audio || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    audio.currentTime = Math.min(Math.max(ratio, 0), 1) * duration;
  };

  return (
    <div>
      <div className="flex items-center gap-4 sm:gap-6">
        {/* زر التشغيل */}
        <button
          onClick={toggle}
          disabled={!audioUrl}
          className="flex h-14 w-14 sm:h-16 sm:w-16 flex-shrink-0 items-center justify-center rounded-full bg-royal-500 text-white transition-colors hover:bg-royal-600 disabled:opacity-40"
          aria-label={playing ? "إيقاف النموذج الصوتي" : "تشغيل النموذج الصوتي"}
        >
          {playing ? <Pause size={24} /> : <Play size={24} className="ms-1" />}
        </button>

        <div className="min-w-0 flex-1">
          <h3 className="truncate text-[1.02rem] font-semibold">{title}</h3>
          <p className="mt-0.5 text-xs text-fg-muted" dir="ltr">
            {formatTime(current)} / {formatTime(duration)}
          </p>

          {/* الموجة الصوتية */}
          <div
            onClick={seek}
            className={`mt-3 flex h-10 sm:h-12 items-center gap-[2px] ${audioUrl ? "cursor-pointer" : ""}`}
            dir="ltr"
          >
            {BARS.map((height, i) => (
              <span
                key={i}
                className={`flex-1 rounded-full transition-colors ${
                  i / BARS.length <= progress ? "bg-royal-400" : "bg-ink-600"
                }`}
                style={{ height: `${height}%` }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* الروابط */}
      <div className="mt-6 flex flex-wrap gap-x-6 gap-y-3 text-sm">
        <Link
          to="/portfolio-voice"
          className="inline-flex items-center gap-1.5 text-royal-400 transition-colors hover:text-royal-300"
        >
          المزيد من النماذج
          <ArrowLeft size={15} />
        </Link>
        <Link
          to={`/portfolio/${id}`}
          className="inline-flex items-center gap-1.5 text-fg-muted transition-colors hover:text-fg"
        >
          تفاصيل العمل
          <ArrowLeft size={15} />
        </Link>
        {soundcloudUrl && (
          <a
            href={soundcloudUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-fg-muted transition-colors hover:text-fg"
          >
            <ExternalLink size={14} />
            ساوندكلاود
          </a>
        )}
      </div>

      {audioUrl && <audio ref={audioRef} src={audioUrl} preload="metadata" />}
    </div>
  );
}
