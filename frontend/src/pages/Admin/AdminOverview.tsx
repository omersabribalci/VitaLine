import StatCard from "../../components/Statistic/StatCard";
import { useGetAllAppointmentsQuery } from "../../store/services/appointmentApi";
import { useGetDoctorsQuery } from "../../store/services/doctorApi";
import { useGetPatientsQuery } from "../../store/services/patientApi";
import MedicationIcon from "@mui/icons-material/Medication";
import PersonalInjuryIcon from "@mui/icons-material/PersonalInjury";
import BookmarksIcon from "@mui/icons-material/Bookmarks";
import { PieChart } from "@mui/x-charts/PieChart";

const AdminOverview = () => {
  const { data: doctors } = useGetDoctorsQuery();
  const { data: patients } = useGetPatientsQuery();
  const { data: appointments } = useGetAllAppointmentsQuery();

  const completedAppointments = appointments?.filter(
    (app) => app.status === "completed",
  );

  const canceledAppointments = appointments?.filter(
    (app) => app.status === "cancelled",
  );

  const scheduledAppointments = appointments?.filter(
    (app) => app.status === "scheduled",
  );

  return (
    <main className="p-4 max-w-5xl mx-auto">
      <div className="flex flex-row flex-wrap justify-between gap-10 bg-white/20 p-5 rounded-4xl">
        <StatCard
          title="Registered Doctor"
          parameter={doctors}
          icon={<MedicationIcon fontSize="large" />}
        />
        <StatCard
          title="Registered Patient"
          parameter={patients}
          icon={<PersonalInjuryIcon fontSize="large" />}
        />
        <StatCard
          title="Total Appointments"
          parameter={appointments}
          icon={<BookmarksIcon fontSize="large" />}
        />
      </div>
      <div className="flex flex-col items-center gap-4 mt-5 bg-white/20 p-5 rounded-4xl">
        <h2 className="text-xl font-bold">Appointment Statistics</h2>
        <PieChart
          series={[
            {
              data: [
                {
                  id: 0,
                  value: completedAppointments?.length ?? 0,
                  label: "Completed",
                  color: "green",
                },
                {
                  id: 1,
                  value: canceledAppointments?.length ?? 0,
                  label: "Canceled",
                  color: "red",
                },
                {
                  id: 2,
                  value: scheduledAppointments?.length ?? 0,
                  label: "Scheduled",
                  color: "blue",
                },
              ],
              innerRadius: 30,
              outerRadius: 100,
              cornerRadius: 5,
              arcLabel: "value",
            },
          ]}
          width={200}
          height={200}
        />
      </div>
    </main>
  );
};

export default AdminOverview;
