import type { StatCardProps } from "../../types";

const StatCard = ({
  icon,
  parameter,
  title,
  description,
  iconClassName = "bg-blue-100 text-blue-600",
}: StatCardProps) => {
  return (
    <article className="flex min-h-28 items-center gap-4 rounded-2xl border border-white/40 bg-cardBg p-4 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md sm:p-5">
      <div
        className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${iconClassName}`}
      >
        {icon}
      </div>

      <div className="min-w-0">
        <p className="text-sm font-semibold text-slate-800">{title}</p>
        <p className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
          {parameter}
        </p>
        {description && (
          <p className="mt-1 text-xs font-medium leading-5 text-slate-700">
            {description}
          </p>
        )}
      </div>
    </article>
  );
};

export default StatCard;
