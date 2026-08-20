import { useGetMyDoctorProfileQuery } from "../../store/services/doctorApi";
import Loading from "../../components/UI/Loading";
import Error from "../../components/UI/Error";
import DoctorDailyAppointments from "../../components/Doctor/DoctorDailyAppointments";
import DoctorDetails from "../../components/Doctor/DoctorDetails";

const DoctorOverview = () => {
  const {
    data: doctor,
    isLoading,
    error,
    refetch,
    isFetching,
  } = useGetMyDoctorProfileQuery();

  if (isLoading) {
    return <Loading />;
  }

  if (error) {
    return <Error refetch={refetch} isFetching={isFetching} />;
  }

  if (!doctor) return null;

  return (
    <div className="mx-auto p-4 max-w-4xl">
      <DoctorDetails doctor={doctor} />
      <DoctorDailyAppointments id={doctor._id} />
    </div>
  );
};

export default DoctorOverview;
