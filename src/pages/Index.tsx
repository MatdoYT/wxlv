import { useCallback, useEffect, useRef, useState } from "react";
import forestBg from "@/assets/forest-bg.jpg";
import liepnetLogo from "@/assets/liepnet-logo.png";

const Index = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setEntered(true), 100);
    return () => clearTimeout(t);
  }, []);

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
        className="absolute inset-[-20px] transition-transform duration-500 ease-out"
        style={{
          transform: `translate(${offset.x * -10}px, ${offset.y * -10}px) scale(1.03)`,
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

      {/* Content layer */}
      <div
        className="relative z-10 flex flex-col items-center gap-3 px-6 text-center transition-transform duration-500 ease-out"
        style={{
          transform: `translate(${offset.x * 4}px, ${offset.y * 4}px)`,
        }}
      >
        <h1
          className="cursor-default font-bold tracking-[0.05em] text-foreground transition-all duration-[1.6s] ease-out hover:scale-[1.03] text-5xl sm:text-7xl md:text-[7rem] lg:text-[8.5rem]"
          style={{
            background: "linear-gradient(to bottom, hsl(0 0% 100%), hsl(0 0% 65%))",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            opacity: entered ? 1 : 0,
            transform: entered ? "scale(1)" : "scale(0.85)",
          }}
        >
          COMING 2026
        </h1>
        <p
          className="cursor-default text-lg tracking-[0.04em] text-secondary-foreground transition-all duration-[1.8s] ease-out hover:scale-[1.04] sm:text-xl"
          style={{
            opacity: entered ? 1 : 0,
            transform: entered ? "scale(1)" : "scale(0.85)",
            transitionDelay: "0.15s",
          }}
        >
          Latvia's Open Meteorological Network
        </p>
      </div>

      {/* Footer */}
      <div className="absolute bottom-8 z-10 flex items-center gap-2 text-sm text-white/30">
        <span>WXLV is a project created by</span>
        <a href="https://liepnet.eu" target="_blank" rel="noopener noreferrer" className="inline-block transition-opacity duration-200 hover:opacity-80">
          <img
            src={liepnetLogo}
            alt="LIEPNET"
            className="inline-block h-5 opacity-30"
          />
        </a>
      </div>
    </div>
  );
};

export default Index;

