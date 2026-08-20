import type { StatCardProps } from "../../types";

const StatCard = <T,>({ icon, parameter, title }: StatCardProps<T>) => {
  return (
    <div className="card min-w-62.5 flex items-center gap-4">
      <div className="w-14 h-14 flex items-center justify-center rounded-xl bg-blue-100 text-blue-600">
        {icon}
      </div>

      <div className="flex flex-col">
        <h3 className="text-sm font-semibold mb-1">{title}</h3>
        <div>
          <span className="text-3xl font-bold text-gray-900">
            {parameter?.length ?? 0}
          </span>
        </div>
      </div>
    </div>
  );
};

export default StatCard;
