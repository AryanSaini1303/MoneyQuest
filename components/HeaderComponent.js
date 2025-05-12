import styles from "./HeaderComponent.module.css";

export default function HeaderComponent({avatar, name, heading, balance}) {
  return (
    <div className={styles.header}>
      <div className={styles.teamInfo}>
        <img
          src={`/images/avatars/${avatar}`}
          alt="Team Avatar"
          className={styles.avatar}
        />
        <div>
          <h2 className={styles.teamName}>{name}</h2>
        </div>
      </div>
      <div className={styles.headerInfoContainer}>
        <h1 className={styles.heading}>{heading}</h1>
        <p className={styles.subtext}>Think smart, invest wisely</p>
      </div>
      <div className={styles.balanceBox}>
        &#8377;{balance.toLocaleString()}
        <span className={styles.balanceLabel}>remaining</span>
      </div>
    </div>
  );
}
