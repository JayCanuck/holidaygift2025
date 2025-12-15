"use client";

import { useCallback, useEffect, useRef } from "react";

type DosFactory = (
  el: HTMLElement,
  config?: Record<string, unknown>
) => { run: (...args: string[]) => void; clickToStart: boolean; stop: () => void };
const doomUrl = process.env.NEXT_PUBLIC_DOOM;

export default function DoomEmbed() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const dosRef = useRef<ReturnType<DosFactory> | null>(null);
  useEffect(() => {
    if (!containerRef.current || !doomUrl || dosRef.current) return;
    try {
      const w = window as unknown as {
        Dos: DosFactory;
        emulators: { pathPrefix: string };
      };
      if (!w.Dos || !w.emulators) return;
      w.emulators.pathPrefix = "js-dos/";
      const instance = (dosRef.current = w.Dos(containerRef.current));
      instance.clickToStart = true;
      instance.run(doomUrl);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).dosRef = dosRef.current;
      return () => {
        instance.stop();
      };
    } catch (e) {
      console.error(e);
    }
  }, []);

  const goFullscreen = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    const vendor = el as HTMLElement & {
      webkitRequestFullscreen?: () => Promise<void> | void;
      msRequestFullscreen?: () => Promise<void> | void;
      mozRequestFullScreen?: () => Promise<void> | void;
    };
    if (el.requestFullscreen) {
      void el.requestFullscreen();
    } else if (vendor.webkitRequestFullscreen) {
      vendor.webkitRequestFullscreen();
    } else if (vendor.msRequestFullscreen) {
      vendor.msRequestFullscreen();
    } else if (vendor.mozRequestFullScreen) {
      vendor.mozRequestFullScreen();
    }
  }, []);

  if (!doomUrl) {
    return (
      <div>
        <p style={{ fontSize: "0.9rem", opacity: 0.8 }}>
          Set <code>NEXT_PUBLIC_DOOM</code> to a js-dos bundle URL to enable
          Doom.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div
        ref={containerRef}
        style={{
          width: "100%",
          aspectRatio: "4 / 3",
          background: "#111",
          borderRadius: 8,
          overflow: "hidden",
        }}
      />
      <div style={{ marginTop: 8, textAlign: "right" }}>
        <button
          type="button"
          onClick={goFullscreen}
          aria-label="Enter fullscreen"
          style={{
            fontSize: "0.9rem",
            padding: "6px 10px",
            borderRadius: 6,
            border: "1px solid rgba(0,0,0,0.2)",
            background: "#f2f2f2",
            cursor: "pointer",
          }}
        >
          Fullscreen
        </button>
      </div>
    </div>
  );
}
