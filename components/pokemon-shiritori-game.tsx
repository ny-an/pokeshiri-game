"use client"

import { useState, useEffect, useRef } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Sparkles, Zap, ArrowRight, RotateCcw, HelpCircle, Share2, Lightbulb, BookOpen } from "lucide-react"
import {
  loadPokemonData,
  getRandomPokemon,
  getPokemonByFirstChar,
  getAllPokemonSorted,
  type PokemonData,
} from "@/lib/pokemon-data"

type Pokemon = {
  name: string
  types: string[]
}

type ChainItem =
  | { type: "pokemon"; pokemon: Pokemon; points: number }
  | { type: "pass"; fromChar: string; toChar: string; points: number }
  | { type: "duplicate"; pokemon: Pokemon; points: number }

type GameState = "playing" | "finished" | "cleared"

const KATAKANA_LIST = [
  "ア",
  "イ",
  "ウ",
  "エ",
  "オ",
  "カ",
  "キ",
  "ク",
  "ケ",
  "コ",
  "サ",
  "シ",
  "ス",
  "セ",
  "ソ",
  "タ",
  "チ",
  "ツ",
  "テ",
  "ト",
  "ナ",
  "ニ",
  "ヌ",
  "ネ",
  "ノ",
  "ハ",
  "ヒ",
  "フ",
  "ヘ",
  "ホ",
  "マ",
  "ミ",
  "ム",
  "メ",
  "モ",
  "ヤ",
  "ユ",
  "ヨ",
  "ラ",
  "リ",
  "ル",
  "レ",
  "ロ",
  "ワ",
  "ヲ",
  "ガ",
  "ギ",
  "グ",
  "ゲ",
  "ゴ",
  "ザ",
  "ジ",
  "ズ",
  "ゼ",
  "ゾ",
  "ダ",
  "ヂ",
  "ヅ",
  "デ",
  "ド",
  "バ",
  "ビ",
  "ブ",
  "ベ",
  "ボ",
  "パ",
  "ピ",
  "プ",
  "ペ",
  "ポ",
]

const DAKUTEN_MAP: { [key: string]: string[] } = {
  カ: ["カ", "ガ"],
  ガ: ["カ", "ガ"],
  キ: ["キ", "ギ"],
  ギ: ["キ", "ギ"],
  ク: ["ク", "グ"],
  グ: ["ク", "グ"],
  ケ: ["ケ", "ゲ"],
  ゲ: ["ケ", "ゲ"],
  コ: ["コ", "ゴ"],
  ゴ: ["コ", "ゴ"],
  サ: ["サ", "ザ"],
  ザ: ["サ", "ザ"],
  シ: ["シ", "ジ"],
  ジ: ["シ", "ジ"],
  ス: ["ス", "ズ"],
  ズ: ["ス", "ズ"],
  セ: ["セ", "ゼ"],
  ゼ: ["セ", "ゼ"],
  ソ: ["ソ", "ゾ"],
  ゾ: ["ソ", "ゾ"],
  タ: ["タ", "ダ"],
  ダ: ["タ", "ダ"],
  チ: ["チ", "ヂ"],
  ヂ: ["チ", "ヂ"],
  ツ: ["ツ", "ヅ"],
  ヅ: ["ツ", "ヅ"],
  テ: ["テ", "デ"],
  デ: ["テ", "デ"],
  ト: ["ト", "ド"],
  ド: ["ト", "ド"],
  ハ: ["ハ", "バ", "パ"],
  バ: ["ハ", "バ", "パ"],
  パ: ["ハ", "バ", "パ"],
  ヒ: ["ヒ", "ビ", "ピ"],
  ビ: ["ヒ", "ビ", "ピ"],
  ピ: ["ヒ", "ビ", "ピ"],
  フ: ["フ", "ブ", "プ"],
  ブ: ["フ", "ブ", "プ"],
  プ: ["フ", "ブ", "プ"],
  ヘ: ["ヘ", "ベ", "ペ"],
  ベ: ["ヘ", "ベ", "ペ"],
  ペ: ["ヘ", "ベ", "ペ"],
  ホ: ["ホ", "ボ", "ポ"],
  ボ: ["ホ", "ボ", "ポ"],
  ポ: ["ホ", "ボ", "ポ"],
}

