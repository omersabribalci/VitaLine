import { Controller, useForm } from "react-hook-form";
import { useUpdateDoctorMutation } from "../../store/services/doctorApi";
import { useEffect, useState } from "react";
import { parseISO } from "date-fns";
import CustomDatePicker from "../UI/CustomDatePicker";
import Button from "@mui/material/Button";
import ConfirmationDialog from "../UI/ConfirmationDialog";
import { toast } from "react-toastify";
import type { Doctor, DoctorSetHolidayFormData } from "../../types";
import { extractErrorMessage } from "../../utils/extractErrorMessage";
import FormError from "../Form/FormError";

const DoctorSetHoliday = ({
  doctor,
  doctorId,
}: {
  doctor: Doctor;
  doctorId: string;
}) => {
  const [updateDoctor, { isLoading: isUpdating, error }] =
    useUpdateDoctorMutation();
  const [showCancelHolidayDialog, setShowCancelHolidayDialog] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<DoctorSetHolidayFormData>({
    mode: "onSubmit",
  });

  useEffect(() => {
    if (doctor) {
      reset({
        startDate: doctor.unavailableDates?.[0]?.start
          ? parseISO(doctor.unavailableDates[0].start)
          : null,
        endDate: doctor.unavailableDates?.[0]?.end
          ? parseISO(doctor.unavailableDates[0].end)
          : null,
      });
    }
  }, [doctor, reset]);

  const onSubmit = async (data: DoctorSetHolidayFormData) => {
    try {
      const id = doctorId;
      const payload = {
        id,
        unavailableDates: [
          {
            start: data.startDate,
            end: data.endDate,
          },
        ],
      };
      await updateDoctor(payload).unwrap();
      toast.success("Doctor holiday added successfully!");
    } catch (err) {
      toast.error(extractErrorMessage(err, "Unable to add doctor holiday."));
    }
  };

  const cancelHoliday = async () => {
    try {
      const id = doctorId;
      if (doctor.unavailableDates.length !== 0)
        await updateDoctor({
          id,
          unavailableDates: [],
        }).unwrap();
      toast.success("Doctor holiday removed successfully!");
      setShowCancelHolidayDialog(false);
    } catch (err) {
      toast.error(extractErrorMessage(err, "Unable to remove doctor holiday."));
    }
  };

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
      <h3 className="text-xl">Manage Holiday</h3>
      <p className="text-sm text-gray-700">
        Please pick the days you won’t be available for appointments. (End date
        will be first working day.)
      </p>
      <div className="grid w-full max-w-xl grid-cols-1 gap-3 md:grid-cols-2 md:gap-4">
        <div>
          <Controller
            name="startDate"
            control={control}
            defaultValue={null}
            rules={{ required: "Start date is required" }}
            render={({ field: { onChange, value } }) => (
              <CustomDatePicker
                label="Start Date"
                onChange={onChange}
                value={value}
              />
            )}
          />
          {errors?.startDate && (
            <div className="mt-1 ml-1">
              <FormError message={errors.startDate.message} />
            </div>
          )}
        </div>
        <div>
          <Controller
            name="endDate"
            control={control}
            defaultValue={null}
            rules={{
              required: "End date is required",
              validate: {
                checkEndDateIsBigger: (value: Date | null) => {
                  const startDate = getValues("startDate");
                  if (!startDate || !value) {
                    return "Both dates are required";
                  }
                  return (
                    startDate < value ||
                    "End Date must be later than Start Date."
                  );
                },
              },
            }}
            render={({ field: { onChange, value } }) => (
              <CustomDatePicker
                label="End Date"
                onChange={onChange}
                value={value}
              />
            )}
          />
          {errors?.endDate && (
            <div className="mt-1 ml-1">
              <FormError message={errors.endDate.message} />
            </div>
          )}
        </div>
      </div>
      <div className="w-full">
        {error && (
          <FormError
            message={extractErrorMessage(error, "Unable to update holiday.")}
          />
        )}
      </div>
      <div className="flex flex-row gap-2">
        <Button
          type="submit"
          variant="contained"
          color="success"
          loading={isUpdating || isSubmitting}
        >
          Save Changes
        </Button>
        <Button
          type="button"
          variant="contained"
          color="error"
          disabled={
            isUpdating || isSubmitting || doctor.unavailableDates.length === 0
          }
          onClick={() => setShowCancelHolidayDialog(true)}
        >
          Remove Holiday
        </Button>
      </div>

      <ConfirmationDialog
        open={showCancelHolidayDialog}
        onClose={() => setShowCancelHolidayDialog(false)}
        onConfirm={cancelHoliday}
        title="Cancel Holiday"
        message="Are you sure you want to cancel holiday settings?"
        confirmText="Remove Holiday"
        confirmColor="error"
        isLoading={isUpdating}
      />
    </form>
  );
};

export default DoctorSetHoliday;
