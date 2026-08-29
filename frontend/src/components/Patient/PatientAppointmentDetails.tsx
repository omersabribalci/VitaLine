import { useParams, useNavigate } from "react-router";
import Button from "@mui/material/Button";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useState } from "react";
import {
  useGetAppointmentByIdQuery,
  useUpdateAppointmentMutation,
} from "../../store/services/appointmentApi";
import AppointmentDetails from "../Appointment/AppointmentDetails";
import Loading from "../UI/Loading";
import Error from "../UI/Error";
import NotFound from "../UI/NotFound";
import ConfirmationDialog from "../UI/ConfirmationDialog";
import type { ApiError } from "../../types";

const PatientAppointmentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  const {
    data: appointment,
    isLoading,
    error,
    refetch,
    isFetching,
  } = useGetAppointmentByIdQuery(id!, { skip: !id });

  const [updateAppointment, { isLoading: isCancelling }] =
    useUpdateAppointmentMutation();

  const handleClick = async () => {
    try {
      await updateAppointment({ id, status: "cancelled" }).unwrap();
      setShowCancelDialog(false);
    } catch (err) {
      const error = err as ApiError;
      console.error("Updating error:", error.data.message);
    }
  };

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
      {appointment.status === "scheduled" ? (
        <Button
          variant="contained"
          color="error"
          onClick={() => setShowCancelDialog(true)}
        >
          Cancel Appointment
        </Button>
      ) : null}

      <ConfirmationDialog
        open={showCancelDialog}
        onClose={() => setShowCancelDialog(false)}
        onConfirm={handleClick}
        title="Cancel Appointment"
        message="Are you sure you want to cancel this appointment?"
        cancelText="Dismiss"
        confirmText="Cancel Appointment"
        confirmColor="error"
        isLoading={isCancelling}
      />
    </div>
  );
};

export default PatientAppointmentDetails;
