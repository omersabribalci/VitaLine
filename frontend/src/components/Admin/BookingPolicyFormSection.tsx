import { Box, Button, Chip, Stack, TextField, Typography } from "@mui/material";
import type { ReactNode } from "react";
import { useState } from "react";
import type { AvailabilityPolicy, BookingPolicyForm } from "../../types";
import { weekDays } from "../../utils/bookingPolicyUtils";

type BookingPolicyFormSectionProps = {
  policy?: AvailabilityPolicy | null;
  isUpdating: boolean;
  onSubmit: (formData: BookingPolicyForm) => void;
};

const FormFieldRow = ({ children }: { children: ReactNode }) => (
  <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
    {children}
  </Stack>
);

const BookingPolicyFormSection = ({
  policy,
  isUpdating,
  onSubmit,
}: BookingPolicyFormSectionProps) => {
  const [formData, setFormData] = useState<BookingPolicyForm>(
    policy as BookingPolicyForm,
  );

  const handleChange = (
    field: keyof BookingPolicyForm,
    value: string | number | number[] | null,
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleWorkDayToggle = (day: number) => {
    setFormData((prev) => {
      const nextDays = prev.workingDays.includes(day)
        ? prev.workingDays.filter((item) => item !== day)
        : [...prev.workingDays, day].sort((a, b) => a - b);

      return { ...prev, workingDays: nextDays };
    });
  };

  return (
    <Box component="section" sx={{ display: "grid", gap: 3 }}>
      <Box sx={{ borderBottom: "1px solid rgba(255,255,255,0.2)", pb: 1.5 }}>
        <Typography
          variant="h4"
          sx={{ fontWeight: 700, color: "text.primary" }}
        >
          Booking Policy
        </Typography>
      </Box>

      <FormFieldRow>
        <TextField
          label="Slot duration (minutes)"
          type="number"
          value={formData.appointmentDurationMinutes}
          onChange={(e) =>
            handleChange("appointmentDurationMinutes", Number(e.target.value))
          }
          fullWidth
        />
        <TextField
          label="Booking window (days)"
          type="number"
          value={formData.bookingWindowDays}
          onChange={(e) =>
            handleChange("bookingWindowDays", Number(e.target.value))
          }
          fullWidth
        />
      </FormFieldRow>

      <FormFieldRow>
        <TextField
          label="Start time"
          type="time"
          value={formData.workingTimeStart}
          onChange={(e) => handleChange("workingTimeStart", e.target.value)}
          fullWidth
        />
        <TextField
          label="End time"
          type="time"
          value={formData.workingTimeEnd}
          onChange={(e) => handleChange("workingTimeEnd", e.target.value)}
          fullWidth
        />
      </FormFieldRow>

      <FormFieldRow>
        <TextField
          label="Lunch break start"
          type="time"
          value={formData.lunchBreakStart ?? ""}
          onChange={(e) =>
            handleChange("lunchBreakStart", e.target.value || null)
          }
          fullWidth
        />
        <TextField
          label="Lunch break end"
          type="time"
          value={formData.lunchBreakEnd ?? ""}
          onChange={(e) =>
            handleChange("lunchBreakEnd", e.target.value || null)
          }
          fullWidth
        />
      </FormFieldRow>

      <Box>
        <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
          Working days
        </Typography>
        <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", gap: 1 }}>
          {weekDays.map((day) => {
            const selected = formData.workingDays.includes(day.value);
            return (
              <Chip
                key={day.value}
                label={day.label}
                clickable
                color={selected ? "primary" : "default"}
                variant={selected ? "filled" : "outlined"}
                onClick={() => handleWorkDayToggle(day.value)}
              />
            );
          })}
        </Stack>
      </Box>

      <Box sx={{ display: "flex", justifyContent: "flex-end", pt: 1 }}>
        <Button
          variant="contained"
          color="primary"
          onClick={() => onSubmit(formData)}
          disabled={isUpdating}
          size="large"
        >
          Save policy
        </Button>
      </Box>
    </Box>
  );
};

export default BookingPolicyFormSection;
