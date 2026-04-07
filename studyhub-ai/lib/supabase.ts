import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://placeholder.supabase.co";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "placeholder_key";

let memoizedSupabase: ReturnType<typeof createClient> | null = null;
export const getSupabase = () => {
    if(!memoizedSupabase) {
        memoizedSupabase = createClient(supabaseUrl, supabaseKey);
    }
    return memoizedSupabase;
}

export const NOTES_BUCKET = "notes";
