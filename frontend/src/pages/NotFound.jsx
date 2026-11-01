import "/404.png";
import "./styles/NotFound.css";

function NotFound() {
  return (
    <div className="not-found">
      <h2>404 Page Not Found</h2>
      <img src="404.png" alt="error image" width={200} id="not-found" />
    </div>
  );
}

export default NotFound;
