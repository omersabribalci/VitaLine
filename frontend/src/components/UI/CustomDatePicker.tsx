import { DemoContainer } from "@mui/x-date-pickers/internals/demo";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { enGB } from "date-fns/locale";
import type { CustomDatePickerProps } from "../../types";

export default function CustomDatePicker({
  label,
  onChange,
  value,
  disablePast = true,
  maxDate,
  shouldDisableDate,
}: CustomDatePickerProps) {
  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={enGB}>
      <DemoContainer components={["DatePicker"]}>
        <DatePicker
          className="w-fit"
          label={label}
          onChange={onChange}
          value={value ?? null}
          disablePast={disablePast}
          maxDate={maxDate}
          shouldDisableDate={shouldDisableDate}
        />
      </DemoContainer>
    </LocalizationProvider>
  );
}
