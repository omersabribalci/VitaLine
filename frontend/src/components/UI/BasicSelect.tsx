import Box from "@mui/material/Box";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import type { BasicSelectProps } from "../../types";
import { useId } from "react";

export default function BasicSelect({
  label,
  value,
  onChange,
  menuItems,
  className,
}: BasicSelectProps) {
  const id = useId();
  const labelId = `${id}-label`;

  return (
    <Box className={className} sx={{ width: "100%" }}>
      <FormControl size="small" variant="outlined" sx={{ width: "100%" }}>
        <InputLabel id={labelId}>{label}</InputLabel>
        <Select
          labelId={labelId}
          id={id}
          value={value ?? ""}
          label={label}
          onChange={onChange}
        >
          {menuItems?.map((item) => (
            <MenuItem key={item} value={item}>
              {item}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
}
