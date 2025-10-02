export type Pokemon = {
  name: string
  types: string[]
}

export type ChainItem =
  | { type: "pokemon"; pokemon: Pokemon; points: number }
  | { type: "pass"; fromChar: string; toChar: string; points: number }
  | { type: "duplicate"; pokemon: Pokemon; points: number }
  | { type: "hint"; pokemon: Pokemon; points: number }

export type GameState = "playing" | "finished" | "cleared"
export type GameMode = "single" | "timeattack"

export interface PersonalStats {
  totalGamesPlayed: number
  totalGameClears: number
  totalGameOvers: number
  totalAnswers: number
  clearRate: number
  averageAnswersPerGame: number
  singleModeGames: number
  timeattackModeGames: number
  bestSingleScore: number
  bestTimeattackScore: number
  longestChainSingle: number
  longestChainTimeattack: number
  maxComboSingle: number
  maxComboTimeattack: number
  firstPlayDate: string
  lastPlayDate: string
}

// Gtag用の型定義
declare global {
  interface Window {
    gtag: (
      command: 'config' | 'event' | 'js' | 'set',
      targetId: string | Date,
      config?: {
        [key: string]: any
      }
    ) => void
  }
}
