import { useGetAppointmentsByPatientIdQuery } from "../../store/services/appointmentApi";
import Table from "../../components/UI/Table";
import { appointmentColumns } from "../../data/tableColumns";
import Loading from "../../components/UI/Loading";
import Error from "../../components/UI/Error";
import { useGetMyPatientProfileQuery } from "../../store/services/patientApi";
import { useNavigate } from "react-router";

const PatientAppointments = () => {
  const navigate = useNavigate();
  const {
    data: patient,
    isLoading: isPatLoading,
    error: patError,
    refetch: patRefetch,
    isFetching: isPatRefetching,
  } = useGetMyPatientProfileQuery();

  const {
    data: appointments,
    error,
    isLoading,
    refetch,
    isFetching,
  } = useGetAppointmentsByPatientIdQuery(patient?._id, { skip: !patient?._id });

  if (isPatLoading || isLoading) {
    return <Loading />;
  }

  if (patError) {
    return <Error refetch={patRefetch} isFetching={isPatRefetching} />;
  }

  if (error) {
    return <Error refetch={refetch} isFetching={isFetching} />;
  }

  if (appointments?.length === 0) {
    return (
      <div className="bg-cardBg p-6 rounded shadow m-4">
        <p>You have no scheduled appointments.</p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <Table
        list={appointments}
        columns={appointmentColumns}
        onRowClick={(appointment) =>
          navigate(`/patient/appointments/${appointment._id}`)
        }
      />
    </div>
  );
};

export default PatientAppointments;
