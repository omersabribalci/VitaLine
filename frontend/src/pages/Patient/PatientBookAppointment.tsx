import {
  useGetAvailableSpecialitiesQuery,
  useGetDoctorsBySpecialityQuery,
} from "../../store/services/doctorApi";
import {
  useNewAppointmentMutation,
  useGetAvailabilityQuery,
} from "../../store/services/appointmentApi";
import Loading from "../../components/UI/Loading";
import { useForm, useWatch } from "react-hook-form";
import SpecialityDoctorSelector from "../../components/Patient/SpecialityDoctorSelector";
import DateTimeSelector from "../../components/Patient/DateTimeSelector";
import { toast } from "react-toastify";
import { addDays, format } from "date-fns";
import type { BookAppointmentFormData, Doctor } from "../../types";
import { useGetMyPatientProfileQuery } from "../../store/services/patientApi";
import { useGetBookingPolicyQuery } from "../../store/services/bookingPolicyApi";
import Error from "../../components/UI/Error";
import { useNavigate } from "react-router";
import Avatar from "@mui/material/Avatar";
import { extractErrorMessage } from "../../utils/extractErrorMessage";
import { isAppointmentDateDisabled } from "../../utils/bookingPolicyUtils";
import {
  buildAppointmentObject,
  getClinicToday,
} from "../../utils/appointmentUtils";

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
  } = useGetDoctorsBySpecialityQuery(speciality ?? "", { skip: !speciality });

  const {
    data: availableSpecialities,
    isLoading: isSpecialitiesLoading,
    error: specialitiesError,
    refetch: refetchSpecialities,
    isFetching: isSpecialitiesFetching,
  } = useGetAvailableSpecialitiesQuery();

  const selectedDoctor = doctorsBySpeciality?.find(
    (doc: Doctor) => doc.userId.name === doctorName,
  );
  const selectedDoctorId = selectedDoctor?._id;

  // Backend availability endpoint'inin beklediği YYYY-MM-DD formatına dönüştürülür.
  // Local tarihi doğrudan formatlamak timezone kaymasını önler.
  const dateString = date ? format(date, "yyyy-MM-dd") : null;

  const {
    data: availabilityData,
    isLoading: isAvailabilityLoading,
    error: availabilityError,
    refetch: refetchAvailability,
    isFetching: isAvailabilityFetching,
  } = useGetAvailabilityQuery(
    { doctorId: selectedDoctorId!, date: dateString! },
    { skip: !selectedDoctorId || !dateString },
  );

  const {
    data: bookingPolicy,
    isLoading: isPolicyLoading,
    error: policyError,
    refetch: refetchPolicy,
    isFetching: isPolicyFetching,
  } = useGetBookingPolicyQuery();
  const clinicToday = getClinicToday();
  const maxBookingDate = bookingPolicy
    ? addDays(clinicToday, bookingPolicy.bookingWindowDays)
    : undefined;

  const shouldDisableDate = (day: Date) =>
    bookingPolicy && selectedDoctor
      ? isAppointmentDateDisabled(
          day,
          bookingPolicy,
          selectedDoctor.unavailableDates,
        )
      : true;

  const [newAppointment, { isLoading: isAdding }] = useNewAppointmentMutation();

  const doctorNamesArray =
    doctorsBySpeciality?.map((doc: Doctor) => doc.userId.name) || [];

  const handleFormSubmit = async (data: BookAppointmentFormData) => {
    try {
      const appointment = buildAppointmentObject(
        data,
        selectedDoctorId ?? "",
        patient?._id ?? "",
      );

      await newAppointment(appointment).unwrap();
      toast.success("Appointment booked successfully!");
      navigate("/patient/appointments");
    } catch (error) {
      toast.error(
        extractErrorMessage(error, "Unable to book appointment."),
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

  if (isPatLoading || isLoading || isPolicyLoading || isSpecialitiesLoading)
    return (
      <div className="mx-auto mt-4 flex w-full max-w-3xl flex-col gap-4 rounded-2xl bg-cardBg p-4 shadow-xl">
        <Loading />
      </div>
    );

  if (patError) {
    return <Error refetch={patRefetch} isFetching={isPatRefetching} error={patError} />;
  }

  if (error) {
    return <Error refetch={refetch} isFetching={isFetching} error={error} />;
  }

  if (specialitiesError) {
    return (
      <Error
        refetch={refetchSpecialities}
        isFetching={isSpecialitiesFetching}
        error={specialitiesError}
      />
    );
  }

  if (policyError) {
    return (
      <Error refetch={refetchPolicy} isFetching={isPolicyFetching} error={policyError} />
    );
  }

  return (
    <div className="mx-auto w-full max-w-3xl">
      <form
        className="mx-auto flex w-full flex-col gap-4 rounded-2xl border border-white/20 bg-cardBg p-4 shadow-sm sm:p-5"
        onSubmit={handleSubmit(handleFormSubmit)}
      >
        <h2 className="text-2xl font-semibold text-slate-800">
          Book an Appointment
        </h2>
        <hr className="border-t border-white/20" />

        <SpecialityDoctorSelector
          control={control}
          specialities={availableSpecialities ?? []}
          speciality={speciality}
          doctorsBySpeciality={doctorsBySpeciality}
          isLoading={isLoading}
          onSpecialityChange={handleSpecialityChange}
          onDoctorChange={handleDoctorChange}
          doctorNamesArray={doctorNamesArray}
        />

        {selectedDoctor && (
          <div className="flex items-center gap-3 rounded-xl bg-blue-50/30 p-3">
            <Avatar
              src={selectedDoctor.userId.image || undefined}
              alt={`${selectedDoctor.title} ${selectedDoctor.userId.name}`}
              sx={{
                width: 48,
                height: 48,
                bgcolor: "#dbeafe",
                color: "#1d4ed8",
              }}
            >
              {!selectedDoctor.userId.image &&
                selectedDoctor.userId.name.charAt(0).toUpperCase()}
            </Avatar>
            <div>
              <p className="text-xs font-medium text-blue-700">
                Selected doctor
              </p>
              <p className="font-semibold text-gray-900">
                {selectedDoctor.title} {selectedDoctor.userId.name}
              </p>
              <p className="text-sm text-gray-600">
                {selectedDoctor.speciality}
              </p>
            </div>
          </div>
        )}

        {selectedDoctor && (
          <DateTimeSelector
            control={control}
            date={date}
            time={time}
            setValue={setValue}
            minDate={clinicToday}
            maxDate={maxBookingDate}
            shouldDisableDate={shouldDisableDate}
            slots={availabilityData?.slots ?? []}
            isAvailabilityLoading={isAvailabilityLoading}
            hasAvailabilityError={Boolean(availabilityError)}
            availabilityError={availabilityError}
            refetchAvailability={refetchAvailability}
            isAvailabilityFetching={isAvailabilityFetching}
            isAdding={isAdding}
          />
        )}
      </form>
    </div>
  );
};

export default PatientBookAppointment;
