import styles from "./GifOverlay.module.css";

export default function GifOverlay({ url }) {
  return <img src={url} alt="animation" className={styles.snowfall} />;
}
