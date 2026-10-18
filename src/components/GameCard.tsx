import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Box,
} from "@mui/material";

interface GameCardProps {
  title: string;
  description: string;
  image: string;
  color: string;
  background: string;
  index: number;
  onPlay: () => void;
}

export function GameCard({
  title,
  description,
  image,
  color,
  background,
  index,
  onPlay,
}: GameCardProps) {
  return (
    <Card
      sx={{
        position: "relative",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        background: `linear-gradient(155deg, #fff 20%, ${background} 100%)`,
        borderRadius: "26px",
        border: `2px solid ${color}22`,
        boxShadow: "0 8px 22px rgba(22, 58, 66, 0.09)",
        animation: `card-pop-in 520ms cubic-bezier(0.2, 0.8, 0.2, 1) both`,
        animationDelay: `${index * 100}ms`,
        transition:
          "transform 220ms ease, box-shadow 220ms ease, border-color 220ms ease",
        "@keyframes card-pop-in": {
          "0%": { opacity: 0, transform: "translateY(22px) scale(0.94)" },
          "100%": { opacity: 1, transform: "translateY(0) scale(1)" },
        },
        "&:hover": {
          transform: "translateY(-8px) rotate(-1deg)",
          borderColor: `${color}88`,
          boxShadow: `0 16px 30px ${color}30`,
          "& .game-card-image": {
            transform: "scale(1.025)",
          },
          "& .game-card-play": {
            transform: "scale(1.04)",
          },
        },
        "@media (prefers-reduced-motion: reduce)": {
          animation: "none",
          transition: "none",
          "&:hover": { transform: "none" },
        },
      }}
    >
      <Box
        sx={{
          position: "relative",
          height: 210,
          flexShrink: 0,
          overflow: "hidden",
          backgroundColor: background,
        }}
      >
        <Box
          component="img"
          src={image}
          alt=""
          aria-hidden="true"
          sx={{
            position: "absolute",
            inset: -12,
            width: "calc(100% + 24px)",
            height: "calc(100% + 24px)",
            objectFit: "cover",
            filter: "blur(12px)",
            opacity: 0.38,
          }}
        />
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            background: `linear-gradient(135deg, ${background}88, transparent)`,
          }}
        />
        <Box
          sx={{
            position: "relative",
            width: "100%",
            height: "100%",
            p: 1,
            boxSizing: "border-box",
          }}
        >
          <Box
            component="img"
            className="game-card-image"
            src={image}
            alt={`${title} spelvoorbeeld`}
            loading="lazy"
            sx={{
              display: "block",
              width: "100%",
              height: "100%",
              objectFit: "contain",
              filter: "drop-shadow(0 3px 7px rgba(22, 58, 66, 0.2))",
              transition: "transform 250ms ease",
            }}
          />
        </Box>
      </Box>
      <CardContent
        sx={{
          flexGrow: 1,
          px: 2.5,
          pt: 1.5,
          pb: 1,
          borderTop: `3px solid ${color}30`,
        }}
      >
        <Typography
          variant="h5"
          component="h2"
          gutterBottom
          sx={{ color, fontWeight: 900 }}
        >
          {title}
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ lineHeight: 1.6 }}
        >
          {description}
        </Typography>
      </CardContent>
      <CardActions sx={{ p: 2 }}>
        <Button
          className="game-card-play"
          fullWidth
          variant="contained"
          onClick={onPlay}
          sx={{
            borderRadius: "16px",
            backgroundColor: color,
            boxShadow: `0 4px 12px ${color}40`,
            transition: "transform 180ms ease, box-shadow 180ms ease",
            "&:hover": {
              backgroundColor: color,
              boxShadow: `0 7px 16px ${color}55`,
            },
          }}
        >
          Speel mee
        </Button>
      </CardActions>
    </Card>
  );
}
