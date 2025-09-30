"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Sparkles, Zap, ArrowRight, RotateCcw } from "lucide-react"
import { loadPokemonData, type PokemonData } from "@/lib/pokemon-data"

type Pokemon = {
  name: string
  types: string[]
}

type GameState = "playing" | "finished"

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

export function PokemonShiritoriGame() {
  const [pokemonDatabase, setPokemonDatabase] = useState<Map<string, PokemonData>>(new Map())
  const [isLoading, setIsLoading] = useState(true)

  const [gameState, setGameState] = useState<GameState>("playing")
  const [startPokemon] = useState<Pokemon>({ name: "ピカチュウ", types: ["でんき"] })
  const [goalPokemon] = useState<Pokemon>({ name: "リザードン", types: ["ほのお", "ひこう"] })
  const [chain, setChain] = useState<Pokemon[]>([startPokemon])
  const [currentInput, setCurrentInput] = useState("")
  const [score, setScore] = useState(0)
  const [combo, setCombo] = useState(0)
  const [passesLeft, setPassesLeft] = useState(3)
  const [message, setMessage] = useState("")
  const [usedNames, setUsedNames] = useState<Set<string>>(new Set([startPokemon.name]))
  const [nextChar, setNextChar] = useState(getLastChar(startPokemon.name))

  useEffect(() => {
    loadPokemonData().then((data) => {
      setPokemonDatabase(data)
      setIsLoading(false)
    })
  }, [])

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

  const handleSubmit = () => {
    if (!currentInput.trim()) return

    const pokemonData = pokemonDatabase.get(currentInput)
    if (!pokemonData) {
      setMessage("❌ ポケモンが見つかりません")
      setTimeout(() => setMessage(""), 2000)
      return
    }

    const lastPokemon = chain[chain.length - 1]
    const inputFirstChar = currentInput.charAt(0)

    if (usedNames.has(currentInput)) {
      setScore((prev) => Math.max(0, prev - 5))
      setMessage("❌ 同じポケモン使用！ -5pt")
      setTimeout(() => setMessage(""), 2000)
      return
    }

    if (!checkShiritoriMatch(nextChar, inputFirstChar)) {
      const variants = DAKUTEN_MAP[nextChar]
      const variantText = variants ? variants.join("・") : nextChar
      setMessage(`❌ 「${variantText}」で始まるポケモンを入力してください`)
      setTimeout(() => setMessage(""), 2000)
      return
    }

    const newPokemon: Pokemon = {
      name: currentInput,
      types: pokemonData.type2 ? [pokemonData.type1, pokemonData.type2] : [pokemonData.type1],
    }

    setChain((prev) => [...prev, newPokemon])
    setUsedNames((prev) => new Set([...prev, currentInput]))
    setScore((prev) => prev + 1)
    setCombo(0)
    setCurrentInput("")

    const lastChar = getLastChar(currentInput)
    if (lastChar === "ン") {
      const randomChar = getRandomChar()
      setNextChar(randomChar)
      setMessage(`⚡ 自動パス発動！次は「${randomChar}」から（ペナルティなし）`)
    } else {
      setNextChar(lastChar)
    }

    setTimeout(() => setMessage(""), 2000)
  }

  const handlePass = () => {
    if (passesLeft > 0) {
      const randomChar = getRandomChar()
      setNextChar(randomChar)
      setPassesLeft((prev) => prev - 1)
      setScore((prev) => Math.max(0, prev - 2))
      setCombo(0)
      setMessage(`⏭️ パス使用 -2pt 次は「${randomChar}」から`)
      setTimeout(() => setMessage(""), 2000)
    }
  }

  const handleReset = () => {
    setChain([startPokemon])
    setScore(0)
    setCombo(0)
    setPassesLeft(3)
    setCurrentInput("")
    setUsedNames(new Set([startPokemon.name]))
    setGameState("playing")
    setMessage("")
    setNextChar(getLastChar(startPokemon.name))
  }

  if (isLoading) {
    return (
      <Card className="w-full max-w-2xl p-6 text-center">
        <p className="text-muted-foreground">ポケモンデータを読み込み中...</p>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-2xl p-4 md:p-5 space-y-3">
      <div className="text-center space-y-1">
        <h1 className="text-2xl md:text-3xl font-bold text-balance">🎮 ポケモンしりとり</h1>
        <p className="text-sm text-muted-foreground">スコアアタック</p>
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
        </div>
        <div className="bg-card rounded-lg p-2 border text-center">
          <div className="flex items-center justify-center gap-1">
            <Zap className="w-4 h-4 text-secondary" />
            <p className="text-xl font-bold text-secondary">{combo}</p>
          </div>
          <p className="text-xs text-muted-foreground">コンボ</p>
        </div>
        <div className="bg-card rounded-lg p-2 border text-center">
          <p className="text-xl font-bold">{passesLeft}</p>
          <p className="text-xs text-muted-foreground">パス残</p>
        </div>
      </div>

      {message && (
        <div className="bg-primary/10 border border-primary rounded-lg p-2 text-center text-sm font-medium animate-in fade-in slide-in-from-top-2">
          {message}
        </div>
      )}

      <div className="space-y-1.5">
        <p className="text-sm font-medium flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5" />
          しりとりチェーン ({chain.length}匹)
        </p>
        <div className="bg-muted rounded-lg p-2.5 max-h-32 overflow-y-auto space-y-1.5">
          {chain.map((pokemon, index) => (
            <div key={index} className="flex items-center gap-2 text-sm animate-in fade-in slide-in-from-left">
              <span className="text-muted-foreground text-xs">{index + 1}.</span>
              <span className="font-medium">{pokemon.name}</span>
              <div className="flex gap-1">
                {pokemon.types.map((type) => (
                  <Badge key={type} variant="outline" className="text-xs h-4 px-1.5">
                    {type}
                  </Badge>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {gameState === "playing" ? (
        <div className="space-y-2">
          <div className="space-y-1.5">
            <p className="text-sm text-muted-foreground">
              次は「<span className="font-bold text-foreground text-base">{nextChar}</span>」で始まるポケモン
            </p>
            <div className="flex gap-2">
              <Input
                value={currentInput}
                onChange={(e) => setCurrentInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                placeholder="ポケモン名を入力..."
                className="flex-1 h-9"
              />
              <Button onClick={handleSubmit} size="sm" className="px-4">
                送信
              </Button>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handlePass}
              disabled={passesLeft === 0}
              variant="outline"
              size="sm"
              className="flex-1 bg-transparent h-8"
            >
              パス (-2pt)
            </Button>
            <Button onClick={() => setGameState("finished")} variant="outline" size="sm" className="flex-1 h-8">
              終了
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-3 text-center">
          <div className="space-y-1.5">
            <p className="text-xl font-bold">ゲーム終了！</p>
            <p className="text-3xl font-bold text-primary">{score}pt</p>
            <p className="text-sm text-muted-foreground">{chain.length}匹つなげました</p>
          </div>
          <Button onClick={handleReset} size="sm" className="w-full">
            <RotateCcw className="w-4 h-4 mr-2" />
            もう一度プレイ
          </Button>
        </div>
      )}
    </Card>
  )
}
