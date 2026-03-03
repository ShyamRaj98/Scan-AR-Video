import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../src/context/AuthContext";
import { useState } from "react";
import { Menu, X } from "lucide-react";

const AdminLayout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const menuItems = [
    { name: "Dashboard", path: "/admin" },
    { name: "Upload", path: "/admin/upload" },
  ];

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleHome = () => {
    navigate("/");
  };

  return (
    <div className="h-screen flex bg-gray-100 overflow-hidden">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static z-50
          top-0 left-0
          h-full w-64
          bg-black text-white
          flex flex-col
          transform transition-transform duration-300
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-800">
          <h2 className="text-xl font-bold tracking-wide">Admin Panel</h2>
          <button className="lg:hidden" onClick={() => setSidebarOpen(false)}>
            <X size={22} />
          </button>
        </div>

        {/* Menu */}
        <nav className="flex-1 p-5 space-y-2">
          {menuItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path);

            return (
              <Link
                key={item.name}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`
                  block px-4 py-2 rounded-lg transition-all duration-200
                  ${
                    isActive
                      ? "bg-white text-black font-semibold shadow"
                      : "hover:bg-gray-800 text-gray-300"
                  }
                `}
              >
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Buttons */}
        <div className="p-5 border-t border-gray-800 space-y-2">
          <button
            onClick={handleHome}
            className="w-full bg-green-500 hover:bg-green-600 transition py-2 rounded-lg font-medium"
          >
            Home
          </button>

          <button
            onClick={handleLogout}
            className="w-full bg-red-500 hover:bg-red-600 transition py-2 rounded-lg font-medium"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button className="lg:hidden" onClick={() => setSidebarOpen(true)}>
              <Menu size={24} />
            </button>

            <h1 className="text-lg font-semibold">
              {menuItems.find((item) => location.pathname.startsWith(item.path))
                ?.name || "Admin"}
            </h1>
          </div>

          <div className="text-sm text-gray-600 font-medium">{user?.name}</div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
