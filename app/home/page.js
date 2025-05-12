"use client";
import { useEffect, useState } from "react";
import styles from "./page.module.css";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import Background from "@/components/Background";

export default function Home() {
  const images = Array.from({ length: 49 }, (_, i) => `${i + 1}.png`);
  const [chosenAvatar, setChosenAvatar] = useState("37.png");
  const [teamName, setTeamName] = useState("");
  const [submit, setSubmit] = useState(false);
  const router = useRouter();
  const [roomId, setRoomId] = useState("");
  const [loading, setLoading] = useState(false);

  // useEffect(() => {
  //   const fetchParams = async () => {
  //     const { roomId } = await params;
  //     setRoomId(roomId);
  //     // console.log(roomId);
  //   };
  //   fetchParams();
  // }, []);
  // this can be used to fetch the data received through params in the url, for that this component will recieve something which can be destructured as "{params}" to get "params" i.e. export default function Home({params}){}

  useEffect(() => {
    setRoomId(sessionStorage.getItem("roomId"));
  }, []);

  useEffect(() => {
    if (roomId == null) {
      alert("Unauthorised!");
      router.back();
    }
  }, [roomId]);

  function handleNameChange(e) {
    // console.log(e.target.value);
    setTeamName(e.target.value);
  }

  function handleAvatarClick(image) {
    setChosenAvatar(image);
  }

  useEffect(() => {
    if (submit) {
      setLoading(true);
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
        // console.log("data", data);
        if (data.message?.startsWith("duplicate key")) {
          alert("You already have a team");
        }
        // data.success&&console.log(typeof(data.data[0].id));
        sessionStorage.setItem("teamId", data?.data[0].id); // using sessionStorage to store the "teamId" of the user currently active in the tab, once the tab closes then the data is erased. Not using localStorage as it keeps the data forever until explicitly deleted manually
        data.success && router.replace(`/team_formation`);
        setLoading(false);
      };
      saveTeamData();
    }
  }, [chosenAvatar, teamName, submit]);

  return (
    <div className="wrapper">
      <Background url={"noTextBackground.jpg"} />
      {/* <Background url={"background.jpg"} /> */}
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
            {loading ? "Saving..." : "Let's begin"}
          </button>
        )}
      </section>
    </div>
  );
}
