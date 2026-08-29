import Table from "../../components/UI/Table";
import { doctorAppointmentColumns } from "../../data/tableColumns";
import { useGetAppointmentsByDoctorIdQuery } from "../../store/services/appointmentApi";
import Loading from "../../components/UI/Loading";
import Error from "../../components/UI/Error";
import { useGetMyDoctorProfileQuery } from "../../store/services/doctorApi";
import { useNavigate } from "react-router";

const DoctorAppointments = () => {
  const navigate = useNavigate();
  const {
    data: doctor,
    isLoading: isDocLoading,
    error: docError,
    refetch: docRefecth,
    isFetching: isDocFetching,
  } = useGetMyDoctorProfileQuery();

  const {
    data: appointments,
    isLoading,
    error,
    refetch,
    isFetching,
  } = useGetAppointmentsByDoctorIdQuery(doctor?._id, { skip: !doctor?._id });

  if (isDocLoading || isLoading) {
    return <Loading />;
  }

  if (docError) {
    return <Error refetch={docRefecth} isFetching={isDocFetching} />;
  }

  if (error) {
    return <Error refetch={refetch} isFetching={isFetching} />;
  }

  if (appointments?.length === 0) {
    return (
      <div className="bg-cardBg p-6 rounded shadow m-4">
        <p>You have no scheduled appointments.</p>
      </div>
    );
  }

  if (!doctor) return null;

  return (
    <div className="p-4">
      <Table
        list={appointments}
        columns={doctorAppointmentColumns}
        onRowClick={(appointment) =>
          navigate(`/doctor/appointments/${appointment._id}`)
        }
      />
    </div>
  );
};

export default DoctorAppointments;
