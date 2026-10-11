import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
} from "@mui/material";

interface GameCardProps {
  title: string;
  description: string;
  onPlay: () => void;
}

export function GameCard({ title, description, onPlay }: GameCardProps) {
  return (
    <Card
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography variant="h5" component="h2" gutterBottom>
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {description}
        </Typography>
      </CardContent>
      <CardActions sx={{ p: 2 }}>
        <Button fullWidth variant="contained" color="primary" onClick={onPlay}>
          Speel Game
        </Button>
      </CardActions>
    </Card>
  );
}
