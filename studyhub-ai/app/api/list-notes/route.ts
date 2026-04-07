import { NextResponse } from "next/server";
import { getSupabase, NOTES_BUCKET } from "@/lib/supabase";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase.storage.from(NOTES_BUCKET).list("", {
      limit: 50,
      sortBy: { column: "created_at", order: "desc" },
    });

    if (error) throw new Error(error.message);

    const files = (data ?? []).map((f) => {
      const { data: urlData } = supabase.storage.from(NOTES_BUCKET).getPublicUrl(f.name);
      return {
        name: f.name.replace(/^\d+_/, ""),
        path: f.name,
        url: urlData.publicUrl,
        size: f.metadata?.size ?? 0,
        createdAt: f.created_at,
      };
    });

    return NextResponse.json({ files });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
