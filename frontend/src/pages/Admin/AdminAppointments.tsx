import Error from "../../components/UI/Error";
import Loading from "../../components/UI/Loading";
import Table from "../../components/UI/Table";
import { appointmentColumns } from "../../data/tableColumns";
import { useGetAllAppointmentsQuery } from "../../store/services/appointmentApi";
import { useNavigate } from "react-router";

const AdminAppointments = () => {
  const navigate = useNavigate();
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

  if (appointments?.length === 0) {
    return (
      <div className="bg-cardBg p-6 rounded shadow m-4">
        <p>There are no scheduled appointments.</p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <Table
        list={appointments}
        columns={appointmentColumns}
        onRowClick={(appointment) =>
          navigate(`/admin/appointments/${appointment._id}`)
        }
      />
    </div>
  );
};

export default AdminAppointments;
