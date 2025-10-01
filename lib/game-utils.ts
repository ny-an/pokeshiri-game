import { DAKUTEN_MAP, SMALL_TO_LARGE_KANA, TYPE_EMOJIS, TYPE_BG_COLORS, HIGH_SCORE_KEY, HISTORY_KEY } from "./constants"
import type { Pokemon, ChainItem } from "./types"

export function getLastChar(name: string): string {
  let lastChar = name.charAt(name.length - 1)

  if (lastChar === "ー") {
    let index = name.length - 2
    while (index >= 0) {
      const char = name.charAt(index)
      if (char !== "ー" && !isSmallKana(char)) {
        lastChar = char
        break
      }
      index--
    }
  }

  if (SMALL_TO_LARGE_KANA[lastChar]) {
    lastChar = SMALL_TO_LARGE_KANA[lastChar]
  }

  return lastChar
}

export function isSmallKana(char: string): boolean {
  const smallKana = [
    "ャ",
    "ュ",
    "ョ",
    "ァ",
    "ィ",
    "ゥ",
    "ェ",
    "ォ",
    "ッ",
    "ゃ",
    "ゅ",
    "ょ",
    "ぁ",
    "ぃ",
    "ぅ",
    "ぇ",
    "ぉ",
    "っ",
  ]
  return smallKana.includes(char)
}

export function checkShiritoriMatch(requiredChar: string, inputFirstChar: string): boolean {
  if (requiredChar === inputFirstChar) return true

  const variants = DAKUTEN_MAP[requiredChar]
  if (variants && variants.includes(inputFirstChar)) return true

  return false
}

export function checkTypeMatch(prevTypes: string[], currentTypes: string[]): boolean {
  return prevTypes.some((type) => currentTypes.includes(type))
}

export function hiraganaToKatakana(str: string): string {
  return str.replace(/[\u3041-\u3096]/g, (match) => {
    const chr = match.charCodeAt(0) + 0x60
    return String.fromCharCode(chr)
  })
}

export function getLastPokemon(chain: ChainItem[]): Pokemon | null {
  for (let i = chain.length - 1; i >= 0; i--) {
    if (chain[i].type === "pokemon") {
      return (chain[i] as { type: "pokemon"; pokemon: Pokemon; points: number }).pokemon
    }
  }
  return null
}

export function saveHighScore(newScore: number, currentHighScore: number): number {
  if (newScore > currentHighScore) {
    localStorage.setItem(HIGH_SCORE_KEY, newScore.toString())
    return newScore
  }
  return currentHighScore
}

export function savePokemonHistory(pokemonName: string, currentHistory: { [name: string]: number }): { [name: string]: number } {
  const newHistory = {
    ...currentHistory,
    [pokemonName]: (currentHistory[pokemonName] || 0) + 1,
  }
  localStorage.setItem(HISTORY_KEY, JSON.stringify(newHistory))
  return newHistory
}

export function getCharVariants(char: string): string {
  const variants = DAKUTEN_MAP[char]
  if (variants && variants.length > 1) {
    return variants.map((v) => `「${v}」`).join(" または ")
  }
  return `「${char}」`
}

export function getTypeEmoji(types: string[]): string {
  for (const type of types) {
    if (TYPE_EMOJIS[type]) {
      return TYPE_EMOJIS[type]
    }
  }
  return "✨"
}

export function getComboBackgroundColor(combo: number, chain: ChainItem[]): string {
  if (combo === 0) return "bg-background"

  const lastPokemon = getLastPokemon(chain)
  if (!lastPokemon) return "bg-background"

  for (const type of lastPokemon.types) {
    if (TYPE_BG_COLORS[type]) {
      return TYPE_BG_COLORS[type]
    }
  }
  return "bg-background"
}

export function getMaskedName(name: string): string {
  return "○".repeat(name.length)
}
