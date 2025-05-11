import styles from "./Background.module.css";

export default function Background({ url, styleObj }) {
  return (
    <img
      src={`/images/${url}`}
      alt="background image"
      className={styles.backgroundImage}
      style={styleObj}
    />
  );
}
