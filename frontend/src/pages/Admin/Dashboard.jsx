import { Link } from "react-router-dom";

export default function Dashboard() {
  return (
    <div>
      <h1>Admin Dashboard</h1>
      <Link to="/admin/upload">Upload Marker</Link>
      <br />
      <Link to="/admin/markers">View Markers</Link>
    </div>
  );
}