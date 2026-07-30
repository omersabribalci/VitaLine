import type { Patient } from "../../types";

const PatientDetails = ({ patient }: { patient: Patient }) => {
  return (
    <div className="bg-cardBg rounded-2xl shadow-xl p-6 flex gap-6 min-w-xs">
      <div className="flex-1">
        <h1 className="text-2xl font-semibold">{patient.name}</h1>

        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <div>
            <div className="text-xs text-gray-900">Email</div>
            <div className="text-gray-900">{patient.email}</div>
          </div>

          <div>
            <div className="text-xs text-gray-900">Phone</div>
            <div className="text-gray-900">{patient.phone}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientDetails;
