"use client";

import axios from "axios";
import type { AxiosProgressEvent } from "axios";
import { useQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

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
const doomKnownTotalBytes = 5539297;

function formatBytes(bytes: number) {
  if (!Number.isFinite(bytes)) return "0 B";
  const units = ["B", "KB", "MB", "GB"] as const;
  let value = bytes;
  let unit: (typeof units)[number] = units[0];
  for (let i = 0; i < units.length - 1 && value >= 1024; i++) {
    value /= 1024;
    unit = units[i + 1];
  }
  return `${value.toFixed(value >= 10 || unit === "B" ? 0 : 1)} ${unit}`;
}

export default function DoomEmbed() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const dosRef = useRef<ReturnType<DosFactory> | null>(null);
  const objectUrlRef = useRef<string | null>(null);
  const mountedRef = useRef(false);
  const [downloadedBytes, setDownloadedBytes] = useState(0);
  const [totalBytes, setTotalBytes] = useState<number | null>(null);
  const [phase, setPhase] = useState<"downloading" | "starting" | "ready" | "error">(
    "downloading"
  );

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const doomBundleQuery = useQuery({
    queryKey: ["doomBundle", doomUrl],
    enabled: !!doomUrl,
    queryFn: async () => {
      const url = doomUrl as string;
      const res = await axios.get<Blob>(url, {
        responseType: "blob",
        onDownloadProgress: (e: AxiosProgressEvent) => {
          if (!mountedRef.current) return;
          if (typeof e.loaded === "number") setDownloadedBytes(e.loaded);
          if (typeof e.total === "number" && e.total > 0) setTotalBytes(e.total);
        },
      });
      return res.data;
    },
    staleTime: Infinity,
    gcTime: Infinity,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    retry: 1,
  });

  const downloadLabel = useMemo(() => {
    const loaded = formatBytes(downloadedBytes);
    const total = formatBytes(totalBytes ?? doomKnownTotalBytes);
    return `${loaded} / ${total}`;
  }, [downloadedBytes, totalBytes]);

  useEffect(() => {
    if (!containerRef.current || !doomUrl || dosRef.current) return;
    if (!doomBundleQuery.data) return;
    try {
      const w = window as unknown as {
        Dos?: DosFactory;
        emulators?: { pathPrefix: string };
      };
      if (!w.Dos || !w.emulators) return;

      setPhase("starting");

      w.emulators.pathPrefix = "/js-dos/";
      const root = containerRef.current;
      const instance = (dosRef.current = w.Dos(root, {
        volume: 0,
      }));

      (window as any).dosInstance = instance;
      instance.clickToStart = true;

      const objectUrl = URL.createObjectURL(doomBundleQuery.data);
      objectUrlRef.current = objectUrl;

      let clickToStartLayer: HTMLDivElement;
      let onClick: (e: MouseEvent) => Promise<void>;
      instance.setVolume(0).then(() =>
        instance
        .run(objectUrl)
        .then(async () => {
          if (mountedRef.current) setPhase("ready");
          clickToStartLayer = instance.layers.clickToStart;
          onClick = async () => {
            await instance.setVolume(1);
            clickToStartLayer.removeEventListener("click", onClick);
          };
          instance.layers.clickToStart.addEventListener("click", onClick);
        })
        .catch(() => {
          if (mountedRef.current) setPhase("error");
        })
      );
      

      return () => {
        if (clickToStartLayer && onClick) {
          clickToStartLayer.removeEventListener("click", onClick);
        }
        void instance.stop();
        dosRef.current = null;
        if (objectUrlRef.current) {
          URL.revokeObjectURL(objectUrlRef.current);
          objectUrlRef.current = null;
        }
      };
    } catch (e) {
      console.error(e);
      setPhase("error");
    }
  }, [doomBundleQuery.data]);

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

  const showOverlay =
    doomBundleQuery.isLoading || phase === "downloading" || phase === "starting" || phase === "error";
  const showSpinner = doomBundleQuery.isLoading || phase === "downloading";
  const isError = doomBundleQuery.isError || phase === "error";
  const isStarting = phase === "starting";
  const fullscreenReady = phase === "ready";

  return (
    <div>
      <div
        style={{
          position: "relative",
          width: "100%",
          aspectRatio: "4 / 3",
          background: "#111",
          borderRadius: 2,
          overflow: "hidden",
        }}
      >
        <div
          ref={containerRef}
          className="doom-emulator"
          style={{
            position: "absolute",
            inset: 0,
            opacity: phase === "ready" ? 1 : 0,
            transition: "opacity 200ms ease",
          }}
        />

        {showOverlay && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              background: "rgba(0, 0, 0, 0.35)",
              color: "rgba(255,255,255,0.9)",
              textAlign: "center",
              padding: 12,
            }}
          >
            {showSpinner && (
              <div
                aria-label="Downloading"
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  border: "3px solid rgba(255,255,255,0.25)",
                  borderTopColor: "rgba(255,255,255,0.95)",
                  animation: "doom-spin 0.9s linear infinite",
                }}
              />
            )}
            <div style={{ fontSize: isStarting || isError ? "0.9rem" : "0.75rem", opacity: 0.9 }}>
              {isError
                ? "Couldn’t load Doom. Check the console."
                : isStarting
                ? "Starting emulator…"
                : downloadLabel}
            </div>
          </div>
        )}
      </div>
      <div style={{ marginTop: 4, display: "flex", justifyContent: "flex-end" }}>
        <button
          type="button"
          onClick={goFullscreen}
          aria-label="Enter fullscreen"
          aria-hidden={!fullscreenReady}
          tabIndex={fullscreenReady ? 0 : -1}
          disabled={!fullscreenReady}
          style={{
            background: "transparent",
            border: "0",
            padding: 4,
            lineHeight: 0,
            cursor: fullscreenReady ? "pointer" : "default",
            opacity: fullscreenReady ? 0.8 : 0,
            pointerEvents: fullscreenReady ? "auto" : "none",
            transition: "opacity 200ms ease",
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
      <style jsx>{`
        @keyframes doom-spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}
