import { Controller } from "react-hook-form";
import CustomDatePicker from "../UI/CustomDatePicker";
import ResponsiveGrid from "../UI/ResponsiveGrid";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import type { DateTimeSelectorProps } from "../../types";
import Error from "../UI/Error";

export const DateTimeSelector = ({
  control,
  date,
  time,
  setValue,
  maxDate,
  slots,
  isAvailabilityLoading,
  hasAvailabilityError,
  refetchAvailability,
  isAvailabilityFetching,
  isAdding,
}: DateTimeSelectorProps) => {
  const selectedSlot = slots.find((slot) => slot.time === time);
  const canSubmit =
    Boolean(date) &&
    Boolean(time) &&
    !hasAvailabilityError &&
    Boolean(selectedSlot?.isAvailable);

  return (
    <>
      <Controller
        name="date"
        control={control}
        defaultValue={null}
        render={({ field: { onChange, value } }) => (
          <CustomDatePicker
            label="Select Date"
            onChange={(val) => {
              onChange(val);
              setValue("time", null);
            }}
            value={value}
            maxDate={maxDate}
            disablePast={true}
          />
        )}
      />
      {date && (
        <Box sx={{ minHeight: 80 }}>
          {hasAvailabilityError ? (
            <Error
              refetch={refetchAvailability}
              isFetching={isAvailabilityFetching}
            />
          ) : isAvailabilityLoading ? (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                mt: 2,
                color: "text.secondary",
              }}
            >
              <CircularProgress size={18} />
              <Typography variant="body2">
                Loading available slots...
              </Typography>
            </Box>
          ) : slots.length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              No available slots for this day.
            </Typography>
          ) : (
            <Controller
              name="time"
              control={control}
              defaultValue={null}
              render={({ field }) => (
                <ResponsiveGrid
                  {...field}
                  className="max-w-md mx-auto mt-3"
                  array={slots}
                />
              )}
            />
          )}
        </Box>
      )}
      {date && time && (
        <Button
          type="submit"
          variant="contained"
          color="success"
          disabled={!canSubmit}
          loading={isAdding}
        >
          Book Appointment
        </Button>
      )}
    </>
  );
};

export default DateTimeSelector;
