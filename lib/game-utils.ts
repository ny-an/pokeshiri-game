import { DAKUTEN_MAP, SMALL_TO_LARGE_KANA, TYPE_EMOJIS, TYPE_BG_COLORS, HIGH_SCORE_KEY, HIGH_SCORE_TA_KEY, HISTORY_KEY, PERSONAL_STATS_KEY } from "./constants"
import type { Pokemon, ChainItem, GameMode, PersonalStats } from "./types"

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

export function saveHighScore(newScore: number, currentHighScore: number, gameMode: GameMode = "single"): number {
  if (newScore > currentHighScore) {
    const key = gameMode === 'timeattack' ? HIGH_SCORE_TA_KEY : HIGH_SCORE_KEY
    localStorage.setItem(key, newScore.toString())
    return newScore
  }
  return currentHighScore
}

export function loadHighScore(gameMode: GameMode = "single"): number {
  const key = gameMode === 'timeattack' ? HIGH_SCORE_TA_KEY : HIGH_SCORE_KEY
  const saved = localStorage.getItem(key)
  return saved ? parseInt(saved, 10) : 0
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
export function trackPokemonAnswer(pokemonName?: string) {
  if (typeof window !== 'undefined' && window.gtag) {
    const eventData: any = {}
    if (pokemonName) {
      eventData.pokemon_name = pokemonName
    }
    window.gtag('event', 'pokemon_answer', eventData)
  }
}

export function trackGameClear(score: number, chainLength: number, gameMode: GameMode = "single") {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'game_clear', {
      'score': score,
      'chain_length': chainLength,
      'game_mode': gameMode
    })
  }
}

export function trackGameOver(score: number, chainLength: number, gameMode: GameMode = "single") {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'game_over', {
      'score': score,
      'chain_length': chainLength,
      'game_mode': gameMode
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

// 個人統計を読み込む関数
export function loadPersonalStats(): PersonalStats {
  const saved = localStorage.getItem(PERSONAL_STATS_KEY)
  if (saved) {
    try {
      return JSON.parse(saved)
    } catch (error) {
      console.error("Failed to parse personal stats:", error)
    }
  }
  
  // デフォルトの統計データ
  return {
    totalGamesPlayed: 0,
    totalGameClears: 0,
    totalGameOvers: 0,
    totalAnswers: 0,
    clearRate: 0,
    averageAnswersPerGame: 0,
    singleModeGames: 0,
    timeattackModeGames: 0,
    bestSingleScore: 0,
    bestTimeattackScore: 0,
    longestChainSingle: 0,
    longestChainTimeattack: 0,
    firstPlayDate: new Date().toISOString(),
    lastPlayDate: new Date().toISOString()
  }
}

// 個人統計を保存する関数
export function savePersonalStats(stats: PersonalStats): void {
  localStorage.setItem(PERSONAL_STATS_KEY, JSON.stringify(stats))
}

// ゲーム開始時の統計更新
export function updateStatsOnGameStart(gameMode: GameMode): PersonalStats {
  const stats = loadPersonalStats()
  
  stats.totalGamesPlayed++
  if (gameMode === "single") {
    stats.singleModeGames++
  } else {
    stats.timeattackModeGames++
  }
  
  // 初回プレイ日を設定
  if (stats.totalGamesPlayed === 1) {
    stats.firstPlayDate = new Date().toISOString()
  }
  
  stats.lastPlayDate = new Date().toISOString()
  
  savePersonalStats(stats)
  return stats
}

// ゲーム終了時の統計更新
export function updateStatsOnGameEnd(
  gameMode: GameMode, 
  isCleared: boolean, 
  score: number, 
  chainLength: number, 
  totalAnswers: number
): PersonalStats {
  const stats = loadPersonalStats()
  
  stats.totalAnswers += totalAnswers
  
  if (isCleared) {
    stats.totalGameClears++
  } else {
    stats.totalGameOvers++
  }
  
  // 最高スコアと最長チェーンの更新
  if (gameMode === "single") {
    if (score > stats.bestSingleScore) {
      stats.bestSingleScore = score
    }
    if (chainLength > stats.longestChainSingle) {
      stats.longestChainSingle = chainLength
    }
  } else {
    if (score > stats.bestTimeattackScore) {
      stats.bestTimeattackScore = score
    }
    if (chainLength > stats.longestChainTimeattack) {
      stats.longestChainTimeattack = chainLength
    }
  }
  
  // 成功率と平均回答数の計算
  const totalGames = stats.totalGameClears + stats.totalGameOvers
  stats.clearRate = totalGames > 0 ? (stats.totalGameClears / totalGames) * 100 : 0
  stats.averageAnswersPerGame = totalGames > 0 ? stats.totalAnswers / totalGames : 0
  
  stats.lastPlayDate = new Date().toISOString()
  
  savePersonalStats(stats)
  return stats
}