import { Button, Typography } from "@mui/material";
import { toast } from "react-toastify";
import BookingPolicyFormSection from "../../components/Admin/BookingPolicyFormSection";
import {
  useGetBookingPolicyQuery,
  useUpdateBookingPolicyMutation,
} from "../../store/services/bookingPolicyApi";
import type { BookingPolicyForm } from "../../types";
import { extractErrorMessage } from "../../utils/extractErrorMessage";

const AdminManagement = () => {
  const {
    data: policy,
    isLoading,
    error,
    refetch,
  } = useGetBookingPolicyQuery();
  const [updatePolicy, { isLoading: isUpdating }] =
    useUpdateBookingPolicyMutation();

  const handleSubmit = async (formData: BookingPolicyForm) => {
    try {
      await updatePolicy({ ...formData }).unwrap();
      toast.success("Booking policy updated successfully.");
      refetch();
    } catch (err) {
      toast.error(extractErrorMessage(err, "Unable to update booking policy."));
    }
  };

  if (isLoading && !policy) {
    return (
      <div className="mx-auto w-full max-w-3xl rounded-2xl border border-white/20 bg-cardBg p-6 shadow-sm">
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          Loading booking policy…
        </Typography>
      </div>
    );
  }

  if (error && !policy) {
    return (
      <div className="mx-auto w-full max-w-3xl rounded-2xl border border-white/20 bg-cardBg p-6 shadow-sm">
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          Unable to load booking policy.
        </Typography>
        <Button onClick={() => refetch()} sx={{ mt: 2 }} variant="contained">
          Try again
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-4xl rounded-2xl border border-white/20 bg-cardBg p-4 shadow-sm sm:p-6">
      <BookingPolicyFormSection
        key={
          policy
            ? `${policy.slotDurationMinutes}-${policy.bookingWindowDays}-${policy.defaultStartHour}-${policy.defaultEndHour}`
            : "loading"
        }
        policy={policy ?? null}
        isUpdating={isUpdating}
        onSubmit={handleSubmit}
      />
    </div>
  );
};

export default AdminManagement;
