import NavBarComponent from "../../components/navbar";
import styles from "./FeedLayout.module.css";

export default function FeedLayout({ leftSidebar, rightSidebar, children }) {
  return (
    <div className={styles.layout}>
      <NavBarComponent />
      <div className={styles.container}>
        {leftSidebar && (
          <aside className={styles.leftSidebar}>{leftSidebar}</aside>
        )}
        <main className={styles.center}>{children}</main>
        {rightSidebar && (
          <aside className={styles.rightSidebar}>{rightSidebar}</aside>
        )}
      </div>
    </div>
  );
}
