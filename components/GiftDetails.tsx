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
  const defaultFooterMessage = "Hope you have a great holidays and a happy new year!";

  const games = gift?.games ?? [];

  const computedMessage = gift?.message
    ? gift.message
    : hasUserData
    ? `Here's a little surprise to add some fun to your day, ${games.length} random mystery Steam games! Redeem them and see what adventures await.`
    : defaultNoUserMessage;

  return (
    <div className={styles.giftContent}>
      {loading && (
        <div className={styles.loading}>Loading...</div>
      )}

      {gift?.name && (
        <h2 className={styles.giftName}>To {gift.name}</h2>
      )}

      <div
        className={styles.message}
        dangerouslySetInnerHTML={messageToHtml(computedMessage)}
      />

      {hasUserData && games.length > 0 && (
        <div className={styles.gamesSection}>
          <h3 className={styles.sectionTitle}>Games</h3>
          <div className={styles.gamesList}>
            {games.map((g, idx) => (
              <div className={styles.gameRow} key={`${g.name}-${idx}`}>
                <span className={styles.gameName}>{g.name}</span>
                <input
                  className={styles.gameCode}
                  value={g.code}
                  readOnly
                  aria-label={`Redemption code for ${g.name}`}
                  onFocus={(e) => e.currentTarget.select()}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {hasUserData && (
        <p className={styles.footer}>
          {gift?.footerMessage ?? defaultFooterMessage}
        </p>
      )}

      <div className={styles.signature}>-Jay</div>
    </div>
  );
}
