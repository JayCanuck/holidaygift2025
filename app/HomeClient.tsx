"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import GiftCard from "@/components/GiftCard";
import type { GiftDetails as GiftDetailsType } from "@/lib/gift";

export default function HomeClient() {
  const searchParams = useSearchParams();
  const id = useMemo(() => searchParams.get("id"), [searchParams]);
  const [gift, setGift] = useState<GiftDetailsType | null>(null);
  const [hasUserData, setHasUserData] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Disable jsdos tips UI before it loads
    localStorage.setItem("emulators.ui.ui.tipsV2", "false");
  }, []);

  useEffect(() => {
    let aborted = false;
    async function load() {
      if (!id) {
        setGift(null);
        setHasUserData(false);
        return;
      }
      setLoading(true);
      try {
        const res = await fetch(`/api/gift?id=${encodeURIComponent(id)}`);
        if (!aborted) {
          if (res.ok) {
            const data: GiftDetailsType = await res.json();
            setGift(data);
            setHasUserData(true);
          } else {
            setGift(null);
            setHasUserData(false);
          }
        }
      } catch {
        if (!aborted) {
          setGift(null);
          setHasUserData(false);
        }
      } finally {
        if (!aborted) setLoading(false);
      }
    }
    load();
    return () => {
      aborted = true;
    };
  }, [id]);

  return (
    <div className="app-root">
      <div className="bg-overlay" />
      <main className="main-stage">
        <GiftCard gift={gift} hasUserData={hasUserData} loading={loading} />
      </main>
    </div>
  );
}
