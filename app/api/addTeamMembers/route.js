import { supabase } from "@/lib/supabaseClient";

export const POST = async (req) => {
  try {
    const body = await req.json();
    const { email, members } = body;
    // console.log(email, members);
    if (!email || !Array.isArray(members)) {
      return new Response(JSON.stringify({ message: "Invalid payload" }), {
        status: 400,
      });
    }

    const { data, error } = await supabase
      .from("teams")
      .update({ team_members: members })
      .eq("email", email)
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
