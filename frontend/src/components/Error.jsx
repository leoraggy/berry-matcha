import "/error.png";
import "./styles/Error.css";

function Error({ error }) {
  return (
    <div className="error">
      <h3>{error}</h3>
      <img src="error.png" alt="error image" width={200} id="error-image" />
    </div>
  );
}

export default Error;
