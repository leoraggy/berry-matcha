import "/loading.gif";

function Loading() {
  return (
    <img
      src="loading.gif"
      alt="loading..."
      style={{
        display: "block",
        margin: "auto",
        marginTop: "10%",
        color: "#345b35",
      }}
      width={200}
    />
  );
}

export default Loading;
