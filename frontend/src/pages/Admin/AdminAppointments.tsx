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
      <div className="w-full overflow-x-auto rounded-2xl border border-white/20 bg-cardBg/60 shadow-sm">
        <Table
          list={appointments}
          columns={appointmentColumns}
          onRowClick={(appointment) =>
            navigate(`/admin/appointments/${appointment._id}`)
          }
        />
      </div>
    </div>
  );
};

export default AdminAppointments;
