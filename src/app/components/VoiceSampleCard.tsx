import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import { Play, Pause, Mic, ArrowLeft, ExternalLink } from "lucide-react";

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
    // الواجهة بالعربية (RTL) لكن الموجة تُقرأ من اليسار لليمين كالمشغّلات المعتادة
    const ratio = (e.clientX - rect.left) / rect.width;
    audio.currentTime = Math.min(Math.max(ratio, 0), 1) * duration;
  };

  return (
    <div className="relative overflow-hidden rounded-3xl border border-ink-700 bg-ink-850">
      {/* زخرفة الميكروفون في طرف البطاقة */}
      <div className="pointer-events-none absolute inset-y-0 start-0 w-40 sm:w-56 opacity-60">
        <div className="absolute inset-0 bg-gradient-to-r from-royal-900/70 via-royal-800/20 to-transparent" />
        <Mic
          className="absolute top-1/2 -translate-y-1/2 start-6 text-royal-400/50"
          size={92}
          strokeWidth={1.1}
        />
      </div>

      <div className="relative p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center gap-6">
          {/* زر التشغيل */}
          <button
            onClick={toggle}
            disabled={!audioUrl}
            className="order-2 sm:order-1 flex-shrink-0 self-start sm:self-auto flex items-center justify-center w-16 h-16 rounded-full bg-royal-500 text-white shadow-lg shadow-royal-500/30 transition-transform hover:scale-105 active:scale-95 disabled:opacity-40 disabled:hover:scale-100"
            aria-label={playing ? "إيقاف النموذج الصوتي" : "تشغيل النموذج الصوتي"}
          >
            {playing ? <Pause size={26} /> : <Play size={26} className="ms-1" />}
          </button>

          {/* الموجة والعنوان */}
          <div className="order-1 sm:order-2 flex-1 min-w-0 text-end">
            <h3 className="text-2xl font-bold text-white mb-1">نموذج صوتي</h3>
            <p className="text-gray-400 text-sm mb-4 truncate">{title}</p>

            <div
              onClick={seek}
              className={`flex items-end gap-[3px] h-14 ${audioUrl ? "cursor-pointer" : ""}`}
              dir="ltr"
            >
              {BARS.map((height, i) => {
                const filled = i / BARS.length <= progress;
                return (
                  <span
                    key={i}
                    className={`flex-1 rounded-full transition-colors ${
                      filled ? "bg-royal-400" : "bg-ink-600"
                    }`}
                    style={{ height: `${height}%` }}
                  />
                );
              })}
            </div>

            <p className="mt-3 text-xs tabular-nums text-gray-400" dir="ltr">
              {formatTime(current)} / {formatTime(duration)}
            </p>
          </div>
        </div>

        {/* الروابط */}
        <div className="mt-6 flex flex-wrap gap-3 justify-end">
          {soundcloudUrl && (
            <a
              href={soundcloudUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border border-ink-600 px-5 py-2.5 text-sm text-gray-300 transition-colors hover:border-royal-500 hover:text-white"
            >
              <ExternalLink size={16} />
              استمع على ساوندكلاود
            </a>
          )}
          <Link
            to={`/portfolio/${id}`}
            className="inline-flex items-center gap-2 rounded-xl border border-ink-600 px-5 py-2.5 text-sm text-gray-300 transition-colors hover:border-royal-500 hover:text-white"
          >
            تفاصيل العمل
            <ArrowLeft size={16} />
          </Link>
          <Link
            to="/portfolio-voice"
            className="inline-flex items-center gap-2 rounded-xl bg-royal-500/15 border border-royal-600/60 px-5 py-2.5 text-sm text-royal-200 transition-colors hover:bg-royal-500/25"
          >
            المزيد من النماذج
            <ArrowLeft size={16} />
          </Link>
        </div>
      </div>

      {audioUrl && <audio ref={audioRef} src={audioUrl} preload="metadata" />}
    </div>
  );
}
