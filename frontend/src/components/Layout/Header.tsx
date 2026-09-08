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
    <header className="flex min-w-75 flex-row items-center justify-between px-4 py-2">
      <h1 className="hidden flex-1 text-xl font-semibold text-gray-800 md:block">
        Hello, {user?.name}
      </h1>

      <div className="flex flex-row items-center gap-2 pr-2">
        <Avatar
          src={user?.image || undefined}
          alt={user?.name || "User"}
          sx={{ width: 36, height: 36, bgcolor: "#dbeafe", color: "#1d4ed8" }}
        >
          {!user?.image && user?.name?.charAt(0)?.toUpperCase()}
        </Avatar>
        <span>{user?.name}</span>
      </div>
      <Button
        aria-label="Log out"
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
