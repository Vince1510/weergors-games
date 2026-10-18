export interface GameItem {
  id: string;
  title: string;
  description: string;
  path: string;
  image: string;
  color: string;
  background: string;
}

export const GAMES: GameItem[] = [
  {
    id: "backpack-catcher",
    title: "Backpack Catcher",
    description:
      "Vang alle kampeerartikelen met de rugzak voor ze de grond raken!",
    path: "/games/backpack-catcher/index.html",
    image: "/games/backpack-catcher/assets/cardimg.png",
    color: "#e87948",
    background: "#fff0df",
  },
  {
    id: "Job de Kat: Camping Cross",
    title: "Job de Kat: Camping Cross",
    description: "Zorg ervoor dat Job veilig oversteekt",
    path: "/games/Camping-Cross/index.html",
    image: "/games/Camping-Cross/assets/cardimg.png",
    color: "#8b5cc7",
    background: "#f2eaff",
  },
  {
    id: "weergors-fishing",
    title: "Weergors Fishing",
    description: "Gooi je hengel uit en vang zeldzame vissen!",
    path: "/games/fishing/index.html",
    image: "/games/fishing/assets/cardimg.png",
    color: "#168d9b",
    background: "#e1f7f5",
  },
  {
    id: "bakery-rush",
    title: "Bakery Rush",
    description: "Bak de broodjes zo snel als je kan!",
    path: "/games/Bakery-Rush/index.html",
    image: "/games/Bakery-Rush/assets/cardimg.png",
    color: "#d28a27",
    background: "#fff4d6",
  },
];
