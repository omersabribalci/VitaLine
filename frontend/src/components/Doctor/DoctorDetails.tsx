import type { Doctor } from "../../types";

const DoctorDetails = ({ doctor }: { doctor: Doctor }) => {
  return (
    <div className="flex flex-wrap gap-4 max-w-6xl mx-auto p-6 bg-cardBg rounded-2xl shadow-xl items-center">
      <img
        src={doctor.image}
        alt={doctor.userId.name}
        className="w-14 h-14 rounded-full object-cover"
      />
      <div>
        <h1 className="text-lg font-semibold">
          {doctor.title} {doctor.userId.name}
        </h1>
        <p className="text-gray-700">{doctor.speciality}</p>
        <div className="flex flex-wrap gap-4 mt-1 text-gray-700">
          <span>{doctor.userId.email}</span>
          <span>{doctor.userId.phone}</span>
        </div>
      </div>
    </div>
  );
};

export default DoctorDetails;
