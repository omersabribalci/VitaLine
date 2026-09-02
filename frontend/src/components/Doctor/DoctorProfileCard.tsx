import Avatar from "@mui/material/Avatar";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
import Button from "@mui/material/Button";
import type { Doctor } from "../../types";

type DoctorProfileCardProps = {
  doctor: Doctor;
  onOpen: () => void;
};

const DoctorProfileCard = ({ doctor, onOpen }: DoctorProfileCardProps) => {
  const doctorImage = doctor.userId.image?.trim() || "";

  return (
    <article className="group flex h-full flex-col rounded-2xl border border-white/30 bg-cardBg p-4 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-lg">
      <div className="flex items-start justify-between gap-3">
        <Avatar
          src={doctorImage || undefined}
          alt={doctor.userId.name}
          sx={{
            width: 54,
            height: 54,
            fontSize: 20,
            bgcolor: "#dbeafe",
            color: "#1d4ed8",
          }}
        >
          {!doctorImage && doctor.userId.name.charAt(0).toUpperCase()}
        </Avatar>
        <span className="max-w-[55%] truncate rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 text-[11px] font-medium text-blue-700">
          {doctor.speciality}
        </span>
      </div>

      <div className="mt-4 flex-1">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-600">
          {doctor.title}
        </p>
        <h2 className="mt-0.5 text-lg font-semibold text-slate-900">
          {doctor.userId.name}
        </h2>

        <div className="mt-4 space-y-1.5 text-sm text-slate-700">
          <div className="flex items-center gap-2">
            <EmailOutlinedIcon sx={{ fontSize: 17, color: "#475569" }} />
            <span className="truncate">{doctor.userId.email}</span>
          </div>
          <div className="flex items-center gap-2">
            <PhoneOutlinedIcon sx={{ fontSize: 17, color: "#475569" }} />
            <span>{doctor.userId.phone}</span>
          </div>
        </div>
      </div>

      <Button
        type="button"
        onClick={onOpen}
        endIcon={<ArrowForwardIcon />}
        sx={{
          mt: 3,
          alignSelf: "flex-start",
          textTransform: "none",
          color: "#1d4ed8",
          fontWeight: 600,
          px: 0,
          "&:hover": { backgroundColor: "transparent", color: "#1e40af" },
        }}
      >
        View profile
      </Button>
    </article>
  );
};

export default DoctorProfileCard;
