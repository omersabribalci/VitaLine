import { Outlet } from "react-router";
import Header from "../components/Layout/Header";
import SideBar from "../components/Layout/SideBar";

const DoctorDashboardLayout = () => {
  return (
    <div className="flex flex-row w-full min-h-screen">
      <div className="h-screen bg-myBlackBg/20 border-white/20 border rounded-r-4xl basis-1/10 flex flex-col sticky top-0">
        <SideBar />
      </div>
      <div className="flex flex-col gap-2 w-full basis-9/10 px-4">
        <div className="border basis-1/10 bg-myBlackBg/20 border-white/20 rounded-full">
          <Header />
        </div>
        <div className="border basis-9/10 bg-myBlackBg/20 border-white/20 rounded-4xl">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboardLayout;
