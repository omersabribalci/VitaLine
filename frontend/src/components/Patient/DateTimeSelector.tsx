import { Controller } from "react-hook-form";
import CustomDatePicker from "../UI/CustomDatePicker";
import ResponsiveGrid from "../UI/ResponsiveGrid";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import { addDays } from "date-fns";
import type { DateTimeSelectorProps } from "../../types";

export const DateTimeSelector = ({
  control,
  date,
  time,
  setValue,
  availableSlots,
  isAvailabilityLoading,
  isAdding,
}: DateTimeSelectorProps) => {
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
            // TODO: Remove disablePast and maxDate; date rules must be controlled by the backend.
            // maxDate backend'den gelen policy yoksa 30 gün default
            maxDate={addDays(new Date(), 30)}
            disablePast
          />
        )}
      />

      {date && (
        <Box sx={{ minHeight: 80 }}>
          {isAvailabilityLoading ? (
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
          ) : availableSlots.length === 0 ? (
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
                  // TODO: Disable slots according to the backend isAvailable value.
                  array={availableSlots}
                />
              )}
            />
          )}
        </Box>
      )}

      {date && time && (
        // TODO: Enable submit only when the selected slot is available according to the backend.
        <Button
          type="submit"
          variant="contained"
          color="success"
          loading={isAdding}
        >
          Book Appointment
        </Button>
      )}
    </>
  );
};

export default DateTimeSelector;
