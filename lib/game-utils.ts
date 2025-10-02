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

export function getComboBackgroundColor(combo: number, comboType: string | null): string {
  if (combo === 0 || !comboType) return "bg-background"

  if (TYPE_BG_COLORS[comboType]) {
    return TYPE_BG_COLORS[comboType]
  }
  return "bg-background"
}

export function getMaskedName(name: string): string {
  return "○".repeat(name.length)
}

// Gtagイベント送信関数
export function trackPokemonAnswer() {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'pokemon_answer')
  }
}

export function trackGameClear(score: number, chainLength: number) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'game_clear', {
      'score': score,
      'chain_length': chainLength
    })
  }
}

export function trackGameOver(score: number, chainLength: number) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'game_over', {
      'score': score,
      'chain_length': chainLength
    })
  }
}

// 図鑑進捗のマイルストーンをチェックする関数
export function checkProgressMilestone(currentProgress: number, previousProgress: number): number | null {
  // 最初は1%超えたら表示
  if (previousProgress <= 1 && currentProgress > 1) {
    return 1
  }
  
  // その後は5%刻みで表示
  const milestones = [5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 60, 70, 80, 90, 100]
  
  for (const milestone of milestones) {
    if (previousProgress < milestone && currentProgress >= milestone) {
      return milestone
    }
  }
  
  return null
}

// 表示すべき次のマイルストーンを取得する関数
export function getNextMilestoneToShow(currentProgress: number, lastShownMilestone: number): number | null {
  const milestones = [1, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100]
  
  // 現在の進捗に達している次の未表示のマイルストーンを探す
  for (const milestone of milestones) {
    if (milestone > lastShownMilestone && currentProgress >= milestone) {
      return milestone
    }
  }
  
  return null
}
