"use client";

import { useEffect, useState } from "react";
import styles from "./page.module.css";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabaseClient";
import Background from "@/components/Background";
import { useRouter } from "next/navigation";
import Loader from "@/components/Loader";

export default function AdminPanel() {
  const [selectedTab, setSelectedTab] = useState("create");
  const [roomId, setRoomId] = useState("");
  const admins = ["saini.aryan9999@gmail.com", "yograj.rr@gmail.com"];
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const [roomIdInputTemp, setRoomIdInputTemp] = useState(""); // Temp state for input field value
  const [roomIdInput, setRoomIdInput] = useState(""); // Final state for room ID when submit is clicked
  const [leaderBoardData, setLeaderBoardData] = useState([]);
  const [sortedLeaderBoard, setSortedLeaderBoard] = useState([]);
  const [leaderboardLoading, setLeaderboardLoading] = useState(false);

  const signIn = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.href, // here we mentioned to redirect to the same link which was opened, post authentication.
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
    router.replace(window.location.href);
  };

  const generateRoomId = () => {
    const id = "R-" + Math.random().toString(36).substring(2, 8).toUpperCase();
    setRoomId(id);
  };

  useEffect(() => {
    const fetchSession = async () => {
      const session = await supabase.auth.getUser();
      setSession(session.data);
      if (session.data.user && !admins.includes(session.data?.user?.email)) {
        alert("You are not authorised to access the admin panel");
        setSelectedTab("create");
        setSession(null);
        signOut();
      }
      setLoading(false);
    };
    fetchSession();
  }, []);

  useEffect(() => {
    if (roomId.length !== 0) {
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
            setRoomId("");
          } else {
            console.log("Room created successfully");
          }
        } catch (error) {
          console.error("Error while creating room:", error);
        }
      };
      createRoom();
    }
  }, [roomId]);

  useEffect(() => {
    setLeaderboardLoading(true);
    if (roomIdInput.length !== 0) {
      const fetchResults = async () => {
        const res = await fetch(`/api/fetchResults?roomId=${roomIdInput}`);
        const { data } = await res.json();
        if (data.length != 0) {
          const newData = data.filter((result) => result.result !== null);
          newData.map((item) => {
            setLeaderBoardData((prev) => [...prev, item]);
          });
          setLeaderboardLoading(false);
        }
      };
      fetchResults();
    }
  }, [roomIdInput]);

  useEffect(() => {
    if (leaderBoardData.length != 0) {
      setSortedLeaderBoard(
        leaderBoardData
          .map((item) => item.result)
          .sort((a, b) => b.balance - a.balance)
      );
    }
  }, [leaderBoardData]);

  return loading ? (
    <div className={styles.container}>
      <Loader />
    </div>
  ) : session?.user == null || !admins.includes(session?.user?.email) ? (
    <div className={styles.container}>
      <Background url={"background.jpg"} />
      <section className={styles.loginSection}>
        <button className={styles.signInBtn} onClick={signIn}>
          <img src="/images/googleLogo.png" alt="google logo" />
          <h3>Sign in with Google</h3>
        </button>
      </section>
    </div>
  ) : (
    <div className={styles.container}>
      <Background
        url={"adminBackground.jpg"}
        styleObj={{ filter: "blur(2px)" }}
      />
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
                  key={`room-${roomId}`}
                >
                  Room ID: <strong>{roomId}</strong>
                </motion.div>
              )}
            </motion.div>
          )}

          {selectedTab === "leaderboard" && (
            <motion.div
              key="leaderboard-input"
              className={styles.formWrapper}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.3 }}
            >
              <div className={styles.inputGroup}>
                <h2>Leaderboard</h2>
                <input
                  id="roomIdInput"
                  type="text"
                  placeholder="Enter Room Id"
                  value={roomIdInputTemp} // Temporary value for input field
                  onChange={(e) => setRoomIdInputTemp(e.target.value)} // Capture the input
                  className={styles.input}
                />
                <button
                  className={styles.generateBtn}
                  onClick={() => {
                    if (!roomIdInputTemp.trim()) {
                      alert("Please enter a valid Room ID.");
                      return;
                    }
                    setRoomIdInput(roomIdInputTemp); // Set final roomIdInput when submit is clicked
                    console.log(
                      "Fetching leaderboard for room:",
                      roomIdInputTemp
                    );
                  }}
                >
                  Submit
                </button>
              </div>
            </motion.div>
          )}

          {selectedTab === "leaderboard" && leaderBoardData.length !== 0 && (
            <motion.div
              key="leaderboard-table"
              className={styles.table}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.3 }}
            >
              <div className={styles.tableWrapper}>
                {leaderboardLoading ? (
                  <Loader />
                ) : (
                  <table className={styles.leaderboardTable}>
                    <thead>
                      <tr>
                        <th>Rank</th>
                        <th>Team Name</th>
                        <th>Avatar</th>
                        <th>Balance</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedLeaderBoard.map((team, index) => (
                        <tr key={team.teamId}>
                          <td>{index + 1}</td>
                          <td>{team.name}</td>
                          <td>
                            <img
                              src={`/images/avatars/${team.avatar}`}
                              alt={`${team.name} Avatar`}
                              className={styles.avatar}
                            />
                          </td>
                          <td>&#8377;{team.balance.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
