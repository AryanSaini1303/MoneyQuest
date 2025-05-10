import { supabase } from "@/lib/supabaseClient";

export async function POST(req) {
  try {
    const body = await req.json();
    const { name, avatar, email } = body;

    if (!name || !avatar || !email) {
      return new Response(JSON.stringify({ error: "Missing fields" }), {
        status: 400,
      });
    }

    const { data, error } = await supabase
      .from("teams")
      .insert([{ name, avatar, email }]).select("id");

    if (error) {
      console.error("Supabase insert error:", error);
      return new Response(JSON.stringify({ error: "Failed to insert", message:error.message }), {
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
