import type { Appointment } from "../../types";
import { formatAppointmentDateTime } from "../../utils/appointmentUtils";
import AppointmentDetailSection from "./AppointmentDetailSection";

const AppointmentDetails = ({ appointment }: { appointment: Appointment }) => {
  return (
    <div className="bg-cardBg rounded-2xl shadow-xl p-6 my-4 min-w-xs">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <AppointmentDetailSection
          title="Patient Information"
          items={[
            {
              label: "Patient Name",
              value: appointment.patientId?.userId?.name ?? "Unknown patient",
            },
          ]}
        />

        <AppointmentDetailSection
          title="Doctor Information"
          items={[
            {
              label: "Doctor Name",
              value: appointment.doctorId
                ? `${appointment.doctorId.title} ${appointment.doctorId.userId?.name ?? "Unknown doctor"}`
                : "Unknown doctor",
            },
            {
              label: "Speciality",
              value: appointment.doctorId?.speciality ?? "Unknown speciality",
              strong: true,
            },
          ]}
        />

        <AppointmentDetailSection
          title="Appointment Details"
          items={[
            {
              label: "Date & Time",
              value: formatAppointmentDateTime(appointment.dateAndTime),
            },
            {
              label: "Status",
              value: appointment.status,
            },
          ]}
        />
      </div>
    </div>
  );
};

export default AppointmentDetails;
