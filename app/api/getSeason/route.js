import { supabase } from "@/lib/supabaseClient";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return new Response(JSON.stringify({ error: "Missing room id" }), {
        status: 400,
      });
    }

    const { data, error } = await supabase
      .from("rooms")
      .select("season")
      .eq("room_id", id);

    if (error) {
      console.error("Supabase select error:", error);
      return new Response(JSON.stringify({ error: "Failed to select" }), {
        status: 500,
      });
    }

    return new Response(JSON.stringify({ success: true, data }), {
      status: 200,
    });
  } catch (err) {
    console.error("API error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
    });
  }
}
