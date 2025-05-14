"use client";

import Background from "@/components/Background";
import { useEffect, useState } from "react";
import styles from "./page.module.css";
import { useRouter } from "next/navigation";

export default function TeamFormationPage() {
  const [showForm, setShowForm] = useState(false);
  const [memberName, setMemberName] = useState("");
  const [teamMembers, setTeamMembers] = useState([]);
  const [submit, setSubmit] = useState(false);
  const router = useRouter();
  const [teamId, setTeamId] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setTeamId(sessionStorage.getItem("teamId"));
  }, []);

  useEffect(() => {
    if (teamId == null) {
      alert("Unauthorised!");
      router.back();
    }
  }, [teamId]);

  const handleAddMember = (e) => {
    e.preventDefault();
    if (memberName.trim() === "") return;
    setTeamMembers((prev) => [...prev, memberName.trim()]);
    setMemberName("");
  };

  const handleRemoveMember = (index) => {
    setTeamMembers((prev) => prev.filter((_, i) => i !== index));
  };

  useEffect(() => {
    if (submit) {
      setLoading(true);
      const addTeamMembers = async () => {
        const response = await fetch("/api/addTeamMembers", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            members: teamMembers,
            id: teamId,
          }),
        });
        const data = await response.json();
        // console.log("data", data);
        // data.success&&console.log(typeof(data.data[0].id));
        sessionStorage.setItem("teamId", teamId);
        data.success && router.replace(`/select-shop`);
        setLoading(false);
      };
      addTeamMembers();
    }
  }, [submit]);

  return (
    <div className={styles.wrapper}>
      <Background url="noTextBackground.jpg" />
      {/* <Background url={"background.jpg"} /> */}
      <div className={styles.info}>
        <h1>Great teams turn vision into success.</h1>
      </div>
      <div className={styles.cardContainer}>
        <div className={styles.addMemberCard}>
          <h2>Add a team member</h2>
          <div
            className={styles.addBtn}
            onClick={() => setShowForm((prev) => !prev)}
            style={
              showForm
                ? { transform: "rotate(45deg)", backgroundColor: "black" }
                : null
            }
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              width="1.8em"
              height="1.8em"
              fill="white"
            >
              <path d="M19 11h-6V5a1 1 0 0 0-2 0v6H5a1 1 0 0 0 0 2h6v6a1 1 0 0 0 2 0v-6h6a1 1 0 0 0 0-2" />
            </svg>
          </div>

          <form
            onSubmit={handleAddMember}
            className={showForm ? `${styles.show} ${styles.form}` : styles.form}
          >
            <input
              type="text"
              placeholder="Member name"
              value={memberName}
              onChange={(e) => setMemberName(e.target.value)}
            />
            <button type="submit">Add</button>
          </form>

          {teamMembers.length > 0 && (
            <div className={styles.memberList}>
              <p>Team Members:</p>
              <ul>
                {teamMembers.map((member, index) => (
                  <li
                    key={index}
                    className={styles.memberItem}
                    onClick={() => handleRemoveMember(index)}
                  >
                    {member}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        {teamMembers.length != 0 && (
          <button className={styles.submit} onClick={() => setSubmit(true)}>
            {loading ? "Saving..." : "Let the quest begin"}
          </button>
        )}
      </div>
    </div>
  );
}
