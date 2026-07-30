import { useState } from "react";
import CustomDatePicker from "../UI/CustomDatePicker";
import { useGetAppointmentsByDoctorIdQuery } from "../../store/services/appointmentApi";
import Loading from "../UI/Loading";
import Error from "../UI/Error";
import { format } from "date-fns";
import DoctorNotAppointmentsFound from "./DoctorNotAppointmentsFound";
import DoctorAppointmentCard from "./DoctorAppointmentCard";
import type { Appointment } from "../../types";

const DoctorDailyAppointments = ({ id }: { id: string }) => {
  const {
    data: appointments,
    isLoading,
    error,
    refetch,
    isFetching,
  } = useGetAppointmentsByDoctorIdQuery(id);

  const [selectedDate, setSelectedDate] = useState(new Date());

  const handleChange = (e: Date | null) => {
    if (e) {
      setSelectedDate(e);
    }
  };

  if (isLoading) {
    return <Loading />;
  }

  if (error) {
    return <Error refetch={refetch} isFetching={isFetching} />;
  }

  const filteredAppointments = appointments?.filter((app: Appointment) => {
    const date = format(new Date(app.dateAndTime), "dd,MM,yyyy");
    const formattedSelectedDate = format(selectedDate, "dd,MM,yyyy");
    return date === formattedSelectedDate;
  });

  const sortedAppointmentsByTime = filteredAppointments?.sort(
    (a: Appointment, b: Appointment) =>
      new Date(a.dateAndTime).getTime() - new Date(b.dateAndTime).getTime(),
  );

  return (
    <div className="max-w-6xl mx-auto mt-4 p-6 bg-cardBg rounded-2xl shadow-xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4 pb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            Daily Appointments
          </h2>
          <p className="text-sm text-gray-700 mt-1">
            Your schedule for {format(selectedDate, "dd MMMM yyyy")}
          </p>
        </div>
        <div className="w-full sm:w-auto">
          <CustomDatePicker
            label="Select Date"
            value={selectedDate}
            onChange={handleChange}
            disablePast={false}
          />
        </div>
      </div>

      {sortedAppointmentsByTime?.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {sortedAppointmentsByTime.map((app: Appointment) => (
            <DoctorAppointmentCard key={app.id} appointment={app} />
          ))}
        </div>
      ) : (
        <DoctorNotAppointmentsFound />
      )}
    </div>
  );
};

export default DoctorDailyAppointments;
