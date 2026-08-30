import { Controller } from "react-hook-form";
import BasicSelect from "../UI/BasicSelect";
import type { SpecialityDoctorSelectorProps } from "../../types";

export const SpecialityDoctorSelector = ({
  control,
  specialities,
  speciality,
  doctorsBySpeciality,
  onSpecialityChange,
  onDoctorChange,
  doctorNamesArray,
}: SpecialityDoctorSelectorProps) => {
  return (
    <>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:items-start">
        <Controller
          name="speciality"
          control={control}
          defaultValue=""
          render={({ field }) => (
            <BasicSelect
              {...field}
              className="w-full"
              onChange={(e) => {
                field.onChange(e);
                onSpecialityChange();
              }}
              menuItems={specialities}
              label="Select Speciality"
            />
          )}
        />

        {speciality &&
          doctorsBySpeciality &&
          doctorsBySpeciality.length > 0 && (
            <Controller
              name="doctorName"
              control={control}
              defaultValue=""
              render={({ field }) => (
                <BasicSelect
                  {...field}
                  className="w-full"
                  onChange={(e) => {
                    field.onChange(e);
                    onDoctorChange();
                  }}
                  menuItems={doctorNamesArray}
                  label="Select Doctor"
                />
              )}
            />
          )}
      </div>

      {speciality && doctorsBySpeciality?.length === 0 && (
        <p className="text-center text-gray-500">
          No doctors found in this speciality.
        </p>
      )}
    </>
  );
};

export default SpecialityDoctorSelector;
