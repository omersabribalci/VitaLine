import type { AppointmentStatus } from "../../types";

const statusStyles: Record<AppointmentStatus, string> = {
  scheduled: "border-sky-300 bg-sky-50 text-sky-700",
  completed: "border-emerald-300 bg-emerald-50 text-emerald-700",
  cancelled: "border-rose-300 bg-rose-50 text-rose-700",
};

type AppointmentStatusBadgeProps = {
  status: AppointmentStatus;
};

const AppointmentStatusBadge = ({ status }: AppointmentStatusBadgeProps) => (
  <span
    className={`inline-flex rounded-md border px-2 py-1 text-xs font-semibold capitalize ${statusStyles[status]}`}
  >
    {status}
  </span>
);

export default AppointmentStatusBadge;
