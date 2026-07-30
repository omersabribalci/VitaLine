import { useSelector } from "react-redux";
import { useGetAppointmentsByPatientIdQuery } from "../../store/services/appointmentApi";
import Table from "../../components/UI/Table";
import { appointmentsListHead } from "../../data/tableHeads";
import Loading from "../../components/UI/Loading";
import Error from "../../components/UI/Error";
import type { RootState } from "../../store/store";

const PatientAppointments = () => {
  const { id: patientId } = useSelector((state: RootState) => state.auth);
  const {
    data: appointments,
    error,
    isLoading,
    refetch,
    isFetching,
  } = useGetAppointmentsByPatientIdQuery(patientId);

  if (isLoading) {
    return <Loading />;
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
