import Table from "../../components/UI/Table";
import { doctorAppointmentColumns } from "../../data/tableColumns";
import { useGetAppointmentsByDoctorIdQuery } from "../../store/services/appointmentApi";
import Loading from "../../components/UI/Loading";
import Error from "../../components/UI/Error";
import { useGetMyDoctorProfileQuery } from "../../store/services/doctorApi";
import { useNavigate } from "react-router";
import { useState } from "react";
import EmptyState from "../../components/UI/EmptyState";

const DoctorAppointments = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const {
    data: doctor,
    isLoading: isDocLoading,
    error: docError,
    refetch: docRefetch,
    isFetching: isDocFetching,
  } = useGetMyDoctorProfileQuery();

  const {
    data: appointmentPage,
    isLoading,
    error,
    refetch,
    isFetching,
  } = useGetAppointmentsByDoctorIdQuery(
    { doctorId: doctor?._id ?? "", page, limit: 8 },
    { skip: !doctor?._id },
  );
  const appointments = appointmentPage?.items;

  if (isDocLoading || isLoading) {
    return <Loading />;
  }

  if (docError) {
    return <Error refetch={docRefetch} isFetching={isDocFetching} error={docError} />;
  }

  if (error) {
    return <Error refetch={refetch} isFetching={isFetching} error={error} />;
  }

  if (appointments?.length === 0) {
    return <EmptyState message="You have no scheduled appointments." />;
  }

  if (!doctor) return null;

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-4">
      <Table
        list={appointments}
        columns={doctorAppointmentColumns}
        onRowClick={(appointment) =>
          navigate(`/doctor/appointments/${appointment._id}`)
        }
        pagination={appointmentPage?.pagination}
        onPageChange={setPage}
      />
    </div>
  );
};

export default DoctorAppointments;
