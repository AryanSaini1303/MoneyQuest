import styles from "./ProceedButton.module.css"

export default function ProceedButton({func, children, disabled, styleObj}) {
  return (
    <button onClick={func} className={styles.submit} style={disabled?{opacity:0.8, cursor:"not-allowed"}:styleObj}>
      {children}
    </button>
  );
}
