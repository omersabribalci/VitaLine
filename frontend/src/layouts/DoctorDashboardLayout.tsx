import { useState } from "react";
import { Outlet } from "react-router";
import Header from "../components/Layout/Header";
import SideBar from "../components/Layout/SideBar";
import MenuIcon from "@mui/icons-material/Menu";
import IconButton from "@mui/material/IconButton";

const DoctorDashboardLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="relative flex min-h-screen w-full min-w-[360px] flex-col lg:flex-row">
      <div
        className={`fixed inset-y-0 left-0 z-40 w-64 transform transition-transform duration-200 lg:static lg:w-auto lg:translate-x-0 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="h-full border border-white/20 bg-myBlackBg/20 backdrop-blur-sm rounded-r-4xl lg:h-screen lg:rounded-r-4xl">
          <SideBar onClose={() => setIsSidebarOpen(false)} />
        </div>
      </div>

      {isSidebarOpen && (
        <button
          type="button"
          aria-label="Close sidebar"
          className="fixed inset-0 z-30 bg-black/20 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <div className="flex h-screen w-full min-w-[320px] flex-col gap-2 overflow-hidden px-3 sm:px-4 lg:basis-9/10 lg:px-5">
        <div className="flex min-w-[300px] items-center justify-between gap-3 rounded-full border border-white/20 bg-myBlackBg/20 px-2 py-2">
          {!isSidebarOpen && (
            <IconButton
              onClick={() => setIsSidebarOpen(true)}
              sx={{
                color: "#fff",
                display: "inline-flex",
                "@media (min-width: 1024px)": {
                  display: "none",
                },
              }}
              aria-label="Open dashboard menu"
            >
              <MenuIcon />
            </IconButton>
          )}
          <div className="flex-1">
            <Header />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto rounded-4xl border border-white/20 bg-myBlackBg/20">
          <div className="mx-auto h-full w-full max-w-7xl px-3 py-4 sm:px-4 sm:py-5 lg:px-6 lg:py-6">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboardLayout;
