"use client"

import React, { useState, useEffect, useRef } from "react"
import { Card } from "@/components/ui/card"
import {
  loadPokemonData,
  getRandomPokemon,
  getPokemonByFirstChar,
  getAllPokemonSorted,
  getPokemonById,
  getPokemonIdByName,
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
  loadHighScore,
  savePokemonHistory,
  getTypeEmoji,
  getComboBackgroundColor,
  getMaskedName,
  trackPokemonAnswer,
  trackGameClear,
  trackGameOver,
  checkProgressMilestone,
  getNextMilestoneToShow,
} from "@/lib/game-utils"
import type { Pokemon, ChainItem, GameState, GameMode } from "@/lib/types"
import { GameHeader } from "./game-header"
import { ScoreDisplay } from "./score-display"
import { ChainDisplay } from "./chain-display"
import { GameInput } from "./game-input"
import { ResultModal } from "./result-modal"
import { ProgressModal } from "./progress-modal"
import { StatsModal } from "./stats-modal"
import { VersionChecker } from "./version-checker"
import { ModeConfirmModal } from "./mode-confirm-modal"


export function PokemonShiritoriGame() {
  const [pokemonDatabase, setPokemonDatabase] = useState<Map<string, PokemonData>>(new Map())
  const [isLoading, setIsLoading] = useState(true)

  const [gameState, setGameState] = useState<GameState>("playing")
  const [gameMode, setGameMode] = useState<GameMode>("single")
  const [startPokemon, setStartPokemon] = useState<Pokemon | null>(null)
  const [goalPokemon, setGoalPokemon] = useState<Pokemon | null>(null)
  const [chain, setChain] = useState<ChainItem[]>([])
  const [currentInput, setCurrentInput] = useState("")
  const [score, setScore] = useState(0)
  const [highScore, setHighScore] = useState(0)
  const [combo, setCombo] = useState(0)
  const [maxCombo, setMaxCombo] = useState(0)
  const [passesLeft, setPassesLeft] = useState(3)
  const [comboType, setComboType] = useState<string | null>(null)
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
  const [showStats, setShowStats] = useState(false)
  const [showProgressModal, setShowProgressModal] = useState(false)
  const [progressMilestone, setProgressMilestone] = useState<number | null>(null)
  const [newPokemonName, setNewPokemonName] = useState<string>("")
  const [previousProgress, setPreviousProgress] = useState(0)
  const [lastShownMilestone, setLastShownMilestone] = useState(0)
  const [debugMode, setDebugMode] = useState(false)

  // タイムアタック用の状態
  const [timeLeft, setTimeLeft] = useState(60)
  const [isTimeUp, setIsTimeUp] = useState(false)
  const [showModeConfirm, setShowModeConfirm] = useState(false)
  const [targetMode, setTargetMode] = useState<GameMode>("single")
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  // デバッグモードの有効化（隠しコマンド）
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // ハッキング警告メッセージを表示
      console.log("🚫 はっきんぐしないで！！")
      
      let konamiCode: string[] = []
      const konamiSequence = [
        'ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
        'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight',
        'KeyB', 'KeyA'
      ]

      const handleKeyDown = (event: KeyboardEvent) => {
        konamiCode.push(event.code)
        if (konamiCode.length > konamiSequence.length) {
          konamiCode.shift()
        }
        
        if (konamiCode.join(',') === konamiSequence.join(',')) {
          setDebugMode(true)
          console.log("🎮 デバッグモードが有効になりました！")
          console.log("=== ポケしり デバッグコマンド ===")
          console.log("showProgressModal(milestone) - 指定したマイルストーンの進捗モーダルを表示")
          console.log("resetProgressMilestone() - 進捗マイルストーンをリセット")
          console.log("showProgressStatus() - 現在の進捗状況を表示")
          console.log("test100Percent() - 100%達成演出をテスト表示")
          console.log("disableDebugMode() - デバッグモードを無効化")
          console.log("=====================================")
          konamiCode = []
        }
      }

      window.addEventListener('keydown', handleKeyDown)
      return () => window.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  // デバッグ用のコンソールコマンドを追加
  useEffect(() => {
    if (typeof window !== 'undefined' && debugMode) {
      // 進捗モーダルを手動で表示するコマンド
      (window as any).showProgressModal = (milestone: number) => {
        setProgressMilestone(milestone)
        setNewPokemonName("テストポケモン")
        setShowProgressModal(true)
        console.log(`${milestone}%の進捗モーダルを表示しました`)
      }

      // 最後に表示したマイルストーンをリセットするコマンド
      (window as any).resetProgressMilestone = () => {
        setLastShownMilestone(0)
        localStorage.setItem("pokemon-shiritori-last-shown-milestone", "0")
        console.log("進捗マイルストーンをリセットしました")
      }

      // 現在の進捗状況を表示するコマンド
      (window as any).showProgressStatus = () => {
        const allPokemon = getAllPokemonSorted(pokemonDatabase)
        const caughtCount = Object.keys(pokemonHistory).length
        const displayCaughtCount = caughtCount + RESTRICTED_POKEMON.length
        const totalCount = allPokemon.length
        const currentProgress = totalCount > 0 ? (displayCaughtCount / totalCount) * 100 : 0
        
        console.log("=== 進捗状況 ===")
        console.log(`現在の進捗: ${currentProgress.toFixed(1)}%`)
        console.log(`捕獲数: ${caughtCount}匹`)
        console.log(`表示用捕獲数: ${displayCaughtCount}匹`)
        console.log(`総数: ${totalCount}匹`)
        console.log(`最後に表示したマイルストーン: ${lastShownMilestone}%`)
        console.log("==================")
      }

      // 100%達成演出をテストするコマンド
      (window as any).test100Percent = () => {
        setProgressMilestone(100)
        setNewPokemonName("アルセウス")
        setShowProgressModal(true)
        console.log("100%達成演出をテスト表示しました")
      }

      // デバッグモードを無効化するコマンド
      (window as any).disableDebugMode = () => {
        setDebugMode(false)
        delete (window as any).showProgressModal
        delete (window as any).resetProgressMilestone
        delete (window as any).showProgressStatus
        delete (window as any).test100Percent
        delete (window as any).disableDebugMode
        console.log("🔒 デバッグモードが無効になりました")
      }
    } else if (typeof window !== 'undefined' && !debugMode) {
      // デバッグモードが無効の時はコマンドを削除
      delete (window as any).showProgressModal
      delete (window as any).resetProgressMilestone
      delete (window as any).showProgressStatus
      delete (window as any).test100Percent
      delete (window as any).disableDebugMode
    }
  }, [pokemonDatabase, pokemonHistory, lastShownMilestone, debugMode])

  useEffect(() => {
    const HISTORY_KEY = "pokemon-shiritori-history"
    const LAST_SHOWN_MILESTONE_KEY = "pokemon-shiritori-last-shown-milestone"
    
    // ゲームモードに応じてハイスコアを読み込み
    setHighScore(loadHighScore(gameMode))

    const savedHistory = localStorage.getItem(HISTORY_KEY)
    if (savedHistory) {
      try {
        setPokemonHistory(JSON.parse(savedHistory))
      } catch (error) {
        console.error("[v0] Failed to load Pokemon history:", error)
      }
    }

    const savedLastShownMilestone = localStorage.getItem(LAST_SHOWN_MILESTONE_KEY)
    if (savedLastShownMilestone) {
      setLastShownMilestone(Number.parseInt(savedLastShownMilestone, 10))
    }
  }, [gameMode])

  useEffect(() => {
    loadPokemonData().then((data) => {
      setPokemonDatabase(data)
      
      // URLパラメータからスタート・ゴールIDを取得
      const urlParams = new URLSearchParams(window.location.search)
      const startId = urlParams.get('start')
      const goalId = urlParams.get('goal')
      
      let start: PokemonData | null = null
      let goal: PokemonData | null = null
      
      // URLパラメータが指定されている場合はそれを使用
      if (startId && goalId) {
        start = getPokemonById(data, startId)
        goal = getPokemonById(data, goalId)
      }
      
      // パラメータが無効または未指定の場合はランダムに生成
      if (!start || !goal) {
        start = getRandomPokemon(data, (pokemon) => {
          const lastChar = pokemon.name.charAt(pokemon.name.length - 1)
          return lastChar !== "ン"
        })
        goal = getRandomPokemon(data)
      }

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

  // 候補が存在しない場合は自動的にゲームオーバー
  useEffect(() => {
    if (gameState !== "playing") return
    if (!nextChar) return

    const candidate = getPokemonByFirstChar(pokemonDatabase, nextChar, usedNames, DAKUTEN_MAP)
    if (!candidate) {
      setMessage("💥 出せるポケモンがありません。ゲームオーバー")
      setHighScore(saveHighScore(score, highScore, gameMode))
      setGameState("finished")
      setShowEndConfirm(false)
      
      // ゲームオーバーのトラッキング
      trackGameOver(score, chain.length, gameMode)
      
      setShowResultModal(true)
    }
  }, [gameState, nextChar, usedNames, pokemonDatabase, score, highScore])

  // タイムアタックのタイマー管理
  useEffect(() => {
    if (gameMode === 'timeattack' && gameState === 'playing' && !isTimeUp) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsTimeUp(true)
            setGameState("finished")
            setHighScore(saveHighScore(score, highScore, gameMode))
            setShowResultModal(true)
            trackGameOver(score, chain.length, gameMode)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [gameMode, gameState, isTimeUp, score, highScore, chain.length])

  const getRandomChar = () => {
    const randomIndex = Math.floor(Math.random() * KATAKANA_LIST.length)
    return KATAKANA_LIST[randomIndex]
  }

  const handleModeChange = (newMode: GameMode) => {
    if (newMode === gameMode) return
    
    setTargetMode(newMode)
    setShowModeConfirm(true)
  }

  const confirmModeChange = () => {
    setGameMode(targetMode)
    setShowModeConfirm(false)
    
    // ゲームをリセット
    handleReset()
    
    // タイムアタックの場合はタイマーをリセット
    if (targetMode === 'timeattack') {
      setTimeLeft(60)
      setIsTimeUp(false)
    }
    
    // ハイスコアを更新
    setHighScore(loadHighScore(targetMode))
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
      
      // タイムアタックの場合は残り時間ボーナスを追加
      const timeBonus = gameMode === 'timeattack' ? timeLeft : 0
      const finalScore = score + points + 10 + timeBonus
      setScore(finalScore)
      setScoreKey((prev: number) => prev + 1)
      setHighScore(saveHighScore(finalScore, highScore, gameMode))
    setCurrentInput("")
    setGameState("cleared")
    const bonusMessage = gameMode === 'timeattack' && timeBonus > 0 
      ? ` + 時間ボーナス+${timeBonus}pt` 
      : ""
    setMessage(`🎉 ゴール到達！ +${points}pt + ボーナス+10pt${bonusMessage}`)
    
    // ゲームクリアのトラッキング
    trackGameClear(finalScore, chain.length, gameMode)
    
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
      setComboType(null)
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
      
      // 一致したタイプを特定して保存
      const matchedType = lastPokemon.types.find(type => newPokemon.types.includes(type))
      if (matchedType) {
        setComboType(matchedType)
      }
      
      const typeEmoji = getTypeEmoji(newPokemon.types)
      setMessage(`${typeEmoji} タイプ一致コンボ！ +${points}pt (コンボ×${newCombo})`)
    } else {
      setCombo(0)
      setComboType(null)
      setComboKey((prev: number) => prev + 1)
      setMessage(`正解！+${points}pt`)
    }

    setChain((prev: ChainItem[]) => [...prev, { type: "pokemon", pokemon: newPokemon, points }])
    setUsedNames((prev: Set<string>) => new Set([...prev, inputKatakana]))
    
    // 図鑑進捗をチェック
    const newHistory = savePokemonHistory(inputKatakana, pokemonHistory)
    setPokemonHistory(newHistory)
    
    // 進捗を計算
    const allPokemon = getAllPokemonSorted(pokemonDatabase)
    const newCaughtCount = Object.keys(newHistory).length
    const displayCaughtCount = newCaughtCount + RESTRICTED_POKEMON.length
    const totalCount = allPokemon.length
    const currentProgress = totalCount > 0 ? (displayCaughtCount / totalCount) * 100 : 0
    
    // マイルストーンをチェック（順番に表示）
    const nextMilestone = getNextMilestoneToShow(currentProgress, lastShownMilestone)
    if (nextMilestone !== null) {
      setProgressMilestone(nextMilestone)
      setNewPokemonName(inputKatakana)
      setShowProgressModal(true)
      setLastShownMilestone(nextMilestone)
      // 最後に表示したマイルストーンを保存
      localStorage.setItem("pokemon-shiritori-last-shown-milestone", nextMilestone.toString())
    }
    setPreviousProgress(currentProgress)
    
  setScore((prev: number) => prev + points)
  setScoreKey((prev: number) => prev + 1)
  setCurrentInput("")

  // ポケモン回答のトラッキング
  trackPokemonAnswer(inputKatakana)

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
      const pokemon: Pokemon = {
        name: hintPokemon.name,
        types: hintPokemon.type2 ? [hintPokemon.type1, hintPokemon.type2] : [hintPokemon.type1],
      }
      setChain((prev: ChainItem[]) => [...prev, { type: "hint", pokemon, points: -1 }])
      setMessage(`💡 ヒント: ${hintPokemon.name} -1pt`)
    } else {
      setMessage(`💡 ヒント: 該当するポケモンが見つかりません。ゲームオーバー`)
      setHighScore(saveHighScore(score, highScore, gameMode))
      setGameState("finished")
      setShowEndConfirm(false)
      
      // ゲームオーバーのトラッキング
      trackGameOver(score, chain.length, gameMode)
      
      setShowResultModal(true)
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
    
    // タイムアタックの場合はタイマーをリセット
    if (gameMode === 'timeattack') {
      setTimeLeft(60)
      setIsTimeUp(false)
    }
  }

  const handleFinish = () => {
    setHighScore(saveHighScore(score, highScore, gameMode))
    setGameState("finished")
    setShowEndConfirm(false)
    
    // ゲームオーバーのトラッキング
    trackGameOver(score, chain.length, gameMode)
    
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

    // スタート・ゴールIDを含むURLを生成
    const startId = getPokemonIdByName(pokemonDatabase, startPokemon?.name || "")
    const goalId = getPokemonIdByName(pokemonDatabase, goalPokemon?.name || "")
    const shareUrl = startId && goalId 
      ? `https://ny-an.github.io/pokeshiri-game/?start=${startId}&goal=${goalId}`
      : "https://ny-an.github.io/pokeshiri-game/"

    const shareText = `🎮ポケしり🥹\n${isCleared ? "🎉クリア！" : "ゲーム終了"}\n\n${startPokemon?.name} → ${goalPokemon?.name}\n\nスコア: ${score}pt\nつないだ数: ${chainCount}匹\n最大コンボ: ${maxCombo}連鎖\nチェンジ使用: ${changesUsed}回\n${hintText}\n\n同じ問題でチャレンジ！\n${shareUrl}`

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
      className={`fixed inset-0 overflow-auto flex items-center justify-center p-4 transition-colors duration-500 ${getComboBackgroundColor(combo, comboType)}`}
    >
      {/* バージョンチェッカーを追加 */}
      <VersionChecker 
        onUpdateAvailable={(newVersion) => {
          console.log(`新しいバージョンが利用可能です: v${newVersion}`)
        }}
      />
      
      <Card className="w-full max-w-2xl p-4 md:p-5 space-y-1.5">
        <GameHeader
          startPokemon={startPokemon}
          goalPokemon={goalPokemon}
          gameMode={gameMode}
          onModeChange={handleModeChange}
          showRules={showRules}
          setShowRules={setShowRules}
          showPokedex={showPokedex}
          setShowPokedex={setShowPokedex}
          showDeveloperInfo={showDeveloperInfo}
          setShowDeveloperInfo={setShowDeveloperInfo}
          showStats={showStats}
          setShowStats={setShowStats}
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
          gameMode={gameMode}
        />

        <ChainDisplay 
          chain={chain} 
          chainEndRef={chainEndRef} 
          gameMode={gameMode}
          timeLeft={timeLeft}
        />

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
          gameMode={gameMode}
          score={score}
          highScore={highScore}
          chain={chain}
          maxCombo={maxCombo}
          passesLeft={passesLeft}
          usedHint={usedHint}
          startPokemon={startPokemon}
          goalPokemon={goalPokemon}
          timeLeft={timeLeft}
          isTimeUp={isTimeUp}
          handleShareToX={handleShareToX}
          handleReset={handleReset}
        />

        <ProgressModal
          isOpen={showProgressModal}
          onClose={() => setShowProgressModal(false)}
          progress={progressMilestone || 0}
          caughtCount={displayCaughtCount}
          totalCount={totalCount}
          newPokemon={newPokemonName}
          is100Percent={progressMilestone === 100}
        />

        <StatsModal
          isOpen={showStats}
          onClose={() => setShowStats(false)}
        />

        <ModeConfirmModal
          isOpen={showModeConfirm}
          onClose={() => setShowModeConfirm(false)}
          onConfirm={confirmModeChange}
          targetMode={targetMode}
        />
      </Card>
    </div>
  )
}
