import { useSelector } from "react-redux";
import { useGetDoctorByIdQuery } from "../../store/services/doctorApi";
import Loading from "../../components/UI/Loading";
import Error from "../../components/UI/Error";
import DoctorDailyAppointments from "../../components/Doctor/DoctorDailyAppointments";
import DoctorDetails from "../../components/Doctor/DoctorDetails";
import type { RootState } from "../../store/store";

const DoctorOverview = () => {
  const { user } = useSelector((state: RootState) => state.auth);

  const {
    data: doctor,
    isLoading,
    error,
    refetch,
    isFetching,
  } = useGetDoctorByIdQuery(user?._id);

  if (isLoading) {
    return <Loading />;
  }

  if (error) {
    return <Error refetch={refetch} isFetching={isFetching} />;
  }

  return (
    <div className="mx-auto p-4 max-w-4xl">
      <DoctorDetails doctor={doctor} />
      <DoctorDailyAppointments id={doctor.id} />
    </div>
  );
};

export default DoctorOverview;
