import type {
  FieldErrors,
  FieldValues,
  Path,
  RegisterOptions,
  UseFormRegister,
} from "react-hook-form";
import FormError from "./FormError";

export interface FormSelectProps<TFieldValues extends FieldValues> {
  label: string;
  name: string;
  options: readonly string[];
  register: UseFormRegister<TFieldValues>;
  rules?: RegisterOptions<TFieldValues>;
  errors?: FieldErrors<TFieldValues>;
  defaultValue?: string;
}

const FormSelect = <TFieldValues extends FieldValues>({
  label,
  name,
  options,
  register,
  rules,
  errors,
  defaultValue = "",
}: FormSelectProps<TFieldValues>) => {
  const fieldName = name as Path<TFieldValues>;

  return (
    <div>
      <select
        {...register(fieldName, rules)}
        className="bg-white border border-[#cfd8dc] rounded-md py-2 px-3 w-full placeholder:font-light focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400 transition-colors"
        defaultValue={defaultValue}
      >
        <option value="" disabled>
          {label}
        </option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      {errors?.[fieldName] && (
        <FormError message={errors[fieldName]?.message as string} />
      )}
    </div>
  );
};

export default FormSelect;
