import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";
import FormInput from "../Form/FormInput";
import FormSelect from "../Form/FormSelect";
import Button from "@mui/material/Button";
import {
  useAddDoctorMutation,
  useGetDoctorCatalogQuery,
} from "../../store/services/doctorApi";
import { addDoctorInputs } from "../../data/Inputs/doctorInputs";
import { toast } from "react-toastify";
import type { AddDoctorFormData } from "../../types";
import { extractErrorMessage } from "../../utils/extractErrorMessage";
import FormError from "../Form/FormError";
import Loading from "../UI/Loading";
import Error from "../UI/Error";

const AdminAddDoctorForm = () => {
  const [addDoctor, { isLoading: isAdding, error }] = useAddDoctorMutation();
  const {
    data: catalog,
    isLoading: isCatalogLoading,
    error: catalogError,
    refetch: refetchCatalog,
    isFetching: isCatalogFetching,
  } = useGetDoctorCatalogQuery();

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

  if (isCatalogLoading) return <Loading />;
  if (catalogError) {
    return <Error refetch={refetchCatalog} isFetching={isCatalogFetching} />;
  }

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
            options={catalog?.titles ?? []}
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
            options={catalog?.specialities ?? []}
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
