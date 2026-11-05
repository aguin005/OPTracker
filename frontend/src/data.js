import { Waves, Sun, Zap, Ghost, Swords, Fish, Sparkles, Cake, Flame, Cpu, TreePine } from "lucide-react";

// Static reference data, this isn't part of your saved progress, it's just the
// real shape of the show. Episode numbers here are absolute, chronological
// numbers matching what actually aired, not arc-relative counts, so Wano
// really does start at 890 and Elbaf really does start at 1156.
//
// Elbaf is still airing as of this writing (through episode 1172), bump its
// `episodes` count as new ones release. `short` is the label on the voyage map.
export const ARCS = [
  { id: "east-blue", name: "East Blue", short: "East Blue", start: 1, episodes: 61, accent: "#2E86AB", textOn: "#FFF6DF", tagline: "Where the journey begins", icon: Waves },
  { id: "alabasta", name: "Alabasta", short: "Alabasta", start: 62, episodes: 74, accent: "#D4952B", textOn: "#2B1D0E", tagline: "A kingdom buried in sand", icon: Sun },
  { id: "skypiea", name: "Sky Island", short: "Sky Island", start: 136, episodes: 71, accent: "#7EC8E3", textOn: "#2B1D0E", tagline: "Up among the clouds", icon: Zap },
  { id: "water7", name: "Water Seven / Enies Lobby", short: "Water 7", start: 207, episodes: 119, accent: "#4A7A96", textOn: "#FFF6DF", tagline: "Storm the gates of justice", icon: Waves },
  { id: "thriller-bark", name: "Thriller Bark", short: "Thriller Bark", start: 326, episodes: 59, accent: "#6B4C7A", textOn: "#FFF6DF", tagline: "A haunted ghost ship", icon: Ghost },
  { id: "summit-war", name: "Summit War", short: "Summit War", start: 385, episodes: 132, accent: "#A62C2C", textOn: "#FFF6DF", tagline: "The war that changed everything", icon: Swords },
  { id: "fishman-island", name: "Fish-Man Island", short: "Fish-Man", start: 517, episodes: 58, accent: "#3D8B8B", textOn: "#FFF6DF", tagline: "Deep beneath the waves", icon: Fish },
  { id: "dressrosa", name: "Dressrosa Saga", short: "Dressrosa", start: 575, episodes: 172, accent: "#E0507A", textOn: "#FFF6DF", tagline: "Punk Hazard to a toy kingdom in chains", icon: Sparkles },
  { id: "whole-cake", name: "Whole Cake Island Saga", short: "Whole Cake", start: 747, episodes: 143, accent: "#E8A0BC", textOn: "#2B1D0E", tagline: "Zou, tea parties, and a world council", icon: Cake },
  { id: "wano", name: "Wano Country", short: "Wano", start: 890, episodes: 196, accent: "#B8342E", textOn: "#FFF6DF", tagline: "The land of samurai", icon: Flame },
  { id: "egghead", name: "Egghead", short: "Egghead", start: 1086, episodes: 70, accent: "#4FD1C5", textOn: "#2B1D0E", tagline: "The future arrives early", icon: Cpu },
  { id: "elbaf", name: "Elbaf", short: "Elbaf", start: 1156, episodes: 17, accent: "#8FBF5C", textOn: "#2B1D0E", tagline: "Land of the giants", icon: TreePine, current: true },
];

export const TOTAL_EPISODES = ARCS.reduce((sum, arc) => sum + arc.episodes, 0);
export const TOTAL_OMNIBUS = 38;
export const VOLUMES_PER_OMNIBUS = 3;

export function arcEpisodes(arc) {
  return Array.from({ length: arc.episodes }, (_, i) => arc.start + i);
}

export function omnibusVolumes(omnibusNumber) {
  const first = (omnibusNumber - 1) * VOLUMES_PER_OMNIBUS + 1;
  return Array.from({ length: VOLUMES_PER_OMNIBUS }, (_, i) => first + i);
}

// The poster's bounty runs from 1 million to 1 billion with overall progress.
export function bountyFor(progress) {
  return Math.round(progress * 999_000_000 + 1_000_000);
}

// Pirate ranks from the show, earned as overall progress grows.
export const RANKS = [
  { at: 0, title: "Rookie Pirate" },
  { at: 0.1, title: "Supernova" },
  { at: 0.3, title: "Warlord of the Sea" },
  { at: 0.6, title: "Emperor of the Sea" },
  { at: 1, title: "King of the Pirates" },
];

export function rankFor(progress) {
  let index = 0;
  RANKS.forEach((rank, i) => {
    if (progress >= rank.at) index = i;
  });
  return { ...RANKS[index], next: RANKS[index + 1] ?? null };
}
