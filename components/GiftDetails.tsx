import React from "react";
import type { GiftDetails as GiftDetailsType } from "@/lib/gift";
import { messageToHtml } from "@/lib/utils";
import styles from "./GiftCard.module.css";

interface Props {
  gift: GiftDetailsType | null;
  hasUserData: boolean;
  loading: boolean;
}

export default function GiftDetails({ gift, hasUserData, loading }: Props) {
  const defaultNoUserMessage = "Happy holidays! ☃️";
  const defaultFooterMessage = "Have a great holidays and a happy new year!";

  const games = gift?.games ?? [];

  const computedMessage = gift?.message
    ? gift.message
    : hasUserData
    ? `Here's a small surprise from me to you, a blindbag of ${games.length} mystery Steam games to hopefully bring a bit of fun and cheer your way.`
    : defaultNoUserMessage;

  return (
    <div className={styles.giftContent}>
      {loading && (
        <div className={styles.loading}>Loading...</div>
      )}

      <h2 className={styles.giftName}>{gift?.name || "Hey there"},</h2>

      <div
        className={styles.message}
        dangerouslySetInnerHTML={messageToHtml(computedMessage)}
      />

      {hasUserData && games.length > 0 && (
        <div className={styles.gamesSection}>
          <div className={styles.gamesList}>
            {games.map((g, idx) => (
              <div className={styles.gameRow} key={`game-${idx}`}>
                <input
                  className={styles.gameCode}
                  value={g.code}
                  readOnly
                  aria-label={`Redemption code for ${g.name}`}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {hasUserData && (
        <p className={styles.footer}>
          {gift?.footer ?? defaultFooterMessage}
        </p>
      )}

      <div className={styles.signature}>-Jay</div>
    </div>
  );
}
