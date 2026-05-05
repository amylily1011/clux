import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { db as supabase } from "@/lib/supabase";
import { EvaluationResultSchema } from "@/lib/schema";

function generateId(): string {
  return randomBytes(5).toString("base64url").slice(0, 7);
}

export async function POST(req: NextRequest) {
  let body: unknown;
  try { body = await req.json(); }
  catch { return NextResponse.json({ error: "Invalid body." }, { status: 400 }); }

  const parsed = EvaluationResultSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid result shape." }, { status: 400 });
  }

  const id = generateId();
  const { error } = await supabase.from("shares").insert({ id, data: parsed.data });

  if (error) {
    console.error("Supabase insert error:", error);
    return NextResponse.json({ error: "Failed to save share." }, { status: 500 });
  }

  return NextResponse.json({ id });
}
