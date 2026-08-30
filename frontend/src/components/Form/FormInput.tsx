import type { FormInputProps } from "../../types";
import type { FieldValues, Path } from "react-hook-form";
import FormError from "./FormError";

const FormInput = <TFieldValues extends FieldValues>({
  type,
  placeholder,
  name,
  rules,
  register,
  errors,
}: FormInputProps<TFieldValues>) => {
  const fieldName = name as Path<TFieldValues>;

  return (
    <div className="mb-4 w-full">
      <input
        className="bg-white border border-[#cfd8dc] rounded-lg py-2 px-3 w-full placeholder:font-light focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400 transition-colors"
        type={type}
        placeholder={placeholder}
        {...register(fieldName, rules)}
        autoComplete="on"
      />
      {errors?.[fieldName] && (
        <FormError message={errors[fieldName]?.message as string} />
      )}
    </div>
  );
};

export default FormInput;
