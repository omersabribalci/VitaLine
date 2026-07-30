import HomeIcon from "@mui/icons-material/Home";
import StyleIcon from "@mui/icons-material/Style";
import BookmarksIcon from "@mui/icons-material/Bookmarks";

const patientNavigation = [
  {
    title: "Overview",
    link: "/patient",
    icon: HomeIcon,
  },
  {
    title: "Book",
    link: "/patient/bookAppointment",
    icon: StyleIcon,
  },
  {
    title: "Appointments",
    link: "/patient/appointments",
    icon: BookmarksIcon,
  },
];

export default patientNavigation;
