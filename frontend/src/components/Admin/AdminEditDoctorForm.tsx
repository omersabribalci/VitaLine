import { useNavigate, useParams } from "react-router";
import { editDoctorInputs } from "../../data/Inputs/doctorInputs";
import FormInput from "../Form/FormInput";
import { useForm } from "react-hook-form";
import { specialities } from "../../data/specialities";
import Button from "@mui/material/Button";

import {
  useGetDoctorByIdQuery,
  useUpdateDoctorMutation,
} from "../../store/services/doctorApi";
import { useEffect } from "react";
import { toast } from "react-toastify";
import Loading from "../UI/Loading";
import type { EditDoctorFormData } from "../../types";
import { extractErrorMessage } from "../../utils/extractErrorMessage";
import { doctorTitles } from "../../data/doctorTitles";

const AdminEditDoctorForm = () => {
  const [updateDoctor, { isLoading: isUpdating }] = useUpdateDoctorMutation();
  const navigate = useNavigate();
  const { id } = useParams();
  const { data: doctor, isLoading: isFetching } = useGetDoctorByIdQuery(id!, {
    skip: !id,
  });

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
        image: doctor.image,
        speciality: doctor.speciality,
      });
    }
  }, [doctor, reset]);

  const onSubmit = async (data: EditDoctorFormData) => {
    try {
      const { password, ...doctorData } = data;
      const trimmedPassword = password?.trim();

      await updateDoctor({
        id,
        ...doctorData,
        ...(trimmedPassword ? { password: trimmedPassword } : {}),
      }).unwrap();
      toast.success("Doctor profile updated successfully!");
      navigate(`/admin/doctors/${id}`);
    } catch (err) {
      toast.error(extractErrorMessage(err, "Unable to update doctor profile."));
    }
  };

  if (isFetching) return <Loading />;

  return (
    <div className="max-w-2xl mx-auto p-6 bg-cardBg rounded-2xl shadow-xl mt-8">
      <h2 className="text-xl font-semibold mb-4">Edit Doctor</h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <select
              {...register("title", {
                required: "Title is required",
              })}
              className="bg-white border border-[#cfd8dc] rounded-md py-2 px-3 w-full placeholder:font-light focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400 transition-colors"
            >
              <option value="" disabled>
                Select title
              </option>
              {doctorTitles.map((title) => (
                <option key={title} value={title}>
                  {title}
                </option>
              ))}
            </select>
            {errors.title && (
              <p className="text-xs text-red-600 mt-1">
                {errors.title.message}
              </p>
            )}
          </div>
          {editDoctorInputs.map((input) => (
            <FormInput
              key={input.name}
              {...input}
              register={register}
              errors={errors}
            />
          ))}
          <div>
            <select
              {...register("speciality", {
                required: "Speciality is required",
              })}
              className="bg-white border border-[#cfd8dc] rounded-md py-2 px-3 w-full placeholder:font-light focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400 transition-colors"
            >
              <option value="" disabled>
                Select speciality
              </option>
              {specialities.map((spec) => (
                <option key={spec} value={spec}>
                  {spec}
                </option>
              ))}
            </select>
            {errors.speciality && (
              <p className="text-xs text-red-600 mt-1">
                {errors.speciality.message}
              </p>
            )}
          </div>
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
