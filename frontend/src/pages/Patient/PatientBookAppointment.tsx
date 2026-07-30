import { specialities } from "../../data/specialities";
import { useGetDoctorsBySpecialityQuery } from "../../store/services/doctorApi";
import {
  useGetAppointmentsByDoctorIdQuery,
  useNewAppointmentMutation,
} from "../../store/services/appointmentApi";
import Loading from "../../components/UI/Loading";
import { useForm, useWatch } from "react-hook-form";
import SpecialityDoctorSelector from "../../components/Patient/SpecialityDoctorSelector";
import DateTimeSelector from "../../components/Patient/DateTimeSelector";
import { useDisableDateFunction } from "../../hooks/useDisableDateFunction";
import { useTimeBooking } from "../../hooks/useTimeBooking";
import { useAppointmentForm } from "../../hooks/useAppointmentForm";
import { appointmentTimes } from "../../data/appointmentConstants";
import { toast } from "react-toastify";
import type { BookAppointmentFormData, Doctor } from "../../types";

const PatientBookAppointment = () => {
  const { control, handleSubmit, setValue } =
    useForm<BookAppointmentFormData>();

  const speciality = useWatch({ control, name: "speciality" });
  const doctorName = useWatch({ control, name: "doctorName" });
  const date = useWatch({ control, name: "date" });
  const time = useWatch({ control, name: "time" });

  const {
    data: doctorsBySpeciality,
    isLoading,
    error,
  } = useGetDoctorsBySpecialityQuery(speciality, { skip: !speciality });

  const selectedDoctor = doctorsBySpeciality?.find(
    (doc: Doctor) => doc.name === doctorName,
  );
  const selectedDoctorId = selectedDoctor?.id;

  const { data: appointmentsByDoctorId } = useGetAppointmentsByDoctorIdQuery(
    selectedDoctorId,
    { skip: !selectedDoctorId },
  );

  const [newAppointment, { isLoading: isAdding }] = useNewAppointmentMutation();

  const disableDateFunction = useDisableDateFunction(selectedDoctor);
  const isTimeBooked = useTimeBooking(appointmentsByDoctorId, date);

  const onSubmit = useAppointmentForm(
    newAppointment,
    selectedDoctorId ?? "",
    selectedDoctor,
    doctorName ?? "",
    speciality ?? "",
  );

  const doctorNamesArray =
    doctorsBySpeciality?.map((doc: Doctor) => doc.name) || [];

  const handleFormSubmit = async (data: BookAppointmentFormData) => {
    const result = await onSubmit(data);
    if (result.success) {
      toast.success("Appointment booked successfully!");

      setValue("speciality", "");
      setValue("doctorName", "");
      setValue("date", null);
      setValue("time", null);
    }
  };

  const handleSpecialityChange = () => {
    setValue("doctorName", "");
    setValue("date", null);
    setValue("time", null);
  };

  const handleDoctorChange = () => {
    setValue("date", null);
    setValue("time", null);
  };

  if (isLoading)
    return (
      <div className="p-4 mt-4 max-w-xl mx-auto flex flex-col gap-4 bg-cardBg rounded-2xl shadow-xl">
        <Loading />
      </div>
    );
  if (error) return <div>Error</div>;

  return (
    <form
      className="p-4 mt-4 max-w-xl mx-auto flex flex-col gap-4 bg-cardBg rounded-2xl shadow-xl"
      onSubmit={handleSubmit(handleFormSubmit)}
    >
      <h2 className="text-2xl">Book an Appointment</h2>
      <hr className="border-t" />

      <SpecialityDoctorSelector
        control={control}
        specialities={specialities}
        speciality={speciality}
        doctorsBySpeciality={doctorsBySpeciality}
        isLoading={isLoading}
        onSpecialityChange={handleSpecialityChange}
        onDoctorChange={handleDoctorChange}
        doctorNamesArray={doctorNamesArray}
      />

      {selectedDoctor && (
        <DateTimeSelector
          control={control}
          date={date}
          time={time}
          setValue={setValue}
          appointmentTimes={appointmentTimes}
          isTimeBooked={isTimeBooked}
          disableDateFunction={disableDateFunction}
          selectedDoctor={selectedDoctor}
          isAdding={isAdding}
        />
      )}
    </form>
  );
};

export default PatientBookAppointment;
