import { useAppSelector } from "../../store/hooks";
import NavigationLink from "./NavigationLink";
import adminNavigation from "../../data/Navigation/adminNavigation";
import doctorNavigation from "../../data/Navigation/doctorNavigation";
import patientNavigation from "../../data/Navigation/patientNavigation";
import icon from "../../assets/icon.png";

const SideBar = ({ onClose }: { onClose?: () => void }) => {
  const { user } = useAppSelector((state) => state.auth);

  const navigation =
    user?.role === "admin"
      ? adminNavigation
      : user?.role === "doctor"
        ? doctorNavigation
        : patientNavigation;

  return (
    <div className="flex h-full flex-col gap-8 p-4 text-lg font-semibold text-white">
      <div className="flex items-center gap-3 p-2">
        <img src={icon} alt="Vita Line" className="h-10 w-10" />
        <div className="text-lg">Vita Line</div>
      </div>

      <nav className="flex flex-col gap-4">
        {navigation.map((item) => (
          <div
            key={item.title}
            className="cursor-pointer rounded-xl p-2 hover:bg-white/10"
            onClick={onClose}
          >
            <NavigationLink {...item} item={item} />
          </div>
        ))}
      </nav>
    </div>
  );
};

export default SideBar;
