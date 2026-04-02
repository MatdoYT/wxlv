import { useCallback, useRef, useState } from "react";
import forestBg from "@/assets/forest-bg.jpg";
import liepnetLogo from "@/assets/liepnet-logo.png";

const Index = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const { clientX, clientY, currentTarget } = e;
    const { width, height } = currentTarget.getBoundingClientRect();
    const x = (clientX / width - 0.5) * 2;
    const y = (clientY / height - 0.5) * 2;
    setOffset({ x, y });
  }, []);

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background"
    >
      {/* Parallax background layer */}
      <div
        className="absolute inset-[-40px] transition-transform duration-300 ease-out"
        style={{
          transform: `translate(${offset.x * -20}px, ${offset.y * -20}px) scale(1.05)`,
        }}
      >
        <img
          src={forestBg}
          alt=""
          width={1920}
          height={1080}
          className="h-full w-full object-cover blur-sm brightness-[0.35]"
        />
      </div>

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-background/40" />

      {/* Content layer — moves opposite to background for parallax depth */}
      <div
        className="relative z-10 flex flex-col items-center gap-4 px-6 text-center transition-transform duration-300 ease-out"
        style={{
          transform: `translate(${offset.x * 8}px, ${offset.y * 8}px)`,
        }}
      >
        <h1 className="text-5xl font-bold tracking-[0.3em] text-foreground sm:text-7xl md:text-8xl">
          COMING 2026
        </h1>
        <p className="text-lg tracking-[0.15em] text-muted-foreground sm:text-xl">
          Latvia's Open Meteorological Network
        </p>
      </div>

      {/* Footer */}
      <div className="absolute bottom-8 z-10 flex items-center gap-2 text-sm text-muted-foreground">
        <span>WXLV is a project created by the</span>
        <img
          src={liepnetLogo}
          alt="LIEPNET"
          className="inline-block h-5 brightness-90"
        />
        <span>project.</span>
      </div>
    </div>
  );
};

export default Index;
