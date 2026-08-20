import { useCallback } from "react";
import { format, getDay, parseISO } from "date-fns";
import { DATE_FORMAT, WEEKEND_DAYS } from "../data/appointmentConstants";
import type { Doctor } from "../types";

export const useDisableDateFunction = (selectedDoctor: Doctor | undefined) => {
  const disableDateFunction = useCallback(
    (date: Date) => {
      const day = getDay(date);
      if (WEEKEND_DAYS.includes(day)) {
        return true;
      }

      if (selectedDoctor?.unavailableDates) {
        const currentDateStr = format(date, DATE_FORMAT);

        return selectedDoctor.unavailableDates.some(
          (range: { start: string; end: string }) => {
            if (!range.start || !range.end) {
              return false;
            }

            const startDateStr = format(parseISO(range.start), DATE_FORMAT);
            const endDateStr = format(parseISO(range.end), DATE_FORMAT);

            return (
              currentDateStr >= startDateStr && currentDateStr < endDateStr
            );
          },
        );
      }

      return false;
    },
    [selectedDoctor],
  );

  return disableDateFunction;
};
