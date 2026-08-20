import { useGetAppointmentsByPatientIdQuery } from "../../store/services/appointmentApi";
import Table from "../../components/UI/Table";
import { appointmentsListHead } from "../../data/tableHeads";
import Loading from "../../components/UI/Loading";
import Error from "../../components/UI/Error";
import { useGetMyPatientProfileQuery } from "../../store/services/patientApi";

const PatientAppointments = () => {
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

  return (
    <div className="p-4">
      <Table
        list={appointments}
        heads={appointmentsListHead}
        entityType="appointments"
        detailPath="/patient"
      />
    </div>
  );
};

export default PatientAppointments;
