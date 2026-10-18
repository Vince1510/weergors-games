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

      {hasStarted && (
        <>
          <Box
            component="svg"
            aria-hidden="true"
            viewBox="0 0 1440 900"
            preserveAspectRatio="xMidYMid slice"
            sx={{
              position: "fixed",
              inset: 0,
              zIndex: 0,
              width: "100%",
              height: "100%",
              pointerEvents: "none",
              opacity: 0.42,
            }}
          >
            <rect width="1440" height="900" fill="#e6f3e9" />
            <circle cx="1180" cy="170" r="72" fill="#f4d98b" />
            <path
              d="M0 465 Q190 345 390 455 T790 430 T1170 445 T1440 390 V900 H0Z"
              fill="#c4dfc2"
            />
            <path
              d="M0 540 Q240 400 500 515 T1000 490 T1440 510 V900 H0Z"
              fill="#a8cfae"
            />
            <g fill="#fff9e9" opacity="0.9">
              <path d="M210 208c0-20 17-36 38-36 12-25 49-25 61 0 25-5 47 13 47 36H210Z" />
              <path d="M780 260c0-16 14-29 31-29 10-20 40-20 50 0 20-4 38 11 38 29H780Z" />
            </g>
            <path
              d="M0 635 Q250 560 500 625 T1000 605 T1440 640 V900 H0Z"
              fill="#d3e4b5"
            />
            <g fill="#779e72">
              <path d="M125 635l60-142 60 142h-38l38 56H125l38-56Z" />
              <path d="M1140 650l48-114 48 114h-31l31 45h-96l31-45Z" />
              <path d="M1280 640l38-91 38 91h-24l24 37h-76l24-37Z" />
            </g>
            <g>
              <path d="M365 720l120-164 120 164Z" fill="#e8b77f" />
              <path d="M485 556l120 164H485Z" fill="#d89a67" />
              <path d="M485 720V610l-78 110Z" fill="#f6dfb4" />
              <path d="M775 715l104-136 104 136Z" fill="#dba879" />
              <path d="M879 579l104 136H879Z" fill="#c78e64" />
              <path d="M879 715V625l-62 90Z" fill="#f4deb6" />
            </g>
            <path d="M0 758 Q300 715 620 766 T1180 750 T1440 770 V900 H0Z" fill="#b4d49b" />
            <g fill="#88a878" opacity="0.85">
              <circle cx="275" cy="778" r="5" />
              <circle cx="320" cy="804" r="4" />
              <circle cx="688" cy="780" r="5" />
              <circle cx="1080" cy="800" r="4" />
              <circle cx="1325" cy="778" r="5" />
            </g>
          </Box>
          <Box
            component="img"
            src="/Leaf.png"
            alt=""
            aria-hidden="true"
            sx={{
              position: "fixed",
              zIndex: 1,
              pointerEvents: "none",
              top: -8,
              left: -8,
              width: { xs: 125, sm: 190, md: 240 },
              transformOrigin: "top left",
              animation: "leaf-sway 5s ease-in-out infinite",
              "@keyframes leaf-sway": {
                "0%, 100%": { transform: "rotate(0deg)" },
                "50%": { transform: "rotate(2deg)" },
              },
              "@media (prefers-reduced-motion: reduce)": {
                animation: "none",
              },
            }}
          />
          <Box
            component="img"
            src="/Birds.svg"
            alt=""
            aria-hidden="true"
            sx={{
              position: "fixed",
              zIndex: 1,
              pointerEvents: "none",
              top: { xs: 18, sm: 30 },
              right: { xs: 14, sm: 42 },
              width: { xs: 46, sm: 62 },
              height: "auto",
              animation: "birds-fly 4s ease-in-out infinite",
              "@keyframes birds-fly": {
                "0%, 100%": { transform: "translate(0, 0) rotate(-3deg)" },
                "50%": { transform: "translate(-8px, -7px) rotate(3deg)" },
              },
              "@media (prefers-reduced-motion: reduce)": {
                animation: "none",
              },
            }}
          />
        </>
      )}

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
          <Box
            component="img"
            src="/Logo.png"
            alt="'t Weergors"
            sx={{
              display: "block",
              width: { xs: 175, sm: 225 },
              height: "auto",
              mx: "auto",
              mb: 2,
            }}
          />
          <Typography variant="h3" component="h1" gutterBottom>
            KIES JE <span style={{ color: "#D2A554" }}>SPEL!</span>
          </Typography>
          <Typography variant="h6" color="text.secondary">
            Kies een game om te spelen
          </Typography>
        </Box>

        <Grid container spacing={3} sx={{ justifyContent: "center" }}>
          {GAMES.map((game, index) => (
            <Grid key={game.id} size={{ xs: 12, sm: 6, md: 4 }}>
              <GameCard
                title={game.title}
                description={game.description}
                image={game.image}
                color={game.color}
                background={game.background}
                index={index}
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
