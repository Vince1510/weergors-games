import { useState, useRef } from "react";
import {
  ThemeProvider,
  CssBaseline,
  Container,
  Typography,
  Grid,
  Box,
  IconButton,
} from "@mui/material";
import VolumeUpIcon from "@mui/icons-material/VolumeUp";
import VolumeOffIcon from "@mui/icons-material/VolumeOff";

import { campingTheme } from "./theme/campingTheme";
import { GAMES } from "./data/games";
import { StartScreen } from "./components/StartScreen";
import { GameCard } from "./components/GameCard";
import { GameModal } from "./components/GameModal";

export default function App() {
  const [activeGamePath, setActiveGamePath] = useState<string | null>(null);
  const [hasStarted, setHasStarted] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handleStartApp = () => {
    setHasStarted(true);

    const audio = new Audio("/audio/home-music.mp3");
    audio.loop = true;
    audio.volume = 0.3;

    audio
      .play()
      .then(() => {
        audioRef.current = audio;
      })
      .catch((err) => {
        console.warn("Audio afspelen mislukt:", err);
      });
  };

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

  const handleOpenGame = (path: string) => {
    if (audioRef.current && !isMuted) {
      audioRef.current.pause();
    }
    setActiveGamePath(path);
  };

  const handleCloseGame = () => {
    setActiveGamePath(null);
    if (audioRef.current && !isMuted) {
      audioRef.current.play();
    }
  };

  return (
    <ThemeProvider theme={campingTheme}>
      <CssBaseline />

      {!hasStarted && <StartScreen onStart={handleStartApp} />}

      <Container maxWidth="lg" sx={{ py: 6, position: "relative" }}>
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
              <GameCard
                title={game.title}
                description={game.description}
                onPlay={() => handleOpenGame(game.path)}
              />
            </Grid>
          ))}
        </Grid>
      </Container>

      <GameModal gamePath={activeGamePath} onClose={handleCloseGame} />
    </ThemeProvider>
  );
}
