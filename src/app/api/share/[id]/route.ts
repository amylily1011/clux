import { NextRequest, NextResponse } from "next/server";
import { db as supabase } from "@/lib/supabase";
import { EvaluationResultSchema } from "@/lib/schema";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const { data, error } = await supabase
    .from("shares")
    .select("data")
    .eq("id", id)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Share not found." }, { status: 404 });
  }

  const parsed = EvaluationResultSchema.safeParse(data.data);
  if (!parsed.success) {
    return NextResponse.json({ error: "Corrupted share data." }, { status: 500 });
  }

  return NextResponse.json(parsed.data);
}
