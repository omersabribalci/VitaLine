import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import type { ResponsiveGridProps } from "../../types";

export default function ResponsiveGrid({
  array,
  onChange,
  value,
}: ResponsiveGridProps) {
  return (
    <Box sx={{ flexGrow: 1, marginTop: 2 }}>
      <ToggleButtonGroup
        value={value}
        exclusive
        onChange={onChange}
        sx={{ width: "100%" }}
      >
        <Grid
          container
          spacing={{ xs: 2, md: 4 }}
          columns={{ xs: 6, sm: 9, md: 12 }}
        >
          {array.map((slot, index) => (
            <Grid key={index}>
              <ToggleButton
                sx={{
                  bgcolor: "#fafafab8",
                  transition: "all 0.3s ease",
                  boxShadow: "0 3px 8px rgba(0,0,0,0.2)",
                  "&:hover": {
                    bgcolor: "#f0f0f0a7",
                  },
                  "&.Mui-selected": {
                    background: "linear-gradient(135deg, #4385ef, #6cc6f0)",
                    color: "#333",
                    boxShadow: "0 3px 8px rgba(0,0,0,0.2)",
                    transform: "scale(1.03)",
                  },
                }}
                value={slot.time}
                disabled={!slot.isAvailable}
              >
                {slot.time}
              </ToggleButton>
            </Grid>
          ))}
        </Grid>
      </ToggleButtonGroup>
    </Box>
  );
}
