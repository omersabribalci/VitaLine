import { patientColumns } from "../../data/tableColumns";
import Table from "../../components/UI/Table";
import { useGetPatientsQuery } from "../../store/services/patientApi";
import Loading from "../../components/UI/Loading";
import Error from "../../components/UI/Error";
import type { JSX } from "react";
import { useNavigate } from "react-router";

const AdminPatientList = (): JSX.Element => {
  const navigate = useNavigate();
  const {
    data: patients,
    isLoading,
    error,
    refetch,
    isFetching,
  } = useGetPatientsQuery();

  if (isLoading) {
    return <Loading />;
  }

  if (error) {
    return <Error refetch={refetch} isFetching={isFetching} />;
  }

  if (patients?.length === 0) {
    return (
      <div className="bg-white p-6 rounded shadow m-4">
        <p>There is no registered patient.</p>
      </div>
    );
  }

  return (
    <div className="p-4 flex flex-col gap-4 mt-4 w-full min-w-0">
      <div className="w-full overflow-x-auto rounded-lg">
        <div className="min-w-80 lg:min-w-full">
          <Table
            list={patients}
            columns={patientColumns}
            onRowClick={(patient) => navigate(`/admin/patients/${patient._id}`)}
          />
        </div>
      </div>
    </div>
  );
};

export default AdminPatientList;
