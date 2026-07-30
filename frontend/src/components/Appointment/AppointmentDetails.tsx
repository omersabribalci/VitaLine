import type { Appointment } from "../../types";

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
        <div>
          <h3 className="text-lg font-semibold mb-4">Patient Information</h3>
          <div className="space-y-3 text-sm">
            <div>
              <div className="text-xs text-gray-700">Patient Name</div>
              <div className="text-gray-900 font-medium">
                {appointment.patientName}
              </div>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4">Doctor Information</h3>
          <div className="space-y-3 text-sm">
            <div>
              <div className="text-xs text-gray-700">Doctor Name</div>
              <div className="text-gray-900 font-medium">
                {appointment.doctorName}
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-700">Speciality</div>
              <div className="text-gray-900 font-semibold">
                {appointment.speciality}
              </div>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4">Appointment Details</h3>
          <div className="space-y-3 text-sm">
            <div>
              <div className="text-xs text-gray-700">Date & Time</div>
              <div className="text-gray-900 font-medium">
                {formatDateTime(appointment.dateAndTime)}
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-700">Status</div>
              <div className="text-gray-900 font-medium">
                {appointment.status}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppointmentDetails;
