/**
 * أغلفة مجالات الأعمال: رسوم فيكتور ثابتة بهوية الموقع (عنابي + ذهبي)،
 * فلا حاجة لاختيار صورة لكل غلاف، وتبقى البطاقات الأربع متناسقة دائماً.
 * حركة خفيفة جداً بـCSS، تتوقف مع «تقليل الحركة».
 */
type Kind = "voice" | "motion" | "design" | "photography";

const GOLD = "url(#g-gold)";

function Defs({ id }: { id: string }) {
  return (
    <defs>
      <linearGradient id="g-gold" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#f4c98c" />
        <stop offset="1" stopColor="#cf8129" />
      </linearGradient>
      <radialGradient id={`bg-${id}`} cx="50%" cy="45%" r="70%">
        <stop offset="0" stopColor="#7a2a31" stopOpacity=".75" />
        <stop offset=".65" stopColor="#2a0d10" stopOpacity=".6" />
        <stop offset="1" stopColor="#0e0506" stopOpacity="0" />
      </radialGradient>
      <pattern id={`dots-${id}`} width="14" height="14" patternUnits="userSpaceOnUse">
        <circle cx="2" cy="2" r="1" fill="#eea851" opacity=".12" />
      </pattern>
    </defs>
  );
}

function Voice() {
  const bars = [10, 18, 13, 26, 20, 32, 24, 14, 0, 0, 0, 14, 24, 32, 20, 26, 13, 18, 10];
  return (
    <>
      {bars.map((h, i) =>
        h ? (
          <rect key={i} className="ca-bar" style={{ animationDelay: `${(i % 7) * 0.12}s` }}
            x={36 + i * 7} y={75 - h} width="3.5" height={h * 2} rx="1.75" fill={GOLD} opacity={0.35 + h / 50} />
        ) : null,
      )}
      <circle cx="100" cy="75" r="30" fill="none" stroke="#eea851" strokeOpacity=".25" className="ca-ring" />
      <circle cx="100" cy="75" r="22" fill={GOLD} />
      <rect x="94" y="60" width="12" height="20" rx="6" fill="#2a0d10" />
      <path d="M88 74a12 12 0 0 0 24 0M100 86v6M94 92h12" fill="none" stroke="#2a0d10" strokeWidth="2.5" strokeLinecap="round" />
    </>
  );
}

function Motion() {
  return (
    <>
      {/* خطوط الحركة */}
      {[0, 1, 2].map((i) => (
        <path key={i} className="ca-trail" style={{ animationDelay: `${i * 0.25}s` }}
          d={`M${30 + i * 6} ${58 + i * 17}h${42 - i * 10}`} stroke="#eea851" strokeOpacity={0.55 - i * 0.12} strokeWidth="3" strokeLinecap="round" />
      ))}
      {/* منحنى توقيت (easing) */}
      <path d="M40 118 C 80 118, 95 38, 165 34" fill="none" stroke="#eea851" strokeOpacity=".3" strokeWidth="1.5" strokeDasharray="3 4" />
      <circle cx="40" cy="118" r="3" fill="#eea851" opacity=".5" />
      <circle cx="165" cy="34" r="3" fill="#eea851" opacity=".5" />
      {/* زر التشغيل داخل إطار */}
      <g className="ca-float">
        <rect x="78" y="46" width="64" height="58" rx="12" fill="#2a0d10" stroke={GOLD} strokeWidth="2.5" />
        <path d="M102 61v28l24-14z" fill={GOLD} />
      </g>
    </>
  );
}

