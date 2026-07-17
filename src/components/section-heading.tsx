import { Reveal } from "./reveal";

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "center",
}: {
  eyebrow: string;
  title: string;
  description?: string;
  align?: "center" | "start";
}) {
  const centered = align === "center";
  return (
    <div className={`${centered ? "mx-auto text-center" : "text-start"} max-w-2xl`}>
      <Reveal>
        <span
          className={`inline-flex items-center gap-2 rounded-full bg-sand-soft px-4 py-1.5 text-xs font-bold tracking-wide text-clay ${
            centered ? "" : ""
          }`}
        >
          <span className="size-1.5 rounded-full bg-clay/70" aria-hidden />
          {eyebrow}
        </span>
      </Reveal>
      <Reveal delay={100}>
        <h2 className="mt-5 text-3xl leading-snug font-extrabold tracking-tight text-ink sm:text-4xl sm:leading-[1.5]">
          {title}
        </h2>
      </Reveal>
      {description && (
        <Reveal delay={200}>
          <p className="mt-4 text-base leading-8 text-soft">{description}</p>
        </Reveal>
      )}
    </div>
  );
}
