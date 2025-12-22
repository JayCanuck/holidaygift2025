import React, { useCallback, useState } from "react";
import styles from "./GiftCard.module.css";
import GiftDetails from "@/components/GiftDetails";
import type { GiftDetails as GiftDetailsType } from "@/lib/gift";
import DoomEmbed from "./DoomEmbed";

interface Props {
  gift: GiftDetailsType | null;
  hasUserData: boolean;
  loading?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export default function GiftCard({ gift, hasUserData, loading, onOpenChange }: Props) {
  const [open, setOpen] = useState(false);

  const openCard = useCallback(() => {
    if (open) return;
    setOpen(true);
    onOpenChange?.(true);
  }, [open, onOpenChange]);
  const onKeyDown = useCallback<React.KeyboardEventHandler<HTMLDivElement>>(
    (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        if (open) return;
        setOpen(true);
        onOpenChange?.(true);
      }
    },
    [open, onOpenChange]
  );

  return (
    <div
      className={`${styles.card} ${open ? styles.open : ""}`}
      role="button"
      aria-pressed={open}
      aria-label="Holiday greeting card"
      tabIndex={0}
      onClick={openCard}
      onKeyDown={onKeyDown}
    >
      <div className={styles.inside}>
        <div className={styles.messageContent}>
          <GiftDetails gift={gift} hasUserData={hasUserData} loading={!!loading} />
        </div>
      </div>

      <div className={styles.cover}>
        <div className={styles.coverFront}>
          <div className={styles.openHint}>Click / tap to open</div>
        </div>
        <div className={styles.coverBack}>
          <div className={styles.coverBackContent}>
            {open && (
              <>
                <div className={styles.doomCaption}>
                  Because it's everywhere… why not add Doom to a greeting card?
                </div>
                <DoomEmbed />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
