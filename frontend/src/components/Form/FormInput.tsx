import type { FormInputProps } from "../../types";



const FormInput = ({ type, placeholder, name, rules, register, errors }: FormInputProps) => {
  return (
    <div className="mb-4 w-full">
      <input
        className="bg-white border border-[#cfd8dc] rounded-lg py-2 px-3 w-full placeholder:font-light focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400 transition-colors"
        type={type}
        placeholder={placeholder}
        {...register(name, rules)}
        autoComplete="on"
      />
      {errors?.[name] && (
        <div className="text-red-500 text-xs font-medium mt-1 ml-1 animate-in fade-in slide-in-from-top-1">
          {errors[name]?.message as string}
        </div>
      )}
    </div>
  );
};

export default FormInput;
