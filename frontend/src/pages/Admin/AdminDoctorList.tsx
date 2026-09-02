import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import InputAdornment from "@mui/material/InputAdornment";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import FilterAltOutlinedIcon from "@mui/icons-material/FilterAltOutlined";
import { useState } from "react";
import { useNavigate } from "react-router";
import { useGetDoctorsQuery } from "../../store/services/doctorApi";
import Loading from "../../components/UI/Loading";
import Error from "../../components/UI/Error";
import DoctorProfileCard from "../../components/Doctor/DoctorProfileCard";

const AdminDoctorList = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSpeciality, setSelectedSpeciality] = useState("all");
  const {
    data: allDoctors,
    isLoading: isAllDoctorsLoading,
    error: allDoctorsError,
    refetch: refetchAllDoctors,
    isFetching: isAllDoctorsFetching,
  } = useGetDoctorsQuery();

  const {
    data: doctors,
    isLoading,
    error,
    refetch,
    isFetching,
  } = useGetDoctorsQuery({
    search: searchTerm.trim() || undefined,
    speciality: selectedSpeciality === "all" ? undefined : selectedSpeciality,
    sort: "name",
  });

  const specialities = Array.from(
    new Set(allDoctors?.map((doctor) => doctor.speciality) ?? []),
  ).sort();

  if (isLoading || isAllDoctorsLoading) {
    return <Loading />;
  }

  if (error || allDoctorsError) {
    return (
      <Error
        refetch={() => {
          void refetch();
          void refetchAllDoctors();
        }}
        isFetching={isFetching || isAllDoctorsFetching}
      />
    );
  }

  if (allDoctors?.length === 0) {
    return (
      <div className="w-full max-w-6xl mx-auto bg-cardBg p-4 sm:p-6 rounded-2xl shadow-md">
        <p>There is no registered doctor.</p>
        <Button
          onClick={() => {
            navigate("/admin/addNewDoctor");
          }}
          variant="contained"
          color="success"
          sx={{ alignSelf: "flex-end", px: 1, py: 1, mt: 4 }}
        >
          <AddIcon className="border rounded-md mr-2"></AddIcon>
          Add New Doctor
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-4">
      <div className="grid grid-cols-1 gap-3 rounded-2xl border border-white/30 bg-white/20 p-3 shadow-sm md:grid-cols-[minmax(0,1fr)_220px_auto]">
        <TextField
          size="small"
          label="Search by name"
          autoComplete="off"
          value={searchTerm}
          onChange={(event) => {
            setSearchTerm(event.target.value);
          }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: "#475569", fontSize: 20 }} />
                </InputAdornment>
              ),
            },
          }}
          fullWidth
        />
        <TextField
          select
          size="small"
          label="Filter by speciality"
          value={selectedSpeciality}
          onChange={(event) => setSelectedSpeciality(event.target.value)}
          slotProps={{
            select: {
              startAdornment: (
                <InputAdornment position="start">
                  <FilterAltOutlinedIcon
                    sx={{ color: "#475569", fontSize: 19 }}
                  />
                </InputAdornment>
              ),
            },
          }}
          fullWidth
        >
          <MenuItem value="all">All specialities</MenuItem>
          {specialities.map((speciality) => (
            <MenuItem key={speciality} value={speciality}>
              {speciality}
            </MenuItem>
          ))}
        </TextField>
        <Button
          onClick={() => {
            navigate("/admin/addNewDoctor");
          }}
          variant="contained"
          color="success"
          startIcon={<AddIcon />}
          sx={{ minWidth: 170, px: 2 }}
        >
          Add New Doctor
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {doctors?.map((doctor) => (
          <DoctorProfileCard
            key={doctor._id}
            doctor={doctor}
            onOpen={() => navigate(`/admin/doctors/${doctor._id}`)}
          />
        ))}
      </div>

      {doctors?.length === 0 && (
        <div className="rounded-2xl border border-white/20 bg-cardBg p-6 text-center shadow-sm">
          <p className="font-medium text-slate-800">
            No doctors match your filters.
          </p>
          <p className="mt-1 text-sm text-slate-600">
            Try another name or speciality.
          </p>
        </div>
      )}
    </div>
  );
};

export default AdminDoctorList;
