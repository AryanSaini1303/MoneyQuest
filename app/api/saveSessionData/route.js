import { supabase } from "@/lib/supabaseClient";

export async function POST(req) {
  try {
    const { teamId, roomId, sessionData } = await req.json();

    if (!teamId || !roomId || !sessionData) {
      return new Response(
        JSON.stringify({ message: "Missing required fields" }),
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("teams")
      .update({
        result: sessionData,
        updated_at: new Date().toISOString(),
      })
      .eq("id", teamId)
      .eq("room_id", roomId);

    if (error) {
      return new Response(
        JSON.stringify({ message: "Error updating session", error }),
        { status: 500 }
      );
    }

    return new Response(
      JSON.stringify({ message: "Session updated", data, success: true }),
      { status: 200 }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ message: "Unexpected server error", err }),
      { status: 500 }
    );
  }
}
