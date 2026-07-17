export default function DashboardLoading() {
  return (
    <div className="flex min-h-dvh bg-canvas">
      <div className="hidden w-72 shrink-0 border-e border-line p-5 lg:block">
        <div className="calm-skeleton h-10 w-32 rounded-2xl" />
        <div className="mt-8 flex flex-col gap-3">
          {["w-full", "w-11/12", "w-full", "w-10/12", "w-9/12"].map((w, i) => (
            <div key={i} className={`calm-skeleton h-12 ${w} rounded-2xl`} style={{ animationDelay: `${i * 120}ms` }} />
          ))}
        </div>
      </div>
      <div className="flex-1 px-5 py-6 sm:px-8">
        <div className="flex items-center justify-between">
          <div>
            <div className="calm-skeleton h-3 w-24 rounded-full" />
            <div className="calm-skeleton mt-3 h-6 w-56 rounded-full" />
          </div>
          <div className="calm-skeleton size-11 rounded-full" />
        </div>
        <div className="calm-skeleton mt-8 h-32 rounded-[1.75rem]" />
        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          <div className="calm-skeleton h-72 rounded-[1.75rem] lg:col-span-2" />
          <div className="calm-skeleton h-72 rounded-[1.75rem]" />
        </div>
        <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="calm-skeleton h-28 rounded-3xl" style={{ animationDelay: `${i * 100}ms` }} />
          ))}
        </div>
        <p className="mt-10 text-center text-xs font-medium text-faint">داریم فضای امن تو را آماده می‌کنیم…</p>
      </div>
    </div>
  );
}
