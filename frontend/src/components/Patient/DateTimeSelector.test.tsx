import { render, screen } from "@testing-library/react";
import { useForm } from "react-hook-form";
import { describe, expect, it, vi } from "vitest";
import type { BookAppointmentFormData, DateTimeSelectorProps } from "../../types";
import { DateTimeSelector } from "./DateTimeSelector";

const selectedDate = new Date(2030, 0, 7);

const renderSelector = (
  overrides: Partial<Omit<DateTimeSelectorProps, "control" | "setValue">> = {},
) => {
  const props = {
    date: selectedDate,
    time: "09:00",
    maxDate: new Date(2030, 1, 7),
    shouldDisableDate: () => false,
    slots: [{ time: "09:00", isAvailable: true }],
    isAvailabilityLoading: false,
    hasAvailabilityError: false,
    refetchAvailability: vi.fn(),
    isAvailabilityFetching: false,
    isAdding: false,
    ...overrides,
  };

  const Harness = () => {
    const { control, setValue } = useForm<BookAppointmentFormData>({
      defaultValues: {
        date: props.date,
        time: props.time,
        doctorName: null,
        speciality: null,
      },
    });

    return (
      <form>
        <DateTimeSelector {...props} control={control} setValue={setValue} />
      </form>
    );
  };

  return render(<Harness />);
};

describe("DateTimeSelector", () => {
  it("enables booking when the backend slot is available", () => {
    renderSelector();

    expect(
      screen.getByRole("button", { name: "Book Appointment" }),
    ).toBeEnabled();
  });

  it("disables booking when the selected backend slot is unavailable", () => {
    renderSelector({ slots: [{ time: "09:00", isAvailable: false }] });

    expect(
      screen.getByRole("button", { name: "Book Appointment" }),
    ).toBeDisabled();
  });

  it("shows availability loading feedback after a date is selected", () => {
    renderSelector({
      time: null,
      slots: [],
      isAvailabilityLoading: true,
    });

    expect(screen.getByText("Loading available slots...")).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Book Appointment" }),
    ).not.toBeInTheDocument();
  });
});
