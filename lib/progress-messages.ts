export function getProgressMessage(progress: number): string {
  if (progress >= 100) {
    return "🎉🎉🎉 完全制覇！ポケモン界の神！ 🎉🎉🎉"
  } else if (progress >= 1 && progress < 5) {
    return "さあ、伝説の始まりだ！"
  } else if (progress >= 5 && progress < 10) {
    return "最初の一歩を踏み出した"
  } else if (progress >= 10 && progress < 15) {
    return "冒険が本格的に始まる"
  } else if (progress >= 15 && progress < 20) {
    return "仲間たちとの絆が深まる"
  } else if (progress >= 20 && progress < 25) {
    return "真のトレーナーへの道を歩む"
  } else if (progress >= 25 && progress < 30) {
    return "知識と経験が積み重なる"
  } else if (progress >= 30 && progress < 35) {
    return "伝説への扉が開かれる"
  } else if (progress >= 35 && progress < 40) {
    return "神話の世界に足を踏み入れる"
  } else if (progress >= 40 && progress < 45) {
    return "古の力が目覚め始める"
  } else if (progress >= 45 && progress < 50) {
    return "伝説のポケモンが姿を現す"
  } else if (progress >= 50 && progress < 55) {
    return "時空を超えた冒険が始まる"
  } else if (progress >= 55 && progress < 60) {
    return "異次元の扉が開かれる"
  } else if (progress >= 60 && progress < 65) {
    return "神々の領域に近づく"
  } else if (progress >= 65 && progress < 70) {
    return "天界の門をくぐる"
  } else if (progress >= 70 && progress < 75) {
    return "宇宙の真理に触れる"
  } else if (progress >= 75 && progress < 80) {
    return "星々の記憶を読み解く"
  } else if (progress >= 80 && progress < 85) {
    return "究極の存在と対峙する"
  } else if (progress >= 85 && progress < 90) {
    return "創造の秘密を解き明かす"
  } else if (progress >= 90 && progress < 95) {
    return "創造主の座に手が届く"
  } else if (progress >= 95 && progress < 100) {
    return "神の領域に到達する"
  }
  return "おめでとう！"
}
