// House wallet configuration (Ethereum address)
export const HOUSE_WALLET_ADDRESS = "0x357a4b5d67D0b9aC1E44246ae36825E9bE91Ccb5"

// Game configuration
export const MIN_BET_AMOUNT = 0.0004 // ETH
export const WINNING_MULTIPLIER = 2.0

// Colour choices
export type ColourChoice = "red" | "green" | "blue" | "yellow" | "purple" | "orange" | "pink" | "cyan"

// Colour configuration
export const COLOURS = [
  {
    name: "red" as ColourChoice,
    icon: "Circle",
    bgColor: "bg-red-500",
    hoverColor: "hover:bg-red-600",
    textColor: "text-red-500",
    emoji: "🔴",
  },
  {
    name: "green" as ColourChoice,
    icon: "Circle",
    bgColor: "bg-green-500",
    hoverColor: "hover:bg-green-600",
    textColor: "text-green-500",
    emoji: "🟢",
  },
  {
    name: "blue" as ColourChoice,
    icon: "Circle",
    bgColor: "bg-blue-500",
    hoverColor: "hover:bg-blue-600",
    textColor: "text-blue-500",
    emoji: "🔵",
  },
  {
    name: "yellow" as ColourChoice,
    icon: "Circle",
    bgColor: "bg-yellow-500",
    hoverColor: "hover:bg-yellow-600",
    textColor: "text-yellow-500",
    emoji: "🟡",
  },
  {
    name: "purple" as ColourChoice,
    icon: "Circle",
    bgColor: "bg-purple-500",
    hoverColor: "hover:bg-purple-600",
    textColor: "text-purple-500",
    emoji: "🟣",
  },
  {
    name: "orange" as ColourChoice,
    icon: "Circle",
    bgColor: "bg-orange-500",
    hoverColor: "hover:bg-orange-600",
    textColor: "text-orange-500",
    emoji: "🟠",
  },
  {
    name: "pink" as ColourChoice,
    icon: "Circle",
    bgColor: "bg-pink-500",
    hoverColor: "hover:bg-pink-600",
    textColor: "text-pink-500",
    emoji: "🩷",
  },
  {
    name: "cyan" as ColourChoice,
    icon: "Circle",
    bgColor: "bg-cyan-500",
    hoverColor: "hover:bg-cyan-600",
    textColor: "text-cyan-500",
    emoji: "🩵",
  },
]

// Game result interface
export interface ColourGameResult {
  won: boolean
  playerChoice: ColourChoice
  actualResult: ColourChoice
  betAmount: number
  winAmount: number
  gameNumber: number
}

// Utility function to get random colour
export function getRandomColour(): ColourChoice {
  const colours: ColourChoice[] = ["red", "green", "blue", "yellow", "purple", "orange", "pink", "cyan"]
  return colours[Math.floor(Math.random() * colours.length)]
}
