import { useParams, useNavigate } from "react-router";
import Button from "@mui/material/Button";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useGetAppointmentByIdQuery } from "../../store/services/appointmentApi";
import AppointmentDetails from "../Appointment/AppointmentDetails";
import Loading from "../UI/Loading";
import Error from "../UI/Error";
import NotFound from "../UI/NotFound";

const AdminAppointmentsDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    data: appointment,
    isLoading,
    error,
    refetch,
    isFetching,
  } = useGetAppointmentByIdQuery(id);

  if (isLoading) {
    return <Loading />;
  }

  if (error) {
    if ("status" in error) {
      if (error.status === 404) {
        return <NotFound role="Appointment" />;
      }
      return <Error refetch={refetch} isFetching={isFetching} />;
    }
  }

  if (!appointment) {
    return <NotFound role="Appointment" />;
  }

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <Button onClick={() => navigate(-1)} variant="contained">
        <ArrowBackIcon className="mr-2" />
        Back
      </Button>
      <AppointmentDetails appointment={appointment} />
    </div>
  );
};

export default AdminAppointmentsDetails;
