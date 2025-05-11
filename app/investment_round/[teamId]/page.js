"use client";

import { useState, useEffect } from "react";

export default function ({ params }) {
  const [teamId, setTeamId] = useState("");

  useEffect(() => {
    const fetchParams = async () => {
      const { teamId } = await params;
      setTeamId(teamId);
      console.log(teamId);
    };
    fetchParams();
  }, []);
  return (
    <>
      <h1>Investment Round</h1>
      <p>hold your horses and think before investing team {teamId}</p>
    </>
  );
}
