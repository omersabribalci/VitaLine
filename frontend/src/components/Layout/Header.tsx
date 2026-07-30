import Button from "@mui/material/Button";
import { useDispatch, useSelector } from "react-redux";
import { logOut } from "../../store/slices/authSlice";
import LogoutIcon from "@mui/icons-material/Logout";
import Avatar from "@mui/material/Avatar";
import type { RootState } from "../../store/store";

const Header = () => {
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.auth);
  return (
    <header className="p-4 flex flex-row items-center justify-between">
      <h1 className="hidden md:block text-2xl text-gray-800 font-semibold flex-1">
        Hello, {user.name}
      </h1>

      <div className="flex flex-row items-center gap-2 pr-2">
        <Avatar
          src={user.image ?? undefined}
          className="w-10 h-10 rounded-full object-cover"
        />
        <span>{user.name}</span>
      </div>
      <Button
        sx={{
          textTransform: "none",
          fontSize: 12,
          gap: 1,
          borderRadius: "50%",
          color: "white",
        }}
        onClick={() => {
          dispatch(logOut());
        }}
        variant="text"
      >
        <LogoutIcon className="p-0 m-0" />
      </Button>
    </header>
  );
};

export default Header;
