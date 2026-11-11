function NotFound() {
  return (
    <div
      style={{
        display: "flex",
        marginTop: "10%",
        flexDirection: "column",
        textAlign: "center",
        color: "#ff859c",
        justifyContent: "center",
      }}
    >
      <h2>404 Page Not Found</h2>
      <img
        src="/404.png"
        alt="error image"
        width={200}
        style={{ margin: "auto" }}
      />
    </div>
  );
}

export default NotFound;
