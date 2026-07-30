import { useSelector } from "react-redux";
import { useGetDoctorByIdQuery } from "../../store/services/doctorApi";
import Loading from "../../components/UI/Loading";
import NotFound from "../../components/UI/NotFound";
import DoctorSetHoliday from "../../components/Doctor/DoctorSetHoliday";
import type { RootState } from "../../store/store";
import Error from "../../components/UI/Error";

const DoctorManagement = () => {
  const { id: doctorId } = useSelector((state: RootState) => state.auth);

  if (!doctorId) {
    return <NotFound role="Doctor" />;
  }

  const {
    data: doctor,
    isLoading,
    error,
    refetch,
    isFetching,
  } = useGetDoctorByIdQuery(doctorId);

  if (isLoading) return <Loading />;
  if (error) {
    if ("status" in error) {
      if (error.status === 404) return <NotFound role="Doctor" />;
      return <Error refetch={refetch} isFetching={isFetching} />;
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-cardBg rounded-2xl shadow-xl mt-10">
      <h2 className="text-2xl font-bold mb-6 border-b pb-2">
        Doctor Management
      </h2>
      <DoctorSetHoliday doctor={doctor} doctorId={doctorId} />
    </div>
  );
};

export default DoctorManagement;
