import Table from "../../components/UI/Table";
import { appointmentsListHeadforDoctors } from "../../data/tableHeads";
import { useGetAppointmentsByDoctorIdQuery } from "../../store/services/appointmentApi";
import Loading from "../../components/UI/Loading";
import Error from "../../components/UI/Error";
import { useGetMyDoctorProfileQuery } from "../../store/services/doctorApi";

const DoctorAppointments = () => {
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

  if (!doctor) return null;

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
