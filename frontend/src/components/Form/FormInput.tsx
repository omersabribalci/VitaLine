import type { FormInputProps } from "../../types";
import type { FieldValues, Path } from "react-hook-form";

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
        <div className="text-red-500 text-xs font-medium mt-1 ml-1 animate-in fade-in slide-in-from-top-1">
          {errors[fieldName]?.message as string}
        </div>
      )}
    </div>
  );
};

export default FormInput;
