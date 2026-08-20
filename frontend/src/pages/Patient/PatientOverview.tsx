import { useGetMyPatientProfileQuery } from "../../store/services/patientApi";
import Loading from "../../components/UI/Loading";
import PatientDetails from "../../components/Patient/PatientDetails";
import Error from "../../components/UI/Error";

const PatientOverview = () => {
  const {
    data: patient,
    isLoading,
    error,
    refetch,
    isFetching,
  } = useGetMyPatientProfileQuery();

  if (isLoading) {
    return <Loading />;
  }

  if (error) {
    return <Error refetch={refetch} isFetching={isFetching} />;
  }

  if (!patient) return null;

  return (
    <div className="p-4 max-w-xl mx-auto">
      <PatientDetails patient={patient} />
    </div>
  );
};

export default PatientOverview;
