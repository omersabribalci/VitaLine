import { Controller } from "react-hook-form";
import CustomDatePicker from "../UI/CustomDatePicker";
import ResponsiveGrid from "../UI/ResponsiveGrid";
import Button from "@mui/material/Button";
import { addDays } from "date-fns";
import { MAX_BOOKING_DAYS } from "../../data/appointmentConstants";
import type { DateTimeSelectorProps } from "../../types";

export const DateTimeSelector = ({
  control,
  date,
  time,
  setValue,
  appointmentTimes,
  isTimeBooked,
  disableDateFunction,
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
            maxDate={addDays(new Date(), MAX_BOOKING_DAYS)}
            shouldDisableDate={disableDateFunction}
          />
        )}
      />

      {date && (
        <Controller
          name="time"
          control={control}
          defaultValue={null}
          render={({ field }) => (
            <ResponsiveGrid
              {...field}
              className="max-w-md mx-auto mt-3"
              array={appointmentTimes}
              isTimeBooked={isTimeBooked}
            />
          )}
        />
      )}

      {date && time && (
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
