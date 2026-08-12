import { useSelector } from "react-redux";
import Table from "../../components/UI/Table";
import { appointmentsListHeadforDoctors } from "../../data/tableHeads";
import { useGetAppointmentsByDoctorIdQuery } from "../../store/services/appointmentApi";
import Loading from "../../components/UI/Loading";
import Error from "../../components/UI/Error";
import type { RootState } from "../../store/store";

const DoctorAppointments = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const {
    data: appointments,
    isLoading,
    error,
    refetch,
    isFetching,
  } = useGetAppointmentsByDoctorIdQuery(user?._id);

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
        heads={appointmentsListHeadforDoctors}
        entityType="appointments"
        detailPath="/doctor"
      />
    </div>
  );
};

export default DoctorAppointments;
