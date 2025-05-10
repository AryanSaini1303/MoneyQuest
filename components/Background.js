import styles from "./Background.module.css";

export default function Background({ url }) {
  return (
    <img
      src={`/images/${url}`}
      alt="background image"
      className={styles.backgroundImage}
    />
  );
}
