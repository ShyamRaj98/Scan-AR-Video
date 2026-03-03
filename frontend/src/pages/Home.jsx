import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      <h1 className="text-xl">AR Video Motion App</h1>
      <Link to="/scan">
        <button style={{ padding: "10px 20px" }}>Start Scanning</button>
      </Link>
    </div>
  );
}
