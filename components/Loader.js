import styles from "./Loader.module.css";

export default function Loader() {
  return (
    <div className={styles.boxes}>
      <div className={styles.box}>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
      </div>
      <div className={styles.box}>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
      </div>
      <div className={styles.box}>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
      </div>
      <div className={styles.box}>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
      </div>
    </div>
  );
}
