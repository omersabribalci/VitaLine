import { Box } from "@mui/material";
import MedicationIcon from "@mui/icons-material/Medication";
import PersonalInjuryIcon from "@mui/icons-material/PersonalInjury";
import StackedBarChartOutlinedIcon from "@mui/icons-material/StackedBarChartOutlined";
import { PieChart } from "@mui/x-charts/PieChart";
import Error from "../../components/UI/Error";
import Loading from "../../components/UI/Loading";
import NoAppointments from "../../components/Statistic/NoAppointments";
import StatCard from "../../components/Statistic/StatCard";
import { useGetAdminStatisticsQuery } from "../../store/services/appointmentApi";

const AdminOverview = () => {
  const {
    data: statistics,
    isLoading,
    error,
    refetch,
    isFetching,
  } = useGetAdminStatisticsQuery();

  if (isLoading) return <Loading />;
  if (error) return <Error refetch={refetch} isFetching={isFetching} />;

  const appointmentTotal = statistics?.appointmentCount ?? 0;
  const statusData = [
    {
      id: 0,
      value: statistics?.statusCounts.completed ?? 0,
      label: "Completed",
      color: "#16a34a",
    },
    {
      id: 1,
      value: statistics?.statusCounts.cancelled ?? 0,
      label: "Cancelled",
      color: "#e11d48",
    },
    {
      id: 2,
      value: statistics?.statusCounts.scheduled ?? 0,
      label: "Scheduled",
      color: "#2563eb",
    },
  ];
  const topDoctors = [...(statistics?.appointmentsByDoctor ?? [])]
    .sort((a, b) => b.count - a.count)
    .slice(0, 3);
  const specialityData = [...(statistics?.appointmentsBySpeciality ?? [])]
    .sort((a, b) => b.count - a.count)
    .slice(0, 4);
  const highestDoctorCount = Math.max(
    ...topDoctors.map((doctor) => doctor.count),
    1,
  );
  const highestSpecialityCount = Math.max(
    ...specialityData.map((speciality) => speciality.count),
    1,
  );

  return (
    <main className="mx-auto w-full max-w-6xl space-y-4">
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <StatCard
          title="Registered doctors"
          parameter={statistics?.doctorCount ?? 0}
          icon={<MedicationIcon fontSize="large" />}
          description="Doctors currently registered in the clinic"
          iconClassName="bg-blue-100 text-blue-700"
        />
        <StatCard
          title="Registered patients"
          parameter={statistics?.patientCount ?? 0}
          icon={<PersonalInjuryIcon fontSize="large" />}
          description="Patients currently registered in the system"
          iconClassName="bg-emerald-100 text-emerald-700"
        />
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
        <div className="rounded-3xl border border-white/30 bg-cardBg p-4 shadow-sm sm:p-5">
          <p className="text-sm font-semibold text-blue-600">Appointments</p>
          <h1 className="mt-0.5 text-xl font-bold text-slate-900">
            Status distribution
          </h1>

          {appointmentTotal ? (
            <div className="mt-2 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-7">
              <Box sx={{ position: "relative", width: 230, height: 230 }}>
                <PieChart
                  series={[
                    {
                      data: statusData,
                      innerRadius: 68,
                      outerRadius: 98,
                      paddingAngle: 3,
                      cornerRadius: 8,
                    },
                  ]}
                  width={230}
                  height={230}
                  slotProps={{ legend: { sx: { display: "none" } } }}
                />
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-4xl font-bold text-slate-900">
                    {appointmentTotal}
                  </span>
                  <span className="text-xs font-semibold uppercase tracking-wide text-slate-700">
                    Total
                  </span>
                </div>
              </Box>

              <div className="w-full max-w-xs space-y-2">
                {statusData.map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center justify-between rounded-xl border border-white/50 bg-white/30 px-3.5 py-2.5"
                  >
                    <div className="flex items-center gap-2.5">
                      <span
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-sm font-semibold text-slate-800">
                        {item.label}
                      </span>
                    </div>
                    <span className="font-bold text-slate-900">
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <NoAppointments />
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-1">
          <div className="rounded-3xl border border-white/30 bg-cardBg p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">
              Workload
            </p>
            <h2 className="mt-0.5 text-lg font-bold text-slate-900">
              Top doctors
            </h2>

            {topDoctors.length ? (
              <div className="mt-3 space-y-3">
                {topDoctors.map((doctor, index) => (
                  <div key={doctor.doctorId}>
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-2">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-xs font-bold text-blue-700">
                          {index + 1}
                        </span>
                        <span className="truncate text-sm font-semibold text-slate-800">
                          {doctor.doctorName}
                        </span>
                      </div>
                      <span className="text-sm font-bold text-slate-900">
                        {doctor.count}
                      </span>
                    </div>
                    <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-200/70">
                      <div
                        className="h-full rounded-full bg-blue-500"
                        style={{
                          width: `${(doctor.count / highestDoctorCount) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-3 text-sm font-medium text-slate-700">
                No doctor activity yet.
              </p>
            )}
          </div>

          <div className="rounded-3xl border border-white/30 bg-cardBg p-4 shadow-sm">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-100 text-violet-700">
                <StackedBarChartOutlinedIcon fontSize="small" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-violet-700">
                  Services
                </p>
                <h2 className="text-lg font-bold text-slate-900">
                  By speciality
                </h2>
              </div>
            </div>

            {specialityData.length ? (
              <div className="mt-3 grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-1">
                {specialityData.map((item) => (
                  <div key={item.speciality}>
                    <div className="mb-1 flex items-center justify-between gap-3">
                      <span className="truncate text-sm font-semibold text-slate-800">
                        {item.speciality}
                      </span>
                      <span className="text-sm font-bold text-slate-900">
                        {item.count}
                      </span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-slate-200/70">
                      <div
                        className="h-full rounded-full bg-linear-to-r from-violet-500 to-blue-500"
                        style={{
                          width: `${(item.count / highestSpecialityCount) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-3 text-sm font-medium text-slate-700">
                No speciality activity yet.
              </p>
            )}
          </div>
        </div>
      </section>
    </main>
  );
};

export default AdminOverview;
