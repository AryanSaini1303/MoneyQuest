"use client";

import { useEffect, useState } from "react";
import styles from "./page.module.css";
import Background from "@/components/Background";
import { useRouter } from "next/navigation";

export default function Home() {
  const [roomId, setRoomId] = useState("");
  const [error, setError] = useState("");
  const [submit, setSubmit] = useState(false);
  const router = useRouter();

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
    if (roomId.length != 0 && submit) {
      const validateRoom = async () => {
        const res = await fetch("/api/validateRoom", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ roomId }),
        });
        const data = await res.json();
        // console.log(data);
        sessionStorage.setItem("roomId", roomId);
        data.valid && router.push(`/home`);
      };
      validateRoom();
    }
  }, [roomId, submit]);

  return (
    <div className="wrapper">
      <div className={styles.container}>
        <Background url={"background.jpg"} />
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
              Join
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
