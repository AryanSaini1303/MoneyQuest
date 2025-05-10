"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import styles from "./page.module.css";

export default function Home() {
  const [redirectURL, setRedirectURL] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setRedirectURL(`${window.location.origin}/home`);
    }
  }, []);

  const signIn = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: redirectURL, // now safely set after hydration
      },
    });
    if (error) {
      console.log(error);
      return;
    }
  };

  return (
    <div className="wrapper">
      <div className={styles.container}>
        <section className={styles.imageSection}>
          <img src="/images/background.jpg" alt="background image" />
        </section>
        <section className={styles.loginSection}>
          <button className={styles.signInBtn} onClick={signIn}>
            <img src="/images/googleLogo.png" alt="google logo" />
            <h3>Sign in with Google</h3>
          </button>
        </section>
      </div>
    </div>
  );
}
