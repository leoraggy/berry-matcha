import "/404.png";
import styles from "./styles/NotFound.module.css";

function NotFound() {
  return (
    <div className={styles["not-found"]}>
      <h2>404 Page Not Found</h2>
      <img
        src="404.png"
        alt="error image"
        width={200}
        id="not-found"
        className={styles["not-found-image"]}
      />
    </div>
  );
}

export default NotFound;
