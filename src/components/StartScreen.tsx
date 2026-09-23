import { Box, Typography, Button } from "@mui/material";

interface StartScreenProps {
  onStart: () => void;
}

export function StartScreen({ onStart }: StartScreenProps) {
  return (
    <Box sx={startOverlayStyle}>
      <Typography variant="h3" component="h1" gutterBottom align="center">
        WELKOM BIJ <span style={{ color: "#D2A554" }}>'T WEERGORS</span>
      </Typography>
      <Typography
        variant="h6"
        sx={{ mb: 6 }}
        align="center"
        color="text.secondary"
      >
        Ontdek onze superleuke camping games
      </Typography>
      <Button
        variant="contained"
        color="primary"
        size="large"
        onClick={onStart}
        sx={{ px: 8, py: 2, fontSize: "1.2rem" }}
      >
        Start en Speel!
      </Button>
    </Box>
  );
}

const startOverlayStyle = {
  position: "fixed" as const,
  top: 0,
  left: 0,
  width: "100vw",
  height: "100vh",
  background: "#F9F6ED", // Crème achtergrond
  zIndex: 10000,
  display: "flex",
  flexDirection: "column" as const,
  alignItems: "center",
  justifyContent: "center",
  padding: 3,
};
