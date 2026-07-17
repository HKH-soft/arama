import Link from "next/link";

/** آراما mark — a soft breathing leaf folded into a calm circle. */
export function AramaMark({ className = "size-10" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} role="img" aria-label="نشان آراما">
      <defs>
        <linearGradient id="arama-g" x1="6" y1="4" x2="42" y2="44" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#3ac793" />
          <stop offset="0.55" stopColor="#0f9b6a" />
          <stop offset="1" stopColor="#0b7a53" />
        </linearGradient>
      </defs>
      {/* organic vessel — softened pebble, not a medical shape */}
      <path
        d="M24 2.5c8.2-.9 17.7 4.6 20.5 13.6 2.4 7.8-.2 17.9-6.5 23.1-6.9 5.7-18.5 7-25.4 1.6C6 35.6 2.3 25.8 5 17.4 7.6 9.3 15.4 3.4 24 2.5Z"
        fill="url(#arama-g)"
      />
      {/* exhale wave */}
      <path
        d="M11 27.5c4.4-6.8 8.2-6.8 12.6 0s8.2 6.8 12.6 0"
        fill="none"
        stroke="#fff"
        strokeWidth="2.6"
        strokeLinecap="round"
        opacity="0.92"
      />
      {/* resting leaf */}
      <path
        d="M16.5 20.2c.8-5.6 5.4-8.6 10.6-8.9 4.9-.2 8 2.3 8.4 6.1-3.4-.6-6.6.5-9.2 3-2.5 2.4-4.4 2.9-9.8-.2Z"
        fill="#fff"
        opacity="0.95"
      />
      {/* warm sand breath dot */}
      <circle cx="36.5" cy="11" r="3.1" fill="#e6d4b5" />
    </svg>
  );
}

export function Logo({
  withWordmark = true,
  size = "md",
  className = "",
}: {
  withWordmark?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const mark = size === "lg" ? "size-12" : size === "sm" ? "size-8" : "size-10";
  return (
    <Link
      href="/"
      className={`group inline-flex items-center gap-2.5 rounded-2xl ${className}`}
      aria-label="آراما — بازگشت به خانه"
    >
      <span className="transition-transform duration-500 ease-out group-hover:scale-105 group-hover:-rotate-3">
        <AramaMark className={mark} />
      </span>
      {withWordmark && (
        <span className="flex flex-col leading-none">
          <span
            className={`font-extrabold tracking-tight text-ink ${
              size === "lg" ? "text-2xl" : size === "sm" ? "text-lg" : "text-xl"
            }`}
          >
            آراما
          </span>
          <span className="mt-1 text-[10px] font-medium tracking-wide text-faint">
            سلامت روان، با همدلی
          </span>
        </span>
      )}
    </Link>
  );
}
