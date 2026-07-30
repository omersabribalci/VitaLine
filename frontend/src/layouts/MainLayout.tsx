import { Outlet } from "react-router";

const MainLayout = () => {
  return (
    <div className="flex flex-col min-h-screen w-full bg-[url('./assets/bg.jpg')] bg-cover bg-center">
      <main className="grow w-full flex flex-col justify-center">
        <div className="flex flex-col items-center w-full max-w-384 2xl:w-384 mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default MainLayout;
