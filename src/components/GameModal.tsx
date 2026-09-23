import { Modal, Box, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

interface GameModalProps {
  gamePath: string | null;
  onClose: () => void;
}

export function GameModal({ gamePath, onClose }: GameModalProps) {
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

        {gamePath && (
          <iframe
            src={gamePath}
            title="Game Screen"
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
