import Error from "../../components/UI/Error";
import Loading from "../../components/UI/Loading";
import Table from "../../components/UI/Table";
import { appointmentColumns } from "../../data/tableColumns";
import { useGetAllAppointmentsQuery } from "../../store/services/appointmentApi";
import { useNavigate } from "react-router";
import { useState } from "react";

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
    return <Error refetch={refetch} isFetching={isFetching} />;
  }

  if (appointments?.length === 0) {
    return (
      <div className="mx-auto w-full max-w-6xl">
        <div className="rounded-2xl border border-white/20 bg-cardBg/80 p-6 shadow-sm">
          <p className="text-sm text-slate-700">
            There are no scheduled appointments.
          </p>
        </div>
      </div>
    );
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
