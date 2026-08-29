import { useNavigate, useParams } from "react-router";
import Loading from "../UI/Loading";
import NotFound from "../UI/NotFound";
import Error from "../UI/Error";
import Button from "@mui/material/Button";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useGetPatientByIdQuery } from "../../store/services/patientApi";
import PatientDetails from "../Patient/PatientDetails";
import AdminManagePatient from "./AdminManagePatient";

const AdminPatientDetails = () => {
  const { id } = useParams();

  const {
    data: patient,
    isLoading,
    error,
    refetch,
    isFetching,
  } = useGetPatientByIdQuery(id!, { skip: !id });

  const navigate = useNavigate();

  if (isLoading) {
    return <Loading />;
  }

  if (error) {
    if ("status" in error) {
      if (error.status === 404) {
        return <NotFound role="Patient" />;
      }
      return <Error refetch={refetch} isFetching={isFetching} />;
    }
  }

  if (!patient) {
    return <NotFound role="Patient" />;
  }

  return (
    <div className="p-4 max-w-xl mx-auto gap-2">
      <Button sx={{ mb: 2 }} onClick={() => navigate(-1)} variant="contained">
        <ArrowBackIcon className="mr-2" />
        Back
      </Button>
      <div className="flex flex-col gap-4">
        <PatientDetails patient={patient} />
        <AdminManagePatient patient={patient} />
      </div>
    </div>
  );
};

export default AdminPatientDetails;
