import { Switch } from "@mui/material";
import { useUpdatePatientMutation } from "../../store/services/patientApi";
import { toast } from "react-toastify";
import Loading from "../UI/Loading";
import Error from "../UI/Error";
import type { Patient } from "../../types";

const AdminManagePatient = ({ patient }: { patient: Patient }) => {
  const [updatePatient, { isLoading, error }] = useUpdatePatientMutation();

  const handleChange = async () => {
    try {
      const payload = {
        id: patient.id,
        accountStatus:
          patient.accountStatus === "enabled" ? "disabled" : "enabled",
      };

      await updatePatient(payload).unwrap();
      toast.success(`Patient account status updated successfully!`);
    } catch (err) {
      console.log(err);
    }
  };

  if (isLoading) {
    return <Loading />;
  }

  if (error) {
    return <Error />;
  }

  return (
    <div className="bg-cardBg rounded-2xl shadow-xl p-6 flex flex-col gap-6 min-w-xs">
      <h2>Manage Patient</h2>
      <div className="flex flex-row items-center gap-4">
        <span>Disable account</span>
        <Switch
          checked={patient.accountStatus === "disabled"}
          onChange={handleChange}
          slotProps={{ input: { "aria-label": "controlled" } }}
          color="error"
        />
      </div>
    </div>
  );
};

export default AdminManagePatient;
