"use client";

import { useState, useEffect } from "react";

export default function () {
  const [teamId, setTeamId] = useState("");

  useEffect(() => {
    setTeamId(sessionStorage.getItem("teamId"));
  }, []);

  return (
    <>
      <h1>Investment Round</h1>
      <p>hold your horses and think before investing team {teamId}</p>
    </>
  );
}
