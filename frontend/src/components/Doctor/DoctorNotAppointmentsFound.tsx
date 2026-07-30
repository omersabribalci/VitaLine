const DoctorNotAppointmentsFound = () => {
  return (
    <div className="flex flex-col items-center justify-center py-8 px-3 text-center bg-white/50 rounded-md border-dashed">
      <div className="bg-white/70 p-2 rounded-full mb-2">
        <svg
          className="w-5 h-5 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      </div>
      <h3 className="text-sm font-medium text-gray-900">No Appointments</h3>
      <p className="text-xs text-gray-500 mt-0.5">
        None scheduled for this date.
      </p>
    </div>
  );
};

export default DoctorNotAppointmentsFound;
