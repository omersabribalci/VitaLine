import Box from "@mui/material/Box";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import type { BasicSelectProps } from "../../types";

export default function BasicSelect({
  label,
  value,
  onChange,
  menuItems,
  className,
}: BasicSelectProps) {
  return (
    <Box className={className}>
      <FormControl size="small" variant="outlined" sx={{ width: "250px" }}>
        <InputLabel id="demo-simple-select-label">{label}</InputLabel>
        <Select
          labelId="demo-simple-select-label"
          id="demo-simple-select"
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
