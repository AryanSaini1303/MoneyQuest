import { supabase } from "@/lib/supabaseClient";

export const POST = async (req) => {
  try {
    const body = await req.json();
    const { id, result } = body;
    if (!id || !Array.isArray(result)) {
      return new Response(JSON.stringify({ message: "Invalid payload" }), {
        status: 400,
      });
    }

    const { data, error } = await supabase
      .from("teams")
      .update({ result: result })
      .eq("id", id);

    if (error) {
      return new Response(JSON.stringify({ message: "Update failed", error }), {
        status: 500,
      });
    }

    return new Response(
      JSON.stringify({ message: "Results updated", success: true }),
      {
        status: 200,
      }
    );
  } catch (err) {
    return new Response(JSON.stringify({ message: "Server error", err }), {
      status: 500,
    });
  }
};
