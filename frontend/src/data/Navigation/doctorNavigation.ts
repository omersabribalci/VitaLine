import HomeIcon from "@mui/icons-material/Home";
import ManageAccountsIcon from "@mui/icons-material/ManageAccounts";
import BookmarksIcon from "@mui/icons-material/Bookmarks";

const doctorNavigation = [
  {
    title: "Overview",
    link: "/doctor",
    icon: HomeIcon,
  },
  {
    title: "Management",
    link: "/doctor/management",
    icon: ManageAccountsIcon,
  },
  {
    title: "Appointments",
    link: "/doctor/appointments",
    icon: BookmarksIcon,
  },
];

export default doctorNavigation;
