import Button from "@mui/material/Button";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { logOut } from "../../store/slices/authSlice";
import LogoutIcon from "@mui/icons-material/Logout";
import Avatar from "@mui/material/Avatar";
import { useLogoutMutation } from "../../store/services/authApi";
import { resetAllApiCaches } from "../../store/resetAllApiCaches";
import { toast } from "react-toastify";
import { extractErrorMessage } from "../../utils/extractErrorMessage";

const Header = () => {
  const dispatch = useAppDispatch();
  const [logoutApi] = useLogoutMutation();
  const { user } = useAppSelector((state) => state.auth);

  const handleLogout = async () => {
    try {
      await logoutApi().unwrap();
    } catch (err) {
      toast.error(
        extractErrorMessage(err, "Unable to sign out from the server."),
      );
    } finally {
      dispatch(logOut());
      resetAllApiCaches(dispatch);
    }
  };

  return (
    <header className="p-4 flex flex-row items-center justify-between">
      <h1 className="hidden md:block text-2xl text-gray-800 font-semibold flex-1">
        Hello, {user?.name}
      </h1>

      <div className="flex flex-row items-center gap-2 pr-2">
        <Avatar
          src={user?.image || undefined}
          alt={user?.name || "User"}
          sx={{ width: 40, height: 40, bgcolor: "#dbeafe", color: "#1d4ed8" }}
        >
          {!user?.image && user?.name?.charAt(0)?.toUpperCase()}
        </Avatar>
        <span>{user?.name}</span>
      </div>
      <Button
        sx={{
          textTransform: "none",
          fontSize: 12,
          gap: 1,
          borderRadius: "50%",
          color: "white",
        }}
        onClick={handleLogout}
        variant="text"
      >
        <LogoutIcon className="p-0 m-0" />
      </Button>
    </header>
  );
};

export default Header;
