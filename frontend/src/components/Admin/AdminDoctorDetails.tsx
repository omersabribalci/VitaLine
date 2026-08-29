import { useParams, useNavigate } from "react-router";
import Button from "@mui/material/Button";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useState } from "react";
import {
  useDeleteDoctorMutation,
  useGetDoctorByIdQuery,
} from "../../store/services/doctorApi";
import Error from "../UI/Error";
import Loading from "../UI/Loading";
import DoctorDetails from "../Doctor/DoctorDetails";
import NotFound from "../UI/NotFound";
import ConfirmationDialog from "../UI/ConfirmationDialog";

const AdminDoctorDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteDoctor, { isLoading: isDeleting }] = useDeleteDoctorMutation();
  const {
    data: doctor,
    isLoading,
    error,
    refetch,
    isFetching,
  } = useGetDoctorByIdQuery(id!, { skip: !id });

  const handleDelete = async () => {
    try {
      await deleteDoctor(id).unwrap();
      setShowDeleteDialog(false);
      navigate("/admin/doctors");
    } catch (error) {
      console.error(error);
    }
  };

  if (isLoading) {
    return <Loading />;
  }

  if (error) {
    if ("status" in error) {
      if (error.status === 404) {
        return <NotFound role="Doctor" />;
      }
      return <Error refetch={refetch} isFetching={isFetching} />;
    }
  }

  if (!doctor) {
    return <NotFound role="Doctor" />;
  }

  if (isDeleting) {
    return <Loading />;
  }

  return (
    <div className="p-4 w-full max-w-xl mx-auto">
      <Button
        sx={{ marginBottom: 3 }}
        onClick={() => navigate(-1)}
        variant="contained"
      >
        <ArrowBackIcon className="mr-2" />
        Back
      </Button>

      <DoctorDetails doctor={doctor} />

      <div className="mt-6 flex gap-3">
        <Button
          onClick={() => navigate(`/admin/editDoctor/${doctor._id}`)}
          variant="contained"
        >
          Edit
        </Button>
        <Button
          onClick={() => setShowDeleteDialog(true)}
          variant="contained"
          color="error"
        >
          Remove
        </Button>
      </div>

      <ConfirmationDialog
        open={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDelete}
        title="Remove Doctor"
        message="Are you sure you want to remove this doctor? This action cannot be undone."
        confirmText="Remove"
        confirmColor="error"
        isLoading={isDeleting}
      />
    </div>
  );
};

export default AdminDoctorDetails;
