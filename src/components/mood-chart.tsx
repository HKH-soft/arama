export type MoodChartPoint = { label: string; mood: number };

export function MoodChart({ data }: { data: MoodChartPoint[] }) {
  const days = data.map((point) => point.label);
  const values = data.map((point) => point.mood);
  const w = 560;
  const h = 200;
  const padX = 28;
  const padTop = 18;
  const padBottom = 34;
  const innerW = w - padX * 2;
  const innerH = h - padTop - padBottom;
  const step = innerW / (values.length - 1);

  const x = (i: number) => padX + i * step;
  const y = (v: number) => padTop + innerH - (v / 10) * innerH;

  const linePath = values.map((v, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(" ");
  const areaPath = `${linePath} L${x(values.length - 1)},${h - padBottom} L${x(0)},${h - padBottom} Z`;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-extrabold text-ink">نبض خلق هفتهٔ اخیر</h3>
          <p className="mt-1 text-xs font-medium text-faint">بر اساس ۷ چک‌این روزانه</p>
        </div>
        <span className="rounded-full bg-tint-strong px-3.5 py-1.5 text-xs font-bold text-brand-ink">
          +۱۲٪ بهتر از هفتهٔ قبل
        </span>
      </div>

      <svg viewBox={`0 0 ${w} ${h}`} className="mt-6 w-full" role="img" aria-label="نمودار خلق هفت روز گذشته؛ روند بهبودی">
        <defs>
          <linearGradient id="mood-area" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--brand)" stopOpacity="0.28" />
            <stop offset="100%" stopColor="var(--brand)" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* grid */}
        {[0, 5, 10].map((v) => (
          <g key={v}>
            <line
              x1={padX}
              x2={w - padX}
              y1={y(v)}
              y2={y(v)}
              stroke="var(--line)"
              strokeDasharray="4 6"
              strokeWidth="1"
            />
            <text x={padX - 8} y={y(v) + 4} textAnchor="end" fontSize="10" fill="var(--faint)">
              {v === 10 ? "۱۰" : v === 5 ? "۵" : "۰"}
            </text>
          </g>
        ))}

        <path d={areaPath} fill="url(#mood-area)" />
        <path d={linePath} fill="none" stroke="var(--brand-deep)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

        {values.map((v, i) => (
          <g key={days[i]}>
            <circle cx={x(i)} cy={y(v)} r="11" fill="transparent">
              <title>{`${days[i]} — خلق ${v.toLocaleString("fa-IR")} از ۱۰`}</title>
            </circle>
            <circle
              cx={x(i)}
              cy={y(v)}
              r={i === values.length - 1 ? 6 : 4.5}
              fill={i === values.length - 1 ? "var(--clay)" : "var(--card)"}
              stroke="var(--brand-deep)"
              strokeWidth="2.5"
            />
          </g>
        ))}

        {days.map((d, i) => (
          <text
            key={d}
            x={x(i)}
            y={h - 10}
            textAnchor="middle"
            fontSize="11"
            fontWeight={600}
            fill="var(--faint)"
          >
            {d}
          </text>
        ))}
      </svg>
    </div>
  );
}
