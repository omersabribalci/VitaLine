import StatCard from "../../components/Statistic/StatCard";
import { useGetAdminStatisticsQuery } from "../../store/services/appointmentApi";
import MedicationIcon from "@mui/icons-material/Medication";
import PersonalInjuryIcon from "@mui/icons-material/PersonalInjury";
import BookmarksIcon from "@mui/icons-material/Bookmarks";
import { PieChart } from "@mui/x-charts/PieChart";
import { Box } from "@mui/material";
import Loading from "../../components/UI/Loading";
import Error from "../../components/UI/Error";
import NoAppointments from "../../components/Statistic/NoAppointments";

const AdminOverview = () => {
  const {
    data: statistics,
    isLoading,
    error,
    refetch,
    isFetching,
  } = useGetAdminStatisticsQuery();

  if (isLoading) {
    return <Loading />;
  }

  if (error) {
    return <Error refetch={refetch} isFetching={isFetching} />;
  }

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

  return (
    <main className="w-full max-w-6xl mx-auto space-y-5">
      <div className="flex flex-row flex-wrap justify-between gap-4 sm:gap-5 lg:gap-6 bg-white/20 p-4 sm:p-5 rounded-4xl">
        <StatCard
          title="Registered Doctor"
          parameter={statistics?.doctorCount ?? 0}
          icon={<MedicationIcon fontSize="large" />}
        />
        <StatCard
          title="Registered Patient"
          parameter={statistics?.patientCount ?? 0}
          icon={<PersonalInjuryIcon fontSize="large" />}
        />
        <StatCard
          title="Total Appointments"
          parameter={statistics?.appointmentCount ?? 0}
          icon={<BookmarksIcon fontSize="large" />}
        />
      </div>

      <div className="rounded-4xl bg-white/20 p-4 sm:p-5">
        <h2 className="text-xl font-bold">Appointment Statistics</h2>
        {appointmentTotal ? (
          <div className="mt-3 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-10">
            <Box sx={{ position: "relative", width: 260, height: 260 }}>
              <PieChart
                series={[
                  {
                    data: statusData,
                    innerRadius: 78,
                    outerRadius: 112,
                    paddingAngle: 3,
                    cornerRadius: 8,
                  },
                ]}
                width={260}
                height={260}
                slotProps={{ legend: { sx: { display: "none" } } }}
              />
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-bold text-slate-900">
                  {appointmentTotal}
                </span>
                <span className="text-sm font-medium text-slate-600">
                  Total appointments
                </span>
              </div>
            </Box>

            <div className="w-full max-w-xs space-y-3">
              {statusData.map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between rounded-xl bg-white/45 px-3 py-2"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm font-semibold text-slate-700">
                      {item.label}
                    </span>
                  </div>
                  <span className="text-lg font-bold text-slate-900">
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
    </main>
  );
};

export default AdminOverview;
