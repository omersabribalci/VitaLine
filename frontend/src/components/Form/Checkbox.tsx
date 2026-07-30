import type { CheckboxProps } from "../../types";

const Checkbox = ({ value, register, label, property }: CheckboxProps) => {
  return (
    <label className="relative flex items-center cursor-pointer group mr-4">
      <input
        type="checkbox"
        value={value}
        {...register(property)}
        id={property}
        className="peer sr-only"
      />
      <div
        className="w-6 h-6 rounded-lg bg-white border-2 border-purple-500 transition-all duration-300 ease-in-out 
        peer-checked:bg-linear-to-br from-purple-500 to-pink-500 peer-checked:border-0 peer-checked:rotate-12 
        after:content-[''] after:absolute after:top-1/2 after:left-1/2 after:-translate-x-1/2 after:-translate-y-1/2 
        after:w-5 after:h-5 after:opacity-0 
        after:bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiNmZmZmZmYiIHN0cm9rZS13aWR0aD0iMyIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cG9seWxpbmUgcG9pbnRzPSIyMCA2IDkgMTcgNCAxMiI+PC9wb2x5bGluZT48L3N2Zz4=')] 
        after:bg-contain after:bg-no-repeat peer-checked:after:opacity-100 after:transition-opacity after:duration-300 
        hover:shadow-[0_0_15px_rgba(168,85,247,0.5)]"
      ></div>
      {label && (
        <span className="ml-3 text-sm font-medium text-gray-900">{label}</span>
      )}
    </label>
  );
};

export default Checkbox;