const SMALL_TO_LARGE_KANA: { [key: string]: string } = {
  ゃ: "ヤ",
  ゅ: "ユ",
  よ: "ヨ",
  ャ: "ヤ",
  ュ: "ユ",
  ョ: "ヨ",
  っ: "ツ",
  ッ: "ツ",
  ぁ: "ア",
  ァ: "ア",
  ぃ: "イ",
  ィ: "イ",
  ぅ: "ウ",
  ゥ: "ウ",
  ぇ: "エ",
  ェ: "エ",
  ぉ: "オ",
  ォ: "オ",
  ゎ: "ワ",
  ヮ: "ワ",
}

const TYPE_EMOJIS: { [key: string]: string } = {
  ノーマル: "⚪",
  ほのお: "🔥",
  みず: "💧",
  でんき: "⚡",
  くさ: "🌿",
  こおり: "❄️",
  かくとう: "👊",
  どく: "☠️",
  じめん: "🌍",
  ひこう: "🕊️",
  エスパー: "🔮",
  むし: "🐛",
  いわ: "🪨",
  ゴースト: "👻",
  ドラゴン: "🐉",
  あく: "🌙",
  はがね: "⚙️",
  フェアリー: "🧚",
}

const TYPE_BG_COLORS: { [key: string]: string } = {
  ノーマル: "bg-gray-100",
  ほのお: "bg-orange-100",
  みず: "bg-blue-100",
  でんき: "bg-yellow-100",
  くさ: "bg-green-100",
  こおり: "bg-cyan-100",
  かくとう: "bg-red-100",
  どく: "bg-purple-100",
  じめん: "bg-amber-100",
  ひこう: "bg-sky-100",
  エスパー: "bg-pink-100",
  むし: "bg-lime-100",
  いわ: "bg-stone-100",
  ゴースト: "bg-indigo-100",
  ドラゴン: "bg-violet-100",
  あく: "bg-slate-100",
  はがね: "bg-zinc-100",
  フェアリー: "bg-rose-100",
}

const HIGH_SCORE_KEY = "pokemon-shiritori-high-score"
const HISTORY_KEY = "pokemon-shiritori-history"

const RESTRICTED_POKEMON = ["ロトム", "オドリドリ", "ミノマダム"]

