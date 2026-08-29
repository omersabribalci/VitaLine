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
import { useGetMyPatientProfileQuery } from "../../store/services/patientApi";
import Error from "../../components/UI/Error";
import { useNavigate } from "react-router";
import { extractErrorMessage } from "../../utils/extractErrorMessage";

const PatientBookAppointment = () => {
  const navigate = useNavigate();
  const {
    data: patient,
    isLoading: isPatLoading,
    error: patError,
    refetch: patRefetch,
    isFetching: isPatRefetching,
  } = useGetMyPatientProfileQuery();

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
    refetch,
    isFetching,
  } = useGetDoctorsBySpecialityQuery(speciality, { skip: !speciality });

  const selectedDoctor = doctorsBySpeciality?.find(
    (doc: Doctor) => doc.userId.name === doctorName,
  );
  const selectedDoctorId = selectedDoctor?._id;

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
    patient?._id,
  );

  const doctorNamesArray =
    doctorsBySpeciality?.map((doc: Doctor) => doc.userId.name) || [];

  const handleFormSubmit = async (data: BookAppointmentFormData) => {
    const result = await onSubmit(data);
    if (result.success) {
      toast.success("Appointment booked successfully!");
      navigate("/patient");
    } else {
      toast.error(
        extractErrorMessage(result.error, "Unable to book appointment."),
      );
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

  if (isPatLoading || isLoading)
    return (
      <div className="p-4 mt-4 max-w-xl mx-auto flex flex-col gap-4 bg-cardBg rounded-2xl shadow-xl">
        <Loading />
      </div>
    );

  if (patError) {
    return <Error refetch={patRefetch} isFetching={isPatRefetching} />;
  }

  if (error) {
    return <Error refetch={refetch} isFetching={isFetching} />;
  }

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
        <div className="flex items-center gap-3 rounded-xl border border-blue-100 bg-blue-50 p-3">
          {selectedDoctor.image ? (
            <img
              src={selectedDoctor.image}
              alt={`${selectedDoctor.title} ${selectedDoctor.userId.name}`}
              className="h-12 w-12 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-200 font-semibold text-blue-800">
              {selectedDoctor.userId.name.charAt(0)}
            </div>
          )}
          <div>
            <p className="text-xs font-medium text-blue-700">Selected doctor</p>
            <p className="font-semibold text-gray-900">
              {selectedDoctor.title} {selectedDoctor.userId.name}
            </p>
            <p className="text-sm text-gray-600">{selectedDoctor.speciality}</p>
          </div>
        </div>
      )}

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
