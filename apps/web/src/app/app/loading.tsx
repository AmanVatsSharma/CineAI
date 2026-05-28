export default function AppLoading() {
  return (
    <div
      className="page"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: 200,
      }}
    >
      <div
        style={{
          width: 32,
          height: 32,
          border: "3px solid var(--surf3)",
          borderTopColor: "var(--acc)",
          borderRadius: "50%",
          animation: "spin 0.8s linear infinite",
        }}
      />
    </div>
  );
}
