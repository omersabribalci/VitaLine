import { useGetMyDoctorProfileQuery } from "../../store/services/doctorApi";
import Loading from "../../components/UI/Loading";
import NotFound from "../../components/UI/NotFound";
import DoctorSetHoliday from "../../components/Doctor/DoctorSetHoliday";
import Error from "../../components/UI/Error";

const DoctorManagement = () => {
  const {
    data: doctor,
    isLoading,
    error,
    refetch,
    isFetching,
  } = useGetMyDoctorProfileQuery();

  if (isLoading) return <Loading />;

  if (error) {
    if ("status" in error) {
      if (error.status === 404) return <NotFound role="Doctor" />;
      return <Error refetch={refetch} isFetching={isFetching} />;
    }
  }

  if (!doctor) return null;

  return (
    <div className="max-w-4xl mx-auto p-6 bg-cardBg rounded-2xl shadow-xl mt-10">
      <h2 className="text-2xl font-bold mb-6 border-b pb-2">
        Doctor Management
      </h2>
      <DoctorSetHoliday doctor={doctor} doctorId={doctor._id} />
    </div>
  );
};

export default DoctorManagement;
