import { format } from "date-fns";
import type { Appointment } from "../../types";

const DoctorAppointmentCard = ({
  appointment,
}: {
  appointment: Appointment;
}) => {
  return (
    <div className="flex gap-2 items-center justify-between py-3 px-4 bg-white/60 hover:bg-blue-50 rounded-full transition-all duration-200 hover:shadow-sm">
      <span className="flex items-center gap-1 text-sm font-medium text-blue-700">
        <svg
          className="w-3 h-3"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        {format(new Date(appointment.dateAndTime), "HH:mm")}
      </span>
      <span className="text-sm font-semibold text-gray-800 group-hover:text-blue-900 transition-colors">
        {appointment.patientId.userId.name}
      </span>
    </div>
  );
};

export default DoctorAppointmentCard;
