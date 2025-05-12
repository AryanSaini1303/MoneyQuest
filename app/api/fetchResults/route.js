import { supabase } from "@/lib/supabaseClient";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const roomId = searchParams.get("roomId");

    if (!roomId) {
      return new Response(JSON.stringify({ error: "Missing room_id" }), {
        status: 400,
      });
    }

    const { data, error } = await supabase
      .from("teams")
      .select("name, avatar, result")
      .eq("room_id", roomId);

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
