import DashboardIcon from "@mui/icons-material/Dashboard";
import MedicationIcon from "@mui/icons-material/Medication";
import PersonalInjuryIcon from "@mui/icons-material/PersonalInjury";
import BookmarksIcon from "@mui/icons-material/Bookmarks";

const adminNavigation = [
  {
    title: "Dashboard",
    link: "/admin",
    icon: DashboardIcon,
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
  {
    title: "Management",
    link: "/admin/management",
    icon: BookmarksIcon,
  },
];

export default adminNavigation;
