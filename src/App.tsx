import { useState, useRef } from "react";
import {
  ThemeProvider,
  createTheme,
  CssBaseline,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Modal,
  Box,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import VolumeUpIcon from "@mui/icons-material/VolumeUp";
import VolumeOffIcon from "@mui/icons-material/VolumeOff";

// Camping theme gebaseerd op screenshot, geoptimaliseerd voor mobiel/touch
const campingTheme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#163A42" }, // Donker teal
    secondary: { main: "#D2A554" }, // Goud/geel
    background: { default: "#F9F6ED", paper: "#ffffff" },
    text: { primary: "#231F20", secondary: "#555555" },
  },
  typography: {
    fontFamily: '"Outfit", "Inter", "Quicksand", "Roboto", sans-serif',
    h3: {
      fontWeight: 900,
      color: "#163A42",
      textTransform: "uppercase",
      letterSpacing: "0.02em",
    },
    h5: {
      fontWeight: 800,
      color: "#163A42",
    },
    h6: {
      fontWeight: 500,
      color: "#555555",
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: "50px",
          textTransform: "none",
          fontWeight: 800,
          padding: "14px 32px",
          transition: "transform 0.1s ease-in-out",
          "&:active": {
            transform: "scale(0.95)",
          },
          // Target contained primary knoppen hier op de officiële MUI-manier:
          "&.MuiButton-containedPrimary": {
            backgroundColor: "#D2A554",
            color: "#fff",
            boxShadow: "0 4px 14px rgba(210, 165, 84, 0.4)",
            "&:hover": {
              backgroundColor: "#c19443",
            },
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: "24px",
          boxShadow: "0 4px 20px rgba(22, 58, 66, 0.08)",
          border: "2px solid transparent",
          transition: "transform 0.1s ease-in-out, border-color 0.2s ease",
          "&:active": {
            transform: "scale(0.98)",
            borderColor: "#D2A554",
          },
        },
      },
    },
  },
});

// Lijst van games in je games/ map
const GAMES = [
  {
    id: "backpack-catcher",
    title: "Backpack Catcher",
    description:
      "Vang alle kampeerartikelen met de rugzak voor ze de grond raken!",
    path: "/games/backpack-catcher/index.html",
  },
  {
    id: "Job de Kat: Camping Cross",
    title: "Job de Kat: Camping Cross",
    description: "Zorg ervoor dat Job veilig oversteekt",
    path: "/games/Camping-Cross/index.html",
  },
  {
    id: "weergors-fishing",
    title: "Weergors Fishing",
    description: "Gooi je hengel uit en vang zeldzame vissen!",
    path: "/games/fishing/index.html",
  },
];

export default function App() {
  const [activeGamePath, setActiveGamePath] = useState<string | null>(null);
  const [hasStarted, setHasStarted] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Start het geluid zodra de gebruiker op de welkomst-overlay klikt
  const handleStartApp = () => {
    setHasStarted(true);

    const audio = new Audio("/audio/home-music.mp3");
    audio.loop = true; // Blijft herhalen als het is afgelopen
    audio.volume = 0.3; // Subtiel volume (30%)

    audio
      .play()
      .then(() => {
        audioRef.current = audio;
      })
      .catch((err) => {
        console.warn("Audio afspelen mislukt:", err);
      });
  };

  // Muziek aan/uit zetten via de knop
  const toggleMute = () => {
    if (!audioRef.current) return;

    if (isMuted) {
      audioRef.current.play();
      setIsMuted(false);
    } else {
      audioRef.current.pause();
      setIsMuted(true);
    }
  };

  // Open game en pauzeer eventueel de hoofdmenu-muziek
  const handleOpenGame = (path: string) => {
    if (audioRef.current && !isMuted) {
      audioRef.current.pause();
    }
    setActiveGamePath(path);
  };

  // Sluit game en hervat hoofdmenu-muziek
  const handleCloseGame = () => {
    setActiveGamePath(null);
    if (audioRef.current && !isMuted) {
      audioRef.current.play();
    }
  };

  return (
    <ThemeProvider theme={campingTheme}>
      <CssBaseline />

      {/* WELKOMST OVERLAY (Vraagt om de eerste klik voor audio-toestemming) */}
      {!hasStarted && (
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
            onClick={handleStartApp}
            sx={{ px: 8, py: 2, fontSize: "1.2rem" }}
          >
            Start en Speel!
          </Button>
        </Box>
      )}

      {/* HOOFDPAGINA */}
      <Container maxWidth="lg" sx={{ py: 6, position: "relative" }}>
        {/* Mute/Unmute knop rechtsboven */}
        {hasStarted && (
          <IconButton
            onClick={toggleMute}
            color="primary"
            sx={{ position: "absolute", top: 16, right: 16 }}
            aria-label="geluid dempen"
          >
            {isMuted ? (
              <VolumeOffIcon fontSize="large" />
            ) : (
              <VolumeUpIcon fontSize="large" />
            )}
          </IconButton>
        )}

        <Box sx={{ textAlign: "center", mb: 6, mt: 2 }}>
          <Typography variant="h3" component="h1" gutterBottom>
            WEERGORS <span style={{ color: "#D2A554" }}>GAMES</span>
          </Typography>
          <Typography variant="h6" color="text.secondary">
            Kies een game om te spelen
          </Typography>
        </Box>

        <Grid container spacing={3} sx={{ justifyContent: "center" }}>
          {GAMES.map((game) => (
            <Grid key={game.id} size={{ xs: 12, sm: 6, md: 4 }}>
              <Card
                sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h5" component="h2" gutterBottom>
                    {game.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {game.description}
                  </Typography>
                </CardContent>
                <CardActions sx={{ p: 2 }}>
                  <Button
                    fullWidth
                    variant="contained"
                    color="primary"
                    onClick={() => handleOpenGame(game.path)}
                  >
                    Speel Game
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Fullscreen Game Overlay (Modal + Iframe) */}
      <Modal
        open={Boolean(activeGamePath)}
        onClose={handleCloseGame}
        sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}
      >
        <Box sx={fullscreenOverlayStyle}>
          <IconButton
            onClick={handleCloseGame}
            sx={closeButtonStyle}
            aria-label="sluiten"
          >
            <CloseIcon />
          </IconButton>

          {activeGamePath && (
            <iframe
              src={activeGamePath}
              title="Game Screen"
              style={{ width: "100%", height: "100%", border: "none" }}
            />
          )}
        </Box>
      </Modal>
    </ThemeProvider>
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

// Styling voor het volledige scherm van de game
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
