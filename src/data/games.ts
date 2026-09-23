export interface GameItem {
  id: string;
  title: string;
  description: string;
  path: string;
}

export const GAMES: GameItem[] = [
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
