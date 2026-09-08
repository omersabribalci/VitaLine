import { useGetAppointmentsByPatientIdQuery } from "../../store/services/appointmentApi";
import Table from "../../components/UI/Table";
import { appointmentColumns } from "../../data/tableColumns";
import Loading from "../../components/UI/Loading";
import Error from "../../components/UI/Error";
import { useGetMyPatientProfileQuery } from "../../store/services/patientApi";
import { useNavigate } from "react-router";
import { useState } from "react";

const PatientAppointments = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const {
    data: patient,
    isLoading: isPatLoading,
    error: patError,
    refetch: patRefetch,
    isFetching: isPatRefetching,
  } = useGetMyPatientProfileQuery();

  const {
    data: appointmentPage,
    error,
    isLoading,
    refetch,
    isFetching,
  } = useGetAppointmentsByPatientIdQuery(
    { patientId: patient?._id ?? "", page, limit: 8 },
    { skip: !patient?._id },
  );
  const appointments = appointmentPage?.items;

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
      <div className="mx-auto w-full max-w-6xl">
        <div className="rounded-2xl border border-white/20 bg-cardBg/80 p-6 shadow-sm">
          <p className="text-sm text-slate-700">
            You have no scheduled appointments.
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
          navigate(`/patient/appointments/${appointment._id}`)
        }
        pagination={appointmentPage?.pagination}
        onPageChange={setPage}
      />
    </div>
  );
};

export default PatientAppointments;
