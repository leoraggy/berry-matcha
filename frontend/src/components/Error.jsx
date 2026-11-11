import "/error.png";

function Error({ error }) {
  return (
    <div
      style={{
        display: "flex",
        marginTop: "10%",
        flexDirection: "column",
        textAlign: "center",
        color: "#345b35",
        justifyContent: "center",
      }}
    >
      <h3>{error}</h3>
      <img
        src="error.png"
        alt="error image"
        width={200}
        style={{ margin: "auto" }}
      />
    </div>
  );
}

export default Error;