function Design() {
  return (
    <>
      {/* أشكال متراكبة */}
      <rect x="44" y="40" width="46" height="46" rx="8" fill="#7a2a31" opacity=".9" transform="rotate(-10 67 63)" />
      <circle cx="132" cy="96" r="24" fill="none" stroke="#eea851" strokeOpacity=".45" strokeWidth="2" />
      <path d="M118 36l20 34h-40z" fill="#eea851" opacity=".18" />
      {/* منحنى بيزييه بنقاط التحكم */}
      <path d="M46 112 C 70 58, 122 132, 158 58" fill="none" stroke={GOLD} strokeWidth="3" strokeLinecap="round" />
      <path d="M46 112 L70 58 M158 58 L122 132" stroke="#eea851" strokeOpacity=".35" strokeWidth="1" />
      {[[70, 58], [122, 132]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="3.5" fill="#0e0506" stroke="#eea851" strokeWidth="1.5" />)}
      {[[46, 112], [158, 58]].map(([x, y], i) => <rect key={i} x={x - 4} y={y - 4} width="8" height="8" fill="#eea851" />)}
      {/* رأس القلم */}
      <g className="ca-float" transform="translate(96 74) rotate(35)">
        <path d="M0 -20 L9 6 L0 16 L-9 6 Z" fill={GOLD} />
        <circle cx="0" cy="2" r="2.5" fill="#2a0d10" />
        <path d="M0 4 V16" stroke="#2a0d10" strokeWidth="1.2" />
      </g>
    </>
  );
}

function Photography() {
  const blades = Array.from({ length: 6 }, (_, i) => i * 60);
  return (
    <>
      {/* إطار التصويب */}
      {[[40, 30, 1, 1], [160, 30, -1, 1], [40, 120, 1, -1], [160, 120, -1, -1]].map(([x, y, sx, sy], i) => (
        <path key={i} d={`M${x} ${y + 14 * sy}V${y}H${x + 14 * sx}`} fill="none" stroke="#eea851" strokeOpacity=".5" strokeWidth="2" />
      ))}
      {/* العدسة وشفرات الفتحة */}
      <circle cx="100" cy="75" r="36" fill="#2a0d10" stroke={GOLD} strokeWidth="3" />
      <g className="ca-spin" style={{ transformOrigin: "100px 75px" }}>
        {blades.map((a) => (
          <path key={a} d="M100 75 L100 47 A28 28 0 0 1 124.2 61 Z" fill="#7a2a31" stroke="#eea851" strokeOpacity=".5" strokeWidth="1"
            transform={`rotate(${a} 100 75)`} />
        ))}
      </g>
      <circle cx="100" cy="75" r="9" fill="#0e0506" stroke="#eea851" strokeWidth="1.5" />
      <circle cx="96" cy="71" r="2.5" fill="#f4c98c" opacity=".8" />
      <circle cx="150" cy="48" r="4" fill="#eea851" className="ca-blink" />
    </>
  );
}

const ART: Record<Kind, () => JSX.Element> = { voice: Voice, motion: Motion, design: Design, photography: Photography };

export function CategoryArt({ kind, className = "" }: { kind: Kind; className?: string }) {
  const Art = ART[kind];
  return (
    <svg viewBox="0 0 200 150" preserveAspectRatio="xMidYMid slice" className={`h-full w-full ${className}`} aria-hidden>
      <style>{`
        .ca-bar{transform-box:fill-box;transform-origin:center;animation:ca-eq 1.6s ease-in-out infinite}
        .ca-ring{transform-box:fill-box;transform-origin:center;animation:ca-pulse 2.4s ease-out infinite}
        .ca-trail{animation:ca-trail 2s ease-in-out infinite}
        .ca-float{animation:ca-float 3.2s ease-in-out infinite}
        .ca-spin{animation:ca-spin 14s linear infinite}
        .ca-blink{animation:ca-blink 2.6s ease-in-out infinite}
        @keyframes ca-eq{0%,100%{transform:scaleY(.55)}50%{transform:scaleY(1)}}
        @keyframes ca-pulse{0%{transform:scale(.8);opacity:.7}100%{transform:scale(1.5);opacity:0}}
        @keyframes ca-trail{0%,100%{opacity:.25;transform:translateX(4px)}50%{opacity:1;transform:translateX(-4px)}}
        @keyframes ca-float{0%,100%{translate:0 0}50%{translate:0 -4px}}
        @keyframes ca-spin{to{transform:rotate(360deg)}}
        @keyframes ca-blink{0%,100%{opacity:.25}50%{opacity:1}}
        @media (prefers-reduced-motion:reduce){.ca-bar,.ca-ring,.ca-trail,.ca-float,.ca-spin,.ca-blink{animation:none}}
      `}</style>
      <Defs id={kind} />
      <rect width="200" height="150" fill={`url(#bg-${kind})`} />
      <rect width="200" height="150" fill={`url(#dots-${kind})`} />
      <Art />
    </svg>
  );
}
