import Error from "../../components/UI/Error";
import Loading from "../../components/UI/Loading";
import Table from "../../components/UI/Table";
import { appointmentsListHead } from "../../data/tableHeads";
import { useGetAllAppointmentsQuery } from "../../store/services/appointmentApi";

const AdminAppointments = () => {
  const {
    data: appointments,
    isLoading,
    error,
    refetch,
    isFetching,
  } = useGetAllAppointmentsQuery();

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
        detailPath="/admin"
      />
    </div>
  );
};

export default AdminAppointments;
