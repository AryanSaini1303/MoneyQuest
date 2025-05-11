"use client";
import { useEffect, useState } from "react";
import styles from "./page.module.css";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import Background from "@/components/Background";

export default function Home({ params }) {
  const images = Array.from({ length: 49 }, (_, i) => `${i + 1}.png`);
  const [chosenAvatar, setChosenAvatar] = useState("37.png");
  const [teamName, setTeamName] = useState("");
  const [submit, setSubmit] = useState(false);
  const router = useRouter();
  const [roomId, setRoomId] = useState("");

  useEffect(() => {
    const fetchParams = async () => {
      const { roomId } = await params;
      setRoomId(roomId);
      console.log(roomId);
    };
    fetchParams();
  }, []);

  function handleNameChange(e) {
    // console.log(e.target.value);
    setTeamName(e.target.value);
  }

  function handleAvatarClick(image) {
    setChosenAvatar(image);
  }

  useEffect(() => {
    if (submit) {
      const saveTeamData = async () => {
        const response = await fetch("/api/saveTeamData", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: teamName,
            avatar: chosenAvatar,
            room_id: roomId,
          }),
        });
        const data = await response.json();
        console.log("data",data);
        if (data.message?.startsWith("duplicate key")) {
          alert("You already have a team");
        }
        // data.success&&console.log(typeof(data.data[0].id));
        data.success && router.push(`/team_formation/${data?.data[0].id}`);
      };
      saveTeamData();
    }
  }, [chosenAvatar, teamName, submit]);

  return (
    <div className="wrapper">
      <Background url={"noTextBackground.jpg"} />
      <section className={styles.container}>
        <h1>Choose Your Avatar</h1>

        <div className={styles.chosenAvatar}>
          <img
            src={`/images/avatars/${chosenAvatar}`}
            alt="chosen avatar"
            className={styles.avatar}
            key={chosenAvatar} // Forces the component to re-mount an fires the animation everytime the "chosenAvatar" is changed
          />
        </div>

        <form onSubmit={(e) => e.preventDefault()}>
          <input
            type="text"
            name="name"
            placeholder="Enter team name"
            onChange={handleNameChange}
            // className={styles.inputField}
          />
        </form>

        <section className={styles.avatarContainer}>
          {images.map((image, index) => (
            <img
              key={index}
              src={`/images/avatars/${image}`}
              alt={`avatar ${index + 1}`}
              className={styles.availableAvatars}
              onClick={() => {
                handleAvatarClick(image);
              }}
            />
          ))}
        </section>
        {teamName.length != 0 && (
          <button className={styles.submit} onClick={() => setSubmit(true)}>
            Let's begin
          </button>
        )}
      </section>
    </div>
  );
}
