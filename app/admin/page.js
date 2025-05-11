"use client";

import { useEffect, useState } from "react";
import styles from "./page.module.css";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabaseClient";
import Background from "@/components/Background";
import { useRouter } from "next/navigation";

export default function AdminPanel() {
  const [selectedTab, setSelectedTab] = useState("create");
  const [roomId, setRoomId] = useState("");
  const admins = ["saini.aryan9999@gmail.com"];
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const signIn = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.href}`, // now safely set after hydration
      },
    });
    if (error) {
      console.log(error);
      return;
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Sign-out error:", error.message);
    } else {
      console.log("Successfully signed out");
    }
    setSelectedTab("create");
    setSession(null);
    router.push(window.location.href);
  };

  const generateRoomId = () => {
    const id = "R-" + Math.random().toString(36).substring(2, 8).toUpperCase();
    setRoomId(id);
    // Optional: Send to Supabase API route here
  };

  useEffect(() => {
    const fetchSession = async () => {
      const session = await supabase.auth.getUser();
      // console.log(session);
      setSession(session.data);
      // console.log(admins.includes(session.data?.user?.email));
      if (session.data.user && !admins.includes(session.data?.user?.email)) {
        alert("You are not authorised to acccess the admin panel");
        setSelectedTab("create");
        setSession(null);
        signOut();
        // router.push(window.location.href);
      }
      setLoading(false);
    };
    fetchSession();
  }, []);

  useEffect(() => {
    const createRoom = async () => {
      try {
        const response = await fetch("/api/createRoom", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ roomId }),
        });
        const result = await response.json();
        if (!response.ok) {
          console.error("Room creation failed:", result.error);
          alert("Failed to create room.");
        } else {
          console.log("Room created successfully:", result);
        }
      } catch (error) {
        console.error("Error while creating room:", error);
      }
    };
    if (roomId.length !== 0) {
      createRoom();
    }
  }, [roomId]);

  return loading ? (
    <div className={styles.container}>
      <p>Loading...</p>
    </div>
  ) : session?.user == null || !admins.includes(session?.user?.email) ? (
    <div className={styles.container}>
      {/* <Background url={"background.jpg"} /> */}
      <section className={styles.loginSection}>
        <h1>Hello, Admin</h1>
        <button className={styles.signInBtn} onClick={signIn}>
          <img src="/images/googleLogo.png" alt="google logo" />
          <h3>Sign in with Google</h3>
        </button>
      </section>
    </div>
  ) : (
    <div className={styles.container}>
      <div className={styles.sidebar}>
        <button
          className={`${styles.tabButton} ${
            selectedTab === "create" ? styles.active : ""
          }`}
          onClick={() => setSelectedTab("create")}
        >
          Create Room
        </button>
        <button
          className={`${styles.tabButton} ${
            selectedTab === "leaderboard" ? styles.active : ""
          }`}
          onClick={() => setSelectedTab("leaderboard")}
        >
          Display Leaderboard
        </button>
        <button className={styles.tabButton} onClick={signOut}>
          Sign out
        </button>
      </div>
      <div className={styles.content}>
        <AnimatePresence mode="wait">
          {selectedTab === "create" && (
            <motion.div
              key="create"
              className={styles.formWrapper}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.3 }}
            >
              <h2>Create a New Room</h2>
              <button className={styles.generateBtn} onClick={generateRoomId}>
                Generate Room ID
              </button>
              {roomId && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className={styles.roomIdDisplay}
                  key={roomId}
                >
                  Room ID: <strong>{roomId}</strong>
                </motion.div>
              )}
            </motion.div>
          )}

          {selectedTab === "leaderboard" && (
            <motion.div
              key="leaderboard"
              className={styles.formWrapper}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.3 }}
            >
              <h2>Leaderboard (Coming Soon)</h2>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
