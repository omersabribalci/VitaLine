import Table from "../../components/UI/Table";
import { doctorColumns } from "../../data/tableColumns";
import Button from "@mui/material/Button";
import AddIcon from "@mui/icons-material/Add";
import { useNavigate } from "react-router";
import { useGetDoctorsQuery } from "../../store/services/doctorApi";
import Loading from "../../components/UI/Loading";
import Error from "../../components/UI/Error";

const AdminDoctorList = () => {
  const {
    data: doctors,
    isLoading,
    error,
    refetch,
    isFetching,
  } = useGetDoctorsQuery();

  const navigate = useNavigate();

  if (isLoading) {
    return <Loading />;
  }

  if (error) {
    return <Error refetch={refetch} isFetching={isFetching} />;
  }

  if (doctors?.length === 0) {
    return (
      <div className="bg-cardBg min-w-2xl p-6 rounded shadow m-4">
        <p>There is no registered doctor.</p>
        <Button
          onClick={() => {
            navigate("/admin/addNewDoctor");
          }}
          variant="contained"
          color="success"
          sx={{ alignSelf: "flex-end", px: 1, py: 1, mt: 4 }}
        >
          <AddIcon className="border rounded-md mr-2"></AddIcon>
          Add New Doctor
        </Button>
      </div>
    );
  }

  return (
    <div className="p-4 flex flex-col gap-4">
      <Button
        onClick={() => {
          navigate("/admin/addNewDoctor");
        }}
        variant="contained"
        color="success"
        sx={{ alignSelf: "flex-end", px: 1, py: 1 }}
      >
        <AddIcon className="border rounded-md mr-2"></AddIcon>
        Add New Doctor
      </Button>

      <Table
        list={doctors}
        columns={doctorColumns}
        onRowClick={(doctor) => navigate(`/admin/doctors/${doctor._id}`)}
      />
    </div>
  );
};

export default AdminDoctorList;
