import { useState } from "react";
import { Route, Routes } from "react-router-dom";
import Login from "./auth/Login";
import Register from "./auth/Register";
import Home from "./pages/Home";
import ScanPage from "./pages/ScanPage";
import ProtectedRoute from "./auth/ProtectedRoute";
import AdminLayout from "../layout/AdminLayout";
import Dashboard from "./pages/Admin/Dashboard";
import UploadMarker from "./pages/Admin/UploadMarker";
import MarkerList from "./pages/Admin/MarkerList";

function App() {
  return (
    <>
      <Routes>
        <Route element={<Login />} path="/admin/login" />
        <Route element={<Register />} path="/register" />

        <Route element={<Home />} path="/" />
        <Route element={<ScanPage />} path="/scan" />

        {/* ================= ADMIN LAYOUT ================= */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="upload" element={<UploadMarker />} />
          <Route path="markers" element={<MarkerList />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;
