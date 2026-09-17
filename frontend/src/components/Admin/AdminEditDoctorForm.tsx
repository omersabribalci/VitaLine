import { useNavigate, useParams } from "react-router";
import { editDoctorInputs } from "../../data/Inputs/doctorInputs";
import FormInput from "../Form/FormInput";
import FormSelect from "../Form/FormSelect";
import { useForm } from "react-hook-form";
import Button from "@mui/material/Button";

import {
  useGetDoctorByIdQuery,
  useGetDoctorCatalogQuery,
  useUpdateDoctorMutation,
} from "../../store/services/doctorApi";
import { useEffect } from "react";
import { toast } from "react-toastify";
import Loading from "../UI/Loading";
import type { EditDoctorFormData } from "../../types";
import { extractErrorMessage } from "../../utils/extractErrorMessage";
import Error from "../UI/Error";

const AdminEditDoctorForm = () => {
  const [updateDoctor, { isLoading: isUpdating }] = useUpdateDoctorMutation();
  const navigate = useNavigate();
  const { id } = useParams();
  const { data: doctor, isLoading: isFetching } = useGetDoctorByIdQuery(id!, {
    skip: !id,
  });
  const {
    data: catalog,
    isLoading: isCatalogLoading,
    error: catalogError,
    refetch: refetchCatalog,
    isFetching: isCatalogFetching,
  } = useGetDoctorCatalogQuery();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<EditDoctorFormData>();

  useEffect(() => {
    if (doctor) {
      reset({
        title: doctor.title,
        name: doctor.userId.name,
        email: doctor.userId.email,
        phone: doctor.userId.phone,
        image: doctor.userId.image ?? "",
        speciality: doctor.speciality,
      });
    }
  }, [doctor, reset]);

  const onSubmit = async (data: EditDoctorFormData) => {
    try {
      await updateDoctor({
        id,
        ...data,
      }).unwrap();
      toast.success("Doctor profile updated successfully!");
      navigate(`/admin/doctors/${id}`);
    } catch (err) {
      toast.error(extractErrorMessage(err, "Unable to update doctor profile."));
    }
  };

  if (isFetching || isCatalogLoading) return <Loading />;
  if (catalogError) {
    return <Error refetch={refetchCatalog} isFetching={isCatalogFetching} />;
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-cardBg rounded-2xl shadow-xl mt-8">
      <h2 className="text-xl font-semibold mb-4">Edit Doctor</h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormSelect
            label="Select title"
            name="title"
            options={catalog?.titles ?? []}
            register={register}
            rules={{ required: "Title is required" }}
            errors={errors}
          />
          {editDoctorInputs.map((input) => (
            <FormInput
              key={input.name}
              {...input}
              register={register}
              errors={errors}
            />
          ))}
          <FormSelect
            label="Select speciality"
            name="speciality"
            options={catalog?.specialities ?? []}
            register={register}
            rules={{ required: "Speciality is required" }}
            errors={errors}
          />
        </div>

        <div className="flex items-center gap-3 pt-4">
          <Button
            type="submit"
            loading={isSubmitting || isUpdating}
            variant="contained"
            color="success"
          >
            Save Changes
          </Button>
          <Button
            onClick={() => navigate(-1)}
            type="button"
            variant="outlined"
            sx={{
              borderColor: "black",
              color: "black",
            }}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AdminEditDoctorForm;
