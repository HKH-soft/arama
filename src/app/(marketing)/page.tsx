import dynamic from "next/dynamic";

const HomeClient = dynamic(() => import("./HomeClient"), {
  loading: () => (
    <div className="min-h-screen flex items-center justify-center">
      <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent" />
    </div>
  ),
});

export default function Landing() {
  return <HomeClient />;
}