import DashboardIcon from "@mui/icons-material/Dashboard";
import MedicationIcon from "@mui/icons-material/Medication";
import PersonalInjuryIcon from "@mui/icons-material/PersonalInjury";
import BookmarksIcon from "@mui/icons-material/Bookmarks";
import ManageAccountsIcon from "@mui/icons-material/ManageAccounts";

const adminNavigation = [
  {
    title: "Dashboard",
    link: "/admin",
    icon: DashboardIcon,
  },
  {
    title: "Management",
    link: "/admin/management",
    icon: ManageAccountsIcon,
  },
  {
    title: "Doctors",
    link: "/admin/doctors",
    icon: MedicationIcon,
  },
  {
    title: "Patients",
    link: "/admin/patients",
    icon: PersonalInjuryIcon,
  },
  {
    title: "Appointments",
    link: "/admin/appointments",
    icon: BookmarksIcon,
  },
];

export default adminNavigation;
