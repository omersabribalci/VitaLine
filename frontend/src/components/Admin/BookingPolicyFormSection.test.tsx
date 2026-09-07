import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { AvailabilityPolicy } from "../../types";
import BookingPolicyFormSection from "./BookingPolicyFormSection";

const policy: AvailabilityPolicy = {
  appointmentDurationMinutes: 30,
  bookingWindowDays: 30,
  workingTimeStart: "09:00",
  workingTimeEnd: "17:00",
  workingDays: [1, 2, 3, 4, 5],
  lunchBreakStart: "12:00",
  lunchBreakEnd: "13:00",
};

describe("BookingPolicyFormSection", () => {
  it("submits edited values and working days", async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    render(
      <BookingPolicyFormSection
        policy={policy}
        isUpdating={false}
        onSubmit={onSubmit}
      />,
    );

    const bookingWindow = screen.getByLabelText("Booking window (days)");
    await user.clear(bookingWindow);
    await user.type(bookingWindow, "45");
    await user.click(screen.getByText("Monday"));
    await user.click(screen.getByText("Saturday"));
    await user.click(screen.getByRole("button", { name: "Save policy" }));

    expect(onSubmit).toHaveBeenCalledWith({
      ...policy,
      bookingWindowDays: 45,
      workingDays: [2, 3, 4, 5, 6],
    });
  });

  it("prevents duplicate submissions while an update is running", () => {
    render(
      <BookingPolicyFormSection
        policy={policy}
        isUpdating={true}
        onSubmit={vi.fn()}
      />,
    );

    expect(screen.getByRole("button", { name: "Save policy" })).toBeDisabled();
  });
});
