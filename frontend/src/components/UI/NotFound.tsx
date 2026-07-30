import Button from "@mui/material/Button";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate } from "react-router";
const NotFound = ({ role }: { role: string }) => {
  const navigate = useNavigate();

  return (
    <div className="p-6 max-w-xs mx-auto">
      <Button onClick={() => navigate(-1)} variant="contained">
        <ArrowBackIcon className="mr-2" />
        Back
      </Button>
      <div className="p-6 rounded shadow mt-4 bg-cardBg">
        <p className="text-lg font-medium">{`${role} not found.`}</p>
        <p className="text-sm text-gray-800 mt-2">Check the ID or go back.</p>
      </div>
    </div>
  );
};

export default NotFound;
