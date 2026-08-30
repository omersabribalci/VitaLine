import type { Patient } from "../../types";

const PatientDetails = ({ patient }: { patient: Patient }) => {
  return (
    <div className="w-full rounded-2xl bg-cardBg p-5 shadow-xl sm:p-6 min-w-xs">
      <div className="flex-1">
        <h1 className="text-2xl font-semibold">{patient.userId.name}</h1>

        <div className="mt-4 grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
          <div>
            <div className="text-xs text-gray-900">Email</div>
            <div className="text-gray-900">{patient.userId.email}</div>
          </div>

          <div>
            <div className="text-xs text-gray-900">Phone</div>
            <div className="text-gray-900">{patient.userId.phone}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientDetails;
