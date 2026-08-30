import type { Appointment } from "../../types";
import AppointmentDetailSection from "./AppointmentDetailSection";

const AppointmentDetails = ({ appointment }: { appointment: Appointment }) => {
  const formatDateTime = (isoString: string) => {
    const date = new Date(isoString);
    return `${date.toLocaleDateString("tr-TR")} ${date.toLocaleTimeString(
      "tr-TR",
      { hour: "2-digit", minute: "2-digit" },
    )}`;
  };

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
              value: formatDateTime(appointment.dateAndTime),
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
