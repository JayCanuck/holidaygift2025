"use client";

import { useCallback, useEffect, useRef } from "react";

type DosFactory = (
  el: HTMLElement,
  config?: Record<string, unknown>
) => {
  run: (...args: string[]) => Promise<void>;
  clickToStart: boolean;
  stop: () => Promise<void>;
  layers: {
    clickToStart: HTMLDivElement;
  };
  volume: number;
  setVolume: (volume: number) => Promise<void>;
};
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
      const root = containerRef.current;
      const instance = (dosRef.current = w.Dos(root, {
        volume: 0
      }));

      (window as any).dosInstance = instance;
      instance.clickToStart = true;

      let clickToStartLayer: HTMLDivElement;
      let onClick: (e: MouseEvent) => Promise<void>;
      instance.run(doomUrl).then(() => {
        clickToStartLayer = instance.layers.clickToStart;
        onClick = async (e: MouseEvent) => {
          await instance.setVolume(1);
          root.removeEventListener("click", onClick);
        };
        instance.layers.clickToStart.addEventListener("click", onClick);
      })

      return () => {
        if (clickToStartLayer && onClick) {
          clickToStartLayer.removeEventListener("click", onClick);
        }
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
        className="doom-emulator"
        style={{
          width: "100%",
          aspectRatio: "4 / 3",
          background: "#111",
          borderRadius: 2,
          overflow: "hidden",
        }}
      />
      <div style={{ marginTop: 4, display: "flex", justifyContent: "flex-end" }}>
        <button
          type="button"
          onClick={goFullscreen}
          aria-label="Enter fullscreen"
          style={{
            background: "transparent",
            border: "0",
            padding: 4,
            lineHeight: 0,
            cursor: "pointer",
            opacity: 0.8,
          }}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M9 3H5a2 2 0 0 0-2 2v4m18 0V5a2 2 0 0 0-2-2h-4m0 18h4a2 2 0 0 0 2-2v-4M3 15v4a2 2 0 0 0 2 2h4"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
