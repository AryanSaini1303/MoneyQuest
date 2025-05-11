import { supabase } from "@/lib/supabaseClient";

export const POST = async (req) => {
  try {
    const body = await req.json();
    const { id, members } = body;
    // console.log(email, members);
    if (!id || !Array.isArray(members)) {
      return new Response(JSON.stringify({ message: "Invalid payload" }), {
        status: 400,
      });
    }

    const { data, error } = await supabase
      .from("teams")
      .update({ team_members: members })
      .eq("id", id)
      .select();

    if (error) {
      return new Response(JSON.stringify({ message: "Update failed", error }), {
        status: 500,
      });
    }

    return new Response(
      JSON.stringify({ message: "Team updated", data, success: true }),
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
