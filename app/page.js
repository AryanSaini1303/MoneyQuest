"use client";

import { useEffect, useState } from "react";
import styles from "./page.module.css";
import Background from "@/components/Background";
import { useRouter } from "next/navigation";
import gameSessionManager from "@/utils/GameSessionManager";

export default function Home() {
  const [roomId, setRoomId] = useState("");
  const [error, setError] = useState("");
  const [submit, setSubmit] = useState(false);
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (roomId.trim() === "") {
      setError("Room ID is required");
      setSubmit(false);
      setTimeout(() => {
        setError("");
      }, 1000);
      return;
    }
    setError("");
    setSubmit(true);
  };

  useEffect(() => {
    gameSessionManager.clear();
    sessionStorage.clear();
  }, []);

  useEffect(() => {
    if (roomId.length != 0 && submit) {
      setLoading(true);
      const validateRoom = async () => {
        const res = await fetch("/api/validateRoom", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ roomId }),
        });
        const data = await res.json();
        // console.log(data);
        sessionStorage.setItem("roomId", roomId);
        if (data.valid) {
          router.replace(`/home`); // "router.replace" is used here and in all the further navigation as we don't want the user the to go back and if the browser window doesn't have history of navigation then it won't be able to go back. "router.replace" does just that, it adds a page/url to the navigation without adding it to the navigation history
        } else {
          alert("Wrong room id!, please try again");
          setLoading(false);
          setSubmit(false);
        }
        setLoading(false);
      };
      validateRoom();
    }
  }, [roomId, submit]);

  return (
    <div className="wrapper">
      <div className={styles.container}>
        <Background url={"background1.jpeg"} />
        <section className={styles.roomSection}>
          <form onSubmit={handleSubmit} className={styles.formContainer}>
            <h2 className={styles.title}>Enter Room ID</h2>
            <input
              type="text"
              className={styles.input}
              name="roomId"
              placeholder={error ? error : "Enter your Room ID"}
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              style={error ? { "--placeholder-color": "red" } : null} // this is done to change placeholder color dynamically, for this to work you first have to define "--placeholder-color" in css in ".input" and use it in ".input::placeholder"
              required
            />
            {/* {error && <p className={styles.error}>{error}</p>} */}
            <button type="submit" className={styles.button}>
              {loading ? "Joining..." : "Join"}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
