import EventBusyIcon from "@mui/icons-material/EventBusy";

const NoAppointments = () => {
  return (
    <div className="flex min-h-60 flex-col items-center justify-center gap-3 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/70 text-gray-500">
        <EventBusyIcon fontSize="large" />
      </div>
      <div>
        <p className="text-base font-semibold text-gray-800">
          There are no appointments yet.
        </p>
        <p className="mt-1 text-sm text-gray-600">
          Appointment statistics will appear here when one is booked.
        </p>
      </div>
    </div>
  );
};

export default NoAppointments;
