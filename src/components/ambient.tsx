/** Soft organic blobs — breath, calm water, growth. Never hard SaaS geometry. */
export function Ambient({ variant = "default" }: { variant?: "default" | "warm" | "deep" }) {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <div
        className="blob animate-blob-a -top-40 -start-40 size-[34rem] opacity-60"
        style={{
          background:
            variant === "warm"
              ? "radial-gradient(circle at 30% 30%, color-mix(in srgb, var(--sand) 70%, transparent), transparent 70%)"
              : "radial-gradient(circle at 30% 30%, color-mix(in srgb, var(--brand-glow) 34%, transparent), transparent 70%)",
        }}
      />
      <div
        className="blob animate-blob-b top-1/3 -end-48 size-[38rem] opacity-55"
        style={{
          background:
            variant === "deep"
              ? "radial-gradient(circle at 60% 40%, color-mix(in srgb, var(--brand) 26%, transparent), transparent 70%)"
              : "radial-gradient(circle at 60% 40%, color-mix(in srgb, var(--tint-strong) 80%, transparent), transparent 70%)",
        }}
      />
      <div
        className="blob animate-blob-c -bottom-56 start-1/4 size-[30rem] opacity-45"
        style={{
          background: "radial-gradient(circle at 50% 50%, color-mix(in srgb, var(--sand) 55%, transparent), transparent 70%)",
        }}
      />
    </div>
  );
}
