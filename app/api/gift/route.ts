import { NextResponse } from "next/server";
import { getGiftById } from "@/lib/gift";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 404 });
    }
    const gift = getGiftById(id);
    if (!gift) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json(gift, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
