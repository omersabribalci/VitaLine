import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";
import FormInput from "../Form/FormInput";
import { specialities } from "../../data/specialities";
import Button from "@mui/material/Button";
import { useAddDoctorMutation } from "../../store/services/doctorApi";
import { addDoctorInputs } from "../../data/Inputs/doctorInputs";
import { toast } from "react-toastify";
import type { AddDoctorFormData } from "../../types";
import { extractErrorMessage } from "../../utils/extractErrorMessage";
import { doctorTitles } from "../../data/doctorTitles";

const AdminAddDoctorForm = () => {
  const [addDoctor, { isLoading: isAdding, error }] = useAddDoctorMutation();

  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AddDoctorFormData>({});

  const onSubmit = async (data: AddDoctorFormData) => {
    const newDoctor = {
      ...data,
      unavailableDates: [],
    };
    try {
      await addDoctor(newDoctor).unwrap();
      toast.success("Doctor registration completed ✅");
      reset();
      navigate("/admin/doctors");
    } catch {
      return;
    }
  };

  const errMsg = extractErrorMessage(error, "Adding failed");

  return (
    <div className="max-w-2xl mx-auto p-6 bg-cardBg rounded-2xl shadow-xl mt-8">
      <h2 className="text-xl font-semibold mb-4">Add New Doctor</h2>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-4"
        autoComplete="off"
      >
        <div className="grid grid-cols-2 gap-4">
          <div>
            <select
              {...register("title", {
                required: "Title is required",
              })}
              className="bg-white border border-[#cfd8dc] rounded-md py-2 px-3 w-full placeholder:font-light focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400 transition-colors"
              defaultValue=""
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
          {addDoctorInputs.map((input) => (
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
              defaultValue=""
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
        {error && <div className="text-red-500 mb-4 text-xs">{errMsg}</div>}
        <div className="flex items-center gap-3 pt-4">
          <Button
            type="submit"
            loading={isSubmitting || isAdding}
            variant="contained"
            color="success"
          >
            Add
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

export default AdminAddDoctorForm;
