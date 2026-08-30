import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";
import FormInput from "../Form/FormInput";
import FormSelect from "../Form/FormSelect";
import { specialities } from "../../data/specialities";
import Button from "@mui/material/Button";
import { useAddDoctorMutation } from "../../store/services/doctorApi";
import { addDoctorInputs } from "../../data/Inputs/doctorInputs";
import { toast } from "react-toastify";
import type { AddDoctorFormData } from "../../types";
import { extractErrorMessage } from "../../utils/extractErrorMessage";
import { doctorTitles } from "../../data/doctorTitles";
import FormError from "../Form/FormError";

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
          <FormSelect
            label="Select title"
            name="title"
            options={doctorTitles}
            register={register}
            rules={{ required: "Title is required" }}
            errors={errors}
            defaultValue=""
          />
          {addDoctorInputs.map((input) => (
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
            options={specialities}
            register={register}
            rules={{ required: "Speciality is required" }}
            errors={errors}
            defaultValue=""
          />
        </div>
        {error && <FormError message={errMsg} className="mb-4" />}
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
