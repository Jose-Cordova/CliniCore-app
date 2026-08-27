import { useState, useEffect, useCallback } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../layout/Navbar";
import Sidebar from "../layout/Sidebar";
import Footer from "../layout/Footer";

const AppLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(
    () => typeof window !== "undefined" && window.innerWidth >= 768
  );

  useEffect(() => {
    const handleResize = () => {
      setSidebarOpen(window.innerWidth >= 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleCloseSidebar = useCallback(() => {
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  }, []);

  return (
    <div className="h-screen flex flex-col bg-surface overflow-hidden font-sans text-slate-900">
      <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex flex-1 relative overflow-hidden h-[calc(100vh-64px)]">
        <Sidebar isOpen={sidebarOpen} onClose={handleCloseSidebar} />

        <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative h-full">
          <main className="flex-1 p-4 md:p-6 overflow-y-auto bg-surface">
            <Outlet />
          </main>

          <Footer />
        </div>
      </div>

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-20 md:hidden transition-all"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default AppLayout;