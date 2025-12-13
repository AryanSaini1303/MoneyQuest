"use client";

import { useEffect } from "react";

export default function teamFormation({ params }) {
  let team_id;
  useEffect(() => {
    const fetchParams = async () => {
      const { teamId } = await params;
      team_id = teamId;
      console.log(parseInt(atob(team_id)));
    };
    fetchParams();
  }, []);
  return <h1>Team Formation Page</h1>;
}
