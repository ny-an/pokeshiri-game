"use client"

import React, { useState, useEffect, useRef } from "react"
import { Card } from "@/components/ui/card"
import {
  loadPokemonData,
  getRandomPokemon,
  getPokemonByFirstChar,
  getAllPokemonSorted,
  type PokemonData,
} from "@/lib/pokemon-data"
import { KATAKANA_LIST, DAKUTEN_MAP, RESTRICTED_POKEMON } from "@/lib/constants"
import {
  getLastChar,
  checkShiritoriMatch,
  checkTypeMatch,
  hiraganaToKatakana,
  getLastPokemon,
  saveHighScore,
  savePokemonHistory,
  getTypeEmoji,
  getComboBackgroundColor,
  getMaskedName,
} from "@/lib/game-utils"
import type { Pokemon, ChainItem, GameState } from "@/lib/types"
import { GameHeader } from "./game-header"
import { ScoreDisplay } from "./score-display"
import { ChainDisplay } from "./chain-display"
import { GameInput } from "./game-input"
import { ResultModal } from "./result-modal"


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
    const HIGH_SCORE_KEY = "pokemon-shiritori-high-score"
    const HISTORY_KEY = "pokemon-shiritori-history"
    
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

  const getRandomChar = () => {
    const randomIndex = Math.floor(Math.random() * KATAKANA_LIST.length)
    return KATAKANA_LIST[randomIndex]
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

    const lastPokemon = getLastPokemon(chain)
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
        setComboKey((prev: number) => prev + 1)
        setMaxCombo(Math.max(maxCombo, newCombo))
      }

      setChain((prev: ChainItem[]) => [...prev, { type: "pokemon", pokemon: newPokemon, points }])
      setUsedNames((prev: Set<string>) => new Set([...prev, inputKatakana]))
      setPokemonHistory(savePokemonHistory(inputKatakana, pokemonHistory))
      const finalScore = score + points + 10
      setScore(finalScore)
      setScoreKey((prev: number) => prev + 1)
      setHighScore(saveHighScore(finalScore, highScore))
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
      setChain((prev: ChainItem[]) => [...prev, { type: "duplicate", pokemon: duplicatePokemon, points: -5 }])
      setScore((prev: number) => Math.max(0, prev - 5))
      setScoreKey((prev: number) => prev + 1)
      setMessage("❌ 同じポケモン使用！ -5pt")
      setCombo(0)
      setComboKey((prev: number) => prev + 1)
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
      setComboKey((prev: number) => prev + 1)
      setMaxCombo(Math.max(maxCombo, newCombo))
      const typeEmoji = getTypeEmoji(newPokemon.types)
      setMessage(`${typeEmoji} タイプ一致コンボ！ +${points}pt (コンボ×${newCombo})`)
    } else {
      setCombo(0)
      setComboKey((prev: number) => prev + 1)
      setMessage(`正解！+${points}pt`)
    }

    setChain((prev: ChainItem[]) => [...prev, { type: "pokemon", pokemon: newPokemon, points }])
    setUsedNames((prev: Set<string>) => new Set([...prev, inputKatakana]))
    setPokemonHistory(savePokemonHistory(inputKatakana, pokemonHistory))
    setScore((prev: number) => prev + points)
    setScoreKey((prev: number) => prev + 1)
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
      setChain((prev: ChainItem[]) => [...prev, { type: "pass", fromChar: oldChar, toChar: randomChar, points: -2 }])
      setPassesLeft((prev: number) => prev - 1)
      setPassesKey((prev: number) => prev + 1)
      setScore((prev: number) => Math.max(0, prev - 2))
      setScoreKey((prev: number) => prev + 1)
      setCombo(0)
      setComboKey((prev: number) => prev + 1)
      setMessage(`⏭️ チェンジ使用 -2pt 次は「${randomChar}」から`)
      inputRef.current?.focus()
    }
  }

  const handleHint = () => {
    if (score < 1) return

    setMessage("")

    const hintPokemon = getPokemonByFirstChar(pokemonDatabase, nextChar, usedNames, DAKUTEN_MAP)

    if (hintPokemon) {
      setScore((prev: number) => prev - 1)
      setScoreKey((prev: number) => prev + 1)
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
    setHighScore(saveHighScore(score, highScore))
    setGameState("finished")
    setShowEndConfirm(false)
    setShowResultModal(true)
  }

  function renderCharVariants(char: string) {
    const variants = DAKUTEN_MAP[char]
    if (variants && variants.length > 1) {
      return (
        <>
          {variants.map((v: string, index: number) => (
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

  const generateThumbnail = async (): Promise<string> => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (!ctx) return ''

    // キャンバスサイズを設定（Twitter推奨サイズ）
    canvas.width = 1200
    canvas.height = 630

    // 背景グラデーション
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
    gradient.addColorStop(0, '#1e40af')
    gradient.addColorStop(1, '#3b82f6')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // タイトル
    ctx.fillStyle = '#ffffff'
    ctx.font = 'bold 80px Arial'
    ctx.textAlign = 'center'
    ctx.fillText('🎮ポケしり🥹', canvas.width / 2, 120)

    // ゲーム結果
    const isCleared = gameState === "cleared"
    ctx.font = 'bold 60px Arial'
    ctx.fillText(isCleared ? '🎉クリア！' : 'ゲーム終了', canvas.width / 2, 200)

    // スタート・ゴール
    ctx.font = 'bold 50px Arial'
    ctx.fillText(`${startPokemon?.name} → ${goalPokemon?.name}`, canvas.width / 2, 280)

    // スコア情報
    const chainCount = chain.filter((item: ChainItem) => item.type === "pokemon").length
    const changesUsed = 3 - passesLeft
    const hintText = usedHint ? "ヒントあり" : "ヒントなし"

    ctx.font = '40px Arial'
    ctx.fillText(`スコア: ${score}pt`, canvas.width / 2, 350)
    ctx.fillText(`つないだ数: ${chainCount}匹`, canvas.width / 2, 400)
    ctx.fillText(`最大コンボ: ${maxCombo}連鎖`, canvas.width / 2, 450)
    ctx.fillText(`チェンジ使用: ${changesUsed}回`, canvas.width / 2, 500)
    ctx.fillText(hintText, canvas.width / 2, 550)

    return canvas.toDataURL('image/png')
  }

  const handleShareToX = () => {
    const isCleared = gameState === "cleared"
    const chainCount = chain.filter((item: ChainItem) => item.type === "pokemon").length
    const changesUsed = 3 - passesLeft
    const hintText = usedHint ? "ヒントあり" : "ヒントなし"

    const shareText = `🎮ポケしり🥹\n${isCleared ? "🎉クリア！" : "ゲーム終了"}\n\n${startPokemon?.name} → ${goalPokemon?.name}\n\nスコア: ${score}pt\nつないだ数: ${chainCount}匹\n最大コンボ: ${maxCombo}連鎖\nチェンジ使用: ${changesUsed}回\n${hintText}\n\nhttps://ny-an.github.io/pokeshiri-game/`

    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`
    window.open(twitterUrl, "_blank")
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
      className={`fixed inset-0 overflow-auto flex items-center justify-center p-4 transition-colors duration-500 ${getComboBackgroundColor(combo, chain)}`}
    >
      <Card className="w-full max-w-2xl p-4 md:p-5 space-y-1.5">
        <GameHeader
          startPokemon={startPokemon}
          goalPokemon={goalPokemon}
          showRules={showRules}
          setShowRules={setShowRules}
          showPokedex={showPokedex}
          setShowPokedex={setShowPokedex}
          showDeveloperInfo={showDeveloperInfo}
          setShowDeveloperInfo={setShowDeveloperInfo}
          displayCaughtCount={displayCaughtCount}
          totalCount={totalCount}
          completionRate={completionRate}
          pokemonHistory={pokemonHistory}
          allPokemon={allPokemon}
          getMaskedName={getMaskedName}
        />

        <ScoreDisplay
          score={score}
          scoreKey={scoreKey}
          highScore={highScore}
          combo={combo}
          comboKey={comboKey}
          maxCombo={maxCombo}
          passesLeft={passesLeft}
          passesKey={passesKey}
          chain={chain}
        />

        <ChainDisplay chain={chain} chainEndRef={chainEndRef} />

        {!showResultModal ? (
          <GameInput
            currentInput={currentInput}
            setCurrentInput={setCurrentInput}
            nextChar={nextChar}
            message={message}
            isAnimating={isAnimating}
            score={score}
            passesLeft={passesLeft}
            showEndConfirm={showEndConfirm}
            setShowEndConfirm={setShowEndConfirm}
            inputRef={inputRef}
            handleSubmit={handleSubmit}
            handleHint={handleHint}
            handlePass={handlePass}
            handleFinish={handleFinish}
            renderCharVariants={renderCharVariants}
          />
        ) : null}

        <ResultModal
          showResultModal={showResultModal}
          setShowResultModal={setShowResultModal}
          gameState={gameState}
          score={score}
          highScore={highScore}
          chain={chain}
          maxCombo={maxCombo}
          passesLeft={passesLeft}
          usedHint={usedHint}
          startPokemon={startPokemon}
          goalPokemon={goalPokemon}
          handleShareToX={handleShareToX}
          handleReset={handleReset}
        />
      </Card>
    </div>
  )
}
