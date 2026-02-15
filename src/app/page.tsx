import { ShaderAnimation } from "@/components/ui/shader-lines";

export default function Home() {
  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden">
      <ShaderAnimation />
      <main className="pointer-events-none z-10 flex flex-col items-center justify-center gap-8 px-8 text-center">
        <h1 className="font-[family-name:var(--font-montserrat)] text-6xl font-bold tracking-tighter text-white md:text-8xl">
          Jiyu Han
        </h1>
        <div className="pointer-events-auto flex gap-4">
          <a
            href="/projects"
            className="rounded-full bg-white px-6 py-3 text-sm font-medium text-black transition-transform hover:scale-105"
          >
            Enter
          </a>
        </div>
      </main>
    </div>
  );
}
