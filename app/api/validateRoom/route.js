import { supabase } from "@/lib/supabaseClient";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { roomId } = await req.json();

    if (!roomId) {
      return NextResponse.json({ error: "Room ID is required" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("rooms")
      .select("room_id")
      .eq("room_id", roomId)
      .single();

    if (error && error.code !== "PGRST116") {
      // any error other than not found
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ valid: false }, { status: 200 });
    }

    return NextResponse.json({ valid: true }, { status: 200 });

  } catch (err) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
