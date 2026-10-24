import { Modal, Box, IconButton, Typography, useMediaQuery } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ScreenRotationIcon from "@mui/icons-material/ScreenRotation";

interface GameModalProps {
  gamePath: string | null;
  requiresLandscape: boolean;
  onClose: () => void;
}

export function GameModal({
  gamePath,
  requiresLandscape,
  onClose,
}: GameModalProps) {
  const isPortrait = useMediaQuery("(orientation: portrait)", { noSsr: true });
  const shouldShowRotateOverlay = requiresLandscape && isPortrait;

  return (
    <Modal
      open={Boolean(gamePath)}
      onClose={onClose}
      sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}
    >
      <Box sx={fullscreenOverlayStyle}>
        <IconButton
          onClick={onClose}
          sx={closeButtonStyle}
          aria-label="sluiten"
        >
          <CloseIcon />
        </IconButton>

        {shouldShowRotateOverlay && (
          <Box sx={rotateOverlayStyle}>
            <ScreenRotationIcon sx={{ fontSize: 72, color: "#D2A554" }} />
            <Typography variant="h5" component="h2" sx={{ color: "#fff" }}>
              Draai je scherm
            </Typography>
            <Typography sx={{ color: "rgba(255, 255, 255, 0.8)" }}>
              Bakery Rush kan alleen liggend worden gespeeld.
            </Typography>
          </Box>
        )}

        {gamePath && !shouldShowRotateOverlay && (
          <iframe
            src={gamePath}
            title="Game Screen"
            allow="fullscreen; orientation-lock"
            allowFullScreen
            style={{ width: "100%", height: "100%", border: "none" }}
          />
        )}
      </Box>
    </Modal>
  );
}

const fullscreenOverlayStyle = {
  position: "absolute" as const,
  top: 0,
  left: 0,
  width: "100vw",
  height: "100vh",
  bgcolor: "#000",
  outline: "none",
};

const closeButtonStyle = {
  position: "absolute",
  top: 16,
  right: 16,
  zIndex: 9999,
  bgcolor: "rgba(255, 255, 255, 0.2)",
  color: "#fff",
  "&:active": {
    bgcolor: "rgba(255, 255, 255, 0.4)",
  },
};

const rotateOverlayStyle = {
  position: "absolute" as const,
  inset: 0,
  zIndex: 1,
  display: "flex",
  flexDirection: "column" as const,
  alignItems: "center",
  justifyContent: "center",
  gap: 2,
  px: 3,
  textAlign: "center" as const,
  bgcolor: "#163A42",
};
