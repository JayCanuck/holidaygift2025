export interface GameEntry {
  name: string;
  code: string;
}

export interface GiftDetails {
  name?: string;
  message?: string;
  games: GameEntry[];
  footerMessage?: string;
}

export interface MysteryGiftData {
  [key: string]: GiftDetails;
}

type PartialGift = {
  name?: unknown;
  message?: unknown;
  games?: unknown;
  footerMessage?: unknown;
};

function isValidGiftDetails(obj: unknown): obj is GiftDetails {
  if (typeof obj !== "object" || obj === null) return false;
  const o = obj as PartialGift;
  if (o.name !== undefined && typeof o.name !== "string") return false;
  if (o.message !== undefined && typeof o.message !== "string") return false;
  if (!Array.isArray(o.games)) return false;
  for (const g of o.games as unknown[]) {
    if (typeof g !== "object" || g === null) return false;
    const ge = g as { name?: unknown; code?: unknown };
    if (typeof ge.name !== "string" || typeof ge.code !== "string") return false;
  }
  if (o.footerMessage !== undefined && typeof o.footerMessage !== "string") return false;
  return true;
}

export function parseMysteryEnv(): MysteryGiftData {
  const raw = process.env.MYSTERY;
  if (!raw || typeof raw !== "string") return {};
  try {
    const parsed = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null) return {};
    const result: MysteryGiftData = {};
    for (const [key, val] of Object.entries(parsed as Record<string, unknown>)) {
      if (isValidGiftDetails(val)) {
        result[key] = val;
      }
    }
    return result;
  } catch {
    console.warn("Failed to parse MYSTERY env as JSON, defaulting to empty map.");
    return {};
  }
}

export const MYSTERY_MAP: MysteryGiftData = parseMysteryEnv();

export function getGiftById(id: string): GiftDetails | undefined {
  return MYSTERY_MAP[id];
}
