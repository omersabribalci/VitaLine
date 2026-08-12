import { useGetPatientByIdQuery } from "../../store/services/patientApi";
import Loading from "../../components/UI/Loading";
import { useSelector } from "react-redux";
import PatientDetails from "../../components/Patient/PatientDetails";
import Error from "../../components/UI/Error";
import type { RootState } from "../../store/store";

const PatientOverview = () => {
  const { user } = useSelector((state: RootState) => state.auth);

  const {
    data: patient,
    isLoading,
    error,
    refetch,
    isFetching,
  } = useGetPatientByIdQuery(user?._id);

  if (isLoading) {
    return <Loading />;
  }

  if (error) {
    return <Error refetch={refetch} isFetching={isFetching} />;
  }

  return (
    <div className="p-4 max-w-xl mx-auto">
      <PatientDetails patient={patient} />
    </div>
  );
};

export default PatientOverview;
