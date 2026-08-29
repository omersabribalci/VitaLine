import { useAppSelector } from "../../store/hooks";
import NavigationLink from "./NavigationLink";
import adminNavigation from "../../data/Navigation/adminNavigation";
import doctorNavigation from "../../data/Navigation/doctorNavigation";
import patientNavigation from "../../data/Navigation/patientNavigation";
import icon from "../../assets/icon.png";

const SideBar = () => {
  const { user } = useAppSelector((state) => state.auth);

  const navigation =
    user?.role === "admin"
      ? adminNavigation
      : user?.role === "doctor"
        ? doctorNavigation
        : patientNavigation;
  return (
    <div className="p-4 flex flex-col gap-8 text-white text-lg font-semibold">
      <div className="flex flex-row items-center p-2">
        <img src={icon} alt="Vita Line" className="h-10 w-10" />
        <div className="p-2">Vita Line</div>
      </div>

      <nav className="flex flex-col gap-4 ">
        {navigation.map((item) => (
          <div
            key={item.title}
            className="hover:bg-white/10 cursor-pointer p-2 rounded-xl"
          >
            <NavigationLink {...item} item={item} />
          </div>
        ))}
      </nav>
    </div>
  );
};

export default SideBar;
