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
import { Sparkles, Zap, ArrowRight, RotateCcw, HelpCircle, Share2 } from "lucide-react"
import { loadPokemonData, getRandomPokemon, type PokemonData } from "@/lib/pokemon-data"

type Pokemon = {
  name: string
  types: string[]
}

type ChainItem = { type: "pokemon"; pokemon: Pokemon } | { type: "pass"; fromChar: string; toChar: string }

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

const HIGH_SCORE_KEY = "pokemon-shiritori-high-score"

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
  const chainEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const savedHighScore = localStorage.getItem(HIGH_SCORE_KEY)
    if (savedHighScore) {
      setHighScore(Number.parseInt(savedHighScore, 10))
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
        setChain([{ type: "pokemon", pokemon: startPoke }])
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

  const handleSubmit = () => {
    if (!currentInput.trim() || isAnimating) return

    const inputKatakana = hiraganaToKatakana(currentInput.trim())

    const pokemonData = pokemonDatabase.get(inputKatakana)
    if (!pokemonData) {
      setMessage("❌ ポケモンが見つかりません")
      setTimeout(() => setMessage(""), 2000)
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
        points = newCombo
        setCombo(newCombo)
        setMaxCombo(Math.max(maxCombo, newCombo))
      }

      setChain((prev) => [...prev, { type: "pokemon", pokemon: newPokemon }])
      setUsedNames((prev) => new Set([...prev, inputKatakana]))
      const finalScore = score + points + 10
      setScore(finalScore)
      saveHighScore(finalScore)
      setCurrentInput("")
      setGameState("cleared")
      setMessage(`🎉 ゴール到達！ +${points}pt + ボーナス+10pt`)
      return
    }

    if (usedNames.has(inputKatakana)) {
      setScore((prev) => Math.max(0, prev - 5))
      setMessage("❌ 同じポケモン使用！ -5pt")
      setCombo(0)
      setTimeout(() => setMessage(""), 2000)
      return
    }

    if (!checkShiritoriMatch(nextChar, inputFirstChar)) {
      const variants = DAKUTEN_MAP[nextChar]
      const variantText = variants ? variants.map((v) => `「${v}」`).join(" または ") : `「${nextChar}」`
      setMessage(`❌ 次は${variantText}で始まるポケモンを入力してください`)
      setTimeout(() => setMessage(""), 2000)
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
      points = newCombo
      setCombo(newCombo)
      setMaxCombo(Math.max(maxCombo, newCombo))
      setMessage(`✨ タイプ一致コンボ！ +${points}pt (${newCombo}連鎖)`)
    } else {
      setCombo(0)
      setMessage(`+${points}pt`)
    }

    setChain((prev) => [...prev, { type: "pokemon", pokemon: newPokemon }])
    setUsedNames((prev) => new Set([...prev, inputKatakana]))
    setScore((prev) => prev + points)
    setCurrentInput("")

    setIsAnimating(true)

    const lastChar = getLastChar(inputKatakana)
    if (lastChar === "ン") {
      const randomChar = getRandomChar()
      setNextChar(randomChar)
      setMessage(`⚡ 自動チェンジ発動！次は「${randomChar}」から（ペナルティなし）`)
    } else {
      setNextChar(lastChar)
    }

    setTimeout(() => {
      setMessage("")
      setIsAnimating(false)
    }, 2000)
  }

  const handlePass = () => {
    if (passesLeft > 0) {
      const oldChar = nextChar
      const randomChar = getRandomChar()
      setNextChar(randomChar)
      setChain((prev) => [...prev, { type: "pass", fromChar: oldChar, toChar: randomChar }])
      setPassesLeft((prev) => prev - 1)
      setScore((prev) => Math.max(0, prev - 2))
      setCombo(0)
      setMessage(`⏭️ チェンジ使用 -2pt 次は「${randomChar}」から`)
      setTimeout(() => setMessage(""), 2000)
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
      setChain([{ type: "pokemon", pokemon: startPoke }])
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
  }

  const handleShareToX = () => {
    const pokemonCount = chain.filter((item) => item.type === "pokemon").length
    const text = `ポケモンしりとりスコアアタック\n${startPokemon?.name} → ${goalPokemon?.name}\n\n${pokemonCount}匹つなげて ${score}pt 獲得！\n最大コンボ: ${maxCombo}連鎖\n\n#ポケモンしりとり`
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`
    window.open(url, "_blank")
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

  const handleFinish = () => {
    saveHighScore(score)
    setGameState("finished")
  }

  if (isLoading || !startPokemon || !goalPokemon) {
    return (
      <Card className="w-full max-w-2xl p-6 text-center">
        <p className="text-muted-foreground">ポケモンデータを読み込み中...</p>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-2xl p-4 md:p-5 space-y-2">
      <div className="text-center space-y-1 relative">
        <h1 className="text-2xl md:text-3xl font-bold text-balance">🎮 ポケモンしりとり</h1>
        <p className="text-sm text-muted-foreground">スコアアタック</p>
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
          <div className="bg-primary/10 rounded-lg p-2 border-2 border-primary">
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
          <div className="bg-accent/10 rounded-lg p-2 border-2 border-accent">
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
        <div className="bg-card rounded-lg p-2 border text-center">
          <p className="text-xl font-bold text-primary">{score}</p>
          <p className="text-xs text-muted-foreground">スコア</p>
          {highScore > 0 && <p className="text-xs text-muted-foreground mt-0.5">最高: {highScore}pt</p>}
        </div>
        <div className="bg-card rounded-lg p-2 border text-center">
          <div className="flex items-center justify-center gap-1">
            <Zap className="w-4 h-4 text-secondary" />
            <p className="text-xl font-bold text-secondary">{combo}</p>
            <span className="text-xs text-muted-foreground">/ {maxCombo}</span>
          </div>
          <p className="text-xs text-muted-foreground">タイプ一致コンボ</p>
        </div>
        <div className="bg-card rounded-lg p-2 border text-center">
          <p className="text-xl font-bold">{passesLeft}</p>
          <p className="text-xs text-muted-foreground">チェンジ残</p>
        </div>
      </div>

      <div className="space-y-1.5">
        <p className="text-sm font-medium flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5" />
          しりとりチェーン ({chain.filter((item) => item.type === "pokemon").length}匹)
        </p>
        <div className="bg-muted rounded-lg p-2.5 max-h-32 overflow-y-auto space-y-1.5">
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
                </div>
              )
            } else {
              return (
                <div
                  key={index}
                  className="flex items-center gap-2 text-sm text-muted-foreground italic animate-in fade-in slide-in-from-left"
                >
                  <span className="text-xs">⏭️</span>
                  <span className="text-xs">
                    チェンジ使用: 「{item.fromChar}」→「{item.toChar}」
                  </span>
                </div>
              )
            }
          })}
          <div ref={chainEndRef}></div>
        </div>
      </div>

      {gameState === "playing" ? (
        <div className="space-y-2">
          <div className="space-y-1.5">
            <p className="text-sm text-muted-foreground">次は{renderCharVariants(nextChar)}で始まるポケモン</p>
            <div className="flex gap-2">
              <Input
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
              onClick={handlePass}
              disabled={passesLeft === 0 || isAnimating}
              variant="outline"
              size="sm"
              className="flex-1 bg-transparent h-8"
            >
              チェンジ (-2pt)
            </Button>
            <Button
              onClick={handleFinish}
              variant="outline"
              size="sm"
              className="flex-1 h-8 bg-transparent"
              disabled={isAnimating}
            >
              終了
            </Button>
          </div>
        </div>
      ) : gameState === "cleared" ? (
        <div className="space-y-4 text-center py-4">
          <div className="space-y-1.5">
            <p className="text-4xl font-bold text-primary animate-in zoom-in">🎉 クリア！ 🎉</p>
            <p className="text-5xl font-bold text-primary animate-in zoom-in">{score}pt</p>
            <p className="text-sm text-muted-foreground">
              {chain.filter((item) => item.type === "pokemon").length}匹つなげました
            </p>
            <p className="text-sm text-muted-foreground">最大コンボ: {maxCombo}連鎖</p>
            <p className="text-xs text-muted-foreground">
              {startPokemon.name} → {goalPokemon.name}
            </p>
            {score > highScore && highScore > 0 && (
              <p className="text-sm font-bold text-secondary">🎊 最高記録更新！ 🎊</p>
            )}
          </div>
          <div className="space-y-2">
            <Button onClick={handleShareToX} size="sm" className="w-full" variant="default">
              <Share2 className="w-4 h-4 mr-2" />
              Xに投稿しよう
            </Button>
            <Button onClick={handleReset} size="sm" className="w-full bg-transparent" variant="outline">
              <RotateCcw className="w-4 h-4 mr-2" />
              もう一度プレイ
            </Button>
          </div>
        </div>
      ) : gameState === "finished" ? (
        <div className="space-y-3 text-center">
          <div className="space-y-1.5">
            <p className="text-xl font-bold">ゲーム終了！</p>
            <p className="text-3xl font-bold text-primary">{score}pt</p>
            <p className="text-sm text-muted-foreground">
              {chain.filter((item) => item.type === "pokemon").length}匹つなげました
            </p>
            <p className="text-sm text-muted-foreground">最大コンボ: {maxCombo}連鎖</p>
            {score > highScore && highScore > 0 && (
              <p className="text-sm font-bold text-secondary">🎊 最高記録更新！ 🎊</p>
            )}
          </div>
          <Button onClick={handleReset} size="sm" className="w-full">
            <RotateCcw className="w-4 h-4 mr-2" />
            もう一度プレイ
          </Button>
        </div>
      ) : null}
    </Card>
  )
}
