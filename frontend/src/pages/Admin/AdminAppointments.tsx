import Error from "../../components/UI/Error";
import Loading from "../../components/UI/Loading";
import Table from "../../components/UI/Table";
import { appointmentColumns } from "../../data/tableColumns";
import { useGetAllAppointmentsQuery } from "../../store/services/appointmentApi";
import { useNavigate } from "react-router";
import { useState } from "react";
import EmptyState from "../../components/UI/EmptyState";

const AdminAppointments = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const {
    data: appointmentPage,
    isLoading,
    error,
    refetch,
    isFetching,
  } = useGetAllAppointmentsQuery({ page, limit: 8 });
  const appointments = appointmentPage?.items;

  if (isLoading) {
    return <Loading />;
  }

  if (error) {
    return <Error refetch={refetch} isFetching={isFetching} error={error} />;
  }

  if (appointments?.length === 0) {
    return <EmptyState message="There are no scheduled appointments." />;
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-4">
      <Table
        list={appointments}
        columns={appointmentColumns}
        onRowClick={(appointment) =>
          navigate(`/admin/appointments/${appointment._id}`)
        }
        pagination={appointmentPage?.pagination}
        onPageChange={setPage}
      />
    </div>
  );
};

export default AdminAppointments;