export function PokemonShiritoriGame() {
  const [pokemonDatabase, setPokemonDatabase] = useState<Map<string, PokemonData>>(new Map())
  const [isLoading, setIsLoading] = useState(true)

  const [gameState, setGameState] = useState<GameState>("playing")
  const [startPokemon, setStartPokemon] = useState<Pokemon | null>(null)
  const [goalPokemon, setGoalPokemon] = useState<Pokemon | null>(null)
  const [chain, setChain] = useState<ChainItem[]>([])
  const [currentInput, setCurrentInput] = useState("")
  const [score, setScore] = useState(0)
  const [highScore, setHighScore] = useState(0)
  const [combo, setCombo] = useState(0)
  const [maxCombo, setMaxCombo] = useState(0)
  const [passesLeft, setPassesLeft] = useState(3)
  const [message, setMessage] = useState("")
  const [usedNames, setUsedNames] = useState<Set<string>>(new Set())
  const [nextChar, setNextChar] = useState("")
  const [isAnimating, setIsAnimating] = useState(false)
  const [showRules, setShowRules] = useState(true)
  const [usedHint, setUsedHint] = useState(false)
  const [showEndConfirm, setShowEndConfirm] = useState(false)
  const chainEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const [scoreKey, setScoreKey] = useState(0)
  const [comboKey, setComboKey] = useState(0)
  const [passesKey, setPassesKey] = useState(0)
  const [showResultModal, setShowResultModal] = useState(false)

  const [pokemonHistory, setPokemonHistory] = useState<{ [name: string]: number }>({})
  const [showPokedex, setShowPokedex] = useState(false)
  const [showDeveloperInfo, setShowDeveloperInfo] = useState(false)

  useEffect(() => {
    const savedHighScore = localStorage.getItem(HIGH_SCORE_KEY)
    if (savedHighScore) {
      setHighScore(Number.parseInt(savedHighScore, 10))
    }

    const savedHistory = localStorage.getItem(HISTORY_KEY)
    if (savedHistory) {
      try {
        setPokemonHistory(JSON.parse(savedHistory))
      } catch (error) {
        console.error("[v0] Failed to load Pokemon history:", error)
      }
    }
  }, [])

  useEffect(() => {
    loadPokemonData().then((data) => {
      setPokemonDatabase(data)
      const start = getRandomPokemon(data, (pokemon) => {
        const lastChar = pokemon.name.charAt(pokemon.name.length - 1)
        return lastChar !== "ン"
      })
      const goal = getRandomPokemon(data)

      if (start && goal) {
        const startPoke: Pokemon = {
          name: start.name,
          types: start.type2 ? [start.type1, start.type2] : [start.type1],
        }
        const goalPoke: Pokemon = {
          name: goal.name,
          types: goal.type2 ? [goal.type1, goal.type2] : [goal.type1],
        }
        setStartPokemon(startPoke)
        setGoalPokemon(goalPoke)
        setChain([{ type: "pokemon", pokemon: startPoke, points: 0 }])
        setUsedNames(new Set([start.name]))
        setNextChar(getLastChar(start.name))
      }

      setIsLoading(false)
    })
  }, [])

  useEffect(() => {
    if (chainEndRef.current) {
      chainEndRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" })
    }
  }, [chain])

  function getLastChar(name: string): string {
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

  function isSmallKana(char: string): boolean {
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

  function checkShiritoriMatch(requiredChar: string, inputFirstChar: string): boolean {
    if (requiredChar === inputFirstChar) return true

    const variants = DAKUTEN_MAP[requiredChar]
    if (variants && variants.includes(inputFirstChar)) return true

    return false
  }

  const getRandomChar = () => {
    const randomIndex = Math.floor(Math.random() * KATAKANA_LIST.length)
    return KATAKANA_LIST[randomIndex]
  }

  const checkTypeMatch = (prevTypes: string[], currentTypes: string[]) => {
    return prevTypes.some((type) => currentTypes.includes(type))
  }

  function hiraganaToKatakana(str: string): string {
    return str.replace(/[\u3041-\u3096]/g, (match) => {
      const chr = match.charCodeAt(0) + 0x60
      return String.fromCharCode(chr)
    })
  }

  function getLastPokemon(): Pokemon | null {
    for (let i = chain.length - 1; i >= 0; i--) {
      if (chain[i].type === "pokemon") {
        return chain[i].pokemon
      }
    }
    return null
  }

  function saveHighScore(newScore: number) {
    if (newScore > highScore) {
      setHighScore(newScore)
      localStorage.setItem(HIGH_SCORE_KEY, newScore.toString())
    }
  }

  function savePokemonHistory(pokemonName: string) {
    setPokemonHistory((prev) => {
      const newHistory = {
        ...prev,
        [pokemonName]: (prev[pokemonName] || 0) + 1,
      }
      localStorage.setItem(HISTORY_KEY, JSON.stringify(newHistory))
      return newHistory
    })
  }

  const handleSubmit = () => {
    if (!currentInput.trim() || isAnimating) return

    setMessage("")

    const inputKatakana = hiraganaToKatakana(currentInput.trim())

    if (RESTRICTED_POKEMON.includes(inputKatakana)) {
      setMessage(`❌ ${inputKatakana}は使用できません（フォルム違いのため）`)
      inputRef.current?.focus()
      return
    }

    const pokemonData = pokemonDatabase.get(inputKatakana)
    if (!pokemonData) {
      setMessage("❌ ポケモンが見つかりません")
      inputRef.current?.focus()
      return
    }

    const lastPokemon = getLastPokemon()
    if (!lastPokemon) return

    const inputFirstChar = inputKatakana.charAt(0)

    if (inputKatakana === goalPokemon?.name) {
      const newPokemon: Pokemon = {
        name: inputKatakana,
        types: pokemonData.type2 ? [pokemonData.type1, pokemonData.type2] : [pokemonData.type1],
      }

      const typeMatch = checkTypeMatch(lastPokemon.types, newPokemon.types)
      let points = 1
      if (typeMatch) {
        const newCombo = combo + 1
        points = 1 + newCombo
        setCombo(newCombo)
        setComboKey((prev) => prev + 1)
        setMaxCombo(Math.max(maxCombo, newCombo))
      }

      setChain((prev) => [...prev, { type: "pokemon", pokemon: newPokemon, points }])
      setUsedNames((prev) => new Set([...prev, inputKatakana]))
      savePokemonHistory(inputKatakana)
      const finalScore = score + points + 10
      setScore(finalScore)
      setScoreKey((prev) => prev + 1)
      saveHighScore(finalScore)
      setCurrentInput("")
      setGameState("cleared")
      setMessage(`🎉 ゴール到達！ +${points}pt + ボーナス+10pt`)
      setShowResultModal(true)
      return
    }

    if (usedNames.has(inputKatakana)) {
      const duplicatePokemon: Pokemon = {
        name: inputKatakana,
        types: pokemonData.type2 ? [pokemonData.type1, pokemonData.type2] : [pokemonData.type1],
      }
      setChain((prev) => [...prev, { type: "duplicate", pokemon: duplicatePokemon, points: -5 }])
      setScore((prev) => Math.max(0, prev - 5))
      setScoreKey((prev) => prev + 1)
      setMessage("❌ 同じポケモン使用！ -5pt")
      setCombo(0)
      setComboKey((prev) => prev + 1)
      setCurrentInput("")

      setIsAnimating(true)
      setTimeout(() => {
        setIsAnimating(false)
        inputRef.current?.focus()
      }, 500)
      return
    }

    if (!checkShiritoriMatch(nextChar, inputFirstChar)) {
      const variants = DAKUTEN_MAP[nextChar]
      const variantText = variants ? variants.map((v) => `「${v}」`).join(" または ") : `「${nextChar}」`
      setMessage(`❌ 次は${variantText}で始まるポケモンを入力してください`)
      inputRef.current?.focus()
      return
    }

    const newPokemon: Pokemon = {
      name: inputKatakana,
      types: pokemonData.type2 ? [pokemonData.type1, pokemonData.type2] : [pokemonData.type1],
    }

    const typeMatch = checkTypeMatch(lastPokemon.types, newPokemon.types)
    let points = 1
    if (typeMatch) {
      const newCombo = combo + 1
      points = 1 + newCombo
      setCombo(newCombo)
      setComboKey((prev) => prev + 1)
      setMaxCombo(Math.max(maxCombo, newCombo))
      const typeEmoji = getTypeEmoji(newPokemon.types)
      setMessage(`${typeEmoji} タイプ一致コンボ！ +${points}pt (コンボ×${newCombo})`)
    } else {
      setCombo(0)
      setComboKey((prev) => prev + 1)
      setMessage(`正解！+${points}pt`)
    }

    setChain((prev) => [...prev, { type: "pokemon", pokemon: newPokemon, points }])
    setUsedNames((prev) => new Set([...prev, inputKatakana]))
    savePokemonHistory(inputKatakana)
    setScore((prev) => prev + points)
    setScoreKey((prev) => prev + 1)
    setCurrentInput("")

    setIsAnimating(true)

    const lastChar = getLastChar(inputKatakana)
    if (lastChar === "ン") {
      const randomChar = getRandomChar()
      setNextChar(randomChar)
      setMessage(`⚡ 自動チェンジ発動！次は「${randomChar}」から`)
    } else {
      setNextChar(lastChar)
    }

    setTimeout(() => {
      setIsAnimating(false)
      inputRef.current?.focus()
    }, 500)
  }

  const handlePass = () => {
    if (passesLeft > 0) {
      setMessage("")

      const oldChar = nextChar
      const randomChar = getRandomChar()
      setNextChar(randomChar)
      setChain((prev) => [...prev, { type: "pass", fromChar: oldChar, toChar: randomChar, points: -2 }])
      setPassesLeft((prev) => prev - 1)
      setPassesKey((prev) => prev + 1)
      setScore((prev) => Math.max(0, prev - 2))
      setScoreKey((prev) => prev + 1)
      setCombo(0)
      setComboKey((prev) => prev + 1)
      setMessage(`⏭️ チェンジ使用 -2pt 次は「${randomChar}」から`)
      inputRef.current?.focus()
    }
  }

  const handleHint = () => {
    if (score < 1) return

    setMessage("")

    const hintPokemon = getPokemonByFirstChar(pokemonDatabase, nextChar, usedNames, DAKUTEN_MAP)

    if (hintPokemon) {
      setScore((prev) => prev - 1)
      setScoreKey((prev) => prev + 1)
      setUsedHint(true)
      setMessage(`💡 ヒント: ${hintPokemon.name} -1pt`)
    } else {
      setMessage(`💡 ヒント: 該当するポケモンが見つかりません`)
    }
  }

  const handleReset = () => {
    const start = getRandomPokemon(pokemonDatabase, (pokemon) => {
      const lastChar = pokemon.name.charAt(pokemon.name.length - 1)
      return lastChar !== "ン"
    })
    const goal = getRandomPokemon(pokemonDatabase)

    if (start && goal) {
      const startPoke: Pokemon = {
        name: start.name,
        types: start.type2 ? [start.type1, start.type2] : [start.type1],
      }
      const goalPoke: Pokemon = {
        name: goal.name,
        types: goal.type2 ? [goal.type1, goal.type2] : [goal.type1],
      }
      setStartPokemon(startPoke)
      setGoalPokemon(goalPoke)
      setChain([{ type: "pokemon", pokemon: startPoke, points: 0 }])
      setUsedNames(new Set([start.name]))
      setNextChar(getLastChar(start.name))
    }

    setScore(0)
    setCombo(0)
    setMaxCombo(0)
    setPassesLeft(3)
    setCurrentInput("")
    setGameState("playing")
    setMessage("")
    setIsAnimating(false)
    setUsedHint(false)
  }

  const handleFinish = () => {
    saveHighScore(score)
    setGameState("finished")
    setShowEndConfirm(false)
    setShowResultModal(true)
  }

  function getCharVariants(char: string): string {
    const variants = DAKUTEN_MAP[char]
    if (variants && variants.length > 1) {
      return variants.map((v) => `「${v}」`).join(" または ")
    }
    return `「${char}」`
  }

  function renderCharVariants(char: string) {
    const variants = DAKUTEN_MAP[char]
    if (variants && variants.length > 1) {
      return (
        <>
          {variants.map((v, index) => (
            <span key={v}>
              <span className="font-bold text-foreground text-base">「{v}」</span>
              {index < variants.length - 1 && <span className="font-normal"> または </span>}
            </span>
          ))}
        </>
      )
    }
    return <span className="font-bold text-foreground text-base">「{char}」</span>
  }

  function getTypeEmoji(types: string[]): string {
    for (const type of types) {
      if (TYPE_EMOJIS[type]) {
        return TYPE_EMOJIS[type]
      }
    }
    return "✨"
  }

  function getComboBackgroundColor(): string {
    if (combo === 0) return "bg-background"

    const lastPokemon = getLastPokemon()
    if (!lastPokemon) return "bg-background"

    for (const type of lastPokemon.types) {
      if (TYPE_BG_COLORS[type]) {
        return TYPE_BG_COLORS[type]
      }
    }
    return "bg-background"
  }

  const handleShareToX = () => {
    const isCleared = gameState === "cleared"
    const chainCount = chain.filter((item) => item.type === "pokemon").length
    const changesUsed = 3 - passesLeft
    const hintText = usedHint ? "ヒントあり" : "ヒントなし"

    const shareText = `🎮ポケしり🥹\n${isCleared ? "🎉クリア！" : "ゲーム終了"}\n\nスコア: ${score}pt\nつないだ数: ${chainCount}匹\n最大コンボ: ${maxCombo}連鎖\nチェンジ使用: ${changesUsed}回\n${hintText}\n\n${startPokemon?.name} → ${goalPokemon?.name}\n\nhttps://v0.app`

    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`
    window.open(twitterUrl, "_blank")
  }

  function getMaskedName(name: string): string {
    return "○".repeat(name.length)
  }

  const allPokemon = getAllPokemonSorted(pokemonDatabase)
  const caughtCount = Object.keys(pokemonHistory).length
  const displayCaughtCount = caughtCount + RESTRICTED_POKEMON.length
  const totalCount = allPokemon.length
  const completionRate = totalCount > 0 ? ((displayCaughtCount / totalCount) * 100).toFixed(1) : "0.0"

  if (isLoading || !startPokemon || !goalPokemon) {
    return (
      <Card className="w-full max-w-2xl p-6 text-center">
        <p className="text-muted-foreground">ポケモンデータを読み込み中...</p>
      </Card>
    )
  }

  return (
    <div
      className={`fixed inset-0 overflow-auto flex items-center justify-center p-4 transition-colors duration-500 ${getComboBackgroundColor()}`}
    >
      <Card className="w-full max-w-2xl p-4 md:p-5 space-y-1.5">
        <div className="text-center space-y-0 relative">
          <h1 className="text-2xl md:text-3xl font-bold text-balance">
            🎮ポケしり
            <Dialog open={showDeveloperInfo} onOpenChange={setShowDeveloperInfo}>
              <DialogTrigger asChild>
                <button className="hover:scale-110 transition-transform inline-block">🥹</button>
              </DialogTrigger>
              <DialogContent className="max-w-sm">
                <DialogHeader>
                  <DialogTitle className="text-center">開発者情報</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4 text-center">
                  <p className="text-sm text-muted-foreground">このゲームを作った人</p>
                  <div className="space-y-2">
                    <p className="text-lg font-bold">@GaoGaoPuuun</p>
                    <p className="text-sm text-muted-foreground">フォローしてね！</p>
                  </div>
                  <Button
                    onClick={() => window.open("https://twitter.com/GaoGaoPuuun", "_blank")}
                    className="w-full bg-black hover:bg-black/90 text-white"
                  >
                    Xでフォローする
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </h1>
          <p className="text-sm text-muted-foreground">スコアアタック</p>
          <Dialog open={showPokedex} onOpenChange={setShowPokedex}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon" className="absolute left-0 top-0 h-8 w-8">
                <BookOpen className="h-5 w-5" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
              <DialogHeader>
                <DialogTitle>ポケモン図鑑</DialogTitle>
                <DialogDescription>
                  入力済み: {displayCaughtCount} / {totalCount} ({completionRate}%)
                </DialogDescription>
              </DialogHeader>
              <div className="overflow-y-auto flex-1 pr-2">
                <div className="grid grid-cols-1 gap-2">
                  {allPokemon.map((pokemon) => {
                    const isRestricted = RESTRICTED_POKEMON.includes(pokemon.name)
                    const count = pokemonHistory[pokemon.name] || 0
                    const isCaught = count > 0 || isRestricted
                    return (
                      <div
                        key={pokemon.number}
                        className={`p-2 rounded-lg border text-sm ${
                          isCaught ? "bg-primary/5 border-primary/20" : "bg-muted/50 border-muted"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">No.{pokemon.number}</span>
                            <p className={`font-medium ${isCaught ? "text-foreground" : "text-muted-foreground"}`}>
                              {isCaught ? pokemon.name : getMaskedName(pokemon.name)}
                            </p>
                          </div>
                          <div className="flex items-center gap-1">
                            {isCaught && (
                              <div className="flex gap-1">
                                {pokemon.type1 ? (
                                  <>
                                    <Badge variant="outline" className="text-xs h-4 px-1.5">
                                      {pokemon.type1}
                                    </Badge>
                                    {pokemon.type2 && (
                                      <Badge variant="outline" className="text-xs h-4 px-1.5">
                                        {pokemon.type2}
                                      </Badge>
                                    )}
                                  </>
                                ) : (
                                  <Badge variant="outline" className="text-xs h-4 px-1.5">
                                    タイプなし
                                  </Badge>
                                )}
                              </div>
                            )}
                            {isRestricted ? (
                              <Badge variant="secondary" className="text-xs h-4 px-1.5 bg-destructive/20">
                                使用不可
                              </Badge>
                            ) : (
                              count > 0 && (
                                <Badge variant="secondary" className="text-xs h-4 px-1.5">
                                  {count}回
                                </Badge>
                              )
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </DialogContent>
          </Dialog>
          <Dialog open={showRules} onOpenChange={setShowRules}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon" className="absolute right-0 top-0 h-8 w-8">
                <HelpCircle className="h-5 w-5" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>ゲームルール</DialogTitle>
                <DialogDescription asChild>
                  <div className="space-y-3 text-sm text-left">
                    <div>
                      <h4 className="font-semibold mb-1">基本ルール</h4>
                      <ul className="list-disc list-inside space-y-1">
                        <li>スタートからゴールまでしりとりでつなぐ</li>
                        <li>ポケモン名が「ー」で終わる場合、その前の文字を使用</li>
                        <li>濁音・半濁音は清音でもOK（例：チ↔ヂ）</li>
                        <li className="font-bold text-primary">✅ ひらがな入力OK</li>
                        <li className="font-bold text-primary">✅ 「ん」で終わってもOK（自動チェンジ）</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">得点システム</h4>
                      <ul className="list-disc list-inside space-y-1">
                        <li>基本：+1pt</li>
                        <li>タイプ一致コンボ：連鎖数×1pt（1連鎖=1pt、2連鎖=2pt、3連鎖=3pt...）</li>
                        <li>ゴール到達：+10pt</li>
                        <li>任意チェンジ：-2pt（最大3回、コンボリセット）</li>
                        <li>重複使用：-5pt（コンボリセット）</li>
                        <li>ヒント：-1pt（ポケモン名を1つ表示）</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">タイプ一致コンボ</h4>
                      <ul className="list-disc list-inside space-y-1">
                        <li>前のポケモンとタイプが1つでも同じ場合、コンボ継続</li>
                        <li>コンボが続くほど高得点（例：4連鎖目は+4pt）</li>
                        <li>タイプ不一致でコンボリセット</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">自動チェンジ</h4>
                      <ul className="list-disc list-inside space-y-1">
                        <li>「ン」で終わる場合、自動的にランダムな文字に変更</li>
                        <li>ペナルティなし</li>
                      </ul>
                    </div>
                  </div>
                </DialogDescription>
              </DialogHeader>
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex items-center justify-between gap-2">
          <div className="flex-1 space-y-0.5">
            <p className="text-xs text-muted-foreground">スタート</p>
            <div className="bg-primary/10 rounded-lg p-1.5 border-2 border-primary">
              <p className="font-bold text-sm text-primary">{startPokemon.name}</p>
              <div className="flex gap-1 mt-0.5">
                {startPokemon.types.map((type) => (
                  <Badge key={type} variant="secondary" className="text-xs h-4 px-1.5">
                    {type}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          <ArrowRight className="text-muted-foreground flex-shrink-0 w-4 h-4" />

          <div className="flex-1 space-y-0.5">
            <p className="text-xs text-muted-foreground">ゴール</p>
            <div className="bg-accent/10 rounded-lg p-1.5 border-2 border-accent">
              <p className="font-bold text-sm text-accent">{goalPokemon.name}</p>
              <div className="flex gap-1 mt-0.5">
                {goalPokemon.types.map((type) => (
                  <Badge key={type} variant="secondary" className="text-xs h-4 px-1.5">
                    {type}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div className="bg-card rounded-lg p-1.5 border text-center">
            <p key={scoreKey} className="text-xl font-bold text-primary animate-number-pop">
              {score}
            </p>
            <p className="text-xs text-muted-foreground">スコア</p>
            {highScore > 0 && <p className="text-xs text-muted-foreground mt-0.5">最高: {highScore}pt</p>}
          </div>
          <div className="bg-card rounded-lg p-1.5 border text-center">
            <div className="flex items-center justify-center gap-1">
              <Zap className="w-4 h-4 text-secondary" />
              <p key={comboKey} className="text-xl font-bold text-secondary animate-number-pop">
                {combo}
              </p>
              <span className="text-xs text-muted-foreground">/ {maxCombo}</span>
            </div>
            <p className="text-xs text-muted-foreground">タイプ一致コンボ</p>
            {combo > 0 &&
              (() => {
                const lastPokemon = getLastPokemon()
                if (lastPokemon) {
                  const typeEmoji = getTypeEmoji(lastPokemon.types)
                  return (
                    <p className="text-sm mt-0.5">
                      {typeEmoji} ×{combo}
                    </p>
                  )
                }
                return null
              })()}
          </div>
          <div className="bg-card rounded-lg p-1.5 border text-center">
            <p key={passesKey} className="text-xl font-bold animate-number-pop">
              {passesLeft}
            </p>
            <p className="text-xs text-muted-foreground">チェンジ残</p>
          </div>
        </div>

        <div className="space-y-1">
          <p className="text-sm font-medium flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            しりとりチェーン ({chain.filter((item) => item.type === "pokemon").length}匹)
          </p>
          <div className="bg-muted rounded-lg p-2 max-h-32 overflow-y-auto space-y-1">
            {chain.map((item, index) => {
              if (item.type === "pokemon") {
                const pokemonIndex = chain.slice(0, index + 1).filter((i) => i.type === "pokemon").length
                return (
                  <div key={index} className="flex items-center gap-2 text-sm animate-in fade-in slide-in-from-left">
                    <span className="text-muted-foreground text-xs">{pokemonIndex}.</span>
                    <span className="font-medium">{item.pokemon.name}</span>
                    <div className="flex gap-1">
                      {item.pokemon.types.map((type) => (
                        <Badge key={type} variant="outline" className="text-xs h-4 px-1.5">
                          {type}
                        </Badge>
                      ))}
                    </div>
                    {item.points > 0 && <span className="text-xs text-primary font-semibold">+{item.points}pt</span>}
                  </div>
                )
              } else if (item.type === "pass") {
                return (
                  <div
                    key={index}
                    className="flex items-center gap-2 text-sm text-muted-foreground italic animate-in fade-in slide-in-from-left"
                  >
                    <span className="text-xs">⏭️</span>
                    <span className="text-xs">
                      チェンジ使用: 「{item.fromChar}」→「{item.toChar}」
                    </span>
                    <span className="text-xs text-destructive font-semibold">{item.points}pt</span>
                  </div>
                )
              } else {
                return (
                  <div
                    key={index}
                    className="flex items-center gap-2 text-sm text-destructive animate-in fade-in slide-in-from-left"
                  >
                    <span className="text-xs">❌</span>
                    <span className="font-medium">{item.pokemon.name}</span>
                    <span className="text-xs">(使用済み)</span>
                    <span className="text-xs font-semibold">{item.points}pt</span>
                  </div>
                )
              }
            })}
            <div ref={chainEndRef}></div>
          </div>
        </div>

        {gameState === "playing" ? (
          <div className="space-y-1.5">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">次は{renderCharVariants(nextChar)}で始まるポケモン</p>
              <div className="flex gap-2">
                <Input
                  ref={inputRef}
                  value={currentInput}
                  onChange={(e) => setCurrentInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                  placeholder="ポケモン名を入力..."
                  className="flex-1 h-9"
                  disabled={isAnimating}
                />
                <Button onClick={handleSubmit} size="sm" className="px-4" disabled={isAnimating}>
                  送信
                </Button>
              </div>
            </div>

            {message && (
              <div className="bg-primary/10 border border-primary rounded-lg p-2 text-center text-sm font-medium animate-in fade-in slide-in-from-top-2">
                {message}
              </div>
            )}

            <div className="flex gap-2">
              <Button
                onClick={handleHint}
                disabled={score < 1 || isAnimating}
                variant="outline"
                size="sm"
                className="flex-1 bg-transparent h-8"
              >
                <Lightbulb className="w-3.5 h-3.5 mr-1" />
                ヒント (-1pt)
              </Button>
              <Button
                onClick={handlePass}
                disabled={passesLeft === 0 || isAnimating}
                variant="outline"
                size="sm"
                className="flex-1 bg-transparent h-8"
              >
                <RotateCcw className="w-3.5 h-3.5 mr-1" />
                チェンジ (-2pt)
              </Button>
              <Dialog open={showEndConfirm} onOpenChange={setShowEndConfirm}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="flex-1 h-8 bg-transparent" disabled={isAnimating}>
                    終了
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-sm">
                  <DialogHeader>
                    <DialogTitle>ゲームを終了しますか？</DialogTitle>
                    <DialogDescription>現在のスコア: {score}pt</DialogDescription>
                  </DialogHeader>
                  <div className="flex gap-2 mt-4">
                    <Button
                      variant="outline"
                      className="flex-1 bg-transparent"
                      onClick={() => setShowEndConfirm(false)}
                    >
                      キャンセル
                    </Button>
                    <Button className="flex-1" onClick={handleFinish}>
                      終了する
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        ) : null}

        <Dialog open={showResultModal} onOpenChange={setShowResultModal}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-center text-2xl">
                {gameState === "cleared" ? "🎉 クリア！ 🎉" : "ゲーム終了"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="text-center space-y-2">
                <p className="text-5xl font-bold text-primary">{score}pt</p>
                {score > highScore && highScore > 0 && (
                  <p className="text-sm font-bold text-secondary">🎊 最高記録更新！ 🎊</p>
                )}
              </div>

              <div className="space-y-2 bg-muted rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">つないだ数</span>
                  <span className="text-lg font-bold">{chain.filter((item) => item.type === "pokemon").length}匹</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">最大コンボ</span>
                  <span className="text-lg font-bold">{maxCombo}連鎖</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">チェンジ使用</span>
                  <span className="text-lg font-bold">{3 - passesLeft}回</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">ヒント</span>
                  <span className="text-lg font-bold">{usedHint ? "使用" : "未使用"}</span>
                </div>
              </div>

              {!usedHint && <p className="text-center text-sm font-bold text-secondary">✨ ヒントなしでクリア！ ✨</p>}

              <div className="text-center text-xs text-muted-foreground">
                {startPokemon.name} → {goalPokemon.name}
              </div>

              <div className="space-y-2">
                <Button onClick={handleShareToX} size="sm" className="w-full bg-black hover:bg-black/90 text-white">
                  <Share2 className="w-4 h-4 mr-2" />
                  Xに投稿しよう
                </Button>
                <Button
                  onClick={() => {
                    setShowResultModal(false)
                    handleReset()
                  }}
                  size="sm"
                  className="w-full bg-transparent"
                  variant="outline"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  もう一度プレイ
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </Card>
    </div>
  )
}
