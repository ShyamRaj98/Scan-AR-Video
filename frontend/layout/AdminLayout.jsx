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
    { name: "Marker", path: "/admin/marker" },
  ];

  const handleLogout = () => {
    logout();
    navigate("/login");
  };
  
const handleHome = () => {
    navigate("/");
  };

  return (
    <div className="h-screen bg-gray-100 flex overflow-hidden">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static z-50 top-0 left-0 h-screen w-64 bg-black text-white transform transition-transform duration-300 
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} 
        lg:translate-x-0`}
      >
        <div className="flex items-center justify-between p-5 border-b border-gray-800">
          <h2 className="text-xl font-bold">Admin Panel</h2>
          <button className="lg:hidden" onClick={() => setSidebarOpen(false)}>
            <X size={22} />
          </button>
        </div>

        <nav className="flex-1 p-5 space-y-2">
          {menuItems.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              onClick={() => setSidebarOpen(false)}
              className={`block px-4 py-2 rounded-lg transition 
                ${
                  location.pathname === item.path
                    ? "bg-white text-black font-semibold"
                    : "hover:bg-gray-800"
                }`}
            >
              {item.name}
            </Link>
          ))}
        </nav>

        <div className="p-5 border-t border-gray-800 mt-[100%]">
          <button
            onClick={handleHome}
            className="w-full bg-green-500 hover:bg-green-600 mb-2 transition py-2 rounded-lg"
          >
            Home
          </button>
          <button
            onClick={handleLogout}
            className="w-full bg-red-500 hover:bg-red-600 transition py-2 rounded-lg"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Navbar */}
        <header className="bg-white shadow px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button className="lg:hidden" onClick={() => setSidebarOpen(true)}>
              <Menu size={24} />
            </button>
            <h1 className="text-lg font-semibold">
              {menuItems.find((item) => item.path === location.pathname)
                ?.name || "Admin"}
            </h1>
          </div>

          <div className="text-sm text-gray-600">{user?.name}</div>
        </header>

        {/* Page Content */}
        <main className="h-full overflow-y-scroll p-6 flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
