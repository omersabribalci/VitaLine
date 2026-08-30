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
      <div className="w-full max-w-6xl mx-auto bg-cardBg p-4 sm:p-6 rounded-2xl shadow-md">
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
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-4">
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

      <div className="w-full overflow-x-auto rounded-2xl border border-white/20 bg-cardBg/60 shadow-sm">
        <Table
          list={doctors}
          columns={doctorColumns}
          onRowClick={(doctor) => navigate(`/admin/doctors/${doctor._id}`)}
        />
      </div>
    </div>
  );
};

export default AdminDoctorList;
