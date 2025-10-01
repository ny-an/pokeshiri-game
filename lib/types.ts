export type Pokemon = {
  name: string
  types: string[]
}

export type ChainItem =
  | { type: "pokemon"; pokemon: Pokemon; points: number }
  | { type: "pass"; fromChar: string; toChar: string; points: number }
  | { type: "duplicate"; pokemon: Pokemon; points: number }

export type GameState = "playing" | "finished" | "cleared"
