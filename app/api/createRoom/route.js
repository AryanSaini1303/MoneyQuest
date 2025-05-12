import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function POST(request) {
  try {
    // const { roomId, season } = await request.json();
    const { roomId } = await request.json();

    // if (!roomId || !season) {
    if (!roomId) {
      return NextResponse.json(
        { error: "Room ID is required" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("rooms")
      // .insert([{ room_id: roomId, season: season }]);
      .insert([{ room_id: roomId }]);

    if (error) {
      console.error("Supabase insert error:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(
      { message: "Room created", data },
      { status: 200 }
    );
  } catch (err) {
    console.error("API error:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
