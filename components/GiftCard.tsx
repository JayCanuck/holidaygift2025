import React, { useCallback, useState } from "react";
import styles from "./GiftCard.module.css";
import GiftDetails from "@/components/GiftDetails";
import type { GiftDetails as GiftDetailsType } from "@/lib/gift";
import DoomEmbed from "./DoomEmbed";

interface Props {
  gift: GiftDetailsType | null;
  hasUserData: boolean;
  loading?: boolean;
}

export default function GiftCard({ gift, hasUserData, loading }: Props) {
  const [open, setOpen] = useState(false);

  const openCard = useCallback(() => setOpen(true), []);
  const onKeyDown = useCallback<React.KeyboardEventHandler<HTMLDivElement>>(
    (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        setOpen(true);
      }
    },
    []
  );

  return (
    <div
      className={`${styles.cardWrap} ${open ? styles.open : ""}`}
      role="button"
      aria-pressed={open}
      aria-label="Holiday greeting card"
      tabIndex={0}
      onClick={openCard}
      onMouseEnter={openCard}
      onKeyDown={onKeyDown}
    >
      <div className={styles.book}>
        <div className={styles.left}>
          <div className={styles.insideLeft} aria-hidden="true" />
          <div className={styles.cover}>
            <div className={styles.coverTitle}>Merry Christmas</div>
          </div>
        </div>
        <div className={styles.right}>
          <div className={styles.rightInner}>
            <GiftDetails gift={gift} hasUserData={hasUserData} loading={!!loading} />
            <div className={styles.doomBlock}>
              {open && <DoomEmbed />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
