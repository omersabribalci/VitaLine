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
    <div className="w-full max-w-6xl mx-auto">
      <div className="bg-cardBg border border-white/20 rounded-2xl shadow-sm p-5 sm:p-6">
        <h2 className="text-2xl font-bold mb-6 border-b border-white/20 pb-2 text-slate-800">
          Doctor Management
        </h2>
        <DoctorSetHoliday doctor={doctor} doctorId={doctor._id} />
      </div>
    </div>
  );
};

export default DoctorManagement;
