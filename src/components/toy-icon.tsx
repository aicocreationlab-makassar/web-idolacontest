import {
  Baby,
  Backpack,
  Bird,
  BookOpen,
  Bug,
  Cake,
  Camera,
  Candy,
  Cat,
  Check,
  Clock,
  Cloud,
  Coins,
  CreditCard,
  Crown,
  Droplets,
  FerrisWheel,
  Fish,
  Flag,
  Flower,
  Flower2,
  Gift,
  Heart,
  House,
  IceCreamCone,
  Leaf,
  Lollipop,
  Medal,
  Moon,
  Orbit,
  Palette,
  PartyPopper,
  Pencil,
  Popcorn,
  Puzzle,
  Rainbow,
  Ribbon,
  Rocket,
  Sailboat,
  Shell,
  Smile,
  Sparkle,
  Sparkles,
  Star,
  Sun,
  Tent,
  ThumbsUp,
  Trophy,
  Truck,
  Users,
  WandSparkles,
  Waves,
  Wind,
  type LucideIcon,
} from "lucide-react";

/** Cute glossy 3D icons that replace emoji everywhere on the site. */
export const toyIcons = {
  cloud: Cloud,
  star: Star,
  rainbow: Rainbow,
  balloon: PartyPopper,
  party: PartyPopper,
  sun: Sun,
  flower: Flower2,
  hibiscus: Flower,
  butterfly: Bug,
  kite: Wind,
  leaf: Leaf,
  lion: Cat,
  monkey: Smile,
  lollipop: Lollipop,
  candy: Candy,
  cupcake: Cake,
  unicorn: WandSparkles,
  fish: Fish,
  wave: Waves,
  shell: Shell,
  boat: Sailboat,
  rocket: Rocket,
  planet: Orbit,
  sparkle: Sparkle,
  sparkles: Sparkles,
  moon: Moon,
  ribbon: Ribbon,
  heart: Heart,
  bubbles: Droplets,
  gift: Gift,
  chick: Bird,
  tent: Tent,
  ferris: FerrisWheel,
  popcorn: Popcorn,
  icecream: IceCreamCone,
  crown: Crown,
  trophy: Trophy,
  medal: Medal,
  baby: Baby,
  kid: Smile,
  family: Users,
  home: House,
  camera: Camera,
  check: Check,
  card: CreditCard,
  clock: Clock,
  coins: Coins,
  palette: Palette,
  pencil: Pencil,
  book: BookOpen,
  puzzle: Puzzle,
  backpack: Backpack,
  flag: Flag,
  thumbs: ThumbsUp,
  truck: Truck,
} satisfies Record<string, LucideIcon>;

export type ToyIconName = keyof typeof toyIcons;
export const toyIconNames = Object.keys(toyIcons) as ToyIconName[];

export const toyTones = ["sky", "pink", "yellow", "mint", "purple", "peach", "red"] as const;
export type ToyTone = (typeof toyTones)[number];

const toneByName: Partial<Record<ToyIconName, ToyTone>> = {
  star: "yellow",
  sun: "yellow",
  crown: "yellow",
  trophy: "yellow",
  coins: "yellow",
  medal: "yellow",
  chick: "yellow",
  sparkle: "yellow",
  heart: "pink",
  ribbon: "pink",
  candy: "pink",
  lollipop: "pink",
  cupcake: "pink",
  hibiscus: "pink",
  gift: "pink",
  camera: "pink",
  baby: "peach",
  kid: "peach",
  family: "peach",
  popcorn: "peach",
  icecream: "peach",
  leaf: "mint",
  monkey: "mint",
  lion: "peach",
  check: "mint",
  flower: "mint",
  tent: "red",
  ferris: "red",
  balloon: "red",
  party: "red",
  flag: "red",
  unicorn: "purple",
  planet: "purple",
  rocket: "purple",
  moon: "purple",
  puzzle: "purple",
  book: "purple",
  palette: "purple",
  butterfly: "purple",
};

export function toneFor(name: string): ToyTone {
  const tone = toneByName[name as ToyIconName];
  if (tone) return tone;
  let hash = 0;
  for (const char of name) hash = (hash * 31 + char.charCodeAt(0)) % 997;
  return toyTones[hash % toyTones.length];
}

export function isToyIcon(name: string): name is ToyIconName {
  return name in toyIcons;
}

export function ToyIcon({
  name,
  tone,
  size = 44,
  className = "",
  label,
}: {
  name: string;
  tone?: ToyTone;
  size?: number;
  className?: string;
  /** Accessible label; decorative when omitted. */
  label?: string;
}) {
  const Icon = isToyIcon(name) ? toyIcons[name] : Star;
  return (
    <span
      className={`toy-icon ${className}`.trim()}
      data-tone={tone ?? toneFor(name)}
      style={{ "--ti-size": `${size}px` } as React.CSSProperties}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      <Icon />
    </span>
  );
}
