import { Outlet } from "react-router";
import Header from "../components/Layout/Header";
import SideBar from "../components/Layout/SideBar";

const DoctorDashboardLayout = () => {
  return (
    <div className="flex flex-row w-full min-h-screen">
      <div className="h-screen bg-myBlackBg/20 border-white/20 border rounded-r-4xl basis-1/10 flex flex-col sticky top-0">
        <SideBar />
      </div>

      <div className="flex flex-col gap-2 w-full basis-9/10 px-3 sm:px-4 lg:px-5">
        <div className="border bg-myBlackBg/20 border-white/20 rounded-full">
          <Header />
        </div>

        <div className="border bg-myBlackBg/20 border-white/20 rounded-4xl flex-1 overflow-hidden">
          <div className="w-full max-w-7xl mx-auto px-3 py-4 sm:px-4 sm:py-5 lg:px-6 lg:py-6">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboardLayout;
